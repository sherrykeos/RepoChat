"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  FolderGit2,
  Grid,
  List,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { RepoCard } from "@/components/dashboard/repo-card";
import { Button } from "@/components/ui/button";
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRefreshRepos, useRepos } from "@/hooks/use-repos";
import type { IndexStatus, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

type FilterStatus = "ALL" | IndexStatus | "NOT_INDEXED";
export type RepoScope = "all" | "native" | "other";

export function RepoDashboard() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") as FilterStatus | null;
  const langParam = searchParams.get("language");
  const scopeParam = searchParams.get("scope") as RepoScope | null;

  const { data: user } = useCurrentUser();
  const reposQuery = useRepos();
  const refresh = useRefreshRepos();

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<RepoScope>(scopeParam || "all");
  const [status, setStatus] = useState<FilterStatus>(statusParam || "ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(langParam || "All");
  const [sortOption, setSortOption] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (statusParam) setStatus(statusParam);
    if (langParam) setSelectedLanguage(langParam);
    if (scopeParam) setScope(scopeParam);
  }, [statusParam, langParam, scopeParam]);

  const rawRepos: Repository[] = reposQuery.data ?? [];

  const isOwn = (r: Repository) =>
    Boolean(user?.githubUsername && r.owner.toLowerCase() === user.githubUsername.toLowerCase());

  // Extract unique languages from real repositories
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    rawRepos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [rawRepos]);

  // Actual filtering and sorting
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rawRepos
      .filter((repo) => {
        // Scope filter: Native (own), Other (shared), All (both)
        if (scope === "native" && !isOwn(repo)) return false;
        if (scope === "other" && isOwn(repo)) return false;

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
          repo.name.toLowerCase().includes(q) ||
          repo.owner.toLowerCase().includes(q) ||
          (repo.description ?? "").toLowerCase().includes(q) ||
          (repo.language ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOption === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortOption === "recent_added") {
          return b.githubRepoId - a.githubRepoId;
        }
        // Default: most recently indexed
        const aTime = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
        const bTime = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [rawRepos, search, scope, status, selectedLanguage, sortOption, user?.githubUsername]);

  // Dynamic statistics
  const totalCount = rawRepos.length;
  const nativeCount = rawRepos.filter(isOwn).length;
  const otherCount = rawRepos.filter((r) => !isOwn(r)).length;

  const scopeLabel =
    scope === "all" ? "All" : scope === "native" ? "Native" : "Other";
  const scopeCount =
    scope === "all" ? totalCount : scope === "native" ? nativeCount : otherCount;

  const readyCount = rawRepos.filter((r) => r.indexStatus === "READY").length;
  const indexingCount = rawRepos.filter((r) => r.indexStatus === "INDEXING").length;
  const notIndexedCount = rawRepos.filter(
    (r) => r.indexStatus === "PENDING" || r.indexStatus === "FAILED"
  ).length;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header: Title, Subtitle, Right-side Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Repositories
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Your connected codebases, ready to explore.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || reposQuery.isFetching}
            className="h-8 gap-1.5 border-border bg-card text-foreground hover:bg-muted text-xs font-medium"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (refresh.isPending || reposQuery.isFetching) && "animate-spin"
              )}
            />
            <span>Sync GitHub</span>
          </Button>

          <Button
            size="sm"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || reposQuery.isFetching}
            className="h-8 gap-1.5 bg-[#2f81f7] hover:bg-[#388bfd] text-white text-xs font-medium px-3.5 shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Repository</span>
          </Button>
        </div>
      </div>

      {/* 2. Compact Toolbar: Search, Status Filter Pills, Language, Sort, Layout Toggle */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Pills with dynamic counts */}
        <div className="flex flex-wrap items-center gap-1">
          {/* "All" button as a dropdown containing All, Native, Other */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors select-none cursor-pointer",
                    status === "ALL"
                      ? "bg-primary/10 text-primary border border-primary/40 font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  )}
                />
              }
            >
              <span>{scopeLabel}</span>
              <ChevronDown className="size-3 opacity-70" />
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  status === "ALL"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {scopeCount}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl z-50"
            >
              <DropdownMenuItem
                onClick={() => {
                  setScope("all");
                  setStatus("ALL");
                }}
                className={cn(
                  "flex items-center justify-between text-xs cursor-pointer rounded px-2 py-1.5",
                  scope === "all"
                    ? "bg-muted text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span>All Repositories</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  {totalCount}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setScope("native");
                  setStatus("ALL");
                }}
                className={cn(
                  "flex items-center justify-between text-xs cursor-pointer rounded px-2 py-1.5",
                  scope === "native"
                    ? "bg-muted text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span>Native (Own)</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  {nativeCount}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setScope("other");
                  setStatus("ALL");
                }}
                className={cn(
                  "flex items-center justify-between text-xs cursor-pointer rounded px-2 py-1.5",
                  scope === "other"
                    ? "bg-muted text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span>Other (Shared)</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  {otherCount}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter Pills */}
          {[
            { id: "READY" as FilterStatus, label: "Indexed", count: readyCount },
            { id: "INDEXING" as FilterStatus, label: "Indexing", count: indexingCount },
            { id: "NOT_INDEXED" as FilterStatus, label: "Not Indexed", count: notIndexedCount },
          ].map((pill) => {
            const active = status === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setStatus(pill.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors select-none",
                  active
                    ? "bg-primary/10 text-primary border border-primary/40 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                <span>{pill.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls: Language, Sort, Grid/List view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language filter */}
          <CustomSelectDropdown
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            prefix="Language: "
            options={[
              { value: "All", label: "All" },
              ...availableLanguages.map((lang) => ({ value: lang, label: lang })),
            ]}
          />

          {/* Sort dropdown */}
          <CustomSelectDropdown
            value={sortOption}
            onChange={setSortOption}
            prefix="Sort: "
            options={[
              { value: "recent", label: "Recently Indexed" },
              { value: "recent_added", label: "Recently Added" },
              { value: "name", label: "Name" },
            ]}
          />

          {/* Grid / List toggle */}
          <div className="flex items-center rounded-md border border-border bg-background p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1 rounded text-xs transition-colors",
                viewMode === "grid"
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
              aria-label="Grid View"
            >
              <Grid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1 rounded text-xs transition-colors",
                viewMode === "list"
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
              aria-label="List View"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Repositories Collection */}
      <div className="space-y-4">
        {reposQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {reposQuery.isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center space-y-3">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">
              Unable to load repositories
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {(reposQuery.error as Error)?.message ||
                "Failed to communicate with GitHub. Check your connection or reconnect your account."}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refresh.mutate()}
              className="h-8 border-border text-xs"
            >
              Try Again
            </Button>
          </div>
        )}

        {!reposQuery.isLoading && !reposQuery.isError && (
          <>
            {/* If user has 0 repositories at all */}
            {totalCount === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
                <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  No repositories connected yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Connect a GitHub repository to start exploring your codebase.
                </p>
                <Button
                  size="sm"
                  onClick={() => refresh.mutate()}
                  className="mt-2 h-8 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Repository</span>
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              /* If search/filter returns 0 results */
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">
                  No repositories match your filters
                </p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search query, status, or language selection.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setScope("all");
                    setStatus("ALL");
                    setSelectedLanguage("All");
                  }}
                  className="mt-2 h-7 border-border text-xs"
                >
                  Reset Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              /* Card Grid Mode (2 to 3 columns) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} viewMode="grid" />
                ))}
              </div>
            ) : (
              /* Card List Mode */
              <div className="flex flex-col gap-2.5">
                {filtered.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} viewMode="list" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}