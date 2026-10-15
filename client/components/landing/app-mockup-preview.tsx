"use client";

import React from "react";
import {
  ChevronDown,
  Compass,
  Copy,
  FileCode,
  FileText,
  FolderGit2,
  MessageSquare,
  Search,
  Settings,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { GitHubIcon } from "@/components/icons/github-icon";

export function AppMockupPreview() {
  return (
    <div className="group relative mx-auto w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.07)] overflow-hidden dark:border-slate-800 dark:bg-slate-900 transition-all duration-500 hover:border-blue-300/60 dark:hover:border-blue-600/40 hover:shadow-[0_25px_60px_-12px_rgba(59,130,246,0.12)]">
      {/* Window Title Bar */}
      <div className="flex h-10 items-center border-b border-slate-200/70 bg-[#f8f9fa] px-4 dark:border-slate-800/80 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f56] transition-transform duration-200 hover:scale-125 cursor-pointer" />
          <span className="size-3 rounded-full bg-[#ffbd2e] transition-transform duration-200 hover:scale-125 cursor-pointer" />
          <span className="size-3 rounded-full bg-[#27c93f] transition-transform duration-200 hover:scale-125 cursor-pointer" />
        </div>
      </div>

      {/* Window Body: 3-Column Split */}
      <div className="flex min-h-[500px]">
        {/* Left Column: Navigation Sidebar */}
        <div className="hidden md:flex w-52 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-[#f8f9fa] p-3.5 dark:border-slate-800/80 dark:bg-slate-950/50">
          <div>
            {/* Brand Logo in sidebar */}
            <div className="flex items-center gap-2 px-1 group/logo cursor-pointer">
              <RepoChatIcon className="size-6 transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-6" />
              <span className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                RepoChat
              </span>
            </div>

            {/* Quick Search */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs text-slate-400 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-all duration-200 hover:border-blue-400/60 cursor-pointer">
              <div className="flex items-center gap-2">
                <Search className="size-3.5 text-slate-400" />
                <span className="text-slate-400">Search...</span>
              </div>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                ⌘K
              </kbd>
            </div>

            {/* Nav list */}
            <nav className="mt-4 space-y-1 text-xs">
              <div className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-1.5 font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 transition-all duration-200 hover:translate-x-1 cursor-pointer">
                <FolderGit2 className="size-4" />
                <span>Repositories</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition-all duration-200 hover:translate-x-1 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                <MessageSquare className="size-4" />
                <span>Chat</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition-all duration-200 hover:translate-x-1 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                <Compass className="size-4" />
                <span>Explore</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 transition-all duration-200 hover:translate-x-1 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                <Search className="size-4" />
                <span>Search</span>
              </div>
            </nav>
          </div>

          {/* Bottom Settings */}
          <div className="border-t border-slate-200/70 pt-2 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
              <Settings className="size-4 transition-transform duration-300 hover:rotate-45" />
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Center Column: Chat Stream Area */}
        <div className="flex flex-1 flex-col bg-white p-5 text-xs dark:bg-slate-900">
          {/* Top Repo Header */}
          <div className="flex items-center gap-1.5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <GitHubIcon className="size-4 text-slate-800 dark:text-slate-200 transition-transform duration-200 hover:scale-110" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              vercel/next.js
            </span>
            <ChevronDown className="size-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>

          {/* Chat Transcript */}
          <div className="mt-4 flex flex-col space-y-4">
            {/* User Query Bubble */}
            <div className="ml-auto max-w-md rounded-2xl bg-[#edf2f7] px-4 py-2.5 font-medium text-slate-800 shadow-2xs dark:bg-slate-800 dark:text-slate-100 transition-transform duration-200 hover:scale-[1.01]">
              How does the App Router handle authentication?
            </div>

            {/* Assistant Response */}
            <div className="flex items-start gap-3">
              <RepoChatIcon className="size-7 shrink-0 rounded-lg mt-0.5 transition-transform duration-300 hover:scale-110 hover:rotate-6" />
              <div className="flex-1 space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  The App Router in Next.js handles authentication through middleware
                  and server components. It uses a combination of route protection,
                  session management, and cookie-based auth.
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Key parts of the implementation:
                </p>

                {/* Citations Box */}
                <div className="rounded-xl border border-slate-200/80 bg-[#f8f9fa] p-3 my-2 text-xs space-y-1.5 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="group/cite flex items-center gap-3 rounded-lg p-1.5 transition-all duration-200 hover:bg-white dark:hover:bg-slate-900 hover:border hover:border-blue-400/50 hover:shadow-2xs cursor-pointer">
                    <FileCode className="size-3.5 text-slate-500 shrink-0 transition-colors group-hover/cite:text-blue-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 transition-colors group-hover/cite:text-blue-600 dark:group-hover/cite:text-blue-400">
                      middleware.ts
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      src/middleware.ts
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-slate-400">
                      L12-34
                    </span>
                  </div>
                  <div className="group/cite flex items-center gap-3 rounded-lg p-1.5 transition-all duration-200 hover:bg-white dark:hover:bg-slate-900 hover:border hover:border-blue-400/50 hover:shadow-2xs cursor-pointer">
                    <FileCode className="size-3.5 text-slate-500 shrink-0 transition-colors group-hover/cite:text-blue-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 transition-colors group-hover/cite:text-blue-600 dark:group-hover/cite:text-blue-400">
                      auth.ts
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      src/lib/auth.ts
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-slate-400">
                      L1-52
                    </span>
                  </div>
                  <div className="group/cite flex items-center gap-3 rounded-lg p-1.5 transition-all duration-200 hover:bg-white dark:hover:bg-slate-900 hover:border hover:border-blue-400/50 hover:shadow-2xs cursor-pointer">
                    <FileCode className="size-3.5 text-slate-500 shrink-0 transition-colors group-hover/cite:text-blue-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 transition-colors group-hover/cite:text-blue-600 dark:group-hover/cite:text-blue-400">
                      session.ts
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      src/lib/session.ts
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-slate-400">
                      L8-29
                    </span>
                  </div>
                </div>

                <p>
                  The middleware runs before the request reaches your route, checks for a
                  valid session, and redirects unauthenticated users. Server components
                  can then access the session using cookies.
                </p>

                {/* Reaction Actions */}
                <div className="flex items-center gap-3 pt-1 text-slate-400">
                  <button type="button" className="p-1 rounded-md transition-all duration-200 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-125 active:scale-90">
                    <Copy className="size-3.5" />
                  </button>
                  <button type="button" className="p-1 rounded-md transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-125 active:scale-90">
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <button type="button" className="p-1 rounded-md transition-all duration-200 hover:text-red-500 dark:hover:text-red-400 hover:scale-125 active:scale-90">
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sources Side Drawer */}
        <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col gap-3 border-l border-slate-200/70 bg-[#f8f9fa] p-3.5 text-xs dark:border-slate-800/80 dark:bg-slate-950/50">
          <div className="flex items-center justify-between pb-1">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Sources
            </span>
            <X className="size-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>

          {/* Source Card 1 */}
          <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-slate-500" />
                <span className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
                  src/middleware.ts
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">L12 - 34</span>
            </div>
            <pre className="mt-2 font-mono text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-300 overflow-hidden">
              <code>
                <div><span className="inline-block w-4 text-slate-400 select-none">12</span><span className="text-purple-600 dark:text-purple-400 font-semibold">export function</span> middleware(request: ..</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">13</span>  <span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> token = request.cookies.get(&apos;..</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">14</span>  <span className="text-purple-600 dark:text-purple-400 font-semibold">if</span> (!token) &#123;</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">15</span>    <span className="text-purple-600 dark:text-purple-400 font-semibold">return</span> NextResponse.redirect(&apos;/..</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">16</span>  &#125;</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">17</span>..</div>
              </code>
            </pre>
          </div>

          {/* Source Card 2 */}
          <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-slate-500" />
                <span className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
                  src/lib/auth.ts
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">L1 - 52</span>
            </div>
            <pre className="mt-2 font-mono text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-300 overflow-hidden">
              <code>
                <div><span className="inline-block w-4 text-slate-400 select-none">1</span><span className="text-purple-600 dark:text-purple-400 font-semibold">import</span> &#123; cookies &#125; <span className="text-purple-600 dark:text-purple-400 font-semibold">from</span> &apos;next/head..&apos;</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">2</span><span className="text-purple-600 dark:text-purple-400 font-semibold">import</span> &#123; verify &#125; <span className="text-purple-600 dark:text-purple-400 font-semibold">from</span> &apos;@/lib/jwt&apos;</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">3</span></div>
                <div><span className="inline-block w-4 text-slate-400 select-none">4</span><span className="text-purple-600 dark:text-purple-400 font-semibold">export async function</span> getSession() &#123;</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">5</span>  <span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> token = cookies().get(&apos;auth..</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">6</span>..</div>
              </code>
            </pre>
          </div>

          {/* Source Card 3 */}
          <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-slate-500" />
                <span className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
                  src/lib/session.ts
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">L8 - 29</span>
            </div>
            <pre className="mt-2 font-mono text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-300 overflow-hidden">
              <code>
                <div><span className="inline-block w-4 text-slate-400 select-none">8</span><span className="text-purple-600 dark:text-purple-400 font-semibold">export async function</span> createSession(u..</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">9</span>  <span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> session = <span className="text-purple-600 dark:text-purple-400 font-semibold">await</span> db.session.cr..</div>
                <div><span className="inline-block w-4 text-slate-400 select-none">10</span> <span className="text-purple-600 dark:text-purple-400 font-semibold">return</span> session</div>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
