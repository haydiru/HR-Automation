"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/(auth)/actions";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Lowongan",
    href: "/jobs",
    icon: Briefcase,
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
  const companyName = profile?.company_name || "Perusahaan";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary glow-primary shrink-0">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden transition-all duration-300">
            <h1 className="text-sm font-bold tracking-tight gradient-text whitespace-nowrap">
              HR Automation
            </h1>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
              Rekrutmen Cerdas
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          
          const navLink = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                isActive
                  ? "bg-primary/10 text-primary glow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : ""
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={navLink} />
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-2">
        <Separator className="mb-3" />
        <Tooltip>
          <TooltipTrigger 
            render={
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Pengaturan</span>}
              </Link>
            }
          />
          {collapsed && (
            <TooltipContent side="right">Pengaturan</TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger 
            render={
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer w-full"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Keluar</span>}
              </button>
            }
          />
          {collapsed && (
            <TooltipContent side="right">Keluar</TooltipContent>
          )}
        </Tooltip>

        {/* User info */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50 mt-2",
            collapsed && "justify-center px-0"
          )}
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {companyName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10"
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
