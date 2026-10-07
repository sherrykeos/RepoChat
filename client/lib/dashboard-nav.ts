import {
  Compass,
  FolderGit2,
  Home,
  MessageSquare,
  Search,
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
    title: "Home",
    href: "/",
    icon: Home,
    exact: true,
  },
  {
    title: "Repositories",
    href: "/dashboard",
    icon: FolderGit2,
    exact: true,
  },
  {
    title: "Explore",
    href: "/dashboard/explore",
    icon: Compass,
  },
  {
    title: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Search",
    href: "/dashboard/search",
    icon: Search,
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
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}