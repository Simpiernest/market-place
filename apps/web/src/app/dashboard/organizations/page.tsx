"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Shield,
  Settings,
  Mail,
  ChevronRight,
  Loader2,
  Building,
  UserPlus
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgs() {
      setIsLoading(true);
      try {
        const data = await api.get("/organizations");
        setOrgs(data || []);
      } catch (e) {
        console.error("Failed to fetch organizations");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Team & <span className="text-accent">Organizations.</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Manage institutional acquisition teams and shared assets.</p>
        </div>
        <Button
            className="bg-primary text-white border-none font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 hover:bg-accent transition-all cursor-pointer active:scale-95 w-full sm:w-auto mt-4 sm:mt-0"
            onClick={async () => {
                const name = prompt("Enter Organization Name:");
                if (name) {
                    try {
                        await api.post("/organizations", { name, slug: name.toLowerCase().replace(/\s+/g, '-') });
                        alert("Organization creation request submitted. Our team will verify your institutional status.");
                        window.location.reload();
                    } catch (err) {
                        console.error("Org creation error:", err);
                        alert("Could not connect to service. Please check your internet connection and try again.");
                    }
                }
            }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>

      <div className="grid gap-8">
        {orgs.length > 0 ? orgs.map((org) => (
          <Card key={org.id} className="border-none shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-secondary/10 border-b p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                            <Building className="w-8 h-8" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-primary uppercase italic">{org.name}</CardTitle>
                            <CardDescription className="font-bold text-muted-foreground mt-1">Institutional Investment Firm • {org.members?.length || 0} Members</CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-2 font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl">
                            <UserPlus className="w-4 h-4 mr-2" /> Invite
                        </Button>
                        <Button variant="outline" className="border-2 font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {org.members?.map((member: any) => (
                        <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                                    {member.user.full_name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-primary">{member.user.full_name}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{member.user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest">{member.role}</Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        )) : (
            <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-secondary/5 space-y-4">
                <Users className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-primary uppercase italic tracking-widest">No active organizations</p>
                    <p className="text-xs text-muted-foreground font-medium italic">Create an organization to collaborate with your acquisition team.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
