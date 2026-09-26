"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Search, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { motion } from "framer-motion";

export default function BuyerSavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchSaved() {
    setIsLoading(true);
    try {
      const data = await api.get("/buyers/saved-listings");
      setSaved(data.items || []);
    } catch (e) {
      console.error("Failed to fetch saved listings");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id: string) => {
    try {
        await api.delete(`/buyers/saved-listings/${id}`);
        setSaved(prev => prev.filter(l => l.id !== id));
    } catch (e) {
        alert("Failed to remove from saved list");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-primary uppercase italic">My <span className="text-accent">Watchlist.</span></h1>
        <p className="text-muted-foreground font-medium">Track your top acquisition targets and monitor their status.</p>
      </div>

      {saved.length === 0 ? (
        <Card className="border-none shadow-sm py-20 text-center rounded-[2.5rem]">
           <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
           <h3 className="font-bold text-primary italic uppercase">Nothing saved yet</h3>
           <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-8">Browse the marketplace to find businesses that match your investment mandate.</p>
           <Link href="/marketplace">
              <Button className="bg-primary text-white border-none font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:bg-accent transition-all">
                 <Search className="w-4 h-4 mr-2" />
                 Explore Marketplace
              </Button>
           </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {saved.map((listing, i) => (
             <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
             >
                <Card className="border-none shadow-sm overflow-hidden group hover:shadow-xl transition-all rounded-3xl h-full flex flex-col">
                   <div className="h-40 bg-muted relative">
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white/20 font-black uppercase tracking-widest text-2xl group-hover:scale-105 transition-transform">
                         {listing.category?.name || "SaaS"}
                      </div>
                      <div className="absolute top-4 right-4">
                         <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleRemove(listing.id)}>
                            <Trash2 className="h-4 h-4" />
                         </Button>
                      </div>
                   </div>
                   <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-primary text-lg leading-tight mb-2 uppercase italic">{listing.title}</h3>
                      <div className="text-sm font-black text-accent mb-4">${listing.asking_price?.toLocaleString()}</div>

                      <div className="mt-auto">
                        <Link href={`/businesses/${listing.slug || listing.id}`}>
                            <Button variant="outline" className="w-full h-10 border-2 font-black uppercase text-[10px] tracking-widest group-hover:bg-accent group-hover:text-white transition-all">
                                Analyze Deal <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                      </div>
                   </CardContent>
                </Card>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
}
