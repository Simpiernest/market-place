"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, TrendingUp, Globe, FileText, AlertCircle, ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminVerificationQueuePage() {
  const cases = [
    { id: "V-1209", user: "John Doe", type: "Identity", priority: "High", age: "45m ago", status: "pending" },
    { id: "V-1208", user: "Village Tech", type: "Revenue", priority: "Medium", age: "2h ago", status: "pending" },
    { id: "V-1207", user: "Sarah Smith", type: "Ownership", priority: "Low", age: "1d ago", status: "under_review" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-primary uppercase italic">Verification <span className="text-accent">Queue.</span></h1>
        <p className="text-muted-foreground font-medium">Compliance oversight for users and business listings.</p>
      </div>

      <div className="grid gap-6">
         {cases.map(vCase => (
           <Card key={vCase.id} className="border-none shadow-sm hover:shadow-xl transition-all group cursor-pointer">
              <CardContent className="p-0 flex items-center">
                 <div className="p-6 flex-1 grid sm:grid-cols-4 gap-8 items-center">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors">
                          {vCase.type === 'Identity' && <UserCheck className="h-5 w-5" />}
                          {vCase.type === 'Revenue' && <TrendingUp className="h-5 w-5" />}
                          {vCase.type === 'Ownership' && <Globe className="h-5 w-5" />}
                       </div>
                       <div>
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{vCase.id}</div>
                          <div className="font-bold text-primary uppercase">{vCase.type}</div>
                       </div>
                    </div>

                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">User / Entity</div>
                       <div className="text-sm font-bold text-primary">{vCase.user}</div>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="space-y-1">
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Priority</div>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase border-none px-2",
                            vCase.priority === 'High' ? "bg-red-50 text-red-600" :
                            vCase.priority === 'Medium' ? "bg-amber-50 text-amber-600" :
                            "bg-secondary text-muted-foreground"
                          )}>{vCase.priority}</Badge>
                       </div>
                       <div className="space-y-1">
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</div>
                          <div className="text-xs font-bold text-primary uppercase tracking-tighter">{vCase.status.replace('_', ' ')}</div>
                       </div>
                    </div>

                    <div className="flex justify-end items-center gap-6">
                       <div className="text-right">
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Wait Time</div>
                          <div className="text-xs font-bold text-primary">{vCase.age}</div>
                       </div>
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
