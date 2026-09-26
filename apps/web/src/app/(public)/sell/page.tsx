"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowRight, MessageSquare, TrendingUp, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function SellLandingPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const role = user?.user_metadata?.role || 'buyer';
  const startSellingHref = user
    ? (role === 'seller' ? "/dashboard/seller/listings/new" : "/onboarding/seller")
    : "/register";
  const processSteps = [
    { title: "LIST", desc: "Create your professional listing in minutes with our guided wizard.", icon: Zap },
    { title: "VERIFY", desc: "Our team vets your data to build immediate buyer trust.", icon: ShieldCheck },
    { title: "ATTRACT", desc: "Get exposure to 15,000+ verified investors and PE firms.", icon: Globe },
    { title: "NEGOTIATE", desc: "Manage offers and communicate through secure deal rooms.", icon: MessageSquare },
    { title: "TRANSFER", desc: "Structured handover process for all digital assets.", icon: BadgeCheck },
    { title: "PAYOUT", desc: "Receive funds securely via our integrated escrow services.", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="container">
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" />
                  Maximized Exit Multiples
               </div>
               <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl uppercase italic text-primary">
                  Sell Your Business <span className="text-accent">Faster.</span>
               </h1>
               <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                  Business Bridge connects serious sellers with high-intent buyers. Our platform is built to reduce friction, verify value, and ensure a secure path to payout.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground border-none font-black h-14 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/10 transition-all cursor-pointer hover:bg-primary/90">
                    <Link href={startSellingHref}>
                      {user ? "Create Listing" : "Start Selling"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl border-2 hover:bg-secondary transition-all cursor-pointer">
                    <Link href="/valuation">
                      Free Valuation
                    </Link>
                  </Button>
               </div>
            </div>
            <div className="relative">
               <div className="aspect-square rounded-3xl bg-secondary/50 border-2 border-dashed border-primary/10 flex items-center justify-center p-12 overflow-hidden">
                  <div className="text-center space-y-6">
                     <ShieldCheck className="w-24 h-24 text-accent mx-auto" />
                     <div className="space-y-2">
                        <div className="text-3xl font-black text-primary">$450M+</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marketplace Volume</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Why Sell Section */}
      <section className="bg-secondary/20 py-24">
         <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold text-primary sm:text-4xl uppercase tracking-tight">Why Business Bridge?</h2>
               <p className="text-lg text-muted-foreground mt-4">We've automated the complex parts of the M&A process so you can focus on the deal.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "Verified Buyers", desc: "Access a curated list of buyers with proof of funds and verified identities." },
                 { title: "Zero Upfront Cost", desc: "List for free. We only win when you win. Transparent success-based fees." },
                 { title: "Secure Data Rooms", desc: "Protect your proprietary information with encrypted, permission-based access." },
               ].map(item => (
                 <Card key={item.title} className="border-none shadow-sm bg-white p-4">
                    <CardHeader>
                       <CheckCircle2 className="w-8 h-8 text-accent mb-4" />
                       <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                 </Card>
               ))}
            </div>
         </div>
      </section>

      {/* Process Section */}
      <section className="container">
         <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">The Seller Journey</h2>
            <p className="text-lg text-muted-foreground mt-4">A structured path from listing to liquidity.</p>
         </div>
         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, i) => (
              <div key={step.title} className="relative p-8 rounded-3xl border bg-white group hover:border-accent transition-colors">
                 <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors mb-6">
                    <step.icon className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                 <div className="absolute top-8 right-8 text-2xl font-black text-secondary/50">0{i+1}</div>
              </div>
            ))}
         </div>
      </section>

      {/* CTA */}
      <section className="container mb-12">
         <div className="rounded-3xl bg-accent p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-black uppercase italic mb-6">Ready to exit?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-medium">
               Join 2,500+ successful sellers who have found their perfect acquisition partner on Business Bridge.
            </p>
            <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90 border-none font-black px-12 h-14 text-lg shadow-xl shadow-black/10 transition-all cursor-pointer">
               <Link href={startSellingHref}>
                  {user ? "Create Your Professional Listing" : "Create Your Free Listing"}
               </Link>
            </Button>
         </div>
      </section>
    </div>
  );
}
