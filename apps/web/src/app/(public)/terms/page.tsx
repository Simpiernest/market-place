"use client";

import { motion } from "framer-motion";
import { Scale, CheckCircle2, AlertTriangle, Zap, DollarSign, ShieldCheck, Lock, Gavel, Globe } from "lucide-react";

export default function TermsOfServicePage() {
  const provisions = [
    {
      title: "Listing Accuracy & Integrity",
      content: "Sellers are legally obligated to provide accurate financial and operational data. Any intentional misrepresentation of revenue, profit, or traffic is considered a material breach and will result in permanent exclusion from the Business Bridge Network.",
      icon: Scale
    },
    {
      title: "Buyer Qualification",
      content: "Access to institutional-grade listings is restricted to verified buyers. Business Bridge reserves the right to request Proof of Funds (POF) or other financial credentials to maintain marketplace quality.",
      icon: ShieldCheck
    },
    {
      title: "Confidentiality & Deal Rooms",
      content: "Private business data is protected by the Business Bridge Standard NDA. Users agree that all information obtained through protected data rooms is strictly confidential and may not be used for any purpose other than evaluating the acquisition.",
      icon: Lock
    },
    {
      title: "Transaction & Escrow",
      content: "To ensure safety, Business Bridge mandates the use of approved escrow services for all high-value transactions. Funds are held in a neutral account and only released upon verified asset handover and successful completion of the inspection period.",
      icon: DollarSign
    },
    {
      title: "Success Fees & Commission",
      content: "Business Bridge operates on a success-fee basis. Upon the successful closing of a transaction initiated on our platform, the seller agrees to pay a commission fee ranging from 5% to 10%, as specified in the listing agreement.",
      icon: CheckCircle2
    },
    {
      title: "Broker Representation",
      content: "Users may be represented by licensed brokers. All brokerage agreements must be disclosed to ensure transparency during negotiations and final closing.",
      icon: Gavel
    }
  ];

  return (
    <div className="container py-24 space-y-20">
      <div className="max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-accent/20">
          <Globe className="w-4 h-4" />
          Global Acquisition Standards
        </div>
        <h1 className="text-5xl font-black text-primary uppercase italic tracking-tighter sm:text-6xl md:text-7xl">
          Marketplace <span className="text-accent">Terms.</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium italic leading-relaxed max-w-2xl">
          The Business Bridge Terms of Service govern the professional conduct and transactional integrity of our global acquisition network.
        </p>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest pt-4 border-t w-fit">
          Effective: September 18, 2026
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {provisions.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl hover:border-accent/10 transition-all group"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white group-hover:bg-accent transition-colors shadow-lg">
              <item.icon className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-primary uppercase italic">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {item.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 rounded-[3.5rem] bg-primary text-white space-y-10 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
         <div className="max-w-3xl space-y-6 relative z-10">
            <h2 className="text-4xl font-black uppercase italic">Professional Conduct Code</h2>
            <p className="text-lg text-white/80 font-medium italic leading-relaxed">
              Business Bridge is reserved for professional entrepreneurs and institutional investors. We maintain a zero-tolerance policy for harassment, circumvention, or any activity that undermines the trust-infrastructure of our marketplace.
            </p>
         </div>
         <div className="flex flex-col sm:flex-row gap-8 pt-8 border-t border-white/10 relative z-10">
            <div className="flex-1 space-y-2">
                <h4 className="text-accent font-black uppercase tracking-widest text-xs">Legal Jurisdiction</h4>
                <p className="text-sm font-medium">Governed by the laws of the Business Bridge Group Corporate HQ jurisdiction.</p>
            </div>
            <div className="flex-1 space-y-2">
                <h4 className="text-accent font-black uppercase tracking-widest text-xs">Dispute Resolution</h4>
                <p className="text-sm font-medium">Mandatory arbitration through our internal compliance and audit department.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
