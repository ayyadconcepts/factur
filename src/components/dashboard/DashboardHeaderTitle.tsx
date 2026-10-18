"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

interface PageMeta {
  title: string;
  subtitle?: string;
}

const PAGE_META_MAP: Record<string, PageMeta> = {
  '/dashboard/validator': {
    title: 'Validateur Factur-X',
    subtitle: 'Vérifiez la conformité réglementaire (PDF/A-3, XSD & Schematron) de vos factures sans IA.',
  },
  '/dashboard/convert': {
    title: 'Convertir une facture',
    subtitle: 'Générez un fichier Factur-X certifié conforme.',
  },
  '/dashboard/bulk': {
    title: 'Conversion groupée',
    subtitle: "Convertissez jusqu'à 200 factures en une seule archive ZIP certifiée.",
  },
  '/dashboard/projects': {
    title: 'Dossiers & Fichiers',
    subtitle: 'Organisation et gestion de votre drive documentaire.',
  },
  '/dashboard': {
    title: "Vue d'ensemble",
    subtitle: 'Suivi en temps réel de vos conversions et de votre conformité Factur-X.',
  },
};

export function DashboardHeaderTitle() {
  const pathname = usePathname();

  const DEFAULT_META: PageMeta = {
    title: "Tableau de bord",
    subtitle: 'Gestion et conformité de vos factures électroniques.',
  };

  let meta: PageMeta = (pathname && PAGE_META_MAP[pathname]) ? PAGE_META_MAP[pathname]! : DEFAULT_META;

  if (!pathname || !PAGE_META_MAP[pathname]) {
    if (pathname?.startsWith('/dashboard/invoices/')) {
      meta = {
        title: 'Détail de la facture',
        subtitle: 'Visualisation et édition du document Factur-X.',
      };
    } else if (pathname?.startsWith('/dashboard/validator')) {
      meta = PAGE_META_MAP['/dashboard/validator'] || DEFAULT_META;
    } else if (pathname?.startsWith('/dashboard/convert')) {
      meta = PAGE_META_MAP['/dashboard/convert'] || DEFAULT_META;
    } else if (pathname?.startsWith('/dashboard/bulk')) {
      meta = PAGE_META_MAP['/dashboard/bulk'] || DEFAULT_META;
    } else if (pathname?.startsWith('/dashboard/projects')) {
      meta = PAGE_META_MAP['/dashboard/projects'] || DEFAULT_META;
    }
  }

  return (
    <div className="flex flex-col justify-center min-w-0">
      <h1 className="text-sm font-semibold tracking-tight text-foreground leading-tight truncate">
        {meta.title}
      </h1>
      {meta.subtitle && (
        <p className="text-xs text-muted-foreground leading-tight truncate hidden sm:inline-block mt-0.5">
          {meta.subtitle}
        </p>
      )}
    </div>
  );
}
