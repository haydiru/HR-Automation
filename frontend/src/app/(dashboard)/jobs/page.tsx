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
  Mail 
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
        // toast.success("Lowongan berhasil dihapus");
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Memuat daftar lowongan...</p>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text || "");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lowongan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola semua lowongan pekerjaan Anda
          </p>
        </div>
        <Link
          href="/jobs/create"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Buat Lowongan
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari lowongan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="closed">Ditutup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJobs.map((job: any) => (
          <div
            key={job.id}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                >
                  {job.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(job.created_at), "d MMM yyyy", {
                    locale: id,
                  })}
                </p>
              </div>
              <Badge
                variant={job.status === "active" ? "default" : "secondary"}
                className={cn(
                  "text-[10px] shrink-0 ml-2",
                  job.status === "active" &&
                    "bg-[oklch(0.72_0.19_145/15%)] text-[oklch(0.72_0.19_145)] hover:bg-[oklch(0.72_0.19_145/20%)]"
                )}
              >
                {job.status === "active" ? "Aktif" : "Ditutup"}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
              {job.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{job.candidate_count} pelamar</span>
              </div>
              <div className="flex items-center gap-1.5 text-[oklch(0.72_0.19_145)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{job.qualified_count} qualified</span>
              </div>
            </div>

            {/* Passing Grade */}
            <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-muted/30 border border-border">
              <span className="text-xs text-muted-foreground">Passing Grade</span>
              <span className="text-xs font-bold font-mono">{job.passing_grade}</span>
            </div>

            {/* Email Alias & Actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  onClick={() => copyToClipboard(job.alias_email)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors flex-1 min-w-0"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-mono text-[10px]">
                    {job.alias_email}
                  </span>
                  <Copy className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </TooltipTrigger>
                <TooltipContent>Salin email alias</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Link href={`/apply/${job.id}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Buka form publik</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = `/jobs/${job.id}`}>
                    Lihat Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedJob(job);
                      setIsCloseDialogOpen(true);
                    }}
                    className="text-orange-500"
                    disabled={job.status === "closed"}
                  >
                    Tutup Lowongan
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive font-semibold"
                  >
                    Hapus Permanen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Tidak ada lowongan ditemukan.</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Lowongan Permanen?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Seluruh data pelamar dan analisis AI untuk <strong>{selectedJob?.title}</strong> akan dihapus selamanya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline" disabled={isProcessing}>Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutup Lowongan Ini?</DialogTitle>
            <DialogDescription>
              Lowongan <strong>{selectedJob?.title}</strong> tidak akan lagi menerima lamaran baru melalui email alias maupun form publik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline" disabled={isProcessing}>Batal</Button>
            </DialogClose>
            <Button onClick={handleClose} disabled={isProcessing}>
              {isProcessing ? "Memproses..." : "Ya, Tutup Lowongan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
