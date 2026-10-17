"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  MessageSquare,
  Network,
  PanelLeft,
  PanelRight,
  Sparkles,
} from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { IndexingState } from "@/components/chat/indexing-state";
import { SourcePanel } from "@/components/chat/source-panel";
import { GitHubIcon } from "@/components/icons/github-icon";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useStreamChat,
} from "@/hooks/use-chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";
import type { Citation } from "@/lib/api";
import { cn } from "@/lib/utils";

const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  "C#": "#178600",
  "Jupyter Notebook": "#DA5B0B",
};

export function ChatView({ repoId }: { repoId: string }) {
  const isMobile = useIsMobile();
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
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "conversations" | "sources">(
    "chat"
  );
  const [replyContext, setReplyContext] = useState<string | null>(null);

  const autoCreateRef = useRef(false);

  const sessionId =
    selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useChatMessages(sessionId);
  const { send, stop, streaming, streamText } = useStreamChat(sessionId, repoId);

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
      <AppShell hideHeader>
        <div className="flex h-[calc(100dvh-61px)] min-h-[calc(100dvh-61px)] w-full gap-2.5 p-2 sm:p-2.5 bg-background">
          <Skeleton className="h-full w-64 rounded-xl bg-card border border-border" />
          <Skeleton className="h-full flex-1 rounded-xl bg-card border border-border" />
          <Skeleton className="h-full w-72 rounded-xl bg-card border border-border" />
        </div>
      </AppShell>
    );
  }

  if (repoQuery.isError || !repo) {
    return (
      <AppShell hideHeader>
        <div className="flex h-[calc(100dvh-61px)] min-h-[calc(100dvh-61px)] w-full flex-col items-center justify-center gap-3 p-8 bg-background text-foreground">
          <p className="text-sm text-muted-foreground">
            {(repoQuery.error as Error)?.message ?? "Repository could not be found."}
          </p>
          <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  const sidebarRepo = {
    ...repo,
    indexStatus: indexStatus ?? repo.indexStatus,
    filesProcessed: statusQuery.data?.filesProcessed ?? repo.filesProcessed,
    filesTotal: statusQuery.data?.filesTotal ?? repo.filesTotal,
    chunkCount: statusQuery.data?.chunkCount ?? repo.chunkCount,
    errorMessage: statusQuery.data?.errorMessage ?? repo.errorMessage,
  };

  // Center console header (Point 3)
  const currentSession = sessionsQuery.data?.find((s) => s.id === sessionId);
  const currentSessionTitle = currentSession?.title || "New Chat";

  const centerHeader = (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-3 sm:px-4">
      {/* Left: Sidebar toggle button */}
      <div className="flex items-center gap-2 shrink-0 w-8">
        <button
          type="button"
          onClick={() => {
            if (isMobile) {
              setMobileTab(mobileTab === "conversations" ? "chat" : "conversations");
            } else {
              setShowLeftSidebar((prev) => !prev);
            }
          }}
          className={cn(
            "flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            !isMobile && showLeftSidebar && "bg-muted text-primary border-primary/40"
          )}
          title={showLeftSidebar ? "Collapse conversations sidebar" : "Expand conversations sidebar"}
          aria-label="Toggle conversations sidebar"
        >
          <PanelLeft className="size-3.5" />
        </button>
      </div>

      {/* Center: "repo name" || "chat name" (No GitHub logo, centered) */}
      <div className="flex-1 flex items-center justify-center text-center min-w-0 px-2">
        <div className="flex items-center gap-2 truncate max-w-lg">
          <span className="font-heading text-xs sm:text-sm font-semibold text-foreground truncate">
            {repo.name}
          </span>
          <span className="text-muted-foreground font-normal text-xs sm:text-sm shrink-0">
            ||
          </span>
          <span className="font-heading text-xs sm:text-sm font-medium text-primary truncate">
            {currentSessionTitle}
          </span>
        </div>
      </div>

      {/* Right: Sources toggle button */}
      <div className="flex items-center gap-2 shrink-0 w-8 justify-end">
        {ready && (
          <button
            type="button"
            onClick={() => {
              if (isMobile) {
                setMobileTab(mobileTab === "sources" ? "chat" : "sources");
              } else {
                setShowRightSidebar((prev) => !prev);
              }
            }}
            className={cn(
              "flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative",
              !isMobile && showRightSidebar && "bg-muted text-primary border-primary/40"
            )}
            title={showRightSidebar ? "Collapse sources panel" : "Expand sources panel"}
            aria-label="Toggle sources panel"
          >
            <PanelRight className="size-3.5" />
            {activeCitations.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#238636] text-[9px] font-bold text-white">
                {activeCitations.length > 9 ? "9+" : activeCitations.length}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );

  // Center console messages & composer
  const centerContent = !ready ? (
    <div className="flex-1 min-h-0 flex flex-col overflow-auto">
      <IndexingState repo={repo} status={statusQuery.data} />
    </div>
  ) : (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ChatMessages
        repo={repo}
        messages={messagesQuery.data ?? []}
        streamText={streamText}
        isStreaming={streaming}
        isLoading={messagesQuery.isLoading}
        onSelectPrompt={(prompt) => send(prompt)}
        onReply={(content) => {
          const snippet = content.length > 100 ? content.slice(0, 100) + "…" : content;
          setReplyContext(snippet);
        }}
        onEdit={(content) => {
          const snippet = content.length > 100 ? content.slice(0, 100) + "…" : content;
          setReplyContext(snippet);
        }}
      />
      <ChatComposer
        disabled={!sessionId}
        streaming={streaming}
        onSend={send}
        onStop={stop}
        onSelectPrompt={(prompt) => send(prompt)}
        replyContext={replyContext}
        onClearReply={() => setReplyContext(null)}
      />
    </div>
  );

  // Mobile layout with responsive top navigation and full screen height
  if (isMobile) {
    return (
      <AppShell hideHeader>
        <div className="flex h-[calc(100dvh-61px)] min-h-[calc(100dvh-61px)] max-h-[calc(100dvh-61px)] w-full flex-col overflow-hidden bg-background p-2 gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                mobileTab === "chat"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="size-3" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("conversations")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                mobileTab === "conversations"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PanelLeft className="size-3" />
              <span>History</span>
              {sessionsQuery.data && sessionsQuery.data.length > 0 && (
                <span className="rounded-full bg-muted border border-border px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  {sessionsQuery.data.length}
                </span>
              )}
            </button>
            {ready && (
              <button
                type="button"
                onClick={() => setMobileTab("sources")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  mobileTab === "sources"
                    ? "bg-muted text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="size-3" />
                <span>Sources</span>
                {activeCitations.length > 0 && (
                  <span className="rounded-full bg-[#238636] px-1.5 py-0.2 text-[10px] text-white">
                    {activeCitations.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Active Mobile View */}
          <div className="flex-1 min-h-0 w-full overflow-hidden">
            {mobileTab === "conversations" ? (
              <ChatSidebar
                repo={sidebarRepo}
                sessionId={sessionId}
                onSelectSession={(id) => {
                  setSelectedSessionId(id);
                  setMobileTab("chat");
                }}
              />
            ) : mobileTab === "sources" ? (
              <SourcePanel repo={repo} citations={activeCitations} />
            ) : (
              <section className="flex h-full min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {centerHeader}
                {centerContent}
              </section>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // Desktop layout with floated, resizable panels matching full screen height
  return (
    <AppShell hideHeader>
      <div className="flex h-[calc(100dvh-61px)] min-h-[calc(100dvh-61px)] max-h-[calc(100dvh-61px)] w-full flex-col overflow-hidden bg-background p-1.5 sm:p-2">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full w-full min-h-0 flex-1"
        >
          {/* Column 1: Conversations Sidebar (Adjustable Width up to 65%) */}
          {showLeftSidebar && (
            <>
              <ResizablePanel
                id="chat-sidebar"
                defaultSize="15%"
                minSize="15%"
                maxSize="65%"
                className="h-full min-w-0"
              >
                <ChatSidebar
                  repo={sidebarRepo}
                  sessionId={sessionId}
                  onSelectSession={setSelectedSessionId}
                />
              </ResizablePanel>

              <ResizableHandle className="w-1.5 sm:w-2 bg-transparent hover:bg-transparent group cursor-col-resize flex items-center justify-center transition-colors focus-visible:ring-0 focus-visible:outline-none after:hidden">
                <div className="w-1 h-8 rounded-full bg-border/80 group-hover:bg-primary group-active:bg-primary transition-all group-hover:h-12 group-active:h-12 shadow-xs" />
              </ResizableHandle>
            </>
          )}

          {/* Column 2: Main Chat Console */}
          <ResizablePanel
            id="chat-center"
            defaultSize={
              ready && showRightSidebar
                ? showLeftSidebar
                  ? "61%"
                  : "76%"
                : showLeftSidebar
                ? "85%"
                : "100%"
            }
            minSize="25%"
            className="h-full min-w-0"
          >
            <section className="flex h-full min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {centerHeader}
              {centerContent}
            </section>
          </ResizablePanel>

          {/* Column 3: Sources Panel (Adjustable Width up to 50%) */}
          {ready && showRightSidebar && (
            <>
              <ResizableHandle className="w-1.5 sm:w-2 bg-transparent hover:bg-transparent group cursor-col-resize flex items-center justify-center transition-colors focus-visible:ring-0 focus-visible:outline-none after:hidden">
                <div className="w-1 h-8 rounded-full bg-border/80 group-hover:bg-primary group-active:bg-primary transition-all group-hover:h-12 group-active:h-12 shadow-xs" />
              </ResizableHandle>

              <ResizablePanel
                id="chat-sources"
                defaultSize="24%"
                minSize="15%"
                maxSize="50%"
                className="h-full min-w-0"
              >
                <SourcePanel repo={repo} citations={activeCitations} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </AppShell>
  );
}