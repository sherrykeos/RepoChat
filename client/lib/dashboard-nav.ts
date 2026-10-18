import {
  Compass,
  FolderGit2,
  LayoutDashboard,
  MessageSquare,
  Network,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const mainNavItems: DashboardNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Repositories",
    href: "/dashboard/repo",
    icon: FolderGit2,
  },
  {
    title: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Explore",
    href: "/dashboard/explore",
    icon: Network,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function isDashboardNavActive(
  pathname: string,
  href: string,
  exact = false
) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/dashboard/repo") {
    return (
      pathname === "/dashboard/repo" ||
      pathname.startsWith("/dashboard/repo/") ||
      pathname.startsWith("/dashboard/indexing")
    );
  }

  if (href === "/dashboard/chat") {
    return pathname.startsWith("/dashboard/chat") || pathname.startsWith("/chat");
  }

  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}