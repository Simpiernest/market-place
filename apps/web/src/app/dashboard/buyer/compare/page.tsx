import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";

export default function CompareBusinessesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchComparisonData() {
        setIsLoading(true);
        try {
            // In a real flow, IDs would come from state or URL
            // For wiring, we'll fetch recently viewed or just top 2 active listings
            const data = await api.get("/marketplace");
            setListings(data.items.slice(0, 2));
        } catch (e) {
            console.error("Comparison load failed");
        } finally {
            setIsLoading(false);
        }
    }
    fetchComparisonData();
  }, []);

  const comparisonItems = [
    { label: "Price", key: "asking_price", formatter: (val: any) => `$${Number(val).toLocaleString()}` },
    { label: "Revenue (mo)", key: "monthly_revenue", formatter: (val: any) => `$${Number(val).toLocaleString()}` },
    { label: "Profit (mo)", key: "monthly_profit", formatter: (val: any) => `$${Number(val).toLocaleString()}` },
    { label: "Margin", key: "margin", formatter: (val: any, l: any) => `${Math.round((l.monthly_profit / l.monthly_revenue) * 100)}%` },
    { label: "Multiple", key: "multiple", formatter: (val: any, l: any) => `${(l.asking_price / (l.monthly_profit * 12)).toFixed(1)}x` },
    { label: "Verified", key: "is_verified", type: "boolean" },
  ];

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary uppercase italic">Compare <span className="text-accent">Businesses.</span></h1>
            <p className="text-muted-foreground font-medium">Analyze key metrics side-by-side to find the best ROI.</p>
         </div>
         <Button className="bg-accent hover:bg-accent/90 border-none text-white font-black uppercase tracking-widest px-8">
            Save Comparison
         </Button>
      </div>

      <div className="overflow-x-auto pb-4">
         <div className="min-w-[800px] grid grid-cols-4 gap-6">
            <div className="col-span-1 pt-48 space-y-12">
               {comparisonItems.map(item => (
                 <div key={item.label} className="text-xs font-black uppercase tracking-widest text-muted-foreground h-12 flex items-center border-b border-secondary">
                    {item.label}
                 </div>
               ))}
            </div>

            {listings.map((listing, i) => (
              <div key={listing.id} className="col-span-1 space-y-12">
                 <Card className="border-none shadow-xl relative overflow-hidden h-44 flex flex-col justify-end p-6 group rounded-3xl">
                    <button className="absolute top-4 right-4 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-all">
                       <X className="w-3 h-3" />
                    </button>
                    <div className="space-y-1">
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-accent/30 text-accent mb-2">{listing.category?.name || "SaaS"}</Badge>
                       <h3 className="font-black text-primary text-sm leading-tight line-clamp-2 uppercase italic">{listing.title}</h3>
                    </div>
                 </Card>

                 <div className="space-y-12">
                    {comparisonItems.map(item => (
                      <div key={item.label} className="h-12 flex items-center text-sm font-black text-primary border-b border-secondary">
                         {item.type === 'boolean' ? (
                           listing[item.key] ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-muted-foreground/30" />
                         ) : item.formatter ? item.formatter(listing[item.key], listing) : listing[item.key]}
                      </div>
                    ))}
                    <Link href={`/businesses/${listing.slug || listing.id}`}>
                        <Button variant="outline" className="w-full font-bold text-xs uppercase tracking-widest border-2 rounded-xl">View Listing</Button>
                    </Link>
                 </div>
              </div>
            ))}

            {/* Add Column */}
            <div className="col-span-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-accent transition-colors cursor-pointer group">
               <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-white transition-colors">
                  <PlusCircle className="w-6 h-6" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-accent">Add listing to compare</span>
            </div>
         </div>
      </div>
    </div>
  );
}
