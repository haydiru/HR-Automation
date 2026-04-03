"use client";

import { use, useState, useEffect } from "react";
import {
  Zap,
  Upload,
  CheckCircle2,
  FileText,
  X,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Wand2,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
}

export default function PublicApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) setJob(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJob(false);
      }
    }
    fetchJob();
  }, [jobId]);

  if (loadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-xl bg-muted/50 flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold">Lowongan Tidak Ditemukan</h2>
          <p className="text-sm text-muted-foreground">
            Link ini mungkin sudah kadaluarsa atau lowongan telah ditutup.
          </p>
        </div>
      </div>
    );
  }

  const addEducation = () => {
    setEducations([
      ...educations,
      { id: Date.now().toString(), school: "", degree: "", year: "" },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(
      educations.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), company: "", position: "", duration: "" },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Harap unggah CV Anda.");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("full_name", fullname);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("cv_file", file);
    // Optional additional data could be appended here if needed
    
    try {
      const res = await fetch("/api/webhook/ingest", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const error = await res.json();
        alert(`Gagal mengirim lamaran: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-grid">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-[oklch(0.72_0.19_145/8%)] blur-[80px]" />

        <div className="relative z-10 text-center space-y-5 p-8 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-[oklch(0.72_0.19_145/15%)] flex items-center justify-center glow-success">
            <CheckCircle2 className="w-10 h-10 text-[oklch(0.72_0.19_145)]" />
          </div>
          <h2 className="text-2xl font-bold">Lamaran Terkirim!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Terima kasih telah melamar posisi{" "}
            <span className="font-semibold text-foreground">{job.title}</span>.
            Tim HR kami akan meninjau lamaran Anda dan menghubungi Anda jika
            sesuai dengan kualifikasi yang dibutuhkan.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Kirim Lamaran Lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid pb-20">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[oklch(0.75_0.15_200/5%)] blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary glow-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold gradient-text">HR Automation</h1>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Portal Rekrutmen Resmi
          </p>
        </div>

        {/* Job Info Card */}
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-md p-8 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{job.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {job.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="px-4 py-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Status Lowongan
              </p>
              <p className="text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[oklch(0.72_0.19_145)] animate-pulse" />
                Aktif & Terbuka
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Estimasi Proses
              </p>
              <p className="text-sm font-semibold italic text-primary">AI Auto-Screening Enabled</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Biodata */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Informasi Pribadi</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullname">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="fullname" 
                    placeholder="Andi Prasetyo" 
                    className="pl-10" 
                    required 
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="andi@email.com" 
                    className="pl-10" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+62 812-xxxx-xxxx" 
                    className="pl-10" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pendidikan */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Riwayat Pendidikan</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addEducation} className="h-8 gap-1">
                <Plus className="w-3 h-3" /> Tambah
              </Button>
            </div>

            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="p-4 rounded-xl border border-border bg-muted/20 relative group animate-in fade-in slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-[10px] uppercase">Sekolah / Universitas</Label>
                      <Input
                        placeholder="Contoh: Universitas Indonesia"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase">Gelar / Jurusan</Label>
                      <Input
                        placeholder="Contoh: S1 Informatika"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase">Tahun Lulus</Label>
                      <Input
                        placeholder="Contoh: 2022"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {educations.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-xl border-border">
                  Belum ada riwayat pendidikan yang ditambahkan.
                </p>
              )}
            </div>
          </div>

          {/* Section: Pengalaman */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Pengalaman Kerja</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExperience} className="h-8 gap-1">
                <Plus className="w-3 h-3" /> Tambah
              </Button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl border border-border bg-muted/20 relative group animate-in fade-in slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-[10px] uppercase">Perusahaan</Label>
                      <Input
                        placeholder="Contoh: TechCorp International"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase">Posisi / Jabatan</Label>
                      <Input
                        placeholder="Contoh: Senior Developer"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase">Durasi (Tahun/Bulan)</Label>
                      <Input
                        placeholder="Contoh: 2 Tahun"
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-xl border-border">
                  Belum ada riwayat pekerjaan yang ditambahkan.
                </p>
              )}
            </div>
          </div>

          {/* Section: Skills & Cover Letter */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Keahlian & Pesan</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="skills">Keahlian Utama (Pisahkan dengan koma)</Label>
                <Input
                  id="skills"
                  placeholder="Contoh: React, TypeScript, Projekt Manajemen, UI/UX"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverletter">Pesan Tambahan / Cover Letter (Opsional)</Label>
                <Textarea
                  id="coverletter"
                  placeholder="Tuliskan mengapa Anda tertarik dan mengapa kami harus memilih Anda..."
                  className="min-h-[150px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Dokumen */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-2">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Dokumen Pendukung</h3>
            </div>

            <div className="space-y-2">
              <Label>Upload Curriculum Vitae (PDF)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group",
                  file
                    ? "border-primary/40 bg-primary/5 shadow-inner"
                    : "border-border hover:border-primary/40 hover:bg-muted/40 hover:shadow-lg"
                )}
                onClick={() => document.getElementById("cv-upload")?.click()}
              >
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-4 animate-in zoom-in-95">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="ml-4 p-2 rounded-lg bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        Klik untuk upload atau drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hanya file PDF (Maksimal 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Memproses Lamaran...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Kirim Lamaran Sekarang
                <CheckCircle2 className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground py-4">
          Data Anda aman bersama kami · Dikelola oleh HR Automation System Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
