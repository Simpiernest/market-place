"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Globe,
    Code,
    Cloud,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Zap,
    ShieldCheck,
    AlertCircle,
    Copy,
    ExternalLink
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface TransferCenterProps {
  dealId: string;
  isSeller: boolean;
}

export function TransferCenter({ dealId, isSeller }: TransferCenterProps) {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransfers() {
      setIsLoading(true);
      try {
        const data = await api.get(`/deals/${dealId}/transfers`);
        setTransfers(data);
      } catch (e) {
        console.error("Failed to fetch transfers");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransfers();
  }, [dealId]);

  const handleVerify = async (transferId: string) => {
    setIsVerifying(transferId);
    try {
        const res = await api.post(`/deals/transfers/${transferId}/verify`, {});
        if (res.status === 'success') {
            setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'COMPLETED' } : t));
        }
    } catch (e) {
        alert("Verification failed.");
    } finally {
        setIsVerifying(null);
    }
  };

  const initiateMockTransfer = async (type: string, name: string) => {
    try {
        const res = await api.post(`/deals/${dealId}/transfers`, {
            asset_type: type,
            asset_name: name
        });
        setTransfers(prev => [...prev, res]);
    } catch (e) {
        alert("Failed to initiate transfer.");
    }
  };

  if (isLoading) return <div className="h-20 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
      <CardHeader className="bg-primary text-white p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white">
                <Zap className="w-6 h-6" />
             </div>
             <div>
                <CardTitle className="text-xl font-black uppercase italic italic">Transfer <span className="text-accent">Center.</span></CardTitle>
                <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Automated Asset Handover Engine</CardDescription>
             </div>
          </div>
          <ShieldCheck className="w-8 h-8 text-accent/20" />
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {transfers.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed rounded-[2rem] border-secondary space-y-4">
             <Cloud className="w-12 h-12 text-muted-foreground/20 mx-auto" />
             <div className="space-y-1">
                <p className="text-sm font-bold text-primary uppercase">No assets pending handover</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                   {isSeller ? "Add assets to begin the transfer process" : "Waiting for seller to initiate asset handover"}
                </p>
             </div>
             {isSeller && (
                 <div className="flex justify-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="text-[10px] font-black uppercase h-9 rounded-xl" onClick={() => initiateMockTransfer('DOMAIN', 'businessbridge.com')}>Add Domain</Button>
                    <Button size="sm" variant="outline" className="text-[10px] font-black uppercase h-9 rounded-xl" onClick={() => initiateMockTransfer('SOURCE_CODE', 'Github Repo')}>Add Code</Button>
                 </div>
             )}
          </div>
        ) : (
          <div className="space-y-4">
             {transfers.map((t) => (
                <div key={t.id} className="p-6 rounded-3xl border-2 border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-accent/20 transition-all">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        t.status === 'COMPLETED' ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"
                      )}>
                        {t.asset_type === 'DOMAIN' ? <Globe className="h-7 w-7" /> : <Code className="h-7 w-7" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-primary uppercase italic tracking-tight">{t.asset_name}</h4>
                            {t.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{t.asset_type} • {t.status}</div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      {t.status === 'PENDING' && (
                        <Button
                            onClick={() => handleVerify(t.id)}
                            disabled={isVerifying === t.id}
                            className="bg-primary text-white border-none font-black uppercase text-[10px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-primary/10 hover:bg-accent transition-all"
                        >
                           {isVerifying === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Handover"}
                        </Button>
                      )}
                      {t.status === 'COMPLETED' && (
                          <div className="text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full uppercase tracking-tighter">
                              Verified on {new Date(t.completed_at).toLocaleDateString()}
                          </div>
                      )}
                   </div>
                </div>
             ))}
          </div>
        )}

        <div className="p-6 rounded-3xl bg-secondary/20 flex gap-4 items-start">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                Business Bridge <span className="font-bold text-primary italic">Automated Transfer</span> uses DNS propagation checks and API-level access verification to ensure both parties have fulfilled their obligations before release of escrow.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
