"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MessageSquare, PlusCircle, ShieldCheck, Eye, TrendingUp, Loader2, CheckCircle2, Edit3, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setStatsError(null);
      try {
        const [statsData, listingsData, verifData] = await Promise.all([
          api.get("/sellers/dashboard"),
          api.get("/sellers/listings"),
          api.get("/verification")
        ]);
        setStats(statsData);
        setListings(listingsData);
        setVerifications(verifData);
      } catch (e) {
        setStatsError("Unable to connect to backend. Some data may be unavailable.");
        console.error("Failed to fetch seller dashboard data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      alert("Failed to delete listing");
    }
  };

  if (isLoading) {
     return (
       <div className="h-full flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
       </div>
     );
  }

  const statItems = [
    { label: "Active Listings", value: stats?.active_count || 0, icon: Briefcase },
    { label: "Access Requests", value: stats?.access_requests || 0, icon: Lock },
    { label: "New Inquiries", value: stats?.inquiries || 0, icon: MessageSquare },
    { label: "Total Assets", value: stats?.listings_count || 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary uppercase italic">Seller <span className="text-accent">Portal.</span></h1>
          <p className="text-muted-foreground font-medium">Manage your listings, track buyer intent, and oversee transitions.</p>
          {statsError && (
            <div className="mt-2 text-[10px] font-black uppercase text-accent animate-pulse tracking-widest">
              {statsError}
            </div>
          )}
        </div>
        <Link href="/dashboard/seller/listings/new">
          <Button className="bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-accent/20">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Listing
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
                        <Counter value={Number(stat.value) || 0} />
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-6 sm:p-8 bg-secondary/10 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">My Portfolio</CardTitle>
            <Link href="/dashboard/seller/listings">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-accent">All Listings</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-secondary/30 border-b text-primary font-black uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-6 sm:px-8 py-4">Listing</th>
                    <th className="px-6 sm:px-8 py-4">Status</th>
                    <th className="px-6 sm:px-8 py-4">Price</th>
                    <th className="px-6 sm:px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.length > 0 ? listings.map((listing, i) => {
                    const postDate = listing.created_at ? new Date(listing.created_at) : null;
                    const dateStr = postDate && !isNaN(postDate.getTime())
                        ? formatDistanceToNow(postDate)
                        : "recently";

                    return (
                        <motion.tr
                            key={listing.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                        >
                            <td className="px-6 sm:px-8 py-6">
                            <div className="font-bold text-primary truncate max-w-[150px] sm:max-w-none">{listing.title}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                                {listing.category_name || listing.category?.name || 'SaaS'} • Posted {dateStr} ago
                            </div>
                            </td>
                            <td className="px-6 sm:px-8 py-6">
                            <div className="flex items-center gap-2 text-green-600 font-black uppercase text-[10px] tracking-widest">
                                <div className={cn("h-1.5 w-1.5 rounded-full", listing.status === 'ACTIVE' ? "bg-green-600 animate-pulse" : "bg-muted")} />
                                {listing.status}
                            </div>
                            </td>
                            <td className="px-6 sm:px-8 py-6 font-black text-primary italic whitespace-nowrap">
                                ${listing.asking_price ? Number(listing.asking_price).toLocaleString() : "0"}
                            </td>
                        <td className="px-6 sm:px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/businesses/${listing.slug}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary cursor-pointer" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/seller/listings/${listing.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-accent cursor-pointer" title="Edit Listing">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Delete Listing"
                              onClick={() => handleDelete(listing.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                    </motion.tr>
                    )
                  }) : (
                      <tr>
                          <td colSpan={4} className="p-12 text-center text-muted-foreground italic text-xs font-medium uppercase tracking-widest opacity-50 bg-secondary/5">No listings yet. Create your first listing to get started.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-none shadow-sm overflow-hidden flex flex-col rounded-3xl">
          <CardHeader className="p-6 sm:p-8 bg-secondary/10 border-b">
            <CardTitle className="text-lg font-bold">Acquisition Readiness</CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            {[
              { label: "Identity Verified", cat: "IDENTITY", icon: ShieldCheck },
              { label: "Ownership Proof", cat: "ASSET_OWNERSHIP", icon: Briefcase },
              { label: "Revenue Audit", cat: "FINANCIAL", icon: TrendingUp },
            ].map((item, i) => {
              const v = verifications.find(v => v.category === item.cat);
              const status = v?.status || 'NOT_STARTED';

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      status === 'VERIFIED' ? "bg-green-500/10 text-green-600" :
                      status === 'UNDER_REVIEW' || status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-600" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                       <div className="text-sm font-bold text-primary">{item.label}</div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{status.replace('_', ' ')}</div>
                    </div>
                  </div>
                  {status === 'VERIFIED' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </motion.div>
              );
            })}

            <div className="pt-4 mt-auto">
              <Link href="/dashboard/seller/verification" className="block w-full">
                <Button className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-primary/10 hover:bg-accent transition-all cursor-pointer">
                    Resume Verification Flow
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
