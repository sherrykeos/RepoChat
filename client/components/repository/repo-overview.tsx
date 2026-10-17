"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ChevronRight,
  ExternalLink,
  FolderTree,
  GitBranch,
  Layers,
  Lock,
  MessageSquare,
  RefreshCw,
  Share2,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoReadmeCard } from "@/components/repository/repo-readme-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepository, useStartIndexing, useStopIndexing, useUnindexRepo } from "@/hooks/use-repos";
import { cn } from "@/lib/utils";

export function RepoOverview({ repoId }: { repoId: string }) {
  const router = useRouter();
  const repoQuery = useRepository(repoId);
  const indexMutation = useStartIndexing();
  const unindexMutation = useUnindexRepo();
  const stopMutation = useStopIndexing();
  const [activeTab, setActiveTab] = useState<
    "overview" | "readme" | "chat" | "files" | "architecture" | "insights" | "settings"
  >("overview");

  useEffect(() => {
    if (repoId) {
      router.prefetch(`/chat/${repoId}`);
      router.prefetch(`/dashboard/explore?repo=${repoId}`);
      router.prefetch(`/dashboard/explore?tab=architecture&repo=${repoId}`);
    }
  }, [repoId, router]);

  if (repoQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6 sm:p-8 space-y-6">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-80 lg:col-span-8 rounded-xl" />
          <Skeleton className="h-80 lg:col-span-4 rounded-xl" />
        </div>
      </div>
    );
  }

  if (repoQuery.isError || !repoQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="size-10 text-destructive mb-3" />
        <h2 className="font-heading text-lg font-bold text-foreground">
          Repository Not Found
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {(repoQuery.error as Error)?.message || "The requested repository could not be located."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mt-6"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const repo = repoQuery.data;
  const isReady = repo.indexStatus === "READY";
  const isIndexing = repo.indexStatus === "INDEXING";

  function handleReindex() {
    indexMutation.mutate(repo.id, {
      onSuccess: () => router.push(`/chat/${repo.id}`),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6 sm:p-8">
      {/* Breadcrumb & Action bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Repositories
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{repo.fullName}</span>
        </div>

        <div className="flex items-center gap-2">
          {isReady && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unindexMutation.mutate(repo.id)}
              disabled={unindexMutation.isPending}
              className="h-8 gap-1.5 rounded-md border-border text-destructive hover:bg-destructive/10 text-xs font-medium"
            >
              <Trash2 className="size-3.5" />
              {unindexMutation.isPending ? "Unindexing..." : "Unindex"}
            </Button>
          )}
          {isReady ? (
            <Button
              size="sm"
              onClick={() => router.push(`/chat/${repo.id}`)}
              className="h-8 gap-1.5 rounded-md bg-[#238636] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2ea043]"
            >
              <MessageSquare className="size-3.5" />
              Open Chat
            </Button>
          ) : isIndexing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/chat/${repo.id}`)}
                className="h-8 gap-1.5 rounded-md border-border text-primary hover:bg-muted text-xs font-medium"
              >
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Indexing in progress...</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => stopMutation.mutate(repo.id)}
                disabled={stopMutation.isPending}
                className="h-8 gap-1.5 rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-medium cursor-pointer"
              >
                <Square className="size-3.5 fill-current" />
                <span>{stopMutation.isPending ? "Stopping..." : "Stop Indexing"}</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleReindex}
              disabled={indexMutation.isPending}
              className="h-8 gap-1.5 rounded-md bg-[#2f81f7] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#388bfd]"
            >
              {indexMutation.isPending ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              Index Repository
            </Button>
          )}
        </div>
      </div>

      {/* Main Repository Header Card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted border border-border">
              <GitHubIcon className="size-6 text-foreground" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-xl font-bold text-foreground">
                  <span className="text-muted-foreground">{repo.owner} / </span>
                  <span className="text-primary">{repo.name}</span>
                </h1>
                <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {repo.isPrivate ? "Private" : "Public"}
                </span>

                {isReady && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Indexed
                  </span>
                )}
                {isIndexing && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Indexing
                  </span>
                )}
                {!isReady && !isIndexing && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                    Not Indexed
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-3xl">
                {repo.description || "No description provided for this repository."}
              </p>

              {/* Real Badges line */}
              <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="size-2 rounded-full bg-primary" />
                    {repo.language}
                  </span>
                )}

                {repo.defaultBranch && (
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3 text-muted-foreground" />
                    <span>{repo.defaultBranch}</span>
                  </span>
                )}

                {repo.htmlUrl && (
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>{repo.htmlUrl}</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {repo.htmlUrl && (
              <Button
                variant="outline"
                size="sm"
                render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <ExternalLink className="size-3.5" />
                Open in GitHub
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1 border-t border-border pt-3">
          {[
            { id: "overview", label: "Overview" },
            { id: "readme", label: "README.md" },
            { id: "chat", label: "Chat", href: `/chat/${repo.id}` },
            { id: "files", label: "Files", href: `/dashboard/explore?repo=${repo.id}` },
            { id: "architecture", label: "Architecture", href: `/dashboard/explore?tab=architecture&repo=${repo.id}` },
            { id: "settings", label: "Settings" },
          ].map((t) => {
            const isRoute = Boolean(t.href);
            const tabClasses = cn(
              "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors inline-flex items-center cursor-pointer",
              activeTab === t.id
                ? "bg-primary/10 text-primary font-semibold dark:bg-primary/15"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            );

            if (isRoute && t.href) {
              return (
                <Link
                  key={t.id}
                  href={t.href}
                  prefetch={true}
                  className={tabClasses}
                >
                  {t.label}
                </Link>
              );
            }

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={tabClasses}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "readme" ? (
        <div className="mt-6">
          <RepoReadmeCard repo={repo} showFullHeight />
        </div>
      ) : activeTab === "settings" ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h2 className="font-heading text-base font-semibold text-foreground">Repository Settings</h2>
          <p className="text-xs text-muted-foreground">Manage indexing status and repository preferences.</p>
          <div className="pt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReindex}
              disabled={indexMutation.isPending || isIndexing}
              className="text-xs"
            >
              <RefreshCw className={cn("mr-2 size-3.5", indexMutation.isPending && "animate-spin")} />
              Trigger Full Re-index
            </Button>
          </div>
        </div>
      ) : (
        /* Overview 2-Column Grid */
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (lg:col-span-8) */}
          <div className="space-y-6 lg:col-span-8">
          {/* About Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              About this Repository
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {repo.description || "No description has been written for this repository."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-[11px]">
                Default branch: <span className="text-foreground font-semibold">{repo.defaultBranch}</span>
              </span>
              <span>·</span>
              <span className="font-mono text-[11px]">
                Repo ID: <span className="text-foreground">{repo.githubRepoId}</span>
              </span>
            </div>
          </div>

          {/* Repository Stats Card (Derived strictly from real API metrics) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Repository Stats
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border/80 bg-background/50 p-3">
                <div className="font-heading text-lg font-bold text-foreground">
                  {repo.filesTotal > 0 ? repo.filesTotal.toLocaleString() : "—"}
                </div>
                <div className="text-[11px] text-muted-foreground">Total Files</div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/50 p-3">
                <div className="font-heading text-lg font-bold text-foreground">
                  {repo.filesProcessed > 0 ? repo.filesProcessed.toLocaleString() : "—"}
                </div>
                <div className="text-[11px] text-muted-foreground">Files Processed</div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/50 p-3">
                <div className="font-heading text-lg font-bold text-foreground">
                  {repo.chunkCount > 0 ? repo.chunkCount.toLocaleString() : "0"}
                </div>
                <div className="text-[11px] text-muted-foreground">Indexed Chunks</div>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/50 p-3">
                <div className="font-heading text-sm font-bold text-foreground mt-1 truncate">
                  {repo.indexedAt ? formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true }) : "Not indexed"}
                </div>
                <div className="text-[11px] text-muted-foreground">Last Indexed</div>
              </div>
            </div>
          </div>

          {/* README.md File Card */}
          <RepoReadmeCard repo={repo} />
        </div>

        {/* Right Column (lg:col-span-4) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Primary Language */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Primary Language
            </h2>

            {repo.language ? (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {repo.language}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Primary
                </span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                No dominant programming language detected.
              </p>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Quick Actions
            </h2>

            <div className="mt-3 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium"
                onClick={() => router.push(`/chat/${repo.id}`)}
              >
                <MessageSquare className="mr-2 size-3.5 text-primary" />
                Open Chat
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium"
                disabled={indexMutation.isPending || isIndexing}
                onClick={handleReindex}
              >
                <RefreshCw
                  className={cn(
                    "mr-2 size-3.5 text-[#2f81f7]",
                    indexMutation.isPending && "animate-spin"
                  )}
                />
                {isReady ? "Re-index Repository" : "Index Repository"}
              </Button>

              

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium"
                onClick={() => router.push(`/dashboard/explore?repo=${repo.id}`)}
              >
                <FolderTree className="mr-2 size-3.5 text-indigo-500" />
                View File Explorer
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-medium"
                onClick={() => router.push(`/dashboard/explore?tab=architecture&repo=${repo.id}`)}
              >
                <Layers className="mr-2 size-3.5 text-violet-500" />
                Generate Architecture
              </Button>

              {isIndexing && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs font-medium text-destructive hover:bg-destructive/10"
                  disabled={stopMutation.isPending}
                  onClick={() => stopMutation.mutate(repo.id)}
                >
                  <Square className="mr-2 size-3.5 fill-current" />
                  {stopMutation.isPending ? "Stopping..." : "Stop Indexing"}
                </Button>
              )}
              {isReady && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs font-medium text-[#f9a7a3] hover:bg-[#f85149]/10"
                  disabled={unindexMutation.isPending}
                  onClick={() => unindexMutation.mutate(repo.id)}
                >
                  <Trash2 className="mr-2 size-3.5 text-[#ed7b75]" />
                  {unindexMutation.isPending ? "Unindexing..." : "Unindex Repository"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
