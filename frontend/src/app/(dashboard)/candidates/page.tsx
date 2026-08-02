"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Briefcase,
  ChevronRight,
  Download,
  RefreshCw,
  Sparkles,
  UserCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/language-context";
import { format } from "date-fns";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [qualifiedOnly, setQualifiedOnly] = useState(false);

  const { t } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [candRes, jobsRes, staffRes] = await Promise.all([
        supabase
          .from("candidates")
          .select("*, jobs(id, title, passing_grade)")
          .order("created_at", { ascending: false }),
        fetch("/api/jobs"),
        fetch("/api/team"),
      ]);

      if (candRes.data) setCandidates(candRes.data);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (staffRes.ok) setStaffList(await staffRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.jobs?.title && c.jobs.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesJob = selectedJob === "all" || c.job_id === selectedJob;
    const matchesStaff = selectedStaff === "all" || c.assigned_staff_id === selectedStaff;

    const passingGrade = c.jobs?.passing_grade || 70;
    const isQual = c.is_mandatory_passed && c.total_score >= passingGrade;
    const matchesQual = !qualifiedOnly || isQual;

    return matchesSearch && matchesJob && matchesStaff && matchesQual;
  });

  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) return;
    const headers = ["ID", "Full Name", "Email", "Phone", "Job Position", "AI Score", "Mandatory Passed", "Stage", "Applied Date"];
    const rows = filteredCandidates.map((c) => [
      c.id,
      `"${c.full_name}"`,
      c.email,
      c.phone || "",
      `"${c.jobs?.title || c.job_title || ""}"`,
      c.total_score || 0,
      c.is_mandatory_passed ? "YES" : "NO",
      `"${c.current_stage_name || c.status || ""}"`,
      c.created_at ? format(new Date(c.created_at), "yyyy-MM-dd HH:mm") : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_candidates_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading candidates list...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            {t("cand_list_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("cand_list_subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={loadData} variant="outline" size="sm" className="gap-2 h-9 text-xs rounded-xl">
            <RefreshCw className="w-3.5 h-3.5" />
            {t("cand_refresh")}
          </Button>
          <Button onClick={handleExportCSV} size="sm" className="gap-2 h-9 text-xs rounded-xl shadow-lg shadow-primary/20">
            <Download className="w-3.5 h-3.5" />
            {t("cand_export_csv")}
          </Button>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or job position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-muted/30"
            />
          </div>

          <Select value={selectedJob} onValueChange={(val: any) => setSelectedJob(val || "all")}>
            <SelectTrigger className="w-full text-xs h-9 rounded-xl">
              <SelectValue placeholder="Select Job Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs ({jobs.length})</SelectItem>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStaff} onValueChange={(val: any) => setSelectedStaff(val || "all")}>
            <SelectTrigger className="w-full text-xs h-9 rounded-xl">
              <SelectValue placeholder="Filter SR Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SR Staff ({staffList.length})</SelectItem>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant={qualifiedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setQualifiedOnly(!qualifiedOnly)}
              className="h-7 text-[11px] rounded-lg gap-1.5 font-bold"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {t("cand_filter_ready")}
            </Button>
          </div>
          <span className="text-muted-foreground text-[11px] font-mono">
            Showing <strong className="text-foreground">{filteredCandidates.length}</strong> candidates
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/20 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4">{t("cand_table_candidate")}</th>
                <th className="p-4">{t("cand_table_job")}</th>
                <th className="p-4 text-center">{t("cand_table_score")}</th>
                <th className="p-4 text-center">{t("cand_table_mandatory")}</th>
                <th className="p-4">{t("cand_table_staff")}</th>
                <th className="p-4 text-center">{t("cand_table_stage")}</th>
                <th className="p-4">{t("cand_table_date")}</th>
                <th className="p-4 text-right">{t("cand_table_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    No candidates match your search query.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-foreground">{c.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.email}</p>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground font-medium">
                      {c.jobs?.title || c.job_title}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <ScoreBadge
                        score={c.total_score}
                        passingGrade={c.jobs?.passing_grade || 70}
                      />
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {c.is_mandatory_passed ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {c.assigned_staff_name ? (
                        <span className="flex items-center gap-1.5 text-purple-500 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          {c.assigned_staff_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <StatusBadge status={c.current_stage_name || c.status} />
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {c.created_at ? format(new Date(c.created_at), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Link href={`/candidates/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xl gap-1 font-semibold">
                          Details
                          <ChevronRight className="w-4 h-4" />
                        </Button>
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
