import type { Metadata } from 'next';
import HeroSection from '@/components/hero-section-2';
import Features from '@/components/features-2';
import MistFeatures from '@/components/features-3';
import Stats from '@/components/stats-2';
import Testimonials from '@/components/testimonials-3';
import Pricing from '@/components/pricing-1';
import CtaSection from '@/components/cta-section';
import FAQs from '@/components/faqs-3';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Convertisseur PDF en Factur-X Instantané | Zéro Ressaisie & Rendu Identique',
  description:
    'Zéro saisie manuelle : vos données de facture sont extraites automatiquement et votre nouveau fichier Factur-X officiel (EN 16931) reste visuellement 100% identique à l’original.',
  keywords: [
    'convertisseur pdf en factur-x',
    'convertir pdf en factur-x',
    'convertisseur factur-x instantané',
    'factur-x en ligne',
    'facture electronique chorus pro',
    'factur-x en 16931',
    'conversion facture pdf automatique sans ressaisie',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Convertisseur PDF en Factur-X Instantané | Zéro Ressaisie',
    description:
      'Zéro saisie manuelle : vos données sont extraites automatiquement et votre nouvelle facture Factur-X reste visuellement identique à l’ancienne.',
    url: 'https://facturxfacile.com',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Features />
      <MistFeatures />
      {/* Zone couverte avec le même background que le bloc pricing (bg-muted/50) sans aucune ligne de séparation */}
      <div className="bg-muted/50">
        <Stats />
        <Testimonials />
        <Pricing />
      </div>
      <CtaSection />
      <FAQs />
      <Footer />
    </div>
  );
}
