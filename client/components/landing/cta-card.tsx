"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, CornerDownLeft, Sparkles, Terminal } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { getGithubLoginUrl } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-auth";

export function CallToActionCard() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [repoInput, setRepoInput] = useState("");

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Ambient background glow with living pulse */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-72 w-[600px] rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-emerald-500/15 blur-3xl opacity-60 dark:opacity-40 animate-pulse-glow" />

      {/* Main Blueprint CTA Card */}
      <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white/95 via-white/80 to-slate-50/90 p-8 sm:p-12 md:p-16 text-center shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-500 hover:border-blue-400/50 hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)] dark:border-slate-800/90 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950/95 dark:hover:border-blue-500/40 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
        {/* Subtle internal blueprint grid */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-40 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] dark:opacity-30" />

        {/* Blueprint Corner Crosshairs */}
        <span className="pointer-events-none absolute top-3 left-3 font-mono text-[11px] text-slate-300 dark:text-slate-700 select-none">+</span>
        <span className="pointer-events-none absolute top-3 right-3 font-mono text-[11px] text-slate-300 dark:text-slate-700 select-none">+</span>
        <span className="pointer-events-none absolute bottom-3 left-3 font-mono text-[11px] text-slate-300 dark:text-slate-700 select-none">+</span>
        <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[11px] text-slate-300 dark:text-slate-700 select-none">+</span>

        {/* Top Badge with Shimmer Sweep */}
        <div className="group/badge relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1 text-[11px] font-semibold text-blue-700 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300 shadow-2xs transition-all duration-300 hover:scale-105">
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/badge:translate-x-full transition-transform duration-1000 ease-in-out" />
          <Sparkles className="size-3 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>Instant Codebase Comprehension</span>
        </div>

        {/* Heading */}
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl md:text-[40px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] transition-colors">
          Ready to converse with your codebase?
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm md:text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
          Connect your GitHub repository in seconds. Ask architecture questions, trace token execution paths, and receive verified answers with clickable line-level citations.
        </p>

        {/* Action Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
          {/* Primary GitHub Connect */}
          <a
            href={getGithubLoginUrl()}
            className="group/btn relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-slate-950 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all duration-300 cursor-pointer"
          >
            <GitHubIcon className="size-4 transition-transform duration-300 group-hover/btn:scale-110" />
            <span>Connect with GitHub</span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>
        </div>

        {/* Telemetry Micro Badges */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[10.5px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>40+ Languages Supported</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Salted AES-256 Vault</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>3,072-Dim PGVector</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Exact Line Citations</span>
          </span>
        </div>
      </div>
    </section>
  );
}
