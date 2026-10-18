"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileCode, FolderTree, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Citation, Repository } from "@/lib/api";
import { citationHref } from "@/components/chat/citation-chips";
import { cn } from "@/lib/utils";

export function SourcePanel({
  repo,
  citations,
  className,
}: {
  repo: Repository;
  citations: Citation[];
  className?: string;
}) {
  const router = useRouter();

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden select-none",
        className
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h3 className="font-heading text-xs font-semibold text-foreground">
          Sources ({citations.length})
        </h3>
        {citations.length > 0 && (
          <span className="text-[10px] text-[#3fb950] font-mono bg-[#3fb950]/10 px-1.5 py-0.5 rounded">
            Grounded
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {citations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground my-auto">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted border border-border">
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <h4 className="mt-3 font-heading text-xs font-semibold text-foreground">
              No sources for this response
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              When the assistant retrieves code chunks from your repository, file citations and line numbers will appear here.
            </p>
          </div>
        ) : (
          citations.map((cit, idx) => {
            const fileName = cit.filePath.split("/").pop() || cit.filePath;
            const lineRange =
              cit.startLine != null
                ? `L${cit.startLine}–${cit.endLine ?? cit.startLine}`
                : "Full file";

            return (
              <div
                key={`${cit.filePath}-${idx}`}
                onClick={() =>
                  router.push(
                    `/dashboard/explore?repo=${repo.id}&file=${encodeURIComponent(cit.filePath)}`
                  )
                }
                className="group rounded-xl border border-border bg-card p-3 transition-all duration-150 hover:border-primary/50 cursor-pointer shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileCode className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {fileName}
                      </h4>
                    </div>
                  </div>
                  <a
                    href={citationHref(repo, cit)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div
                  className="text-[11px] font-mono text-muted-foreground truncate"
                  title={cit.filePath}
                >
                  {cit.filePath}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 border border-border font-mono text-primary">
                    {lineRange}
                  </span>
                  {cit.language && (
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">
                      {cit.language}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center text-xs font-medium border-border bg-card text-foreground hover:bg-muted gap-2 h-8"
          onClick={() => router.push(`/dashboard/explore?repo=${repo.id}`)}
        >
          <FolderTree className="size-3.5 text-primary" />
          <span>Open in Explorer</span>
        </Button>
      </div>
    </aside>
  );
}
