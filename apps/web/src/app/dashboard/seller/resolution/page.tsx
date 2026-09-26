"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Clock,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function SellerDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDisputes() {
      setIsLoading(true);
      try {
        const data = await api.get("/disputes/my-disputes");
        setDisputes(data || []);
      } catch (e) {
        console.error("Failed to fetch disputes");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDisputes();
  }, []);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Resolution <span className="text-accent">Center.</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Manage active disputes and mediation cases.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {disputes.length > 0 ? disputes.map((dispute) => (
          <Card key={dispute.id} className="border-none shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardContent className="p-0">
               <div className="flex items-center justify-between p-8 group hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="font-black text-lg text-primary uppercase italic">{dispute.reason}</h3>
                        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Opened {formatDistanceToNow(new Date(dispute.created_at))} ago</span>
                           <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-red-500 border-red-200">{dispute.status}</Badge>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" className="border-2 font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl">View Details</Button>
                     <Button variant="outline" className="border-2 font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl"><MessageSquare className="w-4 h-4 mr-2" /> Mediator</Button>
                  </div>
               </div>
            </CardContent>
          </Card>
        )) : (
            <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-secondary/5 space-y-4">
                <ShieldAlert className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-primary uppercase italic tracking-widest">No active disputes</p>
                    <p className="text-xs text-muted-foreground font-medium italic">Your account has a clean transaction history.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
