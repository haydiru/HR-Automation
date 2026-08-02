"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Copy,
  Mail,
  Eye,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Download,
  UserCheck,
  Calendar,
  CheckSquare,
  SlidersHorizontal,
  RefreshCw,
  ChevronRight,
  Ban,
  Layers,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { AIInsightModal } from "@/components/ui/ai-insight-modal";
import { ScheduleInterviewModal } from "@/components/ui/schedule-interview-modal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface Stage {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color: string;
  is_system?: boolean;
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<any>(null);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("all");
  const [selectedStageFilter, setSelectedStageFilter] = useState("all");

  // Modals & Selection
  const [insightCandidate, setInsightCandidate] = useState<Candidate | null>(null);
  const [scheduleModalCandidate, setScheduleModalCandidate] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updatingBulk, setUpdatingBulk] = useState(false);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobRes, candidatesRes, stagesRes, teamRes] = await Promise.all([
          fetch(`/api/jobs/${jobId}`),
          fetch(`/api/jobs/${jobId}/candidates`),
          fetch(`/api/jobs/${jobId}/stages`),
          supabase.from("profiles").select("id, full_name, email, role"),
        ]);

        if (jobRes.ok) setJob(await jobRes.json());
        if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          setStages(stagesData.stages || []);
        }
        if (teamRes.data) setTeamMembers(teamRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Memuat data lowongan & pipeline...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Lowongan tidak ditemukan.</p>
      </div>
    );
  }

  // Count candidates per stage
  const stageCounts: Record<string, number> = {};
  let rejectedCount = 0;
  allCandidates.forEach((c) => {
    const stageName = c.current_stage_name || c.status || "Pending";
    if (stageName === "Rejected") {
      rejectedCount++;
    } else {
      stageCounts[stageName] = (stageCounts[stageName] || 0) + 1;
    }
  });

  // Filter Candidates
  const filteredCandidates = allCandidates.filter((c) => {
    const matchSearch =
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());

    const matchReady = readyOnly
      ? c.is_qualified && c.total_score >= job.passing_grade
      : true;

    let matchStaff = true;
    if (selectedStaffFilter === "unassigned") {
      matchStaff = !c.assigned_to_user_id;
    } else if (selectedStaffFilter !== "all") {
      matchStaff = c.assigned_to_user_id === selectedStaffFilter;
    }

    let matchStage = true;
    if (selectedStageFilter === "rejected") {
      const sn = c.current_stage_name || c.status || "Pending";
      matchStage = sn === "Rejected";
    } else if (selectedStageFilter !== "all") {
      const sn = c.current_stage_name || c.status || "Pending";
      matchStage = sn === selectedStageFilter;
    }

    return matchSearch && matchReady && matchStaff && matchStage;
  });

  const qualifiedCount = allCandidates.filter((c) => c.is_qualified).length;

  // Multi-Select Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Advance candidate to next stage
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
        // Refresh candidates list
        const candidatesRes = await fetch(`/api/jobs/${jobId}/candidates`);
        if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
      } else {
        alert(data.message || data.error || "Gagal memajukan kandidat.");
      }
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setAdvancingId(null);
    }
  };

  // Reject candidate
  const handleReject = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menolak ${candidateName}?`)) return;

    try {
      const res = await fetch(`/api/candidates/${candidateId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const candidatesRes = await fetch(`/api/jobs/${jobId}/candidates`);
        if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal menolak kandidat.");
      }
    } catch (err: any) {
      alert("Gagal: " + err.message);
    }
  };

  // Bulk Stage Advance
  const handleBulkAdvance = async () => {
    if (selectedIds.length === 0) return;
    setUpdatingBulk(true);

    try {
      for (const id of selectedIds) {
        await fetch(`/api/candidates/${id}/advance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      }
      const candidatesRes = await fetch(`/api/jobs/${jobId}/candidates`);
      if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
      setSelectedIds([]);
      alert(`✅ ${selectedIds.length} kandidat berhasil dimajukan ke tahapan selanjutnya!`);
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setUpdatingBulk(false);
    }
  };

  // Bulk Reject
  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menolak ${selectedIds.length} kandidat?`)) return;

    setUpdatingBulk(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/candidates/${id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      }
      const candidatesRes = await fetch(`/api/jobs/${jobId}/candidates`);
      if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
      setSelectedIds([]);
      alert(`✅ ${selectedIds.length} kandidat berhasil ditolak.`);
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setUpdatingBulk(false);
    }
  };

  // CSV Export Handler
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
      "Skor AI",
      "Status Mandatory",
      "Tahapan Saat Ini",
      "Staf SR Ditugaskan",
      "Jarak ke Kantor (KM)",
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
        c.total_score || 0,
        `"${mandatoryPassed}"`,
        `"${c.current_stage_name || c.status || "Pending"}"`,
        `"${c.assigned_staff_name || "Unassigned"}"`,
        c.distance_to_work ? c.distance_to_work.toFixed(1) : "-",
        `"${format(new Date(c.created_at), "yyyy-MM-dd HH:mm")}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kandidat-${job.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find stage color for a given stage name
  const getStageColor = (stageName: string) => {
    const s = stages.find((st) => st.name === stageName);
    return s?.color || undefined;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Lowongan
      </Link>

      {/* Job Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold">{job.title}</h1>
              <Badge
                className={cn(
                  "text-[10px]",
                  job.status === "active"
                    ? "bg-[oklch(0.72_0.19_145/15%)] text-[oklch(0.72_0.19_145)]"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {job.status === "active" ? "Aktif" : "Ditutup"}
              </Badge>
            </div>
            <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats + Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pelamar</p>
              <p className="text-sm font-bold">{allCandidates.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border">
            <CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.19_145)]" />
            <div>
              <p className="text-xs text-muted-foreground">Qualified</p>
              <p className="text-sm font-bold">{qualifiedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Passing Grade</p>
              <p className="text-sm font-bold font-mono">{job.passing_grade}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email Alias</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(job.alias_email);
                  alert("Email alias berhasil disalin!");
                }}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                {job.alias_email?.length > 25
                  ? job.alias_email.slice(0, 25) + "..."
                  : job.alias_email}
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider">
              Syarat Wajib
            </h4>
            <div className="space-y-1">
              {job.distance_mandatory && job.max_distance && (
                <div className="flex items-start gap-2 text-xs font-medium text-destructive">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Domisili dalam radius maks {job.max_distance} KM dari {job.work_address || "kantor"}</span>
                </div>
              )}
              {job.mandatory_criteria?.map((c: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Syarat Opsional
            </h4>
            <div className="space-y-1">
              {!job.distance_mandatory && job.max_distance && (
                <div className="flex items-start gap-2 text-xs font-medium text-primary">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Domisili dalam radius maks {job.max_distance} KM dari {job.work_address || "kantor"}</span>
                </div>
              )}
              {job.optional_criteria?.map((c: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stages Stepper */}
      {stages.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Distribusi Tahapan Seleksi
            </h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {stages.map((stg, idx) => {
              const count = stageCounts[stg.name] || 0;
              const isActive = selectedStageFilter === stg.name;

              return (
                <div key={stg.id} className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setSelectedStageFilter(isActive ? "all" : stg.name)
                    }
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all",
                      isActive
                        ? "ring-2 ring-primary scale-[1.02]"
                        : "hover:scale-[1.01]"
                    )}
                    style={{
                      borderColor: `${stg.color}40`,
                      backgroundColor: isActive ? `${stg.color}20` : `${stg.color}08`,
                      color: stg.color,
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: stg.color }}
                    >
                      {idx + 1}
                    </span>
                    <span>{stg.name}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 ml-1 bg-black/5 dark:bg-white/10"
                    >
                      {count}
                    </Badge>
                  </button>

                  {idx < stages.length - 1 && (
                    <div className="w-3 h-0.5 bg-border shrink-0" />
                  )}
                </div>
              );
            })}

            {/* Rejected bucket */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-3 h-0.5 bg-border shrink-0" />
              <button
                onClick={() =>
                  setSelectedStageFilter(
                    selectedStageFilter === "rejected" ? "all" : "rejected"
                  )
                }
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all border-destructive/30 text-destructive",
                  selectedStageFilter === "rejected"
                    ? "ring-2 ring-destructive scale-[1.02] bg-destructive/10"
                    : "bg-destructive/5 hover:scale-[1.01]"
                )}
              >
                <Ban className="w-4 h-4" />
                Ditolak
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 ml-1 bg-black/5 dark:bg-white/10"
                >
                  {rejectedCount}
                </Badge>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Pipeline Card */}
      <div className="rounded-xl border border-border bg-card">
        {/* Pipeline Controls Bar */}
        <div className="p-5 pb-3 flex items-center justify-between flex-wrap gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Pipeline Kandidat</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredCandidates.length} Terfilter
            </Badge>
            {selectedStageFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStageFilter("all")}
                className="h-6 text-xs gap-1 text-primary"
              >
                <XCircle className="w-3 h-3" />
                Reset Filter
              </Button>
            )}
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

            {/* Ready Only Filter Switch */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[oklch(0.72_0.19_145/8%)] border border-[oklch(0.72_0.19_145/20%)]">
              <Switch
                id="ready-filter"
                checked={readyOnly}
                onCheckedChange={setReadyOnly}
                className="scale-75"
              />
              <Label
                htmlFor="ready-filter"
                className="text-xs font-medium text-[oklch(0.72_0.19_145)] cursor-pointer whitespace-nowrap"
              >
                Siap Interview
              </Label>
            </div>

            {/* Export CSV Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* BULK ACTION FLOATING BAR (when items are selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">
                {selectedIds.length} Kandidat Dipilih
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Advance */}
              <Button
                size="sm"
                variant="default"
                onClick={handleBulkAdvance}
                disabled={updatingBulk}
                className="h-7 text-xs gap-1.5"
              >
                {updatingBulk ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                Majukan ke Tahap Berikutnya
              </Button>

              {/* Bulk Mandate Assign */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const firstSelected = allCandidates.find((c) => c.id === selectedIds[0]);
                  if (firstSelected) {
                    setScheduleModalCandidate({
                      ...firstSelected,
                      job_title: job.title,
                    });
                  }
                }}
                className="h-7 text-xs gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Beri Mandat SR Staff
              </Button>

              {/* Bulk Reject */}
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkReject}
                disabled={updatingBulk}
                className="h-7 text-xs gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Tolak
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
                className="h-7 text-xs text-muted-foreground"
              >
                Batal
              </Button>
            </div>
          </div>
        )}

        {/* Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="p-4 w-10 text-center">
                  <Checkbox
                    checked={
                      filteredCandidates.length > 0 &&
                      selectedIds.length === filteredCandidates.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </th>
                <th className="p-4">Kandidat</th>
                <th className="p-4 text-center">Skor AI</th>
                <th className="p-4 text-center">Mandatory</th>
                <th className="p-4">Penguji / Mandat SR</th>
                <th className="p-4 text-center">Tahapan</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCandidates.map((c) => {
                const mandatoryPassed = c.analysis_result?.mandatory_check?.every(
                  (m: any) => m.passed
                );
                const isSelected = selectedIds.includes(c.id);
                const currentStageName = c.current_stage_name || c.status || "Pending";
                const isRejected = currentStageName === "Rejected";
                const stageColor = getStageColor(currentStageName);

                return (
                  <tr
                    key={c.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      isSelected && "bg-primary/5",
                      isRejected && "opacity-60"
                    )}
                  >
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectOne(c.id, !!checked)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground">{c.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => setInsightCandidate(c)}
                          className="hover:scale-110 transition-transform"
                        >
                          <ScoreBadge
                            score={c.total_score}
                            passingGrade={job.passing_grade}
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
                      <StatusBadge status={currentStageName} color={stageColor} />
                    </td>
                    <td className="p-4 text-[11px] text-muted-foreground font-mono">
                      {format(new Date(c.created_at), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Advance to Next Stage */}
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
                            <TooltipContent className="text-xs">Majukan ke Tahap Berikutnya</TooltipContent>
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

                        {/* Mandate & Schedule Button */}
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() =>
                              setScheduleModalCandidate({
                                ...c,
                                job_title: job.title,
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
              })}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              {selectedStageFilter !== "all"
                ? `Tidak ada kandidat di tahapan "${selectedStageFilter === "rejected" ? "Ditolak" : selectedStageFilter}".`
                : readyOnly
                ? "Tidak ada kandidat yang siap interview."
                : "Belum ada kandidat untuk lowongan ini."}
            </p>
          </div>
        )}
      </div>

      {/* AI Insight Modal */}
      {insightCandidate && (
        <AIInsightModal
          open={!!insightCandidate}
          onOpenChange={(open) => !open && setInsightCandidate(null)}
          candidateName={insightCandidate.full_name}
          analysis={insightCandidate.analysis_result}
          passingGrade={job.passing_grade}
        />
      )}

      {/* Schedule & Mandate Modal */}
      {scheduleModalCandidate && (
        <ScheduleInterviewModal
          isOpen={!!scheduleModalCandidate}
          onClose={() => setScheduleModalCandidate(null)}
          candidate={scheduleModalCandidate}
          teamMembers={teamMembers}
          onSuccess={() => {
            // Refresh list
            fetch(`/api/jobs/${jobId}/candidates`)
              .then((res) => res.json())
              .then((data) => setAllCandidates(data));
          }}
        />
      )}
    </div>
  );
}
