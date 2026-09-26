"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Star,
    MessageSquare,
    ShieldCheck,
    Zap,
    Loader2,
    ArrowRight,
    Heart,
    Award
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    accuracy: 0,
    professionalism: 0
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function fetchDeal() {
      setIsLoading(true);
      try {
        const data = await api.get(`/transactions/${id}`);
        setDeal(data);
      } catch (e) {
        console.error("Failed to fetch deal for review");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDeal();
  }, [id]);

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
        alert("Please provide an overall rating.");
        return;
    }
    setIsSubmitting(true);
    try {
        // Logic to submit review
        await api.post(`/transactions/${deal.id}/reviews`, {
            rating: ratings.overall,
            comment: comment,
            communication_rating: ratings.communication,
            accuracy_rating: ratings.accuracy
        });
        setIsSuccess(true);
        setTimeout(() => {
            router.push(`/dashboard/deals/${deal.id}`);
        }, 3000);
    } catch (e) {
        alert("Failed to submit review.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading || !deal) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const StarRating = ({ label, value, field }: { label: string, value: number, field: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-secondary/50 last:border-none">
       <span className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</span>
       <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRatings({ ...ratings, [field]: star })}
              className={cn(
                "transition-all active:scale-90",
                value >= star ? "text-accent" : "text-secondary hover:text-accent/40"
              )}
            >
              <Star className={cn("w-6 h-6", value >= star ? "fill-current" : "")} />
            </button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8"
          >
             <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center text-white shadow-2xl">
                <Heart className="w-12 h-12 fill-current" />
             </div>
             <div className="space-y-2">
                <h1 className="text-4xl font-black text-primary uppercase italic">Review <span className="text-accent">Submitted.</span></h1>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">Thank you for helping us build a trusted marketplace. Your feedback has been recorded permanently.</p>
             </div>
             <Button variant="outline" className="font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl border-2" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
             </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                    <Award className="w-3 h-3" /> Acquisition complete
                </div>
                <h1 className="text-4xl font-black text-primary uppercase italic">Rate Your <span className="text-accent">Experience.</span></h1>
                <p className="text-muted-foreground font-medium">Provide feedback on your transaction for <span className="text-primary font-bold italic">"{deal.listing_title}"</span></p>
            </div>

            <div className="grid gap-8 md:grid-cols-5">
                <div className="md:col-span-3 space-y-8">
                    <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
                        <CardHeader className="p-8 bg-secondary/10 border-b">
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Institutional Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <StarRating label="Overall Experience" value={ratings.overall} field="overall" />
                            <StarRating label="Communication" value={ratings.communication} field="communication" />
                            <StarRating label="Data Accuracy" value={ratings.accuracy} field="accuracy" />
                            <StarRating label="Professionalism" value={ratings.professionalism} field="professionalism" />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm overflow-hidden rounded-[2rem]">
                        <CardHeader className="p-8 bg-secondary/10 border-b">
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Public Commentary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Describe the seller's transparency, responsiveness, and handover quality..."
                                className="min-h-[150px] rounded-2xl border-2 border-secondary focus:border-accent font-medium p-6 bg-slate-50/50 transition-all"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-primary text-white border-none rounded-[2rem] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="w-32 h-32 text-accent" />
                        </div>
                        <CardHeader className="p-8 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white mb-4">
                                <Star className="w-6 h-6 fill-current" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-tight">Reputation <span className="text-accent">Engine.</span></CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <p className="text-xs text-white/70 leading-relaxed font-medium">
                                Your review is immutable and will be tied to the counterpart's permanent profile.
                            </p>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3 items-start">
                                <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <p className="text-[10px] text-white/60 leading-relaxed italic">"Serious reviews help attract professional capital and verified buyers to the marketplace."</p>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-white text-primary hover:bg-accent hover:text-white border-none font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 group"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Institutional Review <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="p-6 rounded-2xl bg-secondary/30 flex gap-4 items-start">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            Only verified transaction participants can submit reviews. Feedback is scanned by AI for policy compliance.
                        </p>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
