"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileCode,
  FolderTree,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRepository } from "@/hooks/use-repos";

export function CodeExplorer({
  repoId,
  selectedFilePath,
}: {
  repoId?: string;
  selectedFilePath?: string;
}) {
  const router = useRouter();
  const repoQuery = useRepository(repoId ?? "");
  const repo = repoQuery.data;

  const [activeFile, setActiveFile] = useState<string | null>(selectedFilePath ?? null);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col overflow-hidden bg-background">
      {/* Top action bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Repository Explorer</span>
          {repo && (
            <>
              <span>·</span>
              <span className="text-foreground">{repo.fullName}</span>
            </>
          )}
        </div>

        {repo?.htmlUrl && (
          <Button
            size="sm"
            variant="outline"
            render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
            className="h-7 text-xs font-medium gap-1.5"
          >
            <ExternalLink className="size-3" />
            <span>Open on GitHub</span>
          </Button>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 items-center justify-center p-8 bg-card/20">
        <div className="flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-xs">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted border border-border">
            <FolderTree className="size-7 text-primary" />
          </div>

          <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
            {activeFile ? activeFile : "Select a file to inspect"}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {activeFile
              ? `Inspecting ${activeFile} from ${repo?.fullName ?? "repository"}. You can ask questions grounded in this file.`
              : "Full recursive file browsing is currently available directly on GitHub. As you chat, referenced files will be linkable here."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {repo && (
              <Button
                size="sm"
                onClick={() =>
                  router.push(
                    `/chat/${repo.id}${
                      activeFile ? `?prompt=Explain the file ${activeFile}` : ""
                    }`
                  )
                }
                className="gap-1.5 rounded-md bg-[#1f2328] text-white hover:bg-[#2c3138] dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3] text-xs h-8"
              >
                <MessageSquare className="size-3.5" />
                <span>Chat about this repository</span>
              </Button>
            )}

            {repo?.htmlUrl && (
              <Button
                size="sm"
                variant="outline"
                render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
                className="gap-1.5 text-xs h-8"
              >
                <ExternalLink className="size-3.5" />
                <span>Browse Files on GitHub</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
