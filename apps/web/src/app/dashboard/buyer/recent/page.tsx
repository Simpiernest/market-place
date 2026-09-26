import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function RecentlyViewedPage() {
  const [recent, setRecent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      setIsLoading(true);
      try {
        const data = await api.get("/buyers/recent");
        setRecent(data.map((l: any) => ({
            id: l.id,
            title: l.title,
            category: l.category?.name || "SaaS",
            askingPrice: l.asking_price,
            revenue: l.monthly_revenue || 0,
            profit: l.monthly_profit || 0,
            age: "2 years",
            location: l.business?.location || "Remote",
            isVerified: l.is_verified,
            slug: l.slug || l.id
        })));
      } catch (e) {
        console.error("Failed to fetch recent history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecent();
  }, []);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary uppercase italic">Recently <span className="text-accent">Viewed.</span></h1>
            <p className="text-muted-foreground font-medium">Continue evaluating your most recent discoveries.</p>
         </div>
         <Button variant="ghost" className="text-destructive hover:bg-destructive/5 font-bold">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
         </Button>
      </div>

      {recent.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {recent.map(listing => (
             <ListingCard key={listing.id} {...listing} />
           ))}
        </div>
      ) : (
        <div className="h-[400px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center p-12 space-y-6">
           <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground opacity-30">
              <History className="w-8 h-8" />
           </div>
           <div className="space-y-2 max-w-xs">
              <h3 className="text-lg font-bold text-primary">No browsing history yet</h3>
              <p className="text-xs text-muted-foreground">Start exploring the marketplace to keep track of your findings here.</p>
           </div>
           <Link href="/marketplace">
              <Button className="font-bold">Explore Listings</Button>
           </Link>
        </div>
      )}
    </div>
  );
}
