import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, DollarSign, ShieldCheck, Zap, Info, MoreVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NotificationCenterPage() {
  const notifications = [
    { id: 1, type: "offer", title: "New Offer Received", content: "You received a $125,000 offer for AI Customer Support SaaS.", time: "10m ago", isRead: false, icon: DollarSign },
    { id: 2, type: "message", title: "New Message", content: "Alice Smith sent you a message regarding the due diligence documents.", time: "1h ago", isRead: false, icon: MessageSquare },
    { id: 3, type: "verification", title: "Verification Approved", content: "Your business ownership verification for Sustainable Ecommerce Store has been approved.", time: "5h ago", isRead: true, icon: ShieldCheck },
    { id: 4, type: "system", title: "System Update", content: "We've updated our data room security protocols. Review the changes in our blog.", time: "1d ago", isRead: true, icon: Info },
    { id: 5, type: "listing", title: "Listing Published", content: "Your listing 'Micro-SaaS Portfolio' is now live on the marketplace.", time: "2d ago", isRead: true, icon: Zap },
  ];

  return (
    <div className="container py-12 max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Notifications.</h1>
          <p className="text-muted-foreground font-medium">Stay updated on your deals and account activity.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="font-bold">Mark all as read</Button>
           <Button variant="ghost" className="text-destructive hover:bg-destructive/5 font-bold">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
           </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <Card key={n.id} className={cn(
            "border-none shadow-sm transition-all group hover:shadow-md cursor-pointer overflow-hidden",
            !n.isRead ? "bg-accent/5 ring-1 ring-accent/10" : "bg-white"
          )}>
            <CardContent className="p-0 flex items-center">
              {!n.isRead && (
                <div className="w-1.5 self-stretch bg-accent shrink-0" />
              )}
              <div className="p-6 flex-1 flex items-start gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  !n.isRead ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-secondary text-muted-foreground"
                )}>
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={cn("text-sm font-black uppercase tracking-tight", !n.isRead ? "text-primary" : "text-muted-foreground")}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {n.content}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
