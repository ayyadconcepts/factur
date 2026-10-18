import { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Inscription | facturxfacile',
  description: 'Créez votre compte facturxfacile et commencez à convertir vos factures en toute conformité.',
  robots: { index: false }
};

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Colonne gauche : Formulaire d'inscription (sans logo, centré) */}
      <div className="flex flex-col justify-between p-6 sm:p-8 md:p-12">
        <div />

        {/* Contenu central */}
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm sm:max-w-md">
            <SignupForm />
          </div>
        </div>

        {/* Pied de page discret */}
        <div className="text-center text-xs text-muted-foreground">
          facturxfacile conforme à la réforme 2026 • Norme EN 16931 & CIUS-FR
        </div>
      </div>

      {/* Colonne droite : Bannière avec fond mesh.jpeg et le logo officiel au centre */}
      <div
        className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden border-l border-border select-none bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/mesh.jpeg')" }}
      >

        {/* Contenu au centre de la bannière */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* Centre de la bannière : Icône du logo officiel */}
          <div className="relative mb-8 flex items-center justify-center">
            <div className="relative size-28 rounded-3xl bg-background/90 border border-border/80 flex items-center justify-center backdrop-blur-md p-5">
              <img 
                src="/assets/logo-factur-x-facile.png?v=3" 
                alt="Logo Factur-X Facile" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            La facturation électronique simplifiée
          </h2>
          <p className="mt-2.5 text-sm text-foreground font-medium leading-relaxed">
            Convertissez vos factures en format hybride Factur-X conforme PDF/A-3 et XML CII en quelques secondes.
          </p>
        </div>
      </div>
    </div>
  );
}
