"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { safeRedirect } from '@/lib/safeRedirect';
import { GoogleIcon } from '@/components/ui/svgs/google';
import { Loader2, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

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
      setError(err?.message || "Une erreur est survenue lors de la connexion Google.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push(safeRedirect(nextPath));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bon retour
        </h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous à votre espace pour gérer vos factures.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Google OAuth button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full h-10 rounded-xl border-border bg-card hover:bg-muted text-foreground font-medium flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4.5" />
        )}
        <span>Continuer avec Google</span>
      </Button>

      {/* Divider */}
      <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-3 text-muted-foreground">
          Ou avec email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
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
              <span>Connexion en cours...</span>
            </>
          ) : (
            <span>Se connecter</span>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-2">
        Pas encore de compte ?{" "}
        <Link
          href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
        >
          S'inscrire
        </Link>
      </div>
    </div>
  );
}
