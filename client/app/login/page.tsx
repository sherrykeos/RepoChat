"use client";
import React from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";

import { InteractiveGridBackground } from "@/components/landing/interactive-grid-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { getGithubLoginUrl } from '@/lib/api';
import { useCurrentUser } from '@/hooks/use-auth';
import { getSafeRedirectUrl } from '@/lib/safe-redirect';

function LoginLoading(){
    return (
        <div className="flex min-h-svh items-center justify-center">
                <Spinner className="size-8"/>
        </div>
    )
}

const LoginContent = () => {
     const params = useSearchParams();
  const router = useRouter();
  const error = params.get("error");
  const next = params.get("next");
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getSafeRedirectUrl(next, "/dashboard"));
    }
  }, [user, isLoading, next, router]);


  return (
   <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
     <InteractiveGridBackground
              opacity={0.3}             // Base grid opacity (0.0 to 1.0)
              hoverOpacity={0.1}        // Spotlight glow brightness on hover (0.0 to 1.0)
              hoverRadius={190}         // Spotlight radius in pixels (default: 260px)
              hoverScale={1.05}         // Magnification zoom under cursor (1.05 = 5% scaleup)
              hoverColorLight="#2563eb" // Glowing line color in Light mode
              hoverColorDark="#38bdf8"  // Glowing line color in Dark mode (e.g. #38bdf8 cyan, #818cf8 indigo, #34d399 emerald)
              gridSize={40}             // Grid cell size in px (default: 48px / 3rem)
            />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(9,105,218,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(88,166,255,0.1),rgba(13,17,23,0))]" />

      <header className="relative z-10 flex h-14 items-center justify-between px-4">
        <Link href="/">
          <BrandMark />
        </Link>
        <ModeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-sm border-border/70 bg-card/90 shadow-lg shadow-foreground/5 backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
              <GitHubIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription>
                Connect GitHub to chat with your repositories.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Sign-in failed</AlertTitle>
                <AlertDescription>Please try again.</AlertDescription>
              </Alert>
            )}

            <a
              href={getGithubLoginUrl()}
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex w-full items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90"
              )}
            >
              <GitHubIcon className="size-5" />
              Continue with GitHub
            </a>
          </CardContent>
        </Card>
      </main>
    
          {/* Massive Typographic Wordmark Base (COSMOS Inspired, Clean & Elegant) */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none pt-2">
        <div className="flex items-baseline justify-center w-full px-2 z-0">
          <span className="font-heading text-[15.5vw] font-black uppercase tracking-[-0.04em] text-slate-200/90 dark:text-slate-800/30 leading-[0.76] block text-center transition-all animate-wordmark-breath">
            REPOCHAT
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}