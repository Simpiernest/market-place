import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="relative">
         <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl -z-10" />
         <div className="text-9xl font-black text-primary italic uppercase tracking-tighter opacity-10">404</div>
         <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-24 h-24 text-accent/20" />
         </div>
      </div>

      <div className="space-y-4 max-w-md">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Asset Not <span className="text-accent">Found.</span></h1>
         <p className="text-lg text-muted-foreground font-medium">The page you're looking for has moved, expired, or never existed in this marketplace.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
         <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8">
               <Home className="w-4 h-4 mr-2" />
               Return Home
            </Button>
         </Link>
         <Link href="/marketplace">
            <Button size="lg" variant="outline" className="font-bold px-8">
               Browse Listings
            </Button>
         </Link>
      </div>

      <div className="pt-8">
         <button className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-2 uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" />
            Back to previous page
         </button>
      </div>
    </div>
  );
}
