"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Star,
  ShieldCheck,
  MapPin,
  MessageSquare,
  TrendingUp,
  Globe,
  Search,
  CheckCircle2,
  Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function BrokersMarketplacePage() {
  const brokers = [
    {
      id: "1",
      name: "Global Acquisitions Ltd.",
      specialty: "SaaS & Mobile Apps",
      trackRecord: "$150M+ Sold",
      rating: "4.9",
      reviews: "124",
      location: "United Kingdom",
      verified: true,
      bio: "Premier M&A advisory firm specializing in high-growth digital assets and SaaS platforms with 15+ years experience."
    },
    {
      id: "2",
      name: "African Tech Brokers",
      specialty: "Marketplaces & Ecommerce",
      trackRecord: "$45M+ Sold",
      rating: "4.8",
      reviews: "68",
      location: "Ghana",
      verified: true,
      bio: "Leading acquisition partner for tech startups across West Africa. We facilitate secure deals in emerging markets."
    },
    {
      id: "3",
      name: "Summit Advisors",
      specialty: "Content Sites & Newsletters",
      trackRecord: "$20M+ Sold",
      rating: "5.0",
      reviews: "42",
      location: "USA",
      verified: true,
      bio: "Boutique brokerage firm focused on content-rich assets and recurring revenue newsletters."
    },
  ];

  return (
    <div className="container py-12 space-y-12">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Broker Marketplace</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Connect with professional acquisition advisors to facilitate your next high-value deal.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Specialty, region, firm name..." className="pl-9 h-11 rounded-xl" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">All Specialties</Button>
          <Button variant="outline" className="flex-1 md:flex-none">Verified Only</Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {brokers.map((broker) => (
          <Card key={broker.id} className="flex flex-col group hover:shadow-xl transition-all border-secondary/50 overflow-hidden">
            <div className="h-3 bg-accent/10 group-hover:bg-accent/30 transition-colors" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center font-bold text-2xl text-primary shadow-inner">
                  {broker.name.split(' ').map(n => n[0]).join('')}
                </div>
                {broker.verified && (
                  <Badge className="bg-green-500 hover:bg-green-600 border-none px-2 py-0.5 font-bold uppercase tracking-tighter text-[9px]">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified Broker
                  </Badge>
                )}
              </div>
              <div className="mt-6">
                <CardTitle className="text-xl font-black group-hover:text-accent transition-colors">{broker.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm font-bold text-accent">
                  <Briefcase className="w-3.5 h-3.5" />
                  {broker.specialty}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {broker.bio}
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-secondary/50">
                <div className="text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Track Record</div>
                  <div className="text-sm font-black text-primary mt-1">{broker.trackRecord}</div>
                </div>
                <div className="text-center border-l border-secondary/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-sm font-black text-primary">{broker.rating}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] text-muted-foreground font-bold">({broker.reviews})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <MapPin className="w-3 h-3" />
                {broker.location}
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/10 flex gap-2 p-6">
              <Button className="flex-1 bg-primary text-primary-foreground border-none font-bold text-xs h-10 group-hover:bg-accent transition-colors">
                Facilitate Deal
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Broker Benefits Section */}
      <Card className="bg-primary text-primary-foreground border-none shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trophy className="w-48 h-48" />
        </div>
        <CardContent className="p-12">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-extrabold mb-4">Why hire a Business Bridge Broker?</h3>
            <div className="grid gap-6 mt-8">
              {[
                { title: "Valuation Accuracy", desc: "Brokers ensure your asking price matches real-time global demand." },
                { title: "Due Diligence Support", desc: "Expert handling of P&L reviews and tax compliance docs." },
                { title: "Higher Closing Rates", desc: "Professionally managed deals have an 82% higher success rate." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-primary-foreground/60 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button size="lg" className="mt-12 bg-accent hover:bg-accent/90 border-none text-white px-10 h-12 font-bold shadow-xl shadow-accent/20">
              Apply to become a Partner Broker
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
