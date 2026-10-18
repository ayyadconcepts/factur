import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales d’Utilisation (CGU) | Factur-X Facile',
  description:
    'Consultez les conditions d’utilisation de Factur-X Facile : règles d’accès aux services de conversion et de validation Factur-X, abonnements Paddle et responsabilités.',
  alternates: {
    canonical: '/conditions-utilisation',
  },
  openGraph: {
    title: 'Conditions Générales d’Utilisation (CGU) | Factur-X Facile',
    description:
      'Consultez les conditions d’utilisation de Factur-X Facile : règles d’accès aux services de conversion et de validation Factur-X, abonnements Paddle et responsabilités.',
    url: 'https://facturxfacile.com/conditions-utilisation',
    type: 'website',
  },
};

export default function ConditionsUtilisationPage() {
  return (
    <LegalLayout
      currentSlug="conditions-utilisation"
      title="Conditions d’utilisation"
      effectiveDate="18 octobre 2026"
    >
      {/* 1. Préambule et objet */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          1. Préambule et objet du Service
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Les présentes Conditions Générales d’Utilisation (ci-après « CGU ») régissent l&apos;accès et l&apos;utilisation de la plateforme en ligne <strong className="text-foreground">Factur-X Facile</strong> (accessible à l&apos;adresse https://facturxfacile.com), éditée par Youssef Ayyad.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Factur-X Facile est un service logiciel en ligne (SaaS) conçu pour assister les entreprises, indépendants, TPE, PME et cabinets comptables dans la mise en conformité de leurs factures avec la réglementation française de facturation électronique 2026, au moyen de :
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-sm sm:text-base">
          <li>Un outil de <strong className="text-foreground">validation technique</strong> vérifiant la conformité PDF/A-3, la validité du schéma XSD UN/CEFACT CII 16B et les règles métiers Schematron EN 16931 / CIUS-FR.</li>
          <li>Un outil de <strong className="text-foreground">conversion de factures PDF</strong> ordinaires en documents hybrides Factur-X conformes, prêts pour transmission vers les Plateformes de Dématérialisation Partenaires (PDP) ou le Portail Public de Facturation (PPF / Chorus Pro).</li>
        </ul>
      </section>

      {/* 2. Accès et création de compte */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          2. Accès au service et gestion du compte
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          L&apos;accès au validateur technique et à une première conversion de découverte est proposé sans obligation de paiement préalable.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Pour bénéficier des conversions régulières ou de l&apos;historique sécurisé, la création d&apos;un compte utilisateur est requise. L&apos;utilisateur s&apos;engage à fournir une adresse email valide et à préserver la stricte confidentialité de ses accès. Toute utilisation du Service effectuée au moyen de ses identifiants est réputée réalisée par l&apos;utilisateur lui-même.
        </p>
      </section>

      {/* 3. Tarifs, Abonnements & Merchant of Record */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          3. Tarifs, paiements et conditions d’abonnement
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Les différentes formules tarifaires (crédits à l&apos;usage ou abonnements mensuels/annuels) sont détaillées en toute transparence sur notre{' '}
          <Link href="/#tarifs" className="text-sage-600 dark:text-sage-400 font-semibold underline underline-offset-2">
            grille des tarifs
          </Link>
          .
        </p>
        <div className="rounded-xl border border-border/70 bg-cream-light/60 dark:bg-zinc-900/60 p-4 sm:p-5 text-sm space-y-2">
          <p className="font-semibold text-foreground">
            Rôle de Paddle.com (Merchant of Record) :
          </p>
          <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
            Toutes les transactions financières relatives aux abonnements et forfaits de facturation sont gérées par notre partenaire commercial agréé <strong className="text-foreground">Paddle.com Market Ltd</strong>. En achetant un forfait, vous concluez un contrat de vente direct avec Paddle en tant que vendeur enregistré. Paddle calcule et reverse la TVA locale applicable selon votre pays de résidence et émet votre reçu fiscal officiel.
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
          Les abonnements récurrents sont renouvelés tacitement à chaque échéance (mensuelle ou annuelle). Vous pouvez interrompre votre abonnement à tout moment, en un clic depuis votre espace utilisateur, avec prise d&apos;effet au terme de la période déjà réglée.
        </p>
      </section>

      {/* 4. Responsabilité de l'utilisateur */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          4. Responsabilité de l’utilisateur &amp; Contrôle des données
        </h2>
        <div className="rounded-xl border border-border/70 p-4 sm:p-5 bg-card/60 space-y-2">
          <p className="text-sm sm:text-base text-foreground font-semibold">
            Obligation de vérification préalable :
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            L&apos;utilisateur est l&apos;unique émetteur de sa facture au sens fiscal et juridique. Bien que Factur-X Facile intègre un moteur de calcul de haute précision arithmétique et des contrôles de conformité stricts (règles EN 16931, BR-CO-15, etc.), <strong className="text-foreground">l&apos;utilisateur demeure seul responsable de l&apos;exactitude des mentions portées sur son document</strong> (taux de TVA, numéro SIRET, montants, mentions légales obligatoires).
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            L&apos;utilisateur s&apos;engage à vérifier visuellement le récapitulatif généré avant de soumettre son fichier à son client ou à une plateforme de dématérialisation agréée.
          </p>
        </div>
      </section>

      {/* 5. Usages interdits */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          5. Utilisation loyale et comportements prohibés
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          En utilisant Factur-X Facile, vous vous engagez formellement à :
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-sm sm:text-base">
          <li>Ne pas soumettre de documents illicites, frauduleux, usurpatoires ou contenant des codes malveillants.</li>
          <li>Ne pas tenter de contourner les quotas d&apos;utilisation, les mécanismes d&apos;authentification ou la sécurité de l&apos;infrastructure.</li>
          <li>Ne pas effectuer d&apos;attaques par déni de service (DDoS) ou de scraping automatisé abusif de nos interfaces.</li>
          <li>Ne pas utiliser le Service pour générer des factures fictives ou frauduleuses à des fins d&apos;évasion fiscale.</li>
        </ul>
      </section>

      {/* 6. Disponibilité & Limitation de responsabilité */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          6. Disponibilité du Service et limitation de responsabilité
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          L&apos;éditeur met en œuvre tous les moyens raisonnables pour assurer un accès permanent au Service 24h/24 et 7j/7. Cependant, l&apos;accès peut être temporairement interrompu pour des besoins de maintenance logicielle, de mise à jour des règles fiscales ou en cas de force majeure indépendante de notre volonté.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Factur-X Facile constitue une assistance technique logicielle et ne saurait constituer une prestation de conseil fiscal ou d&apos;expertise comptable. L&apos;éditeur ne saurait être tenu pour responsable des éventuels rejets de factures par une plateforme tierce (PPF, PDP) dus à des manquements d&apos;informations imputables à l&apos;utilisateur, ni des pénalités financières consécutives.
        </p>
      </section>

      {/* 7. Propriété des documents */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          7. Propriété des contenus et données
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Vous conservez l&apos;entière et exclusive propriété de tous les fichiers PDF, factures et données commerciales que vous transmettez au Service. Factur-X Facile ne revendique aucun droit de propriété sur vos documents.
        </p>
      </section>

      {/* 8. Loi applicable & Contact */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          8. Droit applicable et règlement des différends
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Les présentes CGU sont rédigées en langue française. En cas de réclamation ou de litige relatif à l&apos;utilisation du Service, l&apos;utilisateur s&apos;engage à contacter en priorité l&apos;éditeur afin de trouver une solution amiable :
        </p>
        <div className="rounded-xl border border-border/70 bg-cream-light/60 dark:bg-zinc-900/60 p-4 sm:p-5 text-sm space-y-1">
          <p><strong className="text-foreground">Contact support &amp; litiges :</strong> <a href="mailto:youssef@facturxfacile.com" className="text-sage-600 dark:text-sage-400 font-medium underline underline-offset-2">youssef@facturxfacile.com</a></p>
          <p><strong className="text-foreground">Délai d’instruction :</strong> Réponse garantie sous 48 heures ouvrées</p>
        </div>
      </section>
    </LegalLayout>
  );
}
