"use client";

import { useCompanies } from "./CompaniesProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";

export function CompanySelector() {
  const { companies, loading, selectedCompanyId, setSelectedCompanyId } = useCompanies();
  const router = useRouter();

  if (loading) {
    return <div className="h-9 w-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-md" />;
  }

  if (companies.length === 0) {
    return (
      <button 
        onClick={() => router.push('/dashboard/companies/new')}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100"
      >
        <PlusIcon className="w-4 h-4" />
        Créer une entreprise
      </button>
    );
  }

  return (
    <Select {...(selectedCompanyId ? { value: selectedCompanyId } : {})} onValueChange={(v) => setSelectedCompanyId(v)}>
      <SelectTrigger className="w-[200px] bg-cream-light border-border focus:ring-sage-500">
        <SelectValue placeholder="Sélectionnez une entreprise" />
      </SelectTrigger>
      <SelectContent>
        {companies.map(c => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
        <div 
          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sage-600 border-t border-zinc-100 mt-1"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard/companies/new');
          }}
        >
          <PlusIcon className="w-4 h-4" />
          Ajouter une entreprise
        </div>
      </SelectContent>
    </Select>
  );
}
