"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export interface ListingData {
  id?: string;
  business_id?: string;
  title: string;
  description: string;
  asking_price: number;
  category_id?: string;
  // Additional fields for the 20 steps
  tagline?: string;
  revenue?: number;
  profit?: number;
  tech_stack?: string;
  hosting?: string;
  mau?: number;
  traffic_sources?: Record<string, number>;
  business_model?: string;
  industry?: string;
  currency?: string;
  expenses?: number;
  customers?: number;
  monetization?: string;
  owner_hours?: number;
  growth?: string;
  risks?: string;
  sale_type?: string;
  step: number;
}

const STORAGE_KEY = "bb_listing_draft";

export function useListingWizard() {
  const router = useRouter();
  const [data, setData] = useState<ListingData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { step: 1, title: "", description: "", asking_price: 0 };
    }
    return { step: 1, title: "", description: "", asking_price: 0 };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updates: Partial<ListingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setData(prev => ({ ...prev, step: Math.min(prev.step + 1, 20) }));
  }, []);

  const prevStep = useCallback(() => {
    setData(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const submitListing = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // In V1, we'll create the business and listing in one or two steps
      // For now, assume a combined endpoint or sequence
      const result = await api.post("/listings", {
        ...data,
        status: "PENDING_REVIEW"
      });

      localStorage.removeItem(STORAGE_KEY);
      router.push("/dashboard/seller");
      return result;
    } catch (e: any) {
      setError(e.message || "Failed to submit listing");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    data,
    updateData,
    nextStep,
    prevStep,
    submitListing,
    isSaving,
    error,
    currentStep: data.step
  };
}
