import React from 'react'
import { ScrollArea } from '../ui/scroll-area.js'
import { cn } from '../utils.js'

export interface TocItem {
  id: string
  text: string
  depth: number
}

export interface TableOfContentsProps {
  items: TocItem[]
  activeId?: string
  className?: string
}

/**
 * Table of contents component with scroll spy highlighting.
 * Uses shadcn/ui ScrollArea for smooth scrolling.
 */
export function TableOfContents({ items, activeId, className }: TableOfContentsProps) {
  if (items.length === 0) return null

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="py-4">
        <p className="mb-4 text-sm font-semibold text-foreground">On this page</p>
        <nav className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = activeId === item.id
              const isNested = item.depth >= 3

              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={cn(
                      'relative block py-1 text-sm transition-colors duration-200',
                      'hover:text-foreground',
                      isNested ? 'pl-6' : 'pl-4',
                      isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-primary"
                        aria-hidden="true"
                      />
                    )}
                    {item.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </ScrollArea>
  )
}
