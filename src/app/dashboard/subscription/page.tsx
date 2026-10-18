"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLANS, PlanId } from "@/config/plans";
import { UserSubscriptionStatus } from "@/server/subscriptions/quota";
import {
  CheckCircle2,
  Sparkles,
  Loader2,
  Calendar,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<UserSubscriptionStatus | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  const fetchSubscription = async () => {
    setIsLoadingSub(true);
    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (e) {
      console.error("Erreur récupération abonnement:", e);
    } finally {
      setIsLoadingSub(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    if (searchParams?.get("success") === "true" || searchParams?.get("checkout") === "success") {
      toast.success("Paiement validé ! Votre abonnement sera actif dès la confirmation de Paddle.");
    }
  }, [searchParams]);

  const currentPlan = subscription?.plan || PLANS.free;
  const usageCount = subscription?.usageCount ?? 0;
  const quota = currentPlan.invoiceQuota;
  const usagePct = quota > 0 ? Math.min(100, Math.round((usageCount / quota) * 100)) : 0;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Abonnement & Quotas
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Suivez votre consommation mensuelle de factures Factur-X et gérez votre formule d&apos;abonnement.
            </p>
          </div>
        </div>

        {isLoadingSub ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Carte principale : Statut du forfait actif & Jauge de consommation */}
            <div className="rounded-xl bg-cream-light p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Votre formule active
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-sm sm:text-base font-semibold text-foreground">
                      Formule {currentPlan.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5"
                    >
                      {subscription?.status === "active" ? "Actif" : "Essai"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentPlan.tagline}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums">
                    {currentPlan.price === 0 ? "0 €" : `${currentPlan.price} €`}
                    <span className="text-xs font-normal text-muted-foreground"> / mois</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Sans engagement • Facturation sécurisée Paddle
                  </p>
                </div>
              </div>

              {/* Jauge de consommation mensuelle */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <FileCheck2 className="size-3.5 text-primary" />
                    Consommation mensuelle de factures
                  </span>
                  <span className="text-muted-foreground tabular-nums text-xs">
                    <strong className="text-foreground">{usageCount}</strong> / {quota} factures ({usagePct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-cream-dark h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      usagePct >= 90 ? "bg-rose-500" : usagePct >= 70 ? "bg-amber-500" : "bg-[#02b282]"
                    }`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-muted-foreground gap-1">
                  <span>
                    {quota - usageCount > 0
                      ? `Il vous reste ${quota - usageCount} facture${quota - usageCount > 1 ? "s" : ""} disponible${quota - usageCount > 1 ? "s" : ""} sur ce cycle.`
                      : "Votre quota mensuel est atteint pour ce cycle."}
                  </span>
                  {subscription?.currentPeriodEnd && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      Réinitialisation le {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grille de comparaison & souscription aux forfaits */}
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Changer de formule d&apos;abonnement
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sélectionnez le volume adapté à votre activité pour augmenter votre quota et bénéficier de la conversion groupée.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["essentiel", "volume", "intensif"] as PlanId[]).map((planKey) => {
                  const plan = PLANS[planKey];
                  const isCurrent = currentPlan.id === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                        plan.isPopular
                          ? "shadow-[0_4px_20px_rgba(2,178,130,0.12),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-[#02b282]/40"
                          : "shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                      }`}
                    >
                      <div className="bg-cream-light p-5 flex flex-col gap-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {plan.name}
                          </span>
                          {plan.isPopular && (
                            <Badge className="bg-[#02b282] text-white text-[10px] px-2 py-0.5 font-medium flex items-center gap-1">
                              <Sparkles className="size-3" />
                              Populaire
                            </Badge>
                          )}
                        </div>

                        <div>
                          <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums">
                            {plan.price} €
                            <span className="text-xs font-normal text-muted-foreground"> / mois</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {plan.tagline}
                          </p>
                        </div>

                        <ul className="flex flex-col gap-2 pt-2.5 border-t border-border/40 text-xs text-muted-foreground">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-foreground/85">
                              <CheckCircle2 className="size-3.5 text-[#02b282] shrink-0 mt-0.5" />
                              <span className="text-xs">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-cream-dark p-4">
                        {isCurrent ? (
                          <Button
                            disabled
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs font-semibold bg-cream-light border-border text-muted-foreground"
                          >
                            Votre formule actuelle
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push(`/checkout?plan=${plan.id}`)}
                            size="sm"
                            className={`w-full h-8 text-xs font-semibold rounded-lg ${
                              plan.isPopular
                                ? "bg-[#02b282] hover:bg-[#01946c] text-white"
                                : "bg-foreground text-background hover:bg-foreground/90"
                            }`}
                          >
                            Passer à {plan.name}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
