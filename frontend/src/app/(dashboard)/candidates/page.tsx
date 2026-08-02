"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  XCircle,
  UserCheck,
  Calendar,
  ChevronRight,
  Ban,
  Filter,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScheduleInterviewModal } from "@/components/ui/schedule-interview-modal";
import { AIInsightModal } from "@/components/ui/ai-insight-modal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("all");
  const [qualifiedOnly, setQualifiedOnly] = useState(false);

  // Modals
  const [insightCandidate, setInsightCandidate] = useState<any | null>(null);
  const [scheduleModalCandidate, setScheduleModalCandidate] = useState<any | null>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const supabase = createClient();

  async function loadData() {
    setLoading(true);
    try {
      const [candRes, jobsRes, teamRes] = await Promise.all([
        supabase
          .from("candidates")
          .select("*, jobs(id, title, passing_grade, user_id, use_custom_stages)")
          .order("created_at", { ascending: false }),
        supabase.from("jobs").select("id, title").order("title"),
        supabase.from("profiles").select("id, full_name, email, role"),
      ]);

      if (candRes.data) setCandidates(candRes.data);
      if (jobsRes.data) setJobs(jobsRes.data);
      if (teamRes.data) setTeamMembers(teamRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Action: Advance
  const handleAdvance = async (candidateId: string) => {
    setAdvancingId(candidateId);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.success) {
        await loadData();
      } else {
        alert(data.message || data.error || "Gagal memajukan kandidat.");
      }
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setAdvancingId(null);
    }
  };

  // Action: Reject
  const handleReject = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menolak ${candidateName}?`)) return;

    try {
      const res = await fetch(`/api/candidates/${candidateId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        await loadData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal menolak kandidat.");
      }
    } catch (err: any) {
      alert("Gagal: " + err.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      alert("Tidak ada data kandidat untuk di-export.");
      return;
    }

    const headers = [
      "ID",
      "Nama Lengkap",
      "Email",
      "Telepon",
      "Posisi Lowongan",
      "Skor AI",
      "Status Mandatory",
      "Tahapan",
      "Staf SR Ditugaskan",
      "Tanggal Apply",
    ];

    const rows = filteredCandidates.map((c) => {
      const mandatoryPassed = c.analysis_result?.mandatory_check?.every((m: any) => m.passed)
        ? "LULUS"
        : "GAGAL";

      return [
        `"${c.id}"`,
        `"${c.full_name || ""}"`,
        `"${c.email || ""}"`,
        `"${c.phone || ""}"`,
        `"${c.jobs?.title || c.job_title || ""}"`,
        c.total_score || 0,
        `"${mandatoryPassed}"`,
        `"${c.current_stage_name || c.status || "Pending"}"`,
        `"${c.assigned_staff_name || "Unassigned"}"`,
        `"${format(new Date(c.created_at), "yyyy-MM-dd HH:mm")}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `semua-kandidat-${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchSearch =
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());

    const matchJob = selectedJobId === "all" ? true : c.job_id === selectedJobId;

    let matchStaff = true;
    if (selectedStaffFilter === "unassigned") {
      matchStaff = !c.assigned_to_user_id;
    } else if (selectedStaffFilter !== "all") {
      matchStaff = c.assigned_to_user_id === selectedStaffFilter;
    }

    const matchQualified = qualifiedOnly ? c.is_qualified : true;

    return matchSearch && matchJob && matchStaff && matchQualified;
  });

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat seluruh data kandidat...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Daftar Seluruh Kandidat
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau seluruh pelamar kerja lintas lowongan perusahaan Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Candidates List Card */}
      <div className="rounded-xl border border-border bg-card">
        {/* Controls Bar */}
        <div className="p-5 pb-4 flex items-center justify-between flex-wrap gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Semua Pelamar</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredCandidates.length} Terfilter
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama / email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 w-[180px] text-xs"
              />
            </div>

            {/* Filter Lowongan */}
            <Select value={selectedJobId} onValueChange={(val: any) => setSelectedJobId(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[170px]">
                <SelectValue placeholder="Pilih Lowongan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lowongan</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Staff SR */}
            <Select value={selectedStaffFilter} onValueChange={(val: any) => setSelectedStaffFilter(val || "all")}>
              <SelectTrigger className="h-8 text-xs w-[160px]">
                <SelectValue placeholder="Filter Staf SR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Staf SR</SelectItem>
                <SelectItem value="unassigned">Belum Diberikan Mandat</SelectItem>
                {teamMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Qualified Only Switch */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[oklch(0.72_0.19_145/8%)] border border-[oklch(0.72_0.19_145/20%)]">
              <Switch
                id="qualified-filter"
                checked={qualifiedOnly}
                onCheckedChange={setQualifiedOnly}
                className="scale-75"
              />
              <Label
                htmlFor="qualified-filter"
                className="text-xs font-medium text-[oklch(0.72_0.19_145)] cursor-pointer whitespace-nowrap"
              >
                Hanya Qualified
              </Label>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="p-4">Kandidat</th>
                <th className="p-4">Lowongan</th>
                <th className="p-4 text-center">Skor AI</th>
                <th className="p-4 text-center">Mandatory</th>
                <th className="p-4">Penguji SR Staff</th>
                <th className="p-4 text-center">Tahapan</th>
                <th className="p-4">Tanggal Apply</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    Tidak ada data kandidat yang cocok.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const mandatoryPassed = c.analysis_result?.mandatory_check?.every(
                    (m: any) => m.passed
                  );
                  const currentStageName = c.current_stage_name || c.status || "Pending";
                  const isRejected = currentStageName === "Rejected";

                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        isRejected && "opacity-60"
                      )}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-foreground">{c.full_name}</p>
                          <p className="text-[11px] text-muted-foreground">{c.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/jobs/${c.job_id}`}
                          className="hover:underline font-medium text-foreground flex items-center gap-1.5"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{c.jobs?.title || c.job_title || "—"}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setInsightCandidate(c)}
                            className="hover:scale-110 transition-transform"
                          >
                            <ScoreBadge
                              score={c.total_score}
                              passingGrade={c.jobs?.passing_grade || 70}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            Klik untuk melihat insight AI
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="p-4 text-center">
                        {mandatoryPassed ? (
                          <Badge className="bg-[oklch(0.72_0.19_145/15%)] text-[oklch(0.72_0.19_145)] text-[10px]">
                            ✓ Lulus
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/15 text-destructive text-[10px]">
                            ✗ Gagal
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {c.assigned_staff_name ? (
                          <Badge
                            variant="outline"
                            className="gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px]"
                          >
                            <UserCheck className="w-3 h-3" />
                            {c.assigned_staff_name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Belum Ada</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={currentStageName} />
                      </td>
                      <td className="p-4 text-[11px] text-muted-foreground font-mono">
                        {format(new Date(c.created_at), "d MMM yyyy", {
                          locale: localeId,
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Advance */}
                          {!isRejected && (
                            <Tooltip>
                              <TooltipTrigger
                                onClick={() => handleAdvance(c.id)}
                                className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                              >
                                {advancingId === c.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Majukan Tahapan</TooltipContent>
                            </Tooltip>
                          )}

                          {/* Reject */}
                          {!isRejected && (
                            <Tooltip>
                              <TooltipTrigger
                                onClick={() => handleReject(c.id, c.full_name)}
                                className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Tolak Kandidat</TooltipContent>
                            </Tooltip>
                          )}

                          {/* Schedule / Mandate */}
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() =>
                                setScheduleModalCandidate({
                                  ...c,
                                  job_title: c.jobs?.title || c.job_title,
                                })
                              }
                              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Beri Mandat / Jadwal Wawancara</TooltipContent>
                          </Tooltip>

                          {/* AI Insight */}
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => setInsightCandidate(c)}
                              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Insight AI</TooltipContent>
                          </Tooltip>

                          {/* Detail Link */}
                          <Link
                            href={`/candidates/${c.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "h-7 w-7 p-0"
                            )}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insight Modal */}
      {insightCandidate && (
        <AIInsightModal
          open={!!insightCandidate}
          onOpenChange={(open) => !open && setInsightCandidate(null)}
          candidateName={insightCandidate.full_name}
          analysis={insightCandidate.analysis_result}
          passingGrade={insightCandidate.jobs?.passing_grade || 70}
        />
      )}

      {/* Schedule & Mandate Modal */}
      {scheduleModalCandidate && (
        <ScheduleInterviewModal
          isOpen={!!scheduleModalCandidate}
          onClose={() => setScheduleModalCandidate(null)}
          candidate={scheduleModalCandidate}
          teamMembers={teamMembers}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
