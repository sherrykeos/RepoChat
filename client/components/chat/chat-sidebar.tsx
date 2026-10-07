"use client";

import { useMemo } from "react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { MessageSquare, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatSessions,
  useCreateChatSession,
} from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { ChatSession, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
}) {
  const ready = repo.indexStatus === "READY";
  const sessionsQuery = useChatSessions(repo.id, ready);
  const createSession = useCreateChatSession(repo.id);
  const reindex = useStartIndexing();

  const sessions: ChatSession[] = sessionsQuery.data ?? [];

  // Group real sessions by Today, Yesterday, Earlier
  const grouped = useMemo(() => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const earlier: ChatSession[] = [];

    sessions.forEach((s) => {
      const date = new Date(s.createdAt);
      if (isToday(date)) today.push(s);
      else if (isYesterday(date)) yesterday.push(s);
      else earlier.push(s);
    });

    return { today, yesterday, earlier };
  }, [sessions]);

  return (
    <aside className="flex w-full flex-col border-b border-border bg-card/40 md:w-64 md:border-r md:border-b-0 shrink-0">
      <div className="p-3.5 space-y-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xs font-semibold text-foreground">
            Conversations
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="size-7 p-0"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            title="Re-index repo"
          >
            <RotateCcw className="size-3 text-muted-foreground" />
          </Button>
        </div>

        {/* + New Chat Button */}
        <Button
          size="sm"
          className="w-full justify-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 border border-primary/20 font-semibold text-xs h-8"
          disabled={!ready || createSession.isPending}
          onClick={() =>
            createSession.mutate(undefined, {
              onSuccess: (session) => onSelectSession(session.id),
            })
          }
        >
          <Plus className="size-3.5" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-4">
          {sessionsQuery.isLoading && (
            <div className="space-y-1.5 p-2">
              <Skeleton className="h-8 rounded-lg" />
              <Skeleton className="h-8 rounded-lg" />
            </div>
          )}

          {!ready && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Conversations unlock once repository indexing completes.
            </div>
          )}

          {ready && sessionsQuery.isSuccess && sessions.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No conversations yet. Start a chat above to begin.
            </div>
          )}

          {/* Today Group */}
          {grouped.today.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Today
              </div>
              {grouped.today.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                    sessionId === s.id
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{s.title || "Untitled chat"}</span>
                </button>
              ))}
            </div>
          )}

          {/* Yesterday Group */}
          {grouped.yesterday.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Yesterday
              </div>
              {grouped.yesterday.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                    sessionId === s.id
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{s.title || "Untitled chat"}</span>
                </button>
              ))}
            </div>
          )}

          {/* Earlier Group */}
          {grouped.earlier.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Earlier
              </div>
              {grouped.earlier.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                    sessionId === s.id
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{s.title || "Untitled chat"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}