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
  Building2,
  Sliders,
  Users,
  Loader2,
  Trash2,
  Sparkles,
  Layers,
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

      const success = searchParams.get("success");
      const type = searchParams.get("type");
      const email = searchParams.get("email");
      const error = searchParams.get("error");

      if (success === "1") {
        if (type === "gmail") {
          setGmailConnected(true);
          if (email) setGmailEmail(email);
          alert(`✅ Direct Company Gmail (${email || "Google"}) successfully connected! Ingestion inbox will be scanned automatically.`);
        } else if (type === "calendar") {
          setCalendarConnected(true);
          if (email) setCalendarEmail(email);
          alert(`✅ Google Calendar (${email || "Google"}) successfully connected! Interview schedules will be synced automatically.`);
        }
      } else if (error) {
        alert(`⚠️ Failed to connect Google OAuth: ${error}`);
      }

      setLoading(false);
    }

    load();
  }, [searchParams]);

  const handleDisconnect = async (type: "gmail" | "calendar") => {
    if (!currentUser) return;
    if (!confirm(`Are you sure you want to disconnect ${type === "gmail" ? "Company Direct Gmail" : "Google Calendar"}?`)) {
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

      alert(`Connection for ${type === "gmail" ? "Company Direct Gmail" : "Google Calendar"} successfully revoked.`);
    } catch (err: any) {
      alert("Failed to disconnect: " + err.message);
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
        <p className="text-xs font-medium text-muted-foreground">Loading integration settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Header & Sub-Nav */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Google Services Integrations
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Connect 1-Click Company Direct Gmail and Google Calendar for seamless background synchronization
        </p>

        {/* Sub-Navigation Pills */}
        <div className="flex items-center gap-2 mt-4 sm:mt-6 border-b border-border/80 pb-2 overflow-x-auto scrollbar-thin">
          <Link href="/settings" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Sliders className="w-4 h-4" />
              Profile & AI Config
            </Button>
          </Link>
          <Link href="/settings/stages" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Layers className="w-4 h-4" />
              Recruitment Stages
            </Button>
          </Link>
          <Link href="/settings/team" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Users className="w-4 h-4" />
              Team Management
            </Button>
          </Link>
          <Link href="/settings/integrations" className="shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20"
            >
              <CalendarDays className="w-4 h-4" />
              Email & Calendar Integrations
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Banner */}
      <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3 shadow-sm">
        <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-foreground">1-Click Automated Integration (Google OAuth 2.0)</p>
          <p className="text-muted-foreground leading-relaxed">
            Directly connect your **Company Direct Gmail** and **Google Calendar**. AI will scan incoming emails automatically and sync interview appointments straight to your calendar.
          </p>
        </div>
      </div>

      {/* SECTION 1: Gmail Ingestion */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            1. Incoming Email Ingestion
          </h2>
          <p className="text-xs text-muted-foreground">
            Methods for ingesting applicant CV attachments into the HR system
          </p>
        </div>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md h-9 p-1 rounded-xl bg-muted/40 border border-border/60">
            <TabsTrigger value="direct" className="text-xs gap-1.5 rounded-lg font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Direct Gmail (1-Click OAuth)
            </TabsTrigger>
            <TabsTrigger value="script" className="text-xs gap-1.5 rounded-lg font-semibold">
              Google Apps Script v4 (Manual)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4">
            <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold">Company Direct Gmail Status:</p>
                    {gmailConnected ? (
                      <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gmailConnected
                      ? `Connected to account: ${gmailEmail || "Company Gmail"}`
                      : "Connect official company Gmail for scriptless AI automation."}
                  </p>
                </div>

                <div>
                  {gmailConnected ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect("gmail")}
                      disabled={disconnecting === "gmail"}
                      className="gap-2 text-xs rounded-xl w-full sm:w-auto justify-center"
                    >
                      {disconnecting === "gmail" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Disconnect Gmail
                    </Button>
                  ) : (
                    <a href="/api/auth/google/connect?type=gmail">
                      <Button size="sm" className="gap-2 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 w-full sm:w-auto justify-center">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        Connect Company Gmail
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">How Direct Gmail Ingestion Works:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>System periodically scans inbox for incoming emails containing PDF CV attachments.</li>
                  <li>New applicants are automatically screened by AI based on active job criteria.</li>
                  <li>Credentials are securely stored using Google OAuth 2.0 authorization.</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="script" className="mt-4">
            <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Google Apps Script v4 Automation</p>
                  <p className="text-[11px] text-muted-foreground">
                    Alternative method using built-in Google Apps Script forwarding.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={copyScript} className="gap-1.5 text-xs rounded-xl">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Script"}
                </Button>
              </div>

              <div className="relative rounded-xl bg-zinc-950 p-4 font-mono text-[11px] text-zinc-200 overflow-x-auto max-h-64 border border-zinc-800">
                <pre>{appsScriptCode}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* SECTION 2: Google Calendar Integration */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            2. Google Calendar Integration (Per-User Interview Sync)
          </h2>
          <p className="text-xs text-muted-foreground">
            Each recruiter or interviewer can connect their personal Google Calendar account
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-border/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold">Your Google Calendar Status:</p>
                {calendarConnected ? (
                  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3" />
                    Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {calendarConnected
                  ? `Calendar Account: ${calendarEmail || currentUser?.email}`
                  : "Connect Google Calendar to automatically sync interview schedules when candidates are assigned."}
              </p>
            </div>

            <div>
              {calendarConnected ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDisconnect("calendar")}
                  disabled={disconnecting === "calendar"}
                  className="gap-2 text-xs rounded-xl w-full sm:w-auto justify-center"
                >
                  {disconnecting === "calendar" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Disconnect Calendar
                </Button>
              ) : (
                <a href="/api/auth/google/connect?type=calendar">
                  <Button size="sm" className="gap-2 text-xs rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto justify-center">
                    <CalendarDays className="w-4 h-4" />
                    Connect My Google Calendar
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold">Auto-Sync Interview & Reschedule Events</Label>
                <p className="text-[11px] text-muted-foreground">
                  Automatically create events in Google Calendar when candidate mandates or schedules are updated.
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
          <p className="text-xs font-medium text-muted-foreground">Loading integrations...</p>
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  );
}
