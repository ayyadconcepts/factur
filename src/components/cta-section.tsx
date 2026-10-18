import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-40 md:py-48 bg-[#FBF9F6]">
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* H2 Title respectant strictement le Design System */}
        <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight text-balance">
          Passez à la facturation électronique en quelques secondes
        </h2>

        {/* Bouton CTA sobre, généreux & performant */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-4">
          <Button
            nativeButton={false}
            size="lg"
            className="bg-sage-600 hover:bg-sage-700 text-white shadow-xl shadow-sage-600/25 h-13 sm:h-14 px-9 sm:px-10 text-base sm:text-lg font-semibold rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            render={
              <a href="#uploader" className="inline-flex items-center gap-2.5">
                <span>Convertir une facture gratuitement</span>
                <ArrowRight className="size-4 sm:size-5 opacity-90" />
              </a>
            }
          />
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Vous avez déjà un fichier ?{' '}
            <a
              href="/validateur-factur-x"
              className="text-foreground font-medium underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
            >
              Vérifier votre fichier avec notre validateur Factur-X
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
