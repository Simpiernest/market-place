"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MessageSquare, Star, Clock, Globe, Loader2, DollarSign, UserCheck, TrendingUp, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function BuyerProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;

  const [buyer, setBuyer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const data = await api.get(`/buyers/${id}/profile`);
        setBuyer(data);
      } catch (e: any) {
        setError(e.message || "Failed to load buyer profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <div className="container py-24 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase italic text-primary">Buyer Not Found.</h1>
        <p className="text-muted-foreground font-medium">The institutional profile you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-12">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Left Sidebar Profile Card */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-secondary/30 text-center space-y-6 border border-secondary">
              <div className="mx-auto h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center text-4xl font-black text-primary italic shadow-xl">
                {buyer.full_name[0]}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black uppercase italic text-primary leading-tight">{buyer.full_name}.</h1>
                <div className="flex flex-col items-center gap-2">
                    <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest border-none",
                        buyer.tier === 'TRUSTED' ? "bg-accent" :
                        buyer.tier === 'FUNDED' ? "bg-blue-600" :
                        "bg-slate-400"
                    )}>
                        {buyer.tier} BUYER
                    </Badge>
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Identity Verified</span>
                    </div>
                </div>
              </div>
              <Button className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl cursor-pointer active:scale-95 transition-all shadow-xl shadow-primary/10">
                 <MessageSquare className="w-4 h-4 mr-2" />
                 Initiate Discussion
              </Button>
           </div>

           {/* Stats Panel */}
           <div className="p-8 rounded-[2rem] border border-slate-200 bg-white space-y-6">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reputation Score</h3>
                 <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-primary italic">{buyer.standing_score}</span>
                    <span className="text-xs font-bold text-muted-foreground pb-1.5">/ 100</span>
                 </div>
                 <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${buyer.standing_score}%` }} />
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification status</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Identity</span>
                        {buyer.identity_verified ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Proof of Funds</span>
                        {buyer.proof_of_funds_verified ? <DollarSign className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-12">
           <section className="space-y-6">
              <h2 className="text-2xl font-black uppercase italic text-primary">Investor Thesis.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium italic">
                "{buyer.bio || "This buyer has not provided a detailed acquisition thesis yet."}"
              </p>
           </section>

           <div className="grid sm:grid-cols-2 gap-8">
              <Card className="rounded-[2rem] border-none shadow-sm bg-secondary/10 p-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Acquisition Capacity</h3>
                 <div className="space-y-6">
                    <div>
                        <div className="text-[9px] font-black uppercase text-accent mb-1 tracking-widest">Typical Budget Range</div>
                        <div className="text-2xl font-black text-primary italic">${buyer.budget_range}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase text-accent mb-1 tracking-widest">Active Acquisitions</div>
                        <div className="text-2xl font-black text-primary italic">{buyer.acquisitions_count} Completed</div>
                    </div>
                 </div>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-sm bg-primary text-white p-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Institutional History</h3>
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-tight">Active Inquirer</div>
                            <p className="text-[10px] text-white/50 font-medium">Involved in 12 active deal room discussions.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-tight">Member Since</div>
                            <p className="text-[10px] text-white/50 font-medium">Joined the acquisition network in {buyer.joined_year}.</p>
                        </div>
                    </div>
                 </div>
              </Card>
           </div>

           <section className="space-y-8 p-10 rounded-[2.5rem] bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-4">
                 <ShieldCheck className="w-8 h-8 text-accent" />
                 <h2 className="text-2xl font-black uppercase italic text-primary">Commitment to Confidentiality.</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                This buyer has signed our standard Institutional Non-Disclosure Agreement and maintains a 100% compliance record. They have verified institutional funding sources and are authorized to participate in private data rooms.
              </p>
           </section>
        </div>
      </div>
    </div>
  );
}
