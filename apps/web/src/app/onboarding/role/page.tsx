import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, TrendingUp, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function RoleSelectionPage() {
  return (
    <div className="container py-24 min-h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4 max-w-2xl">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Your acquisition <span className="text-accent">Journey.</span></h1>
         <p className="text-xl text-muted-foreground font-medium">To provide the most relevant tools, we need to know your primary intent on the platform.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
         {/* Buyer Role */}
         <Link href="/onboarding/buyer" className="group">
           <Card className="h-full border-2 transition-all hover:border-accent hover:shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserCheck className="w-32 h-32 text-accent" />
              </div>
              <CardHeader className="p-8">
                 <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-colors shadow-sm">
                    <UserCheck className="w-6 h-6" />
                 </div>
                 <CardTitle className="text-2xl font-black text-primary">I want to BUY</CardTitle>
                 <CardDescription className="text-muted-foreground mt-2 font-medium">Discover cash-flowing businesses and acquire digital assets.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 space-y-4">
                 {[
                   "Access verified listing financials",
                   "Submit offers and negotiate terms",
                   "Manage due diligence in deal rooms",
                   "escrow-protected transactions"
                 ].map(item => (
                   <div key={item} className="flex items-center gap-3 text-sm font-bold text-primary">
                      <ShieldCheck className="w-5 h-5 text-accent" />
                      {item}
                   </div>
                 ))}
              </CardContent>
              <div className="p-8 pt-0 mt-auto">
                 <Button className="w-full bg-primary text-primary-foreground border-none font-black h-12 uppercase tracking-widest group-hover:bg-accent transition-colors">
                    Start Buying
                    <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
           </Card>
         </Link>

         {/* Seller Role */}
         <Link href="/onboarding/seller" className="group">
           <Card className="h-full border-2 transition-all hover:border-primary hover:shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-32 h-32 text-primary" />
              </div>
              <CardHeader className="p-8">
                 <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <CardTitle className="text-2xl font-black text-primary">I want to SELL</CardTitle>
                 <CardDescription className="text-muted-foreground mt-2 font-medium">Exit your successful business and achieve full liquidity.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-8 pt-0 space-y-4">
                 {[
                   "Professional multi-layer verification",
                   "Attract verified high-intent buyers",
                   "Secure document data rooms",
                   "Highest marketplace exit multiples"
                 ].map(item => (
                   <div key={item} className="flex items-center gap-3 text-sm font-bold text-primary">
                      <Zap className="w-5 h-5 text-accent" />
                      {item}
                   </div>
                 ))}
              </CardContent>
              <div className="p-8 pt-0 mt-auto">
                 <Button className="w-full bg-primary text-primary-foreground border-none font-black h-12 uppercase tracking-widest group-hover:bg-primary/90 transition-colors">
                    Start Selling
                    <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
           </Card>
         </Link>
      </div>

      <p className="text-sm text-muted-foreground font-medium">You can always register a secondary role later in settings.</p>
    </div>
  );
}
