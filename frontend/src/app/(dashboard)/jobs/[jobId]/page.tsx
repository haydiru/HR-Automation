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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buttonVariants } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ui/score-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { AIInsightModal } from "@/components/ui/ai-insight-modal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/types";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<any>(null);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readyOnly, setReadyOnly] = useState(false);
  const [insightCandidate, setInsightCandidate] = useState<Candidate | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobRes, candidatesRes] = await Promise.all([
          fetch(`/api/jobs/${jobId}`),
          fetch(`/api/jobs/${jobId}/candidates`)
        ]);
        
        if (jobRes.ok) setJob(await jobRes.json());
        if (candidatesRes.ok) setAllCandidates(await candidatesRes.json());
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
        <p className="text-sm text-muted-foreground">Memuat data lowongan...</p>
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

  const filteredCandidates = allCandidates.filter((c) => {
    const matchSearch =
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchReady = readyOnly
      ? c.is_qualified && c.total_score >= job.passing_grade
      : true;
    return matchSearch && matchReady;
  });

  const qualifiedCount = allCandidates.filter((c) => c.is_qualified).length;

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
            <p className="text-sm text-muted-foreground">{job.description}</p>
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
                onClick={() => navigator.clipboard.writeText(job.alias_email)}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                {job.alias_email.length > 25
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
              {job.mandatory_criteria.map((c: string, i: number) => (
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
              {job.optional_criteria.map((c: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-5 pb-3 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold">Pipeline Kandidat</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari kandidat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-8 w-[200px] text-xs"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[oklch(0.72_0.19_145/8%)] border border-[oklch(0.72_0.19_145/20%)]">
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kandidat
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Skor AI
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mandatory
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => {
                const mandatoryPassed = c.analysis_result?.mandatory_check?.every(
                  (m: any) => m.passed
                );
                return (
                  <tr
                    key={c.id}
                    className="border-t border-border hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
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
                        <TooltipContent>
                          Klik untuk melihat insight AI
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-5 py-3 text-center">
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
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {format(new Date(c.created_at), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setInsightCandidate(c)}
                            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Sparkles className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent>Insight AI</TooltipContent>
                        </Tooltip>
                        <Link
                          href={`/candidates/${c.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" })
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
              {readyOnly
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
    </div>
  );
}
