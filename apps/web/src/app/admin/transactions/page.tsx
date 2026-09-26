"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShieldCheck, ArrowRight, History, Search, Filter, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const transactions = [
    { id: "TRX-9283", buyer: "Alice S.", seller: "John D.", asset: "Cloud SaaS", amount: "$125,000", status: "Escrow Funded", date: "Today" },
    { id: "TRX-9282", buyer: "Venture Corp", seller: "Sarah J.", asset: "Ecommerce Site", amount: "$850,000", status: "Inspection", date: "Yesterday" },
    { id: "TRX-9281", buyer: "Mike R.", seller: "Bob W.", asset: "Tooling Kit", amount: "$12,000", status: "Completed", date: "2 days ago" },
    { id: "TRX-9280", buyer: "Dan T.", seller: "Eve L.", asset: "Content Site", amount: "$45,000", status: "Disputed", date: "3 days ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Transaction <span className="text-accent">Ledger.</span></h1>
          <p className="text-muted-foreground font-medium">Monitor global deal flow and escrow security.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="font-bold">Payouts History</Button>
           <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8">Audit Full Ledger</Button>
        </div>
      </div>

      <div className="grid gap-6">
         {transactions.map(trx => (
           <Card key={trx.id} className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <CardContent className="p-0 flex items-center">
                 <div className={cn(
                    "w-2 self-stretch shrink-0",
                    trx.status === 'Completed' ? "bg-green-500" :
                    trx.status === 'Disputed' ? "bg-destructive" :
                    "bg-accent"
                 )} />
                 <div className="p-6 flex-1 grid sm:grid-cols-2 lg:grid-cols-5 gap-8 items-center">
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{trx.id}</div>
                       <h3 className="text-sm font-black text-primary uppercase">{trx.asset}</h3>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{trx.date}</div>
                    </div>

                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Parties</div>
                       <div className="text-xs font-bold text-primary flex items-center gap-2">
                          {trx.buyer}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          {trx.seller}
                       </div>
                    </div>

                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Value</div>
                       <div className="text-xl font-black text-primary italic">{trx.amount}</div>
                    </div>

                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</div>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                             "h-1.5 w-1.5 rounded-full",
                             trx.status === 'Completed' ? "bg-green-500" :
                             trx.status === 'Disputed' ? "bg-destructive" : "bg-accent"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{trx.status}</span>
                       </div>
                    </div>

                    <div className="flex justify-end gap-2">
                       <Button variant="outline" size="sm" className="font-bold h-9">Details</Button>
                       {trx.status === 'Disputed' && (
                         <Button size="sm" variant="destructive" className="font-black uppercase text-[10px] tracking-widest h-9 px-4">Resolve</Button>
                       )}
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
