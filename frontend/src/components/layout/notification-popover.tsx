"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  UserCheck,
  Calendar,
  RefreshCw,
  Sparkles,
  CheckCheck,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";

export interface AppNotification {
  id: string;
  type: "mandate" | "interview" | "reschedule" | "system";
  title: string;
  message: string;
  link?: string;
  created_at: string;
  is_read: boolean;
}

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch from notifications table in Supabase
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          setNotifications(data);
        } else {
          // Default initial notifications for demonstration
          setNotifications([
            {
              id: "notif-1",
              type: "mandate",
              title: "Mandat Kandidat Baru",
              message: "Super Admin menugaskan kandidat 'Bayu Pratama' untuk tahap wawancara Anda.",
              link: "/candidates",
              created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              is_read: false,
            },
            {
              id: "notif-2",
              type: "reschedule",
              title: "Jadwal Wawancara Diubah (Reschedule)",
              message: "Jadwal wawancara 'Siti Aminah' diubah dari 10 Aug ke 12 Aug 2026 jam 14:00.",
              link: "/candidates",
              created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              is_read: false,
            },
            {
              id: "notif-3",
              type: "system",
              title: "AI Auto-Screening Selesai",
              message: "3 kandidat baru untuk posisi 'Frontend Developer' telah diproses oleh AI.",
              link: "/jobs",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              is_read: true,
            },
          ]);
        }
      }
      setLoading(false);
    }

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    // Mark clicked as read
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notif.id);
      }
    }

    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotifIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "mandate":
        return <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "interview":
        return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "reschedule":
        return <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} min lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <button
          className="relative p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-600 rounded-full min-w-[18px] text-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-xl border-border">
        {/* Popover Header */}
        <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold">Pusat Notifikasi In-App</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary px-1.5 py-0">
                {unreadCount} Baru
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-[10px] text-muted-foreground hover:text-foreground gap-1 px-2"
            >
              <CheckCheck className="w-3 h-3" />
              Tandai Dibaca
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Tidak ada notifikasi saat ini.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 flex items-start gap-3 hover:bg-muted/40 transition-colors cursor-pointer relative ${
                  !notif.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="p-2 rounded-lg bg-muted border border-border shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs ${!notif.is_read ? "font-bold text-foreground" : "font-medium text-foreground/90"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Popover Footer */}
        <div className="p-2 border-t border-border bg-muted/20 text-center">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="text-[11px] text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            Lihat semua di Dashboard <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
