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
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Header & Tabs bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
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
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
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
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {!isGenerated ? (
          <div className="relative z-10 flex max-w-md flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted border border-border">
              <Layers className="size-7 text-primary" />
            </div>

            <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
              Architecture Analysis
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
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
            <div className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] text-muted-foreground">
              Topology: {repo?.fullName ?? "Repository Root"}
            </div>

            {/* LEVEL 1: Client Layer */}
            <div className="relative z-10 w-64 rounded-xl border border-primary/40 bg-card p-4 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <Globe className="size-4 text-primary" />
                <h4 className="font-heading text-xs font-bold text-foreground">
                  Client Interface
                </h4>
              </div>
              <div className="mt-1 font-mono text-[11px] text-primary/80">
                Web Client · HTTP Requests
              </div>
            </div>

            <div className="h-6 w-0.5 bg-gradient-to-b from-[#388bfd] to-[#8957e5]" />

            {/* LEVEL 2: API & Controllers */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="rounded-xl border border-purple-500/40 bg-card p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Server className="size-4 text-purple-500" />
                  <h4 className="font-heading text-xs font-bold text-foreground">
                    API & Routing Layer
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-purple-400">
                  Controllers · Endpoints
                </div>
              </div>

              <div className="rounded-xl border border-purple-500/40 bg-card p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Lock className="size-4 text-purple-500" />
                  <h4 className="font-heading text-xs font-bold text-foreground">
                    Security & Middleware
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-purple-400">
                  Auth · Guards · Interceptors
                </div>
              </div>
            </div>

            <div className="h-6 w-0.5 bg-gradient-to-b from-[#8957e5] to-[#238636]" />

            {/* LEVEL 3: Business Services */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="rounded-xl border border-emerald-500/40 bg-card p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Layers className="size-4 text-emerald-500" />
                  <h4 className="font-heading text-xs font-bold text-foreground">
                    Service Layer
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-emerald-500/90">
                  Business & Domain Logic
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/40 bg-card p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Database className="size-4 text-emerald-500" />
                  <h4 className="font-heading text-xs font-bold text-foreground">
                    Data Persistence
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-emerald-500/90">
                  Repositories · ORM Entities
                </div>
              </div>
            </div>

            <div className="h-6 w-0.5 bg-gradient-to-b from-[#238636] to-[#d29922]" />

            {/* LEVEL 4: Database / Vector Store */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
              <div className="rounded-xl border border-amber-500/40 bg-card p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Database className="size-4 text-amber-500" />
                  <h4 className="font-heading text-xs font-bold text-foreground">
                    Database Store
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-amber-500/90">
                  SQL / NoSQL Data Store
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/40 bg-card p-4 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <Terminal className="size-4 text-amber-500" />
                  <h4 className="font-heading text-xs font-bold text-foreground">
                    Vector Intelligence
                  </h4>
                </div>
                <div className="mt-1 font-mono text-[11px] text-amber-500/90">
                  RepoChat pgvector Index
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zoom controls at bottom right */}
        {isGenerated && (
          <div className="absolute bottom-6 right-6 flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-md">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 text-xs font-mono text-foreground hover:bg-muted rounded py-1"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
