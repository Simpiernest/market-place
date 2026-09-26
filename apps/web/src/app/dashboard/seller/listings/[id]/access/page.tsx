"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Lock,
    Globe,
    UserPlus,
    Trash2,
    ShieldCheck,
    Users,
    ArrowLeft,
    Loader2,
    Eye,
    ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function ListingAccessPage() {
  const params = useParams();
  const id = params.id as string;
  const [listing, setListing] = useState<any>(null);
  const [accessList, setAccessList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [listingData, accessData] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/listing-access/${id}`)
        ]);
        setListing(listingData);
        setAccessList(accessData);
      } catch (e) {
        console.error("Failed to fetch access data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsGranting(true);
    try {
      // Logic for granting access
      await api.post("/listing-access/grant", {
        listing_id: id,
        email: newEmail
      });
      alert(`Access granted to ${newEmail}`);
      setNewEmail("");
      // Refresh list
      const updatedAccess = await api.get(`/listing-access/${id}`);
      setAccessList(updatedAccess);
    } catch (e) {
      alert("Failed to grant access. Ensure the user exists.");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevoke = async (accessId: string) => {
    if (!confirm("Revoke access for this user?")) return;
    try {
      await api.delete(`/listing-access/${accessId}`);
      setAccessList(prev => prev.filter(a => a.id !== accessId));
    } catch (e) {
      alert("Failed to revoke access");
    }
  };

  const updateVisibility = async (visibility: string) => {
    try {
        await api.patch(`/listings/${id}`, { visibility });
        setListing({ ...listing, visibility });
    } catch (e) {
        alert("Failed to update visibility");
    }
  };

  if (isLoading || !listing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href={`/dashboard/seller/listings`} className="text-[10px] font-black uppercase text-accent flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Listings
          </Link>
          <h1 className="text-3xl font-black text-primary uppercase italic">Access <span className="text-accent">Control.</span></h1>
          <p className="text-muted-foreground font-medium">Manage visibility and private authorizations for <span className="text-primary font-bold italic">"{listing.title}"</span></p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Visibility Controls */}
        <Card className="lg:col-span-1 border-none shadow-sm overflow-hidden flex flex-col rounded-3xl">
           <CardHeader className="p-8 bg-secondary/10 border-b">
              <CardTitle className="text-lg font-bold">Listing Visibility</CardTitle>
              <CardDescription className="text-xs">Control who can discover this listing.</CardDescription>
           </CardHeader>
           <CardContent className="p-8 space-y-6">
              {[
                {
                  id: 'PUBLIC',
                  label: 'Public',
                  desc: 'Visible to all marketplace visitors.',
                  icon: Globe,
                  color: 'text-green-600 bg-green-50'
                },
                {
                  id: 'PRIVATE',
                  label: 'Private',
                  desc: 'Invite-only. Hidden from search.',
                  icon: Lock,
                  color: 'text-primary bg-secondary/50'
                },
                {
                  id: 'UNLISTED',
                  label: 'Unlisted',
                  desc: 'Only accessible via direct URL.',
                  icon: Eye,
                  color: 'text-amber-600 bg-amber-50'
                },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => updateVisibility(mode.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 group",
                    listing.visibility === mode.id ? "border-accent bg-accent/5" : "border-secondary hover:border-accent/20"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", mode.color)}>
                    <mode.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-primary uppercase tracking-tight">{mode.label}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">{mode.desc}</div>
                  </div>
                </button>
              ))}
           </CardContent>
           <CardFooter className="p-8 bg-primary text-white rounded-b-3xl mt-auto">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
                <p className="text-[10px] leading-relaxed font-medium">
                  Private listings are hidden from our AI Broker unless specific mandates match with high confidence.
                </p>
              </div>
           </CardFooter>
        </Card>

        {/* Access Management */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
              <CardHeader className="p-8 bg-secondary/10 border-b">
                 <CardTitle className="text-lg font-bold">Authorized Buyers</CardTitle>
                 <CardDescription className="text-xs">Grant institutional or individual access to this listing.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                 <form onSubmit={handleGrantAccess} className="flex gap-3 mb-8">
                    <div className="flex-1 relative">
                       <UserPlus className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                       <Input
                         value={newEmail}
                         onChange={(e) => setNewEmail(e.target.value)}
                         placeholder="Enter buyer email address..."
                         className="pl-11 h-11 rounded-xl border-2 border-secondary focus:border-accent font-medium"
                       />
                    </div>
                    <Button
                      type="submit"
                      disabled={isGranting}
                      className="bg-primary text-white font-black uppercase text-[10px] px-8 h-11 rounded-xl shadow-lg shadow-primary/10 hover:bg-accent transition-all"
                    >
                       {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Grant Access"}
                    </Button>
                 </form>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Current Authorized Users</h4>
                    <div className="divide-y border rounded-2xl overflow-hidden">
                       {accessList.length > 0 ? accessList.map((access) => (
                         <div key={access.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black text-primary uppercase">
                                  {access.user_email[0]}
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-primary">{access.user_email}</div>
                                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Granted {new Date(access.created_at).toLocaleDateString()}</div>
                               </div>
                            </div>
                            <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                               onClick={() => handleRevoke(access.id)}
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                       )) : (
                         <div className="p-12 text-center text-muted-foreground italic text-xs font-medium uppercase tracking-widest opacity-50 bg-secondary/5">
                            No individual access granted yet.
                         </div>
                       )}
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Institutional Groups Preview */}
           <Card className="border-none shadow-sm bg-accent/5 border border-accent/10 rounded-3xl overflow-hidden">
              <CardHeader className="p-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Users className="h-5 w-5 text-accent" />
                       <CardTitle className="text-lg font-bold">Access Groups</CardTitle>
                    </div>
                    <Badge className="bg-accent text-white border-none uppercase text-[8px] font-black tracking-widest">Institutional Feature</Badge>
                 </div>
                 <CardDescription className="text-xs font-medium">Create groups for your trusted pool of buyers.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                 <div className="p-6 rounded-2xl bg-white border border-accent/10 flex flex-col items-center justify-center text-center space-y-4">
                    <ShieldAlert className="w-10 h-10 text-accent/20" />
                    <p className="text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">
                       Upgrade to an <span className="font-bold text-primary italic">Institutional Account</span> to manage trusted buyer groups and perform bulk deal distribution.
                    </p>
                    <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest h-10 px-8 rounded-xl border-2">Learn More</Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
