import React from 'react'
import type { Metadata } from 'next'
import { HeroHeader } from '@/components/header'
import Footer from '@/components/footer'
import { getAllResources } from '@/data/resources'
import { ResourcesView } from './resources-view'

export const metadata: Metadata = {
  title: 'Ressources & Guides Factur-X | Factur-X Facile',
  description:
    'Guides pratiques, tutoriels et décryptages sur Factur-X et la réforme de facturation électronique 2026. Tout comprendre pour vos factures et votre conformité.',
  alternates: {
    canonical: '/ressources',
  },
  openGraph: {
    title: 'Ressources & Guides Factur-X | Factur-X Facile',
    description:
      'Guides pratiques, tutoriels et décryptages sur Factur-X et la réforme de facturation électronique 2026.',
    url: 'https://facturxfacile.com/ressources',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function ResourcesPage() {
  const articles = getAllResources()

  return (
    <div className="min-h-screen bg-cream-light text-foreground flex flex-col justify-between">
      <HeroHeader />

      <main className="flex-1 pt-20 md:pt-32 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header — eyebrow + H1 following design system pattern */}
          <div className="max-w-4xl mb-10 md:mb-16">
            <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs block mb-3">
              Ressources
            </span>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Guides, analyses et actualités de{' '}
              <span className="font-extrabold">Factur-X Facile</span>
            </h1>
          </div>

          <ResourcesView initialArticles={articles} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
