import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion | facturxfacile',
  description: 'Connectez-vous à votre espace facturxfacile.',
  robots: { index: false }
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Colonne gauche : Formulaire de connexion (sans logo, centré) */}
      <div className="flex flex-col justify-between p-6 sm:p-8 md:p-12">
        <div />

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm sm:max-w-md">
            <LoginForm />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          facturxfacile conforme à la réforme 2026 • Norme EN 16931 & CIUS-FR
        </div>
      </div>

      {/* Colonne droite : Bannière avec fond mesh.jpeg et le logo centré */}
      <div
        className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden border-l border-border select-none bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/mesh.jpeg')" }}
      >

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
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
            Accédez à vos factures
          </h2>
          <p className="mt-2.5 text-sm text-foreground font-medium leading-relaxed">
            Retrouvez votre historique de conversion, vos dossiers classés et vos factures électroniques prêtes pour Chorus Pro.
          </p>
        </div>
      </div>
    </div>
  );
}
