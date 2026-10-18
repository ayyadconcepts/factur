import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Check, FileCheck } from 'lucide-react'

export default function Features() {
  return (
    <section id="comment-ca-marche" className="pt-10 md:pt-14 pb-6 md:pb-10">
      <div className="mx-auto max-w-5xl px-6">
          <div>
            <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs">
              Simple &amp; automatique
            </span>
            <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground mb-10 mt-3 text-balance text-base max-w-3xl">
              Un processus 100% automatique et instantané. Aucune saisie manuelle : vos données sont directement extraites de votre facture PDF et reformatées aux normes légales en un clin d&apos;œil.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-16 md:grid-cols-3">
            {/* Étape 1 */}
            <div className="space-y-4">
              <Card className="aspect-video overflow-hidden px-6 pt-6 bg-cream-light dark:bg-zinc-900/60 border-border/60">
                <Card
                  className="h-full translate-y-4 rounded-t-xl border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden bg-no-repeat p-3"
                  style={{
                    backgroundImage: "url('/assets/mesh.jpg?v=3')",
                    backgroundSize: '240% 240%',
                    backgroundPosition: '15% 35%',
                  }}
                >
                  <div className="p-3 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-rose-500/20">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">facture_01.pdf</p>
                          <p className="text-[10px] text-muted-foreground">148 Ko • Prêt</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sage-700 dark:text-sage-300 bg-sage-500/15 px-2 py-0.5 rounded-full border border-sage-500/30">
                        <Check className="h-2.5 w-2.5" />
                        Reçu
                      </span>
                    </div>
                    <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sage-500 h-1.5 rounded-full w-full" />
                    </div>
                  </div>
                </Card>
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-foreground text-base font-bold">1. Déposez votre facture PDF</h3>
                <p className="text-muted-foreground my-2 text-base leading-relaxed">
                  Uploadez simplement votre facture au format PDF existant. Que votre facture provienne d&apos;un modèle <Link href="/ressources/convertir-facture-word-en-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors">Word</Link> ou <Link href="/ressources/convertir-facture-excel-en-factur-x" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors">Excel</Link>, vous conservez vos outils habituels.
                </p>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="space-y-4">
              <Card className="aspect-video overflow-hidden p-6 bg-cream-light dark:bg-zinc-900/60 border-border/60">
                <Card
                  className="h-full rounded-xl border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden bg-no-repeat p-2.5 flex flex-col justify-center"
                  style={{
                    backgroundImage: "url('/assets/mesh.jpg?v=3')",
                    backgroundSize: '240% 240%',
                    backgroundPosition: '20% 98%',
                  }}
                >
                  <div className="p-2.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-mono text-[10px]">SIRET</span>
                      <span className="font-semibold text-foreground font-mono text-[10px] flex items-center gap-1">
                        839 201 948 00012
                        <Check className="h-2.5 w-2.5 text-sage-600 dark:text-sage-400" />
                      </span>
                    </div>
                    <div className="h-px bg-border/40" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-mono text-[10px]">TVA INTRA</span>
                      <span className="font-semibold text-foreground font-mono text-[10px] flex items-center gap-1">
                        FR 12 839201948
                        <Check className="h-2.5 w-2.5 text-sage-600 dark:text-sage-400" />
                      </span>
                    </div>
                    <div className="h-px bg-border/40" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-mono text-[10px]">TOTAL TTC</span>
                      <span className="font-semibold text-foreground font-mono text-[10px] flex items-center gap-1">
                        1 450,00 €
                        <Check className="h-2.5 w-2.5 text-sage-600 dark:text-sage-400" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-foreground text-base font-bold">2. Extraction &amp; conformité</h3>
                <p className="text-muted-foreground my-2 text-base leading-relaxed">
                  Notre système extrait chaque champ et élimine les risques de <Link href="/ressources/pdf-a-3-facture-refusee" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors">facture rejetée ou PDF/A-3 non conforme</Link> et d&apos;<Link href="/ressources/factur-x-xml-pdf-incoherents" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors">incohérences entre XML et PDF</Link>.
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="space-y-4">
              <Card className="aspect-video overflow-hidden pl-6 pt-6 bg-cream-light dark:bg-zinc-900/60 border-border/60">
                <Card
                  className="h-full translate-x-3 translate-y-3 rounded-tl-xl border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden bg-no-repeat p-3"
                  style={{
                    backgroundImage: "url('/assets/mesh.jpg?v=3')",
                    backgroundSize: '240% 240%',
                    backgroundPosition: '32% 12%',
                  }}
                >
                  <div className="p-2.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm flex flex-col gap-2 max-w-[92%]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileCheck className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400 shrink-0" />
                        <span className="text-xs font-semibold text-foreground truncate">Factur-X prêt</span>
                      </div>
                      <span className="text-[9px] font-mono bg-sage-500/15 text-sage-700 dark:text-sage-300 px-1.5 py-0.5 rounded border border-sage-500/25 font-semibold shrink-0">
                        PDF/A-3b
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="rounded bg-muted/60 p-1.5 flex flex-col gap-0.5 border border-border/40">
                        <span className="text-[8px] text-muted-foreground uppercase font-medium">Visuel</span>
                        <span className="font-medium text-foreground truncate text-[10px]">100% identique</span>
                      </div>
                      <div className="rounded bg-sage-500/10 p-1.5 flex flex-col gap-0.5 border border-sage-500/20">
                        <span className="text-[8px] text-sage-600 dark:text-sage-400 uppercase font-medium">Arrière-plan</span>
                        <span className="font-mono text-sage-700 dark:text-sage-300 font-semibold truncate text-[9px]">&lt;XML CII&gt;</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Card>
              <div className="sm:max-w-sm">
                <h3 className="text-foreground text-base font-bold">3. PDF Factur-X certifié</h3>
                <p className="text-muted-foreground my-2 text-base leading-relaxed">
                  Le PDF généré reste visuellement 100% identique pour vos clients tout en intégrant le XML EN 16931, prêt pour <Link href="/ressources/envoyer-factur-x-plateforme-agreee" className="underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors">l&apos;envoi sur une plateforme agréée</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
    </section>
  )
}
