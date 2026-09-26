"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  DollarSign,
  Briefcase,
  Globe,
  TrendingUp,
  Zap,
  Building2,
  ShieldCheck,
  CreditCard,
  Fingerprint,
  FileText,
  Link as LinkIcon,
  Search,
  ExternalLink,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api } from "@/lib/api-client";

export default function SellerOnboardingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: "",
    email: "",
    phone: "",
    country: "",
    accountType: "INDIVIDUAL",
    // Step 3: Business Info
    legalName: "",
    registrationNumber: "",
    taxId: "",
    // Step 4: Profile
    bio: "",
    experience: "",
    linkedin: "",
    // Step 5: Asset Ownership
    domain: "",
    txtRecord: "bb-verify-" + Math.random().toString(36).substring(2, 12),
    // Step 7: Due Diligence
    monthlyRevenue: "",
    monthlyExpenses: "",
    monthlyProfit: "",
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = async () => {
    setIsLoading(true);
    try {
      // Perform backend state transitions based on the current step
      if (step === 1) {
        await api.patch("/auth/me", {
          phone: formData.phone,
          country: formData.country,
        });
      } else if (step === 2) {
        // Identity Verification Request
        await api.post("/verification/cases", {
          verification_type: "IDENTITY",
          subject_type: "USER",
          subject_id: "me",
        });
      } else if (step === 4) {
        // Seller Profile Update
        await api.patch("/auth/me", {
          bio: formData.bio,
          experience: formData.experience,
          linkedin: formData.linkedin,
        });
      } else if (step === 5) {
        // Ownership Verification Request
        await api.post("/verification/cases", {
          verification_type: "BUSINESS_OWNERSHIP",
          subject_type: "ASSET",
          subject_id: formData.domain,
        });
      }

      setStep(s => Math.min(s + 1, totalSteps));
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { title: "Account", description: "Basic contact information" },
    { title: "Identity", description: "Verify your identity" },
    { title: "Business Info", description: "Entity details" },
    { title: "Seller Profile", description: "Professional background" },
    { title: "Asset Ownership", description: "Verify domain ownership" },
    { title: "Financials", description: "Connect data sources" },
    { title: "Due Diligence", description: "Financial metrics" },
    { title: "Review", description: "Admin verification" },
  ];

  return (
    <div className="container py-12 max-w-4xl min-h-[calc(100vh-100px)]">
      {/* Progress Header */}
      <div className="mb-12 space-y-4">
         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Seller Onboarding</span>
            <span>Step {step} of {totalSteps}</span>
         </div>
         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full flex-1 transition-all duration-500 ease-out border-r border-background last:border-0",
                  i + 1 <= step ? "bg-primary" : "bg-secondary"
                )}
              />
            ))}
         </div>
         <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <div key={i} className={cn(
                "hidden md:block text-[9px] font-bold uppercase text-center w-24",
                i + 1 === step ? "text-primary" : "text-muted-foreground"
              )}>
                {s.title}
              </div>
            ))}
         </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden min-h-[550px] flex flex-col border-t-4 border-primary">
        <CardHeader className="bg-secondary/10 border-b p-8">
           <CardTitle className="text-2xl font-black text-primary uppercase italic flex items-center gap-3">
              {step === 1 && <User className="w-6 h-6" />}
              {step === 2 && <Fingerprint className="w-6 h-6" />}
              {step === 3 && <Building2 className="w-6 h-6" />}
              {step === 4 && <Briefcase className="w-6 h-6" />}
              {step === 5 && <Globe className="w-6 h-6" />}
              {step === 6 && <CreditCard className="w-6 h-6" />}
              {step === 7 && <FileText className="w-6 h-6" />}
              {step === 8 && <ShieldCheck className="w-6 h-6" />}
              {steps[step - 1].title}
           </CardTitle>
           <CardDescription className="text-muted-foreground font-medium mt-2">
              {steps[step - 1].description}
           </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 p-8 py-10">
           {step === 1 && (
             <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Full Name</label>
                   <Input value={formData.fullName} onChange={e => updateFormData({ fullName: e.target.value })} placeholder="Alex Thompson" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Email Address</label>
                   <Input type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} placeholder="alex@example.com" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Phone Number</label>
                   <Input value={formData.phone} onChange={e => updateFormData({ phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Country</label>
                   <Input value={formData.country} onChange={e => updateFormData({ country: e.target.value })} placeholder="United States" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Seller Type</label>
                   <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={formData.accountType === "INDIVIDUAL" ? "default" : "outline"}
                        onClick={() => updateFormData({ accountType: "INDIVIDUAL" })}
                        className="font-bold"
                      >
                        Individual
                      </Button>
                      <Button
                        variant={formData.accountType === "COMPANY" ? "default" : "outline"}
                        onClick={() => updateFormData({ accountType: "COMPANY" })}
                        className="font-bold"
                      >
                        Company
                      </Button>
                   </div>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-8 text-center py-4">
                <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <ShieldCheck className="h-12 w-12" />
                </div>
                <div className="max-w-md mx-auto space-y-4">
                   <h3 className="text-xl font-bold text-primary">Secure Identity Verification</h3>
                   <p className="text-sm text-muted-foreground">To maintain the integrity of our marketplace, we require all sellers to verify their identity via our secure partner.</p>
                   <div className="p-6 border-2 border-dashed rounded-2xl bg-secondary/5 space-y-4">
                      <Button className="w-full bg-primary text-white font-bold h-12">
                         Verify with Persona
                         <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Powered by institutional-grade encryption</p>
                   </div>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-6">
                {formData.accountType === "COMPANY" ? (
                  <>
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Legal Business Name</label>
                       <Input value={formData.legalName} onChange={e => updateFormData({ legalName: e.target.value })} placeholder="Acme Digital Holdings LLC" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Registration Number</label>
                         <Input value={formData.registrationNumber} onChange={e => updateFormData({ registrationNumber: e.target.value })} placeholder="LLC-1234567" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Tax ID / EIN</label>
                         <Input value={formData.taxId} onChange={e => updateFormData({ taxId: e.target.value })} placeholder="12-3456789" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">You are registering as an individual. No additional business entity info is required for this step.</p>
                    <Button variant="outline" onClick={() => updateFormData({ accountType: "COMPANY" })}>Switch to Company</Button>
                  </div>
                )}
             </div>
           )}

           {step === 4 && (
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Professional Bio</label>
                   <Textarea
                     value={formData.bio}
                     onChange={e => updateFormData({ bio: e.target.value })}
                     placeholder="Tell buyers about your background in building and growing digital assets..."
                     className="min-h-[120px]"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Experience (Years)</label>
                   <Input type="number" value={formData.experience} onChange={e => updateFormData({ experience: e.target.value })} placeholder="e.g. 10" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">LinkedIn Profile URL</label>
                   <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input value={formData.linkedin} onChange={e => updateFormData({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" className="pl-9" />
                   </div>
                </div>
             </div>
           )}

           {step === 5 && (
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Asset Domain</label>
                   <Input value={formData.domain} onChange={e => updateFormData({ domain: e.target.value })} placeholder="example.com" />
                </div>
                <div className="p-6 bg-slate-950 rounded-xl border border-primary/20 space-y-4">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase text-primary tracking-widest">
                      <span>DNS Verification Record</span>
                      <Badge variant="outline" className="text-primary border-primary/30">TXT</Badge>
                   </div>
                   <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-blue-400 break-all border border-white/5">
                      {formData.txtRecord}
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold">Add this TXT record to your domain's DNS settings to verify ownership. Verification typically takes 2-5 minutes.</p>
                   <Button size="sm" variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                      Check Propagation
                      <Search className="ml-2 w-3 h-3" />
                   </Button>
                </div>
             </div>
           )}

           {step === 6 && (
             <div className="space-y-8 py-4">
                <div className="grid gap-4">
                   <div className="p-6 border-2 rounded-2xl hover:border-primary transition-all cursor-pointer group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                         <div>
                            <h4 className="font-bold text-primary">Stripe Connect</h4>
                            <p className="text-xs text-muted-foreground">Verify revenue and prepare for payouts.</p>
                         </div>
                      </div>
                      <Button size="sm" className="bg-primary group-hover:bg-accent text-white font-black uppercase text-[10px]">Connect</Button>
                   </div>
                   <div className="p-6 border-2 rounded-2xl hover:border-primary transition-all cursor-pointer group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                            <TrendingUp className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-bold text-primary">Google Analytics</h4>
                            <p className="text-xs text-muted-foreground">Automatically verify traffic & engagement.</p>
                         </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-primary text-primary group-hover:bg-primary group-hover:text-white font-black uppercase text-[10px]">Connect</Button>
                   </div>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3">
                   <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                   <p className="text-[10px] text-amber-800 font-bold uppercase leading-tight">Verified data sources significantly increase buyer confidence and listing multiples.</p>
                </div>
             </div>
           )}

           {step === 7 && (
             <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Avg. Monthly Revenue</label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                         <Input value={formData.monthlyRevenue} onChange={e => updateFormData({ monthlyRevenue: e.target.value })} placeholder="0.00" className="pl-9" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Avg. Monthly Expenses</label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                         <Input value={formData.monthlyExpenses} onChange={e => updateFormData({ monthlyExpenses: e.target.value })} placeholder="0.00" className="pl-9" />
                      </div>
                   </div>
                   <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Avg. Monthly Profit</label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                         <Input value={formData.monthlyProfit} onChange={e => updateFormData({ monthlyProfit: e.target.value })} placeholder="0.00" className="pl-9" />
                      </div>
                   </div>
                </div>
                <div className="p-4 bg-secondary/20 rounded-xl border space-y-2">
                   <div className="flex justify-between text-xs font-bold text-primary uppercase">
                      <span>Est. Net Margin</span>
                      <span className="text-accent">
                         {formData.monthlyRevenue && formData.monthlyProfit ?
                           Math.round((Number(formData.monthlyProfit) / Number(formData.monthlyRevenue)) * 100) : 0}%
                      </span>
                   </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${formData.monthlyRevenue && formData.monthlyProfit ? (Number(formData.monthlyProfit) / Number(formData.monthlyRevenue)) * 100 : 0}%` }} />
                   </div>
                </div>
             </div>
           )}

           {step === 8 && (
             <div className="space-y-8 text-center py-8">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 animate-pulse">
                   <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="max-w-md mx-auto space-y-4">
                   <h3 className="text-2xl font-black text-primary uppercase italic">Verification <span className="text-accent">Pending.</span></h3>
                   <p className="text-sm text-muted-foreground leading-relaxed font-medium">Your seller profile has been submitted for institutional review. Our compliance team typically approves accounts within 24-48 hours.</p>
                   <div className="flex justify-center gap-2">
                      <Badge className="bg-blue-500 hover:bg-blue-500">Submitted</Badge>
                      <Badge variant="outline" className="text-muted-foreground">Under Review</Badge>
                      <Badge variant="outline" className="text-muted-foreground">Approved</Badge>
                   </div>
                </div>
             </div>
           )}
        </CardContent>

        <CardFooter className="p-8 bg-secondary/5 border-t mt-auto flex items-center justify-between">
           <Button
             variant="ghost"
             onClick={prevStep}
             disabled={step === 1 || step === totalSteps}
             className="font-bold"
           >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
           </Button>

           {step < totalSteps ? (
             <Button
               onClick={nextStep}
               disabled={isLoading}
               className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 min-w-[140px]"
             >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
             </Button>
           ) : (
             <Link href="/dashboard/seller">
                <Button className="bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest px-12 shadow-xl shadow-accent/20">
                   Go to Dashboard
                   <Zap className="ml-2 h-4 w-4" />
                </Button>
             </Link>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
