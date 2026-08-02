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
  Lock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Check,
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

        // If custom stages enabled, update stages via API
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Lowongan
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Buat Lowongan Baru</h1>
        <p className="text-sm text-muted-foreground">
          Tentukan kriteria penilaian AI dan struktur tahapan seleksi kandidat
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h3 className="text-sm font-semibold">Informasi Dasar</h3>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Lowongan</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Senior Frontend Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Pekerjaan</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan peran, tanggung jawab, dan lingkungan kerja..."
              rows={5}
              required
            />
          </div>

          {/* Generated Email Alias */}
          <div className="px-4 py-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Email Alias (Auto-generated)
            </p>
            <p className="text-sm font-mono text-primary">{generatedAlias}</p>
          </div>
        </div>

        <Separator />

        {/* Tahapan Seleksi Kandidat (Default vs Custom) */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Alur & Tahapan Seleksi Kandidat
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih apakah lowongan ini memakai tahapan standar perusahaan atau alur kustom
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option 1: Default */}
            <div
              onClick={() => setUseCustomStages(false)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all space-y-2",
                !useCustomStages
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/30 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Gunakan Template Default
                </span>
                {!useCustomStages && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Mengikuti urutan tahapan resmi perusahaan yang diatur di Pengaturan Perusahaan.
              </p>
            </div>

            {/* Option 2: Custom */}
            <div
              onClick={() => setUseCustomStages(true)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all space-y-2",
                useCustomStages
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/30 bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Kustomisasi Tahapan Khusus
                </span>
                {useCustomStages && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Buat alur tahapan seleksi khusus yang hanya berlaku untuk lowongan ini.
              </p>
            </div>
          </div>

          {/* Stepper Preview or Custom Editor */}
          {!useCustomStages ? (
            <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Preview Tahapan Default Perusahaan:
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {defaultStages.map((s, i) => (
                  <div key={s.id || i} className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 py-1"
                      style={{ color: s.color, borderColor: `${s.color}40` }}
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
            <div className="space-y-4 pt-3 border-t border-border animate-in fade-in duration-300">
              <p className="text-xs font-semibold text-foreground">
                Daftar Tahapan Seleksi Lowongan Ini:
              </p>

              <div className="space-y-2">
                {customStages.map((stg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0"
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
                        className="h-7 w-7"
                        onClick={() => handleMoveCustomStage(idx, "up")}
                        disabled={idx === 0}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveCustomStage(idx, "down")}
                        disabled={idx === customStages.length - 1}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
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
              <div className="p-3 rounded-lg border border-dashed border-border space-y-3 bg-card">
                <p className="text-xs font-semibold">Tambah Tahapan Baru:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Nama tahapan (mis. Tes Coding, Psychotest)"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Input
                    placeholder="Deskripsi singkat (opsional)"
                    value={newStageDesc}
                    onChange={(e) => setNewStageDesc(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Warna:</span>
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
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Lokasi Kerja & Radius */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Filter Berbasis Jarak Domisili</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Aktifkan opsi ini untuk menilai kelayakan kandidat berdasarkan radius jarak dari tempat tinggal ke tempat kerja
              </p>
            </div>
            <Switch
              checked={enableLocation}
              onCheckedChange={setEnableLocation}
            />
          </div>

          {enableLocation && (
            <div className="space-y-4 pt-3 border-t border-border animate-in fade-in duration-300">
              <MapPicker
                value={workLocation}
                onChange={setWorkLocation}
                label="Tentukan Lokasi Kantor / Usaha"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="maxDistance">Batas Radius Maksimal (KM)</Label>
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
                      className="text-xs font-mono"
                    />
                    <span className="text-xs text-muted-foreground font-medium">KM</span>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end pb-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="distanceMandatory"
                      checked={distanceMandatory}
                      onChange={(e) => setDistanceMandatory(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                    <Label htmlFor="distanceMandatory" className="text-xs font-medium cursor-pointer">
                      Jadikan sebagai Syarat Wajib (Gagal jika di luar radius)
                    </Label>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    Jika dicentang, pelamar di luar radius otomatis berstatus <strong>Not Qualified</strong>. Jika tidak dicentang, ini akan dianggap sebagai Syarat Opsional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Criteria */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h3 className="text-sm font-semibold">Kriteria Penilaian AI</h3>

          <CriteriaBuilder
            label="⚠️ Syarat Wajib (Mandatory)"
            description="Kandidat yang gagal di salah satu syarat ini akan otomatis ditandai 'Not Qualified'"
            items={mandatoryCriteria}
            onChange={setMandatoryCriteria}
            variant="mandatory"
          />

          <Separator />

          <CriteriaBuilder
            label="✨ Syarat Opsional (Bonus)"
            description="Syarat tambahan yang akan menaikkan skor kandidat jika dipenuhi"
            items={optionalCriteria}
            onChange={setOptionalCriteria}
            variant="optional"
          />
        </div>

        <Separator />

        {/* Passing Grade */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold">Passing Grade</h3>
          <p className="text-xs text-muted-foreground">
            Skor minimum yang harus dicapai kandidat untuk dianggap qualified (0-100)
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <Slider
                value={[passingGrade]}
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  setPassingGrade(v);
                }}
                max={100}
                min={0}
                step={5}
                className="flex-1"
              />
              <div className="w-16 h-10 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <span className="text-lg font-bold font-mono text-primary">
                  {passingGrade}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>0 - Tidak ketat</span>
              <span>50 - Standar</span>
              <span>100 - Sangat ketat</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/jobs"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Batal
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Simpan Lowongan
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
