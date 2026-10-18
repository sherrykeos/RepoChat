"use client";

import React from "react";
import Link from "next/link";
import { GitHubIcon } from "@/components/icons/github-icon";
import { XIcon } from "@/components/icons/x-icon";
import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { SherryKeosSignature } from "@/components/icons/sherrykeos-signature";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-md text-slate-600 transition-colors dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-400 overflow-hidden">
      {/* Brand Statement + Social Links + Creator Badge */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        {/* Tagline */}
        <p className="max-w-md text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
          RepoChat is the codebase companion you&apos;ve been searching for.
        </p>

        {/* GitHub and X (Twitter) Social Links */}
        <div className="mt-5 flex items-center gap-3">
          <a
            href="https://github.com/sherrykeos/devpilot"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="group flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-950 hover:-translate-y-0.5 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 active:scale-95"
          >
            <GitHubIcon className="size-3.5 text-slate-600 group-hover:text-black dark:text-slate-400 dark:group-hover:text-white transition-transform duration-200 group-hover:scale-110" />
            <span>GitHub</span>
          </a>

          <a
            href="https://x.com/sherrykeos"
            target="_blank"
            rel="noreferrer"
            aria-label="X (formerly Twitter)"
            className="group flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-950 hover:-translate-y-0.5 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 active:scale-95"
          >
            <XIcon className="size-3.5 text-slate-600 group-hover:text-black dark:text-slate-400 dark:group-hover:text-white transition-transform duration-200 group-hover:scale-110" />
            <span>Twitter / X</span>
          </a>
        </div>

        {/* Crafted by Sherry Koes (Signature) */}
        <div className="mt-5 text-[11.5px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Crafted by</span>
          <a
            href="https://github.com/sherrykeos"
            target="_blank"
            rel="noreferrer"
            aria-label="Sherry Koes GitHub"
            className="group inline-flex items-center text-slate-900 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <SherryKeosSignature className="h-7 sm:h-9 w-auto drop-shadow-2xl transition-colors group-hover:opacity-90" />
          </a>
        </div>
      </div>

      {/* Massive Typographic Wordmark Base with Ambient Breathing Pulse */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none pt-2">
        <div className="flex items-baseline justify-center w-full px-2">
          <span className="font-heading text-[15.5vw] font-black uppercase tracking-[-0.04em] text-slate-400/90 dark:text-slate-700/90 leading-[0.76] block text-center transition-all animate-wordmark-breath">
            REPOCHAT
          </span>
        </div>
      </div>
    </footer>
  );
}
