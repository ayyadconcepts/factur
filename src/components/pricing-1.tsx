"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ORDERED_PAID_PLANS } from '@/config/plans';
import { useSubscription } from '@/client/hooks/useSubscription';

export default function Pricing() {
  const router = useRouter();
  const { subscription } = useSubscription();

  return (
    <div id="tarifs" className="relative pt-16 md:pt-24 lg:pt-28 pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* En-tête de la section Tarifs */}
        <div className="max-w-4xl text-left">
          <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs block mb-3">
            Tarifs clairs et sans engagement
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choisissez l’offre adaptée à votre volume
          </h2>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            <span className="sm:block">Générez vos factures électroniques Factur-X en conformité totale avec la réforme 2026.</span>
            <span className="sm:block">1 conversion offerte pour tester immédiatement sans engagement.</span>
          </p>
        </div>

        {/* Grille des 3 plans */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {ORDERED_PAID_PLANS.map((plan) => {
            const isVolume = plan.isPopular;
            const isCurrentPlan = subscription?.plan.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between p-8 rounded-2xl transition-all duration-200 overflow-visible ${
                  isVolume
                    ? 'border-2 border-primary shadow-xl shadow-primary/5 bg-card ring-1 ring-primary/20 scale-[1.02] pt-10'
                    : 'border border-border bg-card shadow-sm hover:shadow-md'
                }`}
              >
                {/* Badge "Populaire" sur le forfait Volume */}
                {isVolume && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm tracking-wide">
                    Recommandé • Meilleur rapport volume
                  </div>
                )}

                <div>
                  {/* Titre et description du plan */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    {plan.canBulkConvert && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                        <Layers className="size-3" />
                        Bulk convert
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground min-h-[32px]">
                    {plan.tagline}
                  </p>

                  {/* Prix */}
                  <div className="my-6 pb-6 border-b border-border/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                        {plan.price} €
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        / mois
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-primary">
                      {plan.invoiceQuota} factures incluses
                    </p>
                  </div>

                  {/* Liste des fonctionnalités */}
                  <ul className="space-y-3.5 text-sm">
                    {plan.features.map((feature, idx) => {
                      const isBulkFeature = feature.toLowerCase().includes('bulk');
                      return (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className={`size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isBulkFeature ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            <Check className="size-2.5 stroke-[3]" />
                          </div>
                          <span className={isBulkFeature ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Bouton d'action / souscription */}
                <div className="mt-8 pt-4">
                  <Button
                    size="lg"
                    variant={isCurrentPlan ? 'outline' : isVolume ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                    onClick={() => router.push(`/checkout?plan=${plan.id}`)}
                    className={`w-full font-semibold cursor-pointer ${
                      isVolume && !isCurrentPlan ? 'shadow-md shadow-primary/20' : ''
                    }`}
                  >
                    {isCurrentPlan ? 'Votre forfait actuel' : `Choisir ${plan.name}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Note de réassurance sous la grille */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          Paiement sécurisé via Paddle • Annulation possible à tout moment en 1 clic • Sans engagement de durée.
        </div>
      </div>
    </div>
  );
}
