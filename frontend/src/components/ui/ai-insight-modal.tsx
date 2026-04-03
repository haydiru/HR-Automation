"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/ui/score-circle";
import { CheckCircle2, XCircle } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

interface AIInsightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  analysis: AnalysisResult;
  passingGrade?: number;
}

export function AIInsightModal({
  open,
  onOpenChange,
  candidateName,
  analysis,
  passingGrade = 70,
}: AIInsightModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card">
        <DialogHeader>
          <DialogTitle className="text-base">
            Insight AI — {candidateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Score */}
          <div className="flex items-center gap-5">
            <ScoreCircle
              score={analysis.total_score}
              size={90}
              strokeWidth={6}
              passingGrade={passingGrade}
            />
              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-medium">{analysis.summary || analysis.reasoning?.slice(0, 50)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.skills_found || (analysis as any).found_skills || []).slice(0, 5).map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {(analysis.skills_found || (analysis as any).found_skills || []).length > 5 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      +{(analysis.skills_found || (analysis as any).found_skills || []).length - 5}
                    </Badge>
                  )}
                </div>
              </div>
          </div>

          {/* Mandatory Check */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Syarat Wajib
            </h4>
            <div className="space-y-1.5">
              {analysis.mandatory_check.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 px-3 py-2 rounded-lg text-xs",
                    item.passed
                      ? "bg-[oklch(0.72_0.19_145/8%)]"
                      : "bg-destructive/8"
                  )}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.19_145)] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{item.criteria}</p>
                    <p className="text-muted-foreground mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alasan AI
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
              {analysis.reasoning}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
