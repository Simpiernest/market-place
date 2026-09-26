"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Bot,
  Sparkles,
  Wand2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  History
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";

export function AIListingWizard({ businessData, onApply }: { businessData?: any, onApply?: (data: any) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<null | {
    title: string;
    summary: string;
    highlights: string[];
  }>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        const res = await api.post("/ai-broker/listings/generate-draft", {
            industry: businessData?.industry || "SaaS",
            business_model: businessData?.business_model || "B2B Subscription",
            metrics: businessData
        });
        setGeneratedDraft(res);
    } catch (e) {
        console.error("AI generation failed");
        alert("AI Assistant is temporarily unavailable. Please try again later.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (onApply && generatedDraft) {
        onApply({
            title: generatedDraft.title,
            description: generatedDraft.summary,
            highlights: generatedDraft.highlights
        });
        setGeneratedDraft(null);
        alert("AI suggestions applied to your listing draft.");
    }
  };

  return (
    <Card className="border-accent/20 bg-accent/[0.02] shadow-xl overflow-hidden">
      <CardHeader className="bg-accent/5 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-primary">AI Listing Copilot</CardTitle>
              <CardDescription className="text-[10px] font-medium uppercase tracking-widest text-accent">V2 Intelligent Assistant</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-white border-accent/20 text-accent font-bold">BETA</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {!generatedDraft ? (
          <div className="space-y-4 text-center py-8">
            <Bot className="w-12 h-12 text-accent/20 mx-auto" />
            <div className="max-w-xs mx-auto">
              <h3 className="font-bold text-primary">Draft with Intelligence</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Our AI can analyze your financial data and operational metrics to draft a high-conversion listing automatically.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 bg-accent hover:bg-accent/90 border-none text-white h-12 px-6 sm:px-10 rounded-2xl shadow-xl shadow-accent/20 w-full sm:w-auto font-black uppercase italic tracking-widest active:scale-95 transition-all"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing Business Data...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Generate Listing Draft</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Suggested Title
              </label>
              <div className="p-3 rounded-xl bg-white border border-accent/10 font-bold text-primary shadow-sm">
                {generatedDraft.title}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                AI Summary
              </label>
              <Textarea
                defaultValue={generatedDraft.summary}
                className="text-sm leading-relaxed min-h-[100px] border-accent/10 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Key Value Propositions
              </label>
              <div className="grid gap-2">
                {generatedDraft.highlights.map((h, i) => (
                  <div key={i} className="text-xs bg-white border border-accent/10 p-2.5 rounded-lg flex items-center gap-3 group hover:border-accent/30 transition-colors">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-800 leading-relaxed">
                <span className="font-bold">Human Approval Required:</span> Please verify all AI-generated claims against your actual financial records before publishing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleApply} className="flex-1 bg-accent hover:bg-accent/90 border-none text-white h-10 rounded-xl font-bold">Apply to Listing</Button>
              <Button variant="outline" className="flex-1 h-10 rounded-xl font-bold border-2" onClick={() => setGeneratedDraft(null)}>Regenerate</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
