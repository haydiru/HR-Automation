"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sliders,
  Users,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Connection states
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");

  const [autoSyncCalendar, setAutoSyncCalendar] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(prof);

        if (prof) {
          setGmailConnected(!!prof.gmail_connected);
          setGmailEmail(prof.gmail_address || "");
        }

        // Check token table for Google Calendar / Gmail connection status
        const { data: tokens } = await supabase
          .from("google_tokens")
          .select("*")
          .eq("user_id", user.id);

        if (tokens && tokens.length > 0) {
          const calToken = tokens.find((t: any) => t.provider_type === "calendar");
          if (calToken) {
            setCalendarConnected(true);
            setCalendarEmail(user.email || "");
          }

          const gToken = tokens.find((t: any) => t.provider_type === "gmail");
          if (gToken) {
            setGmailConnected(true);
            if (!prof?.gmail_address) {
              setGmailEmail(user.email || "");
            }
          }
        }
      }

      // Check query params for OAuth return messages
      const success = searchParams.get("success");
      const type = searchParams.get("type");
      const email = searchParams.get("email");
      const error = searchParams.get("error");

      if (success === "1") {
        if (type === "gmail") {
          setGmailConnected(true);
          if (email) setGmailEmail(email);
          alert(`✅ Direct Gmail Perusahaan (${email || "Google"}) berhasil dihubungkan! Inbox email akan dipindai secara otomatis.`);
        } else if (type === "calendar") {
          setCalendarConnected(true);
          if (email) setCalendarEmail(email);
          alert(`✅ Google Calendar (${email || "Google"}) berhasil dihubungkan! Jadwal wawancara akan otomatis tersinkronisasi.`);
        }
      } else if (error) {
        alert(`⚠️ Gagal menghubungkan Google OAuth: ${error}`);
      }

      setLoading(false);
    }

    load();
  }, [searchParams]);

  const handleDisconnect = async (type: "gmail" | "calendar") => {
    if (!currentUser) return;
    if (!confirm(`Apakah Anda yakin ingin memutuskan koneksi ${type === "gmail" ? "Gmail Perusahaan" : "Google Calendar"}?`)) {
      return;
    }

    setDisconnecting(type);
    try {
      if (type === "gmail") {
        await supabase
          .from("profiles")
          .update({ gmail_connected: false, gmail_address: null })
          .eq("id", currentUser.id);
        
        setGmailConnected(false);
        setGmailEmail("");
      }

      await supabase
        .from("google_tokens")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("provider_type", type);

      if (type === "calendar") {
        setCalendarConnected(false);
        setCalendarEmail("");
      }

      alert(`Koneksi ${type === "gmail" ? "Gmail Perusahaan" : "Google Calendar"} berhasil diputuskan.`);
    } catch (err: any) {
      alert("Gagal memutuskan koneksi: " + err.message);
    } finally {
      setDisconnecting(null);
    }
  };

  const appsScriptCode = `const API_URL = "https://hr-automation-one.vercel.app/api/webhook/ingest?secret=hookn8ngmail";
const PROCESSED_LABEL = "HR-PROCESSED";

function monitorGmailHR() {
  let label = GmailApp.getUserLabelByName(PROCESSED_LABEL);
  if (!label) label = GmailApp.createLabel(PROCESSED_LABEL);

  const threads = GmailApp.search('has:attachment -label:' + PROCESSED_LABEL, 0, 20);

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();
    let threadProcessed = false;

    for (let j = 0; j < messages.length; j++) {
      const message = messages[j];
      const attachments = message.getAttachments();

      for (let k = 0; k < attachments.length; k++) {
        const attachment = attachments[k];
        if (attachment.getContentType() === "application/pdf") {
          const payload = {
            "email": message.getFrom(),
            "subject": message.getSubject(),
            "email_body": message.getPlainBody(),
            "to_address": message.getTo(),
            "file": attachment.getAs("application/pdf")
          };

          const options = {
            "method": "post",
            "payload": payload,
            "muteHttpExceptions": true
          };

          try {
            const response = UrlFetchApp.fetch(API_URL, options);
            if (response.getResponseCode() === 200) threadProcessed = true;
          } catch (e) { Logger.log(e.toString()); }
        }
      }
    }
    if (threadProcessed) thread.addLabel(label);
  }
}`;

  const copyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat pengaturan integrasi...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Perusahaan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola integrasi 1-Click Gmail Perusahaan dan sinkronisasi Google Calendar
        </p>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-border pb-1">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <Sliders className="w-4 h-4" />
              Profil & AI Config
            </Button>
          </Link>
          <Link href="/settings/team">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <Users className="w-4 h-4" />
              Manajemen Tim
            </Button>
          </Link>
          <Link href="/settings/integrations">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15"
            >
              <CalendarDays className="w-4 h-4" />
              Integrasi Email & Kalender
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-foreground">Integrasi Otomatis 1-Click (Google OAuth 2.0)</p>
          <p className="text-muted-foreground leading-relaxed">
            Anda sekarang dapat menghubungkan **Gmail Perusahaan** dan **Google Calendar** secara langsung tanpa perlu setup skrip manual. AI akan membaca email masuk secara otomatis dan sinkronisasi jadwal wawancara langsung ke kalender Anda.
          </p>
        </div>
      </div>

      {/* SECTION 1: Gmail Ingestion Integration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              1. Integrasi Email Masuk (Ingestion Inbox)
            </h2>
            <p className="text-xs text-muted-foreground">
              Opsi otomatisasi penerimaan CV pelamar dari Gmail perusahaan ke sistem HR
            </p>
          </div>
        </div>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="direct" className="text-xs gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Direct Gmail (1-Click OAuth)
            </TabsTrigger>
            <TabsTrigger value="script" className="text-xs gap-2">
              Google Apps Script v4 (Manual)
            </TabsTrigger>
          </TabsList>

          {/* Direct OAuth Tab */}
          <TabsContent value="direct" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">Status Direct Gmail Perusahaan:</p>
                    {gmailConnected ? (
                      <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Terhubung
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Belum Terhubung
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gmailConnected
                      ? `Terhubung ke akun: ${gmailEmail || "Gmail Perusahaan"}`
                      : "Hubungkan Gmail resmi perusahaan untuk otomatisasi AI tanpa script."}
                  </p>
                </div>

                <div>
                  {gmailConnected ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect("gmail")}
                      disabled={disconnecting === "gmail"}
                      className="gap-2 text-xs"
                    >
                      {disconnecting === "gmail" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Putuskan Gmail
                    </Button>
                  ) : (
                    <a href="/api/auth/google/connect?type=gmail">
                      <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Zap className="w-4 h-4 fill-white" />
                        Hubungkan Gmail Perusahaan
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">Cara Kerja Direct Gmail:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sistem secara berkala memeriksa email masuk berlampiran CV PDF di inbox Gmail perusahaan Anda.</li>
                  <li>Kandidat baru otomatis di-screening oleh AI berdasarkan kriteria lowongan aktif.</li>
                  <li>Aman & Terenkripsi: Token diakses dengan perizinan baca-saja (*read-only*).</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Script Fallback Tab */}
          <TabsContent value="script" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Otomasi Skrip Google Apps Script v4</p>
                  <p className="text-xs text-muted-foreground">
                    Opsi alternatif menggunakan skrip forwarding manual bawaan Google Apps Script.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={copyScript} className="gap-2 text-xs">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Tersalin!" : "Salin Skrip"}
                </Button>
              </div>

              <div className="relative rounded-lg bg-zinc-950 p-4 font-mono text-[11px] text-zinc-200 overflow-x-auto max-h-64 border border-zinc-800">
                <pre>{appsScriptCode}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* SECTION 2: Google Calendar Integration */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            2. Integrasi Google Calendar (Sinkronisasi Wawancara Per-User)
          </h2>
          <p className="text-xs text-muted-foreground">
            Setiap staf rekrutmen / penguji wawancara dapat menghubungkan kalender Google pribadinya
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Status Google Calendar Anda:</p>
                {calendarConnected ? (
                  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Terhubung
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Belum Terhubung
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {calendarConnected
                  ? `Akun Kalender: ${calendarEmail || currentUser?.email}`
                  : "Hubungkan Google Calendar untuk sinkronisasi jadwal wawancara otomatis saat dimandatkan kandidat."}
              </p>
            </div>

            <div>
              {calendarConnected ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDisconnect("calendar")}
                  disabled={disconnecting === "calendar"}
                  className="gap-2 text-xs"
                >
                  {disconnecting === "calendar" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Putuskan Kalender
                </Button>
              ) : (
                <a href="/api/auth/google/connect?type=calendar">
                  <Button size="sm" className="gap-2 text-xs">
                    <CalendarDays className="w-4 h-4" />
                    Hubungkan Google Calendar Saya
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Auto-Sync Jadwal Wawancara & Reschedule</Label>
                <p className="text-[11px] text-muted-foreground">
                  Otomatis buat event di Google Calendar saat kandidat dimandatkan atau jadwal diubah (misal dari Tgl 1 ke Tgl 2).
                </p>
              </div>
              <Switch
                checked={autoSyncCalendar}
                onCheckedChange={setAutoSyncCalendar}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat integrasi...</p>
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  );
}
