"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, DollarSign, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { SpinningBorderButton } from "@/components/ui/spinning-border-button";

interface OfferModalProps {
  listingTitle: string;
  askingPrice: number;
  listingId: string;
  sellerId: string;
  isBuyNow?: boolean;
}

export function OfferModal({ listingTitle, askingPrice, listingId, sellerId, isBuyNow }: OfferModalProps) {
  const [amount, setAmount] = useState(askingPrice.toString());
  const [terms, setTerms] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/offers", {
        listing_id: listingId,
        seller_id: sellerId,
        amount: Number(amount),
        terms: terms,
        currency: "USD"
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2500);
    } catch (e: any) {
      setError(e.message || "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full bg-primary text-white border-none font-black uppercase tracking-widest h-12 shadow-xl shadow-primary/10 hover:bg-accent transition-all cursor-pointer group">
            {isBuyNow ? "Buy Now" : "Make Offer"}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {isOpen && (
          <DialogContent forceMount asChild className="sm:max-w-[500px] border-none shadow-2xl p-8 space-y-8 rounded-3xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center text-white shadow-2xl">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-primary uppercase italic">Offer Submitted.</h3>
                            <p className="text-xs text-muted-foreground font-medium max-w-[240px]">Your binding offer has been delivered to the seller. You will be notified of any updates.</p>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <DialogHeader className="space-y-2">
                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                            <DollarSign className="h-5 h-5" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase italic text-primary tracking-tight">
                            {isBuyNow ? "Instant Acquisition." : "Make an Offer."}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground leading-relaxed">
                            {isBuyNow ? `Acquire ${listingTitle} instantly for the fixed price.` : `Submit a binding offer for ${listingTitle}.`}
                        </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/10">
                            {error}
                            </div>
                        )}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                            Capital Commitment (USD)
                            </label>
                            <div className="relative group">
                            <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-11 h-12 rounded-xl border-2 border-secondary focus:border-accent transition-all font-black text-lg text-primary bg-slate-50/50"
                            />
                            </div>
                            <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-muted-foreground font-bold">
                                Asking Price: <span className="text-primary font-black italic">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(askingPrice)}</span>
                            </p>
                            {Number(amount) >= askingPrice ? (
                                <Badge className="bg-green-50 text-green-600 border-green-100 text-[8px] font-black uppercase">Competitive Offer</Badge>
                            ) : (
                                <Badge variant="outline" className="text-[8px] font-black uppercase text-muted-foreground">Below Ask</Badge>
                            )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                            Acquisition Terms & Structure
                            </label>
                            <Textarea
                            value={terms}
                            onChange={(e) => setTerms(e.target.value)}
                            placeholder="e.g., 80% upfront, 20% after 30 days stability period..."
                            className="min-h-[120px] rounded-xl border-2 border-secondary focus:border-accent transition-all font-medium text-sm p-4 bg-slate-50/50"
                            />
                        </div>

                        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/5 flex gap-4">
                            <ShieldCheck className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                            <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">escrow Protected</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                Your offer is semi-binding. Once accepted, both parties will move into the Agreement stage. Business Bridge holds funds in escrow during the inspection period.
                            </p>
                            </div>
                        </div>
                        </div>

                        <DialogFooter className="gap-3 sm:gap-0 pt-8">
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="font-black uppercase text-[10px] tracking-widest px-6">Cancel</Button>
                        <SpinningBorderButton
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            className="h-11"
                        >
                            {isBuyNow ? "Confirm Instant Purchase" : "Submit Binding Offer"}
                        </SpinningBorderButton>
                        </DialogFooter>
                    </>
                )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
