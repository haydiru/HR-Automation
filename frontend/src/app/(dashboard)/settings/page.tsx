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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [strictness, setStrictness] = useState(70);
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai" | "anthropic">("gemini");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiProxyUrl, setAiProxyUrl] = useState("");
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");
  const [customModel, setCustomModel] = useState("");
  const supabase = createClient();

  const isStandardModel = (provider: string, modelName: string) => {
    if (provider === "gemini") {
      return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"].includes(modelName);
    }
    if (provider === "openai") {
      return ["gpt-4o-mini", "gpt-4o"].includes(modelName);
    }
    if (provider === "anthropic") {
      return ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"].includes(modelName);
    }
    return false;
  };

  const handleProviderChange = (provider: "gemini" | "openai" | "anthropic") => {
    setAiProvider(provider);
    if (provider === "gemini") {
      setAiModel("gemini-1.5-flash");
    } else if (provider === "openai") {
      setAiModel("gpt-4o-mini");
    } else if (provider === "anthropic") {
      setAiModel("claude-3-5-sonnet-20241022");
    }
    setCustomModel("");
  };

  const getStandardModels = (provider: string) => {
    switch (provider) {
      case "gemini":
        return [
          { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Rekomendasi/Default)" },
          { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
          { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Exp" },
        ];
      case "openai":
        return [
          { value: "gpt-4o-mini", label: "GPT-4o Mini (Rekomendasi/Default)" },
          { value: "gpt-4o", label: "GPT-4o" },
        ];
      case "anthropic":
        return [
          { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Rekomendasi/Default)" },
          { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
        ];
      default:
        return [];
    }
  };

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
        if (data) {
          const provider = data.ai_provider || "gemini";
          setAiProvider(provider);
          setAiApiKey(data.ai_api_key || "");
          setAiProxyUrl(data.ai_proxy_url || "");
          
          const dbModel = data.ai_model || "gemini-1.5-flash";
          if (isStandardModel(provider, dbModel)) {
            setAiModel(dbModel);
            setCustomModel("");
          } else {
            setAiModel("custom");
            setCustomModel(dbModel);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const finalModel = aiModel === "custom" ? customModel : aiModel;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updates = {
      company_name: formData.get("company-name"),
      ai_provider: aiProvider,
      ai_api_key: aiApiKey || null,
      ai_proxy_url: aiProxyUrl || null,
      ai_model: finalModel || null,
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
        
      if (error) {
        alert(`Gagal menyimpan pengaturan: ${error.message}`);
      } else {
        alert("Pengaturan disimpan!");
      }
    }
    
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

            {/* Provider and key settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">Penyedia Layanan AI (Model Format)</Label>
                <Select
                  value={aiProvider}
                  onValueChange={(val: any) => handleProviderChange(val)}
                >
                  <SelectTrigger id="ai-provider" className="w-full">
                    <SelectValue placeholder="Pilih Penyedia AI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini AI (Default)</SelectItem>
                    <SelectItem value="openai">OpenAI API Format (Proxy/Direct)</SelectItem>
                    <SelectItem value="anthropic">Anthropic API Format (Proxy/Direct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-api-key">Kunci API (API Key)</Label>
                <Input
                  id="ai-api-key"
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={
                    aiProvider === "gemini"
                      ? "AIzaSy..."
                      : aiProvider === "openai"
                      ? "sk-..."
                      : "sk-ant-..."
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-model">Model AI</Label>
                <Select
                  value={aiModel}
                  onValueChange={(val: any) => {
                    setAiModel(val);
                    if (val !== "custom") setCustomModel("");
                  }}
                >
                  <SelectTrigger id="ai-model" className="w-full">
                    <SelectValue placeholder="Pilih Model AI" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStandardModels(aiProvider).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Kustom (Tulis Sendiri)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-model">
                  {aiModel === "custom" ? "Nama Model Kustom" : "Model Aktif (Read Only)"}
                </Label>
                <Input
                  id="custom-model"
                  value={aiModel === "custom" ? customModel : aiModel}
                  onChange={(e) => {
                    if (aiModel === "custom") {
                      setCustomModel(e.target.value);
                    }
                  }}
                  disabled={aiModel !== "custom"}
                  placeholder={
                    aiModel === "custom"
                      ? "Masukkan identifier model (misal: deepseek-chat)"
                      : "Diambil dari dropdown model"
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ai-proxy-url">URL Proxy / Endpoint Kustom</Label>
                <Input
                  id="ai-proxy-url"
                  value={aiProxyUrl}
                  onChange={(e) => setAiProxyUrl(e.target.value)}
                  placeholder={
                    aiProvider === "gemini"
                      ? "https://generativelanguage.googleapis.com (Opsional)"
                      : aiProvider === "openai"
                      ? "https://api.openai.com/v1 (Opsional)"
                      : "https://api.anthropic.com/v1 (Opsional)"
                  }
                />
                <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                  Biarkan kosong untuk langsung menghubungi server utama. Masukkan endpoint proxy kustom (misal: openrouter, dll) jika Anda menggunakannya.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Model AI Aktif</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {aiProvider.toUpperCase()} — {aiModel === "custom" ? (customModel || "(Kustom model belum ditentukan)") : aiModel}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {aiProvider === "gemini" && !aiApiKey ? "Default System" : "Custom Configuration"}
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
