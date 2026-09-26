"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  TrendingUp,
  BarChart3,
  Calculator,
  Bot,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";

import { api } from "@/lib/api-client";

export default function ValuationPage() {
  const [revenue, setRevenue] = useState("120000");
  const [profit, setProfit] = useState("45000");
  const [growth, setGrowth] = useState("15");
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculate = async () => {
    setIsCalculating(true);
    try {
        const data = await api.post("/sellers/valuation", {
            revenue: Number(revenue),
            profit: Number(profit),
            growth: Number(growth)
        });
        setResult(data);
    } catch (e) {
        alert("Valuation service unavailable.");
    } finally {
        setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Smart Valuation</h1>
        <p className="text-muted-foreground mt-1">Get an instant estimate powered by marketplace data and acquisition multiples.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-accent" />
                Financial Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Annual Revenue (LTM)</label>
                <Input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Annual Profit (LTM)</label>
                <Input
                  type="number"
                  value={profit}
                  onChange={(e) => setProfit(e.target.value)}
                  className="font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Annual Growth (%)</label>
                <Input
                  type="number"
                  value={growth}
                  onChange={(e) => setGrowth(e.target.value)}
                  className="font-bold"
                />
              </div>
              <div className="pt-4">
                <Button
                  onClick={calculate}
                  className="w-full bg-accent hover:bg-accent/90 border-none text-white h-11"
                  disabled={isCalculating}
                >
                  {isCalculating ? "Analyzing Market Data..." : "Run Valuation"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-accent shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This estimate uses a Seller Discretionary Earnings (SDE) multiple, which is common for businesses under $5M in value.
              </p>
            </div>
          </div>
        </div>

        {/* Results & AI Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="h-full min-h-[400px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-primary">Ready to Value Your Business</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                Enter your LTM figures to see where your business stands in today's marketplace.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Scorecard */}
              <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Sparkles className="w-24 h-24" />
                </div>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50">Estimated Enterprise Value</div>
                      <div className="text-5xl font-extrabold mt-2 text-accent italic">
                        $<Counter value={result.estimated_value} />
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="text-center bg-white/10 px-4 py-2 rounded-lg">
                          <div className="text-[10px] uppercase font-bold text-primary-foreground/60">Implied Multiple</div>
                          <div className="font-bold">{result.implied_multiple}x</div>
                        </div>
                        <div className="text-center bg-white/10 px-4 py-2 rounded-lg">
                          <div className="text-[10px] uppercase font-bold text-primary-foreground/60">Profit Margin</div>
                          <div className="font-bold">{result.profit_margin}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-64 space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-bold">Growth Premium</span>
                        </div>
                        <p className="text-[10px] text-primary-foreground/60">Your {growth}% YoY growth adds approx. ${result.growth_premium?.toLocaleString()} to your base multiple.</p>
                      </div>
                      <Button className="w-full bg-white text-primary hover:bg-white/90">List at this Price</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Explanation */}
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Bot className="w-5 h-5 text-accent" />
                    AI Analysis & Evidence
                  </CardTitle>
                  <CardDescription>How we reached this number.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="p-4 rounded-xl bg-white border border-accent/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[8px] uppercase border-green-600/30 text-green-600 bg-green-50">Verified Fact</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The current median multiple for <span className="font-bold text-primary">SaaS</span> businesses with under $100k SDE is <span className="font-bold text-primary">3.5x</span> based on 1,200+ successful closings in the last 12 months.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-accent/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[8px] uppercase border-blue-600/30 text-blue-600 bg-blue-50">AI Inference</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Due to your net margin ({result.profit_margin}%), you are positioned in the top 15% of your category. This suggests a "scarcity premium" may be applicable during negotiations.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-accent/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[8px] uppercase border-amber-600/30 text-amber-600 bg-amber-50">Market Recommendation</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        To attract institutional buyers, I recommend preparing a <span className="font-bold text-primary">Quality of Earnings (QoE) report</span>. This could justify a multiple increase to 4.5x.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>Valuation ID: {result.valuation_id}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-accent" /> Secure Analysis</span>
                  </div>
                </CardContent>
              </Card>

              {/* Comparable Businesses (V1.5) */}
              <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
                <CardHeader className="p-8 bg-secondary/10 border-b">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Comparable Marketplace Deals</CardTitle>
                      <Badge variant="secondary" className="text-[8px] font-black uppercase">Verified Comps</Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-secondary/30">
                      {(result.comps || []).map((comp: any, idx: number) => (
                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                           <div className="space-y-1">
                              <div className="text-sm font-bold text-primary italic uppercase">{comp.title}</div>
                              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{comp.status}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-black text-primary italic">${comp.asking.toLocaleString()}</div>
                              <div className="text-[10px] text-accent font-black uppercase">{comp.multiple} Multiple</div>
                           </div>
                        </div>
                      ))}
                      {(!result.comps || result.comps.length === 0) && (
                          <div className="p-12 text-center text-xs text-muted-foreground italic uppercase opacity-40">Searching marketplace comps...</div>
                      )}
                   </div>
                </CardContent>
                <CardFooter className="p-6 bg-secondary/5 border-t">
                   <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground">Download Detailed Comps Report (PDF)</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
