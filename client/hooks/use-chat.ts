"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { api, type ChatMessage, type ChatSession } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { streamChatMessage } from "@/lib/stream-chat";
import { extractTitleEssence, isDefaultTitle } from "@/lib/title-extractor";
import { toast } from "@/components/ui/toast";

export function useChatSessions(repositoryId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chat.sessions(repositoryId),
    queryFn: () => api.listSessions(repositoryId),
    enabled: Boolean(repositoryId) && enabled,
  });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.messages(sessionId ?? ""),
    queryFn: async () => {
      const serverMessages = await api.getMessages(sessionId!);
      if (typeof window !== "undefined" && sessionId) {
        try {
          const localKey = `repochat_err_${sessionId}`;
          const localErrors = JSON.parse(localStorage.getItem(localKey) || "[]") as ChatMessage[];
          if (localErrors.length > 0) {
            const serverIds = new Set(serverMessages.map((m) => m.id));
            const missing = localErrors.filter((e) => !serverIds.has(e.id));
            if (missing.length > 0) {
              return [...serverMessages, ...missing];
            }
          }
        } catch {
          // ignore
        }
      }
      return serverMessages;
    },
    enabled: Boolean(sessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateChatSession(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => api.createSession(repositoryId, title),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.sessions(repositoryId),
      });
      queryClient.setQueryData(queryKeys.chat.messages(session.id), []);
    },
    onError: (error: Error) => {
      toast.add({
        title: "Could not create chat",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function useRenameChatSession(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      api.renameSession(sessionId, title),
    onMutate: async ({ sessionId, title }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.chat.sessions(repositoryId),
      });
      const previous = queryClient.getQueryData<ChatSession[]>(
        queryKeys.chat.sessions(repositoryId)
      );
      queryClient.setQueryData<ChatSession[]>(
        queryKeys.chat.sessions(repositoryId),
        (old) =>
          (old ?? []).map((s) => (s.id === sessionId ? { ...s, title } : s))
      );
      return { previous };
    },
    onSuccess: (_, { sessionId, title }) => {
      queryClient.setQueryData<ChatSession[]>(
        queryKeys.chat.sessions(repositoryId),
        (old) =>
          (old ?? []).map((s) => (s.id === sessionId ? { ...s, title } : s))
      );
      toast.add({
        title: "Session renamed",
        type: "success",
      });
    },
    onError: (error: Error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.chat.sessions(repositoryId),
          context.previous
        );
      }
      toast.add({
        title: "Could not rename chat session",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function useDeleteChatSession(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.deleteSession(sessionId),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.chat.sessions(repositoryId),
      });
      const previous = queryClient.getQueryData<ChatSession[]>(
        queryKeys.chat.sessions(repositoryId)
      );
      queryClient.setQueryData<ChatSession[]>(
        queryKeys.chat.sessions(repositoryId),
        (old) => (old ?? []).filter((s) => s.id !== sessionId)
      );
      return { previous };
    },
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData<ChatSession[]>(
        queryKeys.chat.sessions(repositoryId),
        (old) => (old ?? []).filter((s) => s.id !== sessionId)
      );
      toast.add({
        title: "Chat session deleted",
        type: "success",
      });
    },
    onError: (error: Error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.chat.sessions(repositoryId),
          context.previous
        );
      }
      toast.add({
        title: "Could not delete chat session",
        description: error.message,
        type: "error",
      });
    },
  });
}

