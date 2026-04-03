"use client";

import { useEffect, useState } from "react";
import { Save, Building2, Sparkles, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strictness, setStrictness] = useState(70);
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
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updates = {
      company_name: formData.get("company-name"),
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
    }
    
    alert("Pengaturan disimpan!");
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Memuat pengaturan...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil perusahaan dan konfigurasi kecerdasan buatan (AI)
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold">Profil Perusahaan</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nama Perusahaan</Label>
                <Input 
                  id="company-name" 
                  name="company-name"
                  defaultValue={profile?.company_name} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industri</Label>
                <Input id="industry" placeholder="Contoh: Teknologi, Kreatif" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://domain.com" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[oklch(0.72_0.19_145)]" />
            <h2 className="text-sm font-semibold">Konfigurasi AI Screening</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tingkat Ketat Penyaringan (Strictness)</Label>
                  <p className="text-xs text-muted-foreground">
                    Semakin tinggi, AI akan semakin ketat dalam memberikan skor.
                  </p>
                </div>
                <div className="w-12 h-8 rounded bg-muted/50 flex items-center justify-center font-mono font-bold text-primary">
                  {strictness}%
                </div>
              </div>
              <Slider
                value={[strictness]}
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  setStrictness(v);
                }}
                max={100}
                min={0}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Ekspansif (Banyak Kandidat)</span>
                <span>Standar</span>
                <span>Ketat (Terpilih)</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Model AI Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Gemini 3.1 Flash Lite Preview (Super Fast)
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Default
              </Badge>
            </div>
          </div>
        </div>

        {/* Plan & Billing Placeholder */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border bg-muted/20 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Langganan & Tagihan</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">Paket Institusi (Internal Only)</p>
                <p className="text-xs text-muted-foreground">
                  Akses penuh ke semua fitur otomasi rekrutmen.
                </p>
              </div>
              <Button variant="outline" size="sm" className="bg-background">
                Lihat Detail
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={saving} className="px-8">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
