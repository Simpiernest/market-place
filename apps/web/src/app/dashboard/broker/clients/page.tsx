"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BrokerClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => { api.get("/brokers/clients").then((d: any) => setClients(d.clients || [])).catch(() => {}); }, []);
  return (<div className="space-y-6"><h1 className="text-3xl font-bold">Broker Clients</h1><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead></TableRow></TableHeader><TableBody>{clients.map((c:any) => (<TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.type}</TableCell></TableRow>))}</TableBody></Table></div>);
}
