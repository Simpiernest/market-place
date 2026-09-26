"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, MessageSquare, DollarSign, Clock, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  async function fetchNotifications() {
    setIsLoading(true);
    try {
      const data = await api.get("/notifications");
      if (data) {
        setNotifications(data);
        const unread = data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e: any) {
      setSystemError(e.message || "Connection failed");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // In production, you'd use a WebSocket or polling
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_MESSAGE": return <MessageSquare className="w-4 h-4 text-accent" />;
      case "NEW_OFFER": return <DollarSign className="w-4 h-4 text-green-500" />;
      case "OFFER_UPDATE": return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary shadow-lg animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-3xl border-none shadow-2xl bg-white overflow-hidden">
        <div className="p-5 bg-secondary/10 border-b flex items-center justify-between">
           <h3 className="font-black uppercase italic text-sm text-primary tracking-tight">System Alerts.</h3>
           <BadgeCheck className="w-4 h-4 text-accent" />
        </div>

        <div className="max-h-[400px] overflow-y-auto divide-y">
           {systemError && (
             <div className="p-4 bg-destructive/5 text-destructive text-[10px] font-bold text-center border-b">
               {systemError}
             </div>
           )}
           {isLoading && notifications.length === 0 ? (
             <div className="p-10 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Scanning network...</p>
             </div>
           ) : notifications.length > 0 ? (
             notifications.map((n) => (
               <div
                key={n.id}
                className={cn(
                    "p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                    !n.is_read && "bg-accent/[0.02]"
                )}
                onClick={() => markAsRead(n.id)}
               >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    !n.is_read ? "bg-accent/10" : "bg-secondary"
                  )}>
                     {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                     <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black text-primary uppercase">{n.title}</h4>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed font-medium line-clamp-2">{n.content}</p>
                     {n.link && (
                       <Link href={n.link} className="inline-block text-[9px] font-black uppercase text-accent hover:underline mt-1">View Details</Link>
                     )}
                  </div>
                  {!n.is_read && <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />}
               </div>
             ))
           ) : (
             <div className="p-12 text-center space-y-4">
                <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Zero active alerts.</p>
             </div>
           )}
        </div>

        <div className="p-4 bg-secondary/5 border-t">
           <Button variant="ghost" className="w-full h-8 text-[10px] font-black uppercase text-muted-foreground hover:text-primary">Clear All Notifications</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BadgeCheck({ className }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
}
