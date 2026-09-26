"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [statsData, listingsData] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/listings/pending")
        ]);
        setStats(statsData);
        setPendingListings(listingsData);
      } catch (e) {
        console.error("Failed to fetch admin data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/admin/listings/${id}/approve`, {});
      setPendingListings(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      alert("Failed to approve listing");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this listing?")) return;
    setProcessingId(id);
    try {
      await api.post(`/admin/listings/${id}/reject`, {});
      setPendingListings(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      alert("Failed to reject listing");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const statItems = stats ? [
    { label: "Total Users", value: stats.total_users.toLocaleString(), icon: Users, trend: "+12%" },
    { label: "Active Listings", value: stats.active_listings.toLocaleString(), icon: Briefcase, trend: "+8%" },
    { label: "Total GMV", value: `$${(stats.total_gmv / 1000000).toFixed(1)}M`, icon: TrendingUp, trend: "+24%" },
    { label: "Pending Review", value: stats.pending_review.toString(), icon: AlertCircle, trend: "-5%" },
  ] : [];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary uppercase italic">System <span className="text-accent">Control.</span></h1>
          <p className="text-muted-foreground font-medium">Global platform oversight and operational intelligence.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="font-bold h-11 px-6 rounded-xl cursor-pointer" onClick={() => alert("Accessing system logs...")}>View System Logs</Button>
           <Button
             onClick={handleRefresh}
             className="bg-primary text-white border-none font-black uppercase tracking-widest h-11 px-8 rounded-xl shadow-lg shadow-primary/10 cursor-pointer active:scale-95"
           >
              Refresh Data
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                    {stat.label === "Total GMV" ? "$" : ""}
                    <Counter value={stat.label === "Total GMV" ? (stats.total_gmv / 1000000) : Number(stat.value.replace(/[^0-9.-]+/g,""))} />
                    {stat.label === "Total GMV" ? "M" : ""}
                </div>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend} <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Performance Chart Placeholder */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col">
           <CardHeader className="p-8 bg-secondary/10 border-b">
              <div className="flex items-center justify-between">
                 <div>
                    <CardTitle className="text-lg font-bold">Marketplace Volume</CardTitle>
                    <CardDescription className="text-xs">Aggregate transaction value across all sectors.</CardDescription>
                 </div>
                 <select className="bg-white border-2 border-secondary rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest outline-none">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                 </select>
              </div>
           </CardHeader>
           <CardContent className="p-8 flex-1 flex flex-col justify-end min-h-[300px]">
              <div className="flex items-end justify-between gap-2 h-48">
                 {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 60, 100].map((h, i) => (
                   <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="flex-1 bg-accent/10 rounded-t-lg relative group transition-all hover:bg-accent hover:shadow-lg hover:shadow-accent/20"
                   >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white px-2 py-1 rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         ${(h * 1.2).toFixed(1)}M
                      </div>
                   </motion.div>
                 ))}
              </div>
              <div className="flex justify-between mt-6 text-[8px] font-black uppercase tracking-widest text-muted-foreground px-1">
                 <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
              </div>
           </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-none shadow-sm overflow-hidden">
             <CardHeader className="p-8 bg-secondary/10 border-b flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold">Moderation Queue</CardTitle>
               <Link href="/admin/listings">
                 <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-accent cursor-pointer hover:bg-accent/5">View All</Button>
               </Link>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y max-h-[400px] overflow-y-auto">
                 {pendingListings.length > 0 ? pendingListings.map((listing, i) => (
                   <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-secondary/5 transition-colors group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-black text-primary">
                         {listing.title[0]}
                       </div>
                       <div>
                         <div className="font-bold text-sm text-primary group-hover:text-accent truncate max-w-[150px]">{listing.title}</div>
                         <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">${listing.asking_price.toLocaleString()}</div>
                       </div>
                     </div>
                     <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(listing.id)}
                          disabled={processingId === listing.id}
                          className="h-8 bg-green-500 hover:bg-green-600 text-white font-black uppercase text-[8px] px-3 rounded-lg border-none cursor-pointer transition-all active:scale-90"
                        >
                            {processingId === listing.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                        </Button>
                        <Button
                          onClick={() => handleReject(listing.id)}
                          disabled={processingId === listing.id}
                          variant="ghost"
                          className="h-8 font-black uppercase text-[8px] px-3 text-destructive hover:bg-destructive/5 rounded-lg cursor-pointer"
                        >Reject</Button>
                     </div>
                   </motion.div>
                 )) : (
                   <div className="p-12 text-center text-muted-foreground italic text-xs">No pending listings</div>
                 )}
               </div>
             </CardContent>
           </Card>

           <Card className="bg-primary text-white border-none overflow-hidden relative shadow-2xl rounded-3xl">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <ShieldCheck className="w-24 h-24 text-accent" />
              </div>
              <CardHeader className="p-8">
                 <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 italic">
                    <Zap className="h-4 w-4 text-accent animate-pulse" />
                    System Health
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <div className="space-y-4">
                    {[
                      { label: "API Latency", value: "42ms", status: "good" },
                      { label: "Auth Up-time", value: "99.98%", status: "good" },
                      { label: "escrow Safety", value: "Active", status: "good" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center text-[10px]">
                         <span className="font-bold text-white/50 uppercase tracking-widest">{item.label}</span>
                         <span className="font-black text-accent">{item.value}</span>
                      </div>
                    ))}
                 </div>
                 <Button
                   onClick={() => alert("Loading infrastructure health monitor...")}
                   className="w-full bg-white text-primary hover:bg-accent hover:text-white border-none font-black h-11 uppercase tracking-widest text-[10px] rounded-xl transition-all cursor-pointer"
                 >
                    Status Dashboard
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
