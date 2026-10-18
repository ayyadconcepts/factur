'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function FAQs() {
    const faqItems: { id: string; question: string; answer: ReactNode }[] = [
        {
            id: 'item-1',
            question: 'Comment convertir un PDF en Factur-X ?',
            answer: "Déposez le PDF, vérifiez les données extraites, téléchargez le fichier : l'outil ajoute à votre PDF un XML EN 16931 et les métadonnées PDF/A-3.",
        },
        {
            id: 'item-2',
            question: 'Faut-il ressaisir les données ?',
            answer: "Non, elles sont extraites automatiquement. Vous contrôlez et corrigez uniquement les écarts signalés ; vous restez responsable de l'exactitude de la facture.",
        },
        {
            id: 'item-3',
            question: 'Mon PDF reste-t-il identique ?',
            answer: (
                <span>
                    Dans le mode fidèle, le PDF d’origine est conservé ; seuls le XML et les métadonnées sont ajoutés. Si votre PDF source présente des incompatibilités d&apos;archivage pérenne, consultez notre <Link href="/ressources/pdf-a-3-facture-refusee" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">guide de diagnostic PDF/A-3</Link>.
                </span>
            ),
        },
        {
            id: 'item-4',
            question: 'Que vérifie l’outil ?',
            answer: "L'outil contrôle la validité du SIREN, SIRET, numéro de TVA, IBAN, la cohérence arithmétique de l'ensemble des totaux (HT, TVA, TTC) et la présence de chaque valeur obligatoire dans le document.",
        },
        {
            id: 'item-5',
            question: 'Le fichier est-il accepté par ma plateforme agréée ?',
            answer: (
                <span>
                    Il respecte la norme européenne EN 16931 et les règles nationales françaises (CIUS-FR et exigences Chorus Pro). Vous pouvez tester gratuitement votre fichier sur notre <Link href="/validateur-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">validateur Factur-X</Link> avant de <Link href="/ressources/envoyer-factur-x-plateforme-agreee" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">l&apos;envoyer sur une plateforme agréée</Link>.
                </span>
            ),
        },
        {
            id: 'item-6',
            question: 'L’outil envoie-t-il la facture à l’administration ?',
            answer: "Non. Vous déposez le fichier sur votre plateforme agréée (PDP ou Portail Public de Facturation / Chorus Pro). Notre service assure uniquement la conversion et la mise en conformité technique de votre document.",
        },
        {
            id: 'item-7',
            question: 'Que devient mon fichier ?',
            answer: (
                <span>
                    Le traitement s&apos;exécute de façon strictement éphémère en mémoire vive (RAM) via l&apos;API Google Gemini sécurisée (vos données d&apos;entreprise ne sont jamais utilisées pour entraîner les modèles d&apos;IA). Pour en savoir plus, consultez notre étude sur la <Link href="/ressources/convertisseur-factur-x-confidentialite-ia" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">confidentialité et l&apos;IA</Link> ainsi que notre <Link href="/#tarifs" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">politique de confidentialité</Link>.
                </span>
            ),
        },
        {
            id: 'item-8',
            question: 'Puis-je convertir un avoir ou une facture avec plusieurs taux de TVA ?',
            answer: (
                <span>
                    Oui, notre moteur prend en charge l&apos;ensemble des types de factures : consultez nos guides pratiques pour émettre un <Link href="/ressources/avoir-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">avoir Factur-X</Link> et traiter les factures avec <Link href="/ressources/factur-x-plusieurs-taux-tva" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium">plusieurs taux de TVA</Link>.
                </span>
            ),
        },
        {
            id: 'item-9',
            question: 'Combien ça coûte ?',
            answer: "1 conversion complète vous est offerte pour tester immédiatement sans carte bancaire ni engagement. Ensuite, nos forfaits démarrent à 10 € / mois pour 100 factures (soit 0,10 € la facture), 20 € / mois pour le forfait Volume (200 factures avec conversion par lot) et 50 € / mois pour le forfait Intensif, tous sans engagement et annulables à tout moment.",
        },
    ]

    return (
        <section className="pt-8 md:pt-12 pb-20 md:pb-28 bg-[#FBF9F6]" id="faq">
            <div className="mx-auto max-w-3xl px-6">
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                            Questions fréquentes
                        </h2>
                        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
                            Tout ce que vous devez savoir sur la conversion Factur-X et la réforme 2026.
                        </p>
                    </div>

                    <Accordion
                        type="single"
                        collapsible
                        className="-mx-2 sm:mx-0"
                    >
                        {faqItems.map((item) => (
                            <div
                                className="group"
                                key={item.id}
                            >
                                <AccordionItem
                                    value={item.id}
                                    className="data-[state=open]:bg-muted/60 peer rounded-xl border-none px-5 py-1.5 data-[state=open]:border-none md:px-7 transition-colors"
                                >
                                    <AccordionTrigger className="cursor-pointer text-base font-semibold hover:no-underline text-foreground py-4">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-2">
                                            {item.answer}
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                                <hr className="mx-5 -mb-px group-last:hidden peer-data-[state=open]:opacity-0 md:mx-7 border-border/60" />
                            </div>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground text-center text-sm">
                        Vous avez une question spécifique ?{' '}
                        <a
                            href="mailto:contact@facturxfacile.fr"
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
