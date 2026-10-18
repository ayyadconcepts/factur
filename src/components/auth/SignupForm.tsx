"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { safeRedirect } from '@/lib/safeRedirect';
import { getPendingUpload } from '@/lib/pendingUpload';
import { GoogleIcon } from '@/components/ui/svgs/google';
import { Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

  useEffect(() => {
    getPendingUpload().then(data => {
      if (data && data.name) setPendingFileName(data.name);
    });
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);

      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect(nextPath))}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'authentification Google.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }

    setLoading(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect(nextPath))}`,
      }
    });

    if (signUpError) {
      setError(signUpError.message || "Une erreur est survenue lors de l'inscription.");
      setLoading(false);
      return;
    }

    if (data?.session) {
      router.push(safeRedirect(nextPath));
      router.refresh();
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-8 animate-in fade-in">
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Vérifiez votre boîte mail</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Nous vous avons envoyé un lien de confirmation à <strong className="text-foreground">{email}</strong>. Cliquez dessus pour activer votre compte et lancer la conversion de votre facture.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête formulaire */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Créer un compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez facturxfacile pour convertir vos factures en toute conformité.
        </p>
      </div>

      {/* Rappel du fichier en attente si uploadé depuis le Hero */}
      {pendingFileName && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-foreground">{pendingFileName}</p>
            <p className="text-[11px] text-muted-foreground">La conversion débutera dès votre inscription</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bouton Google OAuth */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full h-11 rounded-xl border-border bg-card hover:bg-muted text-foreground font-medium flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4.5" />
        )}
        <span>Continuer avec Google</span>
      </Button>

      {/* Séparateur */}
      <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-3 text-muted-foreground">
          Ou avec email
        </span>
      </div>

      {/* Formulaire d'inscription */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom complet</Label>
          <Input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Jean Dupont"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="h-10 rounded-xl bg-card border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nom@entreprise.fr"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-10 rounded-xl bg-card border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe (10 caractères min)</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            placeholder="••••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-10 rounded-xl bg-card border-border"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-xs transition-colors mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              <span>Création du compte...</span>
            </>
          ) : (
            <span>Créer mon compte</span>
          )}
        </Button>
      </form>

      {/* Lien vers connexion */}
      <div className="text-center text-sm text-muted-foreground pt-2">
        Vous avez déjà un compte ?{" "}
        <Link
          href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
