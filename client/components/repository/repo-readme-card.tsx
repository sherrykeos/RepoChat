"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoReadme } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

const ChatMarkdown = dynamic(
  () => import("@/components/chat/chat-markdown").then((mod) => mod.ChatMarkdown),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3 py-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    ),
  }
);

export function RepoReadmeCard({
  repo,
  className,
  initialView = "preview",
  showFullHeight = false,
}: {
  repo: Repository;
  className?: string;
  initialView?: "preview" | "raw";
  showFullHeight?: boolean;
}) {
  const readmeQuery = useRepoReadme(repo.id);
  const [viewMode, setViewMode] = useState<"preview" | "raw">(initialView);
  const [copied, setCopied] = useState(false);

  const content = readmeQuery.data?.content?.trim() || "";
  const hasContent = Boolean(content);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const githubReadmeUrl = repo.htmlUrl
    ? `${repo.htmlUrl}/blob/${repo.defaultBranch || "main"}/README.md`
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col",
        className
      )}
    >
      {/* GitHub-style File Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="size-4 text-primary shrink-0" />
          <span className="font-heading text-xs sm:text-sm font-semibold text-foreground truncate">
            README.md
          </span>
          {hasContent && (
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
              ({content.split("\n").length} lines)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasContent && (
            <>
              {/* Preview / Raw toggle */}
              <div className="flex items-center rounded-md border border-border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                    viewMode === "preview"
                      ? "bg-muted text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Rendered Markdown preview"
                >
                  <Eye className="size-3" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                    viewMode === "raw"
                      ? "bg-muted text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Raw Markdown source"
                >
                  <Code2 className="size-3" />
                  <span>Raw</span>
                </button>
              </div>

              {/* Copy Raw Markdown */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-[11px] border-border text-muted-foreground hover:text-foreground gap-1"
                title="Copy raw markdown"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-[#3fb950]" />
                    <span className="text-[#3fb950]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </>
          )}

          {/* GitHub link */}
          {githubReadmeUrl && (
            <Button
              variant="outline"
              size="sm"
              render={<a href={githubReadmeUrl} target="_blank" rel="noreferrer" />}
              className="h-7 px-2 text-[11px] border-border text-muted-foreground hover:text-foreground gap-1"
              title="Open README on GitHub"
            >
              <ExternalLink className="size-3" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
          )}

          {readmeQuery.isError && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => readmeQuery.refetch()}
              className="h-7 px-2 text-[11px] border-border text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="size-3" />
              <span>Retry</span>
            </Button>
          )}
        </div>
      </div>

      {/* Body Area */}
      <div
        className={cn(
          "p-5 sm:p-6",
          !showFullHeight && "max-h-[700px] overflow-y-auto [scrollbar-width:thin]"
        )}
      >
        {readmeQuery.isLoading ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-7 w-2/5 rounded bg-muted/80" />
            <Skeleton className="h-4 w-4/5 rounded bg-muted/60" />
            <Skeleton className="h-4 w-3/4 rounded bg-muted/60" />
            <div className="pt-2 space-y-2">
              <Skeleton className="h-5 w-1/3 rounded bg-muted/80" />
              <Skeleton className="h-24 w-full rounded-lg bg-muted/40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded bg-muted/60" />
              <Skeleton className="h-4 w-5/6 rounded bg-muted/60" />
            </div>
          </div>
        ) : !hasContent ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted border border-border text-muted-foreground mb-3">
              <FileText className="size-6 opacity-70" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              No README.md Available
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
              This repository doesn&apos;t have a README.md file in its default branch, or it could not be retrieved from GitHub.
            </p>
            {repo.htmlUrl && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs"
                render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
              >
                <ExternalLink className="mr-1.5 size-3.5" />
                View on GitHub
              </Button>
            )}
          </div>
        ) : viewMode === "raw" ? (
          <pre className="font-mono text-xs text-foreground bg-muted/30 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border/60">
            {content}
          </pre>
        ) : (
          <div className="readme-container max-w-none prose dark:prose-invert">
            <ChatMarkdown content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
