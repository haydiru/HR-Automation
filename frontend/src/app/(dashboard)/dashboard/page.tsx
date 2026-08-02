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
  const [timeRange, setTimeRange] = useState("14d"); // 7d, 14d, 30d, 90d
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

        // Get user profile and role
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

          // Get today's interviews assigned to this user
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
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Memuat data dashboard...</p>
      </div>
    );
  }

  const { stats, chartData, recentCandidates, activeJobs } = data || {
    stats: { total_applicants_today: 0, qualified_percentage: 0, active_jobs: 0, pending_review: 0 },
    chartData: [],
    recentCandidates: [],
    activeJobs: []
  };

  // Donut chart data
  const qualPct = stats.qualified_percentage || 0;
  const donutData = [
    { name: "Qualified", value: qualPct, color: "oklch(0.72 0.19 145)" },
    { name: "Not Qualified", value: 100 - qualPct, color: "oklch(0.45 0.12 15)" },
  ];

  // Today's interviews
  const todayInterviews = myInterviews.filter(
    (iv) => iv.scheduled_at && isToday(parseISO(iv.scheduled_at))
  );

  // Time range labels
  const timeRangeLabels: Record<string, string> = {
    "7d": "7 Hari Terakhir",
    "14d": "14 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    "90d": "90 Hari Terakhir",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang kembali, {currentUserName}! Berikut ringkasan rekrutmen Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/jobs"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Lihat Semua
          </Link>
          <Link
            href="/jobs/create"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Lowongan Baru
          </Link>
        </div>
      </div>

      {/* Personal Interview Widget for SR Staff */}
      {(userRole === "recruiter" || todayInterviews.length > 0) && (
        <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-purple-500/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Jadwal Wawancara Saya Hari Ini</h3>
                <p className="text-xs text-muted-foreground">
                  {todayInterviews.length > 0
                    ? `${todayInterviews.length} wawancara dijadwalkan`
                    : "Tidak ada wawancara hari ini"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <CalendarRange className="w-3 h-3" />
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
            </Badge>
          </div>

          {todayInterviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {todayInterviews.map((iv) => (
                <div
                  key={iv.id}
                  className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {iv.candidates?.full_name || "Kandidat"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
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
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold text-foreground">
                        {iv.scheduled_at
                          ? format(parseISO(iv.scheduled_at), "HH:mm", { locale: localeId })
                          : "—"}
                      </span>
                    </div>
                    {iv.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Video className="w-3.5 h-3.5" />
                        <span className="truncate">{iv.location}</span>
                      </div>
                    )}
                    {iv.candidates?.job_title && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {iv.candidates.job_title}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border">
                    <Link
                      href={`/candidates/${iv.candidates?.id || iv.candidate_id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "w-full justify-center text-xs gap-1"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                🎉 Tidak ada wawancara yang dijadwalkan untuk hari ini. Nikmati harimu!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pelamar Hari Ini"
          value={stats.total_applicants_today}
          icon={Users}
          variant="primary"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Persentase Qualified"
          value={`${stats.qualified_percentage}%`}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          label="Lowongan Aktif"
          value={stats.active_jobs}
          icon={Briefcase}
          variant="default"
        />
        <StatCard
          label="Menunggu Review"
          value={stats.pending_review}
          icon={Clock}
          variant="warning"
          trend={{ value: 3, positive: false }}
        />
      </div>

      {/* Charts Row: Area Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart with Time Range Filter */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Tren Pelamar</h3>
              <p className="text-xs text-muted-foreground">{timeRangeLabels[timeRange]}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val || "14d")}>
                <SelectTrigger className="h-7 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Hari</SelectItem>
                  <SelectItem value="14d">14 Hari</SelectItem>
                  <SelectItem value="30d">30 Hari</SelectItem>
                  <SelectItem value="90d">90 Hari</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Pelamar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.72_0.19_145)]" />
                  <span className="text-muted-foreground">Qualified</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.72 0.19 145)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.72 0.19 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.02 250)" }}
                  axisLine={{ stroke: "oklch(0.28 0.02 260)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.02 250)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "oklch(0.17 0.012 260)",
                    border: "1px solid oklch(0.28 0.02 260)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "oklch(0.93 0.01 250)" }}
                />
                <Area
                  type="monotone"
                  dataKey="applicants"
                  stroke="oklch(0.65 0.2 250)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApplicants)"
                  name="Pelamar"
                />
                <Area
                  type="monotone"
                  dataKey="qualified"
                  stroke="oklch(0.72 0.19 145)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorQualified)"
                  name="Qualified"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Qualification Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Distribusi Kelulusan</h3>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "oklch(0.17 0.012 260)",
                    border: "1px solid oklch(0.28 0.02 260)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary under donut */}
          <div className="mt-4 space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "oklch(0.72 0.19 145)" }} />
                Qualified
              </span>
              <span className="font-bold">{qualPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "oklch(0.45 0.12 15)" }} />
                Not Qualified
              </span>
              <span className="font-bold">{(100 - qualPct).toFixed(1)}%</span>
            </div>
          </div>

          {/* Active Jobs List */}
          <div className="mt-5 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lowongan Aktif</h4>
              <Link
                href="/jobs"
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
              >
                Semua <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {activeJobs.slice(0, 4).map((job: any) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                      {job.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {job.candidate_count} pelamar · {job.qualified_count} qualified
                    </p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold">Kandidat Terbaru</h3>
            <p className="text-xs text-muted-foreground">
              5 pelamar terakhir dari semua lowongan
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kandidat
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Lowongan
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Skor AI
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {recentCandidates.map((c: any) => (
                <tr
                  key={c.id}
                  className="border-t border-border hover:bg-accent/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {c.job_title}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <ScoreBadge score={c.total_score} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/candidates/${c.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" })
                      )}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
