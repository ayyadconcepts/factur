import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HeroHeader } from '@/components/header'
import Footer from '@/components/footer'
import {
  getAllResources,
  getResourceBySlug,
  getRelatedResources,
} from '@/data/resources'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ResourceIllustration } from '@/components/illustrations/ResourceIllustrations'
import { FormattedText } from '@/components/blog/FormattedText'
import { ArticleCta } from '@/components/blog/ArticleCta'
import { outfit } from '@/lib/fonts'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const articles = getAllResources()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getResourceBySlug(slug)

  if (!article) {
    return {
      title: 'Article introuvable | facturxfacile',
    }
  }

  return {
    title: `${article.title} | facturxfacile`,
    description: article.excerpt,
    alternates: {
      canonical: `/ressources/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://facturxfacile.com/ressources/${slug}`,
      type: 'article',
      publishedTime: article.publishedAt,
      images: article.featuredImage ? [{ url: article.featuredImage, alt: article.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  }
}

export default async function SingleResourcePage({ params }: PageProps) {
  const { slug } = await params
  const article = getResourceBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = getRelatedResources(article.slug, 3)

  return (
    <div className="min-h-screen bg-cream-light text-foreground flex flex-col justify-between">
      <HeroHeader />

      <main className="flex-1 pt-20 md:pt-32 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* 2-Column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12 lg:gap-16 items-start">
            {/* Left sticky column: Breadcrumb + TOC */}
            <aside className="sticky top-28 space-y-8 hidden lg:block">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link
                  href="/ressources"
                  className="hover:text-foreground transition-colors"
                >
                  Ressources
                </Link>
                <span>&rsaquo;</span>
                <span className="text-foreground font-medium truncate max-w-[120px]">
                  {article.category}
                </span>
              </div>

              <TableOfContents sections={article.sections} />
            </aside>

            {/* Main content column */}
            <article className="max-w-3xl">
              {/* Mobile breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 lg:hidden">
                <Link
                  href="/ressources"
                  className="hover:text-foreground transition-colors"
                >
                  Ressources
                </Link>
                <span>&rsaquo;</span>
                <span className="text-foreground font-medium">
                  {article.category}
                </span>
              </div>

              {/* Category eyebrow */}
              <span className="text-sage-600 dark:text-sage-400 font-bold tracking-wider uppercase text-xs block mb-3">
                {article.category}
              </span>

              {/* H1 Title */}
              <h1 className="text-balance text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug mb-4">
                {article.title}
              </h1>

              {/* Lead subtitle */}
              <p className="text-muted-foreground mb-10 md:mb-12 text-base sm:text-lg leading-relaxed max-w-2xl">
                <FormattedText text={article.lead} />
              </p>

              {/* Featured Cover Box */}
              {article.featuredImage ? (
                <div className="rounded-2xl border border-border/60 overflow-hidden shadow-sm mb-12 md:mb-16 relative aspect-[16/9] w-full bg-card">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-card aspect-[2/1] sm:aspect-[2.2/1] overflow-hidden flex items-center justify-between p-8 sm:p-14 shadow-sm mb-12 md:mb-16 relative select-none">
                  <div className="flex items-center gap-3 relative z-10">
                    <img
                      src="/assets/logo-factur-x-facile.png?v=3"
                      alt="Logo"
                      className="h-9 sm:h-12 w-auto object-contain"
                    />
                    <span
                      className={`${outfit.className} text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground`}
                    >
                      facturxfacile
                    </span>
                  </div>

                  <div className="relative w-44 sm:w-60 h-32 sm:h-40 pointer-events-none">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-8 sm:h-10 bg-gradient-to-r from-sage-300 to-sage-500 rounded-sm -rotate-12 shadow-md opacity-90" />
                    <div className="absolute right-2 top-1/2 translate-y-1 w-36 sm:w-48 h-8 sm:h-10 bg-gradient-to-r from-sage-500 to-sage-700 rounded-sm -rotate-12 shadow-md opacity-95" />
                  </div>
                </div>
              )}

              {/* Bloc 1 CTA : Après l'introduction (Section 12.2) */}
              <ArticleCta slug={article.slug} variant="top" />

              {/* Editorial Prose Sections */}
              <div className="space-y-8 md:space-y-10">
                {article.sections.map((section) => (
                  <div key={section.id}>
                    <h2
                      id={section.id}
                      className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-10 md:mt-14 mb-4 scroll-mt-28"
                    >
                      {section.title}
                    </h2>

                    {section.paragraphs.map((p, pIdx) => {
                      if (p.startsWith('```')) {
                        const firstLineEnd = p.indexOf('\n')
                        const lang = firstLineEnd !== -1 ? p.slice(3, firstLineEnd).trim() : ''
                        const rawCode = firstLineEnd !== -1 
                          ? p.slice(firstLineEnd + 1).replace(/```$/, '').trim()
                          : p.slice(3).replace(/```$/, '').trim()

                        return (
                          <div
                            key={pIdx}
                            className="my-7 rounded-2xl border border-border/80 bg-zinc-950 text-zinc-100 dark:bg-zinc-900/90 shadow-sm overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                              <span className="uppercase tracking-wider font-semibold text-sage-400">
                                {lang === 'xml' ? 'Extrait XML (CII / Factur-X)' : lang ? lang.toUpperCase() : 'Extrait de code'}
                              </span>
                              <span className="text-[10px] text-zinc-500">EN 16931 • Profil officiel</span>
                            </div>
                            <pre className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-zinc-200 selection:bg-sage-600/30">
                              <code>{rawCode}</code>
                            </pre>
                          </div>
                        )
                      }

                      return (
                        <p
                          key={pIdx}
                          className="text-base sm:text-lg leading-relaxed text-foreground/85 mb-5 sm:mb-6"
                        >
                          <FormattedText text={p} />
                        </p>
                      )
                    })}

                    {/* Single Table */}
                    {section.table && (
                      <div className="my-8 overflow-x-auto rounded-xl border border-border/60 bg-card shadow-xs">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <tr>
                              {section.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-3">
                                  <FormattedText text={h} />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 text-foreground/85">
                            {section.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-muted/15 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3 align-top leading-relaxed">
                                    <FormattedText text={cell} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Multiple Tables */}
                    {section.tables && section.tables.map((tbl, tblIdx) => (
                      <div key={tblIdx} className="my-8 overflow-x-auto rounded-xl border border-border/60 bg-card shadow-xs">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <tr>
                              {tbl.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-3">
                                  <FormattedText text={h} />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 text-foreground/85">
                            {tbl.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-muted/15 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3 align-top leading-relaxed">
                                    <FormattedText text={cell} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="my-6 space-y-3 pl-6 list-disc text-foreground/85 text-base sm:text-lg leading-relaxed">
                        {section.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>
                            <FormattedText text={bullet} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Bloc 3 CTA : Fin d'article (Section 12.2) */}
              <ArticleCta slug={article.slug} variant="bottom" />

              {/* Article footer navigation */}
              <div className="mt-14 md:mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link
                  href="/ressources"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span aria-hidden="true">&lsaquo;</span> Retour aux ressources
                </Link>
                <span className="text-xs text-muted-foreground">
                  Publié le {article.publishedAt}
                </span>
              </div>
            </article>
          </div>

          {/* Related Articles ("À lire aussi" selon la section 13.6) */}
          {relatedArticles.length > 0 && (
            <div className="mt-20 md:mt-28 pt-12 md:pt-16 border-t border-border/60">
              <h2 className="text-balance text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8 md:mb-10">
                À lire aussi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/ressources/${rel.slug}`}
                    className="group block"
                  >
                    <div className="rounded-2xl border border-border/60 bg-card aspect-[16/10] overflow-hidden flex items-center justify-center relative shadow-sm group-hover:shadow-md group-hover:border-border transition-all duration-200">
                      {rel.featuredImage ? (
                        <img
                          src={rel.featuredImage}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="p-6 w-full h-full flex items-center justify-center">
                          <ResourceIllustration type={rel.illustration} />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-5 mb-2">
                      {rel.publishedAt}
                    </p>

                    <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
