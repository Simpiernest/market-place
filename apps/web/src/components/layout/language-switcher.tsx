"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { lang, changeLanguage } = useTranslation();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-1 bg-white border border-slate-200 shadow-2xl min-w-[140px] z-[1000] !opacity-100">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={lang === "en" ? "bg-accent/10 text-accent font-bold" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("fr")}
          className={lang === "fr" ? "bg-accent/10 text-accent font-bold" : ""}
        >
          Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ar")}
          className={lang === "ar" ? "bg-accent/10 text-accent font-bold" : ""}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
