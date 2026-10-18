"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import {
  BookOpen,
  Check,
  ChevronDown,
  FolderGit2,
  GitBranch,
  Layers,
  MessageSquare,
  Network,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoReadmeModal } from "@/components/repository/repo-readme-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useRenameChatSession,
} from "@/hooks/use-chat";
import { useRepos, useStartIndexing, useStopIndexing } from "@/hooks/use-repos";
import type { ChatSession, Repository } from "@/lib/api";
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

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
  className,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const ready = repo.indexStatus === "READY";
  const isIndexing = repo.indexStatus === "INDEXING";

  const reposQuery = useRepos();
  const allRepos: Repository[] = reposQuery.data ?? [];

  // Group and sort repos: indexed first, then unindexed
  const indexedRepos = useMemo(
    () => allRepos.filter((r) => r.indexStatus === "READY"),
    [allRepos]
  );
  const unindexedRepos = useMemo(
    () => allRepos.filter((r) => r.indexStatus !== "READY"),
    [allRepos]
  );

  const sessionsQuery = useChatSessions(repo.id, ready);
  const createSession = useCreateChatSession(repo.id);
  const renameMutation = useRenameChatSession(repo.id);
  const deleteMutation = useDeleteChatSession(repo.id);
  const reindex = useStartIndexing();
  const stopIndexing = useStopIndexing();

  const [search, setSearch] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [showReadmeModal, setShowReadmeModal] = useState(false);

  const rawSessions: ChatSession[] = sessionsQuery.data ?? [];

  const sessions = useMemo(() => {
    if (!search.trim()) return rawSessions;
    const q = search.toLowerCase();
    return rawSessions.filter((s) =>
      (s.title || "Untitled chat").toLowerCase().includes(q)
    );
  }, [rawSessions, search]);

  // Group sessions by Today, Yesterday, This Week, Earlier
  const grouped = useMemo(() => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const thisWeek: ChatSession[] = [];
    const earlier: ChatSession[] = [];

    sessions.forEach((s) => {
      const date = new Date(s.createdAt);
      if (isToday(date)) today.push(s);
      else if (isYesterday(date)) yesterday.push(s);
      else if (isThisWeek(date)) thisWeek.push(s);
      else earlier.push(s);
    });

    return { today, yesterday, thisWeek, earlier };
  }, [sessions]);

  function handleSaveRename(id: string) {
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    renameMutation.mutate({ sessionId: id, title: editTitle.trim() });
    setEditingSessionId(null);
  }

  function handleDelete(idToDelete: string) {
    deleteMutation.mutate(idToDelete, {
      onSuccess: () => {
        if (sessionId === idToDelete) {
          const remaining = rawSessions.filter((s) => s.id !== idToDelete);
          if (remaining.length > 0) {
            onSelectSession(remaining[0].id);
          } else {
            onSelectSession("");
          }
        }
      },
    });
  }

  return (
    <>
      <aside
        className={cn(
          "flex h-full w-full flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden select-none",
          className
        )}
      >
        {/* Top Header: Repository Selector */}
        <div className="p-3 border-b border-border space-y-2.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:border-primary/50 transition-colors group cursor-pointer"
                />
              }
            >
              <div className="flex items-center gap-2 min-w-0">
                <GitHubIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                <div className="min-w-0">
                  <span className="block truncate font-heading font-semibold text-foreground">
                    {repo.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground truncate leading-none">
                    {repo.owner}
                  </span>
                </div>
              </div>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-68 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
            >
              {/* Indexed Repositories section */}
              {indexedRepos.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    Indexed Repositories
                  </div>
                  {indexedRepos.map((r) => {
                    const isSelected = r.id === repo.id;
                    return (
                      <DropdownMenuItem
                        key={r.id}
                        onClick={() => router.push(`/chat/${r.id}`)}
                        className={cn(
                          "flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted",
                          isSelected && "bg-muted text-primary font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-1.5 rounded-full bg-[#3fb950] shrink-0" />
                          <div className="min-w-0">
                            <span className="truncate block font-medium">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {r.owner}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              )}

              {/* Unindexed Repositories section */}
              {unindexedRepos.length > 0 && (
                <div
                  className={cn(
                    "space-y-0.5",
                    indexedRepos.length > 0 && "mt-2 pt-2 border-t border-border/60"
                  )}
                >
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    Unindexed Repositories
                  </div>
                  {unindexedRepos.map((r) => {
                    const isSelected = r.id === repo.id;
                    return (
                      <DropdownMenuItem
                        key={r.id}
                        onClick={() => router.push(`/chat/${r.id}`)}
                        className={cn(
                          "flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted",
                          isSelected && "bg-muted text-primary font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-1.5 rounded-full bg-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <span className="truncate block font-medium">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {r.owner}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Stacked Repo Details Box */}
          <div className="rounded-lg border border-border bg-background/80 p-2.5 space-y-2 text-xs">
            {/* Row 1: Status & Explore Button */}
            <div className="flex items-center justify-between gap-1.5">
              {ready ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3fb950]">
                  <span className="size-2 rounded-full bg-[#3fb950] shadow-[0_0_6px_#238636]" />
                  <span>Indexed</span>
                </span>
              ) : isIndexing ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <span className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_#1f6feb]" />
                    <span>Indexing...</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => stopIndexing.mutate(repo.id)}
                    disabled={stopIndexing.isPending}
                    className="h-5 px-1.5 text-[10px] border-destructive/40 text-destructive hover:bg-destructive/10 gap-1 shrink-0 font-medium cursor-pointer"
                    title="Stop indexing"
                  >
                    <Square className="size-2 fill-current" />
                    <span>Stop</span>
                  </Button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                  <span className="size-2 rounded-full bg-muted-foreground" />
                  <span>Unindexed</span>
                </span>
              )}

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReadmeModal(true)}
                  className="h-6 px-1.5 text-[10px] border-border bg-card text-foreground hover:bg-muted hover:border-primary/50 gap-1 shrink-0 font-medium cursor-pointer"
                  title="View repository README.md"
                >
                  <BookOpen className="size-2.5 text-primary" />
                  {/* <span>README</span> */}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] border-border bg-card text-foreground hover:bg-muted hover:border-primary/50 gap-1 shrink-0 font-medium cursor-pointer"
                  title="Explore"
                  render={<Link href={`/dashboard/explore?repo=${repo.id}`} />}
                >
                  <Network className="size-2.5 text-primary" />
                  {/* <span>Explore</span> */}
                </Button>
              </div>
            </div>

            {/* Row 2: Stacked Details Grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-border/60 text-[11px]">
              {/* Files */}
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0" title="Total Files">
                <FolderGit2 className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  <span className="text-foreground font-medium">
                    {isIndexing ? `${repo.filesProcessed}/${repo.filesTotal}` : repo.filesTotal}
                  </span>{" "}
                  files
                </span>
              </div>

              {/* Chunks */}
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0" title="Indexed Chunks">
                <Layers className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  <span className="text-foreground font-medium">
                    {repo.chunkCount?.toLocaleString() ?? 0}
                  </span>{" "}
                  chunks
                </span>
              </div>

              {/* Language */}
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0" title="Language">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: repo.language ? languageColors[repo.language] || "#58a6ff" : "#8b949e",
                  }}
                />
                <span className="truncate text-foreground font-medium">
                  {repo.language || "Unknown"}
                </span>
              </div>

              {/* Default Branch */}
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0" title="Default Branch">
                <GitBranch className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground font-medium">
                  {repo.defaultBranch || "main"}
                </span>
              </div>
            </div>
          </div>

          {/* + New Chat Button */}
          <Button
            size="sm"
            className="w-full justify-center gap-1.5 rounded-lg bg-[#2f81f7] text-white hover:bg-[#388bfd] font-semibold text-xs h-8 shadow-xs border-0"
            disabled={!ready || createSession.isPending}
            onClick={() =>
              createSession.mutate(undefined, {
                onSuccess: (session) => onSelectSession(session.id),
              })
            }
          >
            <Plus className="size-3.5" />
            <span>New Chat</span>
          </Button>

          {/* Search Conversations Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="h-7 w-full rounded-md border border-border bg-background pl-7 pr-7 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Date-wise Grouped Chat List per Repo */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 bg-muted/20 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-4">
            {sessionsQuery.isLoading && (
              <div className="space-y-1.5 p-2">
                <Skeleton className="h-7 rounded-md bg-card border border-border" />
                <Skeleton className="h-7 rounded-md bg-card border border-border" />
              </div>
            )}

            {!ready && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Conversations unlock once repository indexing completes.
              </div>
            )}

            {ready && sessionsQuery.isSuccess && rawSessions.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No conversations yet for this repository. Click "New Chat" above to begin.
              </div>
            )}

            {/* Helper render group */}
            {[
              { label: "Today", list: grouped.today },
              { label: "Yesterday", list: grouped.yesterday },
              { label: "This Week", list: grouped.thisWeek },
              { label: "Earlier", list: grouped.earlier },
            ].map(
              (group) =>
                group.list.length > 0 && (
                  <div key={group.label} className="space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                      {group.label}
                    </div>
                    {group.list.map((s) => {
                      const isSelected = sessionId === s.id;
                      const isEditing = editingSessionId === s.id;

                      if (isEditing) {
                        return (
                          <div
                            key={s.id}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-2 py-1 w-full bg-muted rounded-md border border-primary"
                          >
                            <input
                              type="text"
                              value={editTitle}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => handleSaveRename(s.id)}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveRename(s.id);
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  setEditingSessionId(null);
                                }
                              }}
                              className="flex-1 min-w-0 bg-transparent text-xs text-foreground outline-none"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleSaveRename(s.id);
                              }}
                              className="text-[#3fb950] hover:text-[#56d364] p-0.5"
                              title="Save"
                            >
                              <Check className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setEditingSessionId(null);
                              }}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="Cancel"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={s.id}
                          onClick={() => onSelectSession(s.id)}
                          className={cn(
                            "group/item relative flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer",
                            isSelected
                              ? "bg-muted text-primary font-semibold border-l-2 border-primary"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                          title={s.title || "New Chat"}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                            <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{s.title || "New Chat"}</span>
                          </div>

                          {/* Inline Actions: Rename & Delete (visible only on hover) */}
                          <div
                            className="flex items-center gap-1 transition-opacity duration-150 shrink-0 opacity-0 group-hover/item:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setEditingSessionId(s.id);
                                setEditTitle(s.title || "");
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Rename chat"
                            >
                              <Pencil className="size-3" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSessionToDelete(s);
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                              title="Delete chat"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
            )}
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal (Point 1) */}
      {sessionToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSessionToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                Delete conversation?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="text-foreground font-medium">
                  "{sessionToDelete.title || "Untitled chat"}"
                </span>
                ? This will permanently delete all messages in this conversation.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSessionToDelete(null)}
                className="h-8 text-xs border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  handleDelete(sessionToDelete.id);
                  setSessionToDelete(null);
                }}
                className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Repo README Modal */}
      <RepoReadmeModal
        repo={repo}
        open={showReadmeModal}
        onClose={() => setShowReadmeModal(false)}
      />
    </>
  );
}