"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Edit3,
  Trash2,
  ArrowLeft,
  ChevronRight,
  BarChart3,
  Users,
  Lock,
  FileText,
  Loader2,
  Archive
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";

export default function SellerListingDetailPage() {
  const { id } = useParams() as { id: string };
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      setIsLoading(true);
      try {
        const data = await api.get(`/listings/${id}`);
        setListing(data);
      } catch (e) {
        console.error("Failed to fetch listing detail");
      } finally {
        setIsLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  if (!listing) return <div className="p-12 text-center font-bold">Listing not found</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/seller/listings">
               <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
               </Button>
            </Link>
            <div>
               <h1 className="text-3xl font-black text-primary uppercase italic">{listing.title}</h1>
               <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-green-500 text-white border-none uppercase text-[8px] font-black tracking-widest">Active</Badge>
                  <span className="text-xs text-muted-foreground font-medium">Listing ID: {id.slice(0, 8)}</span>
                </div>
            </div>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" className="font-bold">
               <Edit3 className="w-4 h-4 mr-2" />
               Edit Listing
            </Button>
            <Button variant="outline" className="font-bold text-destructive hover:bg-destructive/5">
               <Archive className="w-4 h-4 mr-2" />
               Archive
            </Button>
         </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Views", value: listing.view_count || 0, icon: Eye },
           { label: "Active Inquiries", value: listing.inquiries_count || 0, icon: MessageSquare },
           { label: "Saves", value: listing.save_count || 0, icon: TrendingUp },
           { label: "Click Rate", value: "2.4%", icon: BarChart3 },
         ].map(item => (
           <Card key={item.label} className="border-none shadow-sm">
              <CardContent className="pt-6">
                 <div className="flex items-center gap-3 mb-2">
                    <item.icon className="h-4 w-4 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                 </div>
                 <div className="text-3xl font-black text-primary">{item.value}</div>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2 space-y-6">
            <Card>
               <CardHeader className="border-b bg-secondary/10 flex flex-row items-center justify-between">
                  <div>
                     <CardTitle className="text-lg font-bold">Verification Health</CardTitle>
                     <CardDescription className="text-xs">Your listing's vetting status across domains.</CardDescription>
                  </div>
                  <Link href="/dashboard/seller/verification">
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-accent">View Report</Button>
                  </Link>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                  {[
                    { label: "Identity Verified", status: "complete" },
                    { label: "Ownership Proof", status: "complete" },
                    { label: "Financial Consistency", status: "pending" },
                    { label: "Traffic Audit", status: "not_started" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center",
                            item.status === 'complete' ? "bg-green-500/10 text-green-600" : "bg-secondary text-muted-foreground"
                          )}>
                             <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-bold text-primary">{item.label}</span>
                       </div>
                       <Badge variant="outline" className={cn(
                         "text-[8px] uppercase font-black tracking-widest",
                         item.status === 'complete' ? "border-green-500/20 text-green-600" : "text-muted-foreground"
                       )}>{item.status.replace('_', ' ')}</Badge>
                    </div>
                  ))}
               </CardContent>
            </Card>

            <Card>
               <CardHeader className="border-b bg-secondary/10 flex flex-row items-center justify-between">
                  <div>
                     <CardTitle className="text-lg font-bold">Recent Inquiries</CardTitle>
                     <CardDescription className="text-xs">High-intent buyers who reached out.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-accent">All Messages</Button>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/5 cursor-pointer group transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black text-primary">A{i}</div>
                             <div>
                                <div className="text-sm font-bold text-primary group-hover:text-accent">Alice Smith</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Vetted Institutional Buyer</div>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Lock className="w-20 h-20" />
               </div>
               <CardHeader>
                  <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                     <FileText className="w-5 h-5 text-accent" />
                     Data Room
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <p className="text-xs text-primary-foreground/70 leading-relaxed font-medium">Manage your sensitive documents and grant permission to verified buyers.</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                        <div className="text-2xl font-black">12</div>
                        <div className="text-[8px] uppercase font-bold text-primary-foreground/40">Documents</div>
                     </div>
                     <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                        <div className="text-2xl font-black">4</div>
                        <div className="text-[8px] uppercase font-bold text-primary-foreground/40">Access Grants</div>
                     </div>
                  </div>
                  <Link href={`/dashboard/seller/listings/${id}/data-room`} className="block">
                     <Button className="w-full bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest h-11">
                        Manage Data Room
                     </Button>
                  </Link>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
