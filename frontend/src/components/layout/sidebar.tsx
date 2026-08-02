"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Settings,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/(auth)/actions";

export const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "All Candidates",
    href: "/candidates",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    loadProfile();
  }, []);

  const displayName = profile?.full_name || "User";
  const role = profile?.role || "super_admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col border-r border-sidebar-border/80 bg-sidebar/90 backdrop-blur-xl transition-all duration-300 ease-in-out z-20 shrink-0",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border/60">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-primary/20 shrink-0">
          <div className="w-full h-full bg-sidebar rounded-[11px] flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden transition-all duration-300">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent whitespace-nowrap">
                Obsidian Talent
              </h1>
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary bg-primary/5 font-semibold">
                PRO
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              HR Automation OS
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 w-full",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                }
              />
              {collapsed && (
                <TooltipContent side="right" className="text-xs font-medium">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer & User Profile */}
      <div className="px-3 pb-4 space-y-2">
        <Separator className="mb-3 bg-sidebar-border/60" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full",
                  pathname.startsWith("/settings") && "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            }
          />
          {collapsed && (
            <TooltipContent side="right" className="text-xs font-medium">
              Settings
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer w-full"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Log Out</span>}
              </button>
            }
          />
          {collapsed && (
            <TooltipContent side="right" className="text-xs font-medium">
              Log Out
            </TooltipContent>
          )}
        </Tooltip>

        {/* User profile card */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card/60 border border-border/60 shadow-sm mt-2",
            collapsed && "justify-center px-0 bg-transparent border-none"
          )}
        >
          <Avatar className="w-8 h-8 shrink-0 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold truncate flex items-center gap-1">
                <span className="truncate">{displayName}</span>
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                  {role === "super_admin" ? "Super Admin" : "SR Recruiter"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-md z-30"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
