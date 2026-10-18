import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité & RGPD | Factur-X Facile',
  description:
    'Découvrez la politique de protection des données de Factur-X Facile : hébergement 100% Union Européenne, principe de minimisation RGPD, zéro transmission à des IA tierces.',
  alternates: {
    canonical: '/politique-de-confidentialite',
  },
  openGraph: {
    title: 'Politique de Confidentialité & RGPD | Factur-X Facile',
    description:
      'Découvrez la politique de protection des données de Factur-X Facile : hébergement 100% UE, principe de minimisation RGPD, zéro transmission à des IA tierces.',
    url: 'https://facturxfacile.com/politique-de-confidentialite',
    type: 'website',
  },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalLayout
      currentSlug="politique-de-confidentialite"
      title="Politique de confidentialité"
      effectiveDate="18 octobre 2026"
    >
      {/* Introduction */}
      <section className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          Chez <strong className="text-foreground">Factur-X Facile</strong>, la confidentialité et la sécurité de vos données financières et commerciales sont au cœur de l&apos;architecture de nos outils. Nous appliquons une politique stricte de <strong className="text-foreground">minimisation des données</strong> (Privacy by Design) en stricte conformité avec :
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-sm sm:text-base">
          <li>Le <strong className="text-foreground">Règlement Général sur la Protection des Données (RGPD)</strong> — Règlement (UE) 2016/679 du Parlement européen.</li>
          <li>La <strong className="text-foreground">Loi n° 09-08</strong> relative à la protection des personnes physiques à l&apos;égard du traitement des données à caractère personnel.</li>
        </ul>
      </section>

      {/* 1. Responsable du traitement */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          1. Responsable du traitement des données
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Le traitement de vos données est sous la responsabilité directe de l&apos;éditeur de la plateforme :
        </p>
        <div className="rounded-xl border border-border/70 bg-cream-light/60 dark:bg-zinc-900/60 p-4 sm:p-5 text-sm space-y-1.5">
          <p><strong className="text-foreground">Responsable :</strong> Youssef Ayyad (Solo Founder)</p>
          <p><strong className="text-foreground">Adresse :</strong> Imm 104 Appt 19 RES AL HADIKA DOHA LAAYAYADA, Salé, Maroc</p>
          <p><strong className="text-foreground">Contact Délégué / Référent Données :</strong> <a href="mailto:youssef@facturxfacile.com" className="text-sage-600 dark:text-sage-400 underline underline-offset-2">youssef@facturxfacile.com</a></p>
        </div>
      </section>

      {/* 2. Principe de minimisation & Nature des traitements */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          2. Traitement des fichiers de factures &amp; Minimisation
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nous distinguons deux niveaux d&apos;utilisation selon la fonctionnalité utilisée :
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 p-4 sm:p-5 bg-card/60 space-y-2">
            <h3 className="font-semibold text-foreground text-base">
              A. Validateur Factur-X public (En ligne gratuit)
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le contrôle technique de conformité s&apos;exécute de manière <strong className="text-foreground">100% éphémère en mémoire vive (RAM)</strong>. Aucun fichier PDF ou XML n&apos;est enregistré sur disque dur ni consigné dans une base de données. Dès que le rapport de validation est renvoyé à votre navigateur, les données en RAM sont immédiatement détruites.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 p-4 sm:p-5 bg-card/60 space-y-2">
            <h3 className="font-semibold text-foreground text-base">
              B. Convertisseur PDF en Factur-X
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lors de la conversion, le fichier PDF original est analysé pour en extraire les mentions obligatoires de facturation.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
              <li><strong className="text-foreground">Pour les conversions ponctuelles d&apos;essai :</strong> Les fichiers temporaires sont purgés automatiquement (durée de rétention maximale : 1 heure).</li>
              <li><strong className="text-foreground">Pour les utilisateurs avec compte :</strong> L&apos;enregistrement dans votre espace « Historique » est <strong className="text-foreground">strictement optionnel</strong>. Si activé, seules les métadonnées de synthèse (Numéro, Date, Nom client, SIREN, Montants HT/TVA/TTC) sont enregistrées dans la base de données. Le PDF résultant est chiffré et stocké de manière privée sur Cloudflare R2 avec accès sécurisé par URLs signées à validité de 60 secondes.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Zéro utilisation pour l'entraînement d'IA */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          3. Engagement de non-utilisation de vos factures par des IA tierces
        </h2>
        <div className="rounded-xl border border-sage-500/30 bg-sage-50/50 dark:bg-sage-950/20 p-4 sm:p-5">
          <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
            Vos factures contiennent des secrets d&apos;affaires et des données personnelles sensibles. Factur-X Facile utilise une chaîne de traitement déterministe en pur TypeScript / WebAssembly.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Aucun document n&apos;est envoyé à des modèles d&apos;intelligence artificielle tiers</strong> (tels qu&apos;OpenAI, Anthropic ou Google Cloud AI) pour l&apos;entraînement de modèles. Vos données commerciales ne sont jamais vendues, cédées, louées ou exploitées à des fins de prospection publicitaire.
          </p>
        </div>
      </section>

      {/* 4. Sous-traitants & Localisation des données */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          4. Sous-traitants certifiés et hébergement en Union Européenne
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Pour délivrer le service avec la plus haute disponibilité, nous nous appuyons sur des prestataires techniques réputés, soumis à des clauses contractuelles strictes de sous-traitance RGPD (Article 28 du RGPD) :
        </p>

        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/60 border-b border-border/70 text-foreground font-semibold">
              <tr>
                <th className="p-3 sm:p-4">Prestataire</th>
                <th className="p-3 sm:p-4">Rôle</th>
                <th className="p-3 sm:p-4">Localisation des serveurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-muted-foreground">
              <tr>
                <td className="p-3 sm:p-4 font-medium text-foreground">Vercel Inc.</td>
                <td className="p-3 sm:p-4">Exécution serverless &amp; CDN</td>
                <td className="p-3 sm:p-4">Union Européenne (Paris, France)</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-foreground">Supabase Inc.</td>
                <td className="p-3 sm:p-4">Base de données PostgreSQL &amp; Auth</td>
                <td className="p-3 sm:p-4">Union Européenne (Francfort, Allemagne)</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-foreground">Cloudflare Inc. (R2)</td>
                <td className="p-3 sm:p-4">Stockage chiffré des factures</td>
                <td className="p-3 sm:p-4">Union Européenne</td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-foreground">Paddle.com Ltd</td>
                <td className="p-3 sm:p-4">Gestion des abonnements &amp; TVA</td>
                <td className="p-3 sm:p-4">Royaume-Uni / UE (PCI-DSS Niveau 1)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Durées de conservation */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          5. Durées de conservation des données
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
          <li><strong className="text-foreground">Compte utilisateur :</strong> Conservé jusqu&apos;à la demande de suppression de votre compte par vos soins.</li>
          <li><strong className="text-foreground">Historique des factures générées :</strong> Conservé tant que votre compte est actif. Vous pouvez purger individuellement ou intégralement vos factures depuis votre tableau de bord à tout moment.</li>
          <li><strong className="text-foreground">Données de facturation et de transaction :</strong> Conservées pendant 10 ans par notre Merchant of Record (Paddle.com) conformément aux obligations comptables et fiscales légales.</li>
          <li><strong className="text-foreground">Logs techniques d&apos;accès :</strong> Conservés pour une durée maximale de 30 jours à des fins exclusives de diagnostic et de sécurité contre les cyberattaques.</li>
        </ul>
      </section>

      {/* 6. Vos droits */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          6. Vos droits sur vos données personnelles
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Conformément au RGPD et à la loi 09-08, vous disposez des droits suivants à l&apos;égard de vos données :
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-sm sm:text-base">
          <li><strong className="text-foreground">Droit d’accès (Art. 15 RGPD) :</strong> Obtenir une copie de vos données personnelles détenues.</li>
          <li><strong className="text-foreground">Droit de rectification (Art. 16 RGPD) :</strong> Corriger des informations inexactes ou incomplètes.</li>
          <li><strong className="text-foreground">Droit à l’effacement (Art. 17 RGPD) :</strong> Demander la suppression définitive de votre compte et de son historique.</li>
          <li><strong className="text-foreground">Droit à la limitation et d’opposition (Art. 18 &amp; 21 RGPD) :</strong> Vous opposer à certains traitements pour motifs légitimes.</li>
          <li><strong className="text-foreground">Droit à la portabilité (Art. 20 RGPD) :</strong> Récupérer vos factures et métadonnées dans un format structuré et lisible par machine (JSON/XML).</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-2">
          Pour exercer l&apos;un de ces droits, contactez directement le fondateur à :{' '}
          <a href="mailto:youssef@facturxfacile.com" className="text-sage-600 dark:text-sage-400 font-semibold underline underline-offset-2">
            youssef@facturxfacile.com
          </a>
          . Une réponse vous sera apportée sous 48 heures ouvrées.
        </p>
      </section>

      {/* 7. Cookies */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          7. Cookies et technologies de suivi
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Factur-X Facile applique une politique exemplaire : <strong className="text-foreground">aucun cookie de ciblage publicitaire ni tracker de revente de données</strong> n&apos;est déposé sur votre terminal.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Seuls des cookies techniques strictement nécessaires au fonctionnement du Service sont utilisés (ex. maintien de votre session d&apos;authentification Supabase et jetons de sécurité CSRF).
        </p>
      </section>
    </LegalLayout>
  );
}
