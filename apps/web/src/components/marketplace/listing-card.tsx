import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, ShieldCheck, MapPin, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface ListingCardProps {
  id: string;
  title: string;
  category: string;
  askingPrice: number;
  revenue: number;
  profit: number;
  age: string;
  location: string;
  isVerified: boolean;
  slug: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
}

export function ListingCard({
  title,
  category,
  askingPrice,
  revenue,
  profit,
  age,
  location,
  isVerified,
  slug,
  visibility = 'PUBLIC',
}: ListingCardProps) {
  const { t, lang } = useTranslation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full hover:shadow-2xl transition-all border-none shadow-sm group rounded-3xl overflow-hidden bg-white">
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        {/* Category Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center justify-center text-primary/10 font-black uppercase tracking-widest text-4xl group-hover:scale-110 transition-transform duration-500 select-none">
          {category}
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
           {isVerified && (
             <div className="flex items-center gap-1.5 bg-green-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg">
               <ShieldCheck className="h-3 w-3" />
               Verified
             </div>
           )}
           {visibility === 'PRIVATE' && (
             <div className="flex items-center gap-1.5 bg-primary text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg border border-accent/20">
               <Lock className="h-3 w-3 text-accent" />
               Private
             </div>
           )}
           <div className="bg-white/90 backdrop-blur-md text-primary px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm w-fit">
              {category}
           </div>
        </div>

        {/* Pricing Overlay */}
        <div className="absolute bottom-4 right-4 z-20 text-right">
           <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">{t("marketplace.price_label")}</div>
           <div className="text-2xl font-black text-accent drop-shadow-md">{formatCurrency(askingPrice)}</div>
        </div>
      </div>

      <CardHeader className="flex-1 p-6 space-y-3">
        <Link href={`/businesses/${slug}`}>
          <CardTitle className="text-xl font-black text-primary leading-tight line-clamp-2 group-hover:text-accent transition-colors cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-accent/30">
            {title}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" />
            {age} old
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            {location}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-6 py-5 border-y border-slate-100">
          <div>
            <span className="text-muted-foreground block text-[9px] font-black uppercase tracking-widest mb-1">Net Profit</span>
            <span className="font-black text-primary text-lg">{formatCurrency(profit)}<span className="text-[10px] text-muted-foreground ml-1">/mo</span></span>
          </div>
          <div className="border-l border-slate-100 pl-6">
            <span className="text-muted-foreground block text-[9px] font-black uppercase tracking-widest mb-1">Revenue</span>
            <span className="font-black text-primary text-lg">{formatCurrency(revenue)}<span className="text-[10px] text-muted-foreground ml-1">/mo</span></span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[9px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
             <TrendingUp className="w-3.5 h-3.5" />
             High Multiple Potential
           </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/businesses/${slug}`} className="w-full">
          <Button className="w-full bg-primary text-primary-foreground border-none font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-primary/10 group-hover:bg-accent transition-all">
            {t("common.view_details")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
