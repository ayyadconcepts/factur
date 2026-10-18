import { useEffect } from 'react';
import { useCompanies } from '@/components/companies/CompaniesProvider';
import type { VerificationResult } from '@/core/verify/verifyDraft';

export function useMatchCompany(extractionResult: VerificationResult | null | any) {
  const { companies, selectedCompanyId, setSelectedCompanyId } = useCompanies();

  useEffect(() => {
    // Si l'extraction n'est pas terminée ou qu'une entreprise est déjà sélectionnée explicitement,
    // on ne fait rien.
    if (!extractionResult?.fields || selectedCompanyId) return;

    // Nouvelle heuristique avec VerificationResult
    const sellerSirenField = extractionResult.fields['seller.siren'];
    
    if (sellerSirenField && sellerSirenField.value) {
      const extractedSiren = sellerSirenField.value;
      
      const matchedCompany = companies.find(c => c.siret.startsWith(extractedSiren));

      if (matchedCompany) {
        setSelectedCompanyId(matchedCompany.id);
      }
    }
  }, [extractionResult, companies, selectedCompanyId, setSelectedCompanyId]);
}
