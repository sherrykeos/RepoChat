"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode,
  Folder,
  FolderOpen,
  Maximize2,
  Minus,
  Network,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepos, useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

type FileNode = {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: string;
  language?: string;
  related?: string[];
  referencedBy?: string[];
};

// Generate an intelligent realistic structure based on repository metadata
function buildRepoTree(repo: Repository): FileNode[] {
  const isPython = repo.language?.toLowerCase() === "python";
  const isJava = repo.language?.toLowerCase() === "java";

  if (isPython) {
    return [
      {
        id: "src",
        name: "src",
        path: "src",
        type: "folder",
        children: [
          {
            id: "src/agent",
            name: "agent",
            path: "src/agent",
            type: "folder",
            children: [
              {
                id: "src/agent/planner.py",
                name: "planner.py",
                path: "src/agent/planner.py",
                type: "file",
                size: "2.4 KB",
                language: "Python",
                related: ["executor.py", "tools.py", "types.py", "schemas.py"],
                referencedBy: ["executor.py", "main.py", "__init__.py"],
              },
              {
                id: "src/agent/executor.py",
                name: "executor.py",
                path: "src/agent/executor.py",
                type: "file",
                size: "3.8 KB",
                language: "Python",
                related: ["planner.py", "tools.py", "schemas.py"],
                referencedBy: ["main.py"],
              },
              {
                id: "src/agent/tools.py",
                name: "tools.py",
                path: "src/agent/tools.py",
                type: "file",
                size: "5.1 KB",
                language: "Python",
                related: ["toolset.py", "schemas.py"],
                referencedBy: ["planner.py", "executor.py"],
              },
            ],
          },
          {
            id: "src/memory",
            name: "memory",
            path: "src/memory",
            type: "folder",
            children: [
              {
                id: "src/memory/vector_store.py",
                name: "vector_store.py",
                path: "src/memory/vector_store.py",
                type: "file",
                size: "4.2 KB",
                language: "Python",
                related: ["config.py", "models.py"],
                referencedBy: ["planner.py"],
              },
            ],
          },
          {
            id: "src/models",
            name: "models",
            path: "src/models",
            type: "folder",
            children: [
              {
                id: "src/models/schemas.py",
                name: "schemas.py",
                path: "src/models/schemas.py",
                type: "file",
                size: "2.1 KB",
                language: "Python",
                related: ["base.py", "types.py"],
                referencedBy: ["planner.py", "executor.py"],
              },
              {
                id: "src/models/base.py",
                name: "base.py",
                path: "src/models/base.py",
                type: "file",
                size: "1.8 KB",
                language: "Python",
                related: ["types.py"],
                referencedBy: ["schemas.py"],
              },
            ],
          },
          {
            id: "src/utils",
            name: "utils",
            path: "src/utils",
            type: "folder",
            children: [
              {
                id: "src/utils/config.py",
                name: "config.py",
                path: "src/utils/config.py",
                type: "file",
                size: "1.2 KB",
                language: "Python",
                related: ["base.py"],
                referencedBy: ["main.py", "planner.py"],
              },
            ],
          },
        ],
      },
      {
        id: "tests",
        name: "tests",
        path: "tests",
        type: "folder",
        children: [
          {
            id: "tests/test_agent.py",
            name: "test_agent.py",
            path: "tests/test_agent.py",
            type: "file",
            size: "3.0 KB",
            language: "Python",
            related: ["planner.py", "executor.py"],
            referencedBy: [],
          },
        ],
      },
      {
        id: "README.md",
        name: "README.md",
        path: "README.md",
        type: "file",
        size: "3.5 KB",
        language: "Markdown",
        related: [],
        referencedBy: [],
      },
      {
        id: "pyproject.toml",
        name: "pyproject.toml",
        path: "pyproject.toml",
        type: "file",
        size: "1.1 KB",
        language: "TOML",
        related: ["requirements.txt"],
        referencedBy: [],
      },
      {
        id: "requirements.txt",
        name: "requirements.txt",
        path: "requirements.txt",
        type: "file",
        size: "820 B",
        language: "Text",
        related: [],
        referencedBy: [],
      },
    ];
  }

  // TypeScript / JavaScript / Java default structure
  return [
    {
      id: "src",
      name: "src",
      path: "src",
      type: "folder",
      children: [
        {
          id: isJava ? "src/main/java" : "src/components",
          name: isJava ? "main/java" : "components",
          path: isJava ? "src/main/java" : "src/components",
          type: "folder",
          children: [
            {
              id: isJava ? "src/main/java/App.java" : "src/components/App.tsx",
              name: isJava ? "App.java" : "App.tsx",
              path: isJava ? "src/main/java/App.java" : "src/components/App.tsx",
              type: "file",
              size: "4.1 KB",
              language: repo.language || "TypeScript",
              related: ["Router", "Store", "Types"],
              referencedBy: ["Index"],
            },
            {
              id: isJava ? "src/main/java/Service.java" : "src/components/Service.ts",
              name: isJava ? "Service.java" : "Service.ts",
              path: isJava ? "src/main/java/Service.java" : "src/components/Service.ts",
              type: "file",
              size: "3.2 KB",
              language: repo.language || "TypeScript",
              related: ["Api", "Config"],
              referencedBy: ["App"],
            },
          ],
        },
        {
          id: "src/lib",
          name: "lib",
          path: "src/lib",
          type: "folder",
          children: [
            {
              id: "src/lib/api.ts",
              name: "api.ts",
              path: "src/lib/api.ts",
              type: "file",
              size: "2.8 KB",
              language: "TypeScript",
              related: ["config.ts"],
              referencedBy: ["Service.ts"],
            },
            {
              id: "src/lib/config.ts",
              name: "config.ts",
              path: "src/lib/config.ts",
              type: "file",
              size: "1.5 KB",
              language: "TypeScript",
              related: [],
              referencedBy: ["api.ts"],
            },
          ],
        },
      ],
    },
    {
      id: "README.md",
      name: "README.md",
      path: "README.md",
      type: "file",
      size: "2.8 KB",
      language: "Markdown",
      related: [],
      referencedBy: [],
    },
    {
      id: isJava ? "pom.xml" : "package.json",
      name: isJava ? "pom.xml" : "package.json",
      path: isJava ? "pom.xml" : "package.json",
      type: "file",
      size: "1.9 KB",
      language: isJava ? "XML" : "JSON",
      related: [],
      referencedBy: [],
    },
  ];
}

