"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Gavel,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Search,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AuctionsPage() {
  const auctions = [
    {
      id: "1",
      title: "Premium AI Domain Portfolio",
      category: "Domains",
      currentBid: "$12,500",
      reserveMet: true,
      timeRemaining: "2h 45m",
      bidCount: 42,
      isHot: true
    },
    {
      id: "2",
      title: "Profitable Shopify Dropshipping Site",
      category: "Ecommerce",
      currentBid: "$4,200",
      reserveMet: false,
      timeRemaining: "1d 12h",
      bidCount: 18,
      isHot: false
    },
    {
      id: "3",
      title: "iOS Habit Tracker (Source Code)",
      category: "App Assets",
      currentBid: "$1,850",
      reserveMet: true,
      timeRemaining: "4h 12m",
      bidCount: 29,
      isHot: true
    },
  ];

  return (
    <div className="container py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Badge className="bg-accent text-white border-none mb-4 px-3 py-1 font-black uppercase tracking-tighter">Live Auctions</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">The Fast Lane</h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Acquire high-potential digital assets in real-time. Secure, verified, and transparent bidding.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="h-12 border-primary/20">
            How it Works
          </Button>
          <Button size="lg" className="h-12 bg-primary text-primary-foreground border-none px-8 font-bold">
            List Asset for Auction
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <Card key={auction.id} className="group overflow-hidden border-secondary shadow-sm hover:shadow-2xl transition-all">
            <div className="h-48 bg-muted relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] uppercase font-black">
                  {auction.category}
                </Badge>
                <div className="text-right">
                  <div className="text-xs text-white/70 font-bold uppercase tracking-widest">Current Bid</div>
                  <div className="text-2xl font-black text-accent drop-shadow-lg">{auction.currentBid}</div>
                </div>
              </div>
              {auction.isHot && (
                <div className="absolute top-4 right-4 animate-bounce">
                  <Badge className="bg-red-500 border-none text-white font-black text-[10px]">🔥 HOT</Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <CardTitle className="text-xl font-black text-primary leading-tight group-hover:text-accent transition-colors">
                {auction.title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {auction.timeRemaining}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  {auction.bidCount} Bids
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="bg-secondary/30 p-4 rounded-xl space-y-3 border border-secondary">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Reserve Price</span>
                  <span className={auction.reserveMet ? "text-green-600" : "text-amber-600"}>
                    {auction.reserveMet ? "MET" : "NOT MET"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div className={cn(
                    "h-full transition-all",
                    auction.reserveMet ? "bg-green-500 w-full" : "bg-amber-500 w-[65%]"
                  )} />
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-primary p-6 gap-3">
              <Input placeholder="Enter Bid..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10 rounded-xl font-bold" />
              <Button className="bg-accent hover:bg-accent/90 border-none text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-accent/20">
                Bid
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl flex items-start gap-6 shadow-sm">
        <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg">
          <Gavel className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-primary">Auction House Rules</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            All bids on Business Bridge are binding. Buyers must have a verified payment method on file to participate. If the reserve price is met, the highest bidder at the end of the auction enters a protected transaction state immediately.
          </p>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Escrow Protected
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <TrendingUp className="w-4 h-4 text-accent" />
              Real-time Bidding
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
