"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  UserCheck,
  Zap,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
} from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const CHART_COLORS = ["#10b981", "#6366f1", "#f43f5e"];

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const [profRes, jobsRes, candRes] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            fetch("/api/jobs"),
            supabase
              .from("candidates")
              .select("*, jobs(id, title, passing_grade)")
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

          if (profRes.data) setProfile(profRes.data);
          if (jobsRes.ok) setJobs(await jobsRes.json());
          if (candRes.data) setCandidates(candRes.data);

          const intRes = await fetch(`/api/interviews?staffId=${user.id}`);
          if (intRes.ok) setInterviews(await intRes.json());
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Memuat data dashboard...</p>
      </div>
    );
  }

  const activeJobsCount = jobs.filter((j) => j.status === "active").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.candidate_count || 0), 0);
  const totalQualified = jobs.reduce((sum, j) => sum + (j.qualified_count || 0), 0);

  const qualPieData = [
    { name: "Qualified", value: totalQualified || 1 },
    { name: "In Pipeline", value: Math.max(0, totalApplicants - totalQualified) || 1 },
  ];

  const trendData = [
    { month: "Jan", pelamar: 12, qualified: 8 },
    { month: "Feb", pelamar: 24, qualified: 16 },
    { month: "Mar", pelamar: 18, qualified: 12 },
    { month: "Apr", pelamar: 35, qualified: 26 },
    { month: "Mei", pelamar: 42, qualified: 31 },
    { month: "Jun", pelamar: totalApplicants || 50, qualified: totalQualified || 38 },
  ];

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Tim HR";

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              Obsidian Intelligence Engine Active
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Selamat datang kembali, <span className="gradient-text">{displayName}</span>! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ringkasan aktivitas rekrutmen perusahaan Anda hari ini. {activeJobsCount} lowongan aktif sedang menerima dan memproses berkas kandidat secara otomatis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
            <Link
              href="/jobs/create"
              className={cn(buttonVariants({ size: "sm" }), "h-10 text-xs rounded-xl shadow-lg shadow-primary/20 gap-1.5 w-full sm:w-auto justify-center")}
            >
              <Plus className="w-4 h-4" />
              Buat Lowongan Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Lowongan Aktif"
          value={activeJobsCount}
          icon={Briefcase}
          variant="primary"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Total Pelamar"
          value={totalApplicants}
          icon={Users}
          trend={{ value: 24, positive: true }}
        />
        <StatCard
          label="Kandidat Qualified"
          value={totalQualified}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 18, positive: true }}
        />
        <StatCard
          label="Mandat Wawancara"
          value={interviews.length}
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Tren Pertumbuhan Pelamar & Qualified Rate
              </h3>
              <p className="text-xs text-muted-foreground">
                Perbandingan total berkas masuk vs kandidat yang memenuhi kriteria
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
              6 Bulan Terakhir
            </Badge>
          </div>

          <div className="h-60 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPelamar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pelamar"
                  name="Total Pelamar"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#colorPelamar)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="qualified"
                  name="Qualified AI"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorQualified)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qualification Pie Chart */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Rasio Kualifikasi AI
            </h3>
            <p className="text-xs text-muted-foreground">
              Proporsi kandidat lulus passing grade
            </p>
          </div>

          <div className="h-48 sm:h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {qualPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl sm:text-2xl font-extrabold font-mono">
                {totalApplicants > 0 ? Math.round((totalQualified / totalApplicants) * 100) : 0}%
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Pass Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Qualified</span>
              <span className="text-sm font-bold text-emerald-500 font-mono">{totalQualified}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">In Review</span>
              <span className="text-sm font-bold text-indigo-500 font-mono">{totalApplicants - totalQualified}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Interviews Widget */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-500" />
              Agenda Wawancara Anda
            </h3>
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {interviews.length} Mandat
            </Badge>
          </div>

          <div className="space-y-3">
            {interviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                Belum ada jadwal wawancara yang dimandatkan untuk Anda.
              </div>
            ) : (
              interviews.slice(0, 4).map((int: any) => (
                <div
                  key={int.id}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold text-foreground truncate">{int.candidate_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{int.job_title}</p>
                    {int.scheduled_at && (
                      <p className="text-[10px] text-purple-500 font-mono font-semibold">
                        📅 {format(new Date(int.scheduled_at), "d MMM yyyy, HH:mm", { locale: localeId })} WIB
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/candidates/${int.candidate_id}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 w-7 p-0 shrink-0")}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Candidates Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Kandidat Pelamar Terbaru
            </h3>
            <Link
              href="/candidates"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  <th className="p-3">Nama Pelamar</th>
                  <th className="p-3">Lowongan</th>
                  <th className="p-3 text-center">Skor AI</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Belum ada pelamar baru.
                    </td>
                  </tr>
                ) : (
                  candidates.slice(0, 5).map((c: any) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                        {c.full_name}
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {c.jobs?.title || c.job_title}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <ScoreBadge
                          score={c.total_score}
                          passingGrade={c.jobs?.passing_grade || 70}
                        />
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <StatusBadge status={c.current_stage_name || c.status} />
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link
                          href={`/candidates/${c.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 w-7 p-0")}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
    </div>
  );
}
