"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScoreCircle } from "@/components/ui/score-circle";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CandidateStatus } from "@/types";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CandidateStatus>("Pending");

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/candidates/${candidateId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setStatus(json.status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [candidateId]);

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    setStatus(newStatus);
    try {
      await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Memuat data kandidat...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Kandidat tidak ditemukan.</p>
      </div>
    );
  }

  const candidate = data;
  const job = data.jobs; 
  const analysis = candidate.analysis_result;

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <Link
        href={`/jobs/${candidate.job_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke {candidate.job_title}
      </Link>

      {/* Candidate Header */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{candidate.full_name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              {candidate.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              {candidate.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(candidate.created_at), "d MMMM yyyy, HH:mm", {
                locale: localeId,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className="text-xs">
              {candidate.job_title}
            </Badge>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Status Updater */}
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(v) => handleStatusChange(v as CandidateStatus)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Ready to Interview">
                Siap Interview
              </SelectItem>
              <SelectItem value="Rejected">Ditolak</SelectItem>
              <SelectItem value="Hired">Diterima</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content: CV + Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* CV Viewer — Left */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Curriculum Vitae</span>
            </div>
            {candidate.signed_cv_url && (
              <a 
                href={candidate.signed_cv_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Unduh
              </a>
            )}
          </div>
          <div className="flex-1 h-[700px] bg-muted/20">
            {candidate.signed_cv_url ? (
              <iframe
                src={`${candidate.signed_cv_url}#toolbar=0`}
                className="w-full h-full border-none"
                title="CV Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dokumen tidak tersedia</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis — Right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Score Card */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center">
            <ScoreCircle
              score={analysis.total_score}
              size={140}
              strokeWidth={10}
              passingGrade={job?.passing_grade}
            />
            <p className="text-sm font-medium mt-3 text-center">
              {analysis.summary || analysis.reasoning?.slice(0, 100)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {candidate.is_qualified ? (
                <Badge className="bg-[oklch(0.72_0.19_145/15%)] text-[oklch(0.72_0.19_145)]">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Qualified
                </Badge>
              ) : (
                <Badge className="bg-destructive/15 text-destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Qualified
                </Badge>
              )}
              {job && (
                <Badge variant="outline" className="text-xs font-mono">
                  PG: {job.passing_grade}
                </Badge>
              )}
            </div>
          </div>

          {/* Mandatory Check */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Syarat Wajib
            </h3>
            <div className="space-y-2">
              {analysis.mandatory_check.map((item: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 p-3 rounded-lg text-xs",
                    item.passed
                      ? "bg-[oklch(0.72_0.19_145/8%)] border border-[oklch(0.72_0.19_145/15%)]"
                      : "bg-destructive/8 border border-destructive/15"
                  )}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.19_145)] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{item.criteria}</p>
                    <p className="text-muted-foreground mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Found */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keahlian Ditemukan
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(analysis.skills_found || analysis.found_skills || []).map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Analisis AI
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
