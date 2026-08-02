"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Check,
  Briefcase,
  MapPin,
  SlidersHorizontal,
  Mail,
  Loader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CriteriaBuilder } from "@/components/ui/criteria-builder";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { MapPicker } from "@/components/ui/map-picker";

interface JobStageInput {
  name: string;
  description?: string;
  color: string;
}

const COLOR_PRESETS = [
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#a855f7", // Purple
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
];

export default function CreateJobPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingGrade, setPassingGrade] = useState(70);
  const [mandatoryCriteria, setMandatoryCriteria] = useState<string[]>([]);
  const [optionalCriteria, setOptionalCriteria] = useState<string[]>([]);
  const [enableLocation, setEnableLocation] = useState(false);
  const [workLocation, setWorkLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [maxDistance, setMaxDistance] = useState(10);
  const [distanceMandatory, setDistanceMandatory] = useState(false);

  // Custom Stages state
  const [useCustomStages, setUseCustomStages] = useState(false);
  const [defaultStages, setDefaultStages] = useState<any[]>([]);
  const [customStages, setCustomStages] = useState<JobStageInput[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [newStageColor, setNewStageColor] = useState("#6366f1");

  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);

        // Fetch company default stages
        const stagesRes = await fetch("/api/stages");
        if (stagesRes.ok) {
          const stgData = await stagesRes.json();
          setDefaultStages(stgData);
          setCustomStages(
            stgData.map((s: any) => ({
              name: s.name,
              description: s.description || "",
              color: s.color || "#6366f1",
            }))
          );
        }
      }
    }
    load();
  }, []);

  const companySlug =
    profile?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "company";
  const jobSlug =
    title?.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20) || "job";
  const [randomSuffix] = useState(() => Math.random().toString(36).substring(2, 6));
  const generatedAlias = `useirbar+${companySlug}+${jobSlug}+${randomSuffix}@gmail.com`;

  const handleAddCustomStage = () => {
    if (!newStageName.trim()) return;
    setCustomStages([
      ...customStages,
      {
        name: newStageName.trim(),
        description: newStageDesc.trim(),
        color: newStageColor,
      },
    ]);
    setNewStageName("");
    setNewStageDesc("");
    setNewStageColor("#6366f1");
  };

  const handleRemoveCustomStage = (index: number) => {
    if (index === 0) {
      alert("Tahap pertama (Apply & AI Screening) tidak bisa dihapus.");
      return;
    }
    setCustomStages(customStages.filter((_, idx) => idx !== index));
  };

  const handleMoveCustomStage = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= customStages.length) return;

    const copy = [...customStages];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setCustomStages(copy);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enableLocation && !workLocation) {
      alert("Harap pilih lokasi kantor/usaha pada peta terlebih dahulu.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          passing_grade: passingGrade,
          mandatory_criteria: mandatoryCriteria,
          optional_criteria: optionalCriteria,
          alias_email: generatedAlias,
          work_latitude: enableLocation && workLocation ? workLocation.lat : null,
          work_longitude: enableLocation && workLocation ? workLocation.lng : null,
          work_address: enableLocation && workLocation ? workLocation.address : null,
          max_distance: enableLocation ? maxDistance : null,
          distance_mandatory: enableLocation ? distanceMandatory : false,
          use_custom_stages: useCustomStages,
        }),
      });

      if (res.ok) {
        const newJob = await res.json();

        if (useCustomStages && newJob.id) {
          await fetch(`/api/jobs/${newJob.id}/stages`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              use_custom_stages: true,
              stages: customStages,
            }),
          });
        }

        router.push("/jobs");
      } else {
        const err = await res.json();
        alert(`Gagal membuat lowongan: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 page-enter">
      {/* Back Link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Manajemen Lowongan
      </Link>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Buat Lowongan Pekerjaan Baru
        </h1>
        <p className="text-xs text-muted-foreground">
          Konfigurasi syarat AI screening, alur tahapan rekrutmen, dan lokasi kerja
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">1. Informasi Utama Posisi Lowongan</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold">Judul Posisi Lowongan <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Senior Full Stack Engineer / Digital Marketing Lead"
              className="text-xs h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold">Deskripsi Pekerjaan & Kualifikasi <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan peran, tanggung jawab utama, skill teknis, dan budaya tim..."
              rows={5}
              className="text-xs rounded-xl resize-y"
              required
            />
          </div>

          {/* Generated Email Alias Badge */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Ingestion Alias (Dihasilkan Otomatis oleh Sistem)
            </p>
            <p className="text-xs font-mono font-bold text-primary break-all">{generatedAlias}</p>
          </div>
        </div>

        {/* Section 2: Recruitment Stages Selection */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">2. Alur & Skema Tahapan Seleksi</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setUseCustomStages(false)}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2",
                !useCustomStages
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                  : "border-border/60 hover:border-border bg-muted/10"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Template Default Perusahaan
                </span>
                {!useCustomStages && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mengikuti tahapan rekrutmen standar perusahaan yang telah disetup di Pengaturan.
              </p>
            </div>

            <div
              onClick={() => setUseCustomStages(true)}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2",
                useCustomStages
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                  : "border-border/60 hover:border-border bg-muted/10"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Kustomisasi Tahapan Khusus
                </span>
                {useCustomStages && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Susun alur tahapan seleksi baru khusus hanya untuk posisi lowongan ini.
              </p>
            </div>
          </div>

          {!useCustomStages ? (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Preview Tahapan Default Perusahaan:
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                {defaultStages.map((s, i) => (
                  <div key={s.id || i} className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs gap-1.5 py-1 px-3 rounded-full font-semibold shadow-sm"
                      style={{ color: s.color, borderColor: `${s.color}40`, backgroundColor: `${s.color}10` }}
                    >
                      <span className="font-bold">{i + 1}.</span> {s.name}
                    </Badge>
                    {i < defaultStages.length - 1 && (
                      <span className="text-xs text-muted-foreground">➔</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-3 border-t border-border/60 animate-in fade-in duration-300">
              <p className="text-xs font-bold text-foreground">
                Editor Tahapan Khusus Lowongan Ini:
              </p>

              <div className="space-y-2">
                {customStages.map((stg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: stg.color }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-foreground">{stg.name}</p>
                        {stg.description && (
                          <p className="text-[11px] text-muted-foreground">
                            {stg.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleMoveCustomStage(idx, "up")}
                        disabled={idx === 0}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleMoveCustomStage(idx, "down")}
                        disabled={idx === customStages.length - 1}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveCustomStage(idx)}
                        disabled={idx === 0}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Stage Form */}
              <div className="p-4 rounded-xl border border-dashed border-border/80 bg-card space-y-3">
                <p className="text-xs font-bold">Tambah Tahapan Kustom Baru:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Nama tahapan (mis. Technical Test)"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    className="text-xs h-9 rounded-lg"
                  />
                  <Input
                    placeholder="Deskripsi singkat (opsional)"
                    value={newStageDesc}
                    onChange={(e) => setNewStageDesc(e.target.value)}
                    className="text-xs h-9 rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Warna Badge:</span>
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewStageColor(c)}
                        className={cn(
                          "w-5 h-5 rounded-full border border-black/10 transition-transform",
                          newStageColor === c && "scale-125 ring-2 ring-primary ring-offset-1"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomStage}
                    className="h-8 text-xs gap-1.5 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Tahapan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Location Radius Screening */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold">3. Filter Radius Lokasi Domisili</h3>
            </div>
            <Switch
              checked={enableLocation}
              onCheckedChange={setEnableLocation}
            />
          </div>

          {enableLocation && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-300">
              <MapPicker
                value={workLocation}
                onChange={setWorkLocation}
                label="Tentukan Titik Koordinat Kantor / Tempat Kerja"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="maxDistance" className="text-xs font-semibold">Batas Radius Maksimal (KM)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="maxDistance"
                      type="number"
                      min={1}
                      max={1000}
                      value={maxDistance}
                      onChange={(e) =>
                        setMaxDistance(Math.max(1, parseInt(e.target.value) || 0))
                      }
                      className="text-xs font-mono h-9 rounded-xl"
                    />
                    <span className="text-xs font-bold text-muted-foreground">KM</span>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end pb-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="distanceMandatory"
                      checked={distanceMandatory}
                      onChange={(e) => setDistanceMandatory(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                    <Label htmlFor="distanceMandatory" className="text-xs font-bold cursor-pointer">
                      Jadikan Syarat Wajib (Otomatis Gagal jika di luar radius)
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Jika dicentang, kandidat berdomisili melebihi radius otomatis berstatus <strong>Not Qualified</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: AI Criteria Builder */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">4. Kriteria Evaluasi AI Screening</h3>
          </div>

          <CriteriaBuilder
            label="⚠️ Syarat Wajib (Mandatory Criteria)"
            description="Kandidat WAJIB memenuhi seluruh syarat ini. Jika gagal di 1 kriteria, otomatis Not Qualified."
            items={mandatoryCriteria}
            onChange={setMandatoryCriteria}
            variant="mandatory"
          />

          <Separator className="bg-border/60" />

          <CriteriaBuilder
            label="✨ Syarat Opsional (Optional / Preferred Criteria)"
            description="Kriteria tambahan yang akan memberikan skor bonus kecocokan kandidat."
            items={optionalCriteria}
            onChange={setOptionalCriteria}
            variant="optional"
          />
        </div>

        {/* Section 5: Passing Grade Slider */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">5. Threshold Passing Grade Skor AI</h3>
            <span className="text-xl font-extrabold font-mono text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
              {passingGrade} Poin
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <Slider
              value={[passingGrade]}
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val[0] : val;
                setPassingGrade(v);
              }}
              max={100}
              min={0}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground px-1 font-medium">
              <span>0 (Ringan)</span>
              <span>50 (Standar)</span>
              <span>70 (Rekomendasi)</span>
              <span>100 (Sangat Ketat)</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/jobs"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 text-xs rounded-xl")}
          >
            Batal
          </Link>
          <Button type="submit" disabled={saving} className="h-10 text-xs gap-2 rounded-xl shadow-lg shadow-primary/20">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan Lowongan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan & Terbitkan Lowongan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
