"use client";

import { Search, FileSearch, ShieldCheck, MessageSquare, BadgeCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("how_it_works.step1_title"),
      description: t("how_it_works.step1_desc"),
      icon: Search,
    },
    {
      title: t("how_it_works.step2_title"),
      description: t("how_it_works.step2_desc"),
      icon: FileSearch,
    },
    {
      title: t("how_it_works.step3_title"),
      description: t("how_it_works.step3_desc"),
      icon: ShieldCheck,
    },
    {
      title: t("how_it_works.step4_title"),
      description: t("how_it_works.step4_desc"),
      icon: MessageSquare,
    },
    {
      title: t("how_it_works.step5_title"),
      description: t("how_it_works.step5_desc"),
      icon: BadgeCheck,
    },
    {
      title: t("how_it_works.step6_title"),
      description: t("how_it_works.step6_desc"),
      icon: TrendingUp,
    },
  ];

  return (
    <section className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl uppercase italic tracking-tight">
          {t("how_it_works.title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground font-medium italic">
          {t("how_it_works.subtitle")}
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-2/3 w-full h-px bg-border -z-10" />
            )}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-6 shadow-sm border border-accent/20">
              <step.icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-primary mb-2 uppercase italic tracking-tighter">
              {step.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm font-medium">
              {step.description}
            </p>
            <div className="mt-4 text-xs font-black text-accent/30 tracking-widest">
              STEP 0{index + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
