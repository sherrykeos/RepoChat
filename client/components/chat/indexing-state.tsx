"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  FileCode,
  GitBranch,
  Loader2,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStartIndexing } from "@/hooks/use-repos";
import type { IndexStatusResponse, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: 1, label: "Cloning repository", desc: "Cloning git tree and branches" },
  { id: 2, label: "Scanning files", desc: "Parsing eligible code files" },
  { id: 3, label: "Chunking content", desc: "Splitting code into semantic chunks" },
  { id: 4, label: "Generating embeddings", desc: "Running vector embedding model" },
  { id: 5, label: "Indexing to vector database", desc: "Writing to pgvector store" },
  { id: 6, label: "Finalizing", desc: "Building citations and search index" },
];

export function IndexingState({
  repo,
  status,
}: {
  repo: Repository;
  status?: IndexStatusResponse;
}) {
  const indexMutation = useStartIndexing();
  const filesProcessed = status?.filesProcessed ?? repo.filesProcessed ?? 0;
  const filesTotal = status?.filesTotal ?? repo.filesTotal ?? 0;
  const chunkCount = status?.chunkCount ?? repo.chunkCount ?? 0;
  
  const hasTotal = filesTotal > 0;
  const progress = hasTotal ? Math.min(100, Math.round((filesProcessed / filesTotal) * 100)) : 0;

  const indexStatus = status?.indexStatus ?? repo.indexStatus;
  const errorMessage = status?.errorMessage ?? repo.errorMessage;

  // Derive current pipeline stage from real metrics
  let activeStageId = 1;
  if (indexStatus === "READY") {
    activeStageId = 6;
  } else if (indexStatus === "INDEXING") {
    if (!hasTotal || filesProcessed === 0) {
      activeStageId = 2; // scanning
    } else if (filesProcessed < filesTotal) {
      activeStageId = 3; // chunking & embedding
    } else {
      activeStageId = 5; // vector db write
    }
  }

  if (indexStatus === "PENDING") {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center my-auto">
        <div className="size-14 rounded-2xl bg-primary/10 p-3.5 text-primary mb-4 flex items-center justify-center">
          <Sparkles className="size-7" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">
          Index {repo.fullName}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md">
          This repository has not been indexed yet. Start indexing to build vector embeddings and unlock grounded AI chat.
        </p>
        <Button
          onClick={() => indexMutation.mutate(repo.id)}
          disabled={indexMutation.isPending}
          className="mt-6 gap-2"
        >
          {indexMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {indexMutation.isPending ? "Starting indexing..." : "Start Indexing"}
        </Button>
      </div>
    );
  }

  if (indexStatus === "FAILED") {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center my-auto">
        <div className="size-14 rounded-2xl bg-destructive/10 p-3.5 text-destructive mb-4 flex items-center justify-center">
          <AlertCircle className="size-7" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">
          Indexing failed
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md">
          {errorMessage || "An unexpected error occurred during repository indexing."}
        </p>
        <Button
          onClick={() => indexMutation.mutate(repo.id)}
          disabled={indexMutation.isPending}
          className="mt-6 gap-2"
        >
          <RotateCcw className="size-4" />
          Retry Indexing
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            Indexing Repository
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2 mt-0.5">
            <GitHubIcon className="size-4.5" />
            <span>{repo.fullName}</span>
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Indexing in progress</span>
        </div>
      </div>

      {/* Main Indexing Body: Orbital Radar Left | Stepper Right */}
      <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Left: Circular Orbital Radar Visualization (~7 columns) */}
        <div className="relative flex items-center justify-center lg:col-span-7 py-8">
          <div className="relative flex size-64 sm:size-80 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-border/80 dark:border-[#30363d] animate-[spin_20s_linear_infinite]" />
            {/* Middle ring */}
            <div className="absolute inset-8 rounded-full border border-dashed border-primary/30 animate-[spin_15s_linear_infinite_reverse]" />
            {/* Inner ring */}
            <div className="absolute inset-16 rounded-full border border-indigo-500/30" />

            {/* Orbiting Satellites */}
            <div className="absolute top-2 left-1/3 size-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-ping" />
            <div className="absolute bottom-6 right-1/4 size-3 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
            <div className="absolute top-1/2 -left-2 size-2.5 rounded-full bg-emerald-400" />
            <div className="absolute top-1/4 -right-1 size-2 rounded-full bg-amber-400" />

            {/* Center Core */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-xl animate-pulse" />
              <div className="relative flex size-20 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-b from-card to-muted p-2 shadow-xl">
                <RepoChatIcon className="size-12 rounded-xl" />
              </div>
              <span className="mt-3 font-mono text-[11px] font-semibold text-primary">
                {hasTotal ? `${progress}% Complete` : "Processing..."}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Stepper Stages (~5 columns) */}
        <div className="space-y-4 lg:col-span-5 rounded-xl border border-border bg-card p-5 shadow-xs">
          <h3 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
            Pipeline Stages
          </h3>

          <div className="space-y-3">
            {STAGES.map((s) => {
              const isDone = s.id < activeStageId;
              const isCurrent = s.id === activeStageId;
              const isPending = s.id > activeStageId;

              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-2 transition-colors",
                    isCurrent && "bg-primary/5 border border-primary/20"
                  )}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="size-4 text-primary animate-spin" />
                    ) : (
                      <div className="size-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[10px] text-muted-foreground">
                        {s.id}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-xs font-medium",
                        isDone && "text-foreground",
                        isCurrent && "text-primary font-semibold",
                        isPending && "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Real Progress Bar & Real Stats */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            Indexing Progress
          </span>
          <span className="font-mono text-sm font-bold text-primary">
            {hasTotal ? `${progress}%` : "In Progress"}
          </span>
        </div>

        <Progress
          value={hasTotal ? progress : 15}
          className="h-2.5 bg-muted"
        />

        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4 text-xs">
          <div>
            <div className="text-muted-foreground text-[11px]">Files processed</div>
            <div className="font-mono font-semibold text-foreground mt-0.5">
              {filesProcessed.toLocaleString()} / {hasTotal ? filesTotal.toLocaleString() : "Scanning..."}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-[11px]">Chunks indexed</div>
            <div className="font-mono font-semibold text-foreground mt-0.5">
              {chunkCount.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-[11px]">Default branch</div>
            <div className="font-mono font-semibold text-foreground mt-0.5">
              {repo.defaultBranch}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-[11px]">Status</div>
            <div className="font-mono font-semibold text-primary mt-0.5">
              {indexStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Daemon Status Summary */}
      <div className="mt-6 rounded-xl border border-border bg-[#0d1117] p-4 font-mono text-xs text-slate-300 shadow-md">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-cyan-400" />
            <span>pipeline_status</span>
          </div>
          <span className="text-emerald-400">● ACTIVE</span>
        </div>
        <div className="mt-3 space-y-1 text-[11px] leading-relaxed text-slate-400">
          <div>
            <span className="text-emerald-400">[INFO]</span> Connected to repository:{" "}
            <span className="text-slate-200">{repo.fullName}</span>
          </div>
          <div>
            <span className="text-cyan-400">[METRIC]</span> Processed{" "}
            <span className="text-slate-200">{filesProcessed}</span> files, generating{" "}
            <span className="text-slate-200">{chunkCount}</span> vector chunks into pgvector.
          </div>
          <div className="text-slate-200">
            <span className="text-primary">[STATUS]</span> Pipeline is actively processing. You may leave this page or return to the dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}