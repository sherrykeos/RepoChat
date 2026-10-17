"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  ExternalLink,
  GitBranch,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Network,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";

import { FoldedCornerMark } from "@/components/dashboard/folded-corner-mark";
import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoReadmeModal } from "@/components/repository/repo-readme-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  getRepoProgress,
  useStartIndexing,
  useStopIndexing,
  useUnindexRepo,
} from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
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

export function RepoCard({
  repo,
  viewMode = "grid",
}: {
  repo: Repository;
  viewMode?: "grid" | "list";
}) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const isNative = Boolean(
    user?.githubUsername &&
    repo.owner.toLowerCase() === user.githubUsername.toLowerCase()
  );
  const indexMutation = useStartIndexing();
  const unindexMutation = useUnindexRepo();
  const stopMutation = useStopIndexing();
  const isIndexing = repo.indexStatus === "INDEXING" || indexMutation.isPending;
  const isReady = repo.indexStatus === "READY";
  const isFailed = repo.indexStatus === "FAILED";

  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const progress = getRepoProgress(repo);

  const lastIndexedText = repo.indexedAt
    ? `Indexed ${formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true })}`
    : isIndexing
    ? "Indexing in progress..."
    : isFailed
    ? "Indexing failed"
    : "Not indexed yet";

  function openChat(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    router.push(`/chat/${repo.id}`);
  }

  function openExplore(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    router.push(`/dashboard/explore?repo=${repo.id}`);
  }

  function openDetails(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    router.push(`/dashboard/repo/${repo.id}`);
  }

  function handleIndex(e: React.MouseEvent) {
    e.stopPropagation();
    indexMutation.mutate(repo.id, {
      onSuccess: () => router.push(`/chat/${repo.id}`),
    });
  }

  // --- List View Mode ---
  if (viewMode === "list") {
    return (
      <>
      <div
        onClick={openDetails}
        className={cn(
          "relative overflow-hidden group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all duration-150 hover:border-primary/50 cursor-pointer shadow-xs"
        )}
      >
        {!isNative && <FoldedCornerMark owner={repo.owner} />}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <GitHubIcon className="size-4 shrink-0 text-foreground mt-1 sm:mt-0" />
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading text-sm font-semibold text-primary group-hover:underline truncate">
                <span className="font-normal text-muted-foreground">{repo.owner} / </span>
                {repo.name}
              </span>
              {repo.isPrivate ? (
                <span className="rounded border border-border bg-muted/60 px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  Private
                </span>
              ) : (
                <span className="rounded border border-border bg-muted/60 px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  Public
                </span>
              )}
              {isReady && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-medium text-emerald-600 dark:text-[#3fb950]">
                  <span className="size-1 rounded-full bg-emerald-600 dark:bg-[#3fb950]" />
                  Indexed
                </span>
              )}
              {isIndexing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-medium text-primary">
                  <span className="size-1 rounded-full bg-primary animate-pulse" />
                  Indexing
                </span>
              )}
              {!isReady && !isIndexing && !isFailed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.2 text-[10px] font-medium text-muted-foreground">
                  <span className="size-1 rounded-full bg-muted-foreground" />
                  Not Indexed
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {repo.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* List Action Buttons */}
        <div
          className="flex items-center gap-2 shrink-0 self-end sm:self-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isReady ? (
            <>
              <Button
                size="sm"
                className="h-7 px-3 rounded-md bg-[#238636] text-white hover:bg-[#2ea043] text-xs font-medium gap-1.5"
                onClick={openChat}
              >
                <MessageSquare className="size-3" />
                <span>Chat</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 rounded-md border-border bg-muted/60 text-foreground hover:bg-muted text-xs font-medium gap-1.5"
                onClick={openExplore}
              >
                <Network className="size-3" />
                <span>Explore</span>
              </Button>
            </>
          ) : isIndexing ? (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 rounded-md border-border text-primary text-xs font-medium gap-1.5"
                onClick={openChat}
              >
                <Spinner className="size-3" />
                <span>Indexing...</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-medium gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  stopMutation.mutate(repo.id);
                }}
                disabled={stopMutation.isPending}
                title="Stop indexing"
              >
                {stopMutation.isPending ? <Spinner className="size-3" /> : <Square className="size-2.5 fill-current" />}
                <span>Stop</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-7 px-3 rounded-md bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] text-xs font-medium gap-1.5 shadow-xs"
              disabled={indexMutation.isPending}
              onClick={handleIndex}
            >
              {indexMutation.isPending ? <Spinner className="size-3" /> : <Sparkles className="size-3" />}
              <span>Index Repository</span>
            </Button>
          )}

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="More options"
                />
              }
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            >
              <DropdownMenuItem
                onClick={openDetails}
                className="text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReadmeModal(true);
                }}
                className="text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                <BookOpen className="mr-2 size-3.5 text-primary" />
                View README.md
              </DropdownMenuItem>
              {repo.htmlUrl && (
                <DropdownMenuItem
                  render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
                  className="text-xs text-foreground hover:bg-muted cursor-pointer"
                >
                  <ExternalLink className="mr-2 size-3.5" />
                  GitHub Page
                </DropdownMenuItem>
              )}
              {isIndexing && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    stopMutation.mutate(repo.id);
                  }}
                  disabled={stopMutation.isPending}
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Square className="mr-2 size-3.5 fill-current" />
                  Stop Indexing
                </DropdownMenuItem>
              )}
              {isReady && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleIndex}
                    className="text-xs text-primary hover:bg-muted cursor-pointer"
                  >
                    <RotateCcw className="mr-2 size-3.5" />
                    Re-index
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      unindexMutation.mutate(repo.id);
                    }}
                    disabled={unindexMutation.isPending}
                    className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Unindex Repository
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <RepoReadmeModal
        repo={repo}
        open={showReadmeModal}
        onOpenChange={setShowReadmeModal}
      />
      </>
    );
  }

  // --- Grid View Mode (Default) ---
  return (
    <>
    <div
      onClick={openDetails}
      className={cn(
        "relative overflow-hidden group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/50 cursor-pointer shadow-xs"
      )}
    >
      {!isNative && <FoldedCornerMark owner={repo.owner} />}
      <div className="space-y-3">
        {/* Top Row: GitHub Icon + Name + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <GitHubIcon className="size-4 shrink-0 text-foreground" />
            <div className="min-w-0">
              <span className="block text-[11px] text-muted-foreground truncate leading-none">
                {repo.owner} /
              </span>
              <span className="block font-heading text-sm font-semibold text-primary group-hover:underline truncate">
                {repo.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {repo.isPrivate ? (
              <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Private
              </span>
            ) : (
              <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Public
              </span>
            )}
          </div>
        </div>

        {/* Index Status Badge */}
        <div className="flex items-center gap-2">
          {isReady && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-[#3fb950]">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-[#3fb950]" />
              Indexed
            </span>
          )}
          {isIndexing && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Indexing
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <span className="size-1.5 rounded-full bg-destructive" />
              Failed
            </span>
          )}
          {!isReady && !isIndexing && !isFailed && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              Not Indexed
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[36px]">
          {repo.description || "No description provided."}
        </p>

        {/* Metadata Row: Language, Branch, Counts */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground pt-1">
          {repo.language && (
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span
                className="size-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    languageColors[repo.language] || "#58a6ff",
                }}
              />
              <span className="text-xs">{repo.language}</span>
            </div>
          )}

          {repo.defaultBranch && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <GitBranch className="size-3" />
              <span>{repo.defaultBranch}</span>
            </div>
          )}

          {repo.filesTotal > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {repo.filesTotal} files
            </span>
          )}

          {repo.chunkCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              · {repo.chunkCount.toLocaleString()} chunks
            </span>
          )}
        </div>

        {/* Indexing Progress if active */}
        {isIndexing && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Indexing codebase...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        )}
      </div>

      {/* Card Footer: Timestamp and Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
          {lastIndexedText}
        </span>

        {/* Actions */}
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {isReady && (
            <>
              <Button
                size="sm"
                className="h-7 px-3 rounded-md bg-[#238636] text-white hover:bg-[#2ea043] text-xs font-medium gap-1.5"
                onClick={openChat}
              >
                <MessageSquare className="size-3" />
                <span>Chat</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 rounded-md border-border bg-muted/60 text-foreground hover:bg-muted text-xs font-medium gap-1.5"
                onClick={openExplore}
              >
                <Network className="size-3" />
                <span>Explore</span>
              </Button>
            </>
          )}

          {isIndexing && (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 rounded-md border-border text-primary text-xs font-medium gap-1.5"
                onClick={openChat}
              >
                <Spinner className="size-3" />
                <span>Progress</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-medium gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  stopMutation.mutate(repo.id);
                }}
                disabled={stopMutation.isPending}
                title="Stop indexing"
              >
                {stopMutation.isPending ? <Spinner className="size-3" /> : <Square className="size-2.5 fill-current" />}
                <span>Stop</span>
              </Button>
            </div>
          )}

          {isFailed && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 rounded-md border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-medium gap-1.5"
              disabled={indexMutation.isPending}
              onClick={handleIndex}
            >
              <RotateCcw className="size-3" />
              <span>Retry</span>
            </Button>
          )}

          {!isReady && !isIndexing && !isFailed && (
            <Button
              size="sm"
              className="h-7 px-3 rounded-md bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] text-xs font-medium gap-1.5 shadow-xs"
              disabled={indexMutation.isPending}
              onClick={handleIndex}
            >
              {indexMutation.isPending ? (
                <>
                  <Spinner className="size-3" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3" />
                  <span>Index Repository</span>
                </>
              )}
            </Button>
          )}

          {/* More options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="More options"
                />
              }
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            >
              <DropdownMenuItem
                onClick={openDetails}
                className="text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReadmeModal(true);
                }}
                className="text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                <BookOpen className="mr-2 size-3.5 text-primary" />
                View README.md
              </DropdownMenuItem>
              {repo.htmlUrl && (
                <DropdownMenuItem
                  render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
                  className="text-xs text-foreground hover:bg-muted cursor-pointer"
                >
                  <ExternalLink className="mr-2 size-3.5" />
                  GitHub Page
                </DropdownMenuItem>
              )}
              {isIndexing && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    stopMutation.mutate(repo.id);
                  }}
                  disabled={stopMutation.isPending}
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Square className="mr-2 size-3.5 fill-current" />
                  Stop Indexing
                </DropdownMenuItem>
              )}
              {isReady && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleIndex}
                    className="text-xs text-primary hover:bg-muted cursor-pointer"
                  >
                    <RotateCcw className="mr-2 size-3.5" />
                    Re-index
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      unindexMutation.mutate(repo.id);
                    }}
                    disabled={unindexMutation.isPending}
                    className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Unindex Repository
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
    <RepoReadmeModal
      repo={repo}
      open={showReadmeModal}
      onOpenChange={setShowReadmeModal}
    />
    </>
  );
}