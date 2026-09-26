"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t bg-slate-50 py-16 md:py-24">
      <div className="container grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-2 space-y-8">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto rounded-lg" />
            <span className="text-3xl font-black tracking-tighter italic uppercase text-primary">
              BUSINESS <span className="text-accent">BRIDGE</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed font-medium italic">
            {t("footer.tagline")}
          </p>
          <div className="pt-4 flex gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
             {/* Social placeholders */}
             <div className="h-6 w-6 bg-primary rounded" />
             <div className="h-6 w-6 bg-primary rounded" />
             <div className="h-6 w-6 bg-primary rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">
            {t("common.marketplace")}
          </h3>
          <ul className="space-y-3 text-xs font-bold text-muted-foreground">
            <li><Link href="/marketplace?type=saas" className="hover:text-accent transition-colors">SaaS & Software</Link></li>
            <li><Link href="/marketplace?type=ecommerce" className="hover:text-accent transition-colors">Ecommerce Stores</Link></li>
            <li><Link href="/marketplace?type=content" className="hover:text-accent transition-colors">Content & SEO Sites</Link></li>
            <li><Link href="/marketplace?type=apps" className="hover:text-accent transition-colors">Mobile Applications</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">
            Platform
          </h3>
          <ul className="space-y-3 text-xs font-bold text-muted-foreground">
            <li><Link href="/about" className="hover:text-accent transition-colors">Our Vision</Link></li>
            <li><Link href="/how-it-works" className="hover:text-accent transition-colors">Acquisition Process</Link></li>
            <li><Link href="/valuation" className="hover:text-accent transition-colors">Valuation Engine</Link></li>
            <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing Structure</Link></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">
            Acquisition Support
          </h3>
          <ul className="space-y-3 text-xs font-bold text-muted-foreground">
            <li><Link href="/resources" className="hover:text-accent transition-colors">Resource Library</Link></li>
            <li><Link href="/faq" className="hover:text-accent transition-colors">Help Center</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Expert</Link></li>
            <li><Link href="/security" className="hover:text-accent transition-colors">Transaction Security</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-24 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} Business Bridge Group. {t("footer.rights")}
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
           <Link href="/privacy" className="hover:text-primary transition-colors">{t("common.privacy")}</Link>
           <Link href="/terms" className="hover:text-primary transition-colors">{t("common.terms")}</Link>
           <Link href="/cookies" className="hover:text-primary transition-colors">{t("common.cookies")}</Link>
        </div>
      </div>
    </footer>
  );
}
