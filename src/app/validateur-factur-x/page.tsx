import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header';
import { PublicValidator } from '@/components/validator/PublicValidator';
import { ValidatorFaq } from '@/components/validator/ValidatorFaq';
import {
  ShieldCheck,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRight,
  Lock,
  Zap,
  Sparkle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Validateur Factur-X Gratuit en Ligne | Test de Conformité EN 16931 & Chorus Pro',
  description:
    'Vérifiez gratuitement la conformité de vos factures Factur-X (norme PDF/A-3, XSD UN/CEFACT et Schematron EN 16931). Prêt pour Chorus Pro et la réforme 2026. Sans création de compte.',
  keywords: [
    'validateur factur-x',
    'vérifier factur-x',
    'test conformité factur-x',
    'validateur facture électronique',
    'chorus pro validateur',
    'test schéma en 16931',
    'contrôle xml cii',
    'factur-x gratuit',
  ],
  alternates: {
    canonical: '/validateur-factur-x',
  },
  openGraph: {
    title: 'Validateur Factur-X Gratuit | Test de Conformité Réglementaire',
    description:
      'Vérifiez instantanément si votre facture est un document Factur-X conforme aux normes françaises et européennes (PDF/A-3 & XML CII).',
    url: 'https://facturxfacile.com/validateur-factur-x',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function ValidatorLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Validateur Factur-X Facile',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        description:
          'Outil en ligne gratuit pour tester et valider la conformité des factures électroniques au standard Factur-X (EN 16931 / PDF/A-3).',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: "Qu’est-ce qu’un validateur Factur-X ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Un outil qui contrôle qu’un PDF contient un XML conforme aux spécifications officielles et que le conteneur respecte les critères d'archivage pérenne de la norme PDF/A-3 (ISO 19005-3).",
            },
          },
          {
            '@type': 'Question',
            name: "Comment savoir si ma facture est un Factur-X ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Le validateur cherche une pièce jointe standardisée factur-x.xml (ou zugferd-invoice.xml) dans le PDF ; sans elle, c’est un PDF ordinaire inexploitable par les plateformes.",
            },
          },
          {
            '@type': 'Question',
            name: "Pourquoi mon PDF s’ouvre-t-il mais est-il refusé ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "La conformité se joue dans des éléments invisibles : polices embarquées, métadonnées XMP et balises XML CII.",
            },
          },
          {
            '@type': 'Question',
            name: "Quelle différence entre XSD, Schematron et PDF/A ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Le PDF/A valide le conteneur visuel d'archivage, le schéma XSD valide la grammaire syntaxique XML, et le Schematron valide les règles métiers et calculs arithmétiques.",
            },
          },
          {
            '@type': 'Question',
            name: "Ce validateur est-il officiel ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Non. Le validateur officiel de la FNFE-MPE existe séparément. Notre outil s'appuie sur les mêmes spécifications publiques : Schematron EN 16931 v1.3.11, règles nationales BR-FR v2.3 et profils ZUGFeRD / Factur-X 1.0.07.",
            },
          },
          {
            '@type': 'Question',
            name: "Mes fichiers sont-ils conservés ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Non. Le test de validation est 100% éphémère et s'exécute en mémoire vive sur nos serveurs sécurisés en Union Européenne. Aucun fichier n'est conservé.",
            },
          },
          {
            '@type': 'Question',
            name: "Quels profils sont supportés ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Tous les profils officiels Factur-X / ZUGFeRD sont supportés : MINIMUM, BASIC WL, BASIC, EN 16931 (standard officiel pour la France et Chorus Pro) et EXTENDED.",
            },
          },
          {
            '@type': 'Question',
            name: "Que faire en cas d’erreur BR-CO-15 ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "L'erreur BR-CO-15 indique un écart d'arrondi entre la somme des montants de TVA et le total TVA. Notre guide dédié permet d'identifier la ventilation en cause et de corriger le calcul.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroHeader />

      <main className="min-h-screen bg-background text-foreground flex flex-col">
        {/* HERO SECTION DE VALIDATION (REPREND EXACTEMENT L'ESTHÉTIQUE DE LA HOME) */}
        <section className="relative overflow-hidden">
          {/* Background SVG shape Feral Studio (Untitled blend-2048x1346.svg) */}
          <div className="absolute inset-1 sm:inset-2 h-[calc(100%-8rem)] lg:h-[calc(100%-14rem)] rounded-2xl md:rounded-[2rem] overflow-hidden pointer-events-none z-0 bg-[#FBF9F6] dark:bg-zinc-900/40">
            <img
              src="/assets/Untitled%20blend-2048x1346.svg?v=7"
              alt=""
              className="w-full h-full object-cover object-bottom select-none pointer-events-none"
            />
          </div>

          <div className="pt-20 md:pt-32 pb-10 md:pb-14">
            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
              {/* Pill badge avec étincelle */}
              <div className="hover:bg-foreground/5 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150">
                <div
                  aria-hidden
                  className="border-background bg-linear-to-b dark:inset-shadow-2xs to-foreground from-primary relative flex size-5 items-center justify-center rounded border shadow-md shadow-black/20 ring-1 ring-black/10"
                >
                  <div className="absolute inset-x-0 inset-y-1.5 border-y border-dotted border-white/25"></div>
                  <div className="absolute inset-x-1.5 inset-y-0 border-x border-dotted border-white/25"></div>
                  <Sparkle className="size-3 fill-white stroke-white drop-shadow" />
                </div>
                <span className="font-medium text-sm">Outil public gratuit &bull; Norme EN 16931</span>
              </div>

              {/* Titre et sous-titre */}
              <h1 className="mx-auto mt-8 max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Validateur <span className="whitespace-nowrap">Factur-X</span> en ligne
              </h1>
              <p className="text-muted-foreground mx-auto my-6 max-w-3xl text-lg sm:text-xl">
                Vérifiez instantanément la conformité de vos factures électroniques aux exigences de Chorus Pro et de la réforme 2026 (PDF/A-3, XSD UN/CEFACT et Schematron).
              </p>
            </div>

            {/* Fenêtre interactive du validateur */}
            <div className="relative pt-8 md:pt-12">
              <div className="relative z-10 mx-auto max-w-4xl px-6">
                <PublicValidator />
              </div>
            </div>

            {/* Garanties sous le validateur */}
            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <Lock className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                <span>100% Confidentiel &bull; Analyse éphémère en mémoire</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Zap className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                <span>Validation instantanée</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                <span>Règles officielles Schematron EN 16931</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1 : QUE VÉRIFIE NOTRE VALIDATEUR ? */}
        <section className="pt-10 md:pt-14 pb-8 md:pb-12">
          <div className="mx-auto max-w-5xl px-6">
            <div>
              <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs">
                Triple contrôle réglementaire
              </span>
              <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mt-2">
                Que vérifie notre validateur <span className="whitespace-nowrap">Factur-X</span> ?
              </h2>
              <p className="text-muted-foreground mb-10 mt-3 text-balance text-base max-w-3xl leading-relaxed">
                Chaque facture déposée fait l&apos;objet d&apos;une triple analyse technique conforme aux exigences de l&apos;AIFE. Pour explorer l&apos;ensemble des points de contrôle, consultez notre dossier : <Link href="/ressources/ce-que-controle-un-validateur-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">ce que contrôle un validateur Factur-X</Link>.
              </p>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl p-6 bg-cream-light dark:bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <FileCheck2 className="h-6 w-6 text-sage-600 dark:text-sage-400 mb-4" />
                  <h3 className="text-sm font-bold text-foreground">
                    1. Norme PDF/A-3 (ISO 19005-3)
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Vérification de l&apos;archivage pérenne et de l&apos;encapsulation XML avec <code>AFRelationship</code>. En cas d&apos;anomalie, consultez notre <Link href="/ressources/pdf-a-3-facture-refusee" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">diagnostic du rejet PDF/A-3</Link>.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-6 bg-cream-light dark:bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <Cpu className="h-6 w-6 text-sage-600 dark:text-sage-400 mb-4" />
                  <h3 className="text-sm font-bold text-foreground">
                    2. Schémas XSD UN/CEFACT CII
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Contrôle de la syntaxe XML CII, de l&apos;intégrité des balises et de la présence des nœuds obligatoires (vendeur, acheteur, totaux, lignes d&apos;articles).
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-6 bg-cream-light dark:bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <Layers className="h-6 w-6 text-sage-600 dark:text-sage-400 mb-4" />
                  <h3 className="text-sm font-bold text-foreground">
                    3. Schematron &amp; Règles EN 16931
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Contrôle des règles métiers françaises : découvrez notre <Link href="/ressources/erreurs-validation-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">guide des erreurs de validation</Link>, la correction de l&apos;<Link href="/ressources/erreur-br-co-15" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">erreur BR-CO-15</Link> et des <Link href="/ressources/erreur-br-fr-12-br-fr-13" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">règles BR-FR-12 et BR-FR-13</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 : LES PROFILS FACTUR-X */}
        <section className="pt-8 md:pt-12 pb-8 md:pb-12">
          <div className="mx-auto max-w-5xl px-6">
            <div>
              <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs">
                Standards Officiels
              </span>
              <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mt-2">
                Les profils <span className="whitespace-nowrap">Factur-X</span> reconnus
              </h2>
              <p className="text-muted-foreground mb-8 mt-3 text-balance text-base max-w-3xl leading-relaxed">
                Le standard Factur-X (ZUGFeRD) est décliné en plusieurs niveaux de données. Retrouvez la description complète des spécifications dans notre guide des <Link href="/ressources/factur-x-definition-profils" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">profils Factur-X</Link>.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl p-5 bg-cream-light dark:bg-zinc-900/60 border border-border/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">MINIMUM</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Profil de base</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Données d&apos;en-tête minimales pour l&apos;automatisation comptable de base, sans détail des lignes.
                </p>
              </div>

              <div className="rounded-2xl p-5 bg-cream-light dark:bg-zinc-900/60 border border-border/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">BASIC WL</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Without Lines</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Informations fiscales et adresses complètes, sans détail des articles individuels.
                </p>
              </div>

              <div className="rounded-2xl p-5 bg-cream-light dark:bg-zinc-900/60 border border-border/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">BASIC</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Lignes simplifiées</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Intègre les lignes de facture essentielles pour la comptabilisation automatique des achats.
                </p>
              </div>

              {/* EN 16931 MIS EN AVANT */}
              <div className="rounded-2xl p-6 bg-sage-500/10 border-2 border-sage-500/40 relative sm:col-span-2 lg:col-span-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-foreground">EN 16931</span>
                    <span className="text-[10px] bg-sage-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
                      Standard Officiel France / UE
                    </span>
                  </div>
                </div>
                <p className="mt-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  Le profil officiel conforme à la directive européenne et à la réforme française de la facturation électronique 2026. Obligatoire pour Chorus Pro et les plateformes agréées (PDP / PPF).
                </p>
              </div>

              <div className="rounded-2xl p-5 bg-cream-light dark:bg-zinc-900/60 border border-border/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">EXTENDED</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Profil étendu</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Pour les secteurs spécifiques (BTP, retail complexe) nécessitant des métadonnées logistiques poussées.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION GUIDES & ÉTUDES (SECTION 13.4) */}
        <section className="pt-8 md:pt-12 pb-8 md:pb-12 bg-cream-light/50 dark:bg-zinc-900/40 border-y border-border/50">
          <div className="mx-auto max-w-5xl px-6">
            <div>
              <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs">
                Ressources d&apos;expertise
              </span>
              <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mt-2">
                Approfondir et préparer vos dépôts
              </h2>
              <p className="text-muted-foreground mb-8 mt-3 text-balance text-base max-w-3xl leading-relaxed">
                Retrouvez nos analyses techniques, bancs d&apos;essai et conseils pratiques pour sécuriser votre facturation électronique.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <Link
                href="/ressources/etude-exports-pdf-factur-x"
                className="group rounded-2xl p-6 bg-card border border-border/60 shadow-xs hover:border-sage-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-sage-600 dark:text-sage-400 tracking-wider">Notre étude terrain</span>
                  <h3 className="text-base font-bold text-foreground mt-2 group-hover:text-primary transition-colors leading-snug">
                    50 exports PDF au banc d&apos;essai
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Découvrez pourquoi de nombreux logiciels génèrent des exports PDF/A-3 invalides pour la réforme.
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Lire l&apos;étude &rarr;
                </span>
              </Link>

              <Link
                href="/ressources/comparatif-validateurs-factur-x"
                className="group rounded-2xl p-6 bg-card border border-border/60 shadow-xs hover:border-sage-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-sage-600 dark:text-sage-400 tracking-wider">Autres outils</span>
                  <h3 className="text-base font-bold text-foreground mt-2 group-hover:text-primary transition-colors leading-snug">
                    Comparatif des validateurs Factur-X
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Panorama des solutions gratuites et payantes (FNFE-MPE, veraPDF, Chorus Pro) et leurs limites.
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Consulter le comparatif &rarr;
                </span>
              </Link>

              <Link
                href="/ressources/envoyer-factur-x-plateforme-agreee"
                className="group rounded-2xl p-6 bg-card border border-border/60 shadow-xs hover:border-sage-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-sage-600 dark:text-sage-400 tracking-wider">Et ensuite ?</span>
                  <h3 className="text-base font-bold text-foreground mt-2 group-hover:text-primary transition-colors leading-snug">
                    Transmettre sur PDP ou PPF
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    Les étapes indispensables pour déposer et suivre vos factures électroniques validées sans blocage.
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Guide de transmission &rarr;
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3 : CTA FINAL VERS LA CONVERSION (STYLE COPIÉ DE LA HOME) */}
        <section className="relative overflow-hidden py-32 sm:py-40 md:py-48 bg-[#FBF9F6] border-t border-border/50">
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Votre facture n&apos;est pas encore conforme Factur-X ?
            </h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Convertissez n&apos;importe quelle facture PDF en document officiel EN 16931 en moins de 5 secondes avec notre{' '}
              <Link
                href="/"
                className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground"
              >
                convertisseur PDF en Factur-X
              </Link>
              . Zéro saisie manuelle.
            </p>
            <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-4">
              <Button
                nativeButton={false}
                size="lg"
                className="bg-sage-600 hover:bg-sage-700 text-white shadow-xl shadow-sage-600/25 h-13 sm:h-14 px-9 sm:px-10 text-base sm:text-lg font-semibold rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                render={
                  <Link href="/#uploader" className="inline-flex items-center gap-2.5">
                    <span>Convertir votre facture en Factur-X</span>
                    <ArrowRight className="size-4 sm:size-5 opacity-90" />
                  </Link>
                }
              />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Conforme Chorus Pro &amp; réforme 2026 • 1 conversion offerte sans carte bancaire
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 : FAQ ACCORDION (8 QUESTIONS OFFICIELLES) */}
        <ValidatorFaq />
      </main>
      <Footer />
    </>
  );
}
