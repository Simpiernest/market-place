"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical, Edit3, Trash2, Zap, Globe, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminCategoriesPage() {
  const categories = [
    { id: "1", name: "SaaS", slug: "saas", listings: 1248, status: "Active", icon: Zap },
    { id: "2", name: "Ecommerce", slug: "ecommerce", listings: 842, status: "Active", icon: Globe },
    { id: "3", name: "Mobile Apps", slug: "mobile-apps", listings: 212, status: "Active", icon: Zap },
    { id: "4", name: "Agencies", slug: "agencies", listings: 154, status: "Disabled", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">Marketplace <span className="text-accent">Categories.</span></h1>
          <p className="text-muted-foreground font-medium">Organize and manage the taxonomy of the global marketplace.</p>
        </div>
        <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8">
           <Plus className="w-4 h-4 mr-2" />
           New Category
        </Button>
      </div>

      <div className="grid gap-4">
         {categories.map(cat => (
           <Card key={cat.id} className="border-none shadow-sm hover:shadow-xl transition-all group">
              <CardContent className="p-0 flex items-center">
                 <div className="p-4 px-6 border-r text-muted-foreground/30 group-hover:text-accent transition-colors cursor-move">
                    <GripVertical className="w-5 h-5" />
                 </div>
                 <div className="p-6 flex-1 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors">
                          <cat.icon className="h-5 w-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-primary">{cat.name}</h3>
                          <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">slug: /{cat.slug}</div>
                       </div>
                    </div>

                    <div className="text-center px-8 border-x">
                       <div className="text-xl font-black text-primary">{cat.listings}</div>
                       <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Active Listings</div>
                    </div>

                    <div className="flex items-center gap-6">
                       <Badge variant="outline" className={cat.status === 'Active' ? "border-green-500/20 text-green-600 bg-green-50 uppercase text-[8px] font-black tracking-widest" : "border-secondary text-muted-foreground uppercase text-[8px] font-black tracking-widest"}>
                          {cat.status}
                       </Badge>
                       <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/5"><Trash2 className="w-4 h-4" /></Button>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
