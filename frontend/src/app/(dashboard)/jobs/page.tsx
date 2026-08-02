"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Trash2,
  XCircle,
  Clock,
  Briefcase,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/language-context";
import { format } from "date-fns";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { t } = useLanguage();

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyAlias = (job: any) => {
    const aliasEmail = `${job.email_alias}@ingest.obsidiantalent.os`;
    navigator.clipboard.writeText(aliasEmail);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCloseJob = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (res.ok) {
        await fetchJobs();
        setCloseDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchJobs();
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading job positions...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            {t("jobs_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("jobs_subtitle")}
          </p>
        </div>

        <Link href="/jobs/create">
          <Button size="sm" className="gap-2 h-9 text-xs rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            {t("jobs_create_btn")}
          </Button>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("jobs_search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-full sm:w-40 text-xs h-9 rounded-xl">
              <SelectValue placeholder={t("jobs_filter_all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("jobs_filter_all")}</SelectItem>
              <SelectItem value="active">{t("jobs_filter_active")}</SelectItem>
              <SelectItem value="closed">{t("jobs_filter_closed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-border/80 rounded-2xl space-y-3">
            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs font-semibold text-muted-foreground">No job positions found.</p>
            <Link href="/jobs/create">
              <Button size="sm" variant="outline" className="text-xs rounded-xl gap-1.5 mt-2">
                <Plus className="w-3.5 h-3.5" />
                {t("jobs_create_btn")}
              </Button>
            </Link>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all p-5 space-y-4 shadow-sm flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={job.status === "active" ? "secondary" : "outline"}
                        className={job.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold" : "text-[10px]"}
                      >
                        {job.status === "active" ? "🟢 Active" : "⚪ Closed"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {t("jobs_passing_grade")}: <strong className="text-primary">{job.passing_grade}%</strong>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {job.title}
                    </h3>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl">
                      <DropdownMenuLabel className="text-xs">Position Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleCopyAlias(job)}
                        className="text-xs gap-2 cursor-pointer"
                      >
                        {copiedId === job.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {t("jobs_copy_alias")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-0">
                        <Link href={`/apply/${job.id}`} target="_blank" className="w-full px-2 py-1.5 text-xs flex items-center gap-2 cursor-pointer">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          {t("jobs_public_form")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {job.status === "active" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedJob(job);
                            setCloseDialogOpen(true);
                          }}
                          className="text-xs gap-2 text-amber-600 dark:text-amber-400 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Close Position
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedJob(job);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description || "No description provided."}
                </p>

                {job.work_address && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{job.work_address}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-muted/20 border border-border/60 text-center">
                    <span className="text-[10px] text-muted-foreground block font-medium">Total Applicants</span>
                    <span className="text-sm font-bold font-mono text-foreground">{job.candidate_count || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-muted-foreground block font-medium">Qualified</span>
                    <span className="text-sm font-bold font-mono text-emerald-500">{job.qualified_count || 0}</span>
                  </div>
                </div>

                <Link href={`/jobs/${job.id}`}>
                  <Button variant="secondary" size="sm" className="w-full text-xs h-9 rounded-xl gap-1.5 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    View Candidate Pipeline
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t("jobs_delete_dialog_title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete position <strong>{selectedJob?.title}</strong>? All candidate data under this job will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)} className="text-xs rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteJob} disabled={actionLoading} className="text-xs rounded-xl gap-1.5">
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Job Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-amber-500" />
              {t("jobs_close_dialog_title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Closing this position will prevent new applicants from submitting via public application forms. Existing pipeline candidates can still be processed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setCloseDialogOpen(false)} className="text-xs rounded-xl">
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCloseJob} disabled={actionLoading} className="text-xs rounded-xl gap-1.5 font-bold">
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Close Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
