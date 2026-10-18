import React, { ReactNode } from 'react';
import Link from 'next/link';
import { HeroHeader } from '@/components/header';
import Footer from '@/components/footer';
import { cn } from '@/lib/utils';
import { Shield, FileText, Scale } from 'lucide-react';

export type LegalSlug = 'mentions-legales' | 'politique-de-confidentialite' | 'conditions-utilisation';

interface LegalLayoutProps {
  currentSlug: LegalSlug;
  title: string;
  effectiveDate: string;
  children: ReactNode;
}

const LEGAL_NAV_ITEMS: { slug: LegalSlug; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    slug: 'mentions-legales',
    label: 'Mentions légales',
    href: '/mentions-legales',
    icon: FileText,
  },
  {
    slug: 'politique-de-confidentialite',
    label: 'Politique de confidentialité',
    href: '/politique-de-confidentialite',
    icon: Shield,
  },
  {
    slug: 'conditions-utilisation',
    label: 'Conditions d’utilisation',
    href: '/conditions-utilisation',
    icon: Scale,
  },
];

export function LegalLayout({ currentSlug, title, effectiveDate, children }: LegalLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] dark:bg-background">
      <HeroHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-36 md:pt-40 pb-20 md:pb-28">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Sidebar gauche (Style Stripe Legal) */}
            <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-border/70 p-5 sm:p-6 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Informations légales
                </h2>
                <nav className="flex flex-col gap-1.5" aria-label="Navigation légale">
                  {LEGAL_NAV_ITEMS.map((item) => {
                    const isActive = item.slug === currentSlug;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.slug}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all',
                          isActive
                            ? 'bg-sage-50 text-sage-700 font-semibold dark:bg-sage-950/60 dark:text-sage-300 shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon
                          className={cn(
                            'size-4 shrink-0 transition-colors',
                            isActive ? 'text-sage-600 dark:text-sage-400' : 'text-muted-foreground/70'
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-5 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    Besoin d’assistance ou d’une question juridique ?
                  </p>
                  <a
                    href="mailto:youssef@facturxfacile.com"
                    className="mt-1.5 inline-block text-sage-600 dark:text-sage-400 font-medium hover:underline"
                  >
                    youssef@facturxfacile.com
                  </a>
                </div>
              </div>
            </aside>

            {/* Contenu principal */}
            <article className="flex-1 min-w-0 max-w-3xl bg-white dark:bg-zinc-900/70 border border-border/70 rounded-2xl md:rounded-[2rem] p-6 sm:p-10 md:p-12 shadow-xs">
              <header className="pb-6 border-b border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                  Document juridique officiel
                </span>
                <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
                  {title}
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                  Date d’entrée en vigueur : {effectiveDate}
                </p>
              </header>

              <div className="mt-8 text-foreground space-y-8 leading-relaxed text-sm sm:text-base">
                {children}
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
