'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Layers, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function MistFeatures() {
    return (
        <section id="fonctionnalites">
            <div className="pt-4 md:pt-6 pb-20 md:pb-28">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div>
                        <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs">
                            Polyvalent &amp; puissant
                        </span>
                        <h2 className="text-foreground mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                            Conçu pour toutes vos exigences de facturation
                        </h2>
                        <p className="text-muted-foreground mb-10 mt-3 text-balance text-base max-w-3xl">
                            Une prise en charge complète des formats réglementaires français et des outils pensés pour traiter vos volumes à grande vitesse.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Bloc 1 : Types de factures supportés avec Factur-X mis en avant */}
                        <Card
                            className="p-6 bg-cream-light dark:bg-zinc-900/60 border-border/60 flex flex-col justify-between"
                        >
                            <div className="flex aspect-video items-center justify-center">
                                <InvoiceTypesIllustration className="w-full" />
                            </div>
                            <div className="text-left mt-4">
                                <h3 className="text-foreground text-base font-bold">Tous vos types de factures supportés</h3>
                                <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                                    Factures de vente, acomptes, <Link href="/ressources/avoir-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">avoirs</Link> ou factures avec <Link href="/ressources/factur-x-plusieurs-taux-tva" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">plusieurs taux de TVA</Link> : notre moteur prend en charge tous vos documents et génère le profil officiel Factur-X EN 16931 exigé par la réforme 2026.
                                </p>
                            </div>
                        </Card>

                        {/* Bloc 2 : Conversion par lot */}
                        <Card
                            className="p-6 bg-cream-light dark:bg-zinc-900/60 border-border/60 flex flex-col justify-between"
                        >
                            <div className="flex aspect-video items-center justify-center">
                                <BatchConversionIllustration className="border border-border/40 rounded-xl p-6 bg-card/60" />
                            </div>
                            <div className="text-left mt-4">
                                <h3 className="text-foreground text-base font-bold">Conversion par lot ultra-rapide</h3>
                                <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                                    Gagnez des heures chaque mois : déposez un lot entier de factures, le moteur les convertit toutes simultanément et vous restitue une archive ZIP prête à l&apos;emploi.
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Section Pour qui ? (Section 13.4) */}
                    <div className="mt-8 rounded-2xl border border-border/60 bg-cream-light dark:bg-zinc-900/60 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
                        <div className="space-y-1.5 max-w-xl">
                            <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs">
                                Pour qui ?
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-foreground">
                                Une solution adaptée à chaque structure
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Conçu aussi bien pour le <Link href="/ressources/factur-x-micro-entrepreneur" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">micro-entrepreneur</Link> souhaitant émettre des factures conformes sans logiciel lourd, que pour le <Link href="/ressources/factur-x-cabinet-comptable" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors font-medium text-foreground">cabinet d&apos;expertise comptable</Link> accompagnant la mise en conformité de ses clients TPE.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5 shrink-0">
                            <Button
                                nativeButton={false}
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-xs font-semibold"
                                render={
                                    <Link href="/ressources/factur-x-micro-entrepreneur">
                                        <span>Micro-entrepreneurs</span>
                                    </Link>
                                }
                            />
                            <Button
                                nativeButton={false}
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-xs font-semibold"
                                render={
                                    <Link href="/ressources/factur-x-cabinet-comptable">
                                        <span>Cabinets comptables</span>
                                    </Link>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

interface IllustrationProps {
    className?: string
    variant?: 'elevated' | 'outlined' | 'mixed'
}

export const BatchConversionIllustration = ({ className, variant = 'elevated' }: IllustrationProps) => {
    return (
        <div className={cn('relative', className)}>
            <div
                className={cn('bg-background -translate-x-1/8 absolute flex translate-y-[-110%] items-center gap-2 rounded-lg p-1.5 shadow-sm', {
                    'shadow-black-950/10 shadow-lg': variant === 'elevated',
                    'border-foreground/10 border': variant === 'outlined',
                    'border-foreground/10 border shadow-md shadow-black/5': variant === 'mixed',
                })}
            >
                <Button
                    size="sm"
                    className="rounded-md bg-sage-600 hover:bg-sage-700 text-white gap-1.5 text-xs h-7 px-2.5 shadow-xs"
                >
                    <Layers className="size-3.5" />
                    <span className="text-xs font-semibold">Convertir le lot</span>
                </Button>
                <span className="bg-border block h-4 w-px"></span>
                <ToggleGroup
                    size="sm"
                    defaultValue={['pdf', 'xml', 'zip']}
                    className="gap-0.5 *:rounded-md"
                >
                    <ToggleGroupItem
                        value="pdf"
                        aria-label="Format PDF"
                        className="text-[11px] font-mono px-2 h-7 data-[state=on]:bg-sage-500/15 data-[state=on]:text-sage-700 dark:data-[state=on]:text-sage-300 font-semibold"
                    >
                        PDF
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="xml"
                        aria-label="Format XML"
                        className="text-[11px] font-mono px-2 h-7 data-[state=on]:bg-sage-500/15 data-[state=on]:text-sage-700 dark:data-[state=on]:text-sage-300 font-semibold"
                    >
                        XML
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="zip"
                        aria-label="Archive ZIP"
                        className="text-[11px] font-mono px-2 h-7 data-[state=on]:bg-sage-500/15 data-[state=on]:text-sage-700 dark:data-[state=on]:text-sage-300 font-semibold"
                    >
                        ZIP
                    </ToggleGroupItem>
                </ToggleGroup>
                <span className="bg-border block h-4 w-px"></span>
                <Button
                    size="icon"
                    className="size-7 text-sage-600 hover:text-sage-700 dark:text-sage-400 hover:bg-sage-500/10"
                    variant="ghost"
                >
                    <Download className="size-3.5" />
                </Button>
            </div>
            <span className="text-sm text-muted-foreground select-none">
                <span className="bg-cream-dark/60 text-foreground px-2 py-0.5 rounded font-mono font-medium">50 factures traitées</span> en 3,8 secondes.
            </span>
        </div>
    )
}

export const InvoiceTypesIllustration = ({ className }: { className?: string }) => {
    const types = [
        "Facture d'acompte",
        "Facture de vente",
        "Factur-X (EN 16931)",
        "Avoir & rectificatif",
        "Facture de situation"
    ]

    return (
        <div className={cn('mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)] overflow-hidden py-3', className)}>
            <ul className="text-muted-foreground mx-auto w-fit font-mono text-xl sm:text-2xl font-medium space-y-1">
                {types.map((item, index) => (
                    <li
                        key={index}
                        className={cn(
                            'relative select-none text-center transition-colors',
                            index === 2
                                ? "text-foreground font-bold before:absolute before:translate-x-[-115%] before:text-sage-600 dark:before:text-sage-400 before:font-bold before:text-xs sm:before:text-sm before:content-['Cible'] before:bg-sage-500/10 before:px-1.5 before:py-0.5 before:rounded border-y border-sage-500/20 py-0.5"
                                : "opacity-50"
                        )}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}
