"use client";

import { useState } from "react";
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
  Clock,
  Target,
  Trophy,
  ShieldCheck,
  Fingerprint,
  Mail,
  Linkedin,
  FileUp,
  Loader2,
  Zap,
  Building2,
  TrendingUp,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api } from "@/lib/api-client";

export default function BuyerOnboardingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Profile
    fullName: "",
    buyerType: "INDIVIDUAL",
    location: "",
    // Step 3: Professional
    corporateEmail: "",
    linkedin: "",
    // Step 4: Intent
    budgetMin: "",
    budgetMax: "",
    industries: [] as string[],
    businessTypes: [] as string[],
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = async () => {
    setIsLoading(true);
    try {
      if (step === 1) {
        await api.patch("/users/me/profile", {
          full_name: formData.fullName,
          country: formData.location,
        });
        await api.post("/buyers/me", {
          buyer_type: formData.buyerType,
        });
      } else if (step === 2) {
        await api.post("/verification/cases", {
          verification_type: "IDENTITY",
          subject_type: "USER",
          subject_id: "me",
        });
      } else if (step === 4) {
        await api.post("/buyers/me/mandate", {
          budget_min: Number(formData.budgetMin),
          budget_max: Number(formData.budgetMax),
          industries: formData.industries,
          business_types: formData.businessTypes,
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
    { title: "Profile", description: "Basic information" },
    { title: "Identity", description: "Verify who you are" },
    { title: "Professional", description: "Verify credentials" },
    { title: "Buyer Intent", description: "Acquisition criteria" },
    { title: "Proof of Funds", description: "Capital verification" },
  ];

  const industries = ["SaaS", "Ecommerce", "AI", "Mobile App", "Content", "Agency", "Newsletter"];
  const businessTypes = ["Subscription", "Direct Sales", "Ad Revenue", "Marketplace"];

  const toggleIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  return (
    <div className="container py-12 max-w-4xl min-h-[calc(100vh-100px)]">
      {/* Progress Header */}
      <div className="mb-12 space-y-4">
         <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Buyer Onboarding</span>
            <span>Step {step} of {totalSteps}</span>
         </div>
         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full flex-1 transition-all duration-500 ease-out border-r border-background last:border-0",
                  i + 1 <= step ? "bg-accent" : "bg-secondary"
                )}
              />
            ))}
         </div>
         <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <div key={i} className={cn(
                "hidden md:block text-[9px] font-bold uppercase text-center w-32",
                i + 1 === step ? "text-accent" : "text-muted-foreground"
              )}>
                {s.title}
              </div>
            ))}
         </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden min-h-[500px] flex flex-col border-t-4 border-accent">
        <CardHeader className="bg-secondary/10 border-b p-8">
           <CardTitle className="text-2xl font-black text-primary uppercase italic flex items-center gap-3">
              {step === 1 && <User className="w-6 h-6 text-accent" />}
              {step === 2 && <Fingerprint className="w-6 h-6 text-accent" />}
              {step === 3 && <Briefcase className="w-6 h-6 text-accent" />}
              {step === 4 && <Target className="w-6 h-6 text-accent" />}
              {step === 5 && <ShieldCheck className="w-6 h-6 text-accent" />}
              {steps[step - 1].title}
           </CardTitle>
           <CardDescription className="text-muted-foreground font-medium mt-2">
              {steps[step - 1].description}
           </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 p-8 py-10">
           {step === 1 && (
             <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Full Name</label>
                      <Input value={formData.fullName} onChange={e => updateFormData({ fullName: e.target.value })} placeholder="Jane Doe" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Location</label>
                      <Input value={formData.location} onChange={e => updateFormData({ location: e.target.value })} placeholder="San Francisco, CA" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Buyer Type</label>
                   <div className="grid grid-cols-2 gap-2">
                      {["INDIVIDUAL", "INSTITUTIONAL", "STRATEGIC", "FAMILY_OFFICE"].map(type => (
                        <Button
                          key={type}
                          variant={formData.buyerType === type ? "default" : "outline"}
                          onClick={() => updateFormData({ buyerType: type })}
                          className="text-[10px] font-bold"
                          size="sm"
                        >
                          {type}
                        </Button>
                      ))}
                   </div>
                </div>
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex gap-3">
                   <Target className="h-5 w-5 text-accent shrink-0" />
                   <p className="text-xs text-muted-foreground font-medium italic">Accurate profile information helps us surface high-quality deals that match your background.</p>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-8 text-center py-4">
                <div className="mx-auto h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-xl shadow-accent/5">
                   <ShieldCheck className="h-12 w-12" />
                </div>
                <div className="max-w-md mx-auto space-y-4">
                   <h3 className="text-xl font-bold text-primary">Identity Verification</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">To protect sellers and maintain a secure deal-making environment, we require all buyers to complete a one-time KYC check.</p>
                   <Button className="w-full bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-accent/20">
                      Start Verification
                      <ArrowRight className="ml-2 w-4 h-4" />
                   </Button>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Corporate Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="email" value={formData.corporateEmail} onChange={e => updateFormData({ corporateEmail: e.target.value })} placeholder="name@firm.com" className="pl-9" />
                   </div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold italic">Using a corporate email increases your credibility with sellers.</p>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">LinkedIn Profile</label>
                   <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input value={formData.linkedin} onChange={e => updateFormData({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" className="pl-9" />
                   </div>
                </div>
                <div className="p-4 bg-secondary/20 rounded-xl border space-y-3">
                   <h5 className="text-[10px] font-black uppercase text-primary tracking-widest">Professional Verification Status</h5>
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">Email: Unverified</Badge>
                      <Badge variant="outline" className="text-[9px]">Social: Pending</Badge>
                   </div>
                </div>
             </div>
           )}

           {step === 4 && (
             <div className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Min Budget</label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                         <Input value={formData.budgetMin} onChange={e => updateFormData({ budgetMin: e.target.value })} placeholder="50,000" className="pl-9" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Max Budget</label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                         <Input value={formData.budgetMax} onChange={e => updateFormData({ budgetMax: e.target.value })} placeholder="5,000,000" className="pl-9" />
                      </div>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Target Industries</label>
                   <div className="flex flex-wrap gap-2">
                      {industries.map(industry => (
                        <Badge
                          key={industry}
                          variant={formData.industries.includes(industry) ? "default" : "outline"}
                          className={cn(
                            "px-3 py-1 cursor-pointer transition-all border-2",
                            formData.industries.includes(industry) ? "bg-accent border-accent text-white" : "hover:border-accent/50"
                          )}
                          onClick={() => toggleIndustry(industry)}
                        >
                          {industry}
                        </Badge>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {step === 5 && (
             <div className="space-y-8">
                <div className="p-8 border-2 border-dashed rounded-3xl bg-accent/5 border-accent/20 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-accent">
                      <FileUp className="w-8 h-8" />
                   </div>
                   <div>
                      <h4 className="font-bold text-primary">Upload Proof of Funds</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2">Submit a bank statement, CPA letter, or brokerage statement to verify your acquisition power.</p>
                   </div>
                   <Button variant="outline" className="border-accent text-accent font-black uppercase text-[10px] tracking-widest">
                      Select Document
                   </Button>
                </div>
                <div className="grid gap-4">
                   <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-primary">Confidentiality Guaranteed</p>
                         <p className="text-[9px] text-muted-foreground italic">Documents are encrypted and only accessible to our compliance team.</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </CardContent>

        <CardFooter className="p-8 bg-secondary/5 border-t mt-auto flex items-center justify-between">
           <Button
             variant="ghost"
             onClick={prevStep}
             disabled={step === 1}
             className="font-bold"
           >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
           </Button>

           {step < totalSteps ? (
             <Button
               onClick={nextStep}
               disabled={isLoading}
               className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest px-8 min-w-[140px]"
             >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
             </Button>
           ) : (
             <Link href="/dashboard/buyer">
                <Button className="bg-primary hover:bg-primary/90 border-none text-white font-black uppercase tracking-widest px-12 shadow-xl shadow-primary/20">
                   Activate Mandate
                   <Trophy className="ml-2 h-4 w-4" />
                </Button>
             </Link>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
