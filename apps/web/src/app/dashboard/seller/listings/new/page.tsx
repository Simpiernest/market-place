"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIListingWizard } from "@/components/seller/ai-listing-wizard";
import { useListingWizard } from "@/hooks/use-listing-wizard";
import {
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  DollarSign,
  BarChart3,
  Briefcase,
  ShieldCheck,
  Zap,
  LayoutGrid,
  TrendingUp,
  FileText,
  AlertCircle,
  Upload,
  Eye,
  Lock,
  Loader2,
  UserCheck,
  Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function NewListingPage() {
  const { data, updateData, nextStep, prevStep, submitListing, isSaving, error: wizardError, currentStep } = useListingWizard();
  const totalSteps = 20;

  const stepsInfo = [
    { title: "Business Basics", desc: "Start with the foundation." },
    { title: "Business Model", desc: "How your business generates value." },
    { title: "Industry", desc: "Where you operate in the market." },
    { title: "Revenue", desc: "Top-line financial performance." },
    { title: "Expenses", desc: "Your operational costs." },
    { title: "Profit", desc: "The bottom line metrics." },
    { title: "Traffic", desc: "Visitors and reach." },
    { title: "Customers", desc: "User base and retention." },
    { title: "Monetization", desc: "Revenue streams breakdown." },
    { title: "Operations", desc: "Running the business day-to-day." },
    { title: "Technology", desc: "Software, stack, and infrastructure." },
    { title: "Growth", desc: "Historical and future potential." },
    { title: "Risks", desc: "Transparency for serious buyers." },
    { title: "Verification", desc: "Vetting requirements." },
    { title: "Media", desc: "Business assets and screenshots." },
    { title: "Documents", desc: "Private data room preparation." },
    { title: "Pricing", desc: "Asking price and terms." },
    { title: "Sale Type", desc: "Bidding or direct purchase." },
    { title: "Listing Preview", desc: "Review the public view." },
    { title: "Confirmation", desc: "Ready for moderation." },
  ];

  const currentStepInfo = stepsInfo[currentStep - 1];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/seller">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">List Your <span className="text-accent">Business.</span></h1>
      </div>

      {wizardError && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-2">
           <AlertCircle className="h-4 w-4" />
           {wizardError}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-4">
        {/* Progress Sidebar */}
        <aside className="hidden lg:block space-y-6">
           <div className="p-6 rounded-3xl bg-secondary/20 border border-secondary space-y-6 sticky top-24">
              <div className="space-y-1">
                 <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Listing Progress</div>
                 <div className="text-2xl font-black text-primary italic">{Math.round((currentStep / totalSteps) * 100)}% <span className="text-xs text-muted-foreground not-italic uppercase font-bold">Done</span></div>
              </div>
              <div className="space-y-3">
                 {stepsInfo.map((s, i) => (
                   <button
                      key={i}
                      onClick={() => updateData({ step: i + 1 })}
                      className="w-full flex items-center gap-3 hover:bg-white/5 p-1 rounded-lg transition-colors text-left outline-none"
                   >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                        currentStep > i + 1 ? "bg-green-500 text-white" :
                        currentStep === i + 1 ? "bg-accent text-white" : "bg-secondary text-muted-foreground"
                      )}>
                        {currentStep > i + 1 ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        currentStep === i + 1 ? "text-primary" : "text-muted-foreground/60"
                      )}>{s.title}</span>
                   </button>
                 ))}
              </div>
           </div>
        </aside>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-2xl border-none min-h-[600px] flex flex-col rounded-[2.5rem]">
            <CardHeader className="bg-secondary/10 border-b p-6 sm:p-8">
               <CardTitle className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">{currentStepInfo.title}</CardTitle>
               <CardDescription className="text-sm font-bold text-muted-foreground mt-1">{currentStepInfo.desc}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 p-6 sm:p-8 py-10 sm:py-12">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentStep}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                 >
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Business Title</label>
                            <Input
                                value={data.title}
                                onChange={(e) => updateData({ title: e.target.value })}
                                placeholder="e.g., TechFlow Analytics"
                                className="h-12 text-lg font-bold"
                            />
                            </div>
                            <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Catchy Tagline</label>
                            <Input
                                value={data.tagline}
                                onChange={(e) => updateData({ tagline: e.target.value })}
                                placeholder="The future of B2B data streaming."
                            />
                            </div>
                            <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detailed Description</label>
                            <Textarea
                                value={data.description}
                                onChange={(e) => updateData({ description: e.target.value })}
                                className="min-h-[150px]"
                                placeholder="Describe your business model, operations, and value proposition..."
                            />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Business Model</label>
                            <div className="grid grid-cols-2 gap-4">
                                {["SaaS", "Ecommerce", "Mobile App", "Content/Website"].map(model => (
                                    <button
                                        key={model}
                                        onClick={() => updateData({ business_model: model })}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 text-left transition-all",
                                            data.business_model === model ? "border-accent bg-accent/5" : "border-secondary hover:border-accent/30"
                                        )}
                                    >
                                        <div className="font-bold text-primary uppercase text-sm">{model}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium mt-1">Institutional Grade Model</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Primary Industry</label>
                            <div className="grid grid-cols-2 gap-4">
                                {["Technology", "Finance", "Healthcare", "Education", "Marketing", "Real Estate"].map(industry => (
                                    <button
                                        key={industry}
                                        onClick={() => updateData({ industry: industry })}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all",
                                            data.industry === industry ? "border-accent bg-accent/5" : "border-secondary hover:border-accent/30"
                                        )}
                                    >
                                        <div className="font-bold text-primary text-xs uppercase">{industry}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Avg. Monthly Revenue (LTM)</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                        <Input
                                            type="number"
                                            value={data.revenue}
                                            onChange={(e) => updateData({ revenue: Number(e.target.value) })}
                                            placeholder="0.00"
                                            className="pl-10 h-12 font-bold text-lg rounded-xl border-2"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenue Currency</label>
                                    <div className="flex gap-2">
                                        {["USD", "GHS", "EUR"].map(cur => (
                                            <Button
                                                key={cur}
                                                variant="outline"
                                                onClick={() => updateData({ currency: cur })}
                                                className={cn("h-10 px-6 rounded-lg font-bold", data.currency === cur ? "border-accent text-accent bg-accent/5" : "")}
                                            >
                                                {cur}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Avg. Monthly Expenses</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        value={data.expenses}
                                        onChange={(e) => updateData({ expenses: Number(e.target.value) })}
                                        placeholder="0.00"
                                        className="pl-10 h-12 font-bold text-lg rounded-xl border-2"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium italic mt-1">Include hosting, payroll, marketing, and third-party fees.</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-8">
                            <div className="text-center py-10 bg-accent/5 rounded-3xl border-2 border-dashed border-accent/20">
                                <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Calculated Net Monthly Profit</div>
                                <div className="text-5xl font-black text-primary italic">
                                    ${((data.revenue || 0) - (data.expenses || 0)).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 font-medium italic">Based on your provided Revenue and Expense data.</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Website Traffic (MAU)</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="number"
                                    value={data.mau}
                                    onChange={(e) => updateData({ mau: Number(e.target.value) })}
                                    placeholder="0"
                                    className="pl-10 h-12 font-bold text-lg rounded-xl border-2"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 8 && (
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Customers / Subscribers</label>
                            <div className="relative">
                                <UserCheck className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="number"
                                    value={data.customers}
                                    onChange={(e) => updateData({ customers: Number(e.target.value) })}
                                    placeholder="0"
                                    className="pl-10 h-12 font-bold text-lg rounded-xl border-2"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 9 && (
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monetization Model</label>
                            <div className="grid grid-cols-2 gap-4">
                                {["Subscription", "One-time Purchase", "Ads / Sponsorships", "Transaction Fees", "Freemium"].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => updateData({ monetization: m })}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all",
                                            data.monetization === m ? "border-accent bg-accent/5" : "border-secondary hover:border-accent/30"
                                        )}
                                    >
                                        <div className="font-bold text-primary text-xs uppercase">{m}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 10 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Weekly Owner Involvement (Hours)</label>
                                <Input
                                    type="number"
                                    value={data.owner_hours}
                                    onChange={(e) => updateData({ owner_hours: Number(e.target.value) })}
                                    placeholder="e.g., 5"
                                    className="h-12 text-lg font-bold rounded-xl border-2"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 11 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Technology Stack</label>
                                <Textarea
                                    value={data.tech_stack}
                                    onChange={(e) => updateData({ tech_stack: e.target.value })}
                                    placeholder="e.g., Next.js, FastAPI, PostgreSQL, AWS..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Hosting Platform</label>
                                <Input
                                    value={data.hosting}
                                    onChange={(e) => updateData({ hosting: e.target.value })}
                                    placeholder="e.g., Vercel, Heroku, Self-hosted VPS..."
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 12 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Growth Potential & History</label>
                                <Textarea
                                    value={data.growth}
                                    onChange={(e) => updateData({ growth: e.target.value })}
                                    placeholder="Describe your historical growth and untapped opportunities for a buyer..."
                                    className="min-h-[150px]"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 13 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Risks & Challenges</label>
                                <Textarea
                                    value={data.risks}
                                    onChange={(e) => updateData({ risks: e.target.value })}
                                    placeholder="Be transparent about competition, dependencies, or technical debt..."
                                    className="min-h-[150px]"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 14 && (
                        <div className="space-y-8 text-center py-10">
                            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent shadow-xl mb-6">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-2 max-w-sm mx-auto">
                                <h3 className="text-2xl font-black uppercase italic">Vetting Protocol.</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                                    "Verified listings attract 4x more institutional interest. We will guide you through identity and revenue audits in the next stage."
                                </p>
                            </div>
                            <div className="pt-6">
                                <Button onClick={nextStep} className="bg-primary text-white font-black uppercase text-[10px] h-12 px-10 rounded-xl">I Understand</Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 15 && (
                        <div className="space-y-8">
                            <div className="p-12 border-2 border-dashed rounded-3xl text-center space-y-4 bg-secondary/5 border-secondary transition-all hover:bg-secondary/10 cursor-pointer" onClick={() => alert("Opening media upload portal...")}>
                                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent shadow-inner">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-primary">Upload Screenshots & Media</p>
                                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">Drag and drop business assets, logos, or dashboard screenshots.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 16 && (
                        <div className="space-y-6">
                            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 space-y-6 text-center lg:text-left">
                                <div className="flex flex-col lg:flex-row gap-6 items-center">
                                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xl">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase italic">Private Data Room</h3>
                                        <p className="text-sm text-muted-foreground font-medium italic">"Institutional buyers prioritize deals with organized due diligence files."</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">Prepare your P&L statements, tax filings, and legal docs. These will only be visible to buyers after they sign your NDA.</p>
                                <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest" onClick={() => alert("Configuring Deal Room permissions...")}>Setup Data Room Permissions</Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 17 && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Asking Price (USD)</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <Input
                                    type="number"
                                    value={data.asking_price}
                                    onChange={(e) => updateData({ asking_price: Number(e.target.value) })}
                                    placeholder="0.00"
                                    className="pl-10 h-12 font-bold text-2xl rounded-xl border-2"
                                />
                            </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium italic">We recommend running our <Link href="/valuation" className="text-accent underline">Smart Valuation</Link> tool first if you are unsure.</p>
                        </div>
                    )}

                    {currentStep === 18 && (
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Sale Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: "Direct Purchase", desc: "Set a firm price for immediate acquisition." },
                                    { title: "Open Bidding", desc: "Allow buyers to submit competitive offers." }
                                ].map(type => (
                                    <button
                                        key={type.title}
                                        onClick={() => updateData({ sale_type: type.title })}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 text-left transition-all",
                                            data.sale_type === type.title ? "border-accent bg-accent/5" : "border-secondary hover:border-accent/30"
                                        )}
                                    >
                                        <div className="font-bold text-primary uppercase text-sm">{type.title}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter leading-tight">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 19 && (
                        <div className="space-y-10">
                            <div className="p-8 rounded-[2.5rem] bg-white border shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-green-500 text-white uppercase text-[8px]">PREVIEW</Badge>
                                </div>
                                <h3 className="text-3xl font-black text-primary uppercase italic mb-2">{data.title || "Target Business"}</h3>
                                <div className="text-accent font-black text-xl italic mb-6">{data.tagline || "Future-ready digital asset."}</div>
                                <div className="grid grid-cols-3 gap-6 py-6 border-y border-secondary">
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Asking</div>
                                        <div className="text-lg font-black">${Number(data.asking_price || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="text-center border-x">
                                        <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Revenue</div>
                                        <div className="text-lg font-black">${Number(data.revenue || 0).toLocaleString()}/mo</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Profit</div>
                                        <div className="text-lg font-black text-green-600">${(Number(data.revenue || 0) - Number(data.expenses || 0)).toLocaleString()}/mo</div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-8 leading-relaxed italic line-clamp-3">"{data.description || "No description provided."}"</p>
                            </div>
                            <p className="text-center text-[10px] font-black uppercase text-muted-foreground tracking-widest italic animate-pulse">This is a summary of how your listing will appear to buyers.</p>
                        </div>
                    )}

                    {currentStep === 20 && (
                        <div className="text-center py-12 space-y-8">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                className="mx-auto h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shadow-xl shadow-green-500/10"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                            <div className="space-y-4 max-w-md mx-auto">
                            <h3 className="text-3xl font-black uppercase italic">Vetting Ready.</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">Your listing information has been compiled. Our moderation team will scan for financial consistency and verify your identity before publication.</p>
                            </div>
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex gap-4 text-left">
                            <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">By submitting, you agree that Business Bridge can reach out to verify your data via registrar APIs and bank statement audits.</p>
                            </div>
                        </div>
                    )}
                 </motion.div>
               </AnimatePresence>
            </CardContent>

            <CardFooter className="p-6 sm:p-8 bg-secondary/5 border-t mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSaving} className="font-bold h-12 px-8 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-12 px-10 shadow-lg shadow-primary/20 w-full sm:w-auto">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitListing}
                  loading={isSaving}
                  className="bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest h-14 px-12 shadow-2xl shadow-accent/20 w-full sm:w-auto"
                >
                  Submit Listing for Review
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
           <AIListingWizard businessData={data} onApply={(draft) => updateData(draft)} />

           <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Lock className="w-16 h-16" />
              </div>
              <CardHeader>
                 <CardTitle className="text-sm font-black uppercase tracking-widest">Buyer View Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="p-4 bg-white/10 rounded-2xl space-y-4">
                    <div className="h-2 w-2/3 bg-white/20 rounded-full" />
                    <div className="h-2 w-full bg-white/20 rounded-full" />
                    <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                 </div>
                 <Button variant="ghost" className="w-full border border-white/40 text-primary hover:bg-white hover:text-primary font-bold bg-white transition-all">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live Preview
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
