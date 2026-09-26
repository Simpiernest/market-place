"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Heart,
  Users,
  Target,
  CreditCard,
  FileText,
  MessageSquare,
  Briefcase,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Settings,
  LogOut,
  Lock,
  AlertTriangle,
  Building
} from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
}


export function DashboardSidebar({
  role,
  isMobile,
  onMobileClose
}: {
  role: 'buyer' | 'seller' | 'broker',
  isMobile?: boolean,
  onMobileClose?: () => void
}) {
  const pathname = usePathname();
  const { user: dbUser, logout } = useUser();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    async function fetchStats() {
        if (role === 'seller') {
            try {
                const data = await api.get("/sellers/dashboard");
                setStats(data);
            } catch (e) {}
        }
    }

    fetchStats();
  }, [role]);

  const buyerItems: SidebarItem[] = [
    { title: "Overview", href: "/dashboard/buyer", icon: LayoutDashboard },
    { title: "My Profile", href: "/dashboard/buyer/profile", icon: Users },
    { title: "Discover", href: "/marketplace", icon: Search },
    { title: "Saved", href: "/dashboard/buyer/saved", icon: Heart },
    { title: "Offers", href: "/dashboard/buyer/offers", icon: FileText },
    { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { title: "Organizations", href: "/dashboard/organizations", icon: Building },
  ];

  const sellerItems: SidebarItem[] = [
    { title: "Overview", href: "/dashboard/seller", icon: LayoutDashboard },
    { title: "My Profile", href: "/dashboard/seller/profile", icon: Users },
    { title: "My Listings", href: "/dashboard/seller/listings", icon: Briefcase },
    { title: "Create Listing", href: "/dashboard/seller/listings/new", icon: PlusCircle },
    { title: "Offers", href: "/dashboard/seller/offers", icon: FileText },
    { title: "Access Requests", href: "/dashboard/seller/access-requests", icon: Lock },
    { title: "Disputes", href: "/dashboard/seller/resolution", icon: AlertTriangle },
    { title: "Verification", href: "/dashboard/seller/verification", icon: ShieldCheck },
    { title: "Analytics", href: "/dashboard/seller/analytics", icon: TrendingUp },
    { title: "Payouts", href: "/dashboard/seller/payouts", icon: CreditCard },
    { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { title: "Organizations", href: "/dashboard/organizations", icon: Building },
  ];

  const brokerItems: SidebarItem[] = [
    { title: "Overview", href: "/dashboard/broker", icon: LayoutDashboard },
    { title: "Portfolio", href: "/dashboard/broker/portfolio", icon: Briefcase },
    { title: "Clients", href: "/dashboard/broker/clients", icon: Users },
    { title: "Mandates", href: "/dashboard/broker/mandates", icon: Target },
    { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  ];

  const adminItems: SidebarItem[] = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Trust Center", href: "/admin/trust-center", icon: ShieldCheck },
    { title: "Listings", href: "/admin/listings", icon: Briefcase },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Audit Logs", href: "/admin/audit", icon: FileText },
  ];

  const isUserAdmin = dbUser?.roles?.some((r: any) => ['ADMIN', 'SUPER_ADMIN'].includes(r.role)) ||
                     user?.user_metadata?.role === 'admin';

  const items = isUserAdmin ? adminItems : (role === 'buyer' ? buyerItems : role === 'seller' ? sellerItems : brokerItems);

  return (
    <motion.div
      initial={isMobile ? false : { x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "flex flex-col h-full bg-primary text-white overflow-hidden shadow-2xl",
        isMobile ? "w-full" : "w-64"
      )}
    >
      <div className="p-8 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
            <Link href="/" className="flex items-center space-x-3" onClick={onMobileClose}>
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto rounded-lg" />
            <span className="text-xl font-black tracking-tight italic uppercase">
                BUSINESS <span className="text-accent">BRIDGE</span>
            </span>
            </Link>
            {!isMobile && <NotificationCenter />}
        </div>
        <div className="flex items-center gap-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[120px]">
                {dbUser?.full_name || user?.user_metadata?.full_name || "Account Owner"}
            </div>
        </div>
        <div className="mt-1 text-[8px] font-bold uppercase tracking-widest text-white/30">
          {role} portal
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar-dark pb-10">
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={isMobile ? false : { x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                pathname === item.href
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        pathname === item.href ? "text-white" : "text-white/40 group-hover:text-white"
                    )} />
                    {item.title}
                </div>
                {item.title === "Access Requests" && stats?.access_requests > 0 && (
                    <span className="bg-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-lg">
                        {stats.access_requests}
                    </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 space-y-2 flex-shrink-0">
        <Link
          href="/dashboard/settings"
          onClick={onMobileClose}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
            pathname === "/dashboard/settings"
              ? "bg-accent text-white shadow-lg shadow-accent/20"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings className={cn(
            "h-5 w-5 transition-colors",
            pathname === "/dashboard/settings" ? "text-white" : "text-white/40 group-hover:text-white"
          )} />
          Settings
        </Link>
        <button
          onClick={() => {
            handleLogout();
            onMobileClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-white/60 hover:bg-destructive/10 hover:text-destructive group text-left cursor-pointer"
        >
          <LogOut className="h-5 w-5 transition-colors group-hover:text-destructive" />
          Logout
        </button>
      </div>
    </motion.div>
  );
}
