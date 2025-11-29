import { createElement } from 'react'
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
 * Table of contents component with scroll spy highlighting
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

  return createElement('div', { className },
    createElement('p', { className: 'mb-4 text-sm font-semibold' }, 'On this page'),
    createElement('nav', { className: 'relative' },
      createElement('div', { className: 'absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700' }),
      createElement('ul', { className: 'space-y-1' },
        items.map((item) => {
          const isActive = activeId === item.id
          const isNested = item.depth >= 3
          
          return createElement('li', { key: item.id },
            createElement('a', {
              href: `#${item.id}`,
              onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleClick(e, item.id),
              className: cn(
                'relative block py-1 text-sm transition-colors duration-200',
                'hover:text-gray-900 dark:hover:text-gray-100',
                isNested ? 'pl-6' : 'pl-4',
                isActive
                  ? 'font-medium text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400',
              ),
            },
              isActive && createElement('span', {
                className: 'absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-blue-600 dark:bg-blue-400',
                'aria-hidden': 'true',
              }),
              item.text
            )
          )
        })
      )
    )
  )
}

