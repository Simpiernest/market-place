"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";

export function SortDropdown() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "Price (High to Low)";
  const [selected, setSelected] = useState(currentSort);

  const options = [
    { label: t("marketplace.sort_newest"), value: "Newest Listings" },
    { label: t("marketplace.sort_price_desc"), value: "Price (High to Low)" },
    { label: t("marketplace.sort_price_asc"), value: "Price (Low to High)" },
    { label: t("marketplace.sort_profit"), value: "Profit (Highest)" },
    { label: t("marketplace.sort_revenue"), value: "Revenue (Highest)" }
  ];

  const handleSelect = (val: string) => {
    setSelected(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", val);
    router.push(`/marketplace?${params.toString()}`);
  };

  const selectedOption = options.find(o => o.value === selected) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none font-black text-[10px] uppercase tracking-widest h-11 px-6 rounded-xl border-2 hover:bg-secondary transition-all cursor-pointer">
          {t("marketplace.sort_by")}: {selectedOption.label}
          <ChevronDown className="w-4 h-4 ml-3 text-accent" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl border border-slate-200 p-2 bg-white z-[1001]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="hover:bg-accent hover:text-white transition-all cursor-pointer rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest"
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
