"use client";

import React from "react";
import { BookOpen, ExternalLink, X } from "lucide-react";
import { RepoReadmeCard } from "@/components/repository/repo-readme-card";
import { Button } from "@/components/ui/button";
import type { Repository } from "@/lib/api";

export function RepoReadmeModal({
  repo,
  open,
  onClose,
  onOpenChange,
}: {
  repo: Repository;
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  if (!open) return null;

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="size-4 text-primary shrink-0" />
            <span className="font-heading text-sm font-semibold text-foreground truncate">
              {repo.fullName} — README.md
            </span>
          </div>

          <div className="flex items-center gap-2">
            {repo.htmlUrl && (
              <Button
                variant="outline"
                size="sm"
                render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
                className="h-7 px-2 text-xs border-border gap-1 hidden sm:inline-flex"
              >
                <ExternalLink className="size-3" />
                <span>GitHub</span>
              </Button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
          <RepoReadmeCard repo={repo} showFullHeight className="border-0 shadow-none bg-transparent" />
        </div>
      </div>
    </div>
  );
}
