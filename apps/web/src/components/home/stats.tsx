"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useTranslation } from "@/hooks/use-translation";

export function MarketplaceStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: t("home.stat_listings"), value: "2,500+" },
    { label: t("home.stat_volume"), value: "$450M+" },
    { label: t("home.stat_buyers"), value: "15k+" },
    { label: t("home.stat_multiple"), value: "3.4x" },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.get("/marketplace/stats");
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            setStats([
                { label: t("home.stat_listings"), value: `${data.active_listings ?? 2500}+` },
                { label: t("home.stat_volume"), value: `$${Math.round((data.total_volume ?? 450000000) / 1000000)}M+` },
                { label: t("home.stat_buyers"), value: `${data.verified_buyers ?? 15000}+` },
                { label: t("home.stat_multiple"), value: `${data.avg_multiple ?? '3.5'}x` },
            ]);
        }
      } catch (e) {
        console.error("Failed to fetch live stats, using defaults");
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="bg-primary py-12 text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="text-3xl font-black md:text-4xl italic group-hover:text-accent transition-colors duration-300">{stat.value}</div>
              <div className="mt-2 text-[10px] text-primary-foreground/50 uppercase tracking-widest font-black group-hover:text-white transition-colors duration-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
