"use client";

import { useEffect, useState, use } from "react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { MarketplaceFilters } from "@/components/marketplace/filters";
import { SortDropdown } from "@/components/marketplace/sort-dropdown";
import { Button } from "@/components/ui/button";
import { Filter, ArrowRight, TrendingUp, Users, DollarSign, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useSearchParams } from "next/navigation";

export default function CategoryPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const { slug } = params;

  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        const sort = searchParams.get("sort") || "";
        const minPrice = searchParams.get("min_price") || "";
        const maxPrice = searchParams.get("max_price") || "";
        const minProfit = searchParams.get("min_profit") || "";

        const data = await api.get(`/marketplace?category_slug=${slug}&sort=${sort}&min_price=${minPrice}&max_price=${maxPrice}&min_profit=${minProfit}`);
        setListings(data.items);
      } catch (e) {
        console.error("Failed to fetch category listings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, [slug, searchParams]);

  const stats = [
    { label: "Active Listings", value: "842", icon: BarChart3 },
    { label: "Avg. Sale Multiple", value: "3.4x", icon: TrendingUp },
    { label: "Total Volume", value: "$45M", icon: DollarSign },
    { label: "Verified Buyers", value: "1.2k", icon: Users },
  ];

  if (!slug) return null;

  return (
    <div className="container py-12 space-y-12">
      {/* Category Header */}
      <div className="relative rounded-3xl bg-primary p-12 text-primary-foreground overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
         <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl uppercase italic">
              {categoryName} <span className="text-accent">MARKETPLACE.</span>
            </h1>
            <p className="mt-6 text-xl text-primary-foreground/80 leading-relaxed font-medium">
              Find and acquire high-performance {categoryName} businesses. Every listing is vetted by our compliance team to ensure financial accuracy and ownership verification.
            </p>
            <div className="mt-10 flex gap-4">
               <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-none font-black px-8 h-14 rounded-2xl shadow-xl shadow-accent/20 transition-all cursor-pointer">
                 Sell Your {categoryName}
               </Button>
               <Button size="lg" variant="outline" className="border-white/40 !text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl backdrop-blur-md transition-all cursor-pointer">
                 Market Insights
               </Button>
            </div>
         </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-primary">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24">
            <MarketplaceFilters />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-primary">All {categoryName} Listings</h2>
              <p className="text-muted-foreground mt-1 font-medium">Showing {listings.length} of 842 listings</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none md:hidden font-bold text-[10px] uppercase tracking-widest h-11 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <SortDropdown />
            </div>
          </div>

          {/* Listing Grid */}
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.length > 0 ? (
                    listings.map((listing) => (
                        <ListingCard key={listing.id} {...listing} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto opacity-20">
                            <Filter className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic">No listings in this category.</h3>
                    </div>
                )}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" className="px-12 font-bold">
              Load More Listings
            </Button>
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <section className="bg-secondary/30 rounded-3xl p-8 md:p-16">
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-3xl font-bold text-primary mb-6">Buying a {categoryName} Business?</h2>
               <p className="text-muted-foreground leading-relaxed mb-8">
                 {categoryName} acquisitions require specific due diligence. From analyzing churn rates in SaaS to evaluating supply chain resilience in Ecommerce, our guides cover everything you need to know.
               </p>
               <Link href={`/resources/how-to-buy-${slug}`}>
                 <Button className="font-bold">
                   Read the {categoryName} Buying Guide
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { title: "Valuation Factors", desc: "Key metrics that drive multiples in this sector." },
                 { title: "Due Diligence", desc: "Critical checklist for verified acquisitions." },
                 { title: "Deal Structuring", desc: "Common agreement types for digital assets." },
                 { title: "Risk Mitigation", desc: "Protecting your investment post-close." },
               ].map(item => (
                 <Card key={item.title} className="bg-white border-none shadow-sm">
                   <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-bold text-accent uppercase tracking-widest">{item.title}</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                   </CardContent>
                 </Card>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
