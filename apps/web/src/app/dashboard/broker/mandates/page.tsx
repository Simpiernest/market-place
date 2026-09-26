"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

export default function BrokerMandatesPage() {
  const [mandates, setMandates] = useState<any[]>([]);
  useEffect(() => { api.get("/brokers/me").then((d: any) => setMandates(d.mandates || [])).catch(() => {}); }, []);
  return (<div className="space-y-6"><h1 className="text-3xl font-bold">Broker Mandates</h1>{mandates.map((m:any) => (<div key={m.id} className="p-4 border rounded"><h3 className="font-bold">{m.title}</h3><Badge>{m.status}</Badge></div>))}</div>);
}
