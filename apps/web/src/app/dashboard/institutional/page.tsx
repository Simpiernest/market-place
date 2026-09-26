"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  PieChart,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Plus,
  Filter,
  History,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";

export default function InstitutionalPortalPage() {
  const [activeView, setActiveTab] = useState("portfolio");
  const [stats, setStats] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [statsData, dealsData] = await Promise.all([
                api.get("/organizations/me/stats"),
                api.get("/deals")
            ]);
            setStats(statsData);
            setDeals(dealsData);
        } catch (e) {
            console.error("Institutional data fetch failed");
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Institutional Portal</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Firm: Village Capital Partners • Asset Class: Digital Assets</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Manage Team
          </Button>
          <Button className="bg-accent hover:bg-accent/90 border-none text-white px-8">
            <Plus className="w-4 h-4 mr-2" />
            Create Search Mandate
          </Button>
        </div>
      </div>

      {/* Institutional Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total AUM", value: `$${((stats?.aum || 0) / 1000000).toFixed(1)}M`, trend: "+8.4%", icon: PieChart },
          { label: "Active Deals", value: stats?.active_deals || 0, trend: "Steady", icon: Briefcase },
          { label: "Team Members", value: stats?.team_size || 0, trend: "+2", icon: Users },
          { label: "Global Markets", value: stats?.markets || 0, trend: "+1", icon: Globe },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-green-600">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Deal Pipeline Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-secondary/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Deal Pipeline</CardTitle>
                <CardDescription className="text-xs">Real-time status of current acquisitions across your team.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                <Filter className="w-3 h-3 mr-2" />
                Filter Pipeline
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/20 border-b text-primary font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Listing</th>
                      <th className="px-6 py-4 text-left">Owner</th>
                      <th className="px-6 py-4 text-left">Stage</th>
                      <th className="px-6 py-4 text-left">Value</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deals.length > 0 ? deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-secondary/5 transition-colors group">
                        <td className="px-6 py-5 font-bold text-primary italic uppercase">{deal.listing_title}</td>
                        <td className="px-6 py-5 text-muted-foreground uppercase text-[10px] font-black">{deal.buyer_name}</td>
                        <td className="px-6 py-5">
                          <Badge variant="outline" className={cn("text-[10px] font-black uppercase")}>
                            {deal.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 font-bold">${Number(deal.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-5 text-right">
                          <Link href={`/dashboard/deals/${deal.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-muted-foreground italic text-xs uppercase tracking-widest opacity-30">No deals in pipeline</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Compliance & Market Panel */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-primary-foreground/60">KYB Verification</span>
                  <span className="text-accent">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-primary-foreground/60">Tax ID (GHS)</span>
                  <span className="text-accent">Active</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/40">Market Activity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>West African SaaS</span>
                    <span className="font-bold text-green-400">+12% Vol.</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>US Content Sites</span>
                    <span className="font-bold text-amber-400">-2.4% Vol.</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold h-10 shadow-lg">
                View Risk Portfolio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { user: "Sarah J.", action: "Updated DD for SaaS Automate", time: "10m ago" },
                { user: "Michael R.", action: "Requested Payout #TRX-11", time: "1h ago" },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[11px] border-b pb-3 last:border-0 last:pb-0">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <History className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="font-bold text-primary">{log.user}</span>
                    <p className="text-muted-foreground mt-0.5">{log.action}</p>
                    <span className="text-[9px] text-muted-foreground/60 block mt-1">{log.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
