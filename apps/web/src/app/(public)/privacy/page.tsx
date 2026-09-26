"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Globe, Server, Database, UserCheck, ShieldAlert } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information Gathering",
      content: "We collect identity credentials, financial records (via Stripe/PayPal integrations), and operational data provided during listing or verification. We also log IP addresses and user agents for audit trail security.",
      icon: Database
    },
    {
      title: "Data Verification",
      content: "To maintain marketplace integrity, we process sensitive documents including government IDs, bank statements, and tax records. These are encrypted at rest and only viewable by authorized compliance officers.",
      icon: UserCheck
    },
    {
      title: "Information Sharing",
      content: "Your data is only shared with authorized parties (e.g., sharing a seller's P&L with a buyer who has signed a binding NDA). We never sell your personal or business data to third-party advertisers.",
      icon: Globe
    },
    {
      title: "Deal Room Encryption",
      content: "All communications within Business Bridge deal rooms are encrypted. Messages and shared files are protected from unauthorized access throughout the acquisition lifecycle.",
      icon: Lock
    },
    {
      title: "Data Retention",
      content: "In compliance with financial regulations, we retain transaction records and audit logs for a minimum of 7 years. Inactive account data is routinely purged or anonymized.",
      icon: Server
    },
    {
      title: "Institutional Rights",
      content: "You have the right to export your data, request deletion, or restrict processing, subject to pending transactions and legal hold requirements for financial reporting.",
      icon: ShieldAlert
    }
  ];

  return (
    <div className="container py-24 space-y-20">
      <div className="max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
          <Shield className="w-4 h-4" />
          End-to-End Privacy Protection
        </div>
        <h1 className="text-5xl font-black text-primary uppercase italic tracking-tighter sm:text-6xl md:text-7xl">
          Privacy <span className="text-accent">Charter.</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium italic leading-relaxed max-w-2xl">
          Institutional-grade acquisitions require high-fidelity privacy. At Business Bridge, your data is protected by the same rigor we apply to our high-value transactions.
        </p>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest pt-4 border-t w-fit">
          Last Updated: September 18, 2026
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl hover:border-accent/10 transition-all group"
          >
            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
              <section.icon className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-primary uppercase italic">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {section.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 rounded-[3.5rem] bg-secondary/20 border border-secondary/30 flex flex-col md:flex-row items-center gap-12 shadow-inner">
         <div className="h-32 w-32 shrink-0 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl">
            <Lock className="h-16 w-16 text-accent" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-black text-primary uppercase italic">Compliance Architecture</h2>
            <p className="text-lg text-muted-foreground font-medium italic leading-relaxed">
              Our privacy framework is built on GDPR and CCPA standards, enhanced by specific M&A confidentiality requirements. Every interaction in our marketplace generates an immutable audit trail, ensuring complete accountability.
            </p>
            <div className="pt-2">
                <p className="text-xs font-black uppercase tracking-widest text-accent">Data Protection Office</p>
                <p className="text-sm font-bold mt-1 text-primary">privacy@businessbridge.com</p>
            </div>
         </div>
      </div>
    </div>
  );
}
