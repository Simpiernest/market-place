"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Bot,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AIDocumentAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysis(true);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <Card className="border-accent/20 bg-accent/5 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-primary">Due Diligence AI Assistant</CardTitle>
                <CardDescription className="text-[10px]">Ask questions about documents in this deal room.</CardDescription>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="e.g., 'Analyze the revenue concentration in the LTM P&L'..."
              className="w-full bg-white border-none rounded-xl pl-9 pr-4 py-2.5 text-xs shadow-sm focus:ring-2 focus:ring-accent outline-none"
            />
          </div>

          {!showAnalysis ? (
            <div className="mt-4 p-4 rounded-xl bg-white border border-accent/10 text-center">
              <p className="text-[10px] text-muted-foreground mb-3 font-medium">Select documents to run a comprehensive risk analysis.</p>
              <Button size="sm" onClick={runAnalysis} disabled={isAnalyzing} className="h-8 bg-accent hover:bg-accent/90 border-none text-white text-[10px] font-bold uppercase tracking-wider">
                {isAnalyzing ? (
                  <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Processing Documents...</>
                ) : (
                  "Run Full Deal Audit"
                )}
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              {/* Analysis Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Critical Insights</span>
                </div>

                <div className="grid gap-2">
                  <div className="p-3 rounded-lg bg-white border border-amber-100 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-bold text-primary">Revenue Concentration:</span> Top 3 customers account for 42% of revenue. This represents a moderate risk during ownership transition.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-green-100 flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-bold text-primary">Financial Consistency:</span> Bank statements match the uploaded Stripe exports with &lt;0.5% variance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-accent/10 flex justify-between items-center">
                <Button variant="ghost" className="h-7 text-[10px] text-accent hover:bg-accent/5">View Detailed Risk Report</Button>
                <Badge variant="outline" className="text-[8px] uppercase font-bold text-green-600 bg-green-50 border-green-600/20">92% Data Confidence</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
