"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfferModal } from "@/components/marketplace/offer-modal";
import { NDAModal } from "@/components/marketplace/nda-modal";
import { ShareModal } from "@/components/modals/share-modal";
import { AIFinancialModal } from "@/components/modals/ai-financial-modal";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  MapPin,
  DollarSign,
  BarChart3,
  Users,
  Globe,
  MessageSquare,
  FileText,
  Heart,
  Share2,
  Lock,
  Zap,
  Bot,
  Sparkles,
  Loader2,
  ExternalLink,
  Info,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

import { useRouter } from "next/navigation";

import { ConfirmModal } from "@/components/modals/confirm-modal";

import { formatDistanceToNow } from "date-fns";

export default function ListingDetailPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const { slug } = params;
  const router = useRouter();

  const [listing, setListing] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [nda, setNda] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isNDAModalOpen, setIsNDAModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            // 1. Fetch Listing by slug
            const foundListing = await api.get(`/marketplace/by-slug/${slug}`);

            if (!foundListing) {
                router.push("/404");
                return;
            }

            setListing(foundListing);

            // 2. Fetch NDA and Access status
            const statusData = await api.get(`/ndas/listing/${foundListing.id}`);
            setNda(statusData);

            // 3. Fetch Documents (API will filter based on access status)
            const docsData = await api.get(`/documents/listings/${foundListing.id}`);
            setDocuments(docsData);

            // 4. Fetch User info for NDA prefill
            try {
                const userData = await api.get("/auth/me");
                setUser(userData);
            } catch (e) {
                // Not logged in or failed to fetch user
            }

        } catch (e) {
            console.error("Failed to fetch listing data");
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [slug, router]);

  const handleRequestAccess = async () => {
    if (!nda?.is_signed) {
        setIsNDAModalOpen(true);
    } else if (nda?.request_status === 'PENDING_SELLER_REVIEW') {
        alert("Your request is currently being reviewed by the seller.");
    } else if (nda?.request_status === 'REJECTED') {
        alert("Your access request was declined by the seller.");
    } else {
        alert("Access already granted. Check documents below.");
    }
  };

  const handleNDASuccess = async () => {
    try {
        // Refresh NDA and Docs
        const [statusData, docsData] = await Promise.all([
            api.get(`/ndas/listing/${listing.id}`),
            api.get(`/documents/listings/${listing.id}`)
        ]);
        setNda(statusData);
        setDocuments(docsData);
    } catch (e) {
        console.error("Failed to refresh after NDA signing");
    }
  };

  const handleContactSeller = async () => {
    setIsStartingChat(true);
    try {
        const conversation = await api.post(`/messages/conversations?listing_id=${listing.id}`, {});
        router.push(`/dashboard/buyer/messages?id=${conversation.id}`);
    } catch (e) {
        console.error("Failed to start conversation");
        router.push("/login");
    } finally {
        setIsStartingChat(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/buyers/saved-listings/${listing.id}`);
      } else {
        await api.post(`/buyers/saved-listings?listing_id=${listing.id}`, {});
      }
      setIsSaved(!isSaved);
    } catch (e) {
      console.error("Failed to save listing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    setIsAIModalOpen(true);
    setIsAIAnalyzing(true);
    try {
        const data = await api.post(`/ai-broker/listings/${listing.id}/analyze`, {});
        setAiAnalysis(data);
    } catch (e) {
        console.error("Failed to run AI analysis");
    } finally {
        setIsAIAnalyzing(false);
    }
  };

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState("");

  const submitFeedback = async () => {
    try {
        await api.post(`/feedback/listing/${listing.id}/rejection-feedback`, {
            reason: feedbackReason,
            notes: "Declined via automated UI"
        });
        alert("Feedback submitted. Thank you.");
        setShowFeedbackModal(false);
    } catch (e) {
        alert("Failed to submit feedback.");
    }
  };

  if (isLoading || !listing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": listing.title,
    "description": listing.description,
    "offers": {
      "@type": "Offer",
      "price": listing.askingPrice,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  const metrics = [
    { label: "Revenue", value: formatCurrency(Number(listing.business?.annual_revenue || 0)), icon: DollarSign },
    { label: "Profit", value: formatCurrency(Number(listing.business?.annual_profit || 0)), icon: TrendingUp },
    { label: "Traffic", value: (listing.business?.monthly_traffic || 0).toLocaleString(), icon: Globe },
    { label: "Team Size", value: listing.business?.team_size?.toString() || "0", icon: Users },
  ];

  return (
    <div className="container py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header / Hero */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase font-black text-[10px]">{listing.category?.name || "General"}</Badge>
            {listing.is_verified && (
              <Badge className="bg-green-500 hover:bg-green-600 border-none font-black text-[10px] uppercase">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-primary uppercase italic">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {listing.business?.established_date ? formatDistanceToNow(new Date(listing.business.established_date)) : "Unknown age"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {listing.business?.location || "Remote"}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-accent" />
              Multiple: 3.2x
            </span>
            {listing.status === 'PUBLISHED' && (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vetted Listing
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-end">
          <div className="text-right hidden lg:block">
            <div className="text-3xl font-black text-accent italic">
                {listing.sale_type === 'AUCTION' ? formatCurrency(Number(listing.current_bid || listing.starting_price)) : formatCurrency(Number(listing.asking_price))}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                {listing.sale_type === 'AUCTION' ? `Current Bid (${listing.bid_count} bids)` : "Asking Price"}
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="flex-1 lg:w-48">
              {listing.sale_type === 'AUCTION' ? (
                <Button
                    className="w-full bg-accent hover:bg-accent/90 border-none text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-xl shadow-accent/20 transition-all cursor-pointer active:scale-95 italic"
                    onClick={() => {
                        const amount = prompt(`Enter your bid (Min: ${formatCurrency(Number(listing.current_bid || listing.starting_price) + 100)})`);
                        if (amount) {
                            api.post(`/listings/${listing.id}/bid`, { amount: Number(amount) })
                                .then(() => {
                                    alert("Bid placed!");
                                    window.location.reload();
                                })
                                .catch(err => alert(err.message));
                        }
                    }}
                >
                    Place Bid
                </Button>
              ) : (
                <OfferModal
                    listingTitle={listing.title}
                    askingPrice={Number(listing.asking_price)}
                    listingId={listing.id}
                    sellerId={listing.seller_id}
                    isBuyNow={listing.sale_type === 'BUY_NOW'}
                />
              )}
            </div>
            <Button
                size="lg"
                variant="outline"
                className="flex-1 lg:w-48 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl border-2 hover:bg-secondary transition-all cursor-pointer group"
                onClick={handleContactSeller}
                disabled={isStartingChat}
            >
              {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2 text-accent group-hover:rotate-12 transition-transform" />}
              Contact Seller
            </Button>
          </div>
          <div className="flex gap-2 w-full">
            <motion.div whileTap={{ scale: 0.9 }} className="flex-1">
                <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "w-full font-bold text-[10px] uppercase tracking-widest h-10 hover:bg-accent/5 transition-all cursor-pointer",
                    isSaved && "text-accent bg-accent/5"
                )}
                onClick={handleSave}
                disabled={isSaving}
                >
                <Heart className={cn("w-4 h-4 mr-2", isSaved && "fill-current animate-in zoom-in duration-300")} />
                {isSaving ? "..." : isSaved ? "Saved" : "Save"}
                </Button>
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 font-bold text-[10px] uppercase tracking-widest h-10 hover:bg-accent/5 transition-all cursor-pointer"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button
              className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-primary/10 transition-all cursor-pointer group"
              onClick={handleRunAIAnalysis}
          >
              <Bot className="w-4 h-4 mr-2 text-accent group-hover:animate-bounce" />
              Run Financial Deep-Scan
          </Button>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={listing.title}
        />

        <NDAModal
            isOpen={isNDAModalOpen}
            onClose={() => setIsNDAModalOpen(false)}
            listingId={listing.id}
            listingTitle={listing.title}
            userName={user?.full_name || ""}
            userEmail={user?.email || ""}
            onSuccess={handleNDASuccess}
        />

        <AIFinancialModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            analysis={aiAnalysis}
            isLoading={isAIAnalyzing}
        />

        <ConfirmModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            onConfirm={submitFeedback}
            title="Why are you passing?"
            description="Help the seller improve their listing and the marketplace by providing a reason for declining this opportunity."
            confirmText="Submit Feedback"
        >
            <div className="grid grid-cols-1 gap-2 mt-4">
                {["valuation_too_high", "revenue_too_low", "churn_too_high", "traffic_concerns", "industry_mismatch"].map(r => (
                    <Button
                        key={r}
                        variant={feedbackReason === r ? 'default' : 'outline'}
                        size="sm"
                        className="justify-start text-[10px] font-black uppercase h-10 rounded-xl"
                        onClick={() => setFeedbackReason(r)}
                    >
                        {r.replace(/_/g, ' ')}
                    </Button>
                ))}
            </div>
        </ConfirmModal>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {/* Overview Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-black text-primary mb-4 uppercase italic">Business Overview.</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-line font-medium italic">
              {listing.description}
            </div>
          </motion.section>

          {/* Financial Performance Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-black text-primary mb-6 text-center lg:text-left uppercase italic">Financial Performance.</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="rounded-3xl border-none shadow-sm bg-secondary/10">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Verified Revenue (LTM)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-2xl font-black text-primary italic">{formatCurrency(Number(listing.verified_revenue || listing.business?.annual_revenue || 0))}</div>
                  <p className="text-[9px] text-green-600 font-black uppercase flex items-center mt-2 tracking-tighter">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connect Verification Active
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-sm bg-secondary/10">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Operating Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-2xl font-black text-primary italic">{formatCurrency(Number(listing.verified_expenses || 0))}</div>
                  <p className="text-[9px] text-muted-foreground font-black uppercase flex items-center mt-2 tracking-tighter">
                    <ShieldCheck className="w-3 h-3 mr-1 text-accent" />
                    P&L Normalization
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-xl bg-primary text-white col-span-full lg:col-span-1">
                <CardHeader className="pb-2 p-6">
                  <CardTitle className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    Normalized Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-3xl font-black text-accent italic">{formatCurrency(Number(listing.normalized_profit || listing.business?.annual_profit || 0))}</div>
                  <p className="text-[9px] text-white/40 font-black uppercase flex items-center mt-2 tracking-tighter">
                    <Zap className="w-3 h-3 mr-1 text-accent animate-pulse" />
                    Vetted Listing Value
                  </p>
                </CardContent>
              </Card>
            </div>

            {listing.normalized_profit && (
                <div className="mt-8 space-y-6">
                    <div className="p-8 rounded-3xl bg-accent/5 border border-accent/10 flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2">
                                <Info className="w-6 h-6 text-accent" />
                                <h4 className="text-sm font-black text-primary uppercase italic tracking-tight">Vetting & Normalization Intel.</h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed italic font-medium">
                                Business Bridge AI has audited the financial claims to include inferred institutional costs. This represents the true acquisition yield under professional management.
                            </p>
                        </div>
                        <div className="w-full md:w-64 space-y-3">
                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Institutional Adjustments</div>
                            {listing.expense_breakdown && Object.entries(listing.expense_breakdown).map(([cat, val]) => (
                                <div key={cat} className="flex justify-between items-center text-[10px] font-bold text-primary italic uppercase tracking-tighter">
                                    <span className="opacity-40">{cat}</span>
                                    <span>{formatCurrency(Number(val))}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
          </motion.section>

          {/* Key Metrics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-black text-primary mb-6 text-center lg:text-left uppercase italic">Acquisition Metrics.</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {metrics.map((metric, i) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                    <Card className="border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all h-full">
                    <CardContent className="pt-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-accent mb-3 transition-colors group-hover:bg-accent group-hover:text-white">
                        <metric.icon className="h-5 w-5" />
                        </div>
                        <div className="text-xl font-black text-primary italic">{metric.value}</div>
                        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                        {metric.label}
                        </div>
                    </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-black text-primary mb-6 uppercase italic">Operational Intel.</h2>
            <div className="grid gap-6 sm:grid-cols-2">
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6 relative overflow-hidden">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Exact Website URL</div>
                    {nda?.request_status === 'APPROVED' ? (
                        <a href={listing.business?.website_url} target="_blank" className="text-xl font-bold text-accent underline flex items-center gap-2">
                            {listing.business?.website_url} <ExternalLink className="w-4 h-4" />
                        </a>
                    ) : (
                        <div className="flex items-center gap-3 text-muted-foreground opacity-30">
                            <Lock className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase italic tracking-tighter">Locked Institutional Data</span>
                        </div>
                    )}
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Traffic Channel Mix</div>
                    {nda?.request_status === 'APPROVED' ? (
                         <div className="space-y-2">
                            {['Search (65%)', 'Direct (20%)', 'Social (15%)'].map(t => (
                                <div key={t} className="text-sm font-bold text-primary italic uppercase tracking-tighter">{t}</div>
                            ))}
                         </div>
                    ) : (
                        <div className="flex items-center gap-3 text-muted-foreground opacity-30">
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase italic tracking-tighter">NDA Required</span>
                        </div>
                    )}
                </Card>
            </div>
          </motion.section>

          {/* Included Assets */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-black text-primary mb-6 uppercase italic">Included in Sale.</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {(listing.included_assets || [
                "Primary Domain & Brand",
                "Source Code & Infrastructure",
                "Customer Database",
                "Operating Procedures",
                "Marketing Assets"
              ]).map((asset: any, i: number) => (
                <motion.li
                    key={asset}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-2 text-muted-foreground font-medium italic"
                >
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                  <span>{asset}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl rounded-3xl">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Lock className="w-24 h-24 text-accent" />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic">
                 <Zap className="h-4 w-4 text-accent animate-pulse" />
                 Acquisition Data Room
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6 relative z-10">
              <p className="text-xs text-primary-foreground/60 leading-relaxed font-medium italic">
                Authorized buyers can access P&L statements, traffic reports, and other sensitive documents after signing the institutional NDA.
              </p>

              {nda?.request_status === 'APPROVED' ? (
                <div className="space-y-3">
                    {documents.length > 0 ? documents.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                        >
                            <Button
                                variant="outline"
                                className="w-full justify-between text-white border-white/10 bg-white/5 hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl group transition-all cursor-pointer"
                                onClick={async () => {
                                    try {
                                        const res = await api.get(`/documents/${doc.id}/download`);
                                        window.open(res.download_url, '_blank');
                                    } catch (e) {
                                        alert("Failed to generate download link");
                                    }
                                }}
                            >
                                <div className="flex items-center">
                                    <FileText className="w-4 h-4 mr-3 text-accent" />
                                    <span className="truncate max-w-[150px]">{doc.title}</span>
                                </div>
                                <span className="text-[8px] opacity-40 font-black">{(doc.file_size / 1024 / 1024).toFixed(1)}MB</span>
                            </Button>
                        </motion.div>
                    )) : (
                        <p className="text-[10px] text-center text-white/40 uppercase font-black italic">No confidential documents uploaded.</p>
                    )}
                </div>
              ) : (
                <div className="space-y-6">
                    <div className="space-y-3 opacity-40 grayscale pointer-events-none">
                        <Button variant="outline" className="w-full justify-start text-white border-white/10 bg-white/5 font-bold text-[10px] uppercase tracking-widest h-11 rounded-xl">
                            <FileText className="w-4 h-4 mr-3 text-accent" />
                            View P&L Statements
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-white border-white/10 bg-white/5 font-bold text-[10px] uppercase tracking-widest h-11 rounded-xl">
                            <BarChart3 className="w-4 h-4 mr-3 text-accent" />
                            Traffic Analytics
                        </Button>
                    </div>

                    {nda?.request_status === 'PENDING_SELLER_REVIEW' ? (
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent">
                                <Clock className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-white">Pending Approval</p>
                                <p className="text-[10px] text-white/40 font-medium italic">The seller is reviewing your signed NDA.</p>
                            </div>
                        </div>
                    ) : nda?.request_status === 'REJECTED' ? (
                        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
                             <Lock className="w-6 h-6 text-destructive mx-auto" />
                             <p className="text-xs font-black uppercase text-destructive">Access Declined</p>
                             <p className="text-[10px] text-white/60 font-medium italic">Your request was not approved by the seller.</p>
                        </div>
                    ) : (
                        <Button
                            className="w-full bg-accent hover:bg-accent/90 border-none text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-xl shadow-accent/20 transition-all cursor-pointer active:scale-95 italic"
                            onClick={handleRequestAccess}
                        >
                            {nda?.is_signed ? "Awaiting Seller Review" : "Request Data Room Access"}
                        </Button>
                    )}
                </div>
              )}

              {nda?.request_status === 'APPROVED' && (
                  <div className="pt-4 border-t border-white/10">
                      <Button
                        variant="ghost"
                        className="w-full text-[10px] font-black uppercase text-white/40 hover:text-white/60"
                        onClick={() => setShowFeedbackModal(true)}
                      >
                          Pass on this Deal
                      </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-secondary/10 border-b p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Seller Identity</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center text-3xl font-black text-primary italic shadow-inner">
                JD
              </div>
              <div>
                <div className="font-black text-xl text-primary italic uppercase leading-none">John Doe</div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-2">Verified Seller Since 2023</div>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="text-[8px] font-black uppercase px-2 py-0.5">5 Sales</Badge>
                <Badge variant="secondary" className="text-[8px] font-black uppercase px-2 py-0.5">4.9 Rating</Badge>
              </div>
              <Button asChild variant="ghost" className="w-full text-accent hover:text-accent/90 hover:bg-accent/5 font-black uppercase text-[10px] tracking-widest h-11 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-accent/10">
                <Link href={`/sellers/${listing.sellerId}`}>
                    View Seller Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
