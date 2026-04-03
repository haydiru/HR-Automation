"use client";

import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  passingGrade?: number;
  className?: string;
}

export function ScoreCircle({
  score,
  size = 120,
  strokeWidth = 8,
  passingGrade = 70,
  className,
}: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "oklch(0.72 0.19 145)";
    if (score >= passingGrade) return "oklch(0.80 0.16 80)";
    return "oklch(0.65 0.22 25)";
  };

  const color = getColor();

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.28 0.02 260)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            animation: "scoreReveal 1.5s ease-out forwards",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold font-mono"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Skor
        </span>
      </div>
    </div>
  );
}
