"use client";

import * as React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("w-8 h-8 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground relative", className)}
          >
            <Globe className="w-4 h-4" />
            <span className="sr-only">Toggle Language</span>
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-extrabold uppercase px-1 py-0 bg-primary/20 text-primary rounded-full leading-none">
              {language}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl shadow-xl border-border">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer"
        >
          <span className="flex items-center gap-2 font-medium">
            🇺🇸 English
          </span>
          {language === "en" && <Check className="w-3.5 h-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("id")}
          className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer"
        >
          <span className="flex items-center gap-2 font-medium">
            🇮🇩 Bahasa Indonesia
          </span>
          {language === "id" && <Check className="w-3.5 h-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
