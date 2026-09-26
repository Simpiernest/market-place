"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  Edit3,
  ArrowLeft,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  ChevronRight,
  Briefcase,
  TrendingUp,
  FileText,
  CheckCircle2,
  Lock,
  Building,
  CreditCard,
  Eye,
  Zap,
  Target,
  Search,
  DollarSign,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

export default function BuyerProfilePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Acquisition Criteria", "Proof of Funds", "Verification", "Activity", "Reviews"];

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    saved_listings: 0,
    active_offers: 0,
    buyer_standing: 50,
    buyer_tier: "BASIC"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
        setIsLoading(true);
        setLoadError(false);
        try {
            const [userData, statsData] = await Promise.all([
                api.get("/auth/me").catch(() => null),
                api.get("/buyers/dashboard").catch(() => ({}))
            ]);

            if (!userData) {
                setLoadError(true);
                return;
            }

            setUser(userData);
            setStats({
                saved_listings: statsData?.saved || 0,
                active_offers: statsData?.offers || 0,
                buyer_standing: statsData?.standing || 50,
                buyer_tier: statsData?.tier || "BASIC"
            });
        } catch (e) {
            console.error("Profile data fetch failed:", e);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    }
    fetchProfileData();
  }, []);

  const getInitials = (name: any) => {
    if (!name || typeof name !== 'string') return "MM";
    try {
        const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
        if (parts.length === 0) return "MM";
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch (e) {
        return "MM";
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (loadError || !user) {
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic">Profile Load Failed</h3>
                <p className="text-sm text-muted-foreground max-w-xs">We couldn't synchronize your profile data. Please ensure you are logged in and try again.</p>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-primary text-white">Retry Connection</Button>
        </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="text-muted-foreground font-bold hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
            </Button>
          </Link>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center gap-8">
           <div className="relative">
              <div className="h-32 w-32 rounded-3xl bg-secondary flex items-center justify-center text-4xl font-black text-primary italic shadow-inner overflow-hidden border-4 border-white shadow-xl">
                 {user?.avatar_url && user.avatar_url.startsWith('http') ? (
                    <Image src={user.avatar_url} alt="Avatar" fill className="object-cover" />
                 ) : (
                    <span>{user ? getInitials(user.full_name) : "MM"}</span>
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center shadow-lg">
                 <ShieldCheck className="w-4 h-4 text-white" />
              </div>
           </div>
           <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                 <h1 className="text-3xl font-black text-primary uppercase italic">{user?.full_name || "Michael Mensah"}</h1>
                 <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
              </div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Acquisition Entrepreneur</div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground justify-center sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  Accra, Ghana
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Member since Jan 2024
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium italic max-w-md">"I acquire profitable online businesses and digital assets. Focused on SaaS, eCommerce, and content businesses with strong growth potential."</p>
           </div>
        </div>

        <div className="flex flex-col gap-6 lg:items-end">
           <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl border-2 font-black uppercase text-[10px] tracking-widest h-10 px-6">
                 <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl border-2 h-10 w-10">
                 <MoreHorizontal className="w-4 h-4" />
              </Button>
           </div>
           <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-secondary/50">
                <div className="text-right">
                    <div className="flex items-center gap-1 text-accent font-black text-lg justify-end">
                        4.9 <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">(18 reviews)</div>
                </div>
                <div className="h-10 w-[1px] bg-secondary" />
                <Badge className="bg-blue-600 text-white border-none font-black uppercase text-[10px] h-8 px-4 rounded-lg">
                    Verified Buyer
                </Badge>
           </div>
        </div>
      </div>

      {/* Profile Stats Mini-Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: "Saved Listings", value: stats.saved_listings, icon: Heart },
              { label: "Active Offers", value: stats.active_offers, icon: Briefcase },
              { label: "Buyer Standing", value: stats.buyer_standing, icon: ShieldCheck },
              { label: "Buyer Tier", value: stats.buyer_tier, icon: TrendingUp },
          ].map(stat => (
              <Card key={stat.label} className="border-none shadow-sm bg-white rounded-3xl">
                  <CardContent className="p-6 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                          <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                          <div className="text-xl font-black text-primary italic leading-none">{stat.value}</div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      {/* Tabs Section */}
      <div className="space-y-8 pb-20">
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                        activeTab === tab ? "text-accent" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    {tab}
                    {activeTab === tab && (
                        <motion.div layoutId="profile-tab-buyer" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
                    )}
                </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
                <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                >
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Verification List */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Buyer Verification</CardTitle>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Fully Verified
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                {[
                                    { label: "Identity Verification", status: "Verified • Jan 2024" },
                                    { label: "Proof of Funds", status: "Verified • Jan 2024" },
                                    { label: "Address Verification", status: "Verified • Jan 2024" },
                                    { label: "Phone Verification", status: "Verified • Jan 2024" },
                                    { label: "Bank Account Verification", status: "Verified • Jan 2024" },
                                    { label: "Tax Information", status: "Verified • Mar 2024" },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-xs font-bold text-primary">{item.label}</div>
                                            <div className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{item.status}</div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-accent font-black uppercase text-[10px] h-10 mt-4 bg-accent/5 rounded-xl">View Verification Details</Button>
                            </CardContent>
                        </Card>

                        {/* About Me & Investment Focus */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">About Me</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                                    "I'm an acquisition entrepreneur based in Ghana, focused on buying and scaling profitable online businesses. I invest in SaaS, eCommerce, content and digital assets with strong growth potential."
                                </p>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Investment Focus</div>
                                    <div className="flex flex-wrap gap-2">
                                        {["SaaS", "E-commerce", "Content", "Websites", "Digital Products", "YouTube Channels"].map(focus => (
                                            <Badge key={focus} variant="secondary" className="bg-slate-100 text-primary border-none uppercase font-black text-[9px] px-3 py-1 rounded-lg">
                                                {focus}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Why I Buy</div>
                                    <div className="space-y-2">
                                        {[
                                            "Profitable & sustainable businesses",
                                            "Strong growth potential",
                                            "Scalable business models",
                                            "Solid existing revenue"
                                        ].map(reason => (
                                            <div key={reason} className="flex items-center gap-2 text-[10px] font-bold text-primary italic">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Email</div>
                                            <div className="text-sm font-bold text-primary">{user?.email || "michael@businessbridge.com"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Phone</div>
                                            <div className="text-sm font-bold text-primary">+233 244 567 890</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Location</div>
                                            <div className="text-sm font-bold text-primary">Accra, Ghana</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Website</div>
                                            <div className="text-sm font-bold text-accent underline">https://michaelmensah.com</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    {[Linkedin, Twitter, Instagram, Facebook].map((Icon, i) => (
                                        <Button key={i} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-secondary hover:bg-accent hover:text-white transition-all">
                                            <Icon className="w-4 h-4" />
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Acquisition Criteria */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Acquisition Criteria</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                {[
                                    { label: "Business Types", value: "SaaS, E-commerce, Content, Websites", icon: Building },
                                    { label: "Revenue Range", value: "$50K - $5M / year", icon: TrendingUp },
                                    { label: "Asking Price Range", value: "$50K - $2M", icon: DollarSign },
                                    { label: "Location Preference", value: "Global (Africa, Europe, US)", icon: Globe },
                                    { label: "Timeframe", value: "Within 3-12 months", icon: Clock },
                                ].map(item => (
                                    <div key={item.label} className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</div>
                                            <div className="text-xs font-bold text-primary uppercase leading-tight mt-0.5">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl mt-4">View Full Criteria</Button>
                            </CardContent>
                        </Card>

                        {/* Proof of Funds */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Proof of Funds</CardTitle>
                                <Badge className="bg-green-500 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div>
                                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Available Capital</div>
                                    <div className="text-3xl font-black text-primary italic">$500,000+</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Proof Documents</div>
                                    {[
                                        { label: "Bank Statement", status: "Verified" },
                                        { label: "Investment Portfolio", status: "Verified" },
                                        { label: "Letter from Bank", status: "Verified" },
                                    ].map(doc => (
                                        <div key={doc.label} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-secondary/50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-accent" />
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{doc.label}</span>
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[7px] uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                <CheckCircle2 className="w-2 h-2" /> {doc.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full text-accent font-black uppercase text-[10px] h-10 mt-4 bg-accent/5 rounded-xl">View Documents</Button>
                            </CardContent>
                        </Card>

                        {/* Financial Information */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Financial Information</CardTitle>
                                <Badge className="bg-green-500 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="space-y-1">
                                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Source of Funds</div>
                                    <div className="text-xs font-bold text-primary italic uppercase leading-relaxed">Personal Savings & Investments</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Preferred Payment Method</div>
                                    <div className="text-xs font-bold text-primary italic uppercase leading-relaxed">Escrow / Wire Transfer / Crypto (in some cases)</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Additional Notes</div>
                                    <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                                        Funds are available and ready for qualified opportunities. Pre-approval for deals up to $2M.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl mt-4">Edit Financial Information</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lower Sections for Buyer */}
                    <div className="grid lg:grid-cols-3 gap-8 pb-12">
                        {/* My Activity */}
                        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">My Activity</CardTitle>
                                <Link href="/dashboard/buyer/activity" className="text-[10px] font-black uppercase text-accent hover:underline decoration-2 underline-offset-4 cursor-pointer">View All</Link>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                {[
                                    { title: "Made an offer on SaaS Platform - AI Writing Tool", amount: "$250,000", time: "2 days ago", icon: DollarSign, color: "bg-accent" },
                                    { title: "Saved listing - E-commerce Store - Fashion", time: "3 days ago", icon: Heart, color: "bg-red-500" },
                                    { title: "Sent a message to seller", detail: "Regarding website listing", time: "4 days ago", icon: MessageSquare, color: "bg-green-500" },
                                    { title: "Updated acquisition criteria", detail: "Added new industry preference", time: "5 days ago", icon: Target, color: "bg-blue-500" },
                                ].map((act, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {i < 3 && <div className="absolute left-4 top-10 bottom-[-1.5rem] w-[1px] bg-slate-100" />}
                                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg", act.color)}>
                                            <act.icon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1 pt-1">
                                            <div className="text-[10px] font-bold text-primary leading-tight">{act.title}</div>
                                            {act.amount && <div className="text-[9px] font-black text-accent uppercase tracking-tighter">{act.amount}</div>}
                                            {act.detail && <div className="text-[9px] text-muted-foreground font-medium italic">{act.detail}</div>}
                                            <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest pt-1">{act.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Deal Pipeline Placeholder */}
                        <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Deal Pipeline</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-8 pt-0 flex flex-col justify-center items-center">
                                <div className="relative h-48 w-48 mb-8">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="125.6" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226.08" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-4xl font-black text-primary italic leading-none">6</div>
                                        <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Active Deals</div>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    {[
                                        { label: "In Due Diligence", value: 2, color: "bg-blue-500" },
                                        { label: "Negotiation", value: 2, color: "bg-green-500" },
                                        { label: "Offer Submitted", value: 1, color: "bg-amber-500" },
                                        { label: "Closed", value: 1, color: "bg-slate-300" },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-center text-[9px] font-bold">
                                            <div className="flex items-center gap-2 uppercase tracking-tighter">
                                                <div className={cn("h-2 w-2 rounded-full", item.color)} />
                                                <span className="text-muted-foreground">{item.label}</span>
                                            </div>
                                            <span className="text-primary italic">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Reviews Section for Buyer */}
                    <div className="space-y-6 pb-12">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-primary uppercase italic">Recent Reviews</h2>
                            <Link href="/dashboard/buyer/reviews" className="text-[10px] font-black uppercase text-accent hover:underline decoration-2 underline-offset-4 cursor-pointer">View All</Link>
                        </div>
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8">
                            <div className="flex items-start gap-6">
                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black italic">
                                    {user ? getInitials(user.full_name) : "MM"}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-primary">Sarah Johnson</div>
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Seller</div>
                                        </div>
                                        <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">May 12, 2024</div>
                                    </div>
                                    <div className="flex gap-1 text-amber-500">
                                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                                        "{user?.full_name?.split(' ')[0] || 'Michael'} is professional, responsive and serious about closing deals. Highly recommended!"
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
