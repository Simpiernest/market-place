"use client";

import { createClient } from "@/lib/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Menu as MenuIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@/context/user-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, error } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && !error) {
        router.push("/login");
    }

    if (user && pathname === '/dashboard') {
        const role = user.user_metadata?.role || user.roles?.[0]?.role?.toLowerCase() || 'buyer';
        router.push(role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer');
    }
  }, [user, isLoading, pathname, router, error]);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
        <div className="h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-6">
            <div className="h-20 w-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent shadow-lg animate-pulse">
                <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-primary uppercase italic">Sync Connection Lost.</h1>
                <p className="text-muted-foreground font-medium max-w-xs">We're unable to reach the acquisition network. Please ensure your backend is running on port 8005.</p>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-primary text-white font-black uppercase tracking-widest px-8">
                Reconnect Now
            </Button>
        </div>
    );
  }

  if (!user) return null;

  // Determine role for sidebar logic
  const metadataRole = user.user_metadata?.role || 'buyer';
  let effectiveRole = metadataRole;

  if (pathname.includes('/dashboard/seller')) {
    effectiveRole = 'seller';
  } else if (pathname.includes('/dashboard/buyer')) {
    effectiveRole = 'buyer';
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 h-full bg-primary z-20">
        <DashboardSidebar role={effectiveRole} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
            >
               <div className="h-full relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <DashboardSidebar role={effectiveRole} isMobile onMobileClose={() => setIsSidebarOpen(false)} />
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-primary text-white border-b border-white/10 flex-shrink-0 z-30 shadow-lg">
          <div className="flex items-center gap-3">
             <span className="text-lg font-black tracking-tight italic uppercase">
                BUSINESS <span className="text-accent">BRIDGE</span>
             </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-white hover:bg-white/10">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </header>

        <DashboardHeader />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-8 pb-40">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
