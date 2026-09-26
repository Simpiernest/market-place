"use client";

import { ShieldCheck, Lock, History, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

export function TrustVerification() {
  const { t } = useTranslation();

  const trustItems = [
    {
      title: t("trust.item1_title"),
      description: t("trust.item1_desc"),
      icon: UserCheck,
    },
    {
      title: t("trust.item2_title"),
      description: t("trust.item2_desc"),
      icon: Lock,
    },
    {
      title: t("trust.item3_title"),
      description: t("trust.item3_desc"),
      icon: ShieldCheck,
    },
    {
      title: t("trust.item4_title"),
      description: t("trust.item4_desc"),
      icon: History,
    },
  ];

  return (
    <section className="bg-secondary/20 py-24">
      <div className="container">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-6 uppercase italic">
              {t("trust.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 font-medium italic">
              {t("trust.subtitle")}
            </p>
            <div className="space-y-6">
              {trustItems.map((item, i) => (
                <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary to-accent/80 p-8 flex flex-col justify-center text-white shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-20" />
               <div className="relative z-10">
                 <ShieldCheck className="h-24 w-24 mb-8 text-accent shadow-sm" />
                 <h3 className="text-4xl font-black italic mb-4 uppercase tracking-tighter">{t("trust.badge_title")}</h3>
                 <p className="text-xl text-white/80 font-medium leading-relaxed italic">
                   {t("trust.badge_desc")}
                 </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
