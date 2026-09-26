"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check,
  ChevronRight,
  Info,
  X,
  FileText,
  PenTool,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { api } from "@/lib/api-client";

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  userName: string;
  userEmail: string;
  onSuccess?: () => void;
}

export function NDAModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  userName,
  userEmail,
  onSuccess
}: NDAModalProps) {
  const [step, setStep] = useState(1); // 1: Review, 2: Sign, 3: Complete
  const [isSigning, setIsSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  // Sync state when props change
  useEffect(() => {
    if (userName) setFullName(userName);
    if (userEmail) setEmail(userEmail);
  }, [userName, userEmail]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setSignature] = useState(false);

  // Drawing logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(false);
  };

  const handleSign = async () => {
    setIsSigning(true);
    try {
      const signatureData = canvasRef.current?.toDataURL() || fullName;
      await api.post(`/ndas/listing/${listingId}/sign`, {
        full_legal_name: fullName,
        email: email, // Added email field for backend compatibility
        signature_data: signatureData,
        signature_type: hasSignature ? "DRAWN" : "TYPED"
      });
      setStep(3);
      onSuccess?.();
    } catch (e) {
      console.error("Failed to sign NDA", e);
    } finally {
      setIsSigning(false);
    }
  };

  const steps = [
    { id: 1, name: "Review" },
    { id: 2, name: "Sign" },
    { id: 3, name: "Complete" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-white rounded-[1.5rem] shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Sign Non-Disclosure Agreement
              </DialogTitle>
              <p className="text-sm text-slate-500 font-medium">
                {step === 1
                  ? "This NDA protects both you and the seller by keeping sensitive information confidential."
                  : step === 2
                    ? "Please review and sign the NDA to continue."
                    : "Your NDA has been successfully submitted."}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-4 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                    step > s.id
                      ? "bg-blue-600 text-white"
                      : step === s.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  )}>
                    {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    step >= s.id ? "text-slate-900" : "text-slate-400"
                  )}>
                    {s.name}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-[1px] bg-slate-200 flex-1 mx-4" />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <div className="p-8 space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3">
                       <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded" />
                       <span className="text-sm font-black italic uppercase text-slate-900">
                          Business <span className="text-blue-600">Bridge</span>
                       </span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">Non-Disclosure Agreement (NDA)</h3>
                      <div className="text-sm text-slate-600 leading-relaxed space-y-4 font-medium">
                        <p>This Non-Disclosure Agreement ("Agreement") is made between:</p>
                        <ol className="list-decimal list-inside pl-2 space-y-1">
                          <li><strong>Business Bridge Marketplace</strong> (the "Disclosing Party")</li>
                          <li><strong>{fullName}</strong> (the "Receiving Party")</li>
                        </ol>
                        <p>The parties agree to keep confidential all information provided in connection with the business opportunity, including but not limited to financial data, business plans, customer lists, operations, and any other proprietary information.</p>
                        <h4 className="font-bold text-slate-900 pt-2">1. Confidential Information</h4>
                        <p>The Receiving Party agrees not to disclose, copy, or use any confidential information for any purpose other than evaluating the business opportunity.</p>
                        <p>The Receiving Party shall use at least the same degree of care to protect the Confidential Information as it uses to protect its own confidential information of a similar nature, but in no event less than a reasonable degree of care.</p>
                        <p>This Agreement shall remain in effect for a period of two (2) years from the date of disclosure.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-blue-600">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-semibold">You can download a copy of the full NDA after signing.</span>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-8">
                  <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold text-slate-600">
                    Cancel
                  </Button>
                  <Button onClick={() => setStep(2)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold group">
                    Continue to Sign <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-900">Your Signature</label>
                      <p className="text-xs text-slate-500 font-medium italic">Draw your signature in the box below or type your name.</p>
                    </div>
                  </div>

                  <div className="relative border-2 border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-[180px]">
                    <canvas
                      ref={canvasRef}
                      width={634}
                      height={180}
                      className="w-full h-full cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                      Clear
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSignature(false)} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                      Use Typed Signature
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 font-bold text-slate-900"
                      placeholder="Enter your legal name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 font-bold text-slate-900"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <Checkbox
                    id="nda-agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    className="mt-1 border-blue-200 data-[state=checked]:bg-blue-600"
                  />
                  <label htmlFor="nda-agree" className="text-[13px] text-slate-600 font-medium leading-tight">
                    I agree to the terms of the Non-Disclosure Agreement.
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-8">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-12 font-bold text-slate-600">
                    Back
                  </Button>
                  <Button
                    disabled={!agreed || (!hasSignature && !fullName) || isSigning}
                    onClick={handleSign}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {isSigning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Sign NDA"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 uppercase italic">NDA Signed Successfully</h3>
                  <p className="text-slate-500 font-medium max-w-[320px] mx-auto italic">
                    Your request for confidential access has been submitted to the seller for approval.
                  </p>
                </div>
                <div className="pt-6">
                  <Button onClick={onClose} className="w-full sm:w-auto px-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold">
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
