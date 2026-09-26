import { ShieldCheck, Lock, History, UserCheck, Key, Globe, Search } from "lucide-react";

export default function SecurityPage() {
  const securityFeatures = [
    { title: "Data Encryption", desc: "All sensitive business data and P&L statements are encrypted at rest using AES-256 and in transit via TLS 1.3.", icon: Lock },
    { title: "Encrypted Data Rooms", desc: "Proprietary information is stored in secure vaults with permission-based access and integrated NDA workflows.", icon: Key },
    { title: "Immutable Audit Logs", desc: "Every action, document access, and transaction event is logged in an immutable audit trail.", icon: History },
    { title: "Identity Verification", desc: "Rigorous KYC/KYB procedures for all buyers and sellers to prevent fraud and ensure serious intent.", icon: UserCheck },
    { title: "escrow Protection", desc: "Transaction funds are held in secure escrow accounts until the inspection and transfer period is finalized.", icon: ShieldCheck },
    { title: "Vulnerability Monitoring", desc: "Regular security audits and continuous monitoring to protect against emerging digital threats.", icon: Search },
  ];

  return (
    <div className="container py-24 space-y-24">
      <div className="max-w-3xl space-y-6">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Institutional <span className="text-accent">Security.</span></h1>
         <p className="text-xl text-muted-foreground leading-relaxed font-medium">Business Bridge is built on the same security standards used by global financial institutions. We prioritize the protection of your data and the integrity of your transactions.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
         {securityFeatures.map(item => (
           <div key={item.title} className="space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner">
                 <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </div>

      <div className="bg-primary rounded-3xl p-12 lg:p-24 text-white overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <Globe className="w-64 h-64" />
         </div>
         <div className="max-w-2xl space-y-8 relative z-10">
            <h2 className="text-3xl font-extrabold italic uppercase tracking-tight">Compliance & Global Standards</h2>
            <p className="text-xl text-white/70 font-medium leading-relaxed">
               We operate in compliance with GDPR, CCPA, and regional financial regulations across our active markets. Our infrastructure is hosted on SOC 2 Type II compliant data centers.
            </p>
         </div>
      </div>
    </div>
  );
}
