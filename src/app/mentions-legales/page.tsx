import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions Légales | Factur-X Facile',
  description:
    'Consultez les mentions légales de Factur-X Facile : informations sur l’éditeur, l’hébergement européen, les prestataires techniques et la propriété intellectuelle.',
  alternates: {
    canonical: '/mentions-legales',
  },
  openGraph: {
    title: 'Mentions Légales | Factur-X Facile',
    description:
      'Consultez les mentions légales de Factur-X Facile : informations sur l’éditeur, l’hébergement européen et les prestataires techniques.',
    url: 'https://facturxfacile.com/mentions-legales',
    type: 'website',
  },
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      currentSlug="mentions-legales"
      title="Mentions légales"
      effectiveDate="18 octobre 2026"
    >
      {/* 1. Éditeur du site */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          1. Éditeur de la plateforme
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Le site web accessible à l&apos;adresse <strong className="text-foreground">https://facturxfacile.com</strong> (ci-après désigné « le Service » ou « la Plateforme ») est conçu, édité et exploité par :
        </p>
        <div className="rounded-xl border border-border/70 bg-cream-light/60 dark:bg-zinc-900/60 p-4 sm:p-5 text-sm space-y-1.5">
          <p><strong className="text-foreground">Éditeur &amp; Fondateur :</strong> Youssef Ayyad (Entrepreneur individuel / Solo Founder)</p>
          <p><strong className="text-foreground">Adresse postale :</strong> Imm 104 Appt 19 RES AL HADIKA DOHA LAAYAYADA, Salé, Maroc</p>
          <p><strong className="text-foreground">Courrier électronique :</strong> <a href="mailto:youssef@facturxfacile.com" className="text-sage-600 dark:text-sage-400 underline underline-offset-2">youssef@facturxfacile.com</a></p>
          <p><strong className="text-foreground">Directeur de la publication :</strong> Youssef Ayyad</p>
        </div>
      </section>

      {/* 2. Hébergement & Infrastructure technique */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          2. Prestataires d’hébergement et infrastructure technique
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Conformément aux exigences de souveraineté des données et de conformité au RGPD, l&apos;ensemble de l&apos;infrastructure de calcul, de stockage et de base de données est localisé au sein de centres de données sécurisés situés en Union Européenne :
        </p>
        
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 p-4 bg-card/60">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              A. Hébergement Web &amp; Calcul Serverless (Frontend &amp; API)
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Vercel Inc.</strong> — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />
              Déploiement et exécution des fonctions serverless en <strong className="text-foreground">Union Européenne (Région AWS Paris, cdg1)</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 p-4 bg-card/60">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              B. Base de données &amp; Authentification des utilisateurs
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Supabase Inc.</strong> — 970 Toa Payoh North #07-04, Singapour.<br />
              Instance PostgreSQL hébergée et chiffrée au repos sur des serveurs en <strong className="text-foreground">Union Européenne (AWS Région Francfort, eu-central-1)</strong> avec isolation par Row-Level Security (RLS).
            </p>
          </div>

          <div className="rounded-xl border border-border/70 p-4 bg-card/60">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              C. Stockage sécurisé des documents (PDF &amp; XML Factur-X)
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Cloudflare R2 (Cloudflare Inc.)</strong> — 101 Townsend St, San Francisco, CA 94107, États-Unis.<br />
              Stockage privé chiffré (AES-256) en <strong className="text-foreground">Union Européenne</strong>, accessible uniquement via des URLs temporaires signées à validité restreinte (60 secondes) après authentification.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Prestataire de paiement & Merchant of Record */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          3. Gestion des transactions et paiements (Merchant of Record)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Pour garantir la sécurité maximale des transactions et le respect des réglementations fiscales internationales relatives à la TVA, les paiements sur Factur-X Facile sont pris en charge par notre partenaire agréé agissant en tant que <em>Merchant of Record</em> :
        </p>
        <div className="rounded-xl border border-border/70 bg-cream-light/60 dark:bg-zinc-900/60 p-4 sm:p-5 text-sm space-y-1">
          <p><strong className="text-foreground">Entité :</strong> Paddle.com Market Ltd (ou Paddle Payments Ireland Ltd)</p>
          <p><strong className="text-foreground">Siège social :</strong> Judd House, 18-29 Mora Street, Londres EC1V 8BT, Royaume-Uni</p>
          <p><strong className="text-foreground">Sécurité bancaire :</strong> Certification PCI-DSS Niveau 1 (Factur-X Facile ne stocke aucun numéro de carte bancaire)</p>
        </div>
      </section>

      {/* 4. Propriété intellectuelle */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          4. Propriété intellectuelle et droits d’auteur
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          La marque, le nom de domaine, la charte graphique, les composants d&apos;interface, les textes explicatifs, les moteurs d&apos;extraction déterministe et l&apos;ensemble des contenus présents sur ce site sont la propriété exclusive de Youssef Ayyad, à l&apos;exception des logos ou marques tierces mentionnés à des fins de compatibilité technique (ex. UN/CEFACT, Chorus Pro, ISO, Paddle).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est formellement interdite sans l&apos;autorisation écrite préalable de l&apos;éditeur.
        </p>
      </section>

      {/* 5. Nature du service & absence d’affiliation officielle */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          5. Nature du service et indépendance
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Factur-X Facile est une solution logicielle SaaS indépendante d&apos;aide à la conformité technique des factures électroniques (standard mixte PDF/A-3 et XML CII EN 16931).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Le Service <strong className="text-foreground">n&apos;est pas une Plateforme de Dématérialisation Partenaire (PDP)</strong> immatriculée, ni un organisme d&apos;État. Il n&apos;a aucun lien juridique, affiliation ou partenariat financier avec l&apos;Agence pour l&apos;Informatique Financière de l&apos;État (AIFE), le Portail Public de Facturation (PPF) ou la Direction Générale des Finances Publiques (DGFiP).
        </p>
      </section>

      {/* 6. Protection des données */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          6. Données personnelles
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Les modalités de collecte et de traitement des données personnelles sont détaillées dans notre{' '}
          <Link
            href="/politique-de-confidentialite"
            className="text-sage-600 dark:text-sage-400 font-semibold underline underline-offset-2 hover:text-sage-700"
          >
            Politique de confidentialité
          </Link>
          , rédigée en conformité avec le Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679).
        </p>
      </section>
    </LegalLayout>
  );
}
