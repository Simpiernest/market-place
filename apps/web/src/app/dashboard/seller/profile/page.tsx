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
  Trash2,
  Heart,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { format } from "date-fns";

export default function SellerProfilePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Listings", "Reviews", "Verification", "Transactions"];

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    active_count: 0,
    sold_count: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        setLoadError(false);
        try {
            const [userData, statsData] = await Promise.all([
                api.get("/auth/me").catch(() => null),
                api.get("/sellers/dashboard").catch(() => ({}))
            ]);

            if (!userData) {
                setLoadError(true);
                return;
            }

            setUser(userData);
            setStats(statsData);
        } catch (e) {
            console.error("Seller profile data fetch failed:", e);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  const getInitials = (name: any) => {
    if (!name || typeof name !== 'string') return "DO";
    try {
        const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
        if (parts.length === 0) return "DO";
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } catch (e) {
        return "DO";
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
                <p className="text-sm text-muted-foreground max-w-xs">We couldn't synchronize your seller profile data. Please ensure you are logged in and try again.</p>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-primary text-white">Retry Connection</Button>
        </div>
    )
  }

  return (
    <div className="space-y-8">
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
                    <span>{user ? getInitials(user.full_name) : "DO"}</span>
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
                 <ShieldCheck className="w-4 h-4 text-white" />
              </div>
           </div>
           <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                 <h1 className="text-3xl font-black text-primary uppercase italic">{user?.full_name || "David Okafor"}</h1>
                 <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
              </div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Business Seller & Digital Asset Owner</div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground justify-center sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  Lagos, Nigeria
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Member since Mar 2023
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium italic max-w-md">"I help entrepreneurs acquire profitable online businesses and digital assets. Specialize in SaaS, eCommerce and content businesses."</p>
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
                        4.8 <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">(12 reviews)</div>
                </div>
                <div className="h-10 w-[1px] bg-secondary" />
                <Badge className="bg-green-500 text-white border-none font-black uppercase text-[10px] h-8 px-4 rounded-lg">
                    Verified Seller
                </Badge>
           </div>
        </div>
      </div>

      {/* Profile Stats Mini-Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: "Active Listings", value: stats?.active_count || 0, icon: Briefcase },
              { label: "Successful Sales", value: stats?.sold_count || 0, icon: TrendingUp },
              { label: "Response Rate", value: "98%", icon: Star },
              { label: "Avg. Response Time", value: "< 2 hours", icon: Clock },
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
      <div className="space-y-8">
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
                        <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
                    )}
                </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                >
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Verification List */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Seller Verification</CardTitle>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Fully Verified
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                {[
                                    { label: "Identity Verification", status: "Verified • Mar 2023" },
                                    { label: "Business Verification", status: "Verified • Mar 2023" },
                                    { label: "Address Verification", status: "Verified • Mar 2023" },
                                    { label: "Phone Verification", status: "Verified • Mar 2023" },
                                    { label: "Bank Account Verification", status: "Verified • Mar 2023" },
                                    { label: "Tax Information", status: "Verified • Mar 2023" },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
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

                        {/* About Me & Skills */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">About Me</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                                    "I'm a serial entrepreneur and digital business operator with 8+ years of experience building and scaling online businesses. I focus on profitable, sustainable businesses with strong growth potential."
                                </p>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                        {["SaaS", "E-commerce", "Content Creation", "Digital Marketing", "SEO", "Business Strategy"].map(skill => (
                                            <Badge key={skill} variant="secondary" className="bg-slate-100 text-primary border-none uppercase font-black text-[9px] px-3 py-1 rounded-lg">
                                                {skill}
                                            </Badge>
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
                                            <div className="text-sm font-bold text-primary">{user?.email || "david@businessbridge.com"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Phone</div>
                                            <div className="text-sm font-bold text-primary">+234 801 234 5678</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Location</div>
                                            <div className="text-sm font-bold text-primary">Lagos, Nigeria</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Website</div>
                                            <div className="text-sm font-bold text-accent underline">https://davidokafor.com</div>
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
                        {/* Business Details */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Business Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                {[
                                    { label: "Business Name", value: "Okafor Digital Ventures" },
                                    { label: "Business Type", value: "SaaS / Digital Products" },
                                    { label: "Registration Number", value: "RC1234567" },
                                    { label: "Country", value: "Nigeria" },
                                    { label: "Years in Business", value: "5+ years" },
                                    { label: "Annual Revenue Range", value: "$100K - $500K" },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{item.label}</span>
                                        <span className="text-xs font-bold text-primary italic uppercase">{item.value}</span>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl mt-4">Edit Business Details</Button>
                            </CardContent>
                        </Card>

                        {/* Banking & Payment */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Banking & Payment</CardTitle>
                                <Badge className="bg-green-500 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                {[
                                    { label: "Bank Name", value: "Access Bank" },
                                    { label: "Account Name", value: "David Okafor" },
                                    { label: "Account Number", value: "0123456789" },
                                    { label: "SWIFT Code", value: "ABNGNGLA" },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center py-2">
                                        <div>
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</div>
                                            <div className="text-sm font-bold text-primary italic uppercase">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl mt-4">View Bank Details</Button>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Documents</CardTitle>
                                <Badge className="bg-green-500 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                {[
                                    { label: "Government ID", status: "Verified" },
                                    { label: "Business Registration", status: "Verified" },
                                    { label: "Proof of Address", status: "Verified" },
                                    { label: "Tax Document", status: "Verified" },
                                    { label: "Bank Statement", status: "Verified" },
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
                                <Button variant="ghost" className="w-full text-accent font-black uppercase text-[10px] h-10 mt-4 bg-accent/5 rounded-xl">View Full Documents</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Featured Listings Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-primary uppercase italic">My Listings</h2>
                            <Link href="/dashboard/seller/listings" className="text-[10px] font-black uppercase text-accent hover:underline decoration-2 underline-offset-4 cursor-pointer">View All</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "SaaS Platform - AI Writing Tool", cat: "SaaS", price: "$250,000", tag: "Featured", views: "1.2k" },
                                { title: "E-commerce Store - Fashion", cat: "E-commerce", price: "$180,000", tag: "Featured", views: "856" },
                                { title: "Website - Niche Blog", cat: "Website", price: "$45,000", views: "432" },
                                { title: "YouTube Channel - Tech", cat: "Content", price: "$75,000", views: "689" },
                            ].map((l, i) => (
                                <Card key={i} className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem] group hover:shadow-2xl transition-all cursor-pointer">
                                    <div className="h-40 bg-slate-100 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                        <div className="absolute inset-0 flex items-center justify-center text-primary/5 font-black uppercase text-3xl select-none">{l.cat}</div>
                                        {l.tag && <Badge className="absolute top-4 left-4 bg-accent text-white border-none font-black text-[8px] uppercase z-20 shadow-lg">Featured</Badge>}
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-primary"><Eye className="w-4 h-4" /></Button>
                                            <div className="flex gap-1.5">
                                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-primary"><Heart className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <div className="text-[8px] font-black uppercase text-accent tracking-widest">{l.cat} • Profitable</div>
                                            <h3 className="font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">{l.title}</h3>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="text-lg font-black text-primary italic">{l.price}</div>
                                            <div className="text-[8px] font-black uppercase text-muted-foreground">Views: {l.views}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Lower Sections */}
                    <div className="grid lg:grid-cols-3 gap-8 pb-12">
                        {/* Recent Activity */}
                        <Card className="lg:col-span-1 border-none shadow-sm bg-white rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                {[
                                    { type: "OFFER", title: "New offer received on SaaS Platform - AI Writing Tool", amount: "$230,000 (from verified buyer)", time: "2 hours ago", color: "bg-accent" },
                                    { type: "LISTING", title: "Listing updated - E-commerce Store - Fashion", detail: "Updated listing details and media", time: "5 hours ago", color: "bg-blue-500" },
                                    { type: "MESSAGE", title: "New message from buyer", detail: "Regarding website listing", time: "1 day ago", color: "bg-green-500" },
                                    { type: "VERIFICATION", title: "Document verified", detail: "Bank statement verified successfully", time: "1 day ago", color: "bg-amber-500" },
                                ].map((act, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {i < 3 && <div className="absolute left-4 top-10 bottom-[-1.5rem] w-[1px] bg-slate-100" />}
                                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg", act.color)}>
                                            {act.type === 'OFFER' ? <DollarSign className="w-4 h-4" /> : act.type === 'LISTING' ? <Edit3 className="w-4 h-4" /> : act.type === 'MESSAGE' ? <MessageSquare className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
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

                        {/* Seller Stats Chart Area */}
                        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Seller Stats</CardTitle>
                                <select className="text-[10px] font-black uppercase tracking-widest bg-secondary/50 border-none rounded-lg px-3 py-1 outline-none">
                                    <option>Last 30 days</option>
                                    <option>Last 90 days</option>
                                </select>
                            </CardHeader>
                            <CardContent className="flex-1 p-8 pt-0 flex flex-col justify-between">
                                <div className="grid grid-cols-3 gap-8 py-8">
                                    <div>
                                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Views</div>
                                        <div className="text-3xl font-black text-primary italic">8,432</div>
                                        <div className="text-[9px] text-green-500 font-black flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-3 h-3" /> +12%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Offers</div>
                                        <div className="text-3xl font-black text-primary italic">24</div>
                                        <div className="text-[9px] text-green-500 font-black flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-3 h-3" /> +20%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Successful Sales</div>
                                        <div className="text-3xl font-black text-primary italic">3</div>
                                        <div className="text-[9px] text-green-500 font-black flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-3 h-3" /> +50%
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder for chart visualization as seen in image */}
                                <div className="flex-1 h-40 bg-accent/[0.03] rounded-3xl border border-accent/5 relative overflow-hidden flex items-end">
                                    <svg viewBox="0 0 400 100" className="w-full h-full text-accent opacity-30 preserve-3d" preserveAspectRatio="none">
                                        <path
                                            d="M0,80 Q50,60 100,75 T200,40 T300,60 T400,20 L400,100 L0,100 Z"
                                            fill="currentColor"
                                            className="animate-in fade-in slide-in-from-bottom duration-1000"
                                        />
                                        <path
                                            d="M0,80 Q50,60 100,75 T200,40 T300,60 T400,20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="animate-in fade-in slide-in-from-left duration-1000"
                                        />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
