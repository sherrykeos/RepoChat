"use client";

import React, { useState } from "react";
import { Folder, FileCode, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroVisualization() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }

  function handleMouseLeave() {
    setMousePos({ x: 0, y: 0 });
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-[460px] w-full items-center justify-center overflow-visible select-none lg:min-h-[540px]"
    >
      {/* Layer 1: Soft Ambient Radial Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[380px] rounded-full bg-gradient-to-tr from-[#0969da]/25 via-[#6366f1]/20 to-[#a855f7]/25 blur-3xl dark:from-[#58a6ff]/20 dark:via-[#818cf8]/20 dark:to-[#c084fc]/20" />
        <div className="absolute size-[220px] rounded-full bg-cyan-400/20 blur-2xl dark:bg-cyan-400/15" />
      </div>

      {/* Layer 2: Subtle Ambient Grid / Platform */}
      <div className="pointer-events-none absolute bottom-8 h-32 w-72 rounded-[100%] bg-gradient-to-b from-[#38bdf8]/20 via-[#818cf8]/15 to-transparent blur-md dark:from-[#38bdf8]/15" />
      <div className="pointer-events-none absolute bottom-12 h-20 w-80 rounded-[100%] border border-[#0969da]/20 shadow-[0_0_35px_rgba(99,102,241,0.25)] dark:border-[#58a6ff]/25" />

      {/* Connection SVG Lines */}
      <svg
        className="pointer-events-none absolute inset-0 size-full stroke-primary/30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 140 180 Q 220 220 280 260"
          strokeDasharray="4 4"
          strokeWidth="1.5"
          className="opacity-40 dark:opacity-60"
        />
        <path
          d="M 380 180 Q 330 220 300 260"
          strokeDasharray="4 4"
          strokeWidth="1.5"
          className="opacity-40 dark:opacity-60"
        />
        <path
          d="M 170 340 Q 230 310 280 290"
          strokeDasharray="4 4"
          strokeWidth="1.5"
          className="opacity-40 dark:opacity-60"
        />
        <path
          d="M 370 340 Q 330 310 300 290"
          strokeDasharray="4 4"
          strokeWidth="1.5"
          className="opacity-40 dark:opacity-60"
        />
      </svg>

      {/* Layer 3: Central RepoChat "Core" (3D Isometric Repository Intelligence Engine) */}
      <div
        style={{
          transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)`,
          transition: "transform 0.2s ease-out",
        }}
        className="relative z-20 flex flex-col items-center"
      >
        <div className="relative group">
          {/* Core Ambient Platform Shadow & Light Ring */}
          <div className="absolute -bottom-6 left-1/2 h-10 w-44 -translate-x-1/2 rounded-full bg-[#4f46e5]/30 blur-xl dark:bg-[#6366f1]/40" />

          {/* Isometric 3D Robot Cube Container */}
          <div className="relative size-36 sm:size-40 rounded-3xl border border-white/60 bg-gradient-to-b from-white via-[#f0f4ff] to-[#e0e7ff] p-2.5 shadow-2xl shadow-indigo-500/20 backdrop-blur-md dark:border-white/10 dark:from-[#1e293b] dark:via-[#0f172a] dark:to-[#090d16] dark:shadow-indigo-950/50">
            {/* Top Ear/Antenna Nodes */}
            <div className="absolute -top-3 left-6 size-4 rounded-full border border-primary/40 bg-gradient-to-tr from-primary to-violet-500 shadow-sm" />
            <div className="absolute -top-3 right-6 size-4 rounded-full border border-primary/40 bg-gradient-to-tr from-primary to-violet-500 shadow-sm" />

            {/* Glowing Screen Visor */}
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-indigo-400/30 bg-[#090d16] p-3 shadow-inner">
              {/* Screen Top Status bar */}
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[9px] font-medium tracking-wider text-indigo-300">
                    REPOCHAT-CORE
                  </span>
                </div>
                <span className="font-mono text-[9px] text-cyan-400">RAG::ACTIVE</span>
              </div>

              {/* Visor Facial Expression / Code Radar */}
              <div className="my-auto flex flex-col items-center justify-center gap-1.5 py-1">
                {/* Cute Visor Eyes */}
                <div className="flex items-center gap-6">
                  <div className="relative flex h-5 w-4 items-center justify-center rounded-md bg-cyan-400 shadow-[0_0_12px_#38bdf8]">
                    <div className="size-1 rounded-full bg-white" />
                  </div>
                  <div className="relative flex h-5 w-4 items-center justify-center rounded-md bg-cyan-400 shadow-[0_0_12px_#38bdf8]">
                    <div className="size-1 rounded-full bg-white" />
                  </div>
                </div>
                {/* Code Terminal Prompt line */}
                <div className="mt-1 flex items-center gap-1 rounded bg-indigo-950/60 px-2 py-0.5 font-mono text-[10px] text-indigo-300 border border-indigo-500/30">
                  <span className="text-cyan-400">&gt;</span>
                  <span>ready_to_chat</span>
                  <span className="size-1 bg-cyan-400 animate-ping rounded-full" />
                </div>
              </div>

              {/* Screen Bottom Bar */}
              <div className="flex items-center justify-between pt-1 text-[8px] font-mono text-slate-400">
                <span>INDEX: 100%</span>
                <span className="text-indigo-400">PGVECTOR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Upper-Left Floating Repository Card */}
      <div
        style={{
          transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px) rotate(-3deg)`,
          transition: "transform 0.2s ease-out",
        }}
        className="animate-float-slow absolute top-6 left-4 z-30 sm:left-10 md:left-12 lg:-left-2"
      >
        <div className="w-48 sm:w-52 rounded-xl border border-border bg-card/95 p-3.5 shadow-xl shadow-foreground/5 backdrop-blur-md">
          <div className="mb-2.5 flex items-center justify-between border-b border-border/80 pb-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
              <Folder className="size-3.5 text-primary" />
              <span>&lt;Repository&gt;</span>
            </div>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
          <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2 rounded px-1.5 py-0.5 hover:bg-muted text-foreground font-medium">
              <span className="text-primary">📁</span> src/
            </div>
            <div className="flex items-center gap-2 pl-4 text-xs">
              <span className="text-primary/70">📁</span> app/
            </div>
            <div className="flex items-center gap-2 pl-4 text-xs">
              <span className="text-primary/70">📁</span> components/
            </div>
            <div className="flex items-center gap-2 pl-4 text-xs">
              <span className="text-primary/70">📁</span> services/
            </div>
            <div className="flex items-center gap-2 pl-4 text-xs">
              <span className="text-primary/70">📁</span> lib/
            </div>
          </div>
        </div>
      </div>

      {/* Layer 5: Upper-Right Floating Code Panel (AuthService.java) */}
      <div
        style={{
          transform: `translate(${mousePos.x * 14}px, ${mousePos.y * 14}px) rotate(2deg)`,
          transition: "transform 0.2s ease-out",
        }}
        className="animate-float-reverse absolute top-4 right-2 z-30 sm:right-6 md:right-8 lg:-right-4"
      >
        <div className="w-56 sm:w-64 rounded-xl border border-border bg-[#161b22] p-3 text-slate-200 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between border-b border-[#30363d] pb-1.5">
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-300">
              <FileCode className="size-3.5 text-[#58a6ff]" />
              <span>AuthService.java</span>
            </div>
            <span className="rounded bg-[#238636]/20 px-1.5 py-0.2 text-[9px] font-mono text-[#3fb950]">
              Indexed
            </span>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed overflow-hidden">
            <code>
              <span className="text-[#ff7b72]">@Service</span>
              <br />
              <span className="text-[#ff7b72]">public class</span>{" "}
              <span className="text-[#ffa657]">AuthService</span> &#123;
              <br />
              &nbsp;&nbsp;<span className="text-[#ff7b72]">private final</span>{" "}
              <span className="text-[#79c0ff]">JwtUtil</span> jwt;
              <br />
              &nbsp;&nbsp;<span className="text-[#ff7b72]">public</span>{" "}
              <span className="text-[#79c0ff]">User</span>{" "}
              <span className="text-[#d2a8ff]">authenticate</span>(...) &#123;
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-[#8b949e]">// validates credentials</span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-[#8b949e]">// returns token</span>
              <br />
              &nbsp;&nbsp;&#125;
              <br />
              &#125;
            </code>
          </pre>
        </div>
      </div>

      {/* Layer 6: Lower-Left Floating Code Panel */}
      <div
        style={{
          transform: `translate(${mousePos.x * -16}px, ${mousePos.y * -16}px) rotate(1deg)`,
          transition: "transform 0.2s ease-out",
        }}
        className="animate-float-reverse absolute bottom-6 left-2 z-30 sm:left-6 md:left-8 lg:-left-4"
      >
        <div className="hidden sm:block w-52 sm:w-56 rounded-xl border border-border bg-[#0d1117] p-3 text-slate-200 shadow-xl backdrop-blur-md">
          <div className="mb-2 flex items-center gap-1.5 border-b border-[#30363d] pb-1.5 font-mono text-[11px] text-slate-400">
            <span className="size-2 rounded-full bg-cyan-400" />
            <span>vector_search.ts</span>
          </div>
          <pre className="font-mono text-[10px] leading-relaxed text-slate-300">
            <code>
              <span className="text-[#ff7b72]">const</span> match ={" "}
              <span className="text-[#79c0ff]">await</span> store.
              <span className="text-[#d2a8ff]">similaritySearch</span>(&#123;
              <br />
              &nbsp;&nbsp;query: <span className="text-[#a5d6ff]">&quot;auth flow&quot;</span>,
              <br />
              &nbsp;&nbsp;topK: <span className="text-[#79c0ff]">4</span>
              <br />
              &#125;);
            </code>
          </pre>
        </div>
      </div>

      {/* Layer 7: Floating Pill Labels */}
      {/* "Explore" */}
      <div
        style={{
          transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
        }}
        className="animate-float-slow absolute top-28 left-36 z-40 hidden sm:flex items-center gap-1 rounded-full border border-primary/30 bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-md backdrop-blur-md dark:border-primary/40"
      >
        <span>Explore</span>
      </div>

      {/* "Understand" */}
      <div
        style={{
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
        }}
        className="animate-float-reverse absolute top-24 right-40 z-40 hidden sm:flex items-center gap-1 rounded-full border border-indigo-400/40 bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-500 shadow-md backdrop-blur-md dark:text-indigo-400"
      >
        <span>Understand</span>
      </div>

      {/* "Ask" */}
      <div
        style={{
          transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`,
        }}
        className="animate-float-slow absolute bottom-14 left-44 z-40 flex items-center gap-1 rounded-full border border-sky-400/40 bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-sky-500 shadow-md backdrop-blur-md dark:text-sky-400"
      >
        <span>Ask</span>
      </div>

      {/* "Build Faster" */}
      <div
        style={{
          transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
        }}
        className="animate-float-reverse absolute bottom-12 right-24 z-40 flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-background/90 px-3 py-1 text-[11px] font-semibold text-violet-600 shadow-md backdrop-blur-md dark:text-violet-400"
      >
        <CheckCircle2 className="size-3 text-emerald-500" />
        <span>Build Faster</span>
      </div>

      {/* Decorative Nodes / Glow Orbs */}
      <div className="absolute top-1/3 left-10 size-2.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#38bdf8] animate-ping" />
      <div className="absolute bottom-1/3 right-12 size-2 rounded-full bg-indigo-500/80 shadow-[0_0_8px_#6366f1]" />
    </div>
  );
}
