"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { IndexingState } from "@/components/chat/indexing-state";
import { SourcePanel } from "@/components/chat/source-panel";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useStreamChat,
} from "@/hooks/use-chat";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";
import type { Citation } from "@/lib/api";

export function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);
  const repo = repoQuery.data;

  const isIndexing = repo?.indexStatus === "INDEXING";
  const statusQuery = useIndexStatus(
    repoId,
    isIndexing || repo?.indexStatus === "PENDING"
  );

  const indexStatus = statusQuery.data?.indexStatus ?? repo?.indexStatus;
  const ready = indexStatus === "READY";

  const sessionsQuery = useChatSessions(repoId, ready);
  const createSession = useCreateChatSession(repoId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash");
  const autoCreateRef = useRef(false);

  const sessionId =
    selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useChatMessages(sessionId);
  const { send, stop, streaming, streamText } = useStreamChat(sessionId);

  // Auto-create initial session if ready and no sessions exist
  useEffect(() => {
    if (!ready || sessionsQuery.isLoading) return;
    if (sessionsQuery.data && sessionsQuery.data.length > 0) return;
    if (
      !sessionsQuery.isSuccess ||
      (sessionsQuery.data?.length ?? 0) > 0 ||
      autoCreateRef.current
    ) {
      return;
    }

    autoCreateRef.current = true;
    createSession.mutate(undefined, {
      onSuccess: (session) => setSelectedSessionId(session.id),
      onError: () => {
        autoCreateRef.current = false;
      },
    });
  }, [
    ready,
    sessionsQuery.isLoading,
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    createSession,
  ]);

  // Extract all citations from current messages
  const activeCitations: Citation[] = useMemo(() => {
    const list: Citation[] = [];
    (messagesQuery.data ?? []).forEach((m) => {
      if (m.citations && m.citations.length > 0) {
        list.push(...m.citations);
      }
    });
    return list;
  }, [messagesQuery.data]);

  if (repoQuery.isLoading) {
    return (
      <AppShell title="Loading repository...">
        <div className="grid flex-1 gap-4 p-4 md:grid-cols-[16rem_1fr]">
          <Skeleton className="min-h-80 rounded-xl" />
          <Skeleton className="min-h-80 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (repoQuery.isError || !repo) {
    return (
      <AppShell title="Repository unavailable">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm text-muted-foreground">
            {(repoQuery.error as Error)?.message ?? "Repository could not be found."}
          </p>
          <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={repo.fullName}
      description={
        ready
          ? "Ask questions grounded in this repository"
          : "Waiting for indexing to finish"
      }
      actions={
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            <span>Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              aria-label="Select AI model"
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
              <option value="Gemini 3.7 Flash">Gemini 3.7 Flash</option>
              <option value="GPT-4o mini">GPT-4o mini</option>
            </select>
          </div>

          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            <ArrowLeft className="size-3.5 mr-1" />
            Repos
          </Button>
        </div>
      }
    >
      {/* 3-Column Chat Layout: Left Sidebar | Center Chat | Right Sources */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row overflow-hidden">
        {/* Column 1: Conversations Sidebar */}
        <ChatSidebar
          repo={{
            ...repo,
            indexStatus: indexStatus ?? repo.indexStatus,
            filesProcessed:
              statusQuery.data?.filesProcessed ?? repo.filesProcessed,
            filesTotal: statusQuery.data?.filesTotal ?? repo.filesTotal,
            chunkCount: statusQuery.data?.chunkCount ?? repo.chunkCount,
            errorMessage: statusQuery.data?.errorMessage ?? repo.errorMessage,
          }}
          sessionId={sessionId}
          onSelectSession={setSelectedSessionId}
        />

        {/* Column 2: Main Chat Center */}
        <section className="flex min-h-[70vh] min-w-0 flex-1 flex-col bg-background">
          {!ready ? (
            <IndexingState repo={repo} status={statusQuery.data} />
          ) : (
            <>
              <ChatMessages
                repo={repo}
                messages={messagesQuery.data ?? []}
                streamText={streamText}
                isLoading={messagesQuery.isLoading}
                onSelectPrompt={(prompt) => send(prompt)}
              />
              <ChatComposer
                disabled={!sessionId}
                streaming={streaming}
                onSend={send}
                onStop={stop}
                onSelectPrompt={(prompt) => send(prompt)}
              />
            </>
          )}
        </section>

        {/* Column 3: Sources Panel (Real citations only) */}
        {ready && <SourcePanel repo={repo} citations={activeCitations} />}
      </div>
    </AppShell>
  );
}