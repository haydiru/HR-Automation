"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  color?: string;
  className?: string;
}

// Fallback config for known legacy statuses
const legacyStatusConfig: Record<
  string,
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

/**
 * Dynamic StatusBadge — supports any stage name.
 * If a known legacy status is matched, uses predefined styling.
 * Otherwise, uses a neutral or custom color-based badge.
 */
export function StatusBadge({ status, color, className }: StatusBadgeProps) {
  const legacyConfig = legacyStatusConfig[status];

  if (legacyConfig) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          legacyConfig.bg,
          legacyConfig.text,
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", legacyConfig.dot)} />
        {legacyConfig.label}
      </span>
    );
  }

  // Dynamic stage name — use provided color or neutral styling
  const dotStyle = color ? { backgroundColor: color } : undefined;
  const textStyle = color ? { color } : undefined;
  const bgStyle = color ? { backgroundColor: `${color}18` } : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        !color && "bg-muted text-muted-foreground",
        className
      )}
      style={bgStyle}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full", !color && "bg-muted-foreground")}
        style={dotStyle}
      />
      <span style={textStyle}>{status}</span>
    </span>
  );
}
