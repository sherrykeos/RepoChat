"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExploreWorkspace } from "@/components/explorer/explore-workspace";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="space-y-3 text-center">
            <Skeleton className="size-12 rounded-xl mx-auto bg-muted" />
            <Skeleton className="h-4 w-48 mx-auto bg-muted" />
          </div>
        </div>
      }
    >
      <AppShell hideHeader>
        <ExploreWorkspace />
      </AppShell>
    </Suspense>
  );
}
