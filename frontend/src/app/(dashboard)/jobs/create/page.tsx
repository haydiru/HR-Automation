"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  MapPin,
  Layers,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPicker } from "@/components/ui/map-picker";
import { useLanguage } from "@/context/language-context";

interface Stage {
  id: string;
  name: string;
  description?: string;
  color: string;
  order_index: number;
}

export default function CreateJobPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [passingGrade, setPassingGrade] = useState(70);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mandatoryReqs, setMandatoryReqs] = useState<string[]>([
    "Min. 2 years of relevant professional experience",
    "Proficient with core software engineering principles",
  ]);
  const [optionalReqs, setOptionalReqs] = useState<string[]>([
    "Familiarity with Cloud Infrastructure & DevOps",
  ]);
  const [newMandatory, setNewMandatory] = useState("");
  const [newOptional, setNewOptional] = useState("");

  // Domicile location states
  const [workAddress, setWorkAddress] = useState("");
  const [workLocation, setWorkLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [distanceMandatory, setDistanceMandatory] = useState<boolean>(false);

  // Custom Stages states
  const [stageScheme, setStageScheme] = useState<"company_default" | "custom">("company_default");
  const [defaultStages, setDefaultStages] = useState<Stage[]>([]);
  const [customStages, setCustomStages] = useState<Stage[]>([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [newStageName, setNewStageName] = useState("");

  useEffect(() => {
    async function loadStages() {
      try {
        const res = await fetch("/api/stages");
        if (res.ok) {
          const data = await res.json();
          setDefaultStages(data);
          setCustomStages(data);
        }
      } catch (err) {
        console.error("Failed to load stages", err);
      } finally {
        setLoadingStages(false);
      }
    }
    loadStages();
  }, []);

  const addMandatory = () => {
    if (!newMandatory.trim()) return;
    setMandatoryReqs([...mandatoryReqs, newMandatory.trim()]);
    setNewMandatory("");
  };

  const removeMandatory = (idx: number) => {
    setMandatoryReqs(mandatoryReqs.filter((_, i) => i !== idx));
  };

  const addOptional = () => {
    if (!newOptional.trim()) return;
    setOptionalReqs([...optionalReqs, newOptional.trim()]);
    setNewOptional("");
  };

  const removeOptional = (idx: number) => {
    setOptionalReqs(optionalReqs.filter((_, i) => i !== idx));
  };

  const addCustomStage = () => {
    if (!newStageName.trim()) return;
    const newStg: Stage = {
      id: `temp-${Date.now()}`,
      name: newStageName.trim(),
      color: "#6366f1",
      order_index: customStages.length + 1,
    };
    setCustomStages([...customStages, newStg]);
    setNewStageName("");
  };

  const removeCustomStage = (id: string) => {
    setCustomStages(customStages.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter position title.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        title,
        description,
        passing_grade: passingGrade,
        mandatory_requirements: mandatoryReqs,
        optional_requirements: optionalReqs,
        work_address: workAddress || workLocation?.address || null,
        work_latitude: workLocation?.lat || null,
        work_longitude: workLocation?.lng || null,
        max_distance: maxDistance || null,
        distance_mandatory: distanceMandatory,
        custom_stages: stageScheme === "custom" ? customStages : null,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/jobs");
      } else {
        const err = await res.json();
        alert(`Failed to create job: ${err.error}`);
      }
    } catch (err: any) {
      alert("Error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("create_job_title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("create_job_subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Section 1: Primary Information */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Briefcase className="w-4 h-4 text-primary" />
            {t("create_job_sec1")}
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Position Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Senior Fullstack Developer / HR Business Partner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-9 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Job Overview & Key Responsibilities
              </Label>
              <Textarea
                id="description"
                placeholder="Describe role overview, primary responsibilities, and expected candidate profile..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs min-h-[120px] rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Recruitment Pipeline Scheme */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Layers className="w-4 h-4 text-primary" />
            {t("create_job_sec2")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                stageScheme === "company_default"
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 bg-muted/20"
              }`}
              onClick={() => setStageScheme("company_default")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${stageScheme === "company_default" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {stageScheme === "company_default" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <Label className="text-xs font-bold cursor-pointer">
                    Company Official Template (Default)
                  </Label>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                Use standard company selection pipeline. Updates in global Settings will automatically reflect.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                stageScheme === "custom"
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 bg-muted/20"
              }`}
              onClick={() => setStageScheme("custom")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${stageScheme === "custom" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {stageScheme === "custom" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <Label className="text-xs font-bold cursor-pointer">
                    Custom Pipeline for This Position
                  </Label>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                Override selection workflow specifically for this position (e.g. add Technical Test or Case Study).
              </p>
            </div>
          </div>

          {/* Stepper Preview */}
          <div className="pt-3">
            <Label className="text-xs font-semibold block mb-2">Selection Pipeline Preview:</Label>
            {loadingStages ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Loading stage structure...</div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {(stageScheme === "company_default" ? defaultStages : customStages).map((stg, idx) => (
                  <div key={stg.id} className="flex items-center gap-2 shrink-0">
                    <div
                      className="px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm flex items-center gap-2"
                      style={{
                        borderColor: `${stg.color || "#6366f1"}50`,
                        backgroundColor: `${stg.color || "#6366f1"}15`,
                        color: stg.color || "#6366f1",
                      }}
                    >
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{stg.name}</span>
                      {stageScheme === "custom" && (
                        <button
                          type="button"
                          onClick={() => removeCustomStage(stg.id)}
                          className="hover:text-destructive text-muted-foreground ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {idx < (stageScheme === "company_default" ? defaultStages : customStages).length - 1 && (
                      <div className="w-3 h-0.5 bg-border shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {stageScheme === "custom" && (
              <div className="flex items-center gap-2 pt-3">
                <Input
                  placeholder="Add custom stage name (e.g. Live Coding Session)..."
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="text-xs h-9 rounded-xl max-w-sm"
                />
                <Button type="button" size="sm" onClick={addCustomStage} className="text-xs h-9 rounded-xl gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Add Stage
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Domicile Location Filter */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            {t("create_job_sec3")}
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="work-address" className="text-xs font-semibold">
                Office / Workplace Base Address
              </Label>
              <Input
                id="work-address"
                placeholder="e.g. Head Office, Jakarta South Financial District"
                value={workAddress}
                onChange={(e) => setWorkAddress(e.target.value)}
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <MapPicker
              value={workLocation}
              onChange={setWorkLocation}
              label="Pinpoint Workplace Location on Map"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Max Radius Distance (KM)</Label>
                  <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {maxDistance} KM
                  </span>
                </div>
                <Slider
                  value={[maxDistance]}
                  onValueChange={(val) => setMaxDistance(Array.isArray(val) ? val[0] : val)}
                  max={100}
                  min={5}
                  step={5}
                  className="py-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60">
                <div className="space-y-0.5">
                  <Label htmlFor="dist-mandatory" className="text-xs font-bold cursor-pointer">
                    Mandatory Requirement
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    If active, applicants residing beyond max radius will automatically fail Mandatory check.
                  </p>
                </div>
                <Switch
                  id="dist-mandatory"
                  checked={distanceMandatory}
                  onCheckedChange={setDistanceMandatory}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: AI Screening Criteria */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            {t("create_job_sec4")}
          </h2>

          {/* Mandatory Reqs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">
                Mandatory Requirements (Must Fulfill)
              </Label>
              <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-bold">
                Mandatory
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Candidates missing mandatory requirements will be marked non-qualifying regardless of overall score.
            </p>

            <div className="space-y-2">
              {mandatoryReqs.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 text-xs gap-3"
                >
                  <span className="font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {req}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMandatory(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Type mandatory requirement (e.g. Min. Bachelor's Degree)..."
                value={newMandatory}
                onChange={(e) => setNewMandatory(e.target.value)}
                className="text-xs h-9 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMandatory();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={addMandatory} className="text-xs h-9 rounded-xl gap-1 shrink-0">
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </div>

          {/* Optional Reqs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">
                Optional Requirements (Bonus Points)
              </Label>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5 font-bold">
                Bonus Score
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Increases AI match percentage score when detected in CV.
            </p>

            <div className="space-y-2">
              {optionalReqs.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 text-xs gap-3"
                >
                  <span className="font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {req}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOptional(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Type bonus skill requirement..."
                value={newOptional}
                onChange={(e) => setNewOptional(e.target.value)}
                className="text-xs h-9 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOptional();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={addOptional} className="text-xs h-9 rounded-xl gap-1 shrink-0">
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Section 5: Passing Grade Threshold */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            {t("create_job_sec5")}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Minimum Passing Grade</Label>
                <p className="text-[11px] text-muted-foreground">
                  Candidates scoring at or above this threshold will automatically qualify for interview pipeline.
                </p>
              </div>
              <span className="text-lg font-extrabold font-mono text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20 shrink-0">
                {passingGrade}%
              </span>
            </div>

            <Slider
              value={[passingGrade]}
              onValueChange={(val) => setPassingGrade(Array.isArray(val) ? val[0] : val)}
              max={100}
              min={50}
              step={5}
              className="py-2"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/jobs">
            <Button type="button" variant="outline" size="sm" className="text-xs h-10 px-6 rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="text-xs h-10 px-8 rounded-xl gap-2 shadow-lg shadow-primary/20 font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Job Position...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("create_job_submit")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
