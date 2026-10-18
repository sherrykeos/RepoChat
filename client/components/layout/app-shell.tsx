"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronRight, FolderGit2, Laptop, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mainNavItems,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  title,
  description,
  actions,
  hideHeader = false,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.displayName || user?.githubUsername || "Developer";
  const initials = displayName.slice(0, 2).toUpperCase();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }

  // Global Ctrl+K / Cmd+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/80">
        <div className="flex h-15 w-full items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left section: Brand & Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <RepoChatIcon className="size-7 rounded-lg shrink-0" />
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                RepoChat
              </span>
            </Link>

            <div className="hidden h-5 w-px bg-border/60 md:block" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const active = isDashboardNavActive(pathname, item.href, item.exact);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/20 font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-3.5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right section: Search, Theme Toggle, User Profile, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search input (desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:flex items-center w-35 md:w-45 lg:w-50"
            >
              <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-border/80 bg-muted/40 pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {/* <kbd className="pointer-events-none absolute right-2 flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-xs">
                Ctrl K
              </kbd> */}
            </form>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-0.5 transition-ring focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    aria-label="User menu"
                  />
                }
              >
                <Avatar className="size-8 rounded-full border border-border cursor-pointer hover:opacity-90 transition-opacity">
                  <AvatarImage
                    src={user?.avatarUrl ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-44 min-w-44 rounded-lg p-0.5 shadow-md border border-border bg-popover text-popover-foreground text-xs"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal px-2 py-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-foreground truncate">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {user?.githubUsername ? `@${user.githubUsername}` : "Connected to RepoChat"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="-mx-0.5 my-0.5" />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="px-2 py-1 text-[11px] rounded-md cursor-pointer gap-2"
                >
                  <LayoutDashboard className="size-3 text-muted-foreground" />
                  Overview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/repo")}
                  className="px-2 py-1 text-[11px] rounded-md cursor-pointer gap-2"
                >
                  <FolderGit2 className="size-3 text-muted-foreground" />
                  Repositories
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                  className="px-2 py-1 text-[11px] rounded-md cursor-pointer gap-2"
                >
                  <Settings className="size-3 text-muted-foreground" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="-mx-0.5 my-0.5" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="px-2 py-1 text-[11px] rounded-md cursor-pointer gap-2">
                    {resolvedTheme === "dark" ? (
                      <Moon className="size-3 text-primary" />
                    ) : (
                      <Sun className="size-3 text-amber-500" />
                    )}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-28 rounded-lg p-0.5 border border-border bg-popover text-popover-foreground shadow-md">
                    <DropdownMenuItem
                      onClick={() => setTheme("light")}
                      className="flex items-center justify-between px-2 py-1 text-[11px] rounded-md cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sun className="size-3 text-amber-500" />
                        <span>Light</span>
                      </div>
                      {theme === "light" && <Check className="size-3 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("dark")}
                      className="flex items-center justify-between px-2 py-1 text-[11px] rounded-md cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Moon className="size-3 text-primary" />
                        <span>Dark</span>
                      </div>
                      {theme === "dark" && <Check className="size-3 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("system")}
                      className="flex items-center justify-between px-2 py-1 text-[11px] rounded-md cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Laptop className="size-3 text-muted-foreground" />
                        <span>System</span>
                      </div>
                      {theme === "system" && <Check className="size-3 text-primary" />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="-mx-0.5 my-0.5" />
                <DropdownMenuItem
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="px-2 py-1 text-[11px] rounded-md text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
                >
                  <LogOut className="size-3" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-8 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md">
            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search repository or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>

            <nav className="flex flex-col gap-1">
              {mainNavItems.map((item) => {
                const active = isDashboardNavActive(pathname, item.href, item.exact);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/20 font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="size-3.5 opacity-50" />
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>


      {/* Main Page Content */}
      <main className="flex-1 flex flex-col min-h-0 w-full overflow-auto">
        {children}
      </main>
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        className
      )}
    >
      <RepoChatIcon className="size-7 rounded-lg" />
      <span className="font-heading text-base font-bold leading-none text-foreground">
        RepoChat
      </span>
    </div>
  );
}

export function GhostButtonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button variant="ghost" size="sm" className={className} render={<Link href={href} />}>
      {children}
    </Button>
  );
}