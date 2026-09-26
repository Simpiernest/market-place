"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
    Loader2,
    ArrowLeft,
    DollarSign,
    BadgeCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function BuyerQualificationPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCases() {
      setIsLoading(true);
      try {
        const data = await api.get("/verification");
        // Filtering only buyer-relevant case types if necessary,
        // but typically /verification returns cases for current user.
        setCases(data);
      } catch (e) {
        console.error("Failed to fetch qualification cases");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCases();
  }, []);

  const handleUpload = async (type: string) => {
    setIsUploading(type);
    try {
        let existingCase = cases.find(c => c.verification_type === type);
        if (!existingCase) {
            existingCase = await api.post("/verification", { verification_type: type });
            setCases(prev => [...prev, existingCase]);
        }

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                await api.upload(`/verification/${existingCase.id}/documents?document_type=${type}_proof`, formData);
                alert(`${type.toUpperCase()} evidence submitted for institutional review.`);
                const updated = await api.get("/verification");
                setCases(updated);
            } catch (err) {
                alert("Upload failed.");
            }
        };
        fileInput.click();
    } catch (e) {
        alert("Failed to initiate qualification flow.");
    } finally {
        setIsUploading(null);
    }
  };

  const qualificationSteps = [
    { id: "identity", title: "Identity Verification", desc: "Government ID or Passport.", icon: User },
    { id: "proof_of_funds", title: "Proof of Funds", desc: "Bank statements or brokerage records showing liquidity.", icon: DollarSign },
    { id: "accreditation", title: "Investor Accreditation", desc: "Evidence of high-net-worth or professional status.", icon: BadgeCheck },
    { id: "experience", title: "Acquisition History", desc: "Proof of previous successful closings or M&A background.", icon: Briefcase },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const isFullyQualified = cases.filter(c => c.status === 'APPROVED').length >= 2;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/dashboard/buyer" className="text-[10px] font-black uppercase text-accent flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-primary uppercase italic">Buyer <span className="text-accent">Qualification.</span></h1>
          <p className="text-muted-foreground font-medium">Verify your liquidity and credentials to access premium institutional listings.</p>
        </div>
        {isFullyQualified && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl shadow-green-500/20">
                <ShieldCheck className="w-6 h-6" />
                <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Qualified Buyer Status<br />
                    <span className="text-white/80">Active & Verified</span>
                </div>
            </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {qualificationSteps.map((step) => {
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
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tighter">Verified by Compliance</div>
                        )}
                      </div>

                      {status === 'NOT_STARTED' || status === 'REJECTED' ? (
                        <Button
                            onClick={() => handleUpload(step.id)}
                            loading={isUploading === step.id}
                            className="bg-primary text-white border-none font-black uppercase text-[10px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-primary/10 hover:bg-accent transition-all cursor-pointer"
                        >
                           Submit Evidence
                        </Button>
                      ) : status === 'APPROVED' ? (
                        <div className="h-11 w-11 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
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
          <Card className="bg-primary text-primary-foreground border-none rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-32 h-32 text-accent" />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase italic tracking-tight">Institutional <span className="text-accent">Access.</span></CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-sm text-white/70 leading-relaxed font-medium">
                Sellers of high-value businesses ($1M+ GMV) often require buyers to be "Qualified" before releasing P&L statements.
              </p>
              <div className="space-y-4">
                  {[
                    "Unlock Restricted Financial Data",
                    "Direct Access to Private Listings",
                    "Priority Match Notifications",
                    "Verified Interest Badging"
                  ].map(benefit => (
                    <div key={benefit} className="flex gap-3">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-wider">{benefit}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20 p-8">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-accent" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest">Privacy Guarantee</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                Business Bridge utilizes military-grade encryption for all qualification documents. Sensitive proof of funds is only visible to authorized compliance officers and is never shared with sellers without your explicit approval.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
