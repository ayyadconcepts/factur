import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CtaAction {
  label: string
  href: string
  ctaId: string
  isPrimary?: boolean
}

export interface ArticleCtaConfig {
  primary: CtaAction
  secondary?: CtaAction
  topTitle: string
  topDescription: string
  bottomTitle: string
  bottomDescription: string
  showTop?: boolean
}

export const ARTICLE_CTA_CONFIGS: Record<string, ArticleCtaConfig> = {
  'convertir-facture-word-en-factur-x': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Vérifier le fichier obtenu',
      href: '/validateur-factur-x',
      ctaId: 'v2',
    },
    topTitle: 'Besoin de transformer votre facture Word en Factur-X ?',
    topDescription:
      'Déposez votre facture exportée au format PDF. Notre moteur extrait les champs et génère le fichier Factur-X conforme EN 16931.',
    bottomTitle: 'Prêt à convertir votre facture Word ?',
    bottomDescription:
      'Passez à la facturation électronique en quelques secondes sans modifier votre modèle habituel.',
  },
  'convertir-facture-excel-en-factur-x': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Vérifier le fichier obtenu',
      href: '/validateur-factur-x',
      ctaId: 'v2',
    },
    topTitle: 'Votre facture Excel prête pour la réforme 2026',
    topDescription:
      'Exportez votre feuille en PDF et déposez-la sur notre outil pour obtenir un PDF/A-3 avec XML CII conforme.',
    bottomTitle: 'Convertissez vos factures Excel sans changer d’outils',
    bottomDescription:
      'Automatisez la mise en conformité de vos factures et vérifiez le résultat en 1 clic.',
  },
  'factur-x-xml-pdf-incoherents': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
    },
    topTitle: 'Évitez tout désaccord entre visuel PDF et flux XML',
    topDescription:
      'Notre convertisseur garantit la parfaite synchronisation entre les données visibles du PDF et le fichier factur-x.xml embarqué.',
    bottomTitle: 'Générez un Factur-X parfaitement cohérent',
    bottomDescription:
      'Assurez la conformité totale de vos factures avant transmission sur les plateformes agréées.',
  },
  'pdf-a-3-facture-refusee': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Corriger en reconvertissant mon PDF',
      href: '/#uploader',
      ctaId: 'c2',
    },
    topTitle: 'Votre facture PDF/A-3 a été rejetée ?',
    topDescription:
      'Identifiez en quelques secondes l’origine exacte du rejet grâce à notre validateur gratuit conforme aux Schematrons officiels.',
    bottomTitle: 'Résolvez le rejet et recréez un Factur-X valide',
    bottomDescription:
      'Analysez le rapport d’erreur détaillé ou reconvertissez immédiatement votre PDF d’origine.',
  },
  'factur-x-cabinet-comptable': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Découvrir nos offres cabinets',
      href: '/#tarifs',
      ctaId: 'offers',
    },
    topTitle: 'Facilitez la transition Factur-X de vos clients TPE',
    topDescription:
      'Convertissez les factures PDF de vos clients sans friction technique ni modification de leurs habitudes de travail.',
    bottomTitle: 'Accompagnez l’ensemble de vos dossiers clients',
    bottomDescription:
      'Testez notre convertisseur ou découvrez nos solutions de traitement volumique pour cabinets d’expertise comptable.',
  },
  'factur-x-micro-entrepreneur': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Vérifier le fichier obtenu',
      href: '/validateur-factur-x',
      ctaId: 'v2',
    },
    topTitle: 'Micro-entrepreneur : Factur-X simple et sans logiciel lourd',
    topDescription:
      'Gardez vos devis et factures habituels : nous les convertissons en Factur-X officiel EN 16931.',
    bottomTitle: 'Passez à la facture électronique sereinement',
    bottomDescription:
      'Une conversion immédiate conforme à l’article 293 B du CGI pour les auto-entrepreneurs en franchise de TVA.',
  },
  'avoir-factur-x': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Vérifier le fichier obtenu',
      href: '/validateur-factur-x',
      ctaId: 'v2',
    },
    topTitle: 'Besoin d’émettre un avoir conforme Factur-X ?',
    topDescription:
      'Prise en charge native du code type 381 et des montants créditeurs selon les règles métier EN 16931.',
    bottomTitle: 'Convertissez vos avoirs et factures rectificatives',
    bottomDescription:
      'Obtenez un avoir électronique certifié prêt pour transmission sur Chorus Pro ou plateforme partenaire.',
  },
  'factur-x-plusieurs-taux-tva': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Vérifier le fichier obtenu',
      href: '/validateur-factur-x',
      ctaId: 'v2',
    },
    topTitle: 'Facture avec plusieurs taux de TVA ?',
    topDescription:
      'Notre moteur ventile automatiquement chaque base taxable (20%, 10%, 5,5%, 2,1%) sans risque d’erreur d’arrondi.',
    bottomTitle: 'Ventilation multi-TVA sans erreur arithmétique',
    bottomDescription:
      'Convertissez votre PDF et assurez la conformité stricte avec les règles BR-CO-15 et BR-CO-17.',
  },
  'fournisseur-facture-pdf-simple-factur-x': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Consulter le guide de transmission',
      href: '/ressources/envoyer-factur-x-plateforme-agreee',
      ctaId: 'a10',
    },
    topTitle: 'Reçu une facture PDF simple d’un fournisseur ?',
    topDescription:
      'Convertissez-la en Factur-X pour l’intégrer automatiquement dans votre logiciel comptable ou GED.',
    bottomTitle: 'Intégrez vos factures fournisseurs dans votre flux',
    bottomDescription:
      'Transformez vos PDF entrants en documents structurés EN 16931 exploitables par votre comptabilité.',
  },
  'envoyer-factur-x-plateforme-agreee': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
    },
    topTitle: 'Vérifiez votre Factur-X avant de l’envoyer',
    topDescription:
      'Évitez les blocages sur votre PDP ou le PPF en effectuant un contrôle préalable complet et gratuit.',
    bottomTitle: 'Préparez vos factures pour les plateformes agréées',
    bottomDescription:
      'Validez la conformité de vos fichiers ou convertissez vos PDF avant transmission vers Chorus Pro ou PDP.',
  },
  'erreurs-validation-factur-x': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Corriger en reconvertissant mon PDF',
      href: '/#uploader',
      ctaId: 'c2',
    },
    topTitle: 'Diagnostiquez vos codes d’erreur Factur-X',
    topDescription:
      'Testez votre document sur notre validateur pour identifier les règles Schematron en échec et leur signification.',
    bottomTitle: 'Corrigez vos erreurs de validation Factur-X',
    bottomDescription:
      'Identifiez les anomalies dans le rapport d’analyse ou reconvertissez votre PDF pour corriger automatiquement la structure.',
  },
  'erreur-br-co-15': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Corriger en reconvertissant mon PDF',
      href: '/#uploader',
      ctaId: 'c2',
    },
    topTitle: 'Bloqué par l’erreur BR-CO-15 ?',
    topDescription:
      'Cette règle impose l’égalité stricte entre le total de TVA et la somme des montants par taux. Testez votre fichier.',
    bottomTitle: 'Résolvez définitivement l’erreur BR-CO-15',
    bottomDescription:
      'Reconvertissez votre PDF sur notre outil pour recalculer les arrondis réglementaires au centime près.',
  },
  'erreur-br-fr-12-br-fr-13': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Corriger en reconvertissant mon PDF',
      href: '/#uploader',
      ctaId: 'c2',
    },
    topTitle: 'Erreur sur le numéro de TVA ou SIRET français ?',
    topDescription:
      'Les règles nationales BR-FR-12 et BR-FR-13 imposent des identifiants valides. Vérifiez votre document en 1 clic.',
    bottomTitle: 'Validez vos identifiants français',
    bottomDescription:
      'Contrôlez vos numéros SIREN, SIRET et TVA intracommunautaire ou régénérez un Factur-X sans anomalie.',
  },
  'ce-que-controle-un-validateur-factur-x': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
    },
    topTitle: 'Passez votre facture au banc d’essai',
    topDescription:
      'Découvrez si votre document respecte le triple contrôle : PDF/A-3, schémas XSD UN/CEFACT et règles Schematron.',
    bottomTitle: 'Contrôlez ou générez vos factures conformes',
    bottomDescription:
      'Validez vos fichiers existants ou utilisez notre convertisseur pour créer des factures Factur-X prêtes pour 2026.',
  },
  'comparatif-validateurs-factur-x': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
    },
    topTitle: 'Testez notre validateur en ligne gratuit',
    topDescription:
      'Analyse instantanée, rapport d’erreur clair et sans création de compte. Conforme aux règles françaises et européennes.',
    bottomTitle: 'Besoin de valider ou de convertir vos factures ?',
    bottomDescription:
      'Accédez à notre validateur gratuit ou transformez vos PDF existants en documents Factur-X certifiés.',
  },
  'factur-x-definition-profils': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
    },
    topTitle: 'Générez le profil Factur-X officiel EN 16931',
    topDescription:
      'Notre convertisseur génère directement le profil complet exigé par la réforme 2026 et Chorus Pro.',
    bottomTitle: 'Adoptez le standard officiel Factur-X',
    bottomDescription:
      'Créez vos factures au profil EN 16931 ou contrôlez vos fichiers existants avec notre validateur.',
  },
  'calendrier-facture-electronique-pdf': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
    },
    topTitle: 'Anticipez sereinement le calendrier de la réforme',
    topDescription:
      'Mettez vos factures PDF au standard Factur-X dès aujourd’hui sans attendre les échéances obligatoires.',
    bottomTitle: 'Soyez prêt pour la facturation électronique 2026',
    bottomDescription:
      'Convertissez vos premiers documents gratuitement ou vérifiez la conformité de vos factures de test.',
  },
  'etude-exports-pdf-factur-x': {
    primary: {
      label: 'Valider mon fichier Factur-X',
      href: '/validateur-factur-x',
      ctaId: 'v1',
      isPrimary: true,
    },
    secondary: {
      label: 'Corriger en reconvertissant mon PDF',
      href: '/#uploader',
      ctaId: 'c2',
    },
    topTitle: 'Votre logiciel exporte-t-il un vrai Factur-X ?',
    topDescription:
      'Comme démontré dans notre étude sur 50 outils, beaucoup d’exports PDF sont incomplets. Vérifiez le vôtre gratuitement.',
    bottomTitle: 'Testez la conformité de vos exports logiciels',
    bottomDescription:
      'Passez votre export au validateur ou reconvertissez-le en Factur-X EN 16931 certifié.',
  },
  'convertisseur-factur-x-confidentialite-ia': {
    primary: {
      label: 'Convertir ma facture en Factur-X',
      href: '/#uploader',
      ctaId: 'c1',
      isPrimary: true,
    },
    secondary: {
      label: 'Consulter nos engagements & tarifs',
      href: '/#tarifs',
      ctaId: 'trust',
    },
    topTitle: '',
    topDescription: '',
    bottomTitle: 'Sécurité et souveraineté de vos données',
    bottomDescription:
      'Traitement éphémère en mémoire vive, aucune conservation par défaut, données d’entreprise jamais utilisées pour entraîner des modèles IA.',
    showTop: false,
  },
}

