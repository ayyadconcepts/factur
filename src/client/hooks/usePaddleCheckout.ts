"use client";

import { useState, useEffect, useCallback } from 'react';
import { initializePaddle, Paddle, Environments } from '@paddle/paddle-js';
import { PADDLE_CONFIG, getPaddlePriceId } from '@/lib/paddle/config';
import { PlanId } from '@/config/plans';
import { createClient } from '@/client/supabaseBrowser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UsePaddleCheckoutOptions {
  onSuccess?: () => void;
}

export function usePaddleCheckout(options?: UsePaddleCheckoutOptions) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (typeof window === 'undefined') return;

      const clientToken = PADDLE_CONFIG.clientToken;
      if (!clientToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const paddleInstance = await initializePaddle({
          environment: (PADDLE_CONFIG.environment || 'sandbox') as Environments,
          token: clientToken,
          eventCallback: (data) => {
            if (data.name === 'checkout.completed') {
              toast.success('Paiement confirmé ! Votre abonnement a été mis à jour.');
              if (options?.onSuccess) {
                options.onSuccess();
              }
            }
          },
        });

        if (isMounted && paddleInstance) {
          setPaddle(paddleInstance);
        }
      } catch (err) {
        console.error("[PaddleCheckout] Échec de l'initialisation de Paddle.js:", err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [options]);

  const openCheckout = useCallback(
    async (planId: PlanId) => {
      if (planId === 'free') {
        return;
      }

      const priceId = getPaddlePriceId(planId);
      if (!priceId) {
        toast.error('Identifiant de prix non configuré pour ce forfait');
        return;
      }

      setIsOpeningCheckout(true);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Utilisateur non connecté : redirection vers l'inscription avec le plan sélectionné
          router.push(`/signup?plan=${planId}`);
          return;
        }

        const checkoutOptions: any = {
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            locale: 'fr',
            successUrl: `${window.location.origin}/dashboard?checkout=success`,
          },
          items: [
            {
              priceId,
              quantity: 1,
            },
          ],
          customData: {
            userId: user.id,
          },
        };

        if (user.email) {
          checkoutOptions.customer = { email: user.email };
        }

        if (!paddle) {
          toast.info('Initialisation de la passerelle de paiement en cours, veuillez patienter...');
          const freshPaddle = await initializePaddle({
            environment: (PADDLE_CONFIG.environment || 'sandbox') as Environments,
            token: PADDLE_CONFIG.clientToken,
          });

          if (!freshPaddle) {
            toast.error("Impossible d'ouvrir le module de paiement Paddle.");
            return;
          }

          freshPaddle.Checkout.open(checkoutOptions);
          return;
        }

        paddle.Checkout.open(checkoutOptions);
      } catch (err: any) {
        console.error("[PaddleCheckout] Erreur lors de l'ouverture du checkout:", err);
        toast.error("Une erreur est survenue lors de l'ouverture de la fenêtre de paiement.");
      } finally {
        setIsOpeningCheckout(false);
      }
    },
    [paddle, router]
  );

  return {
    paddle,
    isInitializing,
    isOpeningCheckout,
    openCheckout,
  };
}
