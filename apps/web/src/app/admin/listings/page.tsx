"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ExternalLink, ShieldCheck, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function AdminListingsPage() {
  const [activeTab, setActiveTab] = useState("PENDING_REVIEW");
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        // Fetching all for simplicity, filtering on frontend for V1
        // In prod, use status specific endpoints
        const data = await api.get("/marketplace?size=100");
        setListings(data.items);
      } catch (e) {
        console.error("Failed to fetch admin listings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
        await api.post(`/admin/listings/${id}/${action}`, {});
        setListings(prev => prev.map(l => l.id === id ? { ...l, status: action === 'approve' ? 'ACTIVE' : 'REJECTED' } : l));
    } catch (e) {
        alert(`Failed to ${action} listing`);
    }
  };

  const filteredListings = listings.filter(l => l.status === activeTab);

  if (isLoading) {
    return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Listing <span className="text-accent">Moderation.</span></h1>
          <p className="text-muted-foreground font-medium">Verify assets, financial claims, and approve listings for publication.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-secondary/20 p-1 rounded-xl w-fit border">
        {["PENDING_REVIEW", "ACTIVE", "REJECTED", "SOLD"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              activeTab === tab ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
         {filteredListings.map(listing => (
           <Card key={listing.id} className="border-none shadow-sm group hover:shadow-xl transition-all overflow-hidden rounded-3xl">
              <CardContent className="p-0 flex flex-col md:flex-row items-center">
                 <div className="p-8 flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Listing ID: {listing.id.slice(0, 8)}</div>
                       <h3 className="text-lg font-black text-primary group-hover:text-accent transition-colors uppercase italic">{listing.title}</h3>
                       <div className="text-xs font-medium text-muted-foreground">Seller: <span className="font-bold text-primary">{listing.seller_id.slice(0, 8)}</span></div>
                    </div>

                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Financials</div>
                       <div className="text-sm font-black text-primary">${listing.asking_price.toLocaleString()} Asking</div>
                       <div className="text-[10px] font-bold text-accent italic">{listing.category_id ? 'SaaS' : 'General'} Category</div>
                    </div>

                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Submitted</div>
                       <div className="flex items-center gap-2 text-sm font-bold text-primary">
                          <Clock className="h-4 w-4 text-amber-500" />
                          {formatDistanceToNow(new Date(listing.created_at))} ago
                       </div>
                    </div>

                    <div className="flex justify-end gap-2">
                       {listing.status === 'PENDING_REVIEW' && (
                         <>
                           <Button
                             onClick={() => handleAction(listing.id, 'approve')}
                             size="sm"
                             className="bg-green-600 hover:bg-green-700 text-white border-none font-black uppercase text-[8px] tracking-widest px-4 h-9 rounded-lg cursor-pointer transition-all active:scale-90"
                           >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                              Approve
                           </Button>
                           <Button
                             onClick={() => handleAction(listing.id, 'reject')}
                             size="sm"
                             variant="ghost"
                             className="text-destructive hover:bg-destructive/5 font-black uppercase text-[8px] tracking-widest px-4 h-9 rounded-lg cursor-pointer"
                           >
                              <XCircle className="w-3.5 h-3.5 mr-2" />
                              Reject
                           </Button>
                         </>
                       )}
                       <Link href={`/businesses/${listing.slug}`}>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2 hover:bg-secondary transition-all cursor-pointer">
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                       </Link>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}

         {filteredListings.length === 0 && (
           <div className="h-64 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center p-12 text-muted-foreground bg-slate-50/50">
              <ShieldCheck className="w-12 h-12 mb-4 opacity-10" />
              <p className="font-black uppercase tracking-widest text-[10px]">No listings in {activeTab.replace('_', ' ')} queue.</p>
           </div>
         )}
      </div>
    </div>
  );
}
