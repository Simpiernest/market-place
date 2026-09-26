"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, TrendingUp, ShieldCheck, AlertCircle, Loader2, BarChart3, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AIFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: any;
  isLoading: boolean;
}

export function AIFinancialModal({ isOpen, onClose, analysis, isLoading }: AIFinancialModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent forceMount asChild className="sm:max-w-[600px] border-none shadow-2xl p-0 overflow-hidden rounded-[2rem]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="h-2 bg-accent" />
              <div className="p-8">
                  <DialogHeader className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                      <Bot className="w-6 h-6" />
                      </div>
                      <div>
                      <DialogTitle className="text-2xl font-black text-primary uppercase italic tracking-tight">AI Broker <span className="text-accent">Deep-Scan.</span></DialogTitle>
                      <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institutional-Grade Financial Intelligence</DialogDescription>
                      </div>
                  </div>
                  </DialogHeader>

                  {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-accent" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Analyzing P&L Structures...</p>
                  </div>
                  ) : analysis ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-3xl bg-secondary/20 border border-secondary flex flex-col items-center text-center">
                              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Valuation Multiple</span>
                              <span className="text-2xl font-black text-primary italic">{analysis.valuation_multiple}x</span>
                              <Badge variant="outline" className="mt-2 text-[8px] font-bold uppercase border-accent text-accent">Market Aligned</Badge>
                          </div>
                          <div className="p-4 rounded-3xl bg-secondary/20 border border-secondary flex flex-col items-center text-center">
                              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Net Margin status</span>
                              <span className="text-2xl font-black text-primary italic">{analysis.margin_analysis.status}</span>
                              <span className="text-[10px] font-bold text-accent mt-1">{analysis.margin_analysis.net_margin} Margin</span>
                          </div>
                      </div>

                      {/* Broker Narrative */}
                      <div className="p-6 rounded-3xl bg-primary text-white relative overflow-hidden shadow-xl">
                          <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5" />
                          <div className="flex items-center gap-2 mb-3">
                              <Bot className="w-4 h-4 text-accent" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Strategic Assessment</span>
                          </div>
                          <p className="text-sm font-medium italic leading-relaxed">
                              "{analysis.broker_advice}"
                          </p>
                      </div>

                      {/* Risk Scan */}
                      <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Risk Factor Analysis</h4>
                          <div className="space-y-3">
                              {analysis.risk_deep_scan.map((risk: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-secondary/50 hover:border-accent/20 transition-colors group">
                                      <div className={cn(
                                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                          risk.impact === 'Low' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                                      )}>
                                          {risk.impact === 'Low' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-black text-primary uppercase">{risk.factor}</span>
                                              <span className={cn(
                                                  "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                                                  risk.impact === 'Low' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                              )}>{risk.impact} Risk</span>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground mt-1 font-medium">{risk.notes}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <Button onClick={onClose} variant="outline" className="flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">
                              Close Analysis
                          </Button>
                          <Button className="flex-2 bg-accent hover:bg-accent/90 border-none text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-accent/20">
                              Proceed to Offer
                              <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                      </div>
                  </div>
                  ) : (
                      <div className="py-20 text-center italic text-muted-foreground text-xs">
                          Failed to load AI analysis.
                      </div>
                  )}
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