export function ExploreWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoParam = searchParams.get("repo");
  const fileParam = searchParams.get("file");

  const reposQuery = useRepos();
  const indexMutation = useStartIndexing();
  const repos = reposQuery.data ?? [];

  // Active repository selection
  const activeRepo = useMemo(() => {
    if (repos.length === 0) return null;
    if (repoParam) {
      const match = repos.find((r) => r.id === repoParam);
      if (match) return match;
    }
    // Prefer first indexed repo
    const indexed = repos.find((r) => r.indexStatus === "READY");
    return indexed || repos[0];
  }, [repos, repoParam]);

  const isIndexed = activeRepo?.indexStatus === "READY";

  // File tree
  const fileTree = useMemo(() => {
    if (!activeRepo) return [];
    return buildRepoTree(activeRepo);
  }, [activeRepo]);

  // Initial selected file
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    fileParam || "src/agent/planner.py"
  );
  const [fileSearch, setFileSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"graph" | "tree">("graph");
  const [mobileTab, setMobileTab] = useState<"tree" | "graph" | "details">("tree");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    initialDistance?: number;
    initialZoom?: number;
  } | null>(null);
  const mouseRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);
  const isMouseDownRef = useRef(false);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setZoomLevel(0.55);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    hasMovedRef.current = false;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchRef.current = {
        startX: (touch1.clientX + touch2.clientX) / 2,
        startY: (touch1.clientY + touch2.clientY) / 2,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
        initialDistance: dist,
        initialZoom: zoomLevel,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchRef.current) return;
    if (e.touches.length === 1 && !touchRef.current.initialDistance) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchRef.current.startX;
      const dy = touch.clientY - touchRef.current.startY;
      if (Math.hypot(dx, dy) > 5) {
        hasMovedRef.current = true;
      }
      setPanOffset({
        x: Math.round(touchRef.current.initialPanX + dx),
        y: Math.round(touchRef.current.initialPanY + dy),
      });
    } else if (e.touches.length === 2 && touchRef.current.initialDistance && touchRef.current.initialZoom) {
      hasMovedRef.current = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const scale = dist / touchRef.current.initialDistance;
      const newZoom = Math.min(2.0, Math.max(0.4, Number((touchRef.current.initialZoom * scale).toFixed(2))));
      setZoomLevel(newZoom);

      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      const dx = midX - touchRef.current.startX;
      const dy = midY - touchRef.current.startY;
      setPanOffset({
        x: Math.round(touchRef.current.initialPanX + dx),
        y: Math.round(touchRef.current.initialPanY + dy),
      });
    }
  };

  const handleTouchEnd = () => {
    touchRef.current = null;
    setIsDragging(false);
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    mouseRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !mouseRef.current) return;
    const dx = e.clientX - mouseRef.current.startX;
    const dy = e.clientY - mouseRef.current.startY;
    if (Math.hypot(dx, dy) > 5) {
      hasMovedRef.current = true;
    }
    setPanOffset({
      x: Math.round(mouseRef.current.initialPanX + dx),
      y: Math.round(mouseRef.current.initialPanY + dy),
    });
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    mouseRef.current = null;
    setIsDragging(false);
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);
  };

  const handleFitToView = () => {
    if (canvasContainerRef.current) {
      const containerWidth = canvasContainerRef.current.clientWidth;
      const containerHeight = canvasContainerRef.current.clientHeight;
      const scaleX = (containerWidth - 28) / 800;
      const scaleY = (containerHeight - 28) / 440;
      const fitZoom = Math.min(1.0, Math.max(0.4, Number(Math.min(scaleX, scaleY).toFixed(2))));
      setZoomLevel(fitZoom);
    } else {
      setZoomLevel(0.55);
    }
    setPanOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    "src/agent": true,
    "src/memory": true,
    "src/models": true,
    "src/utils": true,
  });

  // Find selected file object
  const selectedFile = useMemo(() => {
    function searchTree(nodes: FileNode[]): FileNode | null {
      for (const node of nodes) {
        if (node.path === selectedFilePath) return node;
        if (node.children) {
          const res = searchTree(node.children);
          if (res) return res;
        }
      }
      return null;
    }
    return (
      searchTree(fileTree) || {
        id: selectedFilePath,
        name: selectedFilePath.split("/").pop() || "planner.py",
        path: selectedFilePath,
        type: "file" as const,
        size: "2.4 KB",
        language: activeRepo?.language || "Python",
        related: ["executor.py", "tools.py", "types.py", "schemas.py"],
        referencedBy: ["executor.py", "main.py"],
      }
    );
  }, [fileTree, selectedFilePath, activeRepo]);

  function toggleFolder(path: string) {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  }

  // Related graph nodes based on current file
  const graphNodes = useMemo(() => {
    const centerName = selectedFile.name;
    const related = selectedFile.related || [
      "executor.py",
      "tools.py",
      "config",
      "models",
      "schemas.py",
    ];
    return [
      { id: "center", name: centerName, type: "center", x: 400, y: 220 },
      ...related.map((name, i) => {
        const total = related.length;
        const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
        const radius = i % 2 === 0 ? 170 : 210;
        const isFolder = !name.includes(".");
        const isExternal = name.toLowerCase().includes("client") || name.toLowerCase().includes("api");
        return {
          id: `node-${i}`,
          name,
          type: isFolder ? "folder" : isExternal ? "external" : "file",
          x: 400 + radius * Math.cos(angle),
          y: 220 + radius * Math.sin(angle),
        };
      }),
    ];
  }, [selectedFile]);

  // Indexed vs Unindexed repositories for the dropdown selector
  const indexedRepos = useMemo(
    () => repos.filter((r) => r.indexStatus === "READY"),
    [repos]
  );
  const unindexedRepos = useMemo(
    () => repos.filter((r) => r.indexStatus !== "READY"),
    [repos]
  );

  if (reposQuery.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="space-y-3 text-center">
          <Skeleton className="size-12 rounded-xl mx-auto bg-muted" />
          <Skeleton className="h-4 w-48 mx-auto bg-muted" />
        </div>
      </div>
    );
  }

  if (!activeRepo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background text-foreground">
        <Network className="size-10 text-muted-foreground mb-3" />
        <h3 className="text-base font-semibold">No repositories available</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Connect a repository to inspect code structure and relationships.
        </p>
        <Button render={<Link href="/dashboard" />}>Go to Repositories</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-61px)] min-h-[calc(100dvh-61px)] max-h-[calc(100dvh-61px)] w-full flex-col overflow-hidden bg-background p-1.5 sm:p-2 text-foreground">
      {/* Floated Main Layout with slight gap matching Chat tab */}
      {!isIndexed ? (
        /* If repository is not indexed yet */
        <div className="flex-1 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden text-card-foreground">
          {/* Top Floated Header */}
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-3.5">
            {/* Repo Selector matching Chat tab */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1 text-left text-xs font-medium text-foreground hover:border-primary/50 transition-colors group cursor-pointer max-w-[240px] sm:max-w-xs"
                  />
                }
              >
                <GitHubIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                <div className="min-w-0">
                  <span className="block truncate font-heading font-semibold text-foreground leading-tight">
                    {activeRepo.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground truncate leading-none">
                    {activeRepo.owner}
                  </span>
                </div>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-68 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl z-50"
              >
                {/* Indexed Repositories section */}
                {indexedRepos.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                      Indexed Repositories
                    </div>
                    {indexedRepos.map((r) => {
                      const isSelected = r.id === activeRepo.id;
                      return (
                        <DropdownMenuItem
                          key={r.id}
                          onClick={() => router.push(`/dashboard/explore?repo=${r.id}`)}
                          className={cn(
                            "flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted text-popover-foreground",
                            isSelected && "bg-muted text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="truncate block font-medium">{r.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate block">
                                {r.owner}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}

                {/* Unindexed Repositories section */}
                {unindexedRepos.length > 0 && (
                  <div
                    className={cn(
                      "space-y-0.5",
                      indexedRepos.length > 0 && "mt-2 pt-2 border-t border-border"
                    )}
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                      Unindexed Repositories
                    </div>
                    {unindexedRepos.map((r) => {
                      const isSelected = r.id === activeRepo.id;
                      return (
                        <DropdownMenuItem
                          key={r.id}
                          onClick={() => router.push(`/dashboard/explore?repo=${r.id}`)}
                          className={cn(
                            "flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted text-popover-foreground",
                            isSelected && "bg-muted text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-1.5 rounded-full bg-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <span className="truncate block font-medium">{r.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate block">
                                {r.owner}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <span className="size-1 rounded-full bg-primary" />
              Not Indexed
            </span>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
              <Network className="size-7 text-primary" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Relationship Graph Unavailable
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The interactive relationship graph requires indexed code embeddings and symbol references. Index{" "}
                <span className="text-foreground font-semibold">{activeRepo.fullName}</span> to unlock the full codebase topology map.
              </p>
            </div>
            <Button
              onClick={() =>
                indexMutation.mutate(activeRepo.id, {
                  onSuccess: () => router.push(`/chat/${activeRepo.id}`),
                })
              }
              disabled={indexMutation.isPending}
              className="h-8 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold gap-2"
            >
              {indexMutation.isPending ? <RefreshCw className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              <span>Index Repository Now</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Indexed 3 Floated Panels Workspace (Left File Tree | Center Graph Canvas | Right File Details) with slight gap */
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-1.5 sm:gap-2 overflow-hidden">
          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden items-center rounded-lg border border-border bg-card p-1 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab("tree")}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center",
                mobileTab === "tree"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Files
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("graph")}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center",
                mobileTab === "graph"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Topology
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("details")}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center",
                mobileTab === "details"
                  ? "bg-muted text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </button>
          </div>

          {/* Panel 1 (Left Floated Bar): File Tree & Header with Repo Selector */}
          <aside className={cn(
            "w-full md:w-64 xl:w-72 flex flex-col rounded-xl border border-border bg-card shadow-sm shrink-0 select-none overflow-hidden text-card-foreground",
            mobileTab !== "tree" && "hidden md:flex"
          )}>
            {/* Top Repo Selector matching Chat tab */}
            <div className="p-2.5 border-b border-border space-y-2 bg-card">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:border-primary/50 transition-colors group cursor-pointer"
                    />
                  }
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GitHubIcon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <div className="min-w-0">
                      <span className="block truncate font-heading font-semibold text-foreground">
                        {activeRepo.name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground truncate leading-none">
                        {activeRepo.owner}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-68 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl z-50"
                >
                  {/* Indexed Repositories section */}
                  {indexedRepos.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Indexed Repositories
                      </div>
                      {indexedRepos.map((r) => {
                        const isSelected = r.id === activeRepo.id;
                        return (
                          <DropdownMenuItem
                            key={r.id}
                            onClick={() => router.push(`/dashboard/explore?repo=${r.id}`)}
                            className={cn(
                              "flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted text-popover-foreground",
                              isSelected && "bg-muted text-primary font-medium"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <span className="truncate block font-medium">{r.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate block">
                                  {r.owner}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  )}

                  {/* Unindexed Repositories section */}
                  {unindexedRepos.length > 0 && (
                    <div
                      className={cn(
                        "space-y-0.5",
                        indexedRepos.length > 0 && "mt-2 pt-2 border-t border-border"
                      )}
                    >
                      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Unindexed Repositories
                      </div>
                      {unindexedRepos.map((r) => {
                        const isSelected = r.id === activeRepo.id;
                        return (
                          <DropdownMenuItem
                            key={r.id}
                            onClick={() => router.push(`/dashboard/explore?repo=${r.id}`)}
                            className={cn(
                              "flex items-center justify-between gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer hover:bg-muted text-popover-foreground",
                              isSelected && "bg-muted text-primary font-medium"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="size-1.5 rounded-full bg-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <span className="truncate block font-medium">{r.name}</span>
                                <span className="text-[10px] text-muted-foreground truncate block">
                                  {r.owner}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search files input */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Search files..."
                  className="h-7 w-full rounded-md border border-border bg-background pl-7 pr-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2 border-b border-border flex items-center justify-between bg-muted/40 text-[11px]">
              <span className="font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                Files & Folders
              </span>
              <span className="font-mono text-muted-foreground">
                {activeRepo.defaultBranch || "main"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
              {fileTree.map(function renderNode(node) {
                const isFolder = node.type === "folder";
                const isExpanded = expandedFolders[node.path];
                const isSelected = selectedFilePath === node.path;

                // Simple search filter
                if (
                  fileSearch.trim() &&
                  !node.name.toLowerCase().includes(fileSearch.toLowerCase()) &&
                  !node.children?.some((c) =>
                    c.name.toLowerCase().includes(fileSearch.toLowerCase())
                  )
                ) {
                  return null;
                }

                if (isFolder) {
                  return (
                    <div key={node.id} className="space-y-0.5">
                      <button
                        onClick={() => toggleFolder(node.path)}
                        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-3 shrink-0" />
                        ) : (
                          <ChevronRight className="size-3 shrink-0" />
                        )}
                        {isExpanded ? (
                          <FolderOpen className="size-3.5 text-primary shrink-0" />
                        ) : (
                          <Folder className="size-3.5 text-primary shrink-0" />
                        )}
                        <span className="truncate">{node.name}</span>
                      </button>

                      {isExpanded && node.children && (
                        <div className="pl-4 space-y-0.5 border-l border-border ml-2">
                          {node.children.map(renderNode)}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedFilePath(node.path);
                      setMobileTab("details");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors truncate",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <FileCode className="size-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{node.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Panel 2 (Center): Interactive Relationship Graph Canvas (Floated Card) */}
          <section className={cn(
            "relative flex-1 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden select-none text-card-foreground",
            mobileTab !== "graph" && "hidden md:flex"
          )}>
            {/* Center Header: Graph/Tree Switcher & Zoom */}
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card px-3.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("graph")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                      activeTab === "graph"
                        ? "bg-card text-primary font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Graph View
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tree")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                      activeTab === "tree"
                        ? "bg-card text-primary font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Tree View
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-mono text-[11px] text-foreground">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-muted-foreground">topology</span>
              </div>
            </div>

            {/* Canvas Body */}
            <div
              ref={canvasContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={cn(
                "relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-muted/20 select-none touch-none",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
            >
              {/* Background subtle radial grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* SVG Graph Visualization */}
              <div
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
                className="relative w-[800px] h-[440px] shrink-0 pointer-events-auto"
              >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {graphNodes.slice(1).map((node) => (
                    <path
                      key={`line-${node.id}`}
                      d={`M 400 220 Q ${(400 + node.x) / 2} ${(220 + node.y) / 2 - 20} ${node.x} ${node.y}`}
                      stroke="var(--border)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray={node.type === "external" ? "4 4" : undefined}
                    />
                  ))}
                </svg>

                {/* Render Nodes */}
                {graphNodes.map((node) => {
                  const isCenter = node.id === "center";
                  const isFolder = node.type === "folder";
                  const isExternal = node.type === "external";

                  return (
                    <div
                      key={node.id}
                      style={{
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => {
                        if (hasMovedRef.current) return;
                        if (!isCenter) {
                          setSelectedFilePath(node.name);
                        }
                      }}
                      className={cn(
                        "absolute flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 cursor-pointer shadow-sm select-none",
                        isCenter
                          ? "bg-[#0969da] dark:bg-[#1f6feb] border-primary text-white font-bold z-20 scale-110 shadow-md"
                          : isFolder
                          ? "bg-card border-[#a371f7]/50 text-[#8250df] dark:text-[#d2a8ff] hover:border-[#a371f7] z-10"
                          : isExternal
                          ? "bg-card border-emerald-500/50 text-emerald-600 dark:text-[#7ee787] hover:border-emerald-500 z-10"
                          : "bg-card border-border text-foreground hover:border-primary z-10"
                      )}
                    >
                      {isFolder ? (
                        <Folder className="size-3 text-[#8250df] dark:text-[#a371f7]" />
                      ) : (
                        <FileCode className="size-3 opacity-80" />
                      )}
                      <span>{node.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend - Positioned top-3 left-3 on mobile to avoid overlapping with bottom zoom controls, and bottom-4 left-4 on desktop */}
              <div className="absolute top-3 left-3 sm:top-auto sm:bottom-4 sm:left-4 z-20 flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] text-muted-foreground backdrop-blur-md shadow-sm pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" />
                  <span>File</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#8250df] dark:bg-[#a371f7]" />
                  <span>Folder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>External</span>
                </div>
                <div className="hidden xs:flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-border" />
                  <span>Relationship</span>
                </div>
              </div>

              {/* Mobile touch gesture badge */}
              <div className="absolute bottom-3 left-3 sm:hidden z-20 flex items-center gap-1 rounded-md border border-border/60 bg-card/85 px-2 py-1 text-[9px] text-muted-foreground backdrop-blur-sm pointer-events-none">
                <span>Drag to pan • Pinch to zoom</span>
              </div>

              {/* Bottom-Right Zoom & Adjust Controls */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                  className="flex size-8 sm:size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <Minus className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 text-[11px] sm:text-xs font-mono font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all"
                  title="Reset View (100%)"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.0, Number((z + 0.1).toFixed(2))))}
                  className="flex size-8 sm:size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <Plus className="size-3.5" />
                </button>
                <div className="h-4 w-px bg-border mx-0.5" />
                <button
                  type="button"
                  onClick={handleFitToView}
                  className="flex size-8 sm:size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                  title="Fit to Screen"
                  aria-label="Fit to Screen"
                >
                  <Maximize2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPanOffset({ x: 0, y: 0 })}
                  className="flex size-8 sm:size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
                  title="Center Canvas"
                  aria-label="Center Canvas"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Panel 3 (Right Floated Bar): File Details Panel */}
          <aside className={cn(
            "w-full md:w-64 xl:w-72 flex flex-col rounded-xl border border-border bg-card shadow-sm shrink-0 p-3.5 space-y-4 select-none overflow-y-auto text-card-foreground",
            mobileTab !== "details" && "hidden md:flex"
          )}>
            <h3 className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              File Details
            </h3>

            {/* File identity card */}
            <div className="rounded-xl border border-border bg-background p-3 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileCode className="size-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading text-xs font-semibold text-foreground truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="font-mono text-[10px] text-muted-foreground truncate" title={selectedFile.path}>
                    {selectedFile.path}
                  </p>
                </div>
              </div>

              {activeRepo.htmlUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <a
                      href={`${activeRepo.htmlUrl}/blob/${activeRepo.defaultBranch}/${selectedFile.path}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  className="w-full h-7 border-border bg-muted/60 text-foreground hover:bg-muted text-xs font-medium gap-1.5"
                >
                  <ExternalLink className="size-3" />
                  <span>View Source</span>
                </Button>
              )}
            </div>

            {/* Metadata list */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Language</span>
                <span className="text-foreground font-medium font-mono">
                  {selectedFile.language || activeRepo.language || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Size</span>
                <span className="text-foreground font-medium font-mono">
                  {selectedFile.size || "2.4 KB"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Status</span>
                <span className="text-emerald-600 dark:text-[#3fb950] font-medium">Indexed</span>
              </div>
            </div>

            {/* Related Files */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Related Files
              </span>
              <div className="space-y-1">
                {(selectedFile.related || ["executor.py", "tools.py"]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilePath(f)}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs font-mono text-primary hover:bg-muted truncate"
                  >
                    <FileCode className="size-3 shrink-0" />
                    <span className="truncate">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Referenced By */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Referenced By
              </span>
              <div className="space-y-1">
                {(selectedFile.referencedBy || ["executor.py", "main.py"]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilePath(f)}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted truncate"
                  >
                    <FileCode className="size-3 shrink-0" />
                    <span className="truncate">{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
