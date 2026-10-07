"use client";

import Link from "next/link";
import {
  FileText,
  FolderGit2,
  GitBranch,
  Layers,
  MessageSquareCode,
  Play,
  Search,
  Sparkles,
} from "lucide-react";

import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { GitHubIcon } from "@/components/icons/github-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { HeroVisualization } from "@/components/landing/hero-visualization";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGithubLoginUrl } from "@/lib/api";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Soft atmospheric gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(9,105,218,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(88,166,255,0.1),rgba(13,17,23,0))]" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <RepoChatIcon className="size-7 rounded-lg" />
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              RepoChat
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden items-center gap-7 text-xs font-medium text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#docs" className="transition-colors hover:text-foreground">
              Docs
            </a>
            <a href="#blog" className="transition-colors hover:text-foreground">
              Blog
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            <a
              href={getGithubLoginUrl()}
              className="inline-flex items-center gap-2 rounded-md bg-[#1f2328] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2c3138] dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3]"
            >
              <GitHubIcon className="size-3.5" />
              <span>Sign in with GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Hero Content (~45-50% / 5-6 columns) */}
          <div className="flex flex-col items-start lg:col-span-6 xl:col-span-5">
            {/* Open Source Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <span>⬡</span> Open Source
              </span>
              <span className="h-3 w-px bg-border" />
              <span>Turn any GitHub repository into a conversation</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              Your codebase, <br />
              <span className="bg-gradient-to-r from-[#0969da] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent dark:from-[#58a6ff] dark:via-[#818cf8] dark:to-[#a371f7]">
                now speaks.
              </span>
            </h1>

            {/* Supporting Subtext */}
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Clone. Index. Ask. Explore any GitHub repository with AI. Understand
              architecture, find code, debug problems, and navigate faster.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={getGithubLoginUrl()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1f2328] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2c3138] hover:shadow-md dark:bg-[#f0f6fc] dark:text-[#0d1117] dark:hover:bg-[#e6edf3]"
              >
                <GitHubIcon className="size-4" />
                <span>Get Started Free</span>
              </a>

              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "inline-flex items-center gap-2 rounded-lg border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                )}
              >
                <Play className="size-3.5 fill-current opacity-70" />
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Trust Subtext */}
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Free for open source
            </p>
          </div>

          {/* Right Hero Special Visualization (~50-55% / 6-7 columns) */}
          <div className="relative lg:col-span-6 xl:col-span-7">
            <HeroVisualization />
          </div>
        </div>

        {/* Feature Strip (4 cards matching the reference) */}
        <section id="features" className="mt-20 border-t border-border/80 pt-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Repository Q&A",
                desc: "Ask anything about your code",
                icon: MessageSquareCode,
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                title: "Source Citations",
                desc: "See exact files and code references",
                icon: FileText,
                color: "text-indigo-500 bg-indigo-500/10",
              },
              {
                title: "Architecture Insights",
                desc: "Understand complex systems",
                icon: Layers,
                color: "text-violet-500 bg-violet-500/10",
              },
              {
                title: "Smart Search",
                desc: "Find files, functions, and logic",
                icon: Search,
                color: "text-sky-500 bg-sky-500/10",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-foreground/20 hover:shadow-md"
              >
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", f.color)}>
                  <f.icon className="size-4" />
                </div>
                <div>
                  <h3 className="font-heading text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}