import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import Link from "next/link";

export default async function ResourceArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Mock article generation based on slug for SEO testing
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <article className="container py-12 max-w-4xl mx-auto space-y-12">
      <Link href="/resources">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>
      </Link>

      <header className="space-y-6">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 px-3 py-1 rounded-full w-fit">
           Guide & Strategy
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-primary uppercase italic leading-tight">
          {title}.
        </h1>
        <div className="flex items-center gap-8 text-xs font-bold text-muted-foreground border-y py-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            By Business Bridge Experts
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            12 min read
          </div>
          <button className="ml-auto flex items-center gap-2 hover:text-accent transition-colors">
            <Share2 className="w-4 h-4" />
            Share Guide
          </button>
        </div>
      </header>

      <div className="prose prose-slate lg:prose-xl max-w-none text-muted-foreground leading-relaxed space-y-8 font-medium">
        <p className="text-xl text-primary font-bold">
          Acquiring a digital asset is a complex journey that requires a blend of financial rigor, technical due diligence, and strategic foresight. In this guide, we break down the {title} framework used by institutional investors.
        </p>

        <h2 className="text-2xl font-black text-primary uppercase italic pt-4">01. The Foundation</h2>
        <p>
          Before diving into the financials, it's critical to understand the operational leverage of the target business. Is the revenue sustainable? Are the customer acquisition costs (CAC) healthy relative to the lifetime value (LTV)?
        </p>

        <div className="bg-secondary/20 p-8 rounded-3xl border-l-4 border-accent">
           <h3 className="text-lg font-bold text-primary mb-2 uppercase">Pro Tip: Multi-Channel Traffic</h3>
           <p className="text-sm">Never rely on a single traffic source. High-value acquisitions usually feature a balanced mix of SEO, direct, and social traffic to mitigate platform risk.</p>
        </div>

        <h2 className="text-2xl font-black text-primary uppercase italic pt-4">02. Financial Rigor</h2>
        <p>
          Analyze the P&L statement over at least 24 months. Look for seasonal trends and anomalies. A verified business on Business Bridge has already undergone a preliminary scan for consistency, but as a buyer, you must perform a deep-dive into net profit margins.
        </p>
      </div>

      <footer className="bg-primary rounded-3xl p-12 text-white text-center space-y-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl opacity-20" />
         <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase italic mb-4">Ready to start?</h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8 font-medium leading-relaxed">Browse thousands of verified businesses and apply the strategies learned in this guide today.</p>
            <Link href="/marketplace">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-none font-black h-14 px-12">Explore Marketplace</Button>
            </Link>
         </div>
      </footer>
    </article>
  );
}