export function useStreamChat(sessionId: string | null, repositoryId?: string) {
  const queryClient = useQueryClient();
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim() || streaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStreamText("");
      setStreaming(true);

      // Optimistically rename session if it's currently a default title ("New Chat", "Untitled chat", etc.)
      if (repositoryId) {
        const sessions = queryClient.getQueryData<ChatSession[]>(
          queryKeys.chat.sessions(repositoryId)
        );
        const curr = sessions?.find((s) => s.id === sessionId);
        if (curr && isDefaultTitle(curr.title)) {
          const optimisticTitle = extractTitleEssence(content.trim());
          queryClient.setQueryData<ChatSession[]>(
            queryKeys.chat.sessions(repositoryId),
            (prev) =>
              (prev ?? []).map((s) =>
                s.id === sessionId ? { ...s, title: optimisticTitle } : s
              )
          );
        }
      }

      const optimisticId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        role: "USER",
        content: content.trim(),
        citations: [],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.messages(sessionId),
        (prev) => [...(prev ?? []), optimistic]
      );

      const accumulatedTokens = { text: "" };

      try {
        await streamChatMessage(sessionId, content.trim(), {
          signal: controller.signal,
          onSessionUpdated: (updated) => {
            if (repositoryId && updated?.title) {
              queryClient.setQueryData<ChatSession[]>(
                queryKeys.chat.sessions(repositoryId),
                (prev) =>
                  (prev ?? []).map((s) =>
                    s.id === updated.id ? { ...s, title: updated.title } : s
                  )
              );
            }
          },
          onUserMessage: (message) => {
            queryClient.setQueryData<ChatMessage[]>(
              queryKeys.chat.messages(sessionId),
              (prev) => {
                const list = prev ?? [];
                const filtered = list.filter(
                  (m) => m.id !== optimisticId && m.id !== message.id
                );
                return [...filtered, message];
              }
            );
          },
          onToken: (token) => {
            accumulatedTokens.text += token;
            setStreamText(accumulatedTokens.text);
          },
          onAssistantMessage: (message) => {
            accumulatedTokens.text = "";
            setStreamText("");
            queryClient.setQueryData<ChatMessage[]>(
              queryKeys.chat.messages(sessionId),
              (prev) => {
                const list = prev ?? [];
                const filtered = list.filter((m) => m.id !== message.id);
                return [...filtered, message];
              }
            );
            void queryClient.invalidateQueries({
              queryKey: queryKeys.chat.messages(sessionId),
            });
            if (repositoryId) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.chat.sessions(repositoryId),
              });
            }
          },
          onDone: () => {
            if (repositoryId) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.chat.sessions(repositoryId),
              });
            }
            // Fallback: If assistant_message was not received but we accumulated streamed tokens
            if (accumulatedTokens.text.trim()) {
              const fallbackMsg: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "ASSISTANT",
                content: accumulatedTokens.text,
                citations: [],
                createdAt: new Date().toISOString(),
              };
              queryClient.setQueryData<ChatMessage[]>(
                queryKeys.chat.messages(sessionId),
                (prev) => [...(prev ?? []), fallbackMsg]
              );
              accumulatedTokens.text = "";
              setStreamText("");
              void queryClient.invalidateQueries({
                queryKey: queryKeys.chat.messages(sessionId),
              });
            }
          },
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (repositoryId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.chat.sessions(repositoryId),
          });
        }
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        toast.add({
          title: "Message failed",
          description: errorMsg,
          type: "error",
        });

        const formattedError = errorMsg.startsWith("⚠️") ? errorMsg : `⚠️ ${errorMsg}`;
        const errTempId = `err-${Date.now()}`;

        // Ensure user's optimistic message and accumulated tokens or error card are in chat
        queryClient.setQueryData<ChatMessage[]>(
          queryKeys.chat.messages(sessionId),
          (prev) => {
            const list = prev ?? [];
            const hasUser = list.some((m) => m.id === optimisticId || (m.role === "USER" && m.content === content.trim()));
            const updated = hasUser ? list : [...list, optimistic];
            
            // If some text was received before the crash, preserve it
            if (accumulatedTokens.text.trim()) {
              updated.push({
                id: `partial-${Date.now()}`,
                role: "ASSISTANT",
                content: accumulatedTokens.text,
                citations: [],
                createdAt: new Date().toISOString(),
              });
            }

            return [
              ...updated,
              {
                id: errTempId,
                role: "ASSISTANT",
                content: formattedError,
                citations: [],
                createdAt: new Date().toISOString(),
              },
            ];
          }
        );
        accumulatedTokens.text = "";
        setStreamText("");

        // Persist to backend database so it remains when refreshed or reloaded
        try {
          const persistedMsg = await api.persistErrorMessage(sessionId, formattedError);
          queryClient.setQueryData<ChatMessage[]>(
            queryKeys.chat.messages(sessionId),
            (prev) => {
              const list = prev ?? [];
              return list.map((m) => (m.id === errTempId ? persistedMsg : m));
            }
          );
        } catch {
          // Fallback offline storage if backend is unreachable
          if (typeof window !== "undefined") {
            try {
              const localKey = `repochat_err_${sessionId}`;
              const existing = JSON.parse(localStorage.getItem(localKey) || "[]") as ChatMessage[];
              existing.push({
                id: errTempId,
                role: "ASSISTANT",
                content: formattedError,
                citations: [],
                createdAt: new Date().toISOString(),
              });
              localStorage.setItem(localKey, JSON.stringify(existing));
            } catch {
              // ignore
            }
          }
        }
      } finally {
        setStreaming(false);
      }
    },
    [sessionId, repositoryId, streaming, queryClient]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setStreamText("");
  }, []);

  return { send, stop, streaming, streamText };
}