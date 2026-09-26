"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/home/hero";
import { MarketplaceStats } from "@/components/home/stats";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustVerification } from "@/components/home/trust-verification";
import { ValuationCTA } from "@/components/home/valuation-cta";
import { EducationalResources } from "@/components/home/educational-resources";
import { FAQ } from "@/components/home/faq";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    async function fetchFeatured() {
      try {
        const data = await api.get("/marketplace/featured");
        if (data && Array.isArray(data)) {
            setFeatured(data.filter(item => item && item.id));
        } else {
            throw new Error("Invalid data format");
        }
      } catch (e) {
        console.error("Failed to fetch featured listings, using fallbacks");
        setFeatured([
            { id: "f1", title: "Premium AI Platform", category: "SaaS", asking_price: 125000, profit: 3800, slug: "ai-customer-support-saas", is_verified: true },
            { id: "f2", title: "Ecommerce - Home Goods", category: "Ecommerce", asking_price: 85000, profit: 2100, slug: "sustainable-fashion-store", is_verified: true },
            { id: "f3", title: "SaaS Analytics Tool", category: "SaaS", asking_price: 45000, profit: 1650, slug: "marketing-automation-platform", is_verified: false }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <>
      <Hero />
      <MarketplaceStats />

      {/* Featured Opportunities */}
      <section className="bg-secondary/30 py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-primary uppercase italic">
                {t("home.featured_title")}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground font-medium">
                {t("home.featured_subtitle")}
              </p>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" className="font-black uppercase text-[10px] tracking-widest border-2 px-6 h-11 hover:bg-primary hover:text-white transition-all cursor-pointer">
                {t("home.view_all")}
                <ArrowRight className="ml-2 h-4 w-4 text-accent" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
                <div className="col-span-full h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            ) : (
                featured.map((listing, i) => (
                    <motion.div
                        key={listing.id || `featured-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex flex-col h-full"
                    >
                        <Card className="overflow-hidden group hover:shadow-2xl transition-all border-none shadow-sm bg-white rounded-3xl flex flex-col h-full">
                            <div className="h-56 bg-muted relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10" />
                            <div className="absolute inset-0 flex items-center justify-center text-primary/10 font-black uppercase tracking-widest text-4xl group-hover:scale-110 transition-transform duration-500 select-none">
                                {listing.category || "Asset"}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">{listing.category || "Digital"}</span>
                                <div className="text-right">
                                <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">Asking Price</div>
                                <div className="text-2xl font-black text-accent drop-shadow-md">${(listing.asking_price || 0).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="absolute top-4 left-4 z-20">
                                {listing.is_verified && (
                                    <div className="flex items-center gap-1.5 bg-green-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified
                                    </div>
                                )}
                            </div>
                            </div>
                            <CardHeader className="flex-1 p-6">
                                <Link href={`/businesses/${listing.slug || listing.id}`}>
                                    <CardTitle className="text-xl font-black text-primary group-hover:text-accent transition-colors cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-accent/30 uppercase italic">{listing.title || "Institutional Asset"}</CardTitle>
                                </Link>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-medium italic">High-performance asset in the {(listing.category || "Digital").toLowerCase()} sector.</p>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <div className="grid grid-cols-2 gap-6 py-4 border-y border-slate-100">
                                    <div>
                                    <span className="text-muted-foreground block text-[9px] font-black uppercase tracking-widest mb-1">Net Profit</span>
                                    <span className="font-black text-primary text-lg">${(listing.profit || 0).toLocaleString()}<span className="text-[10px] text-muted-foreground ml-1">/mo</span></span>
                                    </div>
                                    <div className="border-l border-slate-100 pl-6">
                                    <span className="text-muted-foreground block text-[9px] font-black uppercase tracking-widest mb-1">Multiple</span>
                                    <span className="font-black text-primary text-lg">3.2x</span>
                                    </div>
                                </div>
                                <Link href={`/businesses/${listing.slug || listing.id}`} className="block w-full">
                                    <Button className="w-full mt-6 bg-primary text-primary-foreground border-none font-black text-[10px] h-12 uppercase tracking-widest shadow-lg shadow-primary/10 group-hover:bg-accent transition-all cursor-pointer active:scale-95 italic">
                                        View Full Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
            )}
          </div>
        </div>
      </section>

      <HowItWorks />
      <TrustVerification />
      <ValuationCTA />

      {/* Categories Grid (Enhanced) */}
      <section className="container py-24">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {t("home.categories_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("home.categories_subtitle")}
            </p>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "SaaS", "Ecommerce", "Mobile Apps", "Websites", "Agencies",
              "Content", "Newsletters", "AI Businesses", "Marketplaces", "Services"
            ].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/marketplace?category=${cat.toLowerCase().replace(' ', '-')}`}>
                    <div className="group p-6 rounded-2xl border-2 border-secondary bg-white hover:bg-primary hover:border-primary transition-all text-center cursor-pointer shadow-sm hover:shadow-xl active:scale-95">
                    <h3 className="font-black uppercase italic text-sm text-primary group-hover:text-white transition-colors">{cat}</h3>
                    </div>
                </Link>
              </motion.div>
            ))}
         </div>
      </section>

      <EducationalResources />
      <FAQ />

      {/* Final CTA */}
      <section className="container py-24">
        <div className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16 md:py-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl uppercase italic">
              {t("home.cta_title")}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-foreground/80 font-medium">
              {t("home.cta_subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-none h-14 px-10 text-lg font-black shadow-xl shadow-accent/20 transition-all cursor-pointer">
                    Go to My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-none h-14 px-10 text-lg font-black shadow-xl shadow-accent/20 transition-all cursor-pointer">
                    {t("home.cta_btn")}
                  </Button>
                </Link>
              )}
              <Link href="/how-it-works">
                <Button size="lg" variant="ghost" className="border-2 border-primary-foreground/20 !bg-transparent !text-primary-foreground hover:bg-primary-foreground/10 h-14 px-10 text-lg font-bold transition-all cursor-pointer">
                  {t("home.learn_more")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
