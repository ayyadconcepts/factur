import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://facturxfacile.com'),
  title: {
    default: 'Factur-X Facile | Convertisseur et Validateur Factur-X Conforme 2026',
    template: '%s | Factur-X Facile',
  },
  description:
    'Convertissez vos factures PDF au format officiel Factur-X (EN 16931 / PDF/A-3) et validez vos fichiers gratuitement. Conforme Chorus Pro et réforme 2026.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://facturxfacile.com',
    siteName: 'Factur-X Facile',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
