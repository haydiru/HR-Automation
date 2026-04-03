"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CriteriaBuilderProps {
  label: string;
  description: string;
  items: string[];
  onChange: (items: string[]) => void;
  variant?: "mandatory" | "optional";
}

export function CriteriaBuilder({
  label,
  description,
  items,
  onChange,
  variant = "mandatory",
}: CriteriaBuilderProps) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h4
          className={cn(
            "text-sm font-semibold",
            variant === "mandatory" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {label}
        </h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Item List */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
              variant === "mandatory"
                ? "border-destructive/20 bg-destructive/5"
                : "border-border bg-muted/30"
            )}
          >
            <span className="text-xs text-muted-foreground font-mono w-5">
              {index + 1}.
            </span>
            <span className="flex-1">{item}</span>
            <button
              onClick={() => removeItem(index)}
              className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Input */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik syarat baru..."
          className="flex-1 h-9 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addItem}
          disabled={!newItem.trim()}
          className="h-9"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
