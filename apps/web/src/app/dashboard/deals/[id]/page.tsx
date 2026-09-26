"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIDocumentAssistant } from "@/components/deals/ai-document-assistant";
import { TransferCenter } from "@/components/deals/transfer-center";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  DollarSign,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Lock,
  Download,
  Plus,
  Star,
  Landmark,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DealRoomPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("milestones");
  const [deal, setDeal] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [dealData, userData] = await Promise.all([
          api.get(`/deals/${id}`),
          api.get("/auth/me")
        ]);
        setDeal(dealData);
        setCurrentUser(userData);
      } catch (e) {
        console.error("Failed to fetch deal data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleCompleteMilestone = async () => {
    const currentMilestone = deal.milestones.find((m: any) => m.status.toLowerCase() === 'in_progress');
    if (!currentMilestone) return;

    try {
      const updatedDeal = await api.post(`/transactions/${deal.id}/milestones/${currentMilestone.id}/complete`, {});
      setDeal(updatedDeal);
    } catch (e) {
      alert("Failed to update milestone");
    }
  };

  if (isLoading || !deal) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24">
      {/* Deal Progress Tracker */}
      <div className="flex gap-2 bg-secondary/10 p-2 rounded-2xl border mb-4">
        {['INITIATED', 'AGREEMENT_PENDING', 'FUNDING', 'FUNDED', 'TRANSFER', 'INSPECTION', 'COMPLETED'].map((step, i) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-2">
                <div className={cn(
                    "h-1.5 w-full rounded-full transition-all",
                    deal.status === step ? "bg-accent" :
                    i < ['INITIATED', 'AGREEMENT_PENDING', 'FUNDING', 'FUNDED', 'TRANSFER', 'INSPECTION', 'COMPLETED'].indexOf(deal.status) ? "bg-green-500" : "bg-slate-200"
                )} />
                <span className={cn(
                    "text-[8px] font-black uppercase tracking-tighter",
                    deal.status === step ? "text-primary" : "text-muted-foreground opacity-40"
                )}>{step.replace('_', ' ')}</span>
            </div>
        ))}
      </div>

      {/* Deal Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-accent text-white border-none uppercase tracking-tighter text-[10px]">{deal.status}</Badge>
            <span className="text-xs text-muted-foreground">Deal ID: {deal.id}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">{deal.listing_title}</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-primary">
              Buyer: {deal.buyer_name}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-primary">
              Seller: {deal.seller_name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="lg" className="h-12" onClick={() => api.get("/messages/conversations").then(r => window.location.href = "/dashboard/messages?id=" + r[0]?.id).catch(() => alert("Chat requires active conversation"))}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Deal Chat
          </Button>
          <Button
            size="lg"
            className="h-12 bg-accent hover:bg-accent/90 border-none text-white px-8"
            onClick={handleCompleteMilestone}
            disabled={deal.status === 'CLOSED'}
          >
            Complete Milestone
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
         {["milestones", "documents", "transfers"].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "pb-4 px-2 text-sm font-bold uppercase tracking-widest relative transition-colors",
               activeTab === tab ? "text-accent" : "text-muted-foreground hover:text-primary"
             )}
           >
             {tab}
             {activeTab === tab && (
               <motion.div
                 layoutId="activeTab"
                 className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
               />
             )}
           </button>
         ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-accent/5 border border-accent/10 rounded-3xl overflow-hidden p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm">
                      <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Escrow Provider</p>
                      <p className="text-sm font-bold text-primary italic uppercase">Funds held by Escrow.com</p>
                  </div>
              </div>
              <div className="text-right">
                  <Badge className="bg-green-500 text-white uppercase font-black text-[8px] tracking-widest">Funds Secured</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Verified by Business Bridge Oracle</p>
              </div>
          </Card>

          {activeTab === "milestones" && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <AIDocumentAssistant />
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-secondary/10 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle>Deal Milestones</CardTitle>
                        <CardDescription>Track the progress of this acquisition.</CardDescription>
                        </div>
                        <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{deal.progress}%</div>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">Progress</div>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="p-6">
                    <div className="space-y-0 relative">
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-secondary" />
                        {deal.milestones.map((m: any) => {
                        const Icon = m.id === 1 ? CheckCircle2 :
                                    m.id === 2 ? Clock :
                                    m.id === 3 ? FileText :
                                    m.id === 4 ? DollarSign :
                                    m.id === 5 ? ShieldCheck : CheckCircle2;
                        return (
                            <div key={m.id} className="relative flex gap-6 pb-10 last:pb-0 group">
                            <div className={cn(
                                "z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                                m.status.toLowerCase() === 'completed' ? "bg-green-500 text-white" :
                                m.status.toLowerCase() === 'in_progress' ? "bg-accent text-white scale-110 shadow-lg" :
                                "bg-secondary text-muted-foreground"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 pt-1">
                                <div className="flex justify-between items-start">
                                <h4 className={cn(
                                    "font-bold transition-colors",
                                    m.status.toLowerCase() === 'pending' ? "text-muted-foreground" : "text-primary"
                                )}>
                                    {m.title}
                                </h4>
                                {m.date && <span className="text-xs font-medium text-muted-foreground">{m.date}</span>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                {m.status.toLowerCase() === 'completed' ? "Verified and finalized." :
                                m.status.toLowerCase() === 'in_progress' ? "Action required for this stage." :
                                "Not yet started."}
                                </p>
                                {m.status.toLowerCase() === 'in_progress' && (
                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => api.get("/deals/" + m.id).then(r => alert("Requirements: " + (r.requirements || "None"))).catch(() => alert("Requirements unavailable"))}>View Requirements</Button>
                                    <Button size="sm" className="text-xs h-8" onClick={() => api.post("/documents/upload", { milestone_id: m.id, type: "evidence" }).catch(() => alert("Upload portal error"))}>Upload Evidence</Button>
                                </div>
                                )}
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    </CardContent>
                </Card>
            </motion.div>
          )}

          {activeTab === "documents" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                    <CardHeader>
                    <CardTitle className="text-lg">Deal Documents</CardTitle>
                    <CardDescription>Files specific to this transaction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-3">
                        {[
                        { name: "Draft APA.docx", type: "Legal", status: "Review Required" },
                        { name: "Accepted Offer Letter.pdf", type: "Offer", status: "Signed" },
                        ].map((doc) => (
                        <div key={doc.name} className="flex items-center justify-between p-3 rounded-xl border group hover:bg-secondary/10 transition-colors">
                            <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-primary">{doc.name}</div>
                                <div className="text-[10px] font-bold uppercase text-muted-foreground">{doc.type}</div>
                            </div>
                            </div>
                            <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-[10px] font-bold">{doc.status}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert(`Downloading ${doc.name}...`)}><Download className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        ))}
                        <Button variant="ghost" className="w-full text-accent text-xs mt-2" onClick={() => alert("Opening document upload dialog...")}>
                        <Plus className="w-3 h-3 mr-2" />
                        Add Transaction Document
                        </Button>
                    </div>
                    </CardContent>
                </Card>
              </motion.div>
          )}

          {activeTab === "transfers" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                  <TransferCenter dealId={deal.id} isSeller={currentUser?.id === deal.seller_id} />
              </motion.div>
          )}
        </div>

        {/* Deal Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase text-primary-foreground/50 tracking-widest">Agreed Purchase Price</div>
                <div className="text-3xl font-bold">${Number(deal.amount || 0).toLocaleString()}</div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary-foreground/70">Upfront Payment</span>
                  <span className="font-bold">${Number(deal.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Escrow Active</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-primary-foreground/60 border-b border-white/5 pb-2">
                    <span>Funding Method</span>
                    <span className="text-white font-bold">{deal.funding_method || "Direct Transfer"}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-primary-foreground/60">
                    <span>Transaction ID</span>
                    <span className="text-white font-mono">{deal.id.split('-')[0].toUpperCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Need Assistance?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our transaction support team is monitoring this deal to ensure a smooth closing.
              </p>
              <Button variant="outline" className="w-full text-xs" onClick={() => alert("Your broker has been notified and will join the chat shortly.")}>
                Request Broker Assistance
              </Button>

              <Button
                variant="ghost"
                className="w-full text-xs text-red-500 hover:bg-red-50"
                onClick={async () => {
                    const reason = prompt("State your reason for raising an issue:");
                    if (reason) {
                        try {
                            await api.post("/disputes", { deal_id: deal.id, reason, description: "Raised from deal room UI" });
                            alert("Dispute opened. A compliance officer will review the case.");
                        } catch (e) {
                            alert("Failed to open dispute.");
                        }
                    }
                }}
              >
                Raise Formal Issue
              </Button>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" />
                <span className="text-[10px] font-medium text-yellow-800">
                  Due diligence period ends in 4 days.
                </span>
              </div>

              {deal.status === 'COMPLETED' && (
                <Link href={`/dashboard/deals/${deal.id}/reviews`} className="block w-full">
                    <Button className="w-full bg-accent hover:bg-accent/90 border-none text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-xl shadow-accent/20 animate-in fade-in zoom-in duration-500">
                        <Star className="w-4 h-4 mr-2 fill-current" />
                        Submit Final Review
                    </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
