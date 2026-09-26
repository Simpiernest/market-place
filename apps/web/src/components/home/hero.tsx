"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useTranslation } from "@/hooks/use-translation";
import { SpinningBorderButton } from "@/components/ui/spinning-border-button";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/user-context";

export function Hero() {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-primary pt-24 pb-32 md:pt-32 md:pb-48 lg:pt-40 lg:pb-64">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary" />

        {/* Dynamic Blobs */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="container relative z-10 text-center">
        <div className="mx-auto max-w-5xl space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md shadow-2xl"
          >
             <Sparkles className="w-4 h-4 text-accent animate-pulse" />
             {t("hero.network")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-black tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl uppercase italic leading-[0.9] drop-shadow-2xl"
          >
            BUY. SELL. <motion.span animate={{ color: ["#fff", "#3b82f6", "#fff"] }} transition={{ duration: 4, repeat: Infinity }} className="text-accent">GROW.</motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg md:text-xl text-white/80 font-medium leading-relaxed drop-shadow-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-6 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link href="/marketplace">
              <SpinningBorderButton className="h-16 shadow-accent/40">
                {t("hero.cta_primary")}
              </SpinningBorderButton>
            </Link>

            <Link href="/sell">
              <Button size="lg" variant="ghost" className="border-2 border-white/40 !bg-transparent !text-white hover:bg-white/10 font-black h-16 px-12 text-[10px] uppercase tracking-widest transition-all backdrop-blur-md rounded-full">
                {t("hero.cta_secondary")}
              </Button>
            </Link>

            {user && (
                <Link href="/dashboard">
                    <Button size="lg" className="bg-white/10 backdrop-blur-md text-white border-2 border-white/20 font-black h-16 px-8 rounded-full uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all">
                        My Dashboard
                    </Button>
                </Link>
            )}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSearch}
            className="mt-16 mx-auto max-w-2xl relative group"
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-20">
              <Search className="h-6 w-6 text-white/40 group-focus-within:text-accent transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t("hero.search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/10 rounded-3xl pl-14 pr-6 py-6 text-lg text-white font-bold placeholder:text-white/30 shadow-2xl focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all outline-none backdrop-blur-2xl"
            />
            <div className="absolute right-3 top-3 bottom-3 flex items-center">
               <Button type="submit" className="h-full rounded-2xl bg-white text-primary font-black uppercase text-[10px] px-6 hover:bg-slate-100 shadow-lg cursor-pointer">
                  Search
               </Button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] font-black uppercase tracking-widest text-white/50"
          >
            <span className="text-white/30">{t("common.hot_sectors")}</span>
            <Link href="/marketplace?type=saas" className="hover:text-accent transition-colors">SaaS</Link>
            <Link href="/marketplace?type=ai" className="hover:text-accent transition-colors">AI & Automations</Link>
            <Link href="/marketplace?type=ecommerce" className="hover:text-accent transition-colors">Ecommerce</Link>
            <Link href="/marketplace?type=newsletter" className="hover:text-accent transition-colors">Newsletters</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
