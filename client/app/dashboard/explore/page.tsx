"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CodeExplorer } from "@/components/explorer/code-explorer";
import { ArchitectureView } from "@/components/architecture/architecture-view";
import { useRepos } from "@/hooks/use-repos";
import { FileCode, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "architecture" ? "architecture" : "files";
  const repoParam = searchParams.get("repo");
  const fileParam = searchParams.get("file") || undefined;
  
  const reposQuery = useRepos();
  const repos = reposQuery.data ?? [];
  const activeRepoId = repoParam || (repos.length > 0 ? repos[0].id : "");

  const [activeView, setActiveView] = useState<"files" | "architecture">(initialTab);

  return (
    <AppShell
      title="Codebase Explorer"
      description="Inspect source files, AI explanations, and architectural topologies"
      actions={
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          <button
            onClick={() => setActiveView("files")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeView === "files"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode className="size-3.5" />
            <span>Files & Code</span>
          </button>
          <button
            onClick={() => setActiveView("architecture")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeView === "architecture"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="size-3.5" />
            <span>Architecture</span>
          </button>
        </div>
      }
    >
      <div className="flex-1 overflow-hidden">
        {activeView === "files" ? (
          <CodeExplorer repoId={activeRepoId} selectedFilePath={fileParam} />
        ) : (
          <ArchitectureView repoId={activeRepoId} />
        )}
      </div>
    </AppShell>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading explorer...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
