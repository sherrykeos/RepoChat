"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search, Settings } from "lucide-react";
import { useState } from "react";

import { RepoChatIcon } from "@/components/icons/repochat-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.displayName || user?.githubUsername || "John Doe";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" className="border-r border-border bg-sidebar">
        <SidebarHeader className="gap-3 p-4">
          <Link href="/" className="flex items-center gap-2.5 px-1 py-0.5">
            <RepoChatIcon className="size-7 rounded-lg" />
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              RepoChat
            </span>
          </Link>

          {/* Quick search input */}
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="h-8 w-full rounded-md border border-border bg-background/50 pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <kbd className="pointer-events-none absolute right-2 select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Ctrl K
            </kbd>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-1">
          <SidebarMenu className="gap-1">
            {mainNavItems.map((item) => {
              const active = isDashboardNavActive(pathname, item.href, item.exact);
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="h-auto w-full rounded-lg p-2 hover:bg-muted"
                    />
                  }
                >
                  <Avatar className="size-8 rounded-full border border-border">
                    <AvatarImage
                      src={user?.avatarUrl ?? undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {displayName}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      Free Plan
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  side="top"
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {user?.githubUsername ? `@${user.githubUsername}` : "Connected to RepoChat"}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        {!hideHeader && (
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="h-4" />
              <div className="min-w-0">
                {title && (
                  <h1 className="truncate font-heading text-sm font-semibold text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <ModeToggle />
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
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