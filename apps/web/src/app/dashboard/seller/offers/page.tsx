"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle2, XCircle, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function SellerOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      setIsLoading(true);
      try {
        const data = await api.get("/offers/inbound");
        setOffers(data);
      } catch (e) {
        console.error("Failed to fetch offers");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const handleStatusUpdate = async (offerId: string, status: string) => {
    try {
        await api.patch(`/offers/${offerId}`, { status });
        setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o));
        alert(`Offer ${status.toLowerCase()} successfully.`);
    } catch (e) {
        alert("Failed to update offer status.");
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
        <h1 className="text-3xl font-black text-primary uppercase italic">Inbound <span className="text-accent">Offers.</span></h1>
        <p className="text-muted-foreground font-medium">Review and manage binding offers for your active listings.</p>
      </div>

      {offers.length === 0 ? (
        <Card className="border-none shadow-sm py-20 text-center rounded-[2.5rem]">
           <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
           <h3 className="font-bold text-primary italic uppercase">No offers yet</h3>
           <p className="text-xs text-muted-foreground max-w-xs mx-auto">Offers from verified buyers will appear here once they complete discovery.</p>
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
                                 offer.status === 'ACCEPTED' ? "bg-green-50 text-green-600 border-green-200" :
                                 offer.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-200" :
                                 "bg-blue-50 text-blue-600 border-blue-200"
                               )}>{offer.status}</Badge>
                               <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Received {new Date(offer.created_at).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                         <div className="text-3xl font-black text-primary italic">${offer.amount.toLocaleString()}</div>
                         <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Full Acquisition Amount</div>
                      </div>

                      <div className="flex gap-2">
                         {offer.status === 'PENDING' && (
                           <>
                              <Button
                                onClick={() => handleStatusUpdate(offer.id, 'ACCEPTED')}
                                className="bg-green-500 hover:bg-green-600 text-white font-black uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl"
                              >Accept</Button>
                              <Button
                                onClick={() => handleStatusUpdate(offer.id, 'REJECTED')}
                                variant="outline"
                                className="border-2 font-black uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl text-destructive hover:bg-destructive/5"
                              >Reject</Button>
                           </>
                         )}
                         <Link href={`/dashboard/deals/${offer.id}`}>
                            <Button variant="ghost" className="font-black uppercase text-[10px] h-11 px-4">View Deal Room</Button>
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
