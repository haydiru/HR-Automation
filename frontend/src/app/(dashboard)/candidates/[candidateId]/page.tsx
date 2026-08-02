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
  Clock,
  MessageSquare,
  Printer,
  Save,
  Video,
  Loader2,
  ChevronRight,
  Ban,
  Layers,
  History,
} from "lucide-react";
import { DistanceMap } from "@/components/ui/distance-map";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScoreCircle } from "@/components/ui/score-circle";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScheduleInterviewModal } from "@/components/ui/schedule-interview-modal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Stage {
  id: string;
  name: string;
  order_index: number;
  color: string;
}

interface StageHistoryEntry {
  id: string;
  from_stage_name: string;
  to_stage_name: string;
  notes?: string;
  created_at: string;
  profiles?: { full_name?: string; email?: string };
}

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<Stage[]>([]);
  const [stageHistory, setStageHistory] = useState<StageHistoryEntry[]>([]);

  // Interview modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // HR Notes & Evaluation
  const [hrNotes, setHrNotes] = useState("");
  const [evaluationComments, setEvaluationComments] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Advance/Reject loading
  const [advancing, setAdvancing] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  async function fetchAllData() {
    try {
      const [res, teamRes, historyRes] = await Promise.all([
        fetch(`/api/candidates/${candidateId}`),
        supabase.from("profiles").select("id, full_name, email, role"),
        fetch(`/api/candidates/${candidateId}/stage-history`),
      ]);

      if (res.ok) {
        const json = await res.json();
        setData(json);
        setHrNotes(json.hr_notes || "");
        setEvaluationComments(json.evaluation_comments || "");

        if (json.job_id) {
          const stagesRes = await fetch(`/api/jobs/${json.job_id}/stages`);
          if (stagesRes.ok) {
            const stagesData = await stagesRes.json();
            setStages(stagesData.stages || []);
          }
        }
      }

      if (teamRes.data) setTeamMembers(teamRes.data);
      if (historyRes.ok) setStageHistory(await historyRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, [candidateId]);

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (result.success) {
        await fetchAllData();
      } else {
        alert(result.message || result.error || "Failed to advance candidate.");
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject ${data?.full_name}?`)) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to reject candidate.");
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setRejecting(false);
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
          `<tr><td style="padding:6px 10px;border:1px solid #ddd">${item.criteria}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${item.passed ? "✅ Passed" : "❌ Failed"}</td><td style="padding:6px 10px;border:1px solid #ddd">${item.note || "-"}</td></tr>`
      )
      .join("") || "";

    const skillsHtml = (analysis?.skills_found || analysis?.found_skills || [])
      .map((s: string) => `<span style="display:inline-block;background:#f0f0f0;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px">${s}</span>`)
      .join(" ");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Candidate Summary - ${data.full_name}</title>
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
          ${data.email} · ${data.phone || "-"} · Position: ${data.job_title || "-"}<br/>
          Applied Date: ${format(new Date(data.created_at), "MMM d, yyyy, HH:mm")}
          ${data.domicile_address ? `<br/>Domicile: ${data.domicile_address}` : ""}
          ${data.distance_to_work != null ? ` (${data.distance_to_work.toFixed(1)} km from office)` : ""}
        </div>

        <div class="score-box">
          <div class="score">${analysis?.total_score ?? "-"}</div>
          <div class="label">AI Match Score${data.is_qualified ? " — ✅ QUALIFIED" : " — ❌ NOT QUALIFIED"}</div>
        </div>

        <h2>Mandatory Requirements Check</h2>
        <table>
          <thead><tr><th>Criteria</th><th style="text-align:center">Status</th><th>Note</th></tr></thead>
          <tbody>${mandatoryHtml}</tbody>
        </table>

        <h2>Skills Found</h2>
        <div>${skillsHtml || "<em>No skills detected</em>"}</div>

        <h2>AI Analysis & Reasoning</h2>
        <p style="font-size:13px;line-height:1.6">${analysis?.reasoning || "-"}</p>

        ${hrNotes ? `<h2>Internal HR Notes</h2><div class="notes-section">${hrNotes}</div>` : ""}
        ${evaluationComments ? `<h2>Interview Evaluation Comments</h2><div class="notes-section">${evaluationComments}</div>` : ""}

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center">
          Printed on ${format(new Date(), "MMM d, yyyy, HH:mm")} — Obsidian Talent OS
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
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading candidate profile...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm">Candidate profile not found.</p>
      </div>
    );
  }

  const candidate = data;
  const job = data.jobs;
  const analysis = candidate.analysis_result || {};
  const currentStageName = candidate.current_stage_name || candidate.status || "Pending";
  const isRejected = currentStageName === "Rejected";

  const currentStageIndex = stages.findIndex((s) => s.name === currentStageName);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6 page-enter" ref={printRef}>
      {/* Back Link */}
      <Link
        href={`/jobs/${candidate.job_id}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Candidate Pipeline for {candidate.job_title}
      </Link>

      {/* Hero Profile Header */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{candidate.full_name}</h1>
            <StatusBadge
              status={currentStageName}
              color={stages.find((s) => s.name === currentStageName)?.color}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/40">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
              {candidate.email}
            </span>
            <span className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/40">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              {candidate.phone || "—"}
            </span>
            <span className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/40">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              {format(new Date(candidate.created_at), "MMM d, yyyy, HH:mm")}
            </span>
            {candidate.domicile_address && (
              <span className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Domicile: {candidate.domicile_address}
                {candidate.distance_to_work !== null && candidate.distance_to_work !== undefined && (
                  <span className="font-bold">
                    &nbsp;({candidate.distance_to_work.toFixed(1)} km)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto">
          {!isRejected && (
            <Button
              variant="default"
              size="sm"
              onClick={handleAdvance}
              disabled={advancing}
              className="gap-1.5 text-xs h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 flex-1 md:flex-initial justify-center"
            >
              {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              Advance Stage
            </Button>
          )}

          {!isRejected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={rejecting}
              className="gap-1.5 text-xs h-9 rounded-xl shadow-lg shadow-destructive/20 flex-1 md:flex-initial justify-center"
            >
              {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Reject Candidate
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScheduleModal(true)}
            className="gap-1.5 text-xs h-9 rounded-xl flex-1 md:flex-initial justify-center"
          >
            <CalendarDays className="w-4 h-4 text-purple-500" />
            {candidate.assigned_to_user_id ? "Reschedule / Assign" : "Assign Mandate"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintSummary}
            className="gap-1.5 text-xs h-9 rounded-xl flex-1 md:flex-initial justify-center"
          >
            <Printer className="w-4 h-4" />
            Print PDF
          </Button>
        </div>
      </div>

      {/* Dynamic Stage Stepper Bar */}
      {stages.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Candidate Selection Stage Progress
            </h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {stages.map((stg, idx) => {
              const isPassed = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              const isFuture = currentStageIndex < idx;

              return (
                <div key={stg.id} className="flex items-center gap-2 shrink-0">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm",
                      isCurrent && "ring-2 ring-primary scale-[1.02]",
                      isPassed && "opacity-90",
                      isFuture && "opacity-40",
                      isRejected && "opacity-30"
                    )}
                    style={{
                      borderColor: isPassed || isCurrent ? `${stg.color}60` : `${stg.color}20`,
                      backgroundColor: isCurrent ? `${stg.color}20` : isPassed ? `${stg.color}10` : `${stg.color}05`,
                      color: stg.color,
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: isPassed || isCurrent ? stg.color : `${stg.color}40` }}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </span>
                    <span>{stg.name}</span>
                  </div>

                  {idx < stages.length - 1 && (
                    <div className={cn("w-4 h-0.5 shrink-0", isPassed ? "bg-primary/50" : "bg-border")} />
                  )}
                </div>
              );
            })}

            {isRejected && (
              <>
                <div className="w-4 h-0.5 bg-destructive/40 shrink-0" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold ring-2 ring-destructive shadow-sm">
                  <Ban className="w-4 h-4" />
                  Rejected
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mandate & Interview Assignment Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <UserCheck className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold">Mandate Assignment & Interview Status</h3>
        </div>

        {candidate.assigned_to_user_id ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/15">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Assigned SR Staff</p>
                <p className="text-xs font-bold mt-0.5">{candidate.assigned_staff_name || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Interview Schedule</p>
                <p className="text-xs font-bold mt-0.5">
                  {candidate.scheduled_at
                    ? format(new Date(candidate.scheduled_at), "MMM d, yyyy, HH:mm") + " WIB"
                    : "Not Scheduled"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Location / Meeting Link</p>
                <p className="text-xs font-semibold mt-0.5 break-all">
                  {candidate.location || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Interview Status</p>
                <p className="text-xs font-bold mt-0.5">
                  {candidate.interview_status || "Pending"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/10 rounded-xl border border-dashed border-border/60">
            <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Candidate has not been assigned to any SR staff member yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5 text-xs rounded-xl"
              onClick={() => setShowScheduleModal(true)}
            >
              <CalendarDays className="w-4 h-4" />
              Assign Mandate & Schedule Interview
            </Button>
          </div>
        )}
      </div>

      {/* Main Split Content: CV Viewer (Left) + AI Analysis Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* CV Viewer */}
        <div className="lg:col-span-3 rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold">Curriculum Vitae (CV) Preview</span>
            </div>
            {candidate.signed_cv_url && (
              <a
                href={candidate.signed_cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs rounded-lg gap-1.5")}
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            )}
          </div>
          <div className="flex-1 h-[450px] sm:h-[700px] bg-muted/10">
            {candidate.signed_cv_url ? (
              <iframe
                src={`${candidate.signed_cv_url}#toolbar=0`}
                className="w-full h-full border-none"
                title="CV Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">CV document is unavailable.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          {/* Score Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 flex flex-col items-center shadow-sm">
            <ScoreCircle
              score={analysis.total_score || 0}
              size={130}
              strokeWidth={10}
              passingGrade={job?.passing_grade}
            />
            <p className="text-xs font-semibold mt-3 text-center leading-relaxed">
              {analysis.summary || analysis.reasoning?.slice(0, 100)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {candidate.is_qualified ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  QUALIFIED
                </Badge>
              ) : (
                <Badge className="bg-destructive/15 text-destructive border border-destructive/20 text-xs px-2.5 py-0.5 font-bold">
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  NOT QUALIFIED
                </Badge>
              )}
              {job && (
                <Badge variant="outline" className="text-xs font-mono">
                  PG: {job.passing_grade}
                </Badge>
              )}
            </div>
          </div>

          {/* Mandatory Check Breakdown */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mandatory Requirements Evaluation
            </h3>
            <div className="space-y-2">
              {analysis.mandatory_check?.map((item: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 p-3 rounded-xl text-xs border transition-colors",
                    item.passed
                      ? "bg-emerald-500/5 border-emerald-500/15"
                      : "bg-destructive/5 border-destructive/15"
                  )}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{item.criteria}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">{item.note}</p>
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
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
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
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Skills Detected by AI
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(analysis.skills_found || analysis.found_skills || []).map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Analysis & Reasoning
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* HR Internal Notes & Evaluation */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">HR Internal Notes & Interview Evaluation</h3>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {notesSaved && (
              <span className="text-xs text-emerald-500 flex items-center gap-1 animate-in fade-in duration-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved!
              </span>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="gap-1.5 text-xs h-8 rounded-xl shadow-md shadow-primary/20"
            >
              {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Notes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Internal HR Notes
            </label>
            <Textarea
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              placeholder="Write internal notes about this candidate... (visible only to HR team)"
              className="min-h-[120px] text-xs rounded-xl resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              SR Staff Interview Evaluation Results
            </label>
            <Textarea
              value={evaluationComments}
              onChange={(e) => setEvaluationComments(e.target.value)}
              placeholder="Write interview evaluation comments... (assessments, feedback, recommendations)"
              className="min-h-[120px] text-xs rounded-xl resize-y"
            />
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
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
            fetchAllData();
          }}
        />
      )}
    </div>
  );
}
