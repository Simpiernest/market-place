import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="container py-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-6">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Transparent <span className="text-accent">Pricing.</span></h1>
         <p className="text-xl text-muted-foreground leading-relaxed font-medium">We only win when you win. No listing fees. No subscription fees. Just results.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
         {/* Buyers */}
         <Card className="border-none shadow-lg bg-secondary/20 flex flex-col">
            <CardHeader className="text-center p-8">
               <CardTitle className="text-lg font-black uppercase tracking-widest text-muted-foreground">For Buyers</CardTitle>
               <div className="mt-4 text-5xl font-black text-primary">Free</div>
               <p className="text-sm text-muted-foreground mt-4">Discover and evaluate listings at no cost.</p>
            </CardHeader>
            <CardContent className="flex-1 p-8 pt-0 space-y-4">
               {[
                 "Unlimited Marketplace Access",
                 "Verified Financial Metrics",
                 "Secure Messaging with Sellers",
                 "Standard NDA Support",
                 "No Acquisition Fees"
               ].map(item => (
                 <div key={item} className="flex items-center gap-3 text-sm font-bold text-primary">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {item}
                 </div>
               ))}
            </CardContent>
            <CardFooter className="p-8">
               <Link href="/register" className="w-full">
                 <Button variant="outline" className="w-full font-bold h-12">Start Buying</Button>
               </Link>
            </CardFooter>
         </Card>

         {/* Sellers - Standard */}
         <Card className="border-accent shadow-2xl relative scale-105 z-10 flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recommended</div>
            <CardHeader className="text-center p-8 bg-accent/5">
               <CardTitle className="text-lg font-black uppercase tracking-widest text-accent">For Sellers</CardTitle>
               <div className="mt-4 text-5xl font-black text-primary">5-10%</div>
               <p className="text-sm text-muted-foreground mt-4">Success-based commission on closing.</p>
            </CardHeader>
            <CardContent className="flex-1 p-8 space-y-4">
               {[
                 "Professional Vetted Listing",
                 "Multi-region Compliance Vetting",
                 "Encrypted Data Room Hosting",
                 "escrow-Protected Transactions",
                 "Broker Support Foundation"
               ].map(item => (
                 <div key={item} className="flex items-center gap-3 text-sm font-black text-primary">
                    <Zap className="w-5 h-5 text-accent" />
                    {item}
                 </div>
               ))}
            </CardContent>
            <CardFooter className="p-8">
               <Link href="/register" className="w-full">
                 <Button className="w-full bg-accent hover:bg-accent/90 border-none font-black h-12 shadow-xl shadow-accent/20">List Your Business</Button>
               </Link>
            </CardFooter>
         </Card>

         {/* Institutional */}
         <Card className="border-none shadow-lg bg-secondary/20 flex flex-col">
            <CardHeader className="text-center p-8">
               <CardTitle className="text-lg font-black uppercase tracking-widest text-muted-foreground">Institutional</CardTitle>
               <div className="mt-4 text-5xl font-black text-primary">Custom</div>
               <p className="text-sm text-muted-foreground mt-4">For PE firms and professional investors.</p>
            </CardHeader>
            <CardContent className="flex-1 p-8 pt-0 space-y-4">
               {[
                 "Advanced Team Permissions",
                 "Portfolio Performance Tracking",
                 "Priority Match Notifications",
                 "Deal Workflow Customization",
                 "Direct API Access (V3)"
               ].map(item => (
                 <div key={item} className="flex items-center gap-3 text-sm font-bold text-primary">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    {item}
                 </div>
               ))}
            </CardContent>
            <CardFooter className="p-8">
               <Link href="/contact" className="w-full">
                 <Button variant="outline" className="w-full font-bold h-12">Contact Sales</Button>
               </Link>
            </CardFooter>
         </Card>
      </div>
    </div>
  );
}
