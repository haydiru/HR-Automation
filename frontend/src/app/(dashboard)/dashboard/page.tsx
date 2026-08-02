"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Eye,
  CalendarDays,
  UserCheck,
  Video,
  CalendarRange,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, isToday, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("14d");
  const [myInterviews, setMyInterviews] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("super_admin");
  const [currentUserName, setCurrentUserName] = useState("Andi");

  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [res, userRes] = await Promise.all([
          fetch(`/api/dashboard?range=${timeRange}`),
          supabase.auth.getUser(),
        ]);

        if (res.ok) setData(await res.json());

        if (userRes.data?.user) {
          const profileRes = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", userRes.data.user.id)
            .single();

          if (profileRes.data) {
            setUserRole(profileRes.data.role || "super_admin");
            setCurrentUserName(profileRes.data.full_name || "User");
          }

          const interviewsRes = await supabase
            .from("candidate_assignments")
            .select("*, candidates(id, full_name, email, job_title, total_score)")
            .eq("assigned_to_user_id", userRes.data.user.id)
            .order("scheduled_at", { ascending: true });

          if (interviewsRes.data) {
            setMyInterviews(interviewsRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-muted-foreground">Memuat data dashboard...</p>
      </div>
    );
  }

  const { stats, chartData, recentCandidates, activeJobs } = data || {
    stats: { total_applicants_today: 0, qualified_percentage: 0, active_jobs: 0, pending_review: 0 },
    chartData: [],
    recentCandidates: [],
    activeJobs: []
  };

  const qualPct = stats.qualified_percentage || 0;
  const donutData = [
    { name: "Qualified", value: qualPct, color: "#22c55e" },
    { name: "Not Qualified", value: Math.max(0, 100 - qualPct), color: "#f43f5e" },
  ];

  const todayInterviews = myInterviews.filter(
    (iv) => iv.scheduled_at && isToday(parseISO(iv.scheduled_at))
  );

  const timeRangeLabels: Record<string, string> = {
    "7d": "7 Hari Terakhir",
    "14d": "14 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    "90d": "90 Hari Terakhir",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 page-enter">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-indigo-500/5 to-purple-500/10 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Zap className="w-3.5 h-3.5" />
              Obsidian Talent OS Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat datang kembali, <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">{currentUserName}</span> 👋
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Sistem rekrutmen cerdas berbasis AI aktif memantau lamaran, penyaringan otomatis, dan jadwal tim rekrutmen Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/candidates"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 gap-1.5 text-xs rounded-xl bg-card/60 backdrop-blur-md")}
            >
              <Users className="w-3.5 h-3.5" />
              Semua Kandidat
            </Link>
            <Link
              href="/jobs/create"
              className={cn(buttonVariants({ size: "sm" }), "h-9 gap-1.5 text-xs rounded-xl shadow-lg shadow-primary/20")}
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Lowongan Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Pelamar Hari Ini"
          value={stats.total_applicants_today}
          icon={Users}
          variant="primary"
          trend={{ value: 12, positive: true }}
          className="rounded-2xl shadow-sm"
        />
        <StatCard
          label="Persentase Qualified"
          value={`${stats.qualified_percentage}%`}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 5, positive: true }}
          className="rounded-2xl shadow-sm"
        />
        <StatCard
          label="Lowongan Aktif"
          value={stats.active_jobs}
          icon={Briefcase}
          variant="default"
          className="rounded-2xl shadow-sm"
        />
        <StatCard
          label="Menunggu Review"
          value={stats.pending_review}
          icon={Clock}
          variant="warning"
          trend={{ value: 3, positive: false }}
          className="rounded-2xl shadow-sm"
        />
      </div>

      {/* Interview Schedule Widget for SR Staff / Reviewer */}
      {(userRole === "recruiter" || todayInterviews.length > 0) && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Jadwal Wawancara Saya Hari Ini</h3>
                <p className="text-xs text-muted-foreground">
                  {todayInterviews.length > 0
                    ? `${todayInterviews.length} sesi wawancara menanti Anda`
                    : "Tidak ada jadwal wawancara hari ini"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 bg-muted/30 font-mono">
              <CalendarRange className="w-3 h-3 text-primary" />
              {format(new Date(), "EEEE, d MMM yyyy", { locale: localeId })}
            </Badge>
          </div>

          {todayInterviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayInterviews.map((iv) => (
                <div
                  key={iv.id}
                  className="rounded-xl border border-border/80 bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-600 text-xs">
                        {iv.candidates?.full_name?.charAt(0) || "K"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                          {iv.candidates?.full_name || "Kandidat"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {iv.candidates?.email}
                        </p>
                      </div>
                    </div>
                    {iv.candidates?.total_score != null && (
                      <ScoreBadge score={iv.candidates.total_score} />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono font-bold text-foreground">
                        {iv.scheduled_at
                          ? format(parseISO(iv.scheduled_at), "HH:mm", { locale: localeId }) + " WIB"
                          : "—"}
                      </span>
                    </div>
                    {iv.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Video className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate">{iv.location}</span>
                      </div>
                    )}
                    {iv.candidates?.job_title && (
                      <Badge variant="secondary" className="text-[10px] mt-1 bg-primary/5 text-primary border border-primary/10">
                        {iv.candidates.job_title}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/60">
                    <Link
                      href={`/candidates/${iv.candidates?.id || iv.candidate_id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "w-full justify-center text-xs gap-1 h-7"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Buka Detail Wawancara
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-muted/10 rounded-xl border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">
                🎉 Tidak ada jadwal wawancara untuk hari ini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Analytics Grid: Area Chart + Qualification Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Grafik Tren Pelamar Kerja
              </h3>
              <p className="text-xs text-muted-foreground">{timeRangeLabels[timeRange]}</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val || "14d")}>
                <SelectTrigger className="h-8 text-xs w-[130px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                  <SelectItem value="14d">14 Hari Terakhir</SelectItem>
                  <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                  <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground text-[11px]">Total Pelamar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground text-[11px]">Qualified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "var(--foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="applicants"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorApplicants)"
                  name="Total Pelamar"
                />
                <Area
                  type="monotone"
                  dataKey="qualified"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorQualified)"
                  name="Qualified"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qualification Donut Chart */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Rasio Kelulusan Screening
              </h3>
            </div>

            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => `${Number(val).toFixed(1)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold tracking-tight">{qualPct}%</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Qualified</span>
              </div>
            </div>

            {/* Summary List */}
            <div className="space-y-2 border-t border-border/60 pt-3 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Lolos Mandatory AI
                </span>
                <span className="font-bold text-emerald-500">{qualPct}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Belum Memenuhi
                </span>
                <span className="font-bold text-rose-500">{(100 - qualPct).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Active Jobs Widget */}
          <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lowongan Aktif</h4>
              <Link href="/jobs" className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5">
                Lihat Semua <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {activeJobs.slice(0, 3).map((j: any) => (
                <Link
                  key={j.id}
                  href={`/jobs/${j.id}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/40 transition-all text-xs group"
                >
                  <span className="font-semibold truncate group-hover:text-primary transition-colors">{j.title}</span>
                  <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                    {j.candidate_count} pelamar
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Candidates Card */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/60 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Kandidat Terbaru
            </h3>
            <p className="text-xs text-muted-foreground">
              Pelamar terbaru yang telah diproses oleh AI Screening
            </p>
          </div>
          <Link
            href="/candidates"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs gap-1.5 rounded-lg")}
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat Semua Kandidat
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border/60">
              <tr>
                <th className="p-4">Kandidat</th>
                <th className="p-4">Posisi Lowongan</th>
                <th className="p-4 text-center">Skor AI</th>
                <th className="p-4 text-center">Tahapan / Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Belum ada kandidat mendaftar.
                  </td>
                </tr>
              ) : (
                recentCandidates.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground">{c.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {c.job_title}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <ScoreBadge score={c.total_score} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={c.current_stage_name || c.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/candidates/${c.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 w-7 p-0 rounded-lg")}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
