"use client";

import { Search, LogOut, Sparkles, Building2, User, Menu, Zap, LayoutDashboard, Briefcase, Users, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationPopover } from "./notification-popover";
import { cn } from "@/lib/utils";
import { navItems } from "./sidebar";

export function Header() {
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile({ ...user, ...data });
      }
    }
    getProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const companyName = profile?.company_name || "My Company";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 gap-3 sticky top-0 z-10 transition-colors">
      {/* Mobile Drawer Button & Brand Logo */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle Navigation Menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-card/95 backdrop-blur-xl">
            <SheetHeader className="p-4 border-b border-border/60">
              <SheetTitle className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-md shadow-primary/20">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  Obsidian Talent
                </span>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mt-4",
                  pathname.startsWith("/settings")
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-border/60 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{companyName}</p>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs gap-2 rounded-xl"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out of System
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Search Bar */}
        <div className="relative max-w-xs md:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs or candidates..."
            className="pl-9 bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background h-9 text-xs rounded-xl shadow-inner transition-all w-full"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <ThemeToggle />

        {/* Notifications Popover */}
        <NotificationPopover />

        <div className="w-[1px] h-6 bg-border/80 mx-0.5 hidden sm:block" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent/60 transition-all text-left group border border-transparent hover:border-border/60">
                <Avatar className="w-8 h-8 ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5" />
                    {companyName}
                  </p>
                </div>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-60 p-2 shadow-xl border-border rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
                  <div className="pt-1">
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold">
                      {profile?.role === "super_admin" ? "Super Admin" : "SR Recruiter"}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Link href="/settings" className="w-full px-2 py-1.5 text-xs flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4 text-muted-foreground" />
                My Profile & AI Config
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/settings/stages" className="w-full px-2 py-1.5 text-xs flex items-center gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                Recruitment Stages
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs gap-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out of System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
