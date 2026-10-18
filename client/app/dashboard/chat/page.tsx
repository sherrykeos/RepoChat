"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRepos } from "@/hooks/use-repos";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardChatRedirect() {
  const router = useRouter();
  const reposQuery = useRepos();

  useEffect(() => {
    if (reposQuery.isLoading) return;
    const repos = reposQuery.data ?? [];
    if (repos.length === 0) {
      router.replace("/dashboard");
      return;
    }
    const readyRepo = repos.find((r) => r.indexStatus === "READY") || repos[0];
    router.replace(`/chat/${readyRepo.id}`);
  }, [reposQuery.data, reposQuery.isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-4" />
        <span>Loading workspace...</span>
      </div>
    </div>
  );
}
