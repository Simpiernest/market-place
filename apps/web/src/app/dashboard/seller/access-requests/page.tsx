"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lock,
  Loader2,
  AlertCircle,
  Building
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function SellerAccessRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING_SELLER_REVIEW");

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      try {
        const data = await api.get("/ndas/seller/requests");
        setRequests(data);
      } catch (e) {
        console.error("Failed to fetch access requests");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(r => filter === 'ALL' || r.status === filter);

  if (isLoading) return <div className="h-full flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-primary uppercase italic">Confidential <span className="text-accent">Access Requests.</span></h1>
        <p className="text-muted-foreground font-medium">Review and manage buyer requests for your business data rooms.</p>
      </div>

      <div className="flex gap-1 bg-secondary/20 p-1 rounded-xl w-fit border">
        {[
          { id: "PENDING_SELLER_REVIEW", label: "Pending", count: requests.filter(r => r.status === 'PENDING_SELLER_REVIEW').length },
          { id: "APPROVED", label: "Approved", count: requests.filter(r => r.status === 'APPROVED').length },
          { id: "REJECTED", label: "Rejected", count: requests.filter(r => r.status === 'REJECTED').length },
          { id: "ALL", label: "All", count: requests.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              filter === tab.id ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            {tab.label} <span className="ml-1 opacity-40">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRequests.length > 0 ? filteredRequests.map((req, i) => (
            <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
            >
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group rounded-3xl">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className={cn(
                                "w-full md:w-2 h-2 md:h-auto shrink-0",
                                req.status === 'APPROVED' ? "bg-green-500" :
                                req.status === 'REJECTED' ? "bg-red-500" :
                                "bg-accent animate-pulse"
                            )} />

                            <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner font-black text-2xl italic uppercase">
                                        {req.buyer_name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-xl text-primary uppercase italic">{req.buyer_name}</h3>
                                            <Badge variant={req.buyer_verification_status === 'VERIFIED' ? 'default' : 'secondary'} className={cn(
                                                "text-[8px] font-black uppercase tracking-widest",
                                                req.buyer_verification_status === 'VERIFIED' ? "bg-green-500 hover:bg-green-600 border-none" : ""
                                            )}>
                                                {req.buyer_verification_status === 'VERIFIED' ? 'Verified Buyer' : 'Pending Verification'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-accent" /> {req.buyer_company || "Private Investor"}</span>
                                            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-accent" /> {req.listing_title}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" /> Signed {req.signature ? formatDistanceToNow(new Date(req.signature.signed_at)) + " ago" : "N/A"}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[8px] font-black border",
                                                req.status === 'APPROVED' ? "text-green-600 border-green-200 bg-green-50" :
                                                req.status === 'REJECTED' ? "text-red-600 border-red-200 bg-red-50" :
                                                "text-accent border-accent/20 bg-accent/5"
                                            )}>{req.status.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link href={`/dashboard/seller/access-requests/${req.id}`}>
                                        <Button variant="outline" className="border-2 font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5">
                                            Review Request <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
          )) : (
            <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-secondary/5 space-y-4">
                <Lock className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-primary uppercase italic tracking-widest">No matching requests found</p>
                    <p className="text-xs text-muted-foreground font-medium italic">New access requests from interested buyers will appear here.</p>
                </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
