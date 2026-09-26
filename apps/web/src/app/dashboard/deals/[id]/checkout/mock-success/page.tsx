"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MockSuccessPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    async function updateTransaction() {
        setIsUpdating(true);
        try {
            // Simulate webhook processing
            // In a real app, the webhook handler on the backend would do this
            // Here we'll call a special debug endpoint or manually trigger the milestone
            // For the demo, we'll find the Escrow Funding milestone and complete it
            const txn = await api.get(`/transactions/${id}`);
            const escrowMilestone = txn.milestones.find((m: any) => m.title === "Escrow Funding");

            if (escrowMilestone) {
                await api.post(`/transactions/${id}/milestones/${escrowMilestone.id}/complete`, {});
            }
        } catch (e) {
            console.error("Failed to update deal status");
        } finally {
            setIsUpdating(false);
        }
    }
    updateTransaction();
  }, [id]);

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-8 max-w-md mx-auto text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="relative"
      >
         <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-pulse" />
         <div className="relative h-24 w-24 rounded-full bg-green-500 flex items-center justify-center text-white shadow-2xl">
            <CheckCircle2 className="w-12 h-12" />
         </div>
         <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-accent animate-bounce" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
         <h1 className="text-4xl font-black text-primary uppercase italic">Funds <span className="text-accent">Secured.</span></h1>
         <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Transaction Reference: BB-{id.slice(0,8).toUpperCase()}</p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground leading-relaxed font-medium"
      >
         Your acquisition commitment has been successfully authorized. The funds are now held in the <span className="text-primary font-bold">Business Bridge Escrow Account</span>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full p-6 rounded-3xl bg-secondary/20 border-2 border-secondary/50 flex items-start gap-4 text-left"
      >
         <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
         <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase text-primary">Inspection Period Active</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
               The seller has been notified to begin the <span className="font-bold">Asset Transfer</span> process. You now have the agreed-upon window to inspect the assets before final release.
            </p>
         </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full"
      >
        <Button
            onClick={() => router.push(`/dashboard/deals/${id}`)}
            disabled={isUpdating}
            className="w-full h-14 bg-primary text-white border-none font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 hover:bg-accent transition-all group"
        >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <>Back to Deal Room <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
        </Button>
      </motion.div>
    </div>
  );
}
