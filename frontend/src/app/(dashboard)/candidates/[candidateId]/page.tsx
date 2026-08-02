"use client";

import { use, useState, useEffect, useRef } from "react";
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
  MapPin,
  UserCheck,
  CalendarDays,
  RefreshCw,
  Clock,
  MessageSquare,
  Printer,
  Save,
  Send,
  Video,
  Loader2,
} from "lucide-react";
import { DistanceMap } from "@/components/ui/distance-map";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { ScheduleInterviewModal } from "@/components/ui/schedule-interview-modal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CandidateStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CandidateStatus>("Pending");

  // Interview modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // HR Notes & Evaluation
  const [hrNotes, setHrNotes] = useState("");
  const [evaluationComments, setEvaluationComments] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const [res, teamRes] = await Promise.all([
          fetch(`/api/candidates/${candidateId}`),
          supabase.from("profiles").select("id, full_name, email, role"),
        ]);

        if (res.ok) {
          const json = await res.json();
          setData(json);
          setStatus(json.status);
          setHrNotes(json.hr_notes || "");
          setEvaluationComments(json.evaluation_comments || "");
        }

        if (teamRes.data) setTeamMembers(teamRes.data);
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

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      await supabase
        .from("candidates")
        .update({
          hr_notes: hrNotes,
          evaluation_comments: evaluationComments,
        })
        .eq("id", candidateId);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePrintSummary = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !data) return;

    const analysis = data.analysis_result;
    const mandatoryHtml = analysis?.mandatory_check
      ?.map(
        (item: any) =>
          `<tr><td style="padding:6px 10px;border:1px solid #ddd">${item.criteria}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${item.passed ? "✅ Lulus" : "❌ Gagal"}</td><td style="padding:6px 10px;border:1px solid #ddd">${item.note || "-"}</td></tr>`
      )
      .join("") || "";

    const skillsHtml = (analysis?.skills_found || analysis?.found_skills || [])
      .map((s: string) => `<span style="display:inline-block;background:#f0f0f0;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px">${s}</span>`)
      .join(" ");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ringkasan Kandidat - ${data.full_name}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          h2 { font-size: 15px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 24px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 16px; }
          .score-box { background: #f8f9fa; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
          .score-box .score { font-size: 36px; font-weight: bold; }
          .score-box .label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
          th { background: #f0f0f0; text-align: left; padding: 8px 10px; border: 1px solid #ddd; font-size: 12px; }
          .notes-section { background: #fffde7; border: 1px solid #fdd835; border-radius: 6px; padding: 12px; margin: 8px 0; font-size: 13px; white-space: pre-wrap; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${data.full_name}</h1>
        <div class="meta">
          ${data.email} · ${data.phone || "-"} · Lowongan: ${data.job_title || "-"}<br/>
          Tanggal Apply: ${format(new Date(data.created_at), "d MMMM yyyy, HH:mm", { locale: localeId })}
          ${data.domicile_address ? `<br/>Domisili: ${data.domicile_address}` : ""}
          ${data.distance_to_work != null ? ` (${data.distance_to_work.toFixed(1)} km dari kantor)` : ""}
        </div>

        <div class="score-box">
          <div class="score">${analysis?.total_score ?? "-"}</div>
          <div class="label">Skor AI${data.is_qualified ? " — ✅ QUALIFIED" : " — ❌ NOT QUALIFIED"}</div>
        </div>

        <h2>Syarat Wajib (Mandatory Check)</h2>
        <table>
          <thead><tr><th>Kriteria</th><th style="text-align:center">Status</th><th>Catatan</th></tr></thead>
          <tbody>${mandatoryHtml}</tbody>
        </table>

        <h2>Keahlian Ditemukan</h2>
        <div>${skillsHtml || "<em>Tidak ada data keahlian</em>"}</div>

        <h2>Analisis AI</h2>
        <p style="font-size:13px;line-height:1.6">${analysis?.reasoning || "-"}</p>

        ${data.assigned_staff_name ? `
          <h2>Penugasan & Jadwal Wawancara</h2>
          <p style="font-size:13px">Penguji SR Staff: <strong>${data.assigned_staff_name}</strong></p>
          ${data.scheduled_at ? `<p style="font-size:13px">Jadwal: <strong>${format(new Date(data.scheduled_at), "d MMMM yyyy, HH:mm", { locale: localeId })}</strong></p>` : ""}
          ${data.location ? `<p style="font-size:13px">Lokasi: ${data.location}</p>` : ""}
        ` : ""}

        ${hrNotes ? `<h2>Catatan Internal HRD</h2><div class="notes-section">${hrNotes}</div>` : ""}
        ${evaluationComments ? `<h2>Hasil Evaluasi Wawancara</h2><div class="notes-section">${evaluationComments}</div>` : ""}

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center">
          Dicetak pada ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: localeId })} — HR Automation System
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
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
    <div className="p-6 space-y-6" ref={printRef}>
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
            {candidate.domicile_address && (
              <span className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                <MapPin className="w-3.5 h-3.5" />
                Domisili: {candidate.domicile_address} 
                {candidate.distance_to_work !== null && candidate.distance_to_work !== undefined && (
                  <span className="font-bold">
                    &nbsp;({candidate.distance_to_work.toFixed(1)} km dari kantor)
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1.5">
            <Badge variant="secondary" className="text-xs">
              {candidate.job_title}
            </Badge>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Status Updater + Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={status}
            onValueChange={(v: any) => handleStatusChange(v as CandidateStatus)}
          >
            <SelectTrigger className="w-[160px] h-9">
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

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowScheduleModal(true)}
            className="gap-1.5"
          >
            <CalendarDays className="w-4 h-4" />
            {candidate.assigned_to_user_id ? "Ubah Jadwal" : "Beri Mandat"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintSummary}
            className="gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF
          </Button>
        </div>
      </div>

      {/* Interview Assignment Card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Penugasan Mandat & Jadwal Wawancara</h3>
        </div>

        {candidate.assigned_to_user_id ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Assigned Staff */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Penguji SR Staff</p>
                <p className="text-sm font-bold mt-0.5">{candidate.assigned_staff_name || "—"}</p>
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Jadwal Wawancara</p>
                <p className="text-sm font-bold mt-0.5">
                  {candidate.scheduled_at
                    ? format(new Date(candidate.scheduled_at), "d MMM yyyy, HH:mm", { locale: localeId })
                    : "Belum Dijadwalkan"}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/15">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Lokasi / Meeting</p>
                <p className="text-sm font-medium mt-0.5 break-all">
                  {candidate.location || "—"}
                </p>
              </div>
            </div>

            {/* Interview Status */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status Wawancara</p>
                <p className="text-sm font-bold mt-0.5">
                  {candidate.interview_status || "Menunggu"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed border-border">
            <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Kandidat belum dimandatkan ke SR Staff.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => setShowScheduleModal(true)}
            >
              <CalendarDays className="w-4 h-4" />
              Beri Mandat & Jadwalkan Wawancara
            </Button>
          </div>
        )}
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

          {/* Distance Map Visualization */}
          {candidate.domicile_latitude !== null &&
            candidate.domicile_latitude !== undefined &&
            candidate.domicile_longitude !== null &&
            candidate.domicile_longitude !== undefined &&
            job?.work_latitude !== null &&
            job?.work_latitude !== undefined &&
            job?.work_longitude !== null &&
            job?.work_longitude !== undefined && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <DistanceMap
                  workLocation={{
                    lat: job.work_latitude,
                    lng: job.work_longitude,
                    address: job.work_address
                  }}
                  domicileLocation={{
                    lat: candidate.domicile_latitude,
                    lng: candidate.domicile_longitude,
                    address: candidate.domicile_address
                  }}
                />
              </div>
            )}

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

      {/* HR Notes & Evaluation Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Catatan Internal HRD & Evaluasi Wawancara</h3>
          </div>
          <div className="flex items-center gap-2">
            {notesSaved && (
              <span className="text-xs text-[oklch(0.72_0.19_145)] flex items-center gap-1 animate-in fade-in duration-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tersimpan!
              </span>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="gap-1.5"
            >
              {savingNotes ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Simpan Catatan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* HR Internal Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Catatan Internal HRD
            </label>
            <Textarea
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              placeholder="Tulis catatan internal mengenai kandidat ini... (hanya terlihat oleh tim HRD)"
              className="min-h-[140px] text-sm resize-y"
            />
            <p className="text-[11px] text-muted-foreground">
              Catatan ini bersifat internal dan hanya terlihat oleh tim HRD perusahaan.
            </p>
          </div>

          {/* Interview Evaluation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hasil Evaluasi Wawancara
            </label>
            <Textarea
              value={evaluationComments}
              onChange={(e) => setEvaluationComments(e.target.value)}
              placeholder="Tulis hasil evaluasi wawancara oleh penguji SR Staff... (komentar, penilaian, rekomendasi)"
              className="min-h-[140px] text-sm resize-y"
            />
            <p className="text-[11px] text-muted-foreground">
              Hasil evaluasi dari penguji wawancara (SR Staff) terhadap kandidat.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule & Mandate Modal */}
      {showScheduleModal && (
        <ScheduleInterviewModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          candidate={{
            id: candidate.id,
            full_name: candidate.full_name,
            email: candidate.email,
            job_title: candidate.job_title,
            assigned_to_user_id: candidate.assigned_to_user_id,
            assigned_staff_name: candidate.assigned_staff_name,
            scheduled_at: candidate.scheduled_at,
            location: candidate.location,
            notes: candidate.notes,
          }}
          teamMembers={teamMembers}
          onSuccess={() => {
            // Refresh candidate data
            fetch(`/api/candidates/${candidateId}`)
              .then((res) => res.json())
              .then((json) => {
                setData(json);
                setStatus(json.status);
              });
          }}
        />
      )}
    </div>
  );
}
