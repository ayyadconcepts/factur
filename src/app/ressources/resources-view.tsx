'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Rss } from 'lucide-react'
import {
  RESOURCE_CATEGORIES,
  type ResourceArticle,
} from '@/data/resources'
import { ResourceIllustration } from '@/components/illustrations/ResourceIllustrations'
import { cn } from '@/lib/utils'

interface ResourcesViewProps {
  initialArticles: ResourceArticle[]
}

export function ResourcesView({ initialArticles }: ResourcesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'Tous' || article.category === selectedCategory
      const matchesSearch =
        searchQuery.trim() === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [initialArticles, selectedCategory, searchQuery])

  const topArticles = useMemo(() => {
    if (selectedCategory === 'Tous' && !searchQuery.trim()) {
      return filteredArticles.slice(0, 2)
    }
    return []
  }, [filteredArticles, selectedCategory, searchQuery])

  const moreArticles = useMemo(() => {
    if (selectedCategory === 'Tous' && !searchQuery.trim()) {
      return filteredArticles.slice(2)
    }
    return filteredArticles
  }, [filteredArticles, selectedCategory, searchQuery])

  return (
    <div className="space-y-12 pb-20 md:pb-28">
      {/* Category filter pills and search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {RESOURCE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'cursor-pointer text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-150',
                  isActive
                    ? 'bg-foreground text-background shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 w-full sm:w-64">
            <Search className="size-3.5 text-muted-foreground mr-2 shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center gap-0.5 ml-1.5">
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/70 rounded px-1 py-0.5 select-none">
                ⌘
              </span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/70 rounded px-1 py-0.5 select-none">
                K
              </span>
            </div>
          </div>

          <button
            type="button"
            title="Flux RSS"
            aria-label="Flux RSS"
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Rss className="size-4" />
          </button>
        </div>
      </div>

      {/* TOP 2 FEATURED ARTICLES */}
      {topArticles.length > 0 && (
        <section aria-label="Articles à la une">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {topArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/ressources/${article.slug}`}
                className="group block"
              >
                <div className="rounded-2xl border border-border/60 bg-card aspect-[16/10] overflow-hidden flex items-center justify-center relative shadow-sm group-hover:shadow-md group-hover:border-border transition-all duration-200">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-6 w-full h-full flex items-center justify-center">
                      <ResourceIllustration type={article.illustration} />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-5 mb-2">
                  {article.publishedAt}
                </p>

                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* MORE ARTICLES */}
      <section aria-label="Tous les articles" className={topArticles.length > 0 ? 'pt-12 md:pt-16' : ''}>
        {topArticles.length > 0 && (
          <h2 className="text-balance text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8 md:mb-10">
            Plus d&apos;articles
          </h2>
        )}

        {moreArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {moreArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/ressources/${article.slug}`}
                className="group block"
              >
                <div className="rounded-2xl border border-border/60 bg-card aspect-[16/10] overflow-hidden flex items-center justify-center relative shadow-sm group-hover:shadow-md group-hover:border-border transition-all duration-200">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-6 w-full h-full flex items-center justify-center">
                      <ResourceIllustration type={article.illustration} />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-5 mb-2">
                  {article.publishedAt}
                </p>

                <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-base font-semibold text-foreground">
              Aucun article trouvé.
            </p>
            <p className="text-sm text-muted-foreground">
              Essayez de réinitialiser votre recherche ou de sélectionner une autre catégorie.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Tous')
                setSearchQuery('')
              }}
              className="cursor-pointer text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
