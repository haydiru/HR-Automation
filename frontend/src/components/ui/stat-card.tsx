"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    primary: "border-primary/20 glow-primary",
    success: "border-[oklch(0.72_0.19_145/20%)] glow-success",
    warning: "border-[oklch(0.80_0.16_80/20%)]",
  };

  const iconVariant = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    success: "bg-[oklch(0.72_0.19_145/15%)] text-[oklch(0.72_0.19_145)]",
    warning: "bg-[oklch(0.80_0.16_80/15%)] text-[oklch(0.80_0.16_80)]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg",
        variantStyles[variant],
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary/5 to-transparent -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.positive ? "text-[oklch(0.72_0.19_145)]" : "text-destructive"
              )}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-muted-foreground">vs kemarin</span>
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconVariant[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
