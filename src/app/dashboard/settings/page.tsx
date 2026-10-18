"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/client/supabaseBrowser";
import { toast } from "sonner";
import {
  User,
  Settings2,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  Save,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VALID_SETTINGS_TABS = ["profile", "facturx"];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const tabFromQuery = rawTab && VALID_SETTINGS_TABS.includes(rawTab) ? rawTab : "profile";
  const [activeTab, setActiveTab] = useState(tabFromQuery);

  // Sync tab with URL query parameter
  useEffect(() => {
    if (rawTab && VALID_SETTINGS_TABS.includes(rawTab) && rawTab !== activeTab) {
      setActiveTab(rawTab);
    }
  }, [rawTab, activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/dashboard/settings?tab=${val}`);
  };

  // ----------------------------------------------------
  // 1. Profil & Sécurité
  // ----------------------------------------------------
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        setFullName(
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
        );
      }
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, name: fullName },
      });
      if (error) throw error;
      toast.success("Profil mis à jour avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Mot de passe modifié avec succès !");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement de mot de passe");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ----------------------------------------------------
  // 2. Préférences Factur-X
  // ----------------------------------------------------
  const [defaultProfile, setDefaultProfile] = useState("EN 16931");
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("30");
  const [defaultVatExemption, setDefaultVatExemption] = useState("none");
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("facturx_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.defaultProfile) setDefaultProfile(parsed.defaultProfile);
        if (parsed.defaultCurrency) setDefaultCurrency(parsed.defaultCurrency);
        if (parsed.defaultPaymentTerms) setDefaultPaymentTerms(parsed.defaultPaymentTerms);
        if (parsed.defaultVatExemption) setDefaultVatExemption(parsed.defaultVatExemption);
      } catch (e) {
        console.error("Erreur de chargement des préférences", e);
      }
    }
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    try {
      localStorage.setItem(
        "facturx_preferences",
        JSON.stringify({
          defaultProfile,
          defaultCurrency,
          defaultPaymentTerms,
          defaultVatExemption,
        })
      );
      toast.success("Préférences Factur-X enregistrées !");
    } catch (err: any) {
      toast.error("Impossible de sauvegarder les préférences.");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Paramètres
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gérez votre profil utilisateur, la sécurité de votre compte et vos préférences Factur-X.
            </p>
          </div>
        </div>

      {/* Navigation par Onglets */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-6">
        <TabsList className="bg-cream-dark/60 p-1 rounded-xl flex flex-wrap sm:inline-flex h-auto gap-1">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg data-[state=active]:bg-cream-light data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            <User className="size-3.5" />
            Profil & Sécurité
          </TabsTrigger>
          <TabsTrigger
            value="facturx"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg data-[state=active]:bg-cream-light data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            <Settings2 className="size-3.5" />
            Préférences Factur-X
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* ONGLET 1 : Profil & Sécurité */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="profile" className="flex flex-col gap-6 mt-0">
          {/* Carte 1 : Informations personnelles */}
          <div className="rounded-xl bg-cream-light p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Informations du compte
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mettez à jour vos informations personnelles visibles sur votre espace de travail.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                    Nom complet
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex. Jean Dupont"
                    className="h-9 text-xs bg-card border-border"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="h-9 text-xs bg-muted/50 border-border text-muted-foreground pl-8 cursor-not-allowed"
                    />
                    <Mail className="size-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    L&apos;adresse email principale est liée à votre authentification.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingProfile}
                  className="bg-[#02b282] hover:bg-[#01946c] text-white text-xs h-8 px-4 rounded-lg flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>

          {/* Carte 2 : Sécurité & Mot de passe */}
          <div className="rounded-xl bg-cream-light p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Sécurité et mot de passe
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modifiez votre mot de passe pour garantir la sécurité de vos données financières.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-medium text-foreground">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      className="h-9 text-xs bg-card border-border pl-8"
                    />
                    <Lock className="size-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="h-9 text-xs bg-card border-border pl-8"
                    />
                    <Lock className="size-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isChangingPassword || !newPassword}
                  className="bg-[#02b282] hover:bg-[#01946c] text-white text-xs h-8 px-4 rounded-lg flex items-center gap-1.5"
                >
                  {isChangingPassword ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" />
                  )}
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* ONGLET 2 : Préférences Factur-X */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="facturx" className="flex flex-col gap-6 mt-0">
          <div className="rounded-xl bg-cream-light p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Profils & Paramètres par défaut
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configurez les valeurs appliquées automatiquement lors de vos conversions unitaires et groupées.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Profil Factur-X */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-foreground">
                    Profil Factur-X par défaut
                  </Label>
                  <select
                    value={defaultProfile}
                    onChange={(e) => setDefaultProfile(e.target.value)}
                    className="h-9 text-xs bg-card border border-border rounded-lg px-2.5 text-foreground"
                  >
                    <option value="EN 16931">EN 16931 (Norme européenne - Réforme 2026)</option>
                    <option value="BASIC">BASIC (PME & échanges inter-entreprises)</option>
                    <option value="BASIC WL">BASIC WL (Sans lignes de détail)</option>
                    <option value="MINIMUM">MINIMUM (Données d&apos;en-tête uniquement)</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground">
                    Le profil <strong>EN 16931</strong> garantit la conformité avec les plateformes agréées et le portail public de facturation.
                  </span>
                </div>

                {/* Devise */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-foreground">
                    Devise monétaire par défaut
                  </Label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="h-9 text-xs bg-card border border-border rounded-lg px-2.5 text-foreground"
                  >
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="USD">USD ($) - Dollar US</option>
                    <option value="GBP">GBP (£) - Livre Sterling</option>
                    <option value="CHF">CHF - Franc Suisse</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground">
                    Devise appliquée par défaut si le document source n&apos;en spécifie pas.
                  </span>
                </div>

                {/* Délai de paiement */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-foreground">
                    Délai d&apos;échéance de paiement
                  </Label>
                  <select
                    value={defaultPaymentTerms}
                    onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                    className="h-9 text-xs bg-card border border-border rounded-lg px-2.5 text-foreground"
                  >
                    <option value="0">Paiement comptant / À réception</option>
                    <option value="30">30 jours net</option>
                    <option value="45">45 jours fin de mois</option>
                    <option value="60">60 jours net</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground">
                    Délai standard de calcul automatique de la date d&apos;échéance.
                  </span>
                </div>

                {/* Mention d'exonération de TVA */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-foreground">
                    Mention légale de TVA par défaut
                  </Label>
                  <select
                    value={defaultVatExemption}
                    onChange={(e) => setDefaultVatExemption(e.target.value)}
                    className="h-9 text-xs bg-card border border-border rounded-lg px-2.5 text-foreground"
                  >
                    <option value="none">Aucune (Assujetti standard à la TVA)</option>
                    <option value="auto">Autoliquidation de la TVA (Sous-traitance BTP / Intra-UE)</option>
                    <option value="franchise">Franchise en base de TVA (Art. 293 B du CGI)</option>
                    <option value="export">Exonération de TVA art. 262 ter I du CGI (Export)</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground">
                    Indispensable pour les profils Factur-X en cas de facturation à taux 0% ou exonérée.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingPreferences}
                  className="bg-[#02b282] hover:bg-[#01946c] text-white text-xs h-8 px-4 rounded-lg flex items-center gap-1.5"
                >
                  {isSavingPreferences ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Enregistrer les préférences
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
