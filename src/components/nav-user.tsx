"use client"

import React, { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { createClient } from "@/client/supabaseBrowser"
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  Settings2Icon,
  LogOutIcon,
} from "lucide-react"

export function NavUser({
  user,
}: {
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<{
    fullName: string
    firstWord: string
    email: string
    initial: string
  }>(() => {
    const rawName = user?.name || "Utilisateur"
    const cleanName = rawName.trim()
    const firstWordRaw = cleanName.split(/\s+/)[0] || "Utilisateur"
    const firstWord = firstWordRaw.charAt(0).toUpperCase() + firstWordRaw.slice(1)
    const email = user?.email || ""
    const initial = firstWord.charAt(0).toUpperCase()
    return {
      fullName: cleanName,
      firstWord,
      email,
      initial,
    }
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        const rawName =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          user?.name ||
          "Utilisateur"
        const cleanName = rawName.trim()
        const firstWordRaw = cleanName.split(/\s+/)[0] || "Utilisateur"
        const firstWord = firstWordRaw.charAt(0).toUpperCase() + firstWordRaw.slice(1)
        const email = authUser.email || user?.email || ""
        const initial = firstWord.charAt(0).toUpperCase()

        setCurrentUser({
          fullName: cleanName,
          firstWord,
          email,
          initial,
        })
      }
    })
  }, [user])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (e) {
      console.error("Erreur lors de la déconnexion", e)
      window.location.href = "/login"
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted hover:bg-cream-light/60 dark:hover:bg-zinc-900/60 transition-colors"
              />
            }
          >
            {/* Avatar circulaire gris foncé tendant vers noir avec une seule lettre du premier mot */}
            <div className="size-8 rounded-full bg-[#18181b] text-white dark:bg-zinc-800 dark:text-zinc-100 flex items-center justify-center font-semibold text-xs shrink-0 select-none border border-zinc-700/60 shadow-xs">
              {currentUser.initial}
            </div>

            {/* Texte : Premier mot du prénom/nom + email en dessous */}
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold text-xs sm:text-sm text-foreground">
                {currentUser.firstWord}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {currentUser.email}
              </span>
            </div>

            <EllipsisVerticalIcon className="ml-auto size-4 text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-60 rounded-xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] bg-cream-light dark:bg-zinc-900 border-border/80"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                  <div className="size-8 rounded-full bg-[#18181b] text-white dark:bg-zinc-800 dark:text-zinc-100 flex items-center justify-center font-semibold text-xs shrink-0 select-none border border-zinc-700/60 shadow-xs">
                    {currentUser.initial}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold text-xs sm:text-sm text-foreground">
                      {currentUser.fullName}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 text-xs font-medium py-2 px-2.5 rounded-lg"
                onClick={() => router.push("/dashboard/settings?tab=profile")}
              >
                <CircleUserRoundIcon className="size-4 text-muted-foreground" />
                <span>Profil & Sécurité</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2.5 text-xs font-medium py-2 px-2.5 rounded-lg"
                onClick={() => router.push("/dashboard/subscription")}
              >
                <CreditCardIcon className="size-4 text-muted-foreground" />
                <span>Abonnement & Quotas</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer gap-2.5 text-xs font-medium py-2 px-2.5 rounded-lg"
                onClick={() => router.push("/dashboard/settings?tab=facturx")}
              >
                <Settings2Icon className="size-4 text-muted-foreground" />
                <span>Préférences Factur-X</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer gap-2.5 text-xs font-medium py-2 px-2.5 rounded-lg text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
            >
              <LogOutIcon className="size-4 text-rose-600 dark:text-rose-400" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
