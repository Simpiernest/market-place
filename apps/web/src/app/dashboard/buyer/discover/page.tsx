"use client";

import { ListingCard } from "@/components/marketplace/listing-card";
import { MarketplaceFilters } from "@/components/marketplace/filters";
import { AISearchBar } from "@/components/marketplace/ai-search-bar";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Zap, Target, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Suspense, useState, useEffect } from "react";
import { api } from "@/lib/api-client";

export default function BuyerDiscoverPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        const data = await api.get("/ai-broker/matches");
        // Convert broker matches to listing format for card
        if (Array.isArray(data)) {
            setRecommendations(data.map((m: any) => ({
                id: m.listing_id,
                title: m.title,
                category: "SaaS", // Should ideally come from match
                askingPrice: 0,
                revenue: 0,
                profit: 0,
                age: "New",
                location: "Remote",
                isVerified: true,
                slug: m.listing_id
            })));
        }

        // BETTER: Fetch full listing details for the matches
        if (Array.isArray(data) && data.length > 0) {
            const listingsData = await api.get("/marketplace");
            const matchIds = data.map((m: any) => m.listing_id);
            const enriched = listingsData.items.filter((l: any) => matchIds.includes(l.id));
            setRecommendations(enriched.map((l: any) => ({
                id: l.id,
                title: l.title,
                category: l.category?.name || "SaaS",
                askingPrice: l.asking_price,
                revenue: l.monthly_revenue || 0,
                profit: l.monthly_profit || 0,
                age: "2 years",
                location: l.business?.location || "Remote",
                isVerified: l.is_verified,
                slug: l.slug || l.id
            })));
        }
      } catch (e) {
        console.error("Failed to fetch recommendations");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
        <div className="space-y-12">
            <div className="space-y-4">
                <h1 className="text-3xl font-black text-primary uppercase italic">Discover <span className="text-accent">Opportunities.</span></h1>
                <p className="text-muted-foreground font-medium max-w-2xl">Tailored recommendations based on your Acquisition Mandate and market activity.</p>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-accent/5 rounded-3xl -m-4 blur-3xl -z-10" />
                <AISearchBar />
            </div>

            <div className="flex flex-col gap-12 lg:flex-row">
                <aside className="w-full lg:w-64 shrink-0 space-y-8">
                    <div className="p-6 rounded-2xl bg-primary text-primary-foreground space-y-4 shadow-xl">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" />
                        <span className="text-xs font-black uppercase tracking-widest">Active Mandate</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold">SaaS, AI & Tech</p>
                        <p className="text-[10px] text-primary-foreground/60">$50k - $250k Budget</p>
                    </div>
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-8 text-[10px] uppercase font-bold">Edit Criteria</Button>
                    </div>
                    <MarketplaceFilters />
                </aside>

                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-2 px-1">
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight">Top Picks For You</h2>
                    <Badge className="bg-accent text-white border-none ml-2 uppercase font-black text-[8px] tracking-tighter">Updated 2h Ago</Badge>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                    {recommendations.map(listing => (
                        <ListingCard key={listing.id} {...listing} />
                    ))}
                    </div>

                    <div className="pt-8 space-y-6">
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight">Trending in Your Sectors</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-6 rounded-2xl border bg-white hover:border-accent transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="outline" className="text-[10px] font-bold">SaaS</Badge>
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <h3 className="font-bold text-primary mb-2 line-clamp-1 group-hover:text-accent transition-colors">Micro-SaaS Portfolio</h3>
                            <div className="text-lg font-black text-primary">$42,000</div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>Verified Revenue</span>
                                <span className="text-primary">$1,200/mo</span>
                            </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </Suspense>
  );
}
