"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Globe,
  Layers,
  Lock,
  Minus,
  Plus,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRepository } from "@/hooks/use-repos";
import { cn } from "@/lib/utils";

export function ArchitectureView({ repoId }: { repoId?: string }) {
  const router = useRouter();
  const repoQuery = useRepository(repoId ?? "");
  const repo = repoQuery.data;

  const [activeTab, setActiveTab] = useState<
    "diagram" | "flow" | "components" | "dependencies"
  >("diagram");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isGenerated, setIsGenerated] = useState(false);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0d1117] text-slate-100">
      {/* Top Header & Tabs bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4">
        <div className="flex items-center gap-1">
          {[
            { id: "diagram", label: "System Diagram" },
            { id: "flow", label: "Data Flow" },
            { id: "components", label: "Key Components" },
            { id: "dependencies", label: "Dependencies" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[#21262d] text-[#58a6ff] font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#58a6ff]" />
            <span>Frontend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#38bdf8]" />
            <span>Backend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#eab308]" />
            <span>Database</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#34d399]" />
            <span>External</span>
          </div>
        </div>
      </div>

      {/* Main Diagram Canvas or Un-generated State */}
      <div className="relative flex-1 overflow-auto p-8 flex items-center justify-center select-none">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#30363d 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {!isGenerated ? (
          <div className="relative z-10 flex max-w-md flex-col items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] p-8 text-center shadow-xl">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#21262d] border border-[#30363d]">
              <Layers className="size-7 text-[#58a6ff]" />
            </div>

            <h3 className="mt-4 font-heading text-base font-semibold text-slate-100">
              Architecture Analysis
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {repo
                ? `Generate a structural topology map for ${repo.fullName} based on indexed repository packages, controllers, and services.`
                : "Connect and select a repository to generate an interactive system architecture diagram."}
            </p>

            <Button
              onClick={() => setIsGenerated(true)}
              className="mt-6 gap-2 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold h-8"
            >
              <Sparkles className="size-3.5" />
              <span>Generate Architecture Map</span>
            </Button>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="relative max-w-4xl w-full flex flex-col items-center gap-10"
          >
            {/* Status pill */}
            <div className="rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 font-mono text-[10px] text-slate-400">
              Topology: {repo?.fullName ?? "Repository Root"}
            </div>

            {/* LEVEL 1: Client Layer */}
            <div className="relative z-10 w-64 rounded-xl border border-[#388bfd]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-blue-950/40">
              <div className="flex items-center justify-center gap-2">
                <Globe className="size-4 text-[#58a6ff]" />
                <h4 className="font-heading text-xs font-bold text-slate-100">
                  Client Interface
                </h4>
              </div>
              <div className="mt-1 font-mono text-[11px] text-[#79c0ff]">
                Web Client · HTTP Requests
              </div>
            </div>

            <div className="h-6 w-0.5 bg-gradient-to-b from-[#388bfd] to-[#8957e5]" />

            {/* LEVEL 2: API & Controllers */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="rounded-xl border border-[#8957e5]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-purple-950/30">
                <div className="flex items-center justify-center gap-2">
                  <Server className="size-4 text-[#a371f7]" />
                  <h4 className="font-heading text-xs font-bold text-slate-100">
                    API & Routing Layer
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#d2a8ff]">
                  Controllers · Endpoints
                </div>
              </div>

              <div className="rounded-xl border border-[#8957e5]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-purple-950/30">
                <div className="flex items-center justify-center gap-2">
                  <Lock className="size-4 text-[#a371f7]" />
                  <h4 className="font-heading text-xs font-bold text-slate-100">
                    Security & Middleware
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#d2a8ff]">
                  Auth · Guards · Interceptors
                </div>
              </div>
            </div>

            <div className="h-6 w-0.5 bg-gradient-to-b from-[#8957e5] to-[#238636]" />

            {/* LEVEL 3: Business Services */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="rounded-xl border border-[#238636]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-emerald-950/30">
                <div className="flex items-center justify-center gap-2">
                  <Layers className="size-4 text-[#3fb950]" />
                  <h4 className="font-heading text-xs font-bold text-slate-100">
                    Service Layer
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#7ee787]">
                  Business & Domain Logic
                </div>
              </div>

              <div className="rounded-xl border border-[#238636]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-emerald-950/30">
                <div className="flex items-center justify-center gap-2">
                  <Database className="size-4 text-[#3fb950]" />
                  <h4 className="font-heading text-xs font-bold text-slate-100">
                    Data Persistence
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#7ee787]">
                  Repositories · ORM Entities
                </div>
              </div>
            </div>

            <div className="h-6 w-0.5 bg-gradient-to-b from-[#238636] to-[#d29922]" />

            {/* LEVEL 4: Database / Vector Store */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
              <div className="rounded-xl border border-[#d29922]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-amber-950/30">
                <div className="flex items-center justify-center gap-2">
                  <Database className="size-4 text-[#e3b341]" />
                  <h4 className="font-heading text-xs font-bold text-slate-100">
                    Database Store
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#ffa657]">
                  SQL / NoSQL Data Store
                </div>
              </div>

              <div className="rounded-xl border border-[#d29922]/40 bg-[#161b22] p-4 text-center shadow-lg shadow-amber-950/30">
                <div className="flex items-center justify-center gap-2">
                  <Terminal className="size-4 text-[#e3b341]" />
                  <h4 className="font-heading text-xs font-bold text-slate-100">
                    Vector Intelligence
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[#ffa657]">
                  RepoChat pgvector Index
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zoom controls at bottom right */}
        {isGenerated && (
          <div className="absolute bottom-6 right-6 flex items-center gap-1 rounded-lg border border-[#30363d] bg-[#161b22] p-1 shadow-md">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="flex size-7 items-center justify-center rounded text-slate-400 hover:bg-[#21262d] hover:text-slate-100"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 text-xs font-mono text-slate-300 hover:bg-[#21262d] rounded py-1"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="flex size-7 items-center justify-center rounded text-slate-400 hover:bg-[#21262d] hover:text-slate-100"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
