"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Landmark, DollarSign, Wallet, ArrowUpRight, History, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { motion } from "framer-motion";

export default function SellerPayoutsPage() {
  const [payoutDetails, setPayoutDetails] = useState({
    account_holder: "",
    bank_name: "",
    account_number: "",
    routing_number: "",
    swift_code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [balance, setBalance] = useState({ pending: 0, available: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [systemError, setSystemError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayoutData() {
        setIsLoading(true);
        try {
            const [balanceData, historyData] = await Promise.all([
                api.get("/payouts/balance"),
                api.get("/payouts/history")
            ]);
            setBalance(balanceData);
            setHistory(historyData);
        } catch (e) {
            console.error("Failed to fetch payout data");
            setSystemError("Unable to connect to financial provider.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchPayoutData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await api.post("/payouts/settings", payoutDetails);
        alert("Payout details updated successfully.");
    } catch (e) {
        alert("Failed to save payout details.");
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-primary uppercase italic">Payout <span className="text-accent">Center.</span></h1>
        <p className="text-muted-foreground font-medium">Manage your earnings, bank details, and withdrawal history.</p>
        {systemError && (
            <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black uppercase text-accent tracking-widest">{systemError}</span>
            </div>
        )}
      </div>

      {/* Balance Grid */}
      <div className="grid gap-6 md:grid-cols-2">
         <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                <Wallet className="w-24 h-24" />
            </div>
            <CardContent className="p-8 space-y-6">
                <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Available for Withdrawal</div>
                    <div className="text-5xl font-black italic">${(balance.available || 0).toLocaleString()}</div>
                </div>
                <Button className="bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest h-12 px-8">
                    Request Payout
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
         </Card>

         <Card className="bg-secondary/20 border-none shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <History className="w-24 h-24" />
            </div>
            <CardContent className="p-8 space-y-6">
                <div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Escrow / Pending Funds</div>
                    <div className="text-5xl font-black italic text-primary">${(balance.pending || 0).toLocaleString()}</div>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Funds are held in secure escrow until asset transfer is confirmed.</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Payout Method Form */}
         <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-secondary/10 border-b p-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Bank Account Details</CardTitle>
                        <CardDescription className="text-xs font-medium">Standard wire transfer (SWIFT/ACH) information.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Account Holder Name</label>
                        <Input
                            value={payoutDetails.account_holder}
                            onChange={(e) => setPayoutDetails({...payoutDetails, account_holder: e.target.value})}
                            placeholder="Full Legal Name"
                            className="font-bold h-12 border-2 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Bank Name</label>
                        <Input
                            value={payoutDetails.bank_name}
                            onChange={(e) => setPayoutDetails({...payoutDetails, bank_name: e.target.value})}
                            placeholder="e.g. JPMorgan Chase"
                            className="font-bold h-12 border-2 rounded-xl"
                        />
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Account Number / IBAN</label>
                        <Input
                            value={payoutDetails.account_number}
                            onChange={(e) => setPayoutDetails({...payoutDetails, account_number: e.target.value})}
                            placeholder="Enter account number"
                            className="font-bold h-12 border-2 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Routing Number / Sort Code</label>
                        <Input
                            value={payoutDetails.routing_number}
                            onChange={(e) => setPayoutDetails({...payoutDetails, routing_number: e.target.value})}
                            placeholder="Enter routing number"
                            className="font-bold h-12 border-2 rounded-xl"
                        />
                    </div>
                </div>
                <div className="space-y-2 max-w-xs">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">SWIFT / BIC Code</label>
                    <Input
                        value={payoutDetails.swift_code}
                        onChange={(e) => setPayoutDetails({...payoutDetails, swift_code: e.target.value})}
                        placeholder="Required for international transfers"
                        className="font-bold h-12 border-2 rounded-xl"
                    />
                </div>
            </CardContent>
            <CardFooter className="bg-secondary/5 border-t p-6 flex justify-end">
                <Button
                    className="bg-primary text-white font-black uppercase tracking-widest h-12 px-10 rounded-xl shadow-lg"
                    onClick={handleSave}
                    loading={isSaving}
                >
                    Update Payout Method
                </Button>
            </CardFooter>
         </Card>

         <div className="space-y-6">
            <Card className="bg-accent/5 border-accent/20 rounded-[2rem] overflow-hidden shadow-sm">
                <CardHeader className="p-6 pb-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-accent" />
                        <CardTitle className="text-sm font-bold uppercase">Institutional Security</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                        "Your bank details are encrypted using bank-grade AES-256 security. Payouts are manually audited by our compliance team to ensure anti-money laundering (AML) protocols."
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-secondary/10 p-6 border-b">
                    <CardTitle className="text-sm font-bold uppercase italic">Recent Payouts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {history.length > 0 ? history.map((tx, i) => (
                            <div key={i} className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-primary italic">{tx.date}</div>
                                    <div className="text-[8px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">{tx.status}</div>
                                </div>
                                <div className="text-lg font-black italic text-primary">${tx.amount.toLocaleString()}</div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-xs text-muted-foreground italic font-medium">No payouts recorded yet.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
