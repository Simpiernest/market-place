"use client";

import { EducationalResources } from "@/components/home/educational-resources";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";

export default function ResourcesLibraryPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["M&A Strategy", "Valuation", "Due Diligence", "Buying", "Selling", "Legal"];

  const allArticles = [
    { id: 1, title: "How to Structure a Performance-Based Earnout in 2024", category: "M&A Strategy", slug: "structure-earnout" },
    { id: 2, title: "SaaS Valuation Metrics: ARR vs SDE", category: "Valuation", slug: "saas-metrics" },
    { id: 3, title: "Technical Due Diligence Checklist for Founders", category: "Due Diligence", slug: "technical-dd" },
    { id: 4, title: "Common Legal Pitfalls in Digital Asset Transfers", category: "Legal", slug: "legal-pitfalls" },
    { id: 5, title: "How to Prepare Your Store for a Shopify Exit", category: "Selling", slug: "shopify-exit" },
    { id: 6, title: "Financing Your Next Acquisition with SBA Loans", category: "Buying", slug: "sba-loans" },
  ];

  const filteredArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 space-y-12">
      <div className="container">
         <div className="max-w-3xl space-y-6">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-white shadow-lg">
               <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">{t("resources.title")}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">{t("resources.subtitle")}</p>

            <div className="flex gap-4 pt-4">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("resources.search_placeholder") || "Search guides and articles..."}
                    className="pl-10 h-11 rounded-xl font-bold bg-white"
                  />
               </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 hover:bg-secondary transition-all cursor-pointer">
                        <Filter className="w-4 h-4 mr-2 text-accent" />
                        {t("resources.categories") || "Categories"}
                        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl border-none bg-white min-w-[200px]">
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => setSearchTerm(cat)}
                        className="hover:bg-accent hover:text-white transition-all cursor-pointer rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"
                      >
                        {cat}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </div>
      <EducationalResources />

      {/* Article Grid Placeholder */}
      <section className="container pb-24">
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredArticles.length > 0 ? filteredArticles.map(article => (
              <Link key={article.id} href={`/resources/${article.slug}`} className="group block cursor-pointer">
                <div className="h-56 bg-secondary/30 rounded-3xl mb-6 relative overflow-hidden transition-all group-hover:shadow-2xl group-hover:-translate-y-1">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/10 font-black uppercase tracking-widest text-4xl group-hover:scale-110 transition-transform duration-500">
                       {article.category.split(' ')[0]}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                       <span className="h-1 w-1 rounded-full bg-accent" />
                       {article.category}
                    </div>
                    <h3 className="text-xl font-black text-primary group-hover:text-accent transition-colors leading-tight italic uppercase">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium italic">Practical insights on {article.category.toLowerCase()} for the modern acquisition landscape.</p>
                    <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Updated Aug 2024 • 8 min read</div>
                </div>
              </Link>
            )) : (
                <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground italic font-medium">No resources found matching your search.</p>
                    <Button variant="link" onClick={() => setSearchTerm("")} className="text-accent font-black uppercase text-[10px]">Clear Search</Button>
                </div>
            )}
         </div>
      </section>
    </div>
  );
}
