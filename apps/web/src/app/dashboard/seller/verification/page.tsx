"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  TrendingUp,
  User,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { motion } from "framer-motion";

export default function VerificationPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCases() {
      setIsLoading(true);
      try {
        const data = await api.get("/verification");
        setCases(data);
      } catch (e) {
        console.error("Failed to fetch verification cases");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCases();
  }, []);

  const handleUpload = async (type: string) => {
    // 1. Create case if it doesn't exist
    setIsUploading(type);
    try {
        let existingCase = cases.find(c => c.verification_type === type);
        if (!existingCase) {
            try {
                // Explicitly ensuring we hit the correct URL
                existingCase = await api.post("/verification", {
                    verification_type: type,
                    status: 'PENDING'
                });
                setCases(prev => [...prev, existingCase]);
            } catch (postErr: any) {
                console.error("API Post failed:", postErr);
                alert(`Network Error: Ensure your Backend API is running on port 8000.`);
                return;
            }
        }

        // 2. Trigger file input (Simulated for this demo)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await api.upload(`/verification/${existingCase.id}/documents?document_type=${type}_proof`, formData);

                if (res) {
                    alert(`${type.toUpperCase()} documents submitted for review.`);
                    // Refresh cases
                    const updated = await api.get("/verification");
                    setCases(updated);
                }
            } catch (err: any) {
                console.error("Upload failed:", err);
                alert(`Upload failed: ${err.message || "Unknown error"}`);
            }
        };
        fileInput.click();

    } catch (e) {
        alert("Failed to initiate verification.");
    } finally {
        setIsUploading(null);
    }
  };

  const steps = [
    { id: "identity", title: "Identity Verification", desc: "Government-issued ID or passport.", icon: User },
    { id: "business", title: "Business Ownership", desc: "Domain ownership proof or registration docs.", icon: Briefcase },
    { id: "revenue", title: "Revenue Verification", desc: "Stripe, PayPal, or bank statement exports.", icon: TrendingUp },
    { id: "traffic", title: "Traffic Verification", desc: "Google Analytics or search console access.", icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary uppercase italic">Trust & <span className="text-accent">Verification.</span></h1>
        <p className="text-muted-foreground font-medium">Verified listings receive <span className="text-primary font-bold">4x more engagement</span> from serious institutional buyers.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {steps.map((step) => {
            const caseData = cases.find(c => c.verification_type === step.id);
            const status = caseData?.status || 'NOT_STARTED';

            return (
              <Card key={step.id} className={cn(
                "border-none shadow-sm transition-all overflow-hidden",
                status === 'APPROVED' ? "bg-secondary/10" : "bg-white"
              )}>
                <div className={cn(
                  "h-1",
                  status === 'APPROVED' ? "bg-green-500" :
                  status === 'UNDER_REVIEW' ? "bg-yellow-500" :
                  "bg-slate-200"
                )} />
                <CardContent className="p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        status === 'APPROVED' ? "bg-green-500/10 text-green-600" :
                        status === 'UNDER_REVIEW' ? "bg-yellow-500/10 text-yellow-600" :
                        "bg-secondary text-muted-foreground"
                      )}>
                        <step.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-primary uppercase italic">{step.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{step.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          status === 'APPROVED' ? "text-green-600" :
                          status === 'UNDER_REVIEW' ? "text-yellow-600" :
                          "text-muted-foreground"
                        )}>
                          {status.replace('_', ' ')}
                        </div>
                        {status === 'APPROVED' && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tighter">Identity Verified</div>
                        )}
                      </div>

                      {status === 'NOT_STARTED' || status === 'REJECTED' ? (
                        <Button
                            onClick={() => handleUpload(step.id)}
                            disabled={isUploading === step.id}
                            className="bg-primary text-white border-none font-black uppercase text-[10px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-primary/10 hover:bg-accent transition-all cursor-pointer"
                        >
                          {isUploading === step.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                        </Button>
                      ) : status === 'APPROVED' ? (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-11 w-11 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20"
                        >
                            <CheckCircle2 className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-lg">Why get verified?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-primary-foreground/80">
              {[
                  'Earn the "Verified" badge on your listings',
                  "Appear higher in search results",
                  "Attract institutional and professional buyers",
                  "Build immediate trust with prospect acquisitions"
              ].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <p>{text}</p>
                  </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <CardTitle className="text-sm">Important Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Business Bridge uses encrypted storage for all verification documents. Documents are only visible to authorized compliance reviewers and are deleted after verification is complete.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
