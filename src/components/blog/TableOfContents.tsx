'use client'

import React, { useEffect, useState } from 'react'
import type { ResourceSection } from '@/data/resources'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  sections: ResourceSection[]
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveId(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Sur cette page
      </p>

      <ul className="space-y-2 text-xs text-muted-foreground">
        {sections.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  'block py-1 transition-colors leading-snug pl-2 border-l-2',
                  isActive
                    ? 'text-foreground font-medium border-sage-500'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                <span className="line-clamp-2">{section.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
