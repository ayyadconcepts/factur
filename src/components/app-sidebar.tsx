"use client"

import * as React from "react"
import Link from 'next/link'
import { outfit } from "@/lib/fonts"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, FileUpIcon, LayersIcon, FolderIcon, ShieldCheckIcon, Settings2Icon, CreditCardIcon, HelpCircleIcon } from "lucide-react"

const data = {
  user: {
    name: "Utilisateur",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Vue d'ensemble",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Convertisseur",
      url: "/dashboard/convert",
      icon: (
        <FileUpIcon />
      ),
    },
    {
      title: "Conversion groupée",
      url: "/dashboard/bulk",
      icon: (
        <LayersIcon />
      ),
    },
    {
      title: "Validateur",
      url: "/dashboard/validator",
      icon: (
        <ShieldCheckIcon />
      ),
    },
    {
      title: "Dossiers",
      url: "/dashboard/projects",
      icon: (
        <FolderIcon />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "/dashboard/settings",
      icon: (
        <Settings2Icon />
      ),
    },
    {
      title: "Abonnement",
      url: "/dashboard/subscription",
      icon: (
        <CreditCardIcon />
      ),
    },
    {
      title: "Aide",
      url: "#",
      icon: (
        <HelpCircleIcon />
      ),
    },
  ],
}

import { SidebarQuotaWidget } from "@/components/dashboard/SidebarQuotaWidget"

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string
    email?: string
  }
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent h-auto"
              render={
                <Link href="/dashboard" className="flex items-center gap-2">
                  <img src="/assets/logo-factur-x-facile.png?v=3" alt="Factur-X Facile Logo" className="h-6 w-auto object-contain" />
                  <span className={`${outfit.className} text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100`}>facturxfacile</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter className="gap-2 p-2">
        <SidebarQuotaWidget />
        <NavUser user={user || data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
