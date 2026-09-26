"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Search, Filter, ShieldCheck, AlertCircle, User, FileText, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const logs = [
    { id: 1, user: "admin_sarah", action: "Approved Listing", resource: "L-9021", time: "5m ago", status: "Success", type: "Listing" },
    { id: 2, user: "system", action: "Escrow Funded", resource: "TRX-9283", time: "12m ago", status: "Success", type: "Transaction" },
    { id: 3, user: "moderator_mike", action: "Flagged Account", resource: "U-1283", time: "24m ago", status: "Alert", type: "User" },
    { id: 4, user: "admin_john", action: "Deleted Document", resource: "DOC-012", time: "1h ago", status: "Success", type: "Document" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Immutable <span className="text-accent">Audit Trail.</span></h1>
          <p className="text-muted-foreground font-medium">Traceable action history across all platform domains.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Filter by actor, resource, or event ID..."
              className="w-full bg-white border border-secondary rounded-xl pl-9 pr-4 h-11 text-sm font-medium outline-none focus:ring-2 focus:ring-accent transition-all"
            />
         </div>
         <Button variant="outline" className="h-11 px-6 rounded-xl font-bold">
            <Filter className="w-4 h-4 mr-2" />
            Event Types
         </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-secondary/30 border-b text-primary font-black uppercase tracking-widest text-[10px]">
                  <tr>
                     <th className="px-6 py-4">Event ID</th>
                     <th className="px-6 py-4">Actor</th>
                     <th className="px-6 py-4">Action</th>
                     <th className="px-6 py-4">Resource</th>
                     <th className="px-6 py-4">Result</th>
                     <th className="px-6 py-4 text-right">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-secondary/5 transition-colors group">
                       <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">BB-EVT-{log.id}0928</td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                                <User className="h-3 w-3 text-muted-foreground" />
                             </div>
                             <span className="font-bold text-primary">{log.user}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="h-5 w-5 rounded bg-accent/10 flex items-center justify-center text-accent">
                                {log.type === 'Listing' && <Database className="h-3 w-3" />}
                                {log.type === 'Transaction' && <ShieldCheck className="h-3 w-3" />}
                                {log.type === 'User' && <User className="h-3 w-3" />}
                                {log.type === 'Document' && <FileText className="h-3 w-3" />}
                             </div>
                             <span className="text-xs font-black uppercase tracking-tight text-primary">{log.action}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 font-bold text-accent">{log.resource}</td>
                       <td className="px-6 py-4">
                          <div className={cn(
                            "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter",
                            log.status === 'Success' ? "text-green-600" : "text-destructive"
                          )}>
                             {log.status === 'Success' ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                             {log.status}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right text-muted-foreground font-medium">{log.time}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}
