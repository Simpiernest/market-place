"use client";

import { motion } from "framer-motion";
import { Cookie, Settings, BarChart, ShieldCheck, Zap } from "lucide-react";

export default function CookiePolicyPage() {
  const categories = [
    {
      title: "Essential Cookies",
      description: "Required for the platform to function. These handle authentication, session security, and prevent cross-site request forgery (CSRF).",
      icon: ShieldCheck
    },
    {
      title: "Preference Cookies",
      description: "Remember your settings, such as your preferred language, currency, and dashboard layout preferences.",
      icon: Settings
    },
    {
      title: "Performance Cookies",
      description: "Help us understand how users interact with our marketplace so we can optimize the deal flow and discovery engine.",
      icon: Zap
    },
    {
      title: "Analytical Cookies",
      description: "Provide anonymized data about marketplace traffic and trends to help us improve our valuation algorithms.",
      icon: BarChart
    }
  ];

  return (
    <div className="container py-24 space-y-16">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-black text-primary uppercase italic tracking-tighter">Cookie <span className="text-accent">Policy.</span></h1>
        <p className="text-xl text-muted-foreground font-medium italic leading-relaxed">
          We use cookies to ensure a seamless and secure experience within our acquisition network. This policy explains how we manage these small but vital data points.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[2.5rem] bg-secondary/10 border border-secondary/20 flex gap-6 items-start hover:bg-white hover:shadow-2xl transition-all"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
              <cat.icon className="h-7 w-7" />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary uppercase italic">{cat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {cat.description}
                </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 rounded-[3rem] bg-accent text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <Cookie className="h-24 w-24 relative z-10 shrink-0 opacity-80" />
        <div className="space-y-4 relative z-10">
            <h2 className="text-3xl font-black uppercase italic">Managing your choices</h2>
            <p className="text-lg text-white/80 font-medium italic max-w-2xl">
              You have full control over non-essential cookies. You can adjust your preferences at any time through your browser settings or our built-in privacy controls.
            </p>
            <p className="text-xs font-black uppercase tracking-widest pt-4">Need help? support@businessbridge.com</p>
        </div>
      </div>
    </div>
  );
}
