import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '../utils.js'

export interface CardProps {
  /** Card title */
  title: string
  /** Card description */
  description?: string
  /** Link URL (makes card clickable) */
  href?: string
  /** Icon component or element */
  icon?: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Child content (overrides description if provided) */
  children?: ReactNode
}

/**
 * Card component for navigation links or content highlights
 */
export function Card({
  title,
  description,
  href,
  icon,
  className,
  children,
}: CardProps) {
  const content = (
    <>
      {/* Icon */}
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-500 transition-colors">
        {title}
      </h3>

      {/* Description or children */}
      {(description || children) && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {children || description}
        </div>
      )}

      {/* Arrow indicator for links */}
      {href && (
        <ArrowRight
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5',
            'text-zinc-400 group-hover:text-blue-500 group-hover:translate-x-1',
            'transition-all opacity-0 group-hover:opacity-100'
          )}
          aria-hidden="true"
        />
      )}
    </>
  )

  const cardClasses = cn(
    'group relative block p-5 rounded-xl border',
    'border-zinc-200 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800/50',
    href && 'hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer',
    className
  )

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    )
  }

  return <div className={cardClasses}>{content}</div>
}

export interface CardGroupProps {
  /** Number of columns (1-4) */
  cols?: 1 | 2 | 3 | 4
  /** Card components as children */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * CardGroup for laying out multiple cards in a grid
 */
export function CardGroup({ cols = 2, children, className }: CardGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('not-prose my-6 grid gap-4', gridCols[cols], className)}>
      {children}
    </div>
  )
}

