"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  DollarSign,
  BarChart3,
  Briefcase,
  Target,
  Search,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export default function BuyerMandatePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [mandate, setMandate] = useState({
    title: "",
    industries: [] as string[],
    business_models: [] as string[],
    budget_min: "",
    budget_max: "",
    min_revenue: "",
    min_profit: "",
    specific_requirements: "",
  });

  useEffect(() => {
    async function fetchExistingMandate() {
        try {
            const mandates = await api.get("/buyers/mandates");
            if (mandates.length > 0) {
                const m = mandates[0]; // Just take first one for V1
                setMandate({
                    title: m.title || "",
                    industries: m.industries || [],
                    business_models: m.business_models || [],
                    budget_min: m.budget_min?.toString() || "",
                    budget_max: m.budget_max?.toString() || "",
                    min_revenue: m.min_revenue?.toString() || "",
                    min_profit: m.min_profit?.toString() || "",
                    specific_requirements: m.specific_requirements || ""
                });
            }
        } catch (e) {}
    }
    fetchExistingMandate();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await api.post("/buyers/mandates", {
            ...mandate,
            budget_min: mandate.budget_min ? Number(mandate.budget_min) : null,
            budget_max: mandate.budget_max ? Number(mandate.budget_max) : null,
            min_revenue: mandate.min_revenue ? Number(mandate.min_revenue) : null,
            min_profit: mandate.min_profit ? Number(mandate.min_profit) : null,
        });
        alert("Acquisition mandate activated successfully.");
    } catch (e) {
        alert("Failed to save mandate.");
    } finally {
        setIsSaving(false);
    }
  };

  const industries = ["SaaS", "Ecommerce", "Content", "Apps", "Agency", "Marketplace", "Newsletter"];
  const businessModels = ["Subscription", "Marketplace", "Advertising", "Physical Goods", "Service"];

  const toggleItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/buyer">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Acquisition Mandate</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle>Define Your Target</CardTitle>
              <CardDescription>
                A clear mandate helps us match you with the right opportunities and notifies sellers of your serious interest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 py-6">
              {/* Title Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mandate Name</label>
                <Input
                  placeholder="e.g., Profitable B2B SaaS in North America"
                  value={mandate.title}
                  onChange={(e) => setMandate({...mandate, title: e.target.value})}
                />
              </div>

              {/* Industries */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Industries</label>
                <div className="flex flex-wrap gap-2">
                  {industries.map(industry => (
                    <Badge
                      key={industry}
                      variant={mandate.industries.includes(industry) ? "default" : "outline"}
                      className="cursor-pointer py-1.5 px-3 text-sm"
                      onClick={() => setMandate({...mandate, industries: toggleItem(mandate.industries, industry)})}
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Financial Requirements */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min. Annual Revenue</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={mandate.minRevenue}
                      onChange={(e) => setMandate({...mandate, minRevenue: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min. Annual Profit</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={mandate.minProfit}
                      onChange={(e) => setMandate({...mandate, minProfit: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min. Budget</label>
                  <Input
                    type="number"
                    placeholder="Min ($)"
                    value={mandate.budgetMin}
                    onChange={(e) => setMandate({...mandate, budgetMin: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max. Budget</label>
                  <Input
                    type="number"
                    placeholder="Max ($)"
                    value={mandate.budgetMax}
                    onChange={(e) => setMandate({...mandate, budgetMax: e.target.value})}
                  />
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specific Requirements</label>
                <Textarea
                  placeholder="e.g., Must have at least 50% recurring revenue, no single customer > 10% of total revenue..."
                  className="min-h-[120px]"
                  value={mandate.specific_requirements}
                  onChange={(e) => setMandate({...mandate, specific_requirements: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/10 flex justify-end p-6">
              <Button
                size="lg"
                className="px-12 bg-accent hover:bg-accent/90 border-none text-white"
                onClick={handleSave}
                loading={isSaving}
              >
                Save & Activate Mandate
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Professional Matching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-primary-foreground/80">
              <p>Your mandate acts as a "Reverse Listing".</p>
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <p>Receive instant notifications for new listings that fit your criteria.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <p>Sellers can see your mandate and invite you to view private listings.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <p>Build a track record of serious intent on the platform.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mandate.industries.map(i => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {i}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setMandate({...mandate, industries: toggleItem(mandate.industries, i)})} />
                  </Badge>
                ))}
                {mandate.industries.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No industries selected yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
