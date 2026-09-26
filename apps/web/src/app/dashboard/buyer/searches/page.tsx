"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Loader2,
  Trash2,
  ArrowRight,
  ChevronRight,
  Clock,
  ExternalLink,
  Mail
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { motion } from "framer-motion";

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSearches() {
        setIsLoading(true);
        try {
            const data = await api.get("/marketplace/saved-searches");
            setSearches(data);
        } catch (e) {
            console.error("Failed to fetch saved searches");
        } finally {
            setIsLoading(false);
        }
    }
    fetchSearches();
  }, []);

  const handleDelete = async (id: string) => {
    try {
        await api.delete(`/marketplace/saved-searches/${id}`);
        setSearches(prev => prev.filter(s => s.id !== id));
    } catch (e) {
        alert("Failed to delete search");
    }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Saved Searches</h1>
          <p className="text-muted-foreground mt-1">Manage your automated marketplace alerts.</p>
        </div>
        <Link href="/marketplace">
          <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 border-none text-white">
            <Search className="w-4 h-4 mr-2" />
            Explore Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {searches.map((search) => (
          <Card key={search.id} className="overflow-hidden group hover:border-accent/50 transition-colors shadow-sm rounded-3xl bg-white border-none">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Search Info */}
                <div className="flex-1 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                      <Search className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-primary italic uppercase">{search.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(search.filters || {}).map(([key, value]) => (
                          <span key={key} className="text-[10px] bg-secondary/50 px-3 py-1 rounded-full text-muted-foreground font-black uppercase tracking-tighter">
                            {key.replace('_', ' ')}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-accent" />
                      Last match recently
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-accent" />
                      Active Monitoring
                    </span>
                  </div>
                </div>

                {/* Alert Settings */}
                <div className="bg-secondary/10 border-t md:border-t-0 md:border-l p-8 md:w-80">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-accent animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Alert Status</span>
                      </div>
                      <Badge className="bg-accent text-white border-none uppercase font-black text-[8px] tracking-widest">
                        Instant
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="text-[10px] font-black uppercase h-10 rounded-xl border-2 hover:bg-slate-50 transition-all">
                        <Mail className="w-4 h-4 mr-2 text-accent" />
                        Alerts On
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] font-black uppercase h-10 rounded-xl border-2 text-destructive hover:bg-destructive/5 transition-all" onClick={() => handleDelete(search.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    <Link href={`/marketplace?${new URLSearchParams(search.filters).toString()}`}>
                        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-10 group-hover:bg-accent group-hover:text-white rounded-xl transition-all">
                        View Matches
                        <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {searches.length === 0 && (
          <div className="text-center py-24 bg-secondary/20 rounded-2xl border-2 border-dashed">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-primary">No saved searches</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Save your filters on the marketplace to automatically track new business listings.
            </p>
            <Link href="/marketplace" className="mt-6 inline-block">
              <Button>Go to Marketplace</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Matching Tips */}
      <Card className="bg-primary text-primary-foreground border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Instant Notifications Activated</h3>
              <p className="text-primary-foreground/70 mt-2">
                We'll email you the moment a listing matching your criteria goes live. Professional buyers who respond within the first 24 hours have a 65% higher success rate.
              </p>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 border-none px-8">
              Alert Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
