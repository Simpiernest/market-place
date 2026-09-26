"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/marketplace/listing-card";
import { MarketplaceFilters } from "@/components/marketplace/filters";
import { AISearchBar } from "@/components/marketplace/ai-search-bar";
import { SortDropdown } from "@/components/marketplace/sort-dropdown";
import { Button } from "@/components/ui/button";
import { Filter, Loader2, X, Bot } from "lucide-react";
import { api } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

export default function MarketplacePage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        const search = searchParams.get("search") || "";
        const sort = searchParams.get("sort") || "";
        const minPrice = searchParams.get("min_price") || "";
        const maxPrice = searchParams.get("max_price") || "";
        const minProfit = searchParams.get("min_profit") || "";
        const category = searchParams.get("category") || "";
        const isAi = searchParams.get("ai") === "true";

        const data = await api.get(`/marketplace?search=${search}&sort=${sort}&min_price=${minPrice}&max_price=${maxPrice}&min_profit=${minProfit}&category_slug=${category}&ai_match=${isAi}`);
        setListings(data.items);
        setTotal(data.total);
      } catch (e) {
        console.error("Failed to fetch listings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, [searchParams]);

  return (
    <div className="container py-12 space-y-12">
      <div className="text-center space-y-4">
        {searchParams.get("ai") === "true" ? (
          <div className="animate-in fade-in zoom-in duration-500">
             <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20 mb-4">
                <Bot className="w-4 h-4 animate-bounce" />
                AI-Optimized Matches
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Intelligent <span className="text-accent">Discovery.</span></h1>
          </div>
        ) : (
          <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">{t("marketplace.title")} <span className="text-accent">Opportunities.</span></h1>
        )}
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed italic">{t("marketplace.subtitle")}</p>
        <div className="pt-4">
          <AISearchBar />
        </div>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Showing {listings.length} of {total || listings.length} listings</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none md:hidden font-black uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl border-2 hover:bg-secondary transition-all cursor-pointer"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="w-4 h-4 mr-2 text-accent" />
                Filters
              </Button>
              <SortDropdown />
            </div>
          </div>

          <AnimatePresence>
            {showMobileFilters && (
                <div className="fixed inset-0 z-[150] md:hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileFilters(false)}
                        className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black uppercase italic text-primary">Advanced <span className="text-accent">Filters.</span></h2>
                            <Button variant="ghost" size="icon" className="rounded-full bg-secondary" onClick={() => setShowMobileFilters(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <MarketplaceFilters />
                        </div>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {listings.length > 0 ? (
                  listings.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <ListingCard {...listing} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center space-y-6"
                  >
                    <div className="relative h-40 w-40 mx-auto">
                        <div className="absolute inset-0 bg-secondary rounded-full opacity-20 animate-ping" />
                        <div className="relative h-full w-full rounded-full bg-secondary flex items-center justify-center">
                            <Filter className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    </div>
                    <div className="max-w-xs mx-auto space-y-2">
                        <h3 className="text-2xl font-black uppercase italic text-primary">{t("marketplace.no_results")}</h3>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed">The AI Broker is standing by. Try broadening your criteria or search by industry.</p>
                    </div>
                    <Button variant="outline" className="font-black uppercase text-[10px] h-10 px-8 rounded-xl border-2" onClick={() => window.location.href='/marketplace'}>Reset All Filters</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {listings.length > 0 && !isLoading && (
            <div className="mt-12 flex justify-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled className="h-10 px-4 rounded-lg font-bold">Prev</Button>
                <Button variant="outline" size="sm" className="h-10 w-10 bg-primary text-white border-none rounded-lg">1</Button>
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-lg hover:bg-secondary">2</Button>
                <Button variant="outline" size="sm" className="h-10 px-4 rounded-lg font-bold hover:bg-secondary">Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

