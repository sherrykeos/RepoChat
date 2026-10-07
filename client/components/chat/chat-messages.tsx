"use client";

import { useEffect, useRef } from "react";
import { Bot, FileCode, MessageSquareCode, Sparkles } from "lucide-react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";
import { citationHref } from "@/components/chat/citation-chips";

const SUGGESTED_PROMPTS = [
  "Explain the overall repository architecture",
  "Where is the main entry point of this application?",
  "How are environment configs and database settings handled?",
  "What dependencies and key frameworks does this project use?",
];

export function ChatMessages({
  repo,
  messages,
  streamText,
  isLoading,
  onSelectPrompt,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  isLoading?: boolean;
  onSelectPrompt?: (prompt: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-16 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
        <Skeleton className="h-24 w-3/4 rounded-2xl" />
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !streamText;

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
        {/* Real Empty State */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center my-auto">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted border border-border">
              <MessageSquareCode className="size-6 text-primary" />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
              Ask anything about {repo.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              Answers are grounded in indexed code chunks from your repository with exact source references and line numbers.
            </p>

            {/* Suggested Prompt Chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSelectPrompt?.(prompt)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted hover:text-foreground text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real Messages List */}
        {messages.map((message) => {
          const isUser = message.role === "USER";

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-[#1f2328] px-4 py-2.5 text-xs sm:text-sm text-white shadow-xs dark:border dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            );
          }

          // Assistant message
          return (
            <div key={message.id} className="flex items-start gap-3.5">
              <Avatar className="size-7 rounded-lg border border-border">
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3 overflow-hidden text-xs sm:text-sm leading-relaxed text-foreground">
                <ChatMarkdown content={message.content} />

                {/* Real Inline Citations Files List */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-card/60 p-3">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Referenced Code Chunks ({message.citations.length})
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {message.citations.map((c, idx) => (
                        <a
                          key={`${c.filePath}-${idx}`}
                          href={citationHref(repo, c)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-md border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileCode className="size-3.5 text-primary shrink-0" />
                            <span className="truncate font-mono text-[11px]">
                              {c.filePath.split("/").pop()}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                            {c.startLine ? `L${c.startLine}–${c.endLine ?? c.startLine}` : ""}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Real Streaming Message */}
        {streamText && (
          <div className="flex items-start gap-3.5">
            <Avatar className="size-7 rounded-lg border border-border">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-xs sm:text-sm leading-relaxed text-foreground">
              <ChatMarkdown content={streamText} isStreaming />
              <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-primary align-middle" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}