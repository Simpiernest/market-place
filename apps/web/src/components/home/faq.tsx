"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { useTranslation } from "@/hooks/use-translation"

export function FAQ() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1")
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2")
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3")
    },
    {
      question: t("faq.q4"),
      answer: t("faq.a4")
    },
    {
      question: t("faq.q5"),
      answer: t("faq.a5")
    }
  ];

  return (
    <section className="container py-24 bg-secondary/10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl uppercase italic tracking-tight">
            {t("faq.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-medium italic">
            {t("faq.subtitle")}
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
            >
                <AccordionItem value={`item-${i}`} className="bg-white border rounded-2xl px-6 shadow-sm">
                <AccordionTrigger className="text-left font-bold text-primary hover:no-underline py-6">
                    {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-sm font-medium italic">
                    {faq.answer}
                </AccordionContent>
                </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
