"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
    const val = value ? value[0] : min;
    
    // Calculate percentage for gradient track
    const percentage = ((val - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    return (
      <div className={cn("relative flex w-full touch-none items-center select-none group py-4", className)}>
        <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
          {/* Active Track (Progress) */}
          <div 
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={val}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            "absolute w-full h-1.5 opacity-0 cursor-pointer z-20",
            disabled && "cursor-not-allowed"
          )}
          {...props}
        />
        
        {/* Custom Thumb Rendering */}
        <div 
          className="absolute size-4 rounded-full border-2 border-primary bg-background shadow-sm pointer-events-none z-10 transition-all duration-150 group-hover:scale-110 group-active:scale-95"
          style={{ 
            left: `calc(${percentage}% - 8px)`,
            boxShadow: "0 0 10px oklch(0.65 0.2 250 / 0.1)"
          }}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
