"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  User,
  Building,
  MapPin,
  FileText,
  Clock,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function AccessRequestReviewPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function fetchRequest() {
      try {
        const data = await api.get(`/ndas/requests/${id}`);
        setRequest(data);
      } catch (e) {
        console.error("Failed to fetch request detail");
        router.push("/dashboard/seller/access-requests");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequest();
  }, [id, router]);

  const handleDecision = async (status: string) => {
    if (status === 'REJECTED' && !showRejectReason) {
        setShowRejectReason(true);
        return;
    }

    if (status === 'APPROVED') {
        if (!confirm("Are you sure you want to GRANT confidential access to this buyer? They will be able to view all sensitive business documents.")) {
            return;
        }
    }

    setIsProcessing(true);
    try {
        await api.patch(`/ndas/requests/${id}`, {
            status,
            rejection_reason: status === 'REJECTED' ? rejectReason : null
        });
        alert(`Request ${status.toLowerCase()} successfully.`);
        router.push("/dashboard/seller/access-requests");
    } catch (e) {
        alert("Failed to process decision");
    } finally {
        setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-black text-primary uppercase italic">Review Access <span className="text-accent">Request.</span></h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Buyer Profile */}
          <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-secondary/10 border-b p-8">
                <CardTitle className="text-xl font-black text-primary uppercase italic flex items-center gap-3">
                    <User className="w-6 h-6 text-accent" /> Buyer Profile
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground mt-1">Review the institutional profile of the requesting buyer.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
                <div className="flex items-start gap-8">
                    <div className="h-24 w-24 rounded-[2rem] bg-primary flex items-center justify-center text-white font-black text-4xl italic shadow-2xl">
                        {request?.buyer_name[0]}
                    </div>
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-primary uppercase italic">{request?.buyer_name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge className={cn(
                                    "border-none font-black uppercase text-[8px] tracking-widest",
                                    request?.buyer_verification_status === 'VERIFIED' ? "bg-green-500 hover:bg-green-600" : "bg-amber-500"
                                )}>
                                    {request?.buyer_verification_status === 'VERIFIED' ? 'Identity Verified' : 'Identity Verification Pending'}
                                </Badge>
                                <Badge className={cn(
                                    "border-none font-black uppercase text-[8px] tracking-widest",
                                    request?.buyer_proof_of_funds === 'VERIFIED' ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500"
                                )}>
                                    {request?.buyer_proof_of_funds === 'VERIFIED' ? 'Proof of Funds: OK' : 'No Proof of Funds'}
                                </Badge>
                                <Badge variant="secondary" className="font-black uppercase text-[8px] tracking-widest">Institutional Buyer</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <div className="space-y-1">
                                <p className="opacity-50">Company</p>
                                <p className="text-primary text-sm font-bold normal-case">{request?.buyer_company || "Private Investor"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="opacity-50">Location</p>
                                <p className="text-primary text-sm font-bold normal-case">United States</p>
                            </div>
                            <div className="space-y-1">
                                <p className="opacity-50">Previous Activity</p>
                                <p className="text-primary text-sm font-bold normal-case">3 Closed Deals</p>
                            </div>
                            <div className="space-y-1">
                                <p className="opacity-50">Join Date</p>
                                <p className="text-primary text-sm font-bold normal-case">August 2023</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* NDA Details */}
          <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-secondary/10 border-b p-8">
                <CardTitle className="text-xl font-black text-primary uppercase italic flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-accent" /> non-disclosure agreement
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground mt-1">Verification of the signed legal agreement.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">NDA Status</div>
                            <div className="flex items-center gap-2 text-green-600 font-black uppercase text-[10px]">
                                <CheckCircle2 className="w-4 h-4" /> Signed & Legally Binding
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Signed On</div>
                            <div className="text-sm font-bold text-primary italic">{format(new Date(request?.signature?.signed_at || request?.created_at), 'MMMM dd, yyyy HH:mm')}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Signature Type</div>
                            <div className="text-sm font-bold text-primary italic uppercase tracking-tighter">{request?.signature?.signature_type || 'Digital'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreement Hash</div>
                            <div className="font-mono text-[10px] text-muted-foreground truncate">{request?.id}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Signature Preview</div>
                    <div className="h-32 w-full bg-slate-50 border-2 border-dashed rounded-3xl flex items-center justify-center overflow-hidden">
                        {request?.signature?.signature_type === 'DRAWN' ? (
                            <img src={request.signature.signature_data} alt="Signature" className="max-h-full max-w-full object-contain p-4" />
                        ) : (
                            <div className="text-4xl font-signature text-primary opacity-60 italic">
                                {request?.signature?.signature_data || request?.buyer_name}
                            </div>
                        )}
                    </div>
                </div>

                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/5 p-0 h-auto">View Full Signed NDA (PDF)</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-primary text-white shadow-2xl rounded-[2rem] overflow-hidden sticky top-28">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-widest italic">Seller Decision</CardTitle>
                <CardDescription className="text-white/50 text-xs font-medium italic">Grant access to confidential Data Room.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Target Business</div>
                    <div className="text-lg font-bold italic uppercase">{request?.listing_title}</div>
                </div>

                {showRejectReason ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/50">Reason for Rejection (Optional)</label>
                            <textarea
                                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all min-h-[100px] font-medium"
                                placeholder="e.g. Buyer profile doesn't meet requirements..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="flex-1 text-white hover:bg-white/10 font-bold uppercase text-[10px]"
                                onClick={() => setShowRejectReason(false)}
                            >Cancel</Button>
                            <Button
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[10px] shadow-lg"
                                onClick={() => handleDecision('REJECTED')}
                                disabled={isProcessing}
                            >Confirm Reject</Button>
                        </div>
                    </div>
                ) : request?.status === 'APPROVED' ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <span className="text-xs font-bold text-green-100 uppercase">Access is currently active</span>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full text-red-400 hover:bg-red-400/10 font-black uppercase tracking-widest h-12 rounded-2xl transition-all"
                            onClick={async () => {
                                if (confirm("Are you sure you want to revoke this buyer's access?")) {
                                    setIsProcessing(true);
                                    try {
                                        await api.post(`/ndas/requests/${id}/revoke`, {});
                                        alert("Access revoked successfully.");
                                        router.push("/dashboard/seller/access-requests");
                                    } catch (e) {
                                        alert("Failed to revoke access");
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }
                            }}
                            disabled={isProcessing}
                        >
                            Revoke Access
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Button
                            className="w-full bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-accent/20 transition-all cursor-pointer active:scale-95 text-lg italic"
                            onClick={() => handleDecision('APPROVED')}
                            disabled={isProcessing || request?.status === 'REJECTED' || request?.status === 'REVOKED'}
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 mr-2" /> Approve Access</>}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-white/40 hover:text-red-400 hover:bg-red-400/10 font-black uppercase tracking-widest h-12 rounded-2xl transition-all"
                            onClick={() => setShowRejectReason(true)}
                            disabled={isProcessing || request?.status === 'REJECTED' || request?.status === 'REVOKED'}
                        >
                            <X className="w-4 h-4 mr-2" /> Reject Request
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-8 pt-0 flex justify-center">
                <p className="text-[9px] text-center text-white/30 uppercase font-black tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Audit Trail Logged
                </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
