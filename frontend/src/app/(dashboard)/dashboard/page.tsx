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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "recharts";



export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

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

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang kembali, Andi! Berikut ringkasan rekrutmen Anda.
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

      {/* Charts + Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Tren Pelamar</h3>
              <p className="text-xs text-muted-foreground">14 hari terakhir</p>
            </div>
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

        {/* Active Jobs */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Lowongan Aktif</h3>
            <Link
              href="/jobs"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {job.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {job.candidate_count} pelamar · {job.qualified_count} qualified
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
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
