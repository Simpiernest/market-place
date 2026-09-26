"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  BarChart3,
  Bot
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function AdminTrustCenterPage() {
  const [summary, setSummary] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings"); // listings, verifications, activity

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await api.get("/admin-trust/summary");
        setSummary(data);
      } catch (e) {
        console.error("Failed to fetch summary");
      }
    }
    fetchSummary();
  }, []);

  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      try {
        let endpoint = '';
        if (activeTab === 'listings') endpoint = '/admin-trust/listings';
        else if (activeTab === 'verifications') endpoint = '/admin-trust/verifications';
        else endpoint = '/admin-trust/audit-logs';

        const data = await api.get(endpoint);
        setItems(data);
      } catch (e) {
        console.error("Failed to fetch items");
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, [activeTab]);

  if (!summary) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Admin <span className="text-accent">Trust Center.</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Platform-wide vetting, moderation, and risk management.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
           <Bot className="w-4 h-4 text-accent" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">AI Fraud Sentinel Active</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending Listings", value: summary.pending_listings, icon: FileText, color: "text-accent" },
          { label: "User Audits", value: summary.pending_verifications, icon: UserCheck, color: "text-blue-500" },
          { label: "Open Disputes", value: summary.open_disputes, icon: AlertTriangle, color: "text-red-500" },
          { label: "Risk Score", value: "8/100", icon: ShieldCheck, color: "text-green-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-xl transition-all rounded-3xl overflow-hidden group">
            <div className={cn("h-1 bg-secondary group-hover:bg-accent transition-colors", stat.color.replace('text-', 'bg-'))} />
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex justify-between items-end">
               <div className="text-4xl font-black text-primary italic">{stat.value}</div>
               <stat.icon className={cn("w-8 h-8 opacity-10", stat.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex gap-1 bg-secondary/20 p-1 rounded-2xl w-fit border">
              {[
                { id: "listings", label: "Listing Vetting" },
                { id: "verifications", label: "User Verification" },
                { id: "activity", label: "Global Activity" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id ? "bg-white text-primary shadow-lg" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
           </div>

           <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-0">
                {isLoading ? (
                    <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" /></div>
                ) : (
                    <div className="divide-y">
                        {items.length > 0 ? items.map((item, i) => (
                            <div key={item.id} className="p-8 flex items-center justify-between group hover:bg-slate-50 transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black text-xl italic shadow-inner">
                                        {activeTab === 'listings' ? 'L' : activeTab === 'verifications' ? 'U' : 'A'}
                                    </div>
                                        <h3 className="font-black text-lg text-primary uppercase italic group-hover:text-accent transition-colors">
                                            {activeTab === 'listings' ? item.title : activeTab === 'verifications' ? item.user_name : `${item.actor_type}: ${item.action}`}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(item.submitted_at || item.timestamp))} ago</span>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter">
                                                {item.status || item.category || item.resource_type}
                                            </Badge>
                                            {activeTab === 'activity' && item.user_id && (
                                                <span className="opacity-40 italic">User: {item.user_id?.split('-')[0]}</span>
                                            )}
                                        </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl group-hover:bg-white group-hover:shadow-lg transition-all"><ChevronRight className="w-5 h-5" /></Button>
                            </div>
                        )) : (
                            <div className="py-20 text-center space-y-4 opacity-30">
                                <CheckCircle2 className="w-12 h-12 mx-auto" />
                                <p className="text-xs font-black uppercase tracking-widest">Queue Clear</p>
                            </div>
                        )}
                    </div>
                )}
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-6">
           <Card className="bg-primary text-white border-none shadow-2xl rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8">
                 <CardTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-accent" /> Risk signals
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                 {[
                   { label: "Unlock Spikes", value: 0, status: "Normal" },
                   { label: "IP Anomalies", value: 2, status: "Reviewing" },
                   { label: "Payment Failures", value: 1, status: "Investigating" },
                 ].map((signal) => (
                    <div key={signal.label} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-white/40">{signal.label}</span>
                          <span className={cn(signal.value > 0 ? "text-accent" : "text-green-400")}>{signal.status}</span>
                       </div>
                       <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className={cn("h-full", signal.value > 0 ? "bg-accent w-1/3" : "bg-green-500 w-full")} />
                       </div>
                    </div>
                 ))}

                 <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl transition-all">
                    Full System Audit
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-secondary/10 p-8 border-b">
                 <CardTitle className="text-sm font-bold uppercase italic">Vetting Manual</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">"Always verify DNS ownership records against WHOIS history for micro-cap assets under $50k."</p>
                 <Button variant="link" className="p-0 text-accent font-black uppercase text-[10px] h-auto">Open Compliance Guide</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
