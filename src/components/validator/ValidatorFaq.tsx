'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqItem {
  id: string
  question: string
  answer: ReactNode
}

export const VALIDATOR_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'item-1',
    question: 'Qu’est-ce qu’un validateur Factur-X ?',
    answer:
      "Un outil qui contrôle qu’un PDF contient un XML conforme aux spécifications officielles et que le conteneur respecte les critères d'archivage pérenne de la norme PDF/A-3 (ISO 19005-3). Il audite la syntaxe et la conformité juridique du fichier sans modifier son contenu.",
  },
  {
    id: 'item-2',
    question: 'Comment savoir si ma facture est un Factur-X ?',
    answer: (
      <span>
        Le validateur cherche une pièce jointe standardisée{' '}
        <code className="rounded bg-muted/80 border border-border/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
          factur-x.xml
        </code>{' '}
        (ou{' '}
        <code className="rounded bg-muted/80 border border-border/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
          zugferd-invoice.xml
        </code>
        ) incorporée dans le document. Sans ce fichier XML structuré, il s&apos;agit d&apos;un simple PDF bureautique ordinaire inexploitable par les plateformes de facturation électronique.
      </span>
    ),
  },
  {
    id: 'item-3',
    question: 'Pourquoi mon PDF s’ouvre-t-il mais est-il refusé ?',
    answer: (
      <span>
        La conformité réglementaire se joue dans des éléments invisibles à l&apos;écran : polices de caractères entièrement incorporées, métadonnées XMP et schéma XML CII. Pour comprendre et corriger ces rejets, consultez notre guide sur le{' '}
        <Link
          href="/ressources/pdf-a-3-facture-refusee"
          className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground"
        >
          diagnostic du rejet PDF/A-3
        </Link>
        .
      </span>
    ),
  },
  {
    id: 'item-4',
    question: 'Quelle différence entre XSD, Schematron et PDF/A ?',
    answer: (
      <span>
        Chaque composant valide un niveau technique distinct : le PDF/A certifie la pérennité du conteneur visuel ; le schéma XSD valide la grammaire et la structure du XML ; le Schematron contrôle les règles métiers et les calculs arithmétiques. Pour explorer cette articulation, consultez notre dossier :{' '}
        <Link
          href="/ressources/ce-que-controle-un-validateur-factur-x"
          className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground"
        >
          ce que contrôle un validateur Factur-X
        </Link>
        .
      </span>
    ),
  },
  {
    id: 'item-5',
    question: 'Ce validateur est-il officiel ?',
    answer:
      "Non. Le validateur officiel de la FNFE-MPE existe séparément. Notre outil s'appuie rigoureusement sur les mêmes référentiels publics et standards stricts : schémas XSD UN/CEFACT CII 16B, règles Schematron EN 16931 (version 1.3.11), extensions nationales françaises CIUS-FR (version 2.3) et profils officiels Factur-X 1.0.07.",
  },
  {
    id: 'item-6',
    question: 'Mes fichiers sont-ils conservés ?',
    answer:
      "Non. Le contrôle s'exécute de façon strictement éphémère en mémoire vive (RAM) sur nos serveurs sécurisés situés en Union Européenne. Aucun document n'est sauvegardé sur disque, conservé en base de données ou partagé avec des tiers.",
  },
  {
    id: 'item-7',
    question: 'Quels profils sont supportés ?',
    answer:
      "Tous les profils officiels Factur-X et ZUGFeRD sont reconnus et vérifiés : MINIMUM, BASIC WL (Without Lines), BASIC, EN 16931 (profil officiel obligatoire pour Chorus Pro et les plateformes agréées) ainsi qu'EXTENDED.",
  },
  {
    id: 'item-8',
    question: 'Que faire en cas d’erreur BR-CO-15 ?',
    answer: (
      <span>
        L&apos;erreur BR-CO-15 signale un écart de calcul entre le total de TVA de la facture et la somme des montants par taux d&apos;imposition (arrondi au centime). Pour identifier la cause et corriger votre fichier, suivez notre guide pas à pas pour{' '}
        <Link
          href="/ressources/erreur-br-co-15"
          className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground"
        >
          résoudre l’erreur BR-CO-15
        </Link>
        .
      </span>
    ),
  },
]

export function ValidatorFaq() {
  return (
    <section className="pt-8 md:pt-12 pb-20 md:pb-28 bg-[#FBF9F6]" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Tout ce que vous devez savoir sur la validation Factur-X et les exigences de conformité.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="-mx-2 sm:mx-0"
          >
            {VALIDATOR_FAQ_ITEMS.map((item) => (
              <div className="group" key={item.id}>
                <AccordionItem
                  value={item.id}
                  className="data-[state=open]:bg-muted/60 peer rounded-xl border-none px-5 py-1.5 data-[state=open]:border-none md:px-7 transition-colors"
                >
                  <AccordionTrigger className="cursor-pointer text-base font-semibold hover:no-underline text-foreground py-4 text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-2">
                      {item.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <hr className="mx-5 -mb-px group-last:hidden peer-data-[state=open]:opacity-0 md:mx-7 border-border/60" />
              </div>
            ))}
          </Accordion>

          <p className="text-muted-foreground text-center text-sm">
            Vous avez une question spécifique sur un rapport d&apos;erreur ?{' '}
            <a
              href="mailto:youssef@facturxfacile.com"
              className="text-sage-600 hover:text-sage-700 dark:text-sage-400 font-medium hover:underline"
            >
              Contactez notre support
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
