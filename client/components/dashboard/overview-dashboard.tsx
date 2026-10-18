"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FileCode,
  FileText,
  FolderGit2,
  GitBranch,
  GitFork,
  MessageSquare,
  MoreHorizontal,
  Network,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Square,
  Star,
  Trash2,
  Zap,
} from "lucide-react";

import { FoldedCornerMark } from "@/components/dashboard/folded-corner-mark";
import { GitHubIcon } from "@/components/icons/github-icon";
import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRefreshRepos, useRepos, useStartIndexing, useStopIndexing, useUnindexRepo } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  "C#": "#178600",
  "Jupyter Notebook": "#DA5B0B",
  Others: "#8b949e",
};

function HeroVisualization3D() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, pixelX: 270, pixelY: 180 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCoreHovered, setIsCoreHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    const x = pixelX / rect.width - 0.5;
    const y = pixelY / rect.height - 0.5;
    setTilt({
      rotateX: -y * 22,
      rotateY: x * 22,
      mouseX: x,
      mouseY: y,
      pixelX,
      pixelY,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsCoreHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, pixelX: 270, pixelY: 180 });
    setActiveNode(null);
  };

  const handleCoreClick = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 900);
  };

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  // Node active when directly hovered OR when central core is hovered/pulsing
  const isNodeLit = (key: string) => activeNode === key || isCoreHovered || isPulsing;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1100px", perspectiveOrigin: "center center" }}
      className="lg:col-span-6 relative flex items-center justify-center min-h-[350px] sm:min-h-[390px] select-none overflow-hidden sm:overflow-visible"
    >
      {/* 3D Canvas Container with Smooth Parallax Tilt */}
      <div
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.08s ease-out"
            : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="relative w-full h-full flex items-center justify-center scale-[0.80] sm:scale-95 md:scale-100 origin-center"
      >
        {/* Layer 0: Interactive Dynamic Mouse Spotlight & Ambient Aura (Z: -20px) */}
        <div
          style={{
            transform: "translateZ(-20px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Real-time Dynamic Cursor Spotlight */}
          <div
            style={{
              background: isHovered
                ? `radial-gradient(circle 220px at ${tilt.pixelX}px ${tilt.pixelY}px, rgba(88, 166, 255, 0.16), transparent 75%)`
                : "radial-gradient(circle 260px at 50% 50%, rgba(88, 166, 255, 0.1), transparent 75%)",
              transition: isHovered ? "none" : "background 0.5s ease-out",
            }}
            className="absolute inset-0 w-full h-full"
          />

          {/* Deep ambient back-glows */}
          <div className="size-80 rounded-full bg-blue-600/15 blur-3xl animate-pulse" />
          <div className="size-60 rounded-full bg-purple-600/20 blur-2xl" />
        </div>

        {/* Layer 1: SVG Neural Constellation Lines & Flowing Data Packets (Z: 25px) */}
        <svg
          style={{ transform: "translateZ(25px)" }}
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 540 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="beamBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#58a6ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#388bfd" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="beamPurple" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8250df" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a371f7" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="beamGreen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3fb950" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2ea043" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Outer Orbital Ellipse Grid */}
          <ellipse
            cx="270"
            cy="180"
            rx="230"
            ry="135"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.7"
          />

          {/* Inner Orbital Ring */}
          <ellipse
            cx="270"
            cy="180"
            rx="150"
            ry="90"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="2 4"
          />

          {/* --- Neural Pathways (Center: 270, 180) --- */}
          {/* 1. Architecture (Top-Left to 130, 55) */}
          <path
            id="path-arch"
            d="M 270 180 Q 200 110 130 55"
            stroke={isNodeLit("architecture") ? "#58a6ff" : "var(--border)"}
            strokeWidth={isNodeLit("architecture") ? 2.5 : 1.2}
            filter={isNodeLit("architecture") ? "url(#heroGlow)" : undefined}
            className="transition-all duration-200"
          />
          {isNodeLit("architecture") && (
            <circle r="4" fill="#58a6ff" filter="url(#heroGlow)">
              <animateMotion dur="1.2s" repeatCount="indefinite" path="M 270 180 Q 200 110 130 55" />
            </circle>
          )}

          {/* 2. Flow (Top-Right to 410, 55) */}
          <path
            id="path-flow"
            d="M 270 180 Q 350 110 410 55"
            stroke={isNodeLit("flow") ? "#8250df" : "var(--border)"}
            strokeWidth={isNodeLit("flow") ? 2.5 : 1.2}
            filter={isNodeLit("flow") ? "url(#heroGlow)" : undefined}
            className="transition-all duration-200"
          />
          {isNodeLit("flow") && (
            <circle r="4" fill="#a371f7" filter="url(#heroGlow)">
              <animateMotion dur="1.2s" repeatCount="indefinite" path="M 270 180 Q 350 110 410 55" />
            </circle>
          )}

          {/* 3. Questions (Mid-Left to 85, 160) */}
          <path
            id="path-questions"
            d="M 270 180 Q 150 170 85 160"
            stroke={isNodeLit("questions") ? "#58a6ff" : "var(--border)"}
            strokeWidth={isNodeLit("questions") ? 2.5 : 1}
            strokeDasharray={isNodeLit("questions") ? undefined : "3 3"}
            filter={isNodeLit("questions") ? "url(#heroGlow)" : undefined}
            className="transition-all duration-200"
          />
          {isNodeLit("questions") && (
            <circle r="3.5" fill="#58a6ff" filter="url(#heroGlow)">
              <animateMotion dur="1s" repeatCount="indefinite" path="M 270 180 Q 150 170 85 160" />
            </circle>
          )}

          {/* 4. Implementations (Mid-Right to 455, 145) */}
          <path
            id="path-impl"
            d="M 270 180 Q 380 160 455 145"
            stroke={isNodeLit("implementations") ? "#58a6ff" : "var(--border)"}
            strokeWidth={isNodeLit("implementations") ? 2.5 : 1}
            strokeDasharray={isNodeLit("implementations") ? undefined : "3 3"}
            filter={isNodeLit("implementations") ? "url(#heroGlow)" : undefined}
            className="transition-all duration-200"
          />
          {isNodeLit("implementations") && (
            <circle r="3.5" fill="#58a6ff" filter="url(#heroGlow)">
              <animateMotion dur="1s" repeatCount="indefinite" path="M 270 180 Q 380 160 455 145" />
            </circle>
          )}

          {/* 5. Relationships (Bottom-Left to 145, 305) */}
          <path
            id="path-rel"
            d="M 270 180 Q 190 260 145 305"
            stroke={isNodeLit("relationships") ? "#3fb950" : "var(--border)"}
            strokeWidth={isNodeLit("relationships") ? 2.5 : 1.2}
            filter={isNodeLit("relationships") ? "url(#heroGlow)" : undefined}
            className="transition-all duration-200"
          />
          {isNodeLit("relationships") && (
            <circle r="4" fill="#3fb950" filter="url(#heroGlow)">
              <animateMotion dur="1.3s" repeatCount="indefinite" path="M 270 180 Q 190 260 145 305" />
            </circle>
          )}

          {/* 6. Summaries (Bottom-Right to 405, 305) */}
          <path
            id="path-sum"
            d="M 270 180 Q 360 260 405 305"
            stroke={isNodeLit("summaries") ? "#f0883e" : "var(--border)"}
            strokeWidth={isNodeLit("summaries") ? 2.5 : 1.2}
            filter={isNodeLit("summaries") ? "url(#heroGlow)" : undefined}
            className="transition-all duration-200"
          />
          {isNodeLit("summaries") && (
            <circle r="4" fill="#f0883e" filter="url(#heroGlow)">
              <animateMotion dur="1.3s" repeatCount="indefinite" path="M 270 180 Q 360 260 405 305" />
            </circle>
          )}

          {/* Joint Connection Dots */}
          <circle cx="130" cy="55" r={isNodeLit("architecture") ? 4.5 : 2.5} fill="#58a6ff" />
          <circle cx="410" cy="55" r={isNodeLit("flow") ? 4.5 : 2.5} fill="#8250df" />
          <circle cx="85" cy="160" r={isNodeLit("questions") ? 4 : 2} fill="#58a6ff" />
          <circle cx="455" cy="145" r={isNodeLit("implementations") ? 4 : 2} fill="#58a6ff" />
          <circle cx="145" cy="305" r={isNodeLit("relationships") ? 4.5 : 2.5} fill="#3fb950" />
          <circle cx="405" cy="305" r={isNodeLit("summaries") ? 4.5 : 2.5} fill="#f0883e" />
        </svg>

        {/* Layer 2: 3D Gyroscope Orbital Rings (Z: 45px) */}
        <div
          style={{ transform: "translateZ(45px)", transformStyle: "preserve-3d" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Gyro Ring 1: tilted 68deg X, rotating clockwise */}
          <div
            style={{
              transform: "rotateX(68deg) rotateY(18deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute size-56 sm:size-64 rounded-full border border-[#58a6ff]/35 shadow-[0_0_20px_rgba(88,166,255,0.15)_inset]"
          >
            {/* Spinning Satellite Photon */}
            <div
              className="w-full h-full rounded-full relative"
              style={{
                animation: "spin 12s linear infinite",
              }}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#58a6ff] shadow-[0_0_12px_#58a6ff]" />
            </div>
          </div>

          {/* Gyro Ring 2: tilted -50deg X, 32deg Y, counter-rotating */}
          <div
            style={{
              transform: "rotateX(-50deg) rotateY(32deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute size-48 sm:size-56 rounded-full border border-[#8250df]/35 shadow-[0_0_20px_rgba(130,80,223,0.15)_inset]"
          >
            <div
              className="w-full h-full rounded-full relative"
              style={{
                animation: "spin 16s linear infinite reverse",
              }}
            >
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 size-2.5 rounded-full bg-[#a371f7] shadow-[0_0_10px_#a371f7]" />
            </div>
          </div>
        </div>

        {/* Layer 3: Central 3D Glossy Holographic Sphere Core (Z: 75px) */}
        <div
          style={{
            transform: `translateZ(${isCoreHovered ? 90 : 75}px)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="relative flex items-center justify-center pointer-events-auto cursor-pointer group"
          onMouseEnter={() => setIsCoreHovered(true)}
          onMouseLeave={() => setIsCoreHovered(false)}
          onClick={handleCoreClick}
          title="Click to pulse RepoChat Knowledge Engine"
        >
          {/* Shockwave ripple expanding on click */}
          {isPulsing && (
            <div className="absolute size-52 rounded-full border-2 border-[#58a6ff] animate-ping pointer-events-none" />
          )}

          {/* Pulsing Outer Atmospheric Aura */}
          <div
            className={cn(
              "absolute rounded-full border transition-all duration-300 pointer-events-none",
              isCoreHovered || isPulsing
                ? "size-44 sm:size-48 border-[#58a6ff]/70 bg-[#58a6ff]/15 shadow-[0_0_60px_rgba(88,166,255,0.5)] scale-110"
                : "size-40 sm:size-44 border-[#58a6ff]/30 bg-[#58a6ff]/5 shadow-[0_0_35px_rgba(88,166,255,0.25)] animate-pulse"
            )}
          />

          {/* 3D Glossy Sphere with Real-Time Specular Cursor Light Tracking */}
          <div
            style={{
              background: `radial-gradient(circle at ${40 + tilt.mouseX * 35}% ${40 + tilt.mouseY * 35}%, var(--muted) 0%, var(--card) 60%, var(--background) 100%)`,
              boxShadow: `${-tilt.mouseX * 30}px ${-tilt.mouseY * 30 + 16}px 40px rgba(0,0,0,0.25), inset ${tilt.mouseX * 15}px ${tilt.mouseY * 15}px 25px rgba(255,255,255,0.1), 0 0 35px rgba(88,166,255,0.35)`,
            }}
            className="relative size-28 sm:size-32 rounded-full border border-primary/50 flex items-center justify-center transition-all duration-200"
          >
            {/* Inner glossy emblem container */}
            <div className="size-16 sm:size-18 rounded-2xl bg-background/95 border border-border flex items-center justify-center shadow-inner group-hover:border-primary transition-colors">
              <RepoChatIcon className="size-10 sm:size-11 text-primary drop-shadow-[0_0_18px_rgba(88,166,255,0.7)] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          {/* Holographic Status Pill Underneath */}
          <div
            style={{ transform: "translateZ(30px)" }}
            className="absolute -bottom-9 px-2.5 py-0.5 rounded-full border border-border bg-card/95 text-[7.5px] md:text-[11px] text-muted-foreground group-hover:text-primary group-hover:border-primary/60 transition-all flex items-center gap-1.5 shadow-xl backdrop-blur-md whitespace-nowrap"
          >
            <span
              className={cn(
                "size-1.5 rounded-full transition-colors",
                isCoreHovered || isPulsing ? "bg-primary animate-ping" : "bg-[#3fb950] animate-pulse"
              )}
            />
            <span className="font-medium">
              {isCoreHovered ? "RepoChat Neural Mesh • Active" : "Repo Knowledge Core"}
            </span>
          </div>
        </div>

        {/* Layer 4: Floating Micro-Badges & Code Tokens (Z: 95px) */}
        <div
          style={{ transform: "translateZ(95px)", transformStyle: "preserve-3d" }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* GitHub Icon Badge */}
          <div className="absolute top-20 left-14 sm:left-18 size-5 rounded-full border border-border bg-card/95 flex items-center justify-center text-foreground shadow-xl backdrop-blur-md animate-float-gentle">
            <GitHubIcon className="size-2.5" />
          </div>

          {/* Code Syntax </> Badge */}
          <div className="absolute bottom-16 left-32 sm:left-36 px-1.5 py-0.2 rounded-md border border-border bg-card/95 text-[7.5px] md:text-[10.5px] font-mono text-primary shadow-xl backdrop-blur-md animate-float-reverse">
            &lt;/&gt;
          </div>

          {/* AST / Brackets Token */}
          <div className="absolute top-16 right-20 sm:right-24 px-1.5 py-0.2 rounded-md border border-border bg-card/95 text-[7.5px] md:text-[10.5px] font-mono text-[#a371f7] shadow-xl backdrop-blur-md animate-float-gentle">
            &#123; AST &#125;
          </div>

          {/* Git Branch Token */}
          <div className="absolute bottom-16 right-28 sm:right-32 flex items-center gap-1 px-1.5 py-0.2 rounded-md border border-border bg-card/95 text-[7.5px] md:text-[10.5px] font-mono text-[#3fb950] shadow-xl backdrop-blur-md animate-float-reverse">
            <GitBranch className="size-2 md:size-2.5" />
            <span>main</span>
          </div>
        </div>

        {/* Layer 5: Interactive Floating Capability Cards (Z: 120px resting, 150px hovered) */}
        <div
          style={{ transform: "translateZ(120px)", transformStyle: "preserve-3d" }}
          className="absolute inset-0 pointer-events-auto"
        >
          {/* Card 1: Analyze architecture (Top-Left) */}
          <button
            type="button"
            onClick={() => handleCardClick("/dashboard/explore?tab=architecture")}
            onMouseEnter={() => setActiveNode("architecture")}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              transform: activeNode === "architecture" ? "translateZ(30px) scale(1.06)" : "translateZ(0px)",
              transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease",
            }}
            className={cn(
              "absolute top-4 left-4 sm:left-8 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl backdrop-blur-md cursor-pointer group/card",
              activeNode === "architecture"
                ? "border-primary bg-primary/10 text-primary shadow-[0_10px_25px_rgba(88,166,255,0.25)] font-semibold"
                : "border-border/90 bg-card/95 text-foreground hover:border-primary/70"
            )}
          >
            <BarChart2 className="size-3 md:size-3.5 text-primary group-hover/card:scale-110 transition-transform" />
            <span className="text-[7.5px] md:text-[11px] font-medium tracking-tight">Analyze architecture</span>
          </button>

          {/* Card 2: Trace code flow (Top-Right) */}
          <button
            type="button"
            onClick={() => handleCardClick("/dashboard/explore")}
            onMouseEnter={() => setActiveNode("flow")}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              transform: activeNode === "flow" ? "translateZ(30px) scale(1.06)" : "translateZ(0px)",
              transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease",
            }}
            className={cn(
              "absolute top-4 right-4 sm:right-8 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl backdrop-blur-md cursor-pointer group/card",
              activeNode === "flow"
                ? "border-[#8250df] bg-[#8250df]/10 text-[#8250df] shadow-[0_10px_25px_rgba(130,80,223,0.25)] font-semibold"
                : "border-border/90 bg-card/95 text-foreground hover:border-[#8250df]/70"
            )}
          >
            <Network className="size-3 md:size-3.5 text-[#8250df] group-hover/card:scale-110 transition-transform" />
            <span className="text-[7.5px] md:text-[11px] font-medium tracking-tight">Trace code flow</span>
          </button>

          {/* Card 3: Ask questions about any file (Mid-Left) */}
          <button
            type="button"
            onClick={() => handleCardClick("/dashboard/chat")}
            onMouseEnter={() => setActiveNode("questions")}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              transform: activeNode === "questions" ? "translateZ(30px) scale(1.06)" : "translateZ(0px)",
              transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease",
            }}
            className={cn(
              "absolute top-32 left-0 sm:left-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl backdrop-blur-md cursor-pointer group/card",
              activeNode === "questions"
                ? "border-primary bg-primary/10 text-primary shadow-[0_10px_25px_rgba(88,166,255,0.25)] font-semibold"
                : "border-border/90 bg-card/95 text-foreground hover:border-primary/70"
            )}
          >
            <MessageSquare className="size-3 md:size-3.5 text-primary group-hover/card:scale-110 transition-transform" />
            <span className="text-[7.5px] md:text-[11px] font-medium tracking-tight">Ask questions about any file</span>
          </button>

          {/* Card 4: Find implementations (Mid-Right) */}
          <button
            type="button"
            onClick={() => handleCardClick("/dashboard/search")}
            onMouseEnter={() => setActiveNode("implementations")}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              transform: activeNode === "implementations" ? "translateZ(30px) scale(1.06)" : "translateZ(0px)",
              transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease",
            }}
            className={cn(
              "absolute top-28 right-0 sm:right-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl backdrop-blur-md cursor-pointer group/card",
              activeNode === "implementations"
                ? "border-primary bg-primary/10 text-primary shadow-[0_10px_25px_rgba(88,166,255,0.25)] font-semibold"
                : "border-border/90 bg-card/95 text-foreground hover:border-primary/70"
            )}
          >
            <Search className="size-3 md:size-3.5 text-primary group-hover/card:scale-110 transition-transform" />
            <span className="text-[7.5px] md:text-[11px] font-medium tracking-tight">Find implementations</span>
          </button>

          {/* Card 5: Explore relationships (Bottom-Left) */}
          <button
            type="button"
            onClick={() => handleCardClick("/dashboard/explore")}
            onMouseEnter={() => setActiveNode("relationships")}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              transform: activeNode === "relationships" ? "translateZ(30px) scale(1.06)" : "translateZ(0px)",
              transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease",
            }}
            className={cn(
              "absolute bottom-4 left-6 sm:left-12 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl backdrop-blur-md cursor-pointer group/card",
              activeNode === "relationships"
                ? "border-[#3fb950] bg-[#3fb950]/10 text-[#3fb950] shadow-[0_10px_25px_rgba(63,185,80,0.25)] font-semibold"
                : "border-border/90 bg-card/95 text-foreground hover:border-[#3fb950]/70"
            )}
          >
            <Share2 className="size-3 md:size-3.5 text-[#3fb950] group-hover/card:scale-110 transition-transform" />
            <span className="text-[7.5px] md:text-[11px] font-medium tracking-tight">Explore relationships</span>
          </button>

          {/* Card 6: Generate summaries (Bottom-Right) */}
          <button
            type="button"
            onClick={() => handleCardClick("/dashboard/chat")}
            onMouseEnter={() => setActiveNode("summaries")}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              transform: activeNode === "summaries" ? "translateZ(30px) scale(1.06)" : "translateZ(0px)",
              transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease",
            }}
            className={cn(
              "absolute bottom-4 right-6 sm:right-12 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl backdrop-blur-md cursor-pointer group/card",
              activeNode === "summaries"
                ? "border-[#f0883e] bg-[#f0883e]/10 text-[#f0883e] shadow-[0_10px_25px_rgba(240,136,62,0.25)] font-semibold"
                : "border-border/90 bg-card/95 text-foreground hover:border-[#f0883e]/70"
            )}
          >
            <FileText className="size-3 md:size-3.5 text-[#f0883e] group-hover/card:scale-110 transition-transform" />
            <span className="text-[7.5px] md:text-[11px] font-medium tracking-tight">Generate summaries</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function OverviewDashboard() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const reposQuery = useRepos();
  const refresh = useRefreshRepos();
  const indexMutation = useStartIndexing();
  const unindexMutation = useUnindexRepo();
  const stopMutation = useStopIndexing();

  const repos: Repository[] = reposQuery.data ?? [];

  // Toggle for language box: "native" (only user's own repos) vs "all" (all repos)
  const [langScope, setLangScope] = useState<"native" | "all">("all");

  const isNative = (repo: Repository) =>
    Boolean(user?.githubUsername && repo.owner.toLowerCase() === user.githubUsername.toLowerCase());

  // Actual dynamic statistics derived from real data
  const totalCount = repos.length;
  const readyCount = repos.filter((r) => r.indexStatus === "READY").length;
  const indexingCount = repos.filter((r) => r.indexStatus === "INDEXING").length;
  const notIndexedCount = repos.filter(
    (r) => r.indexStatus === "PENDING" || r.indexStatus === "FAILED"
  ).length;

  const readyPct = totalCount > 0 ? ((readyCount / totalCount) * 100).toFixed(1) : "0";
  const indexingPct = totalCount > 0 ? ((indexingCount / totalCount) * 100).toFixed(1) : "0";
  const notIndexedPct = totalCount > 0 ? ((notIndexedCount / totalCount) * 100).toFixed(1) : "0";

  // Recently indexed / accessed repos (4 items)
  const recentRepos = useMemo(() => {
    return [...repos]
      .sort((a, b) => {
        const aTime = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
        const bTime = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [repos]);

  // Derived Recent Activity (real status changes / connected repos)
  const recentActivity = useMemo(() => {
    const list: {
      id: string;
      title: string;
      repoName: string;
      type: "indexed" | "added" | "failed";
      timeAgo: string;
      repoId: string;
    }[] = [];

    repos.forEach((repo) => {
      if (repo.indexStatus === "READY" && repo.indexedAt) {
        list.push({
          id: `ready-${repo.id}`,
          title: "Indexed",
          repoName: repo.name,
          type: "indexed",
          timeAgo: formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true }),
          repoId: repo.id,
        });
      } else if (repo.indexStatus === "FAILED") {
        list.push({
          id: `failed-${repo.id}`,
          title: "Failed to index",
          repoName: repo.name,
          type: "failed",
          timeAgo: repo.indexedAt
            ? formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true })
            : "Recently",
          repoId: repo.id,
        });
      } else {
        list.push({
          id: `added-${repo.id}`,
          title: "Added repository",
          repoName: repo.name,
          type: "added",
          timeAgo: repo.indexedAt
            ? formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true })
            : "Recently",
          repoId: repo.id,
        });
      }
    });

    return list.slice(0, 4);
  }, [repos]);

  // Derived Languages Breakdown (filtered by Native vs All)
  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalWithLanguage = 0;

    const sourceRepos =
      langScope === "native" && user?.githubUsername
        ? repos.filter(
            (r) => r.owner.toLowerCase() === user.githubUsername.toLowerCase()
          )
        : repos;

    sourceRepos.forEach((r) => {
      const lang = r.language || "Others";
      counts[lang] = (counts[lang] || 0) + 1;
      totalWithLanguage++;
    });

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sorted.map(([lang, count]) => ({
      name: lang,
      count,
      pct: totalWithLanguage > 0 ? Math.round((count / totalWithLanguage) * 100) : 0,
      color: languageColors[lang] || "#8b949e",
    }));
  }, [repos, langScope, user?.githubUsername]);

  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.githubUsername ||
    "Developer";

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
      {/* 1. Hero Welcome Section with Interactive Cosmic Visualization */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Actions */}
          <div className="lg:col-span-6 space-y-4">

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Welcome back, <br />
              <span className="bg-gradient-to-r from-[#0969da] via-[#8250df] to-[#a371f7] dark:from-[#58a6ff] dark:via-[#8250df] dark:to-[#a371f7] bg-clip-text text-transparent">
                {firstName}.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
              Connect, explore, and understand your GitHub repositories with the power of AI.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => refresh.mutate()}
                disabled={refresh.isPending || reposQuery.isFetching}
                className="h-9 px-4 rounded-lg bg-gradient-to-r from-[#0969da] to-[#8250df] dark:from-[#2f81f7] dark:to-[#8250df] text-white font-medium text-xs sm:text-sm hover:opacity-95 shadow-md shadow-blue-900/20 gap-2 border-0"
              >
                <GitHubIcon className="size-4" />
                <span>Add Repository</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => refresh.mutate()}
                disabled={refresh.isPending || reposQuery.isFetching}
                className="h-9 px-4 rounded-lg border-border bg-card text-foreground text-xs sm:text-sm hover:bg-muted gap-2"
              >
                <RefreshCw
                  className={cn(
                    "size-3.5",
                    (refresh.isPending || reposQuery.isFetching) && "animate-spin"
                  )}
                />
                <span>Sync GitHub</span>
              </Button>
            </div>
          </div>

          {/* Right Hero Visualization: 3D Interactive Parallax & Constellation */}
          <HeroVisualization3D />
        </div>
      </section>

      {/* 2. Top Statistics Row (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {reposQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-muted" />
          ))
        ) : (
          <>
            {/* Card 1: Total Repositories */}
            <div
              onClick={() => router.push("/dashboard/repo")}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderGit2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {totalCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Repositories</div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Card 2: Indexed */}
            <div
              onClick={() => router.push("/dashboard/repo?status=READY")}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#3fb950]">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {readyCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Indexed</div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-xs font-mono font-medium text-emerald-600 dark:text-[#3fb950]">
                    {readyPct}%
                  </span>
                  <div className="w-12 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${readyPct}%` }}
                    />
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Card 3: Indexing */}
            <div
              onClick={() => router.push("/dashboard/repo?status=INDEXING")}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {indexingCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Indexing</div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {indexingPct}%
                  </span>
                  <div className="w-12 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${indexingPct}%` }}
                    />
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Card 4: Not Indexed */}
            <div
              onClick={() => router.push("/dashboard/repo?status=NOT_INDEXED")}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Sparkles className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {notIndexedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Not Indexed</div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {notIndexedPct}%
                  </span>
                  <div className="w-12 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-muted-foreground/40 rounded-full"
                      style={{ width: `${notIndexedPct}%` }}
                    />
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3. Main Workspace Grid: Left (Recently Accessed) | Right (Activity & Languages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Recently Accessed Repositories) - 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <h2 className="font-heading text-sm sm:text-base font-semibold text-foreground">
                  Recently Accessed
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Your recently opened repositories.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/repo"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {reposQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl bg-muted" />
              ))}
            </div>
          ) : recentRepos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentRepos.map((repo) => {
                const isReady = repo.indexStatus === "READY";
                const isIndexing = repo.indexStatus === "INDEXING";
                return (
                  <div
                    key={repo.id}
                    onClick={() => router.push(`/dashboard/repo/${repo.id}`)}
                    className="relative overflow-hidden group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/50 cursor-pointer shadow-xs space-y-3"
                  >
                    {!isNative(repo) && <FoldedCornerMark owner={repo.owner} />}
                    {/* Top Row: GitHub icon + Name/Owner + More */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GitHubIcon className="size-4 shrink-0 text-foreground" />
                        <div className="min-w-0">
                          <span className="block font-heading text-xs font-semibold text-primary group-hover:underline truncate">
                            {repo.name}
                          </span>
                          <span className="block text-[11px] text-muted-foreground truncate leading-none mt-0.5">
                            {repo.owner}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                              aria-label="More options"
                            />
                          }
                        >
                          <MoreHorizontal className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 border border-border bg-popover text-popover-foreground shadow-lg"
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/repo/${repo.id}`);
                            }}
                            className="text-xs hover:bg-muted cursor-pointer"
                          >
                            View Details
                          </DropdownMenuItem>
                          {repo.htmlUrl && (
                            <DropdownMenuItem
                              render={
                                <a
                                  href={repo.htmlUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              }
                              className="text-xs hover:bg-muted cursor-pointer"
                            >
                              <ExternalLink className="mr-2 size-3" />
                              GitHub Page
                            </DropdownMenuItem>
                          )}
                          {isIndexing && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                stopMutation.mutate(repo.id);
                              }}
                              disabled={stopMutation.isPending}
                              className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Square className="mr-2 size-3 fill-current" />
                              Stop Indexing
                            </DropdownMenuItem>
                          )}
                          {isReady && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                unindexMutation.mutate(repo.id);
                              }}
                              disabled={unindexMutation.isPending}
                              className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="mr-2 size-3" />
                              Unindex Repository
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status badge pill */}
                    <div>
                      {isReady ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-[#3fb950]">
                          <span className="size-1 rounded-full bg-emerald-600 dark:bg-[#3fb950]" />
                          Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <span className="size-1 rounded-full bg-muted-foreground" />
                          Not Indexed
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[30px]">
                      {repo.description || "No description provided."}
                    </p>

                    {/* Metadata: Language, stars, forks */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {repo.language && (
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                languageColors[repo.language] || "#58a6ff",
                            }}
                          />
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="size-3" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="size-3" />
                        <span>0</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center gap-2 border-t border-border pt-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isReady ? (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 h-7 rounded-md bg-[#238636] text-white hover:bg-[#2ea043] text-xs font-medium gap-1.5"
                            onClick={() => router.push(`/chat/${repo.id}`)}
                          >
                            <MessageSquare className="size-3" />
                            <span>Chat</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 rounded-md bg-muted/60 text-foreground hover:bg-muted text-xs font-medium gap-1.5 border border-border"
                            onClick={() => router.push(`/dashboard/explore?repo=${repo.id}`)}
                          >
                            <Network className="size-3 text-primary" />
                            <span>Explore</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full h-7 rounded-md bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] text-xs font-medium gap-1.5 shadow-xs"
                          disabled={indexMutation.isPending}
                          onClick={() =>
                            indexMutation.mutate(repo.id, {
                              onSuccess: () => router.push(`/chat/${repo.id}`),
                            })
                          }
                        >
                          <Sparkles className="size-3" />
                          <span>Index Repository</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center space-y-2">
              <FolderGit2 className="mx-auto size-8 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                No repositories connected yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Sync your GitHub account to start indexing your codebases.
              </p>
              <Button
                size="sm"
                onClick={() => refresh.mutate()}
                className="mt-3 h-8 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Connect Repositories</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right Column (Recent Activity + Languages Breakdown) - 4 cols */}
        <div className="lg:col-span-4 space-y-6 mt-14">
          {/* Languages Breakdown Card */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <div>
                  <h3 className="font-heading text-xs sm:text-sm font-semibold text-foreground">
                    Languages
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {langScope === "native" ? "Languages in your native repos." : "Languages across all repositories."}
                  </p>
                </div>
              </div>

              {/* Native vs All Toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 select-none shrink-0">
                <button
                  type="button"
                  onClick={() => setLangScope("native")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                    langScope === "native"
                      ? "bg-card text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Native
                </button>
                <button
                  type="button"
                  onClick={() => setLangScope("all")}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                    langScope === "all"
                      ? "bg-card text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
              </div>
            </div>

            {languageStats.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg bg-muted/40">
                No {langScope === "native" ? "native " : ""}repositories found with language data.
              </div>
            ) : (
            <div className="flex items-center gap-4 pt-1">
              {/* SVG Donut Chart */}
              <div className="relative size-20 shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="4"
                  />
                  {/* Slices */}
                  {languageStats.map((item, index) => {
                    const circumference = 2 * Math.PI * 14;
                    const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
                    const offset = languageStats
                      .slice(0, index)
                      .reduce((acc, prev) => acc + (prev.pct / 100) * circumference, 0);

                    return (
                      <circle
                        key={item.name}
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="4"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-offset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-foreground">
                    {languageStats.length}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5 text-xs font-mono">
                {languageStats.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => router.push(`/dashboard/repo?language=${encodeURIComponent(item.name)}`)}
                    className="flex items-center justify-between text-[11px] p-1 -mx-1 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground truncate">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 font-medium ml-2">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          {/* Recent Activity Card */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <div>
                <h3 className="font-heading text-xs sm:text-sm font-semibold text-foreground">
                  Recent Activity
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Latest updates across your repositories.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              {recentActivity.length > 0 ? (
                recentActivity.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => router.push(`/dashboard/repo/${act.repoId}`)}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {act.type === "indexed" ? (
                        <CheckCircle2 className="size-3.5 text-[#3fb950] shrink-0" />
                      ) : act.type === "failed" ? (
                        <AlertCircle className="size-3.5 text-destructive shrink-0" />
                      ) : (
                        <FolderGit2 className="size-3.5 text-primary shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="text-muted-foreground">{act.title} </span>
                        <span className="font-semibold text-primary truncate">
                          {act.repoName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {act.timeAgo}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-muted-foreground py-2 text-center">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}