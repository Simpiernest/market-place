"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  MessageSquare,
  Users,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const [statsData, insightsData] = await Promise.all([
            api.get("/sellers/dashboard"),
            api.get("/sellers/insights")
        ]);
        setStats(statsData);
        setInsights(insightsData);
      } catch (e) {
        console.error("Failed to fetch analytics");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

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
          <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">Analytics <span className="text-accent">Intel.</span></h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time marketplace metrics and acquisition patterns.</p>
        </div>
        <Button className="bg-primary text-white border-none font-black uppercase text-[10px] tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:bg-accent transition-all">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Audit Report
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Listing Views", value: stats?.views || 0, trend: "+14.2%", icon: Eye },
          { label: "Buyer Inquiries", value: stats?.inquiries || 0, trend: "+5.1%", icon: MessageSquare },
          { label: "Market Interest", value: "High", trend: "Stable", icon: TrendingUp },
          { label: "Avg. Session", value: "3m 42s", trend: "+12s", icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm group hover:shadow-xl transition-all rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary italic">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600 text-[10px] font-black uppercase">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-accent/20 bg-accent/[0.02] rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="bg-accent/5 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-primary uppercase italic">AI Growth Insights</CardTitle>
                    <CardDescription className="text-[8px] font-bold uppercase tracking-widest text-accent">Intelligent Opportunity Scan</CardDescription>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-4">
                {(insights?.insights || []).map((ins: any, i: number) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-accent/10 flex gap-4 hover:shadow-md transition-all">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                            ins.type === 'OPPORTUNITY' ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"
                        )}>
                            {ins.type === 'OPPORTUNITY' ? <TrendingUp className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-primary text-sm flex items-center gap-2 uppercase">
                                {ins.title}
                                {ins.type === 'OPPORTUNITY' && <Badge className="bg-green-100 text-green-700 border-none text-[8px] font-black uppercase">High Impact</Badge>}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium italic">
                                "{ins.narrative}"
                            </p>
                        </div>
                    </div>
                ))}
                {(!insights?.insights || insights.insights.length === 0) && (
                    <div className="text-center py-10 opacity-30">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase">Collecting Portfolio Data...</p>
                    </div>
                )}
              </div>

              <div className="pt-6 border-t border-accent/10 flex items-center justify-between">
                <Button variant="ghost" className="text-[10px] text-accent font-black uppercase tracking-widest hover:bg-accent/5 rounded-xl px-6">Apply Recommendations</Button>
                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground italic tracking-tighter"><ShieldCheck className="w-3 h-3 text-accent" /> Institutional Privacy Preserved</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-2xl relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Users className="w-24 h-24" />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-widest italic">Buyer Sentiments</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-primary-foreground/50 uppercase font-black tracking-widest">Global Intent Score</span>
                  <span className="font-black text-accent text-2xl">{insights?.intent_score || 0}/100</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${insights?.intent_score || 0}%` }} />
                </div>
              </div>
              <p className="text-[10px] text-primary-foreground/40 leading-relaxed italic font-medium">
                "AI is identifying high-intent institutional buyers exploring your listing. Speed to response is critical now."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
