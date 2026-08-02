"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Save, Building2, Sparkles, ShieldCheck, CreditCard, Users, CalendarDays, Sliders, Layers, Loader2 } from "lucide-react";
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

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Memuat pengaturan perusahaan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 page-enter">
      {/* Header & Sub-Nav */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Pengaturan Perusahaan & Provider AI
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola profil perusahaan, kredensial AI, dan model penyaringan otomatis
        </p>

        {/* Sub-Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 border-b border-border/80 pb-2 overflow-x-auto scrollbar-thin">
          <Link href="/settings">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20"
            >
              <Sliders className="w-4 h-4" />
              Profil & AI Config
            </Button>
          </Link>
          <Link href="/settings/stages">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Layers className="w-4 h-4" />
              Tahapan Rekrutmen
            </Button>
          </Link>
          <Link href="/settings/team">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Users className="w-4 h-4" />
              Manajemen Tim
            </Button>
          </Link>
          <Link href="/settings/integrations">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <CalendarDays className="w-4 h-4" />
              Integrasi Email & Kalender
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/60 bg-muted/20 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identitas Perusahaan</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-xs font-semibold">Nama Perusahaan</Label>
                <Input 
                  id="company-name" 
                  name="company-name"
                  defaultValue={profile?.company_name} 
                  className="text-xs h-9 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-xs font-semibold">Sektor Industri</Label>
                <Input id="industry" placeholder="Contoh: Teknologi Informasi / Fintek" className="text-xs h-9 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Engine Configuration Card */}
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/60 bg-muted/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Konfigurasi Engine & Provider AI</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Tingkat Ketat Penyaringan (Strictness Threshold)</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Semakin tinggi persentase, AI akan semakin selektif memberikan skor passing grade.
                  </p>
                </div>
                <span className="text-sm font-extrabold font-mono text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                  {strictness}%
                </span>
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
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>0% - Ekspansif (Longgar)</span>
                <span>50% - Standar Moderat</span>
                <span>100% - Sangat Ketat</span>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Provider and key settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="ai-provider" className="text-xs font-semibold">Penyedia AI (AI Provider)</Label>
                <Select
                  value={aiProvider}
                  onValueChange={(val: any) => handleProviderChange(val)}
                >
                  <SelectTrigger id="ai-provider" className="w-full text-xs h-9 rounded-xl">
                    <SelectValue placeholder="Pilih Penyedia AI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini AI (Bawaan / Default)</SelectItem>
                    <SelectItem value="openai">OpenAI Format (GPT-4o / Proxy)</SelectItem>
                    <SelectItem value="anthropic">Anthropic Format (Claude 3.5 / Proxy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-api-key" className="text-xs font-semibold">Kunci API (API Key)</Label>
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
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-model" className="text-xs font-semibold">Pilihan Model AI</Label>
                <Select
                  value={aiModel}
                  onValueChange={(val: any) => {
                    setAiModel(val);
                    if (val !== "custom") setCustomModel("");
                  }}
                >
                  <SelectTrigger id="ai-model" className="w-full text-xs h-9 rounded-xl">
                    <SelectValue placeholder="Pilih Model AI" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStandardModels(aiProvider).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Kustom (Tulis Identifier Model)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-model" className="text-xs font-semibold">
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
                      ? "Contoh: deepseek-chat / llama-3"
                      : "Diambil dari dropdown model"
                  }
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ai-proxy-url" className="text-xs font-semibold">URL Proxy / Custom Endpoint (Opsional)</Label>
                <Input
                  id="ai-proxy-url"
                  value={aiProxyUrl}
                  onChange={(e) => setAiProxyUrl(e.target.value)}
                  placeholder={
                    aiProvider === "gemini"
                      ? "https://generativelanguage.googleapis.com (Biarkan kosong untuk server resmi)"
                      : aiProvider === "openai"
                      ? "https://api.openai.com/v1 (Biarkan kosong untuk server resmi)"
                      : "https://api.anthropic.com/v1 (Biarkan kosong untuk server resmi)"
                  }
                  className="text-xs h-9 rounded-xl font-mono"
                />
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold">Ringkasan Konfigurasi AI Aktif</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {aiProvider.toUpperCase()} — {aiModel === "custom" ? (customModel || "Kustom Model") : aiModel}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                {aiApiKey ? "Custom Key Connected" : "Default System Key"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={saving} className="px-8 text-xs h-10 rounded-xl gap-2 shadow-lg shadow-primary/20">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
