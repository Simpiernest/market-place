"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, DollarSign, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function BuyerOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      setIsLoading(true);
      try {
        const data = await api.get("/offers/my-offers");
        setOffers(data);
      } catch (e) {
        console.error("Failed to fetch offers");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffers();
  }, []);

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
        <h1 className="text-3xl font-black text-primary uppercase italic">Sent <span className="text-accent">Offers.</span></h1>
        <p className="text-muted-foreground font-medium">Monitor your active bids and transaction progression.</p>
      </div>

      {offers.length === 0 ? (
        <Card className="border-none shadow-sm py-20 text-center rounded-[2.5rem]">
           <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
           <h3 className="font-bold text-primary italic uppercase">No active offers</h3>
           <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-8">Submit your first binding offer to a seller to begin the acquisition process.</p>
           <Link href="/marketplace">
              <Button className="bg-primary text-white border-none font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:bg-accent transition-all">
                 Find a Business
              </Button>
           </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
           {offers.map((offer) => (
             <Card key={offer.id} className="border-none shadow-sm overflow-hidden rounded-3xl group hover:shadow-xl transition-all">
                <CardContent className="p-8">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all">
                            <DollarSign className="h-7 w-7" />
                         </div>
                         <div>
                            <h3 className="font-black text-xl text-primary italic uppercase">{offer.listing_title || "Digital Asset"}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <Badge variant="outline" className={cn(
                                 "text-[8px] font-black uppercase tracking-widest",
                                 offer.status === 'ACCEPTED' ? "bg-green-500 text-green-600 border-green-200" :
                                 offer.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-200" :
                                 "bg-blue-50 text-blue-600 border-blue-200"
                               )}>{offer.status}</Badge>
                               <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Sent {new Date(offer.created_at).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                         <div className="text-3xl font-black text-primary italic">${offer.amount.toLocaleString()}</div>
                         <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Offered Commitment</div>
                      </div>

                      <div className="flex gap-4 items-center">
                         {offer.status === 'ACCEPTED' && (
                             <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 animate-in fade-in zoom-in">
                                 <ShieldCheck className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase">Escrow Ready</span>
                             </div>
                         )}
                         <Link href={`/dashboard/deals/${offer.id}`}>
                            <Button className="bg-primary text-white border-none font-black uppercase text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/10">Go to Deal Room <ArrowRight className="ml-2 w-4 h-4" /></Button>
                         </Link>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}
