"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Lock, FileText, Loader2, ArrowLeft, ArrowRight, PenTool, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function NDASigningPage({ params: paramsPromise }: { params: Promise<{ listingId: string }> }) {
  const params = use(paramsPromise);
  const { listingId } = params;
  const router = useRouter();

  const [listing, setListing] = useState<any>(null);
  const [nda, setNda] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
        setSignatureData(prev => ({ ...prev, content: canvasRef.current!.toDataURL() }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(prev => ({ ...prev, content: "" }));
  };

  const [step, setStep] = useState(1); // 1: Review, 2: Sign, 3: Confirmation

  const [acknowledgements, setAcknowledgements] = useState<Record<string, boolean>>({
    read: false,
    bound: false,
    approval: false
  });

  const [signatureData, setSignatureData] = useState({
    name: "",
    email: "",
    company: "",
    type: "TYPED", // "TYPED" or "DRAWN"
    content: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.get(`/ndas/listing/${listingId}`);
        setNda(data.nda);
        setStatus(data.request_status);

        // Fetch listing basic info
        const marketplaceData = await api.get(`/marketplace?search=${listingId}`);
        const found = marketplaceData.items.find((l: any) => l.id === listingId);
        setListing(found);

        if (data.request_status === 'NDA_SIGNED' || data.request_status === 'PENDING_SELLER_REVIEW' || data.request_status === 'APPROVED') {
            setStep(3);
        }
      } catch (e) {
        console.error("Failed to fetch NDA data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [listingId]);

  const handleSignSubmit = async () => {
    setIsSigning(true);
    try {
      await api.post(`/ndas/listing/${listingId}/sign`, {
        full_legal_name: signatureData.name,
        email: signatureData.email,
        company: signatureData.company,
        signature_data: signatureData.content || signatureData.name,
        signature_type: signatureData.type
      });
      setStep(3);
      setStatus("PENDING_SELLER_REVIEW");
    } catch (e) {
      alert("Failed to submit signature");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg shadow-sm" />
                <h1 className="text-2xl font-black italic uppercase text-primary">Business <span className="text-accent">Bridge</span></h1>
            </div>
            <Button variant="ghost" onClick={() => router.back()} className="font-bold text-xs uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
            </Button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="bg-primary text-white p-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-accent" />
                                <div className="space-y-1">
                                    <Badge variant="outline" className="text-white border-white/20 uppercase font-black text-[10px] tracking-widest">NDA Secure Agreement</Badge>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Version 2.4.0 • {new Date().toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</div>
                                <Badge className="bg-accent text-white border-none uppercase font-black text-[8px] tracking-widest">Awaiting Signature</Badge>
                            </div>
                        </div>
                        <CardTitle className="text-4xl font-black uppercase italic leading-tight mb-6">Confidentiality & <span className="text-accent">Non-Disclosure</span> Agreement</CardTitle>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                            <div className="space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Business</div>
                                <div className="text-xs font-bold uppercase truncate">{listing?.title}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Seller</div>
                                <div className="text-xs font-bold uppercase">Business Bridge Verified Seller</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Buyer (Signer)</div>
                                <div className="text-xs font-bold uppercase truncate">{signatureData.name || "Pending..."}</div>
                            </div>
                            <div className="text-right space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Reference</div>
                                <div className="text-xs font-mono opacity-60">#{listingId.split('-')[0].toUpperCase()}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid lg:grid-cols-3">
                            <div className="lg:col-span-1 p-10 bg-secondary/10 border-r space-y-8">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Listing</div>
                                    <div className="font-bold text-primary">{listing?.title}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seller</div>
                                    <div className="font-bold text-primary">Institutional Seller</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreement ID</div>
                                    <div className="font-mono text-xs text-muted-foreground truncate">{listingId.split('-')[0]}...</div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 p-10">
                                <div className="h-[400px] overflow-y-auto pr-6 space-y-6 text-sm text-muted-foreground leading-relaxed font-medium italic custom-scrollbar">
                                    {nda?.content.split('\n').map((para: string, i: number) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t p-10 flex flex-col gap-8">
                        <div className="space-y-4 w-full">
                            {[
                                { id: 'read', label: "I confirm that I have read and understood the Confidentiality and Non-Disclosure Agreement." },
                                { id: 'bound', label: "I agree to be legally bound by the terms of this agreement." },
                                { id: 'approval', label: "I understand that signing the NDA does not automatically give me access to confidential information. Access is subject to seller approval." }
                            ].map((item) => (
                                <label key={item.id} className="flex items-start gap-4 cursor-pointer group">
                                    <div className={cn(
                                        "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                        acknowledgements[item.id as keyof typeof acknowledgements] ? "bg-accent border-accent text-white" : "border-slate-300 group-hover:border-accent"
                                    )}>
                                        {acknowledgements[item.id as keyof typeof acknowledgements] && <CheckCircle2 className="w-4 h-4" />}
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={acknowledgements[item.id as keyof typeof acknowledgements]}
                                            onChange={() => setAcknowledgements(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-primary/80 group-hover:text-primary transition-colors">{item.label}</span>
                                </label>
                            ))}
                        </div>
                        <Button
                            size="xl"
                            className="w-full bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl"
                            disabled={!acknowledgements.read || !acknowledgements.bound || !acknowledgements.approval}
                            onClick={() => setStep(2)}
                        >
                            Proceed to Signing <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="sign" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
                    <CardHeader className="p-10 border-b">
                        <CardTitle className="text-3xl font-black uppercase italic text-primary">Finalize Digital Signature</CardTitle>
                        <CardDescription className="text-lg font-medium text-muted-foreground mt-2">Enter your legal identity details to sign the agreement.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-10">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</label>
                                <Input
                                    className="h-14 rounded-2xl border-2 font-bold text-lg"
                                    placeholder="John Fitzgerald Doe"
                                    value={signatureData.name}
                                    onChange={(e) => setSignatureData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                                <Input
                                    className="h-14 rounded-2xl border-2 font-bold text-lg"
                                    placeholder="john@doe.com"
                                    value={signatureData.email}
                                    onChange={(e) => setSignatureData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Signature</label>
                                <div className="flex gap-2 bg-secondary/20 p-1 rounded-lg">
                                    <Button
                                        variant={signatureData.type === 'TYPED' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-[10px] uppercase font-black px-4 rounded-md"
                                        onClick={() => setSignatureData(prev => ({ ...prev, type: 'TYPED' }))}
                                    >
                                        <Type className="w-3.5 h-3.5 mr-2" /> Type
                                    </Button>
                                    <Button
                                        variant={signatureData.type === 'DRAWN' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-8 text-[10px] uppercase font-black px-4 rounded-md"
                                        onClick={() => setSignatureData(prev => ({ ...prev, type: 'DRAWN' }))}
                                    >
                                        <PenTool className="w-3.5 h-3.5 mr-2" /> Draw
                                    </Button>
                                </div>
                            </div>

                            <div className="h-48 w-full border-2 border-dashed rounded-3xl flex items-center justify-center bg-slate-50 relative group overflow-hidden">
                                {signatureData.type === 'TYPED' ? (
                                    <div className="text-5xl font-signature text-primary opacity-80 select-none px-8 text-center italic">
                                        {signatureData.name || "Your Signature"}
                                    </div>
                                ) : (
                                    <canvas
                                        ref={canvasRef}
                                        width={800}
                                        height={200}
                                        className="w-full h-full cursor-crosshair touch-none"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    className="absolute bottom-4 right-4 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={signatureData.type === 'TYPED' ? () => setSignatureData(prev => ({ ...prev, name: "" })) : clearCanvas}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 flex gap-4">
                            <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">"By signing electronically, I confirm that I agree to the terms of this agreement and understand that this signature is legally binding."</p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-4">
                        <Button
                            size="xl"
                            variant="ghost"
                            className="flex-1 font-black uppercase text-xs"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </Button>
                        <Button
                            size="xl"
                            className="flex-[2] bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20"
                            onClick={handleSignSubmit}
                            disabled={!signatureData.name || !signatureData.email || isSigning}
                        >
                            {isSigning ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign & Submit NDA"}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white text-center py-20 px-10">
                    <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-500/10 mb-8">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-4xl font-black uppercase italic text-primary">NDA Signed Successfully</CardTitle>
                        <CardDescription className="text-xl font-medium text-muted-foreground max-w-lg mx-auto">Your non-disclosure agreement has been submitted to the seller for review.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-w-md mx-auto my-10 bg-slate-50 p-8 rounded-3xl border space-y-6">
                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Listing</span>
                            <span className="font-bold text-primary">{listing?.title}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Signer</span>
                            <span className="font-bold text-primary">{signatureData.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Status</span>
                            <div className="flex items-center gap-2 text-accent font-black uppercase text-[10px]">
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                Awaiting Seller Approval
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6 items-center">
                        <p className="text-xs text-muted-foreground italic max-w-sm">"Signing the NDA does not grant immediate access. You will receive a notification when the seller approves your request."</p>
                        <Button
                            size="xl"
                            className="bg-primary text-white font-black uppercase tracking-widest px-12 rounded-2xl shadow-xl"
                            onClick={() => router.push(`/businesses/${listing?.slug || listingId}`)}
                        >
                            Return to Listing
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
