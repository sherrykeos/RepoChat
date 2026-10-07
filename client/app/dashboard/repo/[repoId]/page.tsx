"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RepoOverview } from "@/components/repository/repo-overview";

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = use(params);

  return (
    <AppShell hideHeader>
      <RepoOverview repoId={repoId} />
    </AppShell>
  );
}
