"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { api } from "@/lib/api-client";

export function MarketplaceFilters() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get("category"));
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [minProfit, setMinProfit] = useState(searchParams.get("min_profit") || "");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
        try {
            const data = await api.get("/marketplace/categories");
            setCategories(data);
        } catch (e) {
            // Fallback if backend is unavailable
            setCategories([
                { name: "SaaS", slug: "saas" },
                { name: "Ecommerce", slug: "ecommerce" },
                { name: "Content", slug: "content" }
            ]);
        }
    }
    fetchCategories();
  }, []);

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/marketplace?${params.toString()}`);
  };

  const handleApply = () => {
    setIsApplying(true);
    updateUrl({
        search,
        min_price: minPrice,
        max_price: maxPrice,
        min_profit: minProfit
    });
    setTimeout(() => setIsApplying(false), 800);
  };

  const toggleCategory = (slug: string) => {
    const newVal = slug === activeCategory ? null : slug;
    setActiveCategory(newVal);
    updateUrl({ category: newVal });
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary px-1">{t("marketplace.search_label")}</h3>
        <div className="relative group">
           <Input
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleApply()}
             placeholder="Keywords..."
             className="h-11 rounded-xl border-2 border-secondary focus:border-accent transition-all pl-4 font-bold text-xs bg-white"
           />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary px-1">{t("marketplace.sectors_label")}</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.slug}
              variant="outline"
              onClick={() => toggleCategory(cat.slug)}
              className={cn(
                "cursor-pointer py-1.5 px-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-tighter transition-all",
                activeCategory === cat.slug
                  ? "bg-accent border-accent text-white"
                  : "bg-white border-secondary text-primary hover:border-accent hover:text-accent"
              )}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary px-1">{t("marketplace.price_label")}</h3>
        <div className="space-y-4 bg-slate-50/50 p-5 rounded-3xl border border-secondary/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min ($)</label>
               <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="h-10 rounded-xl border-2 border-secondary bg-white font-bold text-xs focus:border-accent transition-all"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max ($)</label>
               <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="5M+"
                className="h-10 rounded-xl border-2 border-secondary bg-white font-bold text-xs focus:border-accent transition-all"
               />
            </div>
          </div>
          <Button
            className="w-full bg-primary text-white h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-none hover:bg-accent transition-all shadow-lg shadow-primary/10 cursor-pointer"
            onClick={handleApply}
            loading={isApplying}
          >
            {t("marketplace.apply_btn")}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary px-1">{t("marketplace.profit_label")}</h3>
        <div className="space-y-4 bg-slate-50/50 p-5 rounded-3xl border border-secondary/50">
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min ($)</label>
                <Input
                    type="number"
                    value={minProfit}
                    onChange={(e) => setMinProfit(e.target.value)}
                    placeholder="0"
                    className="h-10 rounded-xl border-2 border-secondary bg-white font-bold text-xs focus:border-accent transition-all"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max ($)</label>
                <Input type="number" placeholder="Any" className="h-10 rounded-xl border-2 border-secondary bg-white font-bold text-xs focus:border-accent transition-all opacity-50 cursor-not-allowed" disabled />
             </div>
          </div>
          <Button
            className="w-full bg-primary text-white h-11 rounded-xl font-black uppercase text-[10px] tracking-widest border-none hover:bg-accent transition-all shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-70"
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Filter Profit"}
          </Button>
        </div>
      </div>

      <div className="pt-4 px-1">
         <Button
           variant="ghost"
           onClick={() => {
              setActiveCategory(null);
              setSearch("");
              setMinPrice("");
              setMaxPrice("");
              setMinProfit("");
              router.push("/marketplace");
           }}
           className="w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-destructive/5 hover:text-destructive border-2 border-transparent hover:border-destructive/10 transition-all cursor-pointer"
         >
           {t("marketplace.reset_btn")}
         </Button>
      </div>
    </motion.div>
  );
}
