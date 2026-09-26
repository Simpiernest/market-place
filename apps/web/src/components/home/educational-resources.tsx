"use client";

import { BookOpen, FileText, BarChart3, ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function EducationalResources() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const role = user?.user_metadata?.role || 'buyer';
  const ctaHref = user ? (role === 'seller' ? "/dashboard/seller" : "/dashboard/buyer") : "/resources";

  const resources = [
    {
      title: t("resources.card1_title"),
      description: t("resources.card1_desc"),
      icon: BookOpen,
      href: "/resources/how-to-buy",
    },
    {
      title: t("resources.card2_title"),
      description: t("resources.card2_desc"),
      icon: FileText,
      href: "/resources/how-to-sell",
    },
    {
      title: t("resources.card3_title"),
      description: t("resources.card3_desc"),
      icon: BarChart3,
      href: "/resources/how-to-value",
    },
    {
      title: t("resources.card4_title"),
      description: t("resources.card4_desc"),
      icon: ShieldAlert,
      href: "/resources/due-diligence-guide",
    },
  ];

  return (
    <section className="container py-24">
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 text-center md:text-left">
        <div>
          <h2 className="text-4xl font-black text-primary sm:text-5xl uppercase italic tracking-tight">
            {t("resources.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-medium max-w-xl italic">
            {t("resources.subtitle")}
          </p>
        </div>
        <Button asChild variant="ghost" className="font-black uppercase text-[10px] tracking-widest border-2 px-8 h-12 hover:bg-primary hover:text-white transition-all cursor-pointer">
          <Link href={ctaHref}>
            {user ? "View My Resources" : t("resources.cta")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {resources.map((resource, i) => (
          <motion.div
            key={resource.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col h-full"
          >
            <Card className="group hover:shadow-2xl transition-all border-none shadow-sm bg-white overflow-hidden flex flex-col rounded-3xl h-full">
                <div className="h-2 bg-secondary group-hover:bg-accent transition-colors" />
                <CardHeader className="flex-1 p-8">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner mb-6">
                    <resource.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-black text-primary leading-tight">{resource.title}</CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4 font-medium">
                    {resource.description}
                </p>
                </CardHeader>
                <CardFooter className="p-8 pt-0">
                <Button asChild variant="ghost" className="w-full justify-between p-4 h-auto font-black uppercase text-[10px] tracking-widest border-2 rounded-xl group-hover:border-accent group-hover:text-accent transition-all cursor-pointer">
                  <Link href={resource.href}>
                    {t("resources.masterclass_cta")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
