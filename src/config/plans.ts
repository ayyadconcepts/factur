export type PlanId = 'free' | 'essentiel' | 'volume' | 'intensif';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  currency: 'EUR';
  billingPeriod: 'month';
  invoiceQuota: number;
  canBulkConvert: boolean;
  isPopular?: boolean;
  features: string[];
  paddlePriceIdEnv?: string;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Essai gratuit',
    tagline: 'Pour tester sans engagement',
    price: 0,
    currency: 'EUR',
    billingPeriod: 'month',
    invoiceQuota: 1,
    canBulkConvert: false,
    features: [
      '1 conversion offerte pour tester',
      'Extraction 100% déterministe',
      'Conforme Chorus Pro & DGI',
      'Archivage certifié PDF/A-3b',
      'Support standard communautaire',
    ],
  },
  essentiel: {
    id: 'essentiel',
    name: 'Essentiel',
    tagline: 'Pour les indépendants et freelances',
    price: 10,
    currency: 'EUR',
    billingPeriod: 'month',
    invoiceQuota: 100,
    canBulkConvert: false,
    paddlePriceIdEnv: 'NEXT_PUBLIC_PADDLE_PRICE_ESSENTIEL',
    features: [
      '100 factures / mois',
      'Conforme Chorus Pro & Plateformes Partenaires',
      'Extraction & contrôle arithmétique EN 16931',
      'Dossiers & classement de documents',
      'Support client prioritaire par email',
    ],
  },
  volume: {
    id: 'volume',
    name: 'Volume / Batch',
    tagline: 'Pour les TPE, PME et gestionnaires',
    price: 20,
    currency: 'EUR',
    billingPeriod: 'month',
    invoiceQuota: 200,
    canBulkConvert: true,
    isPopular: true,
    paddlePriceIdEnv: 'NEXT_PUBLIC_PADDLE_PRICE_VOLUME',
    features: [
      '200 factures / mois',
      'Bulk conversion (conversion par lot en 1 clic)',
      'Export groupé d’archives certifiées',
      'Conforme Chorus Pro & Plateformes Partenaires',
      'Contrôle automatique des doublons',
      'Support réactif prioritaire',
    ],
  },
  intensif: {
    id: 'intensif',
    name: 'Intensif / Illimité',
    tagline: 'Pour les cabinets, agences et gros volumes',
    price: 50,
    currency: 'EUR',
    billingPeriod: 'month',
    invoiceQuota: 500,
    canBulkConvert: true,
    paddlePriceIdEnv: 'NEXT_PUBLIC_PADDLE_PRICE_INTENSIF',
    features: [
      '500 factures / mois',
      'Bulk conversion illimitée par lot',
      'Multi-entreprises jusqu’à 50 entités',
      'Archivage à valeur probante étendu',
      'Accès API dédié et webhooks',
      'Support VIP dédié sous 2h',
    ],
  },
};

export const ORDERED_PAID_PLANS: PlanDefinition[] = [
  PLANS.essentiel,
  PLANS.volume,
  PLANS.intensif,
];

/**
 * Récupère la définition d'un plan par son identifiant.
 * Retourne le plan 'free' par défaut si l'identifiant est inconnu ou non fourni.
 */
export function getPlan(planId?: string | null): PlanDefinition {
  if (!planId || !(planId in PLANS)) {
    return PLANS.free;
  }
  return PLANS[planId as PlanId];
}

/**
 * Détermine si le plan autorise la conversion par lot (Bulk conversion).
 */
export function canPerformBulkConvert(planId?: string | null): boolean {
  const plan = getPlan(planId);
  return plan.canBulkConvert;
}

/**
 * Vérifie si le quota de factures du plan a été atteint ou dépassé.
 */
export function isQuotaExceeded(usageCount: number, planId?: string | null): boolean {
  const plan = getPlan(planId);
  return usageCount >= plan.invoiceQuota;
}

/**
 * Calcule le nombre de factures restantes sur le quota courant.
 */
export function getRemainingInvoices(usageCount: number, planId?: string | null): number {
  const plan = getPlan(planId);
  return Math.max(0, plan.invoiceQuota - usageCount);
}
