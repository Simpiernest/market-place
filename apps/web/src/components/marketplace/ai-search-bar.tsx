"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bot, Search, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export function AISearchBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSearch = () => {
    if (!query) return;
    if (isAiMode) {
      setIsThinking(true);
      // Simulate AI conversion logic
      setTimeout(() => {
        setIsThinking(false);
        router.push(`/marketplace?search=${encodeURIComponent(query)}&ai=true`);
      }, 1500);
    } else {
      router.push(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto w-full group">
      <div className={cn(
        "relative flex items-center transition-all duration-300 rounded-2xl p-1.5 shadow-sm border overflow-hidden bg-white",
        isAiMode ? "border-accent ring-4 ring-accent/10" : "border-secondary-foreground/10 group-hover:border-secondary-foreground/20"
      )}>
        <div className="flex-1 flex items-center gap-3 px-3">
          {isAiMode ? (
            <Bot className="w-5 h-5 text-accent animate-pulse" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder={isAiMode ? "Describe your ideal acquisition target..." : t("common.search_placeholder")}
            className="flex-1 bg-transparent border-none outline-none py-3 text-primary font-medium placeholder:text-muted-foreground/60"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="flex items-center gap-2">
          {query && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setQuery("")}>
              <X className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 px-3 rounded-xl transition-all",
              isAiMode ? "bg-accent/10 text-accent font-bold" : "text-muted-foreground"
            )}
            onClick={() => setIsAiMode(!isAiMode)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>

          <Button
            className={cn(
              "h-10 px-6 rounded-xl border-none transition-all cursor-pointer",
              isAiMode ? "bg-accent hover:bg-accent/90 text-white" : "bg-primary text-primary-foreground"
            )}
            onClick={handleSearch}
            loading={isThinking}
          >
            <div className="flex items-center">
              {isAiMode ? "Find Matches" : "Search"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Button>
        </div>
      </div>

      {isAiMode && (
        <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-[10px] font-bold uppercase text-muted-foreground/80 pt-1 px-1">Suggested:</span>
          {[
            "Profitable SaaS with low churn",
            "Ecommerce stores under $100k",
            "Digital products with >50% margin",
            "Owner involvement < 5 hrs/week"
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="text-[10px] bg-accent/5 hover:bg-accent/10 text-accent font-semibold px-3 py-1.5 rounded-full border border-accent/10 transition-colors cursor-pointer outline-none active:scale-95"
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
