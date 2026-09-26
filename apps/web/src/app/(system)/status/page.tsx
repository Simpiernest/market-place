import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Clock, Zap, Globe, ShieldCheck, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SystemStatusPage() {
  const services = [
    { name: "Marketplace API", status: "operational", icon: Zap },
    { name: "Authentication", status: "operational", icon: ShieldCheck },
    { name: "Storage Service", status: "operational", icon: Globe },
    { name: "Payment Processing", status: "operational", icon: CheckCircle2 },
    { name: "Email Delivery", status: "degraded", icon: Mail },
    { name: "Verification Engine", status: "operational", icon: Clock },
  ];

  return (
    <div className="container py-24 max-w-4xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">System <span className="text-accent">Status.</span></h1>
        <p className="text-xl text-muted-foreground font-medium">Real-time status of Business Bridge services.</p>
      </div>

      <Card className="border-none shadow-2xl bg-primary text-primary-foreground overflow-hidden">
        <CardContent className="p-12 text-center space-y-6">
           <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 animate-pulse">
              <CheckCircle2 className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase italic">All Systems Operational</h2>
              <p className="text-primary-foreground/60 font-medium italic text-sm">Last checked: Just now • Monitoring 24/7</p>
           </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div key={service.name} className="p-6 rounded-2xl border bg-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <service.icon className="h-5 w-5" />
               </div>
               <span className="font-bold text-primary">{service.name}</span>
            </div>
            <Badge variant="outline" className={service.status === 'operational' ? "border-green-500/20 text-green-600 bg-green-50 uppercase text-[8px] font-black tracking-widest" : "border-amber-500/20 text-amber-600 bg-amber-50 uppercase text-[8px] font-black tracking-widest"}>
               {service.status}
            </Badge>
          </div>
        ))}
      </div>

      <div className="pt-12 border-t">
         <h3 className="text-xl font-bold text-primary mb-6">Recent Incidents</h3>
         <div className="space-y-6">
            <div className="flex gap-4">
               <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="h-4 w-4" />
               </div>
               <div className="space-y-1">
                  <div className="text-sm font-bold text-primary">Intermittent Email Delays</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Our email provider is currently experiencing issues. Some users may experience delays in receiving verification emails. We are monitoring the situation.</p>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block pt-2">Aug 24, 2024 - 02:30 AM UTC</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
