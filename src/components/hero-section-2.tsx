import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/header'
import { Sparkle, ArrowRight } from 'lucide-react'
import { HeroUploader } from '@/components/HeroUploader'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main>
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
                            <div>
                                <Link
                                    href="#uploader"
                                    className="hover:bg-foreground/5 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150"
                                >
                                    <div
                                        aria-hidden
                                        className="border-background bg-linear-to-b dark:inset-shadow-2xs to-foreground from-primary relative flex size-5 items-center justify-center rounded border shadow-md shadow-black/20 ring-1 ring-black/10"
                                    >
                                        <div className="absolute inset-x-0 inset-y-1.5 border-y border-dotted border-white/25"></div>
                                        <div className="absolute inset-x-1.5 inset-y-0 border-x border-dotted border-white/25"></div>
                                        <Sparkle className="size-3 fill-white stroke-white drop-shadow" />
                                    </div>
                                    <span className="font-medium text-sm">Conforme Réforme Chorus Pro 2026</span>
                                </Link>
                                <h1 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                    Convertisseur PDF<br />en <span className="whitespace-nowrap">Factur-X</span> instantané
                                </h1>
                                <p className="text-foreground mx-auto my-5 max-w-2xl text-base sm:text-lg font-normal leading-relaxed">
                                    <span className="sm:block">Convertissez instantanément vos factures PDF au format officiel <span className="whitespace-nowrap">Factur-X</span>.</span>
                                    <span className="sm:block">Vos données sont extraites et validées automatiquement, sans rien ressaisir.</span>
                                </p>

                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        nativeButton={false}
                                        size="lg"
                                        className="bg-sage-600 hover:bg-sage-700 text-white shadow-md shadow-sage-500/20"
                                        render={
                                            <a href="#uploader">
                                                <span className="text-nowrap">Convertir une facture</span>
                                            </a>
                                        }
                                    />
                                    <Button
                                        key={2}
                                        nativeButton={false}
                                        size="lg"
                                        variant="outline"
                                        render={
                                            <Link href="/validateur-factur-x">
                                                <span className="text-nowrap">Valider un fichier Factur-X</span>
                                                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                                            </Link>
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Intégration du composant d'upload directement dans le Hero */}
                        <div className="relative pt-12 md:pt-16" id="uploader">
                            <div className="relative z-10 mx-auto max-w-5xl px-6">
                                <HeroUploader />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
