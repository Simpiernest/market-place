"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign } from "lucide-react";

export default function BrokerPortfolioPage() {
  const [stats, setStats] = useState({ listings: 0, clients: 0, revenue: 0 });

  useEffect(() => {
    api.get("/brokers/me").then((d: any) => setStats({ listings: d.listings || 0, clients: d.clients || 0, revenue: d.revenue || 0 })).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Broker Portfolio</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent><BarChart3 className="w-6 h-6 mb-2" /><p className="font-bold text-2xl">{stats.listings}</p><p className="text-xs text-muted-foreground">Active Listings</p></CardContent></Card>
        <Card><CardContent><BarChart3 className="w-6 h-6 mb-2" /><p className="font-bold text-2xl">{stats.clients}</p><p className="text-xs text-muted-foreground">Active Clients</p></CardContent></Card>
        <Card><CardContent><DollarSign className="w-6 h-6 mb-2" /><p className="font-bold text-2xl">${stats.revenue}</p><p className="text-xs text-muted-foreground">Revenue</p></CardContent></Card>
      </div>
    </div>
  );
}
