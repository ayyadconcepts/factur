import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <div className="bg-[#FBF9F6] px-1.5 sm:px-2 md:px-3 pb-2 sm:pb-3 md:pb-4 pt-4 md:pt-6">
      <footer className="rounded-2xl md:rounded-[2rem] bg-white dark:bg-zinc-950 pt-16 pb-12 text-sm text-foreground overflow-hidden shadow-xs">
        <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5 pb-12 border-b border-border/60">
          {/* Colonne Marque & Souveraineté des données (col-span 2) */}
          <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-2">
            <Link href="/" aria-label="Accueil" className="inline-block w-fit">
              <img
                src="/assets/logo-factur-x-facile.png?v=3"
                alt="Factur-X Facile"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Conformité réforme française 2026 et normes RGPD - interlignage aéré */}
            <p className="text-xs leading-[1.75] text-muted-foreground max-w-[280px]">
              Conforme à la nouvelle réforme française de facturation électronique 2026 et aux normes de protection des données RGPD.
            </p>

            {/* Badges / Logos de conformité officiels sans box ni texte */}
            <div className="flex items-center gap-3.5 pt-1.5">
              <img
                src="/assets/compliance/GDPR.svg"
                alt="RGPD (UE)"
                title="Conformité RGPD Règlement (UE) 2016/679"
                className="h-10 w-auto opacity-75 grayscale hover:opacity-100 transition-opacity dark:invert"
              />
              <img
                src="/assets/compliance/ISO-27001.svg"
                alt="ISO 27001"
                title="Sécurité de l'information certifiée ISO 27001"
                className="h-10 w-auto opacity-75 grayscale hover:opacity-100 transition-opacity dark:invert"
              />
              <img
                src="/assets/compliance/ISO-27017.svg"
                alt="ISO 27017 Cloud UE"
                title="Sécurité Cloud ISO 27017 - Hébergement UE (Paris & Francfort)"
                className="h-10 w-auto opacity-75 grayscale hover:opacity-100 transition-opacity dark:invert"
              />
            </div>
          </div>

          {/* Colonne 1 : Outils */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground">
              Outils &amp; Hubs
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground leading-normal">
              <li>
                <Link href="/#uploader" className="hover:text-foreground transition-colors">
                  Convertisseur Factur-X
                </Link>
              </li>
              <li>
                <Link href="/validateur-factur-x" className="hover:text-foreground transition-colors">
                  Validateur Factur-X
                </Link>
              </li>
              <li>
                <Link href="/ressources" className="hover:text-foreground transition-colors">
                  Ressources
                </Link>
              </li>
              <li>
                <Link href="/#tarifs" className="hover:text-foreground transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 2 : Guides prioritaires en 1 seule colonne (hauteur élégante) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground">
              Guides essentiels
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground leading-normal">
              <li>
                <Link href="/ressources/convertir-facture-word-en-factur-x" className="hover:text-foreground transition-colors">
                  Convertir une facture Word en Factur-X
                </Link>
              </li>
              <li>
                <Link href="/ressources/convertir-facture-excel-en-factur-x" className="hover:text-foreground transition-colors">
                  Convertir une facture Excel en Factur-X
                </Link>
              </li>
              <li>
                <Link href="/ressources/pdf-a-3-facture-refusee" className="hover:text-foreground transition-colors">
                  Diagnostic PDF/A-3 refusé
                </Link>
              </li>
              <li>
                <Link href="/ressources/envoyer-factur-x-plateforme-agreee" className="hover:text-foreground transition-colors">
                  Envoyer sur PDP ou PPF
                </Link>
              </li>
              <li>
                <Link href="/ressources/erreurs-validation-factur-x" className="hover:text-foreground transition-colors">
                  Guide des erreurs Factur-X
                </Link>
              </li>
              <li>
                <Link href="/ressources/erreur-br-co-15" className="hover:text-foreground transition-colors">
                  Correction erreur BR-CO-15
                </Link>
              </li>
              <li>
                <Link href="/ressources/erreur-br-fr-12-br-fr-13" className="hover:text-foreground transition-colors">
                  Erreurs BR-FR-12 &amp; BR-FR-13
                </Link>
              </li>
              <li>
                <Link href="/ressources/ce-que-controle-un-validateur-factur-x" className="hover:text-foreground transition-colors">
                  Contrôles d’un validateur
                </Link>
              </li>
              <li>
                <Link href="/ressources/factur-x-definition-profils" className="hover:text-foreground transition-colors">
                  Profils Factur-X &amp; Chorus
                </Link>
              </li>
              <li>
                <Link href="/ressources/factur-x-cabinet-comptable" className="hover:text-foreground transition-colors">
                  Factur-X pour cabinets
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground">
              Légal
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground leading-normal">
              <li>
                <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-de-confidentialite" className="hover:text-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/conditions-utilisation" className="hover:text-foreground transition-colors">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <a
                  href="mailto:youssef@facturxfacile.com"
                  className="hover:text-foreground transition-colors"
                >
                  Contact &amp; Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne inférieure : Copyright et statut de souveraineté */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} facturxfacile. Tous droits réservés.</p>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Infrastructure 100% UE • Conforme Réforme Facturation Électronique 2026</span>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}
