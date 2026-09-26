export default function AboutPage() {
  return (
    <div className="container py-24 space-y-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">About <span className="text-accent">Business Bridge.</span></h1>
      <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-6">
        <p className="text-xl font-medium text-primary">Business Bridge is the world's most trusted marketplace for buying and selling online businesses and digital assets.</p>
        <p>Founded with the mission to professionalize the digital M&A space, we've built a platform that combines rigorous verification, secure transaction infrastructure, and institutional-grade tools for entrepreneurs and investors.</p>
        <h2 className="text-2xl font-bold text-primary pt-8">Our Vision</h2>
        <p>We believe that digital assets are the most valuable asset class of the 21st century. Our goal is to provide the bridge that allows entrepreneurs to exit their successful ventures and investors to acquire cash-flowing businesses with total confidence.</p>
        <h2 className="text-2xl font-bold text-primary pt-8">Global Reach, Local Impact</h2>
        <p>Operating across Africa, Europe, North America, and Australia, we facilitate cross-border acquisitions while ensuring local compliance and tax efficiency for all parties involved.</p>
      </div>
    </div>
  );
}
