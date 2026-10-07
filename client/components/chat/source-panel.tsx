"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileCode, FolderTree, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Citation, Repository } from "@/lib/api";
import { citationHref } from "@/components/chat/citation-chips";

export function SourcePanel({
  repo,
  citations,
}: {
  repo: Repository;
  citations: Citation[];
}) {
  const router = useRouter();

  return (
    <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-l border-border bg-card/60 shrink-0">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <h3 className="font-heading text-xs font-semibold text-foreground">
          Sources ({citations.length})
        </h3>
        {citations.length > 0 && (
          <span className="text-[11px] text-muted-foreground font-mono">
            Grounded
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {citations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground my-auto">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted border border-border">
              <Sparkles className="size-4 opacity-50" />
            </div>
            <h4 className="mt-3 font-heading text-xs font-semibold text-foreground">
              No sources for this response
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed">
              When the assistant retrieves code chunks from your repository, file citations and line numbers will appear here.
            </p>
          </div>
        ) : (
          citations.map((cit, idx) => {
            const fileName = cit.filePath.split("/").pop() || cit.filePath;
            const lineRange =
              cit.startLine != null
                ? `Lines ${cit.startLine}–${cit.endLine ?? cit.startLine}`
                : "Entire file";

            return (
              <div
                key={`${cit.filePath}-${idx}`}
                className="group rounded-xl border border-border bg-card p-3 shadow-2xs transition-all hover:border-foreground/20 hover:shadow-xs"
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
                    className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="mt-2 text-[11px] font-mono text-muted-foreground truncate" title={cit.filePath}>
                  {cit.filePath}
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
                    {lineRange}
                  </span>
                  {cit.language && (
                    <span className="font-mono text-[10px] uppercase text-primary">
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
          className="w-full justify-center text-xs font-medium"
          onClick={() => router.push(`/dashboard/explore?repo=${repo.id}`)}
        >
          <FolderTree className="mr-2 size-3.5 text-primary" />
          Open in File Explorer
        </Button>
      </div>
    </aside>
  );
}
