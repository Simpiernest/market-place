"use client";

import { Calculator, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/user-context";

export function ValuationCTA() {
  const { t } = useTranslation();
  const { user } = useUser();

  const metadataRole = user?.user_metadata?.role || 'buyer';
  const ctaHref = user ? (metadataRole === 'seller' ? "/dashboard/seller/valuation" : "/dashboard/buyer") : "/valuation";
  const sellHref = user ? (metadataRole === 'seller' ? "/dashboard/seller/listings/new" : "/dashboard/buyer") : "/sell";

  return (
    <section className="container py-24">
      <div className="rounded-3xl bg-accent p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Calculator className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Seller Tools</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-6 uppercase italic">
            {t("home.valuation_cta_title")}
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-10 font-medium italic">
            {t("home.valuation_cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/valuation">
              <Button size="lg" className="bg-white text-accent hover:bg-white/90 border-none font-black px-8 h-12 shadow-xl shadow-black/10 transition-all cursor-pointer">
                {t("home.valuation_cta_btn")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="ghost" className="border-2 border-white/40 !bg-transparent hover:bg-white/10 !text-white font-black px-8 h-12 transition-all cursor-pointer">
                {t("home.sell_cta_btn")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
