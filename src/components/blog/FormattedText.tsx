import React from 'react'
import Link from 'next/link'

interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null

  // Clean escaped characters from markdown exports
  const cleaned = text
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\+/g, '+')
    .replace(/\\-/g, '-')
    .replace(/\\\./g, '.')

  // Regex to split on **bold**, *italic*, [link](url), or `code`
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g
  const parts = cleaned.split(tokenRegex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null

        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        }

        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={index} className="italic text-foreground/90">
              {part.slice(1, -1)}
            </em>
          )
        }

        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={index}
              className="rounded bg-muted/80 border border-border/60 px-1.5 py-0.5 font-mono text-xs text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          )
        }

        if (part.startsWith('[') && part.includes('](')) {
          const closingBracket = part.indexOf(']')
          const linkText = part.slice(1, closingBracket)
          const linkUrl = part.slice(closingBracket + 2, -1)
          const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#')

          if (isInternal) {
            return (
              <Link
                key={index}
                href={linkUrl}
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
              >
                {linkText}
              </Link>
            )
          }

          return (
            <a
              key={index}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
            >
              {linkText}
            </a>
          )
        }

        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </span>
  )
}
