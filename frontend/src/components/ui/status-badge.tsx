"use client";

import { cn } from "@/lib/utils";
import type { CandidateStatus } from "@/types";

interface StatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

const statusConfig: Record<
  CandidateStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  Pending: {
    label: "Pending",
    bg: "bg-[oklch(0.80_0.16_80/12%)]",
    text: "text-[oklch(0.80_0.16_80)]",
    dot: "bg-[oklch(0.80_0.16_80)]",
  },
  "Ready to Interview": {
    label: "Siap Interview",
    bg: "bg-[oklch(0.72_0.19_145/12%)]",
    text: "text-[oklch(0.72_0.19_145)]",
    dot: "bg-[oklch(0.72_0.19_145)]",
  },
  Rejected: {
    label: "Ditolak",
    bg: "bg-destructive/12",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  Hired: {
    label: "Diterima",
    bg: "bg-primary/12",
    text: "text-primary",
    dot: "bg-primary",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
