"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { initializePaddle, Paddle, Environments } from "@paddle/paddle-js";
import { PADDLE_CONFIG, getPaddlePriceId } from "@/lib/paddle/config";
import { PLANS, PlanId } from "@/config/plans";
import { createClient } from "@/client/supabaseBrowser";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lock,
  Layers,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

const VALID_PAID_PLANS: PlanId[] = ["essentiel", "volume", "intensif"];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlanParam = searchParams.get("plan") as PlanId | null;
  const initialPlanId: PlanId =
    rawPlanParam && VALID_PAID_PLANS.includes(rawPlanParam)
      ? rawPlanParam
      : "volume";

  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(initialPlanId);
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isLoadingPaddle, setIsLoadingPaddle] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const paddleInitializedRef = useRef(false);

  const selectedPlan = PLANS[selectedPlanId];

  // 1. Vérification de l'authentification
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          if (currentUser.email) {
            setUser({ id: currentUser.id, email: currentUser.email });
          } else {
            setUser({ id: currentUser.id });
          }
        }
      } catch (e) {
        console.error("[Checkout] Erreur de vérification auth:", e);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Initialisation de Paddle.js
  useEffect(() => {
    let isMounted = true;

    async function initPaddle() {
      if (typeof window === "undefined" || paddleInitializedRef.current) return;
      if (!PADDLE_CONFIG.clientToken) {
        setIsLoadingPaddle(false);
        return;
      }

      try {
        const instance = await initializePaddle({
          environment: (PADDLE_CONFIG.environment || "sandbox") as Environments,
          token: PADDLE_CONFIG.clientToken,
          eventCallback: (data) => {
            if (data.name === "checkout.completed") {
              toast.success("Paiement validé avec succès ! Votre formule a été activée.");
              router.push("/dashboard/subscription?checkout=success");
            }
          },
        });

        if (isMounted && instance) {
          setPaddle(instance);
          paddleInitializedRef.current = true;
        }
      } catch (err) {
        console.error("[Checkout] Erreur initialisation Paddle.js:", err);
      } finally {
        if (isMounted) {
          setIsLoadingPaddle(false);
        }
      }
    }

    initPaddle();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // 3. Montage du checkout inline Paddle lorsque Paddle et le conteneur sont prêts
  useEffect(() => {
    if (!paddle) return;

    const priceId = getPaddlePriceId(selectedPlanId);
    if (!priceId) {
      toast.error("Identifiant de prix non configuré pour ce forfait");
      return;
    }

    try {
      const checkoutOptions: Parameters<typeof paddle.Checkout.open>[0] = {
        settings: {
          displayMode: "inline",
          theme: "light",
          locale: "fr",
          frameTarget: "paddle-checkout-container",
          frameInitialHeight: 450,
          frameStyle:
            "width: 100%; min-width: 312px; background-color: transparent; border: none;",
          variant: "one-page",
        },
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
      };

      if (user?.email) {
        checkoutOptions.customer = { email: user.email };
      }
      if (user?.id) {
        checkoutOptions.customData = { userId: user.id };
      }

      paddle.Checkout.open(checkoutOptions);
    } catch (err) {
      console.error("[Checkout] Erreur ouverture checkout inline:", err);
    }
  }, [paddle, selectedPlanId, user]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Colonne gauche : Formulaire de paiement inline & récapitulatif du forfait */}
      <div className="flex flex-col justify-between p-6 sm:p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
          {/* Lien retour */}
          <div>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Retour à l&apos;abonnement
            </Link>
          </div>

          {/* En-tête */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Finaliser votre abonnement
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Activez votre formule Factur-X sans engagement et conforme à la réforme 2026.
            </p>
          </div>

          {/* Sélecteur de formules (onglets compacts) */}
          <div className="flex items-center p-1 bg-cream-dark/60 rounded-xl gap-1">
            {VALID_PAID_PLANS.map((planKey) => {
              const p = PLANS[planKey];
              const isSelected = selectedPlanId === planKey;
              return (
                <button
                  key={planKey}
                  type="button"
                  onClick={() => setSelectedPlanId(planKey)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {p.name}
                    <span className="text-[11px] font-normal opacity-75">
                      ({p.price} €)
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Carte récapitulative du forfait choisi */}
          <div className="rounded-xl bg-cream-light p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Forfait sélectionné
                </span>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mt-0.5">
                  Formule {selectedPlan.name}
                  {selectedPlan.isPopular && (
                    <Badge className="bg-[#02b282] text-white text-[10px] px-2 py-0.5 font-medium flex items-center gap-1">
                      <Sparkles className="size-3" />
                      Populaire
                    </Badge>
                  )}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                  {selectedPlan.price} €
                  <span className="text-xs font-normal text-muted-foreground"> / mois</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Sans engagement</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 pt-2 border-t border-border/40">
              <FileCheck2 className="size-4 text-[#02b282]" />
              <span>
                <strong>{selectedPlan.invoiceQuota}</strong> factures Factur-X incluses par mois
              </span>
              {selectedPlan.canBulkConvert && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                  <Layers className="size-3" />
                  Conversion par lot
                </span>
              )}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-xs text-muted-foreground">
              {selectedPlan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-foreground/80">
                  <CheckCircle2 className="size-3.5 text-[#02b282] shrink-0 mt-0.5" />
                  <span className="text-xs">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Module de paiement Paddle Inline */}
          <div className="rounded-xl bg-cream-light p-4 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] min-h-[460px] flex flex-col justify-center">
            {isLoadingPaddle || isCheckingAuth ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-[#02b282]" />
                <span className="text-xs font-medium">
                  Chargement sécurisé du module de paiement Paddle...
                </span>
              </div>
            ) : null}

            {/* Le conteneur cible où Paddle injecte son iframe inline */}
            <div
              id="paddle-checkout-container"
              className={`paddle-checkout-container w-full min-h-[450px] ${
                isLoadingPaddle || isCheckingAuth ? "hidden" : "block"
              }`}
            />
          </div>

          {/* Mention de réassurance discrète */}
          <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
            <Lock className="size-3 text-muted-foreground" />
            <span>Paiement 100% sécurisé via Paddle • Annulation à tout moment en 1 clic</span>
          </div>
        </div>
      </div>

      {/* Colonne droite : Bannière avec fond mesh.jpeg et logo Factur-X centré */}
      <div
        className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden border-l border-border select-none bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/mesh.jpeg')" }}
      >

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="relative size-28 rounded-3xl bg-background/90 border border-border/80 flex items-center justify-center backdrop-blur-md p-5 shadow-sm">
              <img
                src="/assets/logo-factur-x-facile.png?v=3"
                alt="Logo Factur-X Facile"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Facturation conforme 2026
          </h2>
          <p className="mt-2.5 text-sm text-foreground font-medium leading-relaxed">
            Format hybride Factur-X standardisé (PDF/A-3b & XML CII EN 16931). Conforme Chorus Pro et plateformes agréées.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
