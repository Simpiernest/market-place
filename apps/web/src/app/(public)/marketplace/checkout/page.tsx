import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, Lock, ArrowRight, Zap, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-primary uppercase italic">Secure <span className="text-accent">Checkout.</span></h1>
              <p className="text-muted-foreground font-medium">Finalize your acquisition via our protected escrow foundation.</p>
           </div>

           <Card className="border-none shadow-sm bg-secondary/10">
              <CardHeader className="p-8">
                 <CardTitle className="text-lg font-bold">Transaction Configuration</CardTitle>
                 <CardDescription className="text-xs">Review the asset details and payment terms.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-white border">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                          <Zap className="h-6 h-6" />
                       </div>
                       <div>
                          <div className="font-bold text-primary">Premium AI SaaS Portfolio</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-black">Digital Asset Acquisition</div>
                       </div>
                    </div>
                    <div className="text-xl font-black text-primary">$125,000</div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Method</h4>
                    <div className="grid gap-3">
                       <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                          <div className="flex items-center gap-3">
                             <CreditCard className="w-5 h-5 text-primary" />
                             <span className="font-bold text-sm text-primary">Bank Wire (Global)</span>
                          </div>
                          <div className="h-4 w-4 rounded-full border-4 border-primary" />
                       </div>
                       <div className="flex items-center justify-between p-4 rounded-xl border-2 border-secondary bg-white cursor-not-allowed opacity-50">
                          <div className="flex items-center gap-3">
                             <Zap className="w-5 h-5 text-muted-foreground" />
                             <span className="font-bold text-sm text-muted-foreground">Stripe / Card (Limit Exceeded)</span>
                          </div>
                          <div className="h-4 w-4 rounded-full border-2 border-secondary" />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex gap-4">
              <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
              <div className="space-y-1">
                 <h4 className="font-bold text-primary">escrow-Protected</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                    Your funds will be held in a secure Business Bridge escrow account. They are only released to the seller after you confirm receipt and inspection of all digital assets.
                 </p>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <Card className="shadow-2xl border-none">
              <CardHeader className="bg-secondary/10 border-b">
                 <CardTitle className="text-lg font-bold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium text-muted-foreground">
                       <span>Purchase Price</span>
                       <span className="text-primary">$125,000.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-muted-foreground">
                       <span>Marketplace Fee</span>
                       <span className="text-primary">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-muted-foreground border-t pt-4">
                       <span className="font-black text-primary">Total Amount</span>
                       <span className="text-2xl font-black text-accent">$125,000.00</span>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                       <Info className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Verification Status</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">This business is fully verified. You will receive immediate access to the asset handover room after funding.</p>
                 </div>

                 <Button size="lg" className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 shadow-xl shadow-primary/20">
                    Confirm & Fund Deal
                    <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
              </CardContent>
              <CardFooter className="bg-secondary/5 p-4 text-center">
                 <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40">
                    <Lock className="w-3 h-3" />
                    Secure Transaction Layer
                 </div>
              </CardFooter>
           </Card>
        </div>
      </div>
    </div>
  );
}