interface ArticleCtaProps {
  slug: string
  variant: 'top' | 'bottom'
}

export function ArticleCta({ slug, variant }: ArticleCtaProps) {
  const config = ARTICLE_CTA_CONFIGS[slug]
  if (!config) return null

  if (variant === 'top') {
    if (config.showTop === false) return null
    return (
      <aside
        aria-label="Action rapide"
        data-cta={`${config.primary.ctaId}-top`}
        className="rounded-2xl border border-sage-500/25 bg-sage-500/5 dark:bg-zinc-900/50 p-5 sm:p-6 mb-10 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-sage-700 dark:text-sage-300 uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Outil en libre accès</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {config.topTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {config.topDescription}
            </p>
          </div>
          <div className="shrink-0 flex items-center">
            <Button
              nativeButton={false}
              size="default"
              className="bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl shadow-xs text-xs sm:text-sm px-4 sm:px-5 py-2.5 h-auto w-full sm:w-auto"
              render={
                <Link
                  href={config.primary.href}
                  data-cta={`${config.primary.ctaId}-top-btn`}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <span>{config.primary.label}</span>
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
          </div>
        </div>
      </aside>
    )
  }

  // Variant === 'bottom' (Bloc 3 de fin d'article avec les deux actions)
  return (
    <div
      data-cta={`${config.primary.ctaId}-bottom`}
      className="rounded-2xl border border-border/80 bg-cream-light/80 dark:bg-zinc-900/60 p-6 sm:p-8 my-12 shadow-xs"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sage-700 dark:text-sage-300 uppercase tracking-wider">
          {config.primary.ctaId.startsWith('v') ? (
            <ShieldCheck className="size-4" />
          ) : (
            <FileCheck className="size-4" />
          )}
          <span>Passer à l’action</span>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
            {config.bottomTitle}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            {config.bottomDescription}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Button
            nativeButton={false}
            size="default"
            className="bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl shadow-xs text-sm px-5 py-3 h-auto"
            render={
              <Link
                href={config.primary.href}
                data-cta={`${config.primary.ctaId}-bottom-primary`}
                className="inline-flex items-center justify-center gap-2"
              >
                <span>{config.primary.label}</span>
                <ArrowRight className="size-4" />
              </Link>
            }
          />

          {config.secondary && (
            <Button
              nativeButton={false}
              variant="outline"
              size="default"
              className="border-border/80 text-foreground hover:bg-muted/50 rounded-xl font-medium text-sm px-4 py-3 h-auto"
              render={
                <Link
                  href={config.secondary.href}
                  data-cta={`${config.secondary.ctaId}-bottom-secondary`}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <span>{config.secondary.label}</span>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
