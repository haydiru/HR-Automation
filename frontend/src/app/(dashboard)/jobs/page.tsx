"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Users,
  CheckCircle2,
  Mail,
  Briefcase,
  Layers,
  Sparkles,
  Ban,
  Trash2,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) setJobs(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const handleDelete = async () => {
    if (!selectedJob) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
        setIsDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setSelectedJob(null);
    }
  };

  const handleClose = async () => {
    if (!selectedJob) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === selectedJob.id ? { ...j, status: "closed" } : j
          )
        );
        setIsCloseDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setSelectedJob(null);
    }
  };

  const copyToClipboard = (text: string, jobId: string) => {
    navigator.clipboard.writeText(text || "");
    setCopiedId(jobId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-muted-foreground">Memuat seluruh daftar lowongan...</p>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 page-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Manajemen Lowongan Kerja
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola posisi aktif, kriteria AI screening, dan kustomisasi alur rekrutmen
          </p>
        </div>

        <Link
          href="/jobs/create"
          className={cn(buttonVariants({ size: "sm" }), "h-9 gap-1.5 text-xs rounded-xl shadow-lg shadow-primary/20")}
        >
          <Plus className="w-4 h-4" />
          Buat Lowongan Baru
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari posisi atau nama lowongan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/30 border-border/60"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">🟢 Aktif</SelectItem>
              <SelectItem value="closed">⚪ Ditutup</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="text-xs px-3 py-1.5 font-semibold bg-muted/20 border-border">
            Total: {filteredJobs.length} Lowongan
          </Badge>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job: any) => {
          const totalCandidates = job.candidate_count || 0;
          const qualCount = job.qualified_count || 0;
          const qualRatio = totalCandidates > 0 ? Math.round((qualCount / totalCandidates) * 100) : 0;

          return (
            <div
              key={job.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Top ambient glow bar */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-1 transition-colors",
                  job.status === "active" ? "bg-gradient-to-r from-emerald-500 via-primary to-indigo-500" : "bg-muted"
                )}
              />

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
                    >
                      {job.title}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      Dibuat {format(new Date(job.created_at), "d MMMM yyyy", { locale: id })}
                    </p>
                  </div>

                  <Badge
                    variant={job.status === "active" ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] shrink-0 font-bold px-2.5 py-0.5 rounded-full border",
                      job.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {job.status === "active" ? "🟢 Aktif" : "Ditutup"}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {job.description || "Tidak ada deskripsi singkat."}
                </p>

                {/* Qualification Progress Bar */}
                <div className="space-y-1.5 mb-5 p-3 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {totalCandidates} Pelamar
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {qualCount} Qualified ({qualRatio}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500"
                      style={{ width: `${qualRatio}%` }}
                    />
                  </div>
                </div>

                {/* Passing Grade & Stage Type */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Passing Grade</p>
                    <p className="text-sm font-extrabold text-primary font-mono mt-0.5">{job.passing_grade} Poin</p>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Skema Tahapan</p>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {job.use_custom_stages ? "Kustom" : "Default"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <Tooltip>
                  <TooltipTrigger
                    onClick={() => copyToClipboard(job.alias_email, job.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors flex-1 min-w-0 border border-border/50"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate font-mono text-[10px]">
                      {job.alias_email}
                    </span>
                    {copiedId === job.id ? (
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {copiedId === job.id ? "Tersalin!" : "Salin Email Alias Ingestion"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={`/apply/${job.id}`}
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    }
                  />
                  <TooltipContent className="text-xs">Form Lamaran Publik</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border/50">
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1 shadow-xl rounded-xl">
                    <DropdownMenuItem
                      onClick={() => (window.location.href = `/jobs/${job.id}`)}
                      className="text-xs gap-2 py-2 cursor-pointer font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      Buka Pipeline Lowongan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedJob(job);
                        setIsCloseDialogOpen(true);
                      }}
                      className="text-xs gap-2 py-2 text-amber-600 dark:text-amber-400 cursor-pointer"
                      disabled={job.status === "closed"}
                    >
                      <Ban className="w-4 h-4" />
                      Tutup Lowongan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedJob(job);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-xs gap-2 py-2 text-destructive font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Permanen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border/60">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold">Tidak ada lowongan ditemukan.</p>
          <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan kata kunci pencarian atau buat lowongan baru.</p>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Lowongan Permanen?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tindakan ini tidak dapat dibatalkan. Seluruh data pelamar dan hasil analisis AI untuk <strong>{selectedJob?.title}</strong> akan dihapus selamanya dari sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose>
              <Button variant="outline" size="sm" disabled={isProcessing}>Batal</Button>
            </DialogClose>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Ban className="w-5 h-5 text-amber-500" />
              Tutup Lowongan Pekerjaan?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lowongan <strong>{selectedJob?.title}</strong> tidak akan lagi menerima berkas lamaran baru dari email alias maupun form publik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose>
              <Button variant="outline" size="sm" disabled={isProcessing}>Batal</Button>
            </DialogClose>
            <Button size="sm" onClick={handleClose} disabled={isProcessing}>
              {isProcessing ? "Memproses..." : "Ya, Tutup Lowongan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
