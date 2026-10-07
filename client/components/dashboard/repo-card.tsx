"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  GitBranch,
  Lock,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { getRepoProgress, useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

const languageColors: Record<string, string> = {
  JavaScript: "bg-amber-400",
  TypeScript: "bg-blue-500",
  Java: "bg-orange-500",
  Python: "bg-emerald-500",
  Go: "bg-cyan-500",
  Rust: "bg-red-500",
  HTML: "bg-rose-500",
  CSS: "bg-indigo-500",
  PHP: "bg-purple-500",
  C: "bg-slate-500",
  "C++": "bg-pink-500",
  "C#": "bg-green-600",
};

export function RepoCard({ repo }: { repo: Repository }) {
  const router = useRouter();
  const indexMutation = useStartIndexing();
  const isIndexing = repo.indexStatus === "INDEXING" || indexMutation.isPending;
  const isReady = repo.indexStatus === "READY";
  const isFailed = repo.indexStatus === "FAILED";

  const progress = getRepoProgress(repo);

  const lastIndexedText = repo.indexedAt
    ? `Indexed ${formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true })}`
    : isIndexing
    ? "Indexing in progress..."
    : isFailed
    ? "Indexing failed"
    : "Not indexed yet";

  function openChat() {
    router.push(`/chat/${repo.id}`);
  }

  function openDetails() {
    router.push(`/dashboard/repo/${repo.id}`);
  }

  function handleIndex(e: React.MouseEvent) {
    e.stopPropagation();
    indexMutation.mutate(repo.id, {
      onSuccess: () => router.push(`/chat/${repo.id}`),
    });
  }

  return (
    <div
      onClick={isReady ? openChat : openDetails}
      className={cn(
        "group flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-all cursor-pointer",
        isFailed
          ? "border-destructive/30 hover:border-destructive/50"
          : "border-border hover:border-foreground/20 hover:shadow-md"
      )}
    >
      <div>
        {/* Card Header: Owner / Name and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <GitHubIcon className="size-4 shrink-0 text-foreground" />
            <h3 className="font-heading text-sm font-semibold text-foreground truncate">
              <span className="font-normal text-muted-foreground">{repo.owner} / </span>
              <span className="text-primary hover:underline">{repo.name}</span>
            </h3>
          </div>

          {/* Status Badge */}
          {isReady && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Indexed
            </span>
          )}
          {isIndexing && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
              <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
              Indexing
            </span>
          )}
          {isFailed && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <span className="size-1.5 rounded-full bg-destructive" />
              Failed
            </span>
          )}
          {!isReady && !isIndexing && !isFailed && (
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground/60" />
              Not Indexed
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-2.5 line-clamp-2 min-h-8 text-xs leading-relaxed text-muted-foreground">
          {repo.description || "No description provided."}
        </p>

        {/* Badges / Real Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
          {/* Language with colored dot if present */}
          {repo.language && (
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span
                className={cn(
                  "size-2 rounded-full",
                  languageColors[repo.language] || "bg-primary"
                )}
              />
              <span>{repo.language}</span>
            </div>
          )}

          {/* Visibility */}
          {repo.isPrivate && (
            <span className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Lock className="size-2.5" />
              Private
            </span>
          )}

          {/* Default branch */}
          {repo.defaultBranch && (
            <span className="inline-flex items-center gap-1 text-[11px]">
              <GitBranch className="size-3 text-muted-foreground" />
              <span>{repo.defaultBranch}</span>
            </span>
          )}

          {/* Real chunk count if indexed */}
          {repo.chunkCount > 0 && (
            <span className="rounded border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {repo.chunkCount.toLocaleString()} chunks
            </span>
          )}
        </div>

        {/* Indexing Progress Bar */}
        {isIndexing && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Indexing...</span>
              <span className="font-mono font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        )}

        {/* Error message snippet if failed */}
        {isFailed && repo.errorMessage && (
          <p className="mt-3 rounded-md bg-destructive/10 p-2 text-[11px] text-destructive line-clamp-2">
            {repo.errorMessage}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
          {lastIndexedText}
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isReady && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-md px-2.5 text-xs font-medium"
                onClick={openDetails}
              >
                View Details
              </Button>
              <Button
                size="sm"
                className="h-7 rounded-md bg-[#1f2328] px-3 text-xs font-semibold text-white hover:bg-[#2c3138] dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3]"
                onClick={openChat}
              >
                <MessageSquare className="mr-1.5 size-3" />
                Open Chat
              </Button>
            </>
          )}

          {isIndexing && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-md px-3 text-xs font-medium"
              onClick={openChat}
            >
              <Spinner className="mr-1.5 size-3" />
              View Progress
            </Button>
          )}

          {isFailed && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-md border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-medium"
              disabled={indexMutation.isPending}
              onClick={handleIndex}
            >
              <RotateCcw className="mr-1.5 size-3" />
              Retry
            </Button>
          )}

          {!isReady && !isIndexing && !isFailed && (
            <Button
              size="sm"
              className="h-7 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              disabled={indexMutation.isPending}
              onClick={handleIndex}
            >
              {indexMutation.isPending ? (
                <>
                  <Spinner className="mr-1.5 size-3" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 size-3" />
                  Index Repository
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}