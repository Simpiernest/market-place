"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ShieldCheck, MessageSquare, Star, Clock, Globe, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

export default function SellerProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;

  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        // 'id' here is expected to be a UUID in the URL or a slug we resolve
        const data = await api.get(`/sellers/${id}/profile`);
        setSeller(data);
      } catch (e: any) {
        setError(e.message || "Failed to load seller profile");
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

  if (error || !seller) {
    return (
      <div className="container py-24 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase italic">Seller Not Found.</h1>
        <p className="text-muted-foreground">The profile you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-12">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-80 shrink-0 space-y-6">
           <div className="p-8 rounded-3xl bg-secondary/30 text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-3xl bg-white flex items-center justify-center text-4xl font-black text-primary italic shadow-lg">
                {seller.full_name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase italic text-primary leading-tight">{seller.full_name}.</h1>
                <div className="flex items-center justify-center gap-1 mt-2 text-accent">
                   <Star className="w-4 h-4 fill-current" />
                   <span className="text-sm font-black">{seller.rating}</span>
                   <span className="text-xs text-muted-foreground font-bold ml-1">({seller.sales_count} Sales)</span>
                </div>
              </div>
              <Button className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest h-11 rounded-xl cursor-pointer active:scale-95 transition-all">
                 <MessageSquare className="w-4 h-4 mr-2" />
                 Message Seller
              </Button>
           </div>

           <div className="p-6 rounded-3xl border space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seller Stats</h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-muted-foreground">Verified Since</span>
                    <span className="font-black text-primary">{seller.joined_year}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-muted-foreground">Avg. Response</span>
                    <span className="font-black text-primary">&lt; 2 hours</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 space-y-12">
           <section className="space-y-6">
              <h2 className="text-2xl font-black uppercase italic text-primary">About the Seller.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium italic">{seller.bio || "No bio provided."}</p>
           </section>

           <section className="space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black uppercase italic text-primary">Active Listings.</h2>
                 <Badge variant="secondary" className="font-black text-[10px] uppercase">{seller.listings.length} Active</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                 {seller.listings.length > 0 ? seller.listings.map((listing: any) => (
                   <ListingCard key={listing.id} {...listing} />
                 )) : (
                    <p className="text-muted-foreground italic text-sm">No active listings at the moment.</p>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
