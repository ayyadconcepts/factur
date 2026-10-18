"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { completeOnboarding } from "@/lib/completeOnboarding";

export interface Company {
  id: string;
  name: string;
  siret: string;
  vat_id?: string;
  logo_key?: string;
}

interface CompaniesContextValue {
  companies: Company[];
  loading: boolean;
  refresh: () => Promise<void>;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
}

const CompaniesContext = createContext<CompaniesContextValue | undefined>(undefined);

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        
        // Auto-select first company if none is selected
        if (data.companies?.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data.companies[0].id);
        }
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des entreprises", e);
    }
  };

  const init = async () => {
    setLoading(true);
    // 1. Tenter de compléter l'onboarding si on vient de s'inscrire
    try {
      await completeOnboarding();
    } catch (err) {
      console.error("Échec du completeOnboarding", err);
    }
    
    // 2. Récupérer la liste des entreprises
    await fetchCompanies();
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <CompaniesContext.Provider value={{ companies, loading, refresh: fetchCompanies, selectedCompanyId, setSelectedCompanyId }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const ctx = useContext(CompaniesContext);
  if (!ctx) throw new Error("useCompanies must be used within CompaniesProvider");
  return ctx;
}
