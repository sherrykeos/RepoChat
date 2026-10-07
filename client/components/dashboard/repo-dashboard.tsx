"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FolderGit2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { RepoCard } from "@/components/dashboard/repo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshRepos, useRepos } from "@/hooks/use-repos";
import type { IndexStatus, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

type FilterStatus = "ALL" | IndexStatus | "NOT_INDEXED";

export function RepoDashboard() {
  const reposQuery = useRepos();
  const refresh = useRefreshRepos();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("recent");

  const rawRepos: Repository[] = reposQuery.data ?? [];

  // Extract unique languages from real repositories
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    rawRepos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [rawRepos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rawRepos
      .filter((repo) => {
        // Status filter
        if (status === "READY") {
          if (repo.indexStatus !== "READY") return false;
        } else if (status === "INDEXING") {
          if (repo.indexStatus !== "INDEXING") return false;
        } else if (status === "NOT_INDEXED" || status === "PENDING") {
          if (repo.indexStatus !== "PENDING" && repo.indexStatus !== "FAILED") return false;
        }

        // Language filter
        if (selectedLanguage !== "All" && repo.language !== selectedLanguage) {
          return false;
        }

        // Search query
        if (!q) return true;
        return (
          repo.fullName.toLowerCase().includes(q) ||
          (repo.description ?? "").toLowerCase().includes(q) ||
          (repo.language ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortOption === "chunks") {
          return b.chunkCount - a.chunkCount;
        }
        // Default: most recently indexed or updated
        const aTime = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
        const bTime = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [rawRepos, search, status, selectedLanguage, sortOption]);

  // Dynamically calculate statistics from actual repository collection
  const totalCount = rawRepos.length;
  const readyCount = rawRepos.filter((r) => r.indexStatus === "READY").length;
  const indexingCount = rawRepos.filter((r) => r.indexStatus === "INDEXING").length;
  const notIndexedCount = rawRepos.filter(
    (r) => r.indexStatus === "PENDING" || r.indexStatus === "FAILED"
  ).length;

  return (
    <div className="flex min-h-full flex-col p-6 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header: Title, Subtitle, Sync/Add Repository */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Repositories
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Connect, index, and chat with your GitHub repositories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || reposQuery.isFetching}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (refresh.isPending || reposQuery.isFetching) && "animate-spin"
              )}
            />
            Sync GitHub
          </Button>

          <Button
            size="sm"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || reposQuery.isFetching}
            className="h-8 gap-1.5 rounded-md bg-[#1f2328] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2c3138] dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3]"
          >
            <Plus className="size-3.5" />
            Add Repository
          </Button>
        </div>
      </div>

      {/* Dynamic Statistics Row (Derived entirely from real repository data) */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Card 1: Total Repositories */}
        <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderGit2 className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{totalCount}</div>
            <div className="text-xs text-muted-foreground">Repositories</div>
          </div>
        </div>

        {/* Card 2: Indexed */}
        <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{readyCount}</div>
            <div className="text-xs text-muted-foreground">Indexed</div>
          </div>
        </div>

        {/* Card 3: Indexing */}
        <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{indexingCount}</div>
            <div className="text-xs text-muted-foreground">Indexing</div>
          </div>
        </div>

        {/* Card 4: Not Indexed */}
        <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{notIndexedCount}</div>
            <div className="text-xs text-muted-foreground">Not Indexed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="h-8 border-border bg-background pl-8 text-xs focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL" as FilterStatus, label: "All" },
            { id: "READY" as FilterStatus, label: "Indexed" },
            { id: "INDEXING" as FilterStatus, label: "Indexing" },
            { id: "NOT_INDEXED" as FilterStatus, label: "Not Indexed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatus(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                status === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdowns: Real Languages and Sort */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Filter by programming language"
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">Language: All</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort repositories"
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="recent">Sort: Recently Indexed</option>
            <option value="chunks">Sort: Most Chunks</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Main Repositories Grid or Empty States */}
      <div className="mt-6 flex-1">
        {reposQuery.isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        )}

        {reposQuery.isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <h3 className="mt-3 font-heading text-sm font-semibold text-foreground">
              Failed to load repositories
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {(reposQuery.error as Error)?.message || "Please check your network connection or session."}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => reposQuery.refetch()}
              className="mt-4 text-xs"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Real Empty State: User has zero connected repositories */}
        {reposQuery.isSuccess && rawRepos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted border border-border">
              <FolderGit2 className="size-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
              Your codebase workspace is empty
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Connect a GitHub repository to start asking questions, exploring architecture, and searching your code.
            </p>
            <Button
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
              className="mt-6 gap-2 rounded-md bg-[#1f2328] text-white hover:bg-[#2c3138] dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3]"
            >
              <RefreshCw className={cn("size-3.5", refresh.isPending && "animate-spin")} />
              Sync GitHub Repositories
            </Button>
          </div>
        )}

        {/* Search/filter empty state: Repositories exist but filter returned 0 */}
        {reposQuery.isSuccess && rawRepos.length > 0 && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <FolderGit2 className="mx-auto size-8 text-muted-foreground/60" />
            <h3 className="mt-3 font-heading text-sm font-semibold text-foreground">
              No matching repositories found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search query or status filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatus("ALL");
                setSelectedLanguage("All");
              }}
              className="mt-4 text-xs"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Real Repositories Cards */}
        {reposQuery.isSuccess && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}