import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, ShieldCheck, Zap, Bell, Mail, Lock, Globe, Database, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  const sections = [
    { label: "Marketplace", icon: Globe },
    { label: "Commission", icon: DollarSign },
    { label: "Payments", icon: Zap },
    { label: "Notifications", icon: Bell },
    { label: "Email", icon: Mail },
    { label: "Security", icon: ShieldCheck },
    { label: "Moderation", icon: Lock },
    { label: "System", icon: Database },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-black text-primary uppercase italic">System <span className="text-accent">Settings.</span></h1>
        <p className="text-muted-foreground font-medium">Configure global platform parameters and compliance rules.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
         <aside className="lg:col-span-1 space-y-1">
            {sections.map(s => (
              <Button key={s.label} variant="ghost" className="w-full justify-start font-bold uppercase text-[10px] tracking-widest h-10 px-4 text-muted-foreground hover:bg-secondary">
                 <s.icon className="w-3.5 h-3.5 mr-3" />
                 {s.label}
              </Button>
            ))}
         </aside>

         <div className="lg:col-span-3 space-y-8">
            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="bg-secondary/10 border-b p-8">
                  <CardTitle className="text-lg font-bold">Marketplace Commission</CardTitle>
                  <CardDescription className="text-xs font-medium">Define the success-based fee structure for sellers.</CardDescription>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Default Commission Rate (%)</label>
                        <Input defaultValue="5.00" className="font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Minimum Fee (USD)</label>
                        <Input defaultValue="500.00" className="font-bold" />
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                     <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Commission is only calculated and applied upon the successful release of funds from escrow to the seller.</p>
                  </div>
               </CardContent>
               <CardFooter className="bg-secondary/5 border-t p-6 flex justify-end">
                  <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest h-10 px-8">Update Rates</Button>
               </CardFooter>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="bg-secondary/10 border-b p-8">
                  <CardTitle className="text-lg font-bold">API & External Integrations</CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  {[
                    { name: "Stripe Connect", status: "Active" },
                    { name: "SendGrid SMTP", status: "Degraded" },
                    { name: "Supabase Auth", status: "Active" },
                    { name: "Compliance Verifier", status: "Active" },
                  ].map(api => (
                    <div key={api.name} className="flex items-center justify-between py-2">
                       <span className="font-bold text-primary text-sm">{api.name}</span>
                       <Badge variant="outline" className={api.status === 'Active' ? "border-green-500/20 text-green-600 bg-green-50 uppercase text-[8px] font-black tracking-widest" : "border-amber-500/20 text-amber-600 bg-amber-50 uppercase text-[8px] font-black tracking-widest"}>
                          {api.status}
                       </Badge>
                    </div>
                  ))}
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
