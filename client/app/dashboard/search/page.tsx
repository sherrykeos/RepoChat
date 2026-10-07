"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SearchView } from "@/components/search/search-view";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <AppShell title="Search" description="Semantic and keyword search across your indexed codebase">
      <SearchView initialQuery={query} />
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
