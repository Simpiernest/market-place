"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sparkles, TrendingUp, Info, ShieldCheck, BarChart3, CheckCircle2, ArrowRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

import { useUser } from "@/context/user-context";

export function ValuationLandingPageContent() {
  const { t } = useTranslation();
  const { user } = useUser();

  const metadataRole = user?.roles?.[0]?.role?.toLowerCase() || user?.user_metadata?.role || 'buyer';
  const ctaHref = user ? (metadataRole === 'seller' ? "/dashboard/seller/valuation" : "/dashboard/buyer") : "/register";

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero */}
      <section className="container">
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                  <Calculator className="w-4 h-4 text-accent" />
                  Real-time Multiples Analysis
               </div>
               <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl uppercase italic text-primary">
                  {t("valuation.title")}
               </h1>
               <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                  {t("valuation.subtitle")}
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white border-none font-black h-14 px-10 text-lg uppercase tracking-widest shadow-xl shadow-accent/20 transition-all cursor-pointer">
                    <Link href={ctaHref}>
                      {t("valuation.cta")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl border-2 hover:bg-secondary transition-all cursor-pointer">
                    <Link href="#process">
                        {t("valuation.how_it_calculated") || "How it's Calculated"}
                    </Link>
                  </Button>
               </div>
            </div>
            <div className="relative">
               <Card className="border-none shadow-2xl bg-white p-8 overflow-hidden rounded-[2.5rem]">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Sparkles className="w-32 h-32 text-accent" />
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Multiple</span>
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                           <BadgeCheck className="w-4 h-4 text-accent" />
                        </div>
                     </div>
                     <div className="text-6xl font-black text-primary italic">3.4 - 4.2x</div>
                     <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-2/3 animate-pulse" />
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-6 border-t border-secondary">
                        <div>
                           <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Growth Factor</div>
                           <div className="text-sm font-black text-green-600">+0.4x</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Margin Score</div>
                           <div className="text-sm font-black text-accent uppercase italic">High Tier</div>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </section>

      {/* Process Section */}
      <section id="process" className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
         <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
            <Calculator className="w-96 h-96" />
         </div>
         <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold sm:text-4xl uppercase italic tracking-tight">{t("valuation.process_title")}</h2>
               <p className="text-lg text-primary-foreground/70 mt-4 font-medium">Simple inputs. Institutional outputs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
               {[
                 { title: t("valuation.step1"), desc: t("valuation.step1_desc"), icon: Info },
                 { title: t("valuation.step2"), desc: t("valuation.step2_desc"), icon: BarChart3 },
                 { title: t("valuation.step3"), desc: t("valuation.step3_desc"), icon: TrendingUp },
               ].map(item => (
                 <div key={item.title} className="text-center space-y-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto border border-white/20">
                       <item.icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-primary-foreground/60 leading-relaxed text-sm">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Value Factors */}
      <section className="container">
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-3xl font-bold text-primary sm:text-4xl mb-6 uppercase tracking-tight">What drives your value?</h2>
               <p className="text-lg text-muted-foreground leading-relaxed mb-8">Our engine weighs over 120 variables to determine your market multiple.</p>
               <div className="space-y-4">
                  {[
                    "Net Profit Margin & Churn Rates",
                    "Owner Involvement & Documentation Score",
                    "Traffic Channel Diversity & SEO Strength",
                    "Brand Equity & Customer Concentration",
                    "Technology Stack & Maintenance Costs"
                  ].map(factor => (
                    <div key={factor} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/20 font-bold text-primary text-sm">
                       <CheckCircle2 className="w-5 h-5 text-green-600" />
                       {factor}
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-accent/5 p-12 rounded-3xl border border-accent/10">
               <div className="space-y-8 text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-primary">V1.5 & V2 Capabilities</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                     During our current rollout, the valuation flow provides a structured structural estimate. In V2, this is enhanced by agentic AI that deep-scans your P&L to provide a range with 98% accuracy.
                  </p>
                  <Button asChild className="bg-accent hover:bg-accent/90 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-accent/10 transition-all cursor-pointer">
                    <Link href={ctaHref}>
                      {user ? "Access Smart Valuation" : "Access Full Valuation Suite"}
                    </Link>
                  </Button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

export default function ValuationLandingPage() {
    return <ValuationLandingPageContent />
}
