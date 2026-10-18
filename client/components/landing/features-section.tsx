"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  CornerDownLeft,
  Database,
  FileCode2,
  FolderTree,
  GitBranch,
  Layers,
  Lock,
  MessageSquareCode,
  Radio,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { getGithubLoginUrl } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/* =========================================================================
   100% VERIFIED ARCHITECTURAL FACTS FROM REPOCHAT CODEBASE:
   - Backend: Spring Boot 3 + Spring AI + PGVector (3072 dimensions)
   - LLM: Gemini 3.7 Flash (streaming via SSE) & Gemini Embeddings 001
   - Chunker: TokenTextSplitter (~800 chars / 200 tokens) with file path headers
   - Filter: CodeFileFilter (40+ language extensions, excludes node_modules/locks/binaries)
   - Security: AES Token Encryption for GitHub OAuth tokens
   - Citations: CitationMapper producing exact filePath, startLine, endLine
   - Visualizer: ArchitectureView with System Diagram, Data Flow, and Components
   ========================================================================= */

const VERIFIED_FEATURES = [
  {
    badge: "PGVECTOR EMBEDDINGS",
    title: "High-Dimensional Vector RAG",
    description:
      "Code is vectorized into 3,072 dimensions in PostgreSQL via PGVector with cosine distance, ensuring semantic queries hit the exact relevant function definitions.",
    icon: Database,
    span: "col-span-1 md:col-span-2",
    preview: (
      <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/90 p-2.5 font-mono text-[10px] leading-relaxed dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-[9.5px] text-slate-500 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            pgvector :: cosine similarity search
          </span>
          <span className="text-slate-400">topK = 5 chunks</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-blue-600 dark:text-blue-400">repo_id == &quot;e4b89f21-...&quot;</span>
          <span className="rounded bg-blue-100/70 px-1.5 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
            similarity: 0.94
          </span>
        </div>
        <p className="mt-1 font-sans text-[10px] text-slate-500 dark:text-slate-400">
          Spring AI expression builder enforces strict repository isolation per user session.
        </p>
      </div>
    ),
  },
  {
    badge: "PRECISION CITATIONS",
    title: "Line-Level Grounded Citations",
    description:
      "Every AI response carries verified source citations mapped directly to file paths and line ranges, eliminating AI hallucinations.",
    icon: FileCode2,
    span: "col-span-1",
    preview: (
      <div className="mt-3 space-y-1.5 rounded-lg border border-slate-200/80 bg-slate-50/90 p-2.5 text-[10px] dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between rounded-md border border-purple-200/70 bg-purple-50/80 px-2 py-1 text-[9.5px] font-medium text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300">
          <span className="font-mono">src/middleware.ts</span>
          <span className="rounded bg-white/90 px-1 font-semibold dark:bg-slate-900">L12 - 34</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white/80 px-2 py-1 text-[9.5px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <span className="font-mono">api/routes/auth.ts</span>
          <span className="rounded bg-slate-100 px-1 text-slate-500 dark:bg-slate-800">L45 - 62</span>
        </div>
      </div>
    ),
  },
  {
    badge: "STREAMING ENGINE",
    title: "Server-Sent Events (SSE)",
    description:
      "Chat responses stream token-by-token directly from Gemini 3.7 Flash via Spring SseEmitter with zero waiting lag and immediate rendering.",
    icon: Zap,
    span: "col-span-1",
    preview: (
      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/90 p-2.5 text-[10px] dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
            SSE
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-[10.5px]">SseEmitter Stream</div>
            <div className="text-[9.5px] text-slate-400">Token-by-token push</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Channel
        </span>
      </div>
    ),
  },
  {
    badge: "AST CODE FILTER",
    title: "Multi-Language Tree Parser",
    description:
      "Automatically detects 40+ programming languages while ignoring node_modules, build artifacts, lockfiles, and binaries up to 100KB per file.",
    icon: FolderTree,
    span: "col-span-1",
    preview: (
      <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/90 p-2.5 text-[10px] dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-wrap gap-1 font-mono text-[9px]">
          <span className="rounded bg-blue-100/80 px-1.5 py-0.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Java</span>
          <span className="rounded bg-sky-100/80 px-1.5 py-0.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300">TypeScript</span>
          <span className="rounded bg-amber-100/80 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Python</span>
          <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Go</span>
          <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">+36 more</span>
        </div>
        <p className="mt-1.5 text-[9.5px] text-slate-400">Skips package-lock.json, cargo.lock, dist/</p>
      </div>
    ),
  },
  {
    badge: "ENTERPRISE PRIVACY",
    title: "AES Encrypted Token Vault",
    description:
      "GitHub OAuth tokens are encrypted at rest with salted AES-256 before hitting the database, with strictly scoped access control.",
    icon: ShieldCheck,
    span: "col-span-1",
    preview: (
      <div className="mt-3 space-y-1 rounded-lg border border-slate-200/80 bg-slate-50/90 p-2.5 text-[10px] dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <Lock className="size-3 text-indigo-500" />
          <span className="font-semibold text-[10.5px]">Salted AES-256 Token Storage</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="size-3 text-emerald-500" />
          <span>User-isolated repository ownership</span>
        </div>
      </div>
    ),
  },
];

/* =========================================================================
   SINGLE CARD PHASES (1 CARD PER ROW, ALTERNATING LEFT / RIGHT)
   ========================================================================= */

const PIPELINE_PHASES = [
  {
    step: "01",
    phaseTag: "PHASE 01 :: OAUTH_SYNC",
    position: "left", // Placed on Left
    title: "GitHub Handshake & Recursive Tree Scan",
    description:
      "Authenticates via GitHub OAuth2 with salted AES-256 encrypted tokens. The backend recursively fetches the full repository tree and default branch via GitHub REST API.",
    techBadge: "GithubApiClient",
    command: "GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
    icon: GitHubIcon,
    telemetry: "142 files discovered • default: refs/heads/main",
    threshold: 0.04,
  },
  {
    step: "02",
    phaseTag: "PHASE 02 :: TOKEN_CHUNKER",
    position: "right", // Placed on Right
    title: "Intelligent File Filter & Token Splitter",
    description:
      "CodeFileFilter systematically discards lockfiles, node_modules, and binaries. TokenTextSplitter segments code into ~200-token chunks with contextual file path headers.",
    techBadge: "CodeChunker & Filter",
    command: "// File: src/auth.ts (chunk size: 800 chars, max 100KB/file)",
    icon: Code2,
    telemetry: "200 tokens/chunk • 0 binaries ingested",
    threshold: 0.18,
  },
  {
    step: "03",
    phaseTag: "PHASE 03 :: PGVECTOR_STORE",
    position: "left", // Placed on Left
    title: "3,072-Dimensional PGVector Embedding",
    description:
      "Gemini embeddings generate high-dimensional vectors. Batches of 32 chunks are committed into PostgreSQL vector_store table using Cosine Distance indexing.",
    techBadge: "Spring AI + PGVector",
    command: "INSERT INTO vector_store (content, metadata, embedding[3072])",
    icon: Database,
    telemetry: "public.vector_store • 3,072 dims • COSINE_DISTANCE",
    threshold: 0.34,
  },
  {
    step: "04",
    phaseTag: "PHASE 04 :: CONTEXT_RETRIEVER",
    position: "right", // Placed on Right
    title: "Scoped Cosine Similarity Context Retrieval",
    description:
      "When a developer asks a question, CodeContextRetriever runs a cosine similarity vector search scoped strictly by repositoryId, returning top-5 grounded chunks.",
    techBadge: "CodeContextRetriever",
    command: "vectorStore.similaritySearch(topK=5, filter: repoId == ?)",
    icon: Search,
    telemetry: "topK = 5 • similarity: 0.96 • scoped to repoId",
    threshold: 0.50,
  },
  {
    step: "05",
    phaseTag: "PHASE 05 :: SSE_STREAM_CITE",
    position: "left", // Placed on Left
    title: "Token-by-Token SSE Stream & Line Citations",
    description:
      "Gemini 3.7 Flash streams responses in real time using Server-Sent Events (SSE). CitationMapper maps exact line numbers so developers can inspect original source files.",
    techBadge: "ChatStreamHandler",
    command: "SseEmitter: data: {\"token\": \"...\", \"citations\": [L12-L34]}",
    icon: MessageSquareCode,
    telemetry: "gemini-3.7-flash • citations: src/middleware.ts:L12-34",
    threshold: 0.66,
  },
];

const SEGMENT_RANGES = [
  { start: 0.04, end: 0.18 }, // Card 1 OUT -> Card 2 IN
  { start: 0.18, end: 0.34 }, // Card 2 OUT -> Card 3 IN
  { start: 0.34, end: 0.50 }, // Card 3 OUT -> Card 4 IN
  { start: 0.50, end: 0.66 }, // Card 4 OUT -> Card 5 IN
  { start: 0.66, end: 0.76 }, // Card 5 OUT -> Chat IN
];

export function FeaturesSection() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [userInput, setUserInput] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inPortRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outPortRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chatInPortRef = useRef<HTMLDivElement>(null);

  const segmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowSegmentRefs = useRef<(SVGPathElement | null)[]>([]);

  const [segmentsD, setSegmentsD] = useState<string[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tipPoint, setTipPoint] = useState<{ x: number; y: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  // Recalculate port coordinates relative to container for each separate segment
  const updateThreadGeometry = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const getCoord = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left - containerRect.left + r.width / 2,
        y: r.top - containerRect.top + r.height / 2,
      };
    };

    const out1 = getCoord(outPortRefs.current[0]);
    const in2  = getCoord(inPortRefs.current[1]);
    const out2 = getCoord(outPortRefs.current[1]);
    const in3  = getCoord(inPortRefs.current[2]);
    const out3 = getCoord(outPortRefs.current[2]);
    const in4  = getCoord(inPortRefs.current[3]);
    const out4 = getCoord(outPortRefs.current[3]);
    const in5  = getCoord(inPortRefs.current[4]);
    const out5 = getCoord(outPortRefs.current[4]);
    const inChat = getCoord(chatInPortRef.current);

    if (out1 && in2 && out2 && in3 && out3 && in4 && out4 && in5 && out5 && inChat) {
      const stepConnect = (from: { x: number; y: number }, to: { x: number; y: number }, radius = 16) => {
        const goingRight = to.x > from.x;
        const r = Math.min(radius, Math.abs(to.x - from.x) / 2, Math.abs(to.y - from.y) / 2);

        if (goingRight) {
          return (
            `M ${from.x} ${from.y} ` +
            `L ${to.x - r} ${from.y} ` +
            `Q ${to.x} ${from.y}, ${to.x} ${from.y + r} ` +
            `L ${to.x} ${to.y}`
          );
        } else {
          return (
            `M ${from.x} ${from.y} ` +
            `L ${to.x + r} ${from.y} ` +
            `Q ${to.x} ${from.y}, ${to.x} ${from.y + r} ` +
            `L ${to.x} ${to.y}`
          );
        }
      };

      const seg0 = stepConnect(out1, in2);
      const seg1 = stepConnect(out2, in3);
      const seg2 = stepConnect(out3, in4);
      const seg3 = stepConnect(out4, in5);
      const seg4 = `M ${out5.x} ${out5.y} L ${inChat.x} ${out5.y}`;

      setSegmentsD([seg0, seg1, seg2, seg3, seg4]);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    updateThreadGeometry();
    const t1 = setTimeout(updateThreadGeometry, 100);
    const t2 = setTimeout(updateThreadGeometry, 300);
    const t3 = setTimeout(updateThreadGeometry, 800);

    const handleResize = () => updateThreadGeometry();
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(() => updateThreadGeometry());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  // Update scroll progress & thread extension length segment by segment (zero bleed ahead!)
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start when Card 1 reaches mid-screen (65% from viewport top)
      const startOffset = windowHeight * 0.65;
      const totalScrollable = containerRect.height - windowHeight * 0.35;
      const currentScroll = startOffset - containerRect.top;

      // Strictly clamped between 0 (not connected) and 1 (fully connected)
      const progress = Math.max(0, Math.min(1, currentScroll / Math.max(1, totalScrollable)));
      setScrollProgress(progress);

      let activeTip: { x: number; y: number } | null = null;

      for (let i = 0; i < SEGMENT_RANGES.length; i++) {
        const { start, end } = SEGMENT_RANGES[i];
        const seg = segmentRefs.current[i];
        const glow = glowSegmentRefs.current[i];
        if (!seg) continue;

        const len = seg.getTotalLength();
        if (len <= 0) continue;

        if (progress <= start) {
          // AHEAD of scroll: COMPLETELY HIDDEN (0 opacity, max dashoffset)
          seg.style.strokeDasharray = `${len}`;
          seg.style.strokeDashoffset = `${len}`;
          seg.style.opacity = "0";
          if (glow) {
            glow.style.strokeDasharray = `${len}`;
            glow.style.strokeDashoffset = `${len}`;
            glow.style.opacity = "0";
          }
        } else if (progress >= end) {
          // Passed segment: Fully drawn
          seg.style.strokeDasharray = `${len}`;
          seg.style.strokeDashoffset = "0";
          seg.style.opacity = "1";
          if (glow) {
            glow.style.strokeDasharray = `${len}`;
            glow.style.strokeDashoffset = "0";
            glow.style.opacity = "0.5";
          }
        } else {
          // Actively drawing this specific segment
          const t = (progress - start) / (end - start);
          const visible = len * t;
          seg.style.strokeDasharray = `${len}`;
          seg.style.strokeDashoffset = `${len * (1 - t)}`;
          seg.style.opacity = "1";
          if (glow) {
            glow.style.strokeDasharray = `${len}`;
            glow.style.strokeDashoffset = `${len * (1 - t)}`;
            glow.style.opacity = "0.6";
          }

          if (visible > 0) {
            const pt = seg.getPointAtLength(visible);
            activeTip = { x: pt.x, y: pt.y };
          }
        }
      }

      setTipPoint(activeTip);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [segmentsD]);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* =========================================================================
          SECTION 1: REFINED BENTO CARDS (Tight 2-3px smaller typography)
         ========================================================================= */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/70 px-3 py-0.5 text-[10.5px] font-semibold text-blue-700 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          <Sparkles className="size-3" />
          <span>Verified Architecture & Features</span>
        </div>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Engineered for Deep Codebase Comprehension
        </h2>
        <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
          RepoChat indexes full Git repositories into high-dimensional vector spaces, providing immediate answers with verified file paths and line citations.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {VERIFIED_FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white/80 p-5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 ${feature.span}`}
            >
              <div>
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex size-8 items-center justify-center rounded-lg border border-slate-200/70 bg-slate-100/90 text-slate-800 shadow-2xs group-hover:scale-105 transition-transform dark:border-slate-800 dark:bg-slate-800/80 dark:text-white">
                    <Icon className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    {feature.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mt-3.5 font-heading text-[13.5px] font-bold tracking-tight text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[11px] sm:text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>

              {/* Visual Preview */}
              {feature.preview}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          SECTION 2: DYNAMIC SCROLL-DRIVEN THREAD PIPELINE
          1 Single Card per Phase (Alternating Left -> Right -> Left -> Right -> Left)
          Initially NOT connected. Thread originates at Card 1 and connects step-by-step
          as you scroll down, and retracts back in reverse as you scroll up.
         ========================================================================= */}
      <div className="mt-28 pt-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-3 py-0.5 text-[10.5px] font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Radio className="size-3 text-emerald-500" />
            <span>Under The Hood</span>
          </div>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            How RepoChat Works
          </h2>
          <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
            Scroll to follow each phase from repository ingestion to vector embeddings and grounded citations.
          </p>
        </div>

        {/* =========================================================================
            ZIGZAG CONTAINER WITH OVERLAID DYNAMIC CONTINUOUS SVG THREAD
           ========================================================================= */}
        <div ref={containerRef} className="relative mx-auto mt-14 max-w-4xl py-6">
          {/* Overlaid Dynamic Continuous Thread SVG (hidden on mobile, uses vertical connector) */}
          {segmentsD.length === 5 && (
            <svg
              className="absolute inset-0 size-full pointer-events-none overflow-visible hidden md:block z-0"
              fill="none"
            >
              <defs>
                <linearGradient id="scroll-thread-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="25%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="75%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                <linearGradient id="thread-seg4-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                <filter id="thread-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 5 Distinct Segments - Strictly scroll-driven, completely hidden ahead of scroll */}
              {segmentsD.map((d, i) => (
                <g key={i}>
                  {/* Ambient Glow Trail */}
                  <path
                    ref={(el) => {
                      glowSegmentRefs.current[i] = el;
                    }}
                    d={d}
                    stroke={i === 4 ? "#10b981" : "url(#scroll-thread-grad)"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#thread-glow-filter)"
                    className="transition-[stroke-dashoffset] duration-75 ease-out"
                    style={{ strokeDasharray: 99999, strokeDashoffset: 99999, opacity: 0 }}
                  />

                  {/* Sharp Laser Core Thread */}
                  <path
                    ref={(el) => {
                      segmentRefs.current[i] = el;
                    }}
                    d={d}
                    stroke={i === 4 ? "#34d399" : "url(#scroll-thread-grad)"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-75 ease-out"
                    style={{ strokeDasharray: 99999, strokeDashoffset: 99999, opacity: 0 }}
                  />
                </g>
              ))}

              {/* Radiant Traveling Photon Tip that follows scroll tip */}
              {tipPoint && (
                <g transform={`translate(${tipPoint.x}, ${tipPoint.y})`}>
                  <circle r="12" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                  <circle r="6" fill="#38bdf8" />
                  <circle r="3" fill="#ffffff" />
                </g>
              )}
            </svg>
          )}

          {/* 5 Alternating Rows (1 Single Card per Row) */}
          <div className="space-y-16 sm:space-y-24 relative z-10">
            {PIPELINE_PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              const isLeft = phase.position === "left";
              const isConnected = scrollProgress >= phase.threshold;

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative flex w-full",
                    idx === 4
                      ? "flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-0"
                      : isLeft
                      ? "justify-start"
                      : "justify-end"
                  )}
                >
                  {/* SINGLE CARD (width ~48% on desktop, 45% in row 5 for chat spacing) */}
                  <div
                    className={cn(
                      "relative w-full rounded-2xl border p-4 sm:p-6 backdrop-blur-md transition-all duration-500",
                      idx === 4 ? "md:w-[45%]" : "md:w-[48%]",
                      isConnected
                        ? "border-blue-500/80 bg-white/95 shadow-[0_12px_32px_-4px_rgba(59,130,246,0.16)] ring-1 ring-blue-500/25 dark:border-blue-400/80 dark:bg-slate-900/95 scale-[1.01]"
                        : "border-slate-200/60 bg-white/40 shadow-xs dark:border-slate-800/40 dark:bg-slate-950/40 opacity-70"
                    )}
                  >
                    {/* Corner Crosshairs */}
                    <span className="absolute top-2 left-2 font-mono text-[9px] text-slate-300 dark:text-slate-700 select-none">+</span>
                    <span className="absolute bottom-2 right-2 font-mono text-[9px] text-slate-300 dark:text-slate-700 select-none">+</span>

                    {/* INCOMING PORT (Cards 2, 3, 4, 5 - Top Side Center) */}
                    {idx > 0 && (
                      <div
                        ref={(el) => {
                          inPortRefs.current[idx] = el;
                        }}
                        className="hidden md:flex absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20"
                      >
                        <div
                          className={cn(
                            "size-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xs",
                            isConnected
                              ? "border-sky-500 bg-white dark:bg-slate-950 ring-2 ring-sky-500/30 scale-110"
                              : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full transition-all duration-300",
                              isConnected ? "bg-sky-500 animate-pulse" : "bg-slate-400 dark:bg-slate-600"
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* OUTGOING PORT (Cards 1, 2, 3, 4, 5 - Left/Right Center) */}
                    {idx <= 4 && (
                      <div
                        ref={(el) => {
                          outPortRefs.current[idx] = el;
                        }}
                        className={cn(
                          "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20",
                          isLeft ? "-right-2" : "-left-2"
                        )}
                      >
                        <div
                          className={cn(
                            "size-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xs",
                            isConnected
                              ? "border-blue-500 bg-white dark:bg-slate-950 ring-2 ring-blue-500/30 scale-110"
                              : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full transition-all duration-300",
                              isConnected ? "bg-blue-500 animate-pulse" : "bg-slate-400 dark:bg-slate-600"
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Card Header */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex size-8 items-center justify-center rounded-xl border font-bold shadow-2xs transition-all duration-500",
                              isConnected
                                ? "border-blue-500 bg-blue-600 text-white shadow-blue-500/30 dark:bg-blue-500"
                                : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold transition-colors",
                              isConnected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                            )}
                          >
                            STEP {phase.step}
                          </span>
                        </div>

                        {/* Status / Tech Badge */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-medium border transition-colors",
                              isConnected
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              )}
                            />
                            {isConnected ? "CONNECTED" : "OFFLINE"}
                          </span>

                          <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 font-mono text-[9px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                            {phase.techBadge}
                          </span>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <h3 className="mt-3.5 font-heading text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white">
                        {phase.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">
                        {phase.description}
                      </p>
                    </div>

                    {/* Real Command / Payload Signature */}
                    <div className="mt-3.5 rounded-lg border border-slate-200/70 bg-slate-100/70 px-3 py-1.5 font-mono text-[9.5px] sm:text-[10px] text-slate-700 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-300">
                      <span className="text-blue-500 select-none">&gt;&nbsp;</span>
                      <code>{phase.command}</code>
                    </div>

                    {/* Telemetry Micro-Indicator */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[9.5px] font-mono text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <span>{phase.phaseTag}</span>
                      <span className={cn(isConnected ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400")}>
                        {phase.telemetry}
                      </span>
                    </div>
                  </div>

                  {/* CONVERSATION-STYLE REPOCHAT INTERFACE (Clean 1-chat-each-side, interactive typing, redirect on send) */}
                  {idx === 4 && (() => {
                    const isChatConnected = scrollProgress >= 0.75;
                    return (
                      <div
                        className={cn(
                          "relative w-full md:w-[45%] rounded-2xl border bg-white/90 dark:bg-slate-900/90 p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all duration-500 flex flex-col justify-between",
                          isChatConnected
                            ? "border-emerald-500/80 ring-1 ring-emerald-500/30 scale-[1.01] shadow-[0_12px_32px_-4px_rgba(16,185,129,0.18)]"
                            : "border-slate-200/60 dark:border-slate-800/60 opacity-70"
                        )}
                      >
                        {/* INCOMING PORT ON LEFT (Connecting straight from Card 5 OUT) */}
                        <div
                          ref={chatInPortRef}
                          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-2 z-20"
                        >
                          <div
                            className={cn(
                              "size-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xs",
                              isChatConnected
                                ? "border-emerald-500 bg-white dark:bg-slate-950 ring-2 ring-emerald-500/40 scale-110"
                                : "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full transition-all duration-300",
                                isChatConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400 dark:bg-slate-600"
                              )}
                            />
                          </div>
                        </div>

                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <RepoChatIcon className="size-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-heading text-xs font-bold text-slate-900 dark:text-white">RepoChat</span>
                                <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">Active Index</span>
                              </div>
                              <span className="text-[10px] text-slate-400">spring-security / oauth2</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold border transition-colors",
                                isChatConnected
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  isChatConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                )}
                              />
                              {isChatConnected ? "LIVE" : "STANDBY"}
                            </span>
                          </div>
                        </div>

                        {/* Simple Conversation: One chat each side */}
                        <div className="py-3.5 space-y-3">
                          {/* User Message (Right Side) */}
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-blue-600 px-3.5 py-2 text-white shadow-xs">
                              <p className="text-[11.5px] leading-relaxed">
                                Where are GitHub OAuth tokens decrypted before repo tree scanning?
                              </p>
                            </div>
                          </div>

                          {/* RepoChat Message (Left Side) */}
                          <div className="flex justify-start gap-2">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold mt-0.5 shadow-xs">
                              RC
                            </div>
                            <div className="max-w-[85%] rounded-2xl rounded-tl-xs border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 px-3.5 py-2 text-slate-800 dark:text-slate-200 shadow-xs space-y-1.5">
                              <p className="text-[11.5px] leading-relaxed">
                                Decryption occurs in <span className="font-semibold text-blue-600 dark:text-blue-400">GithubOAuth2UserService</span> using salted AES-256 before tree scanning.
                              </p>
                              <div className="inline-flex items-center gap-1 rounded border border-purple-500/20 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 text-[9.5px] font-mono text-purple-600 dark:text-purple-400">
                                <span>↳ src/.../GithubOAuth2UserService.java:L48-62</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Input (Allows typing, redirects on send) */}
                        <form onSubmit={handleSend} className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={user ? "Ask anything about this repo..." : "Ask repo question (Enter to try)..."}
                            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="submit"
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                          >
                            <span>Send</span>
                            <CornerDownLeft className="size-3" />
                          </button>
                        </form>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}
