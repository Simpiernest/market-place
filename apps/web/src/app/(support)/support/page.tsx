import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, MessageSquare, ShieldCheck, Zap, ArrowRight, LifeBuoy, History } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SupportCenterPage() {
  const categories = [
    { title: "Buying on Business Bridge", icon: ShieldCheck, count: 12 },
    { title: "Selling & Valuations", icon: Zap, count: 8 },
    { title: "Account & Security", icon: BookOpen, count: 5 },
    { title: "Transactions & Escrow", icon: LifeBuoy, count: 15 },
  ];

  return (
    <div className="py-12 space-y-16">
      {/* Hero */}
      <section className="container text-center space-y-8">
         <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
            <LifeBuoy className="h-8 w-8" />
         </div>
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Support <span className="text-accent">Center.</span></h1>
         <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-4 h-6 w-6 text-muted-foreground transition-colors group-hover:text-accent" />
            <input
              placeholder="Search help articles, guides, and FAQs..."
              className="w-full bg-white border-2 border-secondary rounded-2xl pl-14 pr-4 h-16 text-lg font-medium outline-none focus:border-accent transition-all shadow-sm"
            />
         </div>
      </section>

      {/* Category Grid */}
      <section className="container">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Card key={cat.title} className="border-none shadow-sm hover:shadow-xl transition-all cursor-pointer group bg-secondary/10">
                 <CardHeader className="text-center p-8">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors shadow-sm mb-4">
                       <cat.icon className="h-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-bold text-primary group-hover:text-accent transition-colors">{cat.title}</CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest mt-2">{cat.count} Articles</CardDescription>
                 </CardHeader>
              </Card>
            ))}
         </div>
      </section>

      {/* Contact & Active Requests */}
      <section className="container">
         <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <MessageSquare className="w-48 h-48" />
               </div>
               <CardContent className="p-12 space-y-8 relative z-10">
                  <h3 className="text-3xl font-black uppercase italic italic tracking-tight">Need direct help?</h3>
                  <p className="text-lg text-primary-foreground/70 font-medium leading-relaxed">
                     Our acquisition support team is available 24/7 to assist with deal negotiations, verification issues, or technical problems.
                  </p>
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest px-10 h-14 border-none shadow-xl">
                     Open Support Ticket
                  </Button>
               </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-secondary/10">
               <CardHeader>
                  <div className="flex items-center justify-between">
                     <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-accent" />
                        My Requests
                     </CardTitle>
                     <Button variant="ghost" size="sm" className="text-xs font-bold text-accent">View All</Button>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4">
                  {[
                    { title: "Verification ID BB-VAL-092", status: "In Progress", date: "2h ago" },
                    { title: "Data Room Access Issue", status: "Resolved", date: "1d ago" },
                  ].map((ticket) => (
                    <div key={ticket.title} className="flex items-center justify-between p-4 rounded-xl bg-white border shadow-sm group hover:border-accent transition-colors cursor-pointer">
                       <div>
                          <div className="font-bold text-primary text-sm group-hover:text-accent">{ticket.title}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{ticket.date}</div>
                       </div>
                       <Badge variant="outline" className={ticket.status === 'Resolved' ? "border-green-500/20 text-green-600 bg-green-50 uppercase text-[8px] font-black tracking-widest" : "border-amber-500/20 text-amber-600 bg-amber-50 uppercase text-[8px] font-black tracking-widest"}>
                          {ticket.status}
                       </Badge>
                    </div>
                  ))}
               </CardContent>
            </Card>
         </div>
      </section>
    </div>
  );
}
