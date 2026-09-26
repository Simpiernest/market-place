"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Heart, MessageSquare, TrendingUp, Sparkles, Target, ArrowRight, Loader2, Bot, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";

export default function BuyerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setDashboardError(null);
      try {
        const [statsData, savedData, aiData] = await Promise.all([
            api.get("/buyers/dashboard"),
            api.get("/buyers/saved-listings"),
            api.get("/ai-broker/matches")
        ]);
        setStats(statsData);
        setSavedListings(savedData?.items || []);
        setAiMatches(Array.isArray(aiData) ? aiData : []);
      } catch (e) {
        setDashboardError("Sync failed. Displaying offline view.");
        console.error("Failed to fetch buyer dashboard data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statItems = [
    { label: "Saved Listings", value: stats?.saved || 0, icon: Heart },
    { label: "Active Offers", value: stats?.offers || 0, icon: Briefcase },
    { label: "Buyer Standing", value: stats?.standing || 50, icon: ShieldCheck },
    { label: "Buyer Tier", value: stats?.tier || "BASIC", icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
         <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary uppercase italic">Buyer <span className="text-accent">Portal.</span></h1>
          <p className="text-muted-foreground font-medium">Analyze opportunities, manage mandates, and oversee active acquisitions.</p>
          {dashboardError && (
            <div className="mt-2 text-[10px] font-black uppercase text-accent animate-pulse tracking-widest">
              {dashboardError}
            </div>
          )}
        </div>
        <Link href="/dashboard/buyer/mandate">
          <Button className="bg-primary text-white border-none font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:bg-accent transition-all cursor-pointer">
            <Target className="w-4 h-4 mr-2" />
            Update Mandate
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden h-full">
                <div className="h-1 bg-accent/20 group-hover:bg-accent transition-colors" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                    </CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all">
                    <stat.icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="text-3xl font-black text-primary italic tracking-tight">
                        {typeof stat.value === 'number' ? (
                            <Counter value={stat.value} />
                        ) : (
                            stat.value
                        )}
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Matches Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1 gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            <h2 className="text-xl font-black text-primary uppercase tracking-tight">AI Matching Intel</h2>
            <Badge className="bg-accent text-white border-none ml-2 uppercase font-black text-[8px] tracking-tighter">Updated Live</Badge>
          </div>
          <Link href="/dashboard/buyer/discover" className="text-[10px] font-black uppercase text-accent hover:underline decoration-2 underline-offset-4 cursor-pointer">Explore More Matches</Link>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none bg-primary text-white shadow-xl rounded-3xl overflow-hidden relative col-span-1 lg:col-span-1">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-24 h-24 text-accent" />
             </div>
             <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Trust Profile</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase mt-1 tracking-widest">Acquisition Capacity verified</p>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                        <span>Identity</span>
                        <span className="text-green-400">Verified</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                        <span>Liquidity</span>
                        <span className={cn(stats?.tier === 'BASIC' ? 'text-white/30' : 'text-green-400')}>{stats?.tier === 'BASIC' ? 'Not Verified' : 'Verified'}</span>
                    </div>
                </div>
                {stats?.tier === 'BASIC' && (
                    <Link href="/dashboard/buyer/qualification">
                        <Button className="w-full bg-accent hover:bg-accent/90 border-none text-white font-black uppercase text-[10px] h-11">Complete Verification</Button>
                    </Link>
                )}
             </CardContent>
          </Card>

          {aiMatches.length > 0 ? aiMatches.map((match) => (
            <Card key={match.listing_id} className="border-none bg-white hover:bg-slate-50 transition-all relative overflow-hidden group shadow-sm hover:shadow-2xl rounded-3xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24 text-accent" />
              </div>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                  <div>
                    <h3 className="font-black text-xl text-primary group-hover:text-accent transition-colors italic uppercase">{match.title}</h3>
                    <div className="text-accent font-black text-lg mt-1 tracking-tight">Acquisition Opportunity</div>
                  </div>
                  <div className="text-left sm:text-right bg-secondary/30 p-2 rounded-xl border border-secondary/50 self-start sm:self-auto">
                    <div className="text-2xl font-black text-primary italic">{Math.round(match.confidence * 100)}%</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Match Accuracy</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/20 border border-secondary mb-6 flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                     <Bot className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">"{match.broker_narrative}"</p>
                </div>

                <div className="space-y-3 mb-6">
                    {match.action_items?.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {item}
                        </div>
                    ))}
                </div>

                <Link href={`/businesses/${match.listing_id}`}>
                    <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all shadow-lg shadow-accent/5 cursor-pointer active:scale-95">
                    Analyze This Deal
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
              </CardContent>
            </Card>
          )) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl bg-secondary/5">
                  <Bot className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium italic uppercase tracking-widest">The AI Broker is analyzing the market for matches based on your mandate...</p>
              </div>
          )}
        </div>
      </section>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col rounded-3xl">
          <CardHeader className="p-6 sm:p-8 bg-secondary/10 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Watchlist & Activity</CardTitle>
            <Link href="/dashboard/buyer/saved">
               <Button variant="ghost" size="sm" className="text-xs font-bold text-accent cursor-pointer hover:bg-accent/5">All Saved</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
              <table className="w-full text-sm text-left min-w-[500px]">
                <thead className="bg-secondary/30 border-b text-primary font-black uppercase tracking-widest text-[10px]">
                   <tr>
                      <th className="px-6 sm:px-8 py-4">Business</th>
                      <th className="px-6 sm:px-8 py-4">Metrics</th>
                      <th className="px-6 sm:px-8 py-4 text-right">Trend</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {savedListings.length > 0 ? savedListings.map((listing, i) => (
                     <motion.tr
                        key={listing.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="hover:bg-secondary/5 group transition-colors cursor-pointer"
                    >
                        <td className="px-6 sm:px-8 py-6">
                           <Link href={`/businesses/${listing.slug || listing.id}`} className="block">
                              <div className="font-bold text-primary group-hover:text-accent transition-colors uppercase truncate max-w-[150px] sm:max-w-none">{listing.title}</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Micro-Cap • ${Number(listing.asking_price || 0).toLocaleString()}</div>
                           </Link>
                        </td>
                        <td className="px-6 sm:px-8 py-6 font-bold text-muted-foreground whitespace-nowrap">3.5x SDE Multiple</td>
                        <td className="px-6 sm:px-8 py-6 text-right">
                           <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
                        </td>
                     </motion.tr>
                   )) : (
                     <tr>
                        <td colSpan={3} className="p-12 text-center text-muted-foreground italic text-xs font-medium uppercase tracking-widest opacity-50">Your watchlist is empty</td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-none shadow-sm bg-primary text-white overflow-hidden relative shadow-2xl rounded-3xl">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Briefcase className="w-24 h-24" />
           </div>
           <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 italic">
                 <Zap className="h-4 w-4 text-accent animate-pulse" />
                 Active Offers
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
              {stats?.offers > 0 ? (
                  <div className="space-y-4">
                      <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex justify-between items-center">
                          <div className="text-xs font-bold uppercase">Pending Response</div>
                          <div className="text-2xl font-black text-accent">{stats.offers}</div>
                      </div>
                      <Link href="/dashboard/buyer/offers" className="block">
                          <Button className="w-full bg-white text-primary hover:bg-accent hover:text-white font-black uppercase text-[10px] h-12 shadow-xl transition-all">Manage All Offers</Button>
                      </Link>
                  </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-white/10 border-dashed rounded-[2rem] space-y-4">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white/20" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm font-bold uppercase tracking-tight">No active deals</div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Submit an offer to start</p>
                    </div>
                    <Link href="/marketplace">
                        <Button size="sm" className="bg-white text-primary hover:bg-accent hover:text-white font-black uppercase text-[10px] h-9 px-6 shadow-xl transition-all cursor-pointer">Explore</Button>
                    </Link>
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

