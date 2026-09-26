"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import { Search, Bell } from "lucide-react";

export function DashboardHeader() {
  const { user: dbUser } = useUser();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <header className="h-20 hidden lg:flex items-center justify-between px-8 bg-white border-b border-slate-100 flex-shrink-0">
      <div className="relative w-96 group">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
        <Input
          placeholder="Search businesses, assets, sellers, buyers..."
          className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-accent/10"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-primary">
          <Bell className="h-5 w-5" />
          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
           <div className="text-right">
              <div className="text-xs font-black text-primary uppercase italic">{dbUser?.full_name || user?.user_metadata?.full_name || "Alex Carter"}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">{user?.user_metadata?.role || "Seller"}</div>
           </div>
           <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-black italic shadow-sm border border-white">
              {dbUser?.full_name ?
                dbUser.full_name.split(' ').filter((n: string) => n.length > 0).map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) :
                "AC"}
           </div>
        </div>
      </div>
    </header>
  );
}
