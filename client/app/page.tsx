"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Code2,
  Folder,
  LayoutDashboard,
  LogOut,
  MessageSquareCode,
  Settings,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";

import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { GitHubIcon } from "@/components/icons/github-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { AppMockupPreview } from "@/components/landing/app-mockup-preview";
import { FeaturesSection } from "@/components/landing/features-section";
import { CallToActionCard } from "@/components/landing/cta-card";
import { LandingFooter } from "@/components/landing/footer";
import { InteractiveGridBackground } from "@/components/landing/interactive-grid-background";
import Lightfall from "@/components/ui/lightfall";
import GhostFibers from "@/components/ui/GhostFibers";
import { getGithubLoginUrl } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen bg-[#f8f9fa] text-slate-900 overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
      {/* Hero Section Background: React Bits Lightfall */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] w-full overflow-hidden z-0">
        {/* <Lightfall
          colors={
            isDark
              ? ["#58a6ff", "#818cf8", "#c084fc", "#38bdf8"]
              : ["#1d4ed8", "#4338ca", "#7e22ce", "#0284c7"]
          }
          backgroundColor={isDark ? "#010409" : "#010409"}
          speed={0.2}
          streakCount={3}
          streakWidth={0.1}
          streakLength={1}
          density={0.5}
          twinkle={0.2}
          backgroundGlow={0.2}
          headGlow={0.9}
          glow={2.2}
          bloom={0.4}
          opacity={1}
          lightMode={!isDark}
          mouseInteraction
          holdToWarp
          intro
        /> */}
        <GhostFibers
          glowColor="#3b82f6"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro
          mouseInteraction
          lineColor="#dfd1fc"
          secondaryColor="#3b82f6"
          gradient="depth"
          waves={1}
          volume={0.7}
          spread={1}
          scale={1}
          rotation={18}
          perspective={0.65}
          density={1}
          thickness={1}
          tips={0}
          foldGlow={1}
          speed={0.5}
          flow={0.4}
          rollSpeed={0.15}
          focusDepth={0}
          particles={0.5}
          sparkle={0.5}
          glow={0.8}
          brightness={1}
          vignette={0.3}
          grain={0.06}
          mouseStrength={1}
          pulseOnClick
          lightMode={false}
        />
        {/* Soft bottom fade into page background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f8f9fa] to-transparent dark:from-slate-950" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full dark:border-slate-800/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <RepoChatIcon className="size-8" />
            <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              RepoChat
            </span>
          </Link>


          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 py-1 pl-1 pr-2.5 text-xs font-medium text-slate-800 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 outline-none cursor-pointer active:scale-95">
                  <Avatar className="size-6.5 rounded-full border border-slate-200/80 dark:border-slate-700">
                    <AvatarImage
                      src={user.avatarUrl ?? undefined}
                      alt={user.githubUsername || user.displayName}
                    />
                    <AvatarFallback className="rounded-full bg-blue-500/10 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      {(user.displayName || user.githubUsername || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-slate-900 dark:text-white max-w-[130px] truncate">
                    {user.githubUsername || user.displayName}
                  </span>
                  <ChevronDown className="size-3 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-52 rounded-xl p-1 shadow-lg border-slate-200/90 dark:border-slate-800"
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2.5 py-1.5 font-normal">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {user.displayName || user.githubUsername}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          @{user.githubUsername}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="cursor-pointer gap-2"
                  >
                    <LayoutDashboard className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Go to Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                    className="cursor-pointer gap-2"
                  >
                    <Settings className="size-3.5 text-slate-500" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <LogOut className="size-3.5" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a
                href={getGithubLoginUrl()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#1e293b] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                <GitHubIcon className="size-4" />
                <span>Sign in</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Container (No Blueprint Grid) */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        {/* Centered Hero Header */}
        <div className="flex flex-col items-center text-center">
          {/* Top Announcement Pill Badge with Shimmer Sweep */}
          <div className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-slate-300/90 bg-white/90 px-3 py-1.5 sm:px-4 text-[11px] sm:text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-700 animate-fade-in-up max-w-full">
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/15 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Sparkles className="size-3.5 text-blue-500 shrink-0 animate-pulse" />
            <span className="truncate sm:overflow-visible">Turn any Github Repository into a Conversation</span>
          </div>

          {/* Main Headline with Animated Gradient Flow */}
          <h1 className="mt-7 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] animate-fade-in-up [animation-duration:800ms] [animation-delay:150ms]">
            Your codebase, <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-[length:200%_auto] animate-gradient-text bg-clip-text text-transparent inline-block">
              now speaks.
            </span>
          </h1>

          {/* Supporting Subtext */}
          <p className="mt-4 max-w-2xl text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in-up [animation-duration:800ms] [animation-delay:300ms]">
            RepoChat helps you understand, explore, and navigate any GitHub repository
            using AI. Ask questions, find code, and get clear answers with references
            to the actual source files.
          </p>

          {/* Main CTA with Button Hover & Micro-interactions */}
          <div className="mt-8 flex flex-col items-center w-full sm:w-auto animate-fade-in-up [animation-duration:800ms] [animation-delay:450ms]">
            {user ? (
              <Link
                href="/dashboard"
                className="group/btn relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#1e293b] hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 cursor-pointer w-full sm:w-auto"
              >
                <LayoutDashboard className="size-4 text-blue-400 dark:text-blue-600 transition-transform duration-300 group-hover/btn:rotate-12" />
                <span>Go to Dashboard</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            ) : (
              <a
                href={getGithubLoginUrl()}
                className="group/btn relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#1e293b] hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 cursor-pointer w-full sm:w-auto"
              >
                <GitHubIcon className="size-4 transition-transform duration-300 group-hover/btn:scale-110" />
                <span>Continue with GitHub</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </a>
            )}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {user ? "Welcome back" : "Try it now • its free"}
            </p>
          </div>
        </div>

        {/* Feature Highlights (Small Compact Glassmorphic Boxes with Staggered Hover Micro-Animations) */}
        <div className="mx-auto mt-8 max-w-3xl px-2 animate-fade-in-up [animation-duration:800ms] [animation-delay:600ms]">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="group relative flex items-start gap-2.5 rounded-xl border border-white/80 bg-white/70 p-2.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/80 hover:bg-white hover:shadow-[0_8px_20px_-4px_rgba(59,130,246,0.12)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-blue-500/40 dark:hover:bg-slate-900/90 cursor-default">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-blue-200/50 bg-blue-500/10 text-blue-600 transition-transform duration-300 ease-out group-hover:scale-115 group-hover:rotate-6 dark:border-blue-800/40 dark:bg-blue-950/60 dark:text-blue-400">
                <MessageSquareCode className="size-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Ask anything
                </h3>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                  Answers on architecture, code, and logic.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative flex items-start gap-2.5 rounded-xl border border-white/80 bg-white/70 p-2.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-300/80 hover:bg-white hover:shadow-[0_8px_20px_-4px_rgba(168,85,247,0.12)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-purple-500/40 dark:hover:bg-slate-900/90 cursor-default">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-purple-200/50 bg-purple-500/10 text-purple-600 transition-transform duration-300 ease-out group-hover:scale-115 group-hover:rotate-6 dark:border-purple-800/40 dark:bg-purple-950/60 dark:text-purple-400">
                <Code2 className="size-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Source references
                </h3>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                  See exact files and line numbers used.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative flex items-start gap-2.5 rounded-xl border border-white/80 bg-white/70 p-2.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/80 hover:bg-white hover:shadow-[0_8px_20px_-4px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-sky-500/40 dark:hover:bg-slate-900/90 cursor-default">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sky-200/50 bg-sky-500/10 text-sky-600 transition-transform duration-300 ease-out group-hover:scale-115 group-hover:rotate-6 dark:border-sky-800/40 dark:bg-sky-950/60 dark:text-sky-400">
                <Folder className="size-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  Explore faster
                </h3>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                  Navigate files, functions, and systems.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative flex items-start gap-2.5 rounded-xl border border-white/80 bg-white/70 p-2.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300/80 hover:bg-white hover:shadow-[0_8px_20px_-4px_rgba(99,102,241,0.12)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-indigo-500/40 dark:hover:bg-slate-900/90 cursor-default">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-indigo-200/50 bg-indigo-500/10 text-indigo-600 transition-transform duration-300 ease-out group-hover:scale-115 group-hover:rotate-6 dark:border-indigo-800/40 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Sparkles className="size-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  For developers
                </h3>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                  Built for real codebases, not just docs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post-Hero Interactive Blueprint Grid Section (Spans all middle content until Footer) */}
      <main className="relative w-full isolate z-0">
        {/* Interactive Blueprint Grid with Cursor Glow & Subtle Magnification */}
        <InteractiveGridBackground
          opacity={0.2}             // Base grid opacity (0.0 to 1.0)
          hoverOpacity={0.1}        // Spotlight glow brightness on hover (0.0 to 1.0)
          hoverRadius={190}         // Spotlight radius in pixels (default: 260px)
          hoverScale={1.05}         // Magnification zoom under cursor (1.05 = 5% scaleup)
          hoverColorLight="#2563eb" // Glowing line color in Light mode
          hoverColorDark="#38bdf8"  // Glowing line color in Dark mode (e.g. #38bdf8 cyan, #818cf8 indigo, #34d399 emerald)
          gridSize={40}             // Grid cell size in px (default: 48px / 3rem)
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          {/* Product Preview Mockup */}
          <section className="mt-4">
            <AppMockupPreview />
          </section>

          {/* Feature Section */}
          <FeaturesSection />

          {/* Call To Action Card */}
          <CallToActionCard />
        </div>
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}