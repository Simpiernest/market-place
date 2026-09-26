"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";

export default function SellerListingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        const data = await api.get("/sellers/listings");
        setListings(data);
      } catch (e) {
        console.error("Failed to fetch listings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, []);

  const tabs = [
    { label: "All", id: "all", count: listings.length },
    { label: "Active", id: "ACTIVE", count: listings.filter(l => l.status === 'ACTIVE').length },
    { label: "Drafts", id: "DRAFT", count: listings.filter(l => l.status === 'DRAFT').length },
    { label: "Pending", id: "PENDING_REVIEW", count: listings.filter(l => l.status === 'PENDING_REVIEW').length },
    { label: "Sold", id: "SOLD", count: listings.filter(l => l.status === 'SOLD').length },
  ];

  if (isLoading) {
    return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">My <span className="text-accent">Listings.</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Manage and track your business listings in real-time.</p>
        </div>
        <Link href="/dashboard/seller/listings/new">
          <Button className="bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest px-8">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </Link>
      </div>

      <div className="flex gap-1 bg-secondary/20 p-1 rounded-xl w-fit border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            {tab.label} <span className="ml-1 opacity-40">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {listings.filter(l => activeTab === 'all' || l.status === activeTab).map((listing) => (
          <Card key={listing.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group">
            <CardContent className="p-0">
               <div className="flex flex-col md:flex-row items-center">
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "w-full md:w-2 h-2 md:h-auto self-stretch shrink-0",
                    listing.status === 'ACTIVE' ? "bg-green-500" :
                    listing.status === 'PENDING_REVIEW' ? "bg-amber-500" : "bg-muted"
                  )} />

                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <h3 className="text-lg font-black text-primary group-hover:text-accent transition-colors uppercase italic">{listing.title}</h3>
                           <Badge variant="outline" className={cn(
                             "text-[10px] font-black uppercase tracking-widest",
                             listing.status === 'ACTIVE' ? "border-green-500/20 text-green-600 bg-green-50" :
                             listing.status === 'PENDING_REVIEW' ? "border-amber-500/20 text-amber-600 bg-amber-50" :
                             "border-secondary text-muted-foreground"
                           )}>
                              {listing.status.replace('_', ' ')}
                           </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                           <span>${listing.asking_price.toLocaleString()}</span>
                           <span>Updated {formatDistanceToNow(new Date(listing.updated_at))} ago</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-8 md:px-8 md:border-x">
                        <div className="text-center">
                           <div className="text-xl font-black text-primary">{listing.views || 0}</div>
                           <div className="text-[8px] font-black uppercase text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                           <div className="text-xl font-black text-primary">{listing.saves || 0}</div>
                           <div className="text-[8px] font-black uppercase text-muted-foreground">Saves</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <Link href={`/dashboard/seller/listings/${listing.id}`}>
                           <Button variant="outline" size="sm" className="font-bold h-9 rounded-xl border-2 hover:bg-primary hover:text-white transition-all cursor-pointer">Manage</Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
        {listings.length === 0 && (
           <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-secondary/5">
              <p className="text-sm text-muted-foreground font-medium italic uppercase tracking-widest">No listings found in this category.</p>
           </div>
        )}
      </div>
    </div>
  );
}
