import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Home, ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="h-24 w-24 rounded-3xl bg-accent/10 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
         <Lock className="h-12 w-12" />
      </div>

      <div className="space-y-4 max-w-md">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Access <span className="text-destructive">Restricted.</span></h1>
         <p className="text-lg text-muted-foreground font-medium">You do not have the required permissions to access this acquisition asset or dashboard.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
         <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8">
               <Home className="w-4 h-4 mr-2" />
               Return Home
            </Button>
         </Link>
         <Link href="/support">
            <Button size="lg" variant="outline" className="font-bold px-8">
               Contact Compliance
            </Button>
         </Link>
      </div>

      <div className="flex items-center gap-2 pt-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
         <ShieldAlert className="h-3 w-3" />
         Identity-Locked Workflow
      </div>
    </div>
  );
}
