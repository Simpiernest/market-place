"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, DollarSign, ArrowRight, Loader2, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-client";

export default function CheckoutPage() {
  const params = useParams();
  const id = params.id as string;
  const [txn, setTxn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    api.get(`/transactions/${id}`).then(setTxn).catch(console.error).finally(() => setIsLoading(false));
  }, [id]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const session = await api.post(`/payments/create-checkout`, { transaction_id: id, provider: "stripe" });
      window.location.href = session.url;
    } catch (e) {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !txn) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="space-y-1 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Lock className="w-3 h-3" /> Secure checkout
        </div>
        <h1 className="text-4xl font-black text-primary uppercase italic">Complete <span className="text-accent">Acquisition.</span></h1>
        <p className="text-muted-foreground font-medium">Fund escrow for <span className="text-primary font-bold">"{txn.listing_title}"</span></p>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="p-8 bg-secondary/10 border-b">
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center py-4 border-b">
                <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Business Value</span>
                <span className="text-xl font-black text-primary italic">${Number(txn.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b">
                <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Escrow Fee</span>
                <span className="text-sm font-bold text-green-600 uppercase">Paid by Seller (5%)</span>
              </div>
              <div className="flex justify-between items-center py-6">
                <span className="font-black uppercase text-[12px] tracking-widest text-primary">Total</span>
                <span className="text-3xl font-black text-accent italic">${Number(txn.amount).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-3xl bg-primary text-white space-y-4 shadow-2xl relative overflow-hidden">
            <ShieldCheck className="absolute -top-4 -right-4 w-32 h-32 text-white/5" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase italic">Business Bridge Escrow.</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              Your funds are held securely. Released only after you complete <span className="text-accent font-bold">Inspection Period</span>.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-3">
                <button className="w-full p-4 rounded-2xl border-2 border-accent bg-accent/5 text-left flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <span className="text-sm font-black text-primary uppercase">Stripe</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </button>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authorize & Fund Escrow <ArrowRight className="ml-2 w-4 h-4" /></>}
              </Button>
            </CardContent>
            <CardFooter className="p-8 bg-secondary/20 flex items-center gap-3">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-[9px] font-black uppercase text-muted-foreground">SSL Encrypted</span>
            </CardFooter>
          </Card>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 font-medium">
              By clicking "Authorize", you agree to the <span className="underline">Purchase Agreement</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
