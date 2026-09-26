import { FAQ } from "@/components/home/faq";

export default function FAQPage() {
  return (
    <div className="py-12">
      <div className="container text-center mb-12">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">Help <span className="text-accent">Center.</span></h1>
         <p className="text-lg text-muted-foreground mt-4">Find answers to common questions about buying and selling.</p>
      </div>
      <FAQ />
    </div>
  );
}
