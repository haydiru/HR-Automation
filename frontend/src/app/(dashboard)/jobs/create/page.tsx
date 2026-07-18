"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { CriteriaBuilder } from "@/components/ui/criteria-builder";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { MapPicker } from "@/components/ui/map-picker";

export default function CreateJobPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingGrade, setPassingGrade] = useState(70);
  const [mandatoryCriteria, setMandatoryCriteria] = useState<string[]>([]);
  const [optionalCriteria, setOptionalCriteria] = useState<string[]>([]);
  const [enableLocation, setEnableLocation] = useState(false);
  const [workLocation, setWorkLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [maxDistance, setMaxDistance] = useState(10);
  const [distanceMandatory, setDistanceMandatory] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    load();
  }, []);

  const companySlug = profile?.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "company";
  const jobSlug = title?.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20) || "job";
  // Generate a short random suffix to ensure uniqueness
  const [randomSuffix] = useState(() => Math.random().toString(36).substring(2, 6));
  const generatedAlias = `useirbar+${companySlug}+${jobSlug}+${randomSuffix}@gmail.com`;

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
        }),
      });

      if (res.ok) {
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
          Tentukan kriteria penilaian untuk penyaringan AI otomatis
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
                      onChange={(e) => setMaxDistance(Math.max(1, parseInt(e.target.value) || 0))}
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
