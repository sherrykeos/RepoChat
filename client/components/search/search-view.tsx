"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCode,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<"All" | "Files" | "Symbols" | "Content">("All");
  const [language, setLanguage] = useState("All");

  const hasSearched = query.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6 sm:p-8">
      {/* Top Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Search
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Semantic and keyword search across your indexed codebase.
        </p>
      </div>

      {/* Search Input and Filter Bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, functions, symbols, or topics..."
            className="h-10 border-border bg-background pl-9 text-xs sm:text-sm focus:ring-1 focus:ring-primary font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", "Files", "Symbols", "Content"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  filterType === t
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Filter search by language"
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">Language: All</option>
              <option value="Java">Java</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results or Clean Empty State */}
      <div className="mt-8 flex-1">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center my-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted border border-border">
              <Search className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold text-foreground">
              Search your codebase
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Type a function name, file path, or question above to search through your connected repositories.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center my-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted border border-border">
              <FileCode className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold text-foreground">
              Direct symbol search is coming soon
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              Semantic retrieval is currently integrated through RepoChat Chat. You can ask questions about &quot;{query}&quot; directly in the chat interface.
            </p>
            <Button
              className="mt-6 gap-2 rounded-md bg-[#1f2328] text-white hover:bg-[#2c3138] dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3]"
              onClick={() => router.push(`/dashboard/chat`)}
            >
              <MessageSquare className="size-3.5" />
              <span>Ask in RepoChat Chat</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
