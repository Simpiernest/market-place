"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft, CheckCircle2, ShieldCheck, Clock, FileText, Lock, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";

export default function TransferCenterPage() {
  const { id } = useParams() as { id: string };
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
        setIsLoading(true);
        try {
            const data = await api.get(`/deals/${id}/transfers`);
            setAssets(data);
        } catch (e) {
            console.error("Failed to fetch assets");
        } finally {
            setIsLoading(false);
        }
    }
    fetchAssets();
  }, [id]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="container py-12 max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex items-center gap-4">
            <Link href={`/dashboard/deals/${id}`}>
               <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
               </Button>
            </Link>
            <div>
               <h1 className="text-3xl font-black text-primary uppercase italic">Transfer <span className="text-accent">Center.</span></h1>
               <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary text-primary-foreground border-none text-[8px] font-black tracking-widest uppercase">Asset Handover</Badge>
                  <span className="text-xs text-muted-foreground font-medium uppercase">Deal ID: {id.slice(0,8)}</span>
               </div>
            </div>
         </div>
         <Button className="bg-accent hover:bg-accent/90 border-none text-white font-black px-8 h-12 rounded-2xl shadow-xl shadow-accent/20">
            Submit Evidence
         </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem]">
               <CardHeader className="bg-secondary/10 border-b p-8">
                  <CardTitle>Digital Assets</CardTitle>
                  <CardDescription className="text-xs font-medium">Verify each asset handover to progress to closing.</CardDescription>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y">
                     {assets.map((asset) => {
                        const Icon = asset.asset_type === 'DOMAIN' ? Globe : asset.asset_type === 'CODE' ? FileText : Lock;
                        return (
                       <div key={asset.id} className="p-6 flex items-center justify-between group hover:bg-secondary/5 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors shadow-inner">
                                <Icon className="h-5 w-5" />
                             </div>
                             <div>
                                <div className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{asset.asset_type}</div>
                                <div className="font-bold text-primary">{asset.asset_name}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <Badge variant="outline" className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                asset.status === 'COMPLETED' ? "border-green-500/20 text-green-600 bg-green-50" :
                                asset.status === 'IN_PROGRESS' ? "border-amber-500/20 text-amber-600 bg-amber-50" :
                                "text-muted-foreground"
                             )}>{asset.status}</Badge>
                             {asset.status !== 'COMPLETED' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="font-bold text-xs uppercase tracking-tighter text-accent"
                                    onClick={() => api.post(`/deals/transfers/${asset.id}/verify`).then(() => window.location.reload())}
                                >Verify</Button>
                             )}
                          </div>
                       </div>
                     )})}
                  </div>
                  <div className="p-4 bg-secondary/10 border-t flex justify-center">
                     <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                        <Plus className="w-3 h-3 mr-2" />
                        Add Asset for Handover
                     </Button>
                  </div>
               </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
               <Clock className="w-6 h-6 text-amber-600 shrink-0" />
               <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Inspection Period</h4>
                  <p className="text-xs text-amber-800/70 leading-relaxed font-medium">
                     Once all assets are marked as transferred, the 14-day inspection period begins. The buyer will have this time to verify all systems and financials before the final payout is triggered.
                  </p>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <ShieldCheck className="w-16 h-16" />
               </div>
               <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Handover Status</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="text-4xl font-black text-accent italic">33%</div>
                  <div className="space-y-2">
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-1/3" />
                     </div>
                     <p className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest text-center">1 of 3 assets ready</p>
                  </div>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-black h-11 uppercase tracking-widest text-xs">
                     View Evidence Logs
                  </Button>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
