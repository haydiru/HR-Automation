"use client";

import { Search, LogOut, Sparkles, Building2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { NotificationPopover } from "./notification-popover";

export function Header() {
  const [profile, setProfile] = useState<any>(null);
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
  const companyName = profile?.company_name || "Perusahaan Saya";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-xl flex items-center justify-between px-6 gap-4 sticky top-0 z-10 transition-colors">
      {/* Search Bar */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari lowongan, kandidat, atau staf..."
          className="pl-9 bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background h-9 text-xs rounded-xl shadow-inner transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Notifications Popover */}
        <NotificationPopover />

        <div className="w-[1px] h-6 bg-border/80 mx-0.5" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-accent/60 transition-all text-left group border border-transparent hover:border-border/60">
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2 shadow-xl border-border rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
                  <div className="pt-1">
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
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
                Profil Saya & Provider AI
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/settings/stages" className="w-full px-2 py-1.5 text-xs flex items-center gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                Tahapan Rekrutmen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs gap-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Sistem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
