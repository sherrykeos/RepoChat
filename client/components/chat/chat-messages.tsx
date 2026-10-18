"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  FileCode,
  MessageSquareCode,
  Pencil,
  Reply,
} from "lucide-react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import ThoughtLine from "@/components/ui/ThoughtLine";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";
import { citationHref } from "@/components/chat/citation-chips";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "Explain the overall repository architecture",
  "Where is the main entry point of this application?",
  "How are environment configs and database settings handled?",
  "What dependencies and key frameworks does this project use?",
];

function formatMessageTime(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function StreamingAssistantMessage({
  streamText,
  isStreaming,
  repoName,
}: {
  streamText: string;
  isStreaming: boolean;
  repoName: string;
}) {
  const isThinking = isStreaming && !streamText;

  return (
    <div className="flex items-start gap-3.5 animate-in fade-in duration-300">
      <Avatar className="size-7 rounded-lg border border-border bg-card shrink-0 mt-0.5">
        <AvatarFallback className="rounded-lg bg-card text-primary">
          <Bot className={cn("size-4", isThinking && "animate-pulse text-primary")} />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 overflow-hidden space-y-2.5">
        {/* ThoughtLine Thinking Indicator */}
        <div className="py-0.5">
          <ThoughtLine
            working={isThinking}
            label="Thinking…"
            doneLabel="Thought for"
            glyph="sparkle"
            fontSize={12}
            collapsible={false}
            showTimer
          />
        </div>

        {/* Streamed per-token Content */}
        {streamText ? (
          <div className="overflow-hidden text-xs sm:text-sm leading-relaxed text-foreground">
            <ChatMarkdown content={streamText} isStreaming={isStreaming} />
            {isStreaming && (
              <span className="inline-block ml-1 size-2 rounded-full bg-primary animate-pulse align-middle shadow-[0_0_8px_var(--primary)]" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ChatMessages({
  repo,
  messages,
  streamText,
  isStreaming,
  isLoading,
  onSelectPrompt,
  onReply,
  onEdit,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  isStreaming?: boolean;
  isLoading?: boolean;
  onSelectPrompt?: (prompt: string) => void;
  onReply?: (content: string) => void;
  onEdit?: (content: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditValue(content);
  };

  const [activeToolbarMessageId, setActiveToolbarMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (id: string) => {
    handleTouchEnd();
    longPressTimerRef.current = setTimeout(() => {
      setActiveToolbarMessageId((prev) => (prev === id ? null : id));
    }, 350);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    handleTouchEnd();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = (newContent: string) => {
    setEditingId(null);
    setEditValue("");
    onSelectPrompt?.(newContent);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText, isStreaming]);

  // Only show skeleton on first initial fetch when no messages exist yet
  if (isLoading && messages.length === 0 && !isStreaming && !streamText) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-16 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
        <Skeleton className="h-24 w-3/4 rounded-2xl" />
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !streamText && !isStreaming;

  return (
    <div
      ref={scrollContainerRef}
      onClick={() => {
        if (activeToolbarMessageId) setActiveToolbarMessageId(null);
      }}
      className="flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 min-h-full">
        {/* Empty State */}
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

        {/* Messages List */}
        {messages.map((message) => {
          const isUser = message.role === "USER";

          if (isUser) {
            const isEditing = editingId === message.id;

            return (
              <div key={message.id} className="group relative flex flex-col items-end gap-1">
                {/* Inline Editing or Bubble */}
                {isEditing ? (
                  <div className="w-full max-w-[85%] rounded-2xl border border-primary/50 bg-background p-3 shadow-md space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full resize-none bg-transparent text-xs sm:text-sm text-foreground focus:outline-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = editValue.trim();
                          if (trimmed) {
                            handleSaveEdit(trimmed);
                          }
                        }}
                        className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                      >
                        send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onTouchStart={() => handleTouchStart(message.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-xs sm:text-sm text-primary-foreground shadow-xs select-none sm:select-text"
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}

                {/* User Message Action Toolbar: Visible on press-and-hold on mobile, hover on desktop */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 transition-opacity duration-150 px-1 select-none",
                    activeToolbarMessageId === message.id
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-none sm:pointer-events-auto"
                  )}
                >
                  {/* Timestamp */}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatMessageTime(message.createdAt)}
                  </span>

                  <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-card/90 px-1 py-0.5 shadow-2xs backdrop-blur-xs">
                    {/* Reply button */}
                    <button
                      type="button"
                      onClick={() => onReply?.(message.content)}
                      title="Reply"
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Reply className="size-2.5 sm:size-3" />
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(message.id, message.content)}
                      title="Edit message"
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Pencil className="size-2.5 sm:size-3" />
                    </button>

                    {/* Copy button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(message.content, message.id)}
                      title="Copy text"
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="size-2.5 sm:size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-2.5 sm:size-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Check if this is an error message
          const isErrorMessage =
            message.content.startsWith("⚠️") ||
            message.content.includes("Quota exceeded") ||
            message.content.includes("Rate limit");

          if (isErrorMessage) {
            return (
              <div key={message.id} className="group relative flex items-start gap-3.5 animate-in fade-in duration-200">
                <Avatar className="size-7 rounded-lg border border-destructive/40 bg-destructive/10 shrink-0 mt-0.5">
                  <AvatarFallback className="rounded-lg bg-destructive/20 text-destructive font-bold">
                    <span className="text-sm">!</span>
                  </AvatarFallback>
                </Avatar>

                <div
                  onTouchStart={() => handleTouchStart(message.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  className="flex-1 space-y-2 overflow-hidden text-xs sm:text-sm leading-relaxed rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground dark:text-red-200 shadow-sm backdrop-blur-xs select-none sm:select-text"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-destructive dark:text-red-400 text-xs tracking-wide uppercase">
                      AI Model Error
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm">
                    <ChatMarkdown content={message.content} />
                  </div>

                  {/* Action Bar: Visible on press-and-hold on mobile, hover on desktop */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 transition-opacity duration-150 pt-1 select-none",
                      activeToolbarMessageId === message.id
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-none sm:pointer-events-auto"
                    )}
                  >
                    <span className="text-[10px] text-destructive/70 font-mono">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    <div className="flex items-center gap-0.5 rounded-md border border-destructive/30 bg-background/80 px-1 py-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onReply?.(message.content)}
                        title="Reply / Retry"
                        className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Reply className="size-2.5 sm:size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(message.content, message.id)}
                        title="Copy error"
                        className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {copiedId === message.id ? (
                          <Check className="size-2.5 sm:size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-2.5 sm:size-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Assistant message
          return (
            <div key={message.id} className="group relative flex items-start gap-3.5">
              <Avatar className="size-7 rounded-lg border border-border bg-card shrink-0 mt-0.5">
                <AvatarFallback className="rounded-lg bg-card text-primary">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>

              <div
                onTouchStart={() => handleTouchStart(message.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="flex-1 space-y-2.5 overflow-hidden"
              >
                <div className="text-xs sm:text-sm leading-relaxed text-foreground select-none sm:select-text">
                  <ChatMarkdown content={message.content} />
                </div>

                {/* Inline Citations Files List */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-card/80 p-3">
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
                          className="flex items-center justify-between rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
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

                {/* Assistant Message Action Toolbar: Visible on press-and-hold on mobile, hover on desktop */}
                <div
                  className={cn(
                    "flex items-center gap-2 transition-opacity duration-150 pt-1 select-none",
                    activeToolbarMessageId === message.id
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-none sm:pointer-events-auto"
                  )}
                >
                  {/* Timestamp */}
                  <span className="text-[10px] text-muted-foreground/75 font-mono">
                    {formatMessageTime(message.createdAt)}
                  </span>

                  <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/40 px-1 py-0.5 shadow-2xs">
                    {/* Reply button */}
                    <button
                      type="button"
                      onClick={() => onReply?.(message.content)}
                      title="Reply"
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Reply className="size-2.5 sm:size-3" />
                    </button>

                    {/* Edit in composer button */}
                    <button
                      type="button"
                      onClick={() => onEdit?.(message.content)}
                      title="Edit / Quote in composer"
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Pencil className="size-2.5 sm:size-3" />
                    </button>

                    {/* Copy button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(message.content, message.id)}
                      title="Copy message"
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="size-2.5 sm:size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-2.5 sm:size-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Real Streaming Message with ThoughtLine Indicator */}
        {(isStreaming || Boolean(streamText)) && (
          <StreamingAssistantMessage
            streamText={streamText ?? ""}
            isStreaming={Boolean(isStreaming)}
            repoName={repo.name}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}