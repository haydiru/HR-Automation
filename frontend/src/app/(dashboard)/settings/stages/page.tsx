"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sliders,
  Users,
  CalendarDays,
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Lock,
  Sparkles,
  Loader2,
  CheckCircle2,
  Check,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color: string;
  is_system: boolean;
}

const COLOR_PRESETS = [
  { label: "Indigo", value: "#6366f1", bg: "bg-indigo-500" },
  { label: "Amber", value: "#f59e0b", bg: "bg-amber-500" },
  { label: "Emerald", value: "#10b981", bg: "bg-emerald-500" },
  { label: "Purple", value: "#a855f7", bg: "bg-purple-500" },
  { label: "Cyan", value: "#06b6d4", bg: "bg-cyan-500" },
  { label: "Rose", value: "#f43f5e", bg: "bg-rose-500" },
];

export default function StagesSettingsPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStages();
  }, []);

  async function fetchStages() {
    try {
      const res = await fetch("/api/stages");
      if (res.ok) {
        const data = await res.json();
        setStages(data);
      }
    } catch (err) {
      console.error("Failed to load stages", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingStage(null);
    setFormData({ name: "", description: "", color: "#6366f1" });
    setModalOpen(true);
  };

  const handleOpenEditModal = (stage: Stage) => {
    setEditingStage(stage);
    setFormData({
      name: stage.name,
      description: stage.description || "",
      color: stage.color || "#6366f1",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingStage) {
        const res = await fetch(`/api/stages/${editingStage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchStages();
          setModalOpen(false);
        } else {
          const errData = await res.json();
          alert(`Failed to update stage: ${errData.error}`);
        }
      } else {
        const nextOrderIndex = stages.length + 1;
        const res = await fetch("/api/stages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            order_index: nextOrderIndex,
          }),
        });

        if (res.ok) {
          await fetchStages();
          setModalOpen(false);
        } else {
          const errData = await res.json();
          alert(`Failed to add stage: ${errData.error}`);
        }
      }
    } catch (err: any) {
      alert(`Error occurred: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (stage: Stage) => {
    if (stage.is_system) {
      alert("System default stage cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete stage "${stage.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/stages/${stage.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchStages();
      } else {
        const errData = await res.json();
        alert(`Failed to delete stage: ${errData.error}`);
      }
    } catch (err: any) {
      alert(`Error occurred: ${err.message}`);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    const reorderedStages = newStages.map((stg, idx) => ({
      ...stg,
      order_index: idx + 1,
    }));

    setStages(reorderedStages);
    setReordering(true);

    try {
      const res = await fetch("/api/stages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stages: reorderedStages.map((s) => ({
            id: s.id,
            order_index: s.order_index,
          })),
        }),
      });

      if (!res.ok) {
        await fetchStages();
      }
    } catch (err) {
      console.error("Failed to reorder", err);
      await fetchStages();
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading recruitment stages...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Header & Sub-Nav */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Company Recruitment Stages Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage official candidate selection workflow templates applicable across all job positions
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
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20"
            >
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
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <CalendarDays className="w-4 h-4" />
              Email & Calendar Integrations
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Banner */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3 shadow-sm">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-foreground">Company Selection Template Structure</p>
          <p className="text-muted-foreground leading-relaxed">
            The stages below form your company's **official template pipeline**. When creating a job, you can also customize a specific stage pipeline if required.
          </p>
        </div>
      </div>

      {/* Stepper Preview */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Live Company Stepper Visualization
          </h3>
          {reordering && (
            <span className="text-xs text-primary flex items-center gap-1 animate-pulse font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving sequence...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {stages.map((stg, idx) => (
            <div key={stg.id} className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm"
                style={{
                  borderColor: `${stg.color}50`,
                  backgroundColor: `${stg.color}15`,
                  color: stg.color,
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: stg.color }}
                >
                  {idx + 1}
                </span>
                <span>{stg.name}</span>
                {stg.is_system && <Lock className="w-3 h-3 opacity-60 ml-0.5" />}
              </div>

              {idx < stages.length - 1 && (
                <div className="w-4 h-0.5 bg-border shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Selection Stages List</h2>
            <p className="text-xs text-muted-foreground">
              Reorder or update details of each selection stage
            </p>
          </div>
          <Button onClick={handleOpenAddModal} size="sm" className="gap-2 text-xs h-9 rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            Add New Stage
          </Button>
        </div>

        <div className="space-y-3">
          {stages.map((stg, idx) => (
            <div
              key={stg.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all shadow-sm group gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm text-white shrink-0 shadow-md"
                  style={{ backgroundColor: stg.color }}
                >
                  {idx + 1}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {stg.name}
                    </h4>
                    {stg.is_system ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold"
                      >
                        <Lock className="w-3 h-3" />
                        System Default
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        Custom
                      </Badge>
                    )}
                  </div>
                  {stg.description && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {stg.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0 || reordering}
                >
                  <ArrowUp className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === stages.length - 1 || reordering}
                >
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => handleOpenEditModal(stg)}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(stg)}
                  disabled={stg.is_system}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingStage ? "Edit Recruitment Stage" : "Add Recruitment Stage"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingStage
                ? "Update information for this selection stage."
                : "Add a new stage into your company's selection workflow."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="stage-name" className="text-xs font-semibold">
                Stage Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stage-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. User Interview, Psychometric Test, Technical Assignment"
                className="text-xs h-9 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stage-desc" className="text-xs font-semibold">
                Short Description (Optional)
              </Label>
              <Textarea
                id="stage-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief explanation of evaluation activities during this stage..."
                className="text-xs min-h-[80px] rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Label / Badge Color</Label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: p.value })}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm",
                      p.bg,
                      formData.color === p.value
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "opacity-80 hover:opacity-100"
                    )}
                    title={p.label}
                  >
                    {formData.color === p.value && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="text-xs gap-1.5 rounded-xl">
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingStage ? "Save Changes" : "Add Stage"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
