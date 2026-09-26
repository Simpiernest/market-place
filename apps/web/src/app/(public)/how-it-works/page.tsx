"use client";

import { Button } from "@/components/ui/button";
import { Search, FileSearch, ShieldCheck, MessageSquare, BadgeCheck, TrendingUp, CheckCircle2, ArrowRight, UserCheck, Lock, History } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function HowItWorksPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const role = user?.user_metadata?.role || 'buyer';
  const ctaHref = user ? (role === 'seller' ? "/dashboard/seller" : "/dashboard/buyer") : "/register";

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero */}
      <section className="container text-center max-w-4xl mx-auto space-y-8">
         <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl uppercase italic text-primary">
            How We <span className="text-accent">Operate.</span>
         </h1>
         <p className="text-xl text-muted-foreground leading-relaxed font-medium">
            Business Bridge is more than a marketplace. It's a structured acquisition environment designed to protect buyers and maximize value for sellers.
         </p>
         <div className="pt-4 flex justify-center gap-4">
            <Link href={ctaHref}>
              <Button size="lg" className="bg-primary text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/10 transition-all cursor-pointer hover:bg-primary/90">
                {user ? "Go to Dashboard" : "Get Started Now"}
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl border-2 hover:bg-secondary transition-all cursor-pointer">Watch Demo Video</Button>
         </div>
      </section>

      {/* The Buyer Path */}
      <section className="container">
         <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-white shadow-lg">
               <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold text-primary uppercase tracking-tight italic">For <span className="text-accent">Buyers</span></h2>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Discover", desc: "Filter thousands of listings by revenue, profit, business type, and industry.", icon: Search },
              { title: "Evaluate", desc: "Review high-level financials and business models directly on the listing page.", icon: FileSearch },
              { title: "Verify", desc: "Access deeper verification reports for premium businesses to ensure data accuracy.", icon: ShieldCheck },
              { title: "Connect", desc: "Message sellers through our secure portal without revealing private contact info.", icon: MessageSquare },
              { title: "Offer", desc: "Submit binding or non-binding offers with custom terms and closing timelines.", icon: TrendingUp },
              { title: "Close", desc: "Move into the Deal Room for due diligence, asset transfer, and secure payout.", icon: BadgeCheck },
            ].map((step, i) => (
              <div key={step.title} className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-xl transition-all group">
                 <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white mb-6">
                    <step.icon className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                 <div className="mt-4 text-[10px] font-black text-accent/20 tracking-widest">BUYER STEP 0{i+1}</div>
              </div>
            ))}
         </div>
      </section>

      {/* The Seller Path */}
      <section className="bg-secondary/20 py-24">
         <div className="container">
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <h2 className="text-3xl font-bold text-primary uppercase tracking-tight italic">For <span className="text-accent">Sellers</span></h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { title: "List", desc: "Create a professional business profile using our step-by-step listing wizard.", icon: TrendingUp },
                 { title: "Verify", desc: "Complete identity and financial verification to earn the 'Verified' badge.", icon: ShieldCheck },
                 { title: "Data Room", desc: "Organize sensitive documents in an encrypted vault for authorized buyers only.", icon: Lock },
                 { title: "Review", desc: "Our moderation team ensures your listing is optimized for maximum visibility.", icon: FileSearch },
                 { title: "Manage", desc: "Track views, saves, and inquiries through your seller dashboard in real-time.", icon: MessageSquare },
                 { title: "Liquidity", desc: "Accept offers and complete the asset transfer through our escrow foundation.", icon: BadgeCheck },
               ].map((step, i) => (
                 <div key={step.title} className="p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all group">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white mb-6">
                       <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    <div className="mt-4 text-[10px] font-black text-primary/20 tracking-widest">SELLER STEP 0{i+1}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final Section */}
      <section className="container mb-12">
         <div className="grid lg:grid-cols-2 gap-16 items-center bg-primary rounded-3xl p-12 lg:p-24 text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <History className="w-64 h-64" />
            </div>
            <div className="space-y-8 relative z-10">
               <h2 className="text-4xl font-extrabold uppercase italic tracking-tight">Security is our <span className="text-accent">Standard.</span></h2>
               <p className="text-xl text-white/70 leading-relaxed font-medium">
                  Every transaction on Business Bridge is protected by our immutable audit trail and multi-region compliance infrastructure.
               </p>
               <Link href={ctaHref}>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-accent/20 transition-all cursor-pointer">
                    {user ? "Go to My Dashboard" : "Create Free Account"}
                  </Button>
               </Link>
            </div>
            <div className="grid gap-4 relative z-10">
               {[
                 "Encrypted Data Rooms (AES-256)",
                 "Legally Binding NDA Integration",
                 "Integrated KYC/KYB Verification",
                 "escrow-Protected Transaction Flow",
                 "Full Immutable Action Logs"
               ].map(item => (
                 <div key={item} className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {item}
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
