export default function StatsSection() {
    return (
        <section className="pt-16 md:pt-20 pb-10 md:pb-12">
            <div className="mx-auto max-w-5xl px-6">
                <div>
                    <h2 className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight">
                        <span className="text-sage-600 dark:text-sage-400">facturxfacile</span> en chiffres
                    </h2>
                    <p className="text-muted-foreground mt-3 text-balance text-base max-w-3xl">
                        Notre plateforme accompagne les entreprises et indépendants dans leur transition vers la facturation électronique obligatoire.
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-6 md:mt-12 md:grid-cols-4">
                    <div>
                        <div className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight">100%</div>
                        <p className="text-muted-foreground text-sm mt-1.5">Conforme Chorus Pro</p>
                    </div>
                    <div>
                        <div className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight">0,10 €</div>
                        <p className="text-muted-foreground text-sm mt-1.5">Par facture</p>
                    </div>
                    <div>
                        <div className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight">24/7</div>
                        <p className="text-muted-foreground text-sm mt-1.5">Disponibilité</p>
                    </div>
                    <div>
                        <div className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight">1M+</div>
                        <p className="text-muted-foreground text-sm mt-1.5">Factures converties</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
