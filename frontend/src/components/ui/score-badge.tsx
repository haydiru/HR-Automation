"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  passingGrade?: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({
  score,
  passingGrade = 70,
  size = "md",
}: ScoreBadgeProps) {
  const getColor = () => {
    if (score >= 80) return { bg: "bg-[oklch(0.72_0.19_145/15%)]", text: "text-[oklch(0.72_0.19_145)]", ring: "ring-[oklch(0.72_0.19_145/30%)]" };
    if (score >= passingGrade) return { bg: "bg-[oklch(0.80_0.16_80/15%)]", text: "text-[oklch(0.80_0.16_80)]", ring: "ring-[oklch(0.80_0.16_80/30%)]" };
    return { bg: "bg-destructive/15", text: "text-destructive", ring: "ring-destructive/30" };
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5 font-bold",
  };

  const color = getColor();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-mono font-semibold ring-1 ring-inset",
        color.bg,
        color.text,
        color.ring,
        sizeClasses[size]
      )}
    >
      {score}
    </span>
  );
}
