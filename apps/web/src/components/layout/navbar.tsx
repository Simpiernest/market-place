"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, LogIn, UserPlus, Globe, Zap, BarChart3, BookOpen, Calculator as CalcIcon, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

import { LanguageSwitcher } from "./language-switcher";
import { Portal } from "@/components/ui/portal";
import { useUser } from "@/context/user-context";

export function Navbar() {
  const router = useRouter();
  const { user: dbUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const { t } = useTranslation();

  const metadataRole = dbUser?.roles?.[0]?.role?.toLowerCase() || user?.user_metadata?.role || 'buyer';
  const dashboardHref = metadataRole === 'seller' ? '/dashboard/seller' : metadataRole === 'broker' ? '/dashboard/broker' : '/dashboard/buyer';

  // These links are ALWAYS public as requested
  const navLinks = [
    { title: t("common.marketplace"), href: "/marketplace", icon: Globe },
    { title: t("common.sell"), href: "/sell", icon: Zap },
    { title: t("common.process"), href: "/how-it-works", icon: BarChart3 },
    { title: t("common.valuation"), href: "/valuation", icon: CalcIcon },
    { title: t("common.resources"), href: "/resources", icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b bg-white shadow-md">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center space-x-3 z-[110]" onClick={() => setIsOpen(false)}>
              <Image src="/logo.png" alt="Business Bridge Logo" width={40} height={40} className="h-10 w-auto rounded-lg shadow-sm" />
              <span className="text-2xl font-black tracking-tighter italic uppercase text-primary hidden sm:inline-block">
                BUSINESS <span className="text-accent">BRIDGE</span>
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-6 xl:gap-10 text-[11px] font-black uppercase tracking-widest text-primary/60">
              {navLinks.map((link) => (
                <Link key={link.title} href={link.href} className="transition-colors hover:text-accent whitespace-nowrap">
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-4 xl:gap-6">
            <form onSubmit={handleSearch} className="hidden xl:flex relative w-48 2xl:w-64 group">
              <button type="submit" className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors cursor-pointer hover:scale-110">
                <Search className="h-4 w-4" />
              </button>
              <input
                type="search"
                placeholder={t("common.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/50 border-none pl-11 pr-4 h-11 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-accent/20 transition-all outline-none"
              />
            </form>

            <LanguageSwitcher />

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                  <Button asChild className="bg-primary text-white hover:bg-accent border-none font-black uppercase text-[10px] tracking-widest px-8 h-11 shadow-lg shadow-primary/10 transition-all cursor-pointer">
                    <Link href={dashboardHref}>
                      {t("common.dashboard")}
                    </Link>
                  </Button>
              ) : (
                  <>
                      <Button asChild variant="ghost" className="font-black uppercase text-[10px] tracking-widest px-6 h-11 cursor-pointer">
                        <Link href="/login">
                            {t("common.login")}
                        </Link>
                      </Button>
                      <Button asChild className="bg-primary text-white hover:bg-accent border-none font-black uppercase text-[10px] tracking-widest px-8 h-11 shadow-lg shadow-primary/10 transition-all cursor-pointer whitespace-nowrap">
                        <Link href="/register">
                            {t("common.register")}
                        </Link>
                      </Button>
                  </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-11 w-11 rounded-2xl relative z-[150] hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <Portal>
        <div className={cn(
            "fixed inset-0 bg-primary/95 backdrop-blur-xl z-[999] lg:hidden flex flex-col transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
            <div className="absolute top-8 right-8 z-[1000]">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-2xl text-white hover:bg-white/10 transition-transform active:scale-90"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-10 w-10" />
                </Button>
            </div>

            <div className="container flex-1 flex flex-col pt-24 pb-12 overflow-y-auto no-scrollbar">
                <nav className="flex flex-col gap-3">
                    {navLinks.map((link, i) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-white group hover:bg-accent transition-all cursor-pointer shadow-lg",
                                isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                            )}
                            style={{ transitionDelay: `${isOpen ? 100 + i * 80 : 0}ms` }}
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-colors shrink-0">
                                    <link.icon className="h-5 w-5 text-accent group-hover:text-accent" />
                                </div>
                                <span className="text-xl font-black uppercase italic text-white">{link.title}</span>
                            </div>
                            <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className={cn(
                    "mt-8 grid grid-cols-2 gap-4 transition-all duration-700 delay-300",
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                )}>
                    {user ? (
                         <Link href={dashboardHref} className="col-span-2" onClick={() => setIsOpen(false)}>
                            <Button className="w-full h-16 bg-white text-primary hover:bg-accent hover:text-white border-none font-black uppercase italic tracking-widest rounded-3xl shadow-2xl">
                                <Zap className="w-4 h-4 mr-2 text-accent" />
                                Go to Dashboard
                            </Button>
                         </Link>
                    ) : (
                        <>
                            <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                                <Button variant="ghost" className="w-full h-16 border-2 border-white/20 text-white font-black uppercase italic tracking-widest rounded-3xl hover:bg-white/10">
                                <LogIn className="w-4 h-4 mr-2" />
                                Log In
                                </Button>
                            </Link>
                            <Link href="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                                <Button className="w-full h-16 bg-white text-primary hover:bg-accent hover:text-white border-none font-black uppercase italic tracking-widest rounded-3xl shadow-2xl">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Join
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="p-8 border-t border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    © 2024 Business Bridge Global Marketplace
                </p>
            </div>
        </div>
      </Portal>
    </>
  );
}
