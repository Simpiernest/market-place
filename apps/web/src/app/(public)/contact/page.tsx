import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Globe, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container py-24">
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-8">
           <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Get in <span className="text-accent">Touch.</span></h1>
           <p className="text-xl text-muted-foreground leading-relaxed">Our acquisition experts are ready to help you navigate the marketplace.</p>

           <div className="space-y-6">
              {[
                { label: "Email Support", value: "support@businessbridge.com", icon: Mail },
                { label: "Sales Inquiries", value: "deals@businessbridge.com", icon: MessageSquare },
                { label: "Global HQ", value: "Accra, Ghana / London, UK", icon: MapPin },
              ].map(item => (
                <div key={item.label} className="flex gap-4 p-4 rounded-2xl bg-secondary/20 border border-secondary">
                   <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                      <item.icon className="h-5 h-5" />
                   </div>
                   <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</div>
                      <div className="text-lg font-bold text-primary">{item.value}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <Card className="border-none shadow-2xl p-4">
           <CardHeader>
              <CardTitle className="text-2xl font-bold">Send a Message</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                    <Input placeholder="John Doe" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                    <Input placeholder="john@example.com" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground">Subject</label>
                 <select className="w-full h-11 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                    <option>Selling a Business</option>
                    <option>Buying Inquiries</option>
                    <option>Verification Support</option>
                    <option>Partnerships</option>
                    <option>Other</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
                 <Textarea placeholder="How can we help you?" className="min-h-[150px]" />
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 border-none font-black h-12 uppercase tracking-widest">
                 Send Message
              </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
