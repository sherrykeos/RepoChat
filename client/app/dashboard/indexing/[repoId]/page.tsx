"use client";

import { use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { IndexingState } from "@/components/chat/indexing-state";
import { useRepository, useIndexStatus } from "@/hooks/use-repos";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function IndexingProgressPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = use(params);
  const repoQuery = useRepository(repoId);
  const statusQuery = useIndexStatus(repoId, true);

  if (repoQuery.isLoading) {
    return (
      <AppShell title="Indexing Progress">
        <div className="p-8 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (repoQuery.isError || !repoQuery.data) {
    return (
      <AppShell title="Repository Unavailable">
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Repository could not be found.
          </p>
          <Button className="mt-4" render={<Link href="/dashboard" />}>
            Back to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  const repo = repoQuery.data;

  return (
    <AppShell title="Indexing Progress" description={repo.fullName}>
      <IndexingState repo={repo} status={statusQuery.data} />
    </AppShell>
  );
}
