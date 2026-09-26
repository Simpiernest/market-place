"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Briefcase,
    Users,
    TrendingUp,
    MessageSquare,
    ShieldCheck,
    PlusCircle,
    ChevronRight,
    Loader2,
    Bot,
    Zap,
    Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";

export default function BrokerDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setDashboardError(null);
      try {
        const [profileData, clientsData] = await Promise.all([
          api.get("/brokers/me"),
          api.get("/brokers/clients")
        ]);
        setProfile(profileData);
        setClients(clientsData);
      } catch (e) {
        setDashboardError("Network connectivity issues detected.");
        console.error("Failed to fetch broker dashboard data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statItems = [
    { label: "Active Clients", value: clients.filter(c => c.status === 'ACTIVE').length, icon: Users },
    { label: "Managed Assets", value: clients.filter(c => c.listing_id).length, icon: Briefcase },
    { title: "Pending Requests", value: clients.filter(c => c.status === 'PENDING').length, icon: Target },
    { label: "Avg. Commission", value: `${(profile?.commission_rate * 100).toFixed(0)}%`, icon: TrendingUp },
  ];

  if (isLoading) {
     return (
       <div className="h-full flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
       </div>
     );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary uppercase italic">Broker <span className="text-accent">Portal.</span></h1>
          <p className="text-muted-foreground font-medium">Professional intermediary suite for acquisition management.</p>
          {dashboardError && (
            <div className="mt-2 text-[10px] font-black uppercase text-accent animate-pulse tracking-widest">
              {dashboardError}
            </div>
          )}
        </div>
        <div className="flex gap-2">
            <Button
                variant="outline"
                className="font-bold border-2 rounded-xl h-12 px-6"
                onClick={() => api.post("/brokers/invite", { email: "client@businessbridge.com" }).then(() => alert("Invite sent!")).catch(() => alert("Failed to send invite"))}
            >
                Invite Client
            </Button>
            <Link href="/dashboard/seller/listings/new">
                <Button className="bg-primary text-white border-none font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:bg-accent transition-all">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Listing
                </Button>
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label || stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden h-full">
                <div className="h-1 bg-accent/20 group-hover:bg-accent transition-colors" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {stat.label || stat.title}
                    </CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all">
                    <stat.icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="text-3xl font-black text-primary italic tracking-tight">
                        {stat.label === "Avg. Commission" ? "" : <Counter value={Number(stat.value) || 0} />}
                        {stat.label === "Avg. Commission" ? stat.value : ""}
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden flex flex-col rounded-3xl">
          <CardHeader className="p-6 sm:p-8 bg-secondary/10 border-b flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-lg font-bold">Client Portfolio</CardTitle>
                <CardDescription className="text-xs">Represented sellers and active listing mandates.</CardDescription>
            </div>
            <Link href="/dashboard/broker/clients">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-accent cursor-pointer hover:bg-accent/5">View All Clients</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-secondary/30 border-b text-primary font-black uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-6 sm:px-8 py-4">Client</th>
                    <th className="px-6 sm:px-8 py-4">Listing / Mandate</th>
                    <th className="px-6 sm:px-8 py-4">Status</th>
                    <th className="px-6 sm:px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.length > 0 ? clients.map((rep, i) => (
                    <motion.tr
                        key={rep.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="hover:bg-secondary/5 transition-colors"
                    >
                        <td className="px-6 sm:px-8 py-6">
                            <div className="font-bold text-primary truncate max-w-[150px] sm:max-w-none">{rep.client_name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter whitespace-nowrap">Client Since {new Date(rep.created_at).getFullYear()}</div>
                        </td>
                        <td className="px-6 sm:px-8 py-6">
                            <div className="font-bold text-primary truncate max-w-[200px]">{rep.listing_title}</div>
                            <Badge variant="outline" className="mt-1 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{rep.role}</Badge>
                        </td>
                        <td className="px-6 sm:px-8 py-6">
                            <div className={cn(
                                "flex items-center gap-2 font-black uppercase text-[10px] tracking-widest",
                                rep.status === 'ACTIVE' ? "text-green-600" : "text-amber-600"
                            )}>
                                <div className={cn("h-1.5 w-1.5 rounded-full", rep.status === 'ACTIVE' ? "bg-green-600 animate-pulse" : "bg-amber-600")} />
                                {rep.status}
                            </div>
                        </td>
                        <td className="px-6 sm:px-8 py-6 text-right">
                          <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase h-8 px-4 border-2 rounded-xl cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap">Details</Button>
                        </td>
                    </motion.tr>
                  )) : (
                      <tr>
                          <td colSpan={4} className="p-12 text-center text-muted-foreground italic text-xs font-medium uppercase tracking-widest opacity-50 bg-secondary/5">No active representations. Invite a client to get started.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative shadow-2xl rounded-3xl">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck className="w-24 h-24 text-accent" />
                </div>
                <CardHeader className="p-8">
                    <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 italic">
                        <Zap className="h-4 w-4 text-accent animate-pulse" />
                        Broker Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="space-y-4">
                        {[
                            { label: "Verification", value: profile?.verified_broker ? "Active" : "Pending", status: "good" },
                            { label: "Deal Volume", value: "$0.00", status: "good" },
                            { label: "Market Access", value: "Global", status: "good" },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-white/50 uppercase tracking-widest">{item.label}</span>
                                <span className="font-black text-accent">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full bg-white text-primary hover:bg-accent hover:text-white border-none font-black h-11 uppercase tracking-widest text-[10px] rounded-xl transition-all cursor-pointer">
                        Complete Profile
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
                <CardHeader className="p-8 bg-secondary/10 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 italic">
                        <Bot className="h-4 w-4 text-accent" />
                        Broker AI Copilot
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                        "I've identified 3 new SaaS listings that match your clients' mandates. Would you like to generate outreach templates?"
                    </p>
                    <Button
                        variant="outline"
                        className="w-full font-black uppercase text-[10px] h-10 tracking-widest border-2 rounded-xl group overflow-hidden relative"
                        onClick={() => api.get("/brokers/clients").then(r => alert("Clients loaded: " + (r.clients?.length || 0))).catch(() => alert("Failed to load clients"))}
                    >
                        <span className="relative z-10">Generate Insights</span>
                        <motion.div
                            className="absolute inset-0 bg-accent/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"
                        />
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
