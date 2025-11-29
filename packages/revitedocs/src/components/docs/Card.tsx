import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  Card as ShadcnCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card.js'
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
 * Card component for navigation links or content highlights.
 * Features: Hover lift, icon glow, smooth arrow animation, refined shadows
 */
export function Card({ title, description, href, icon, className, children }: CardProps) {
  const cardContent = (
    <ShadcnCard
      className={cn(
        'group relative overflow-hidden',
        href && 'cursor-pointer',
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      {href && (
        <div 
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100',
            'bg-gradient-to-br from-primary/[0.02] to-transparent',
            'transition-opacity duration-500'
          )}
          aria-hidden="true"
        />
      )}

      <CardHeader className="pb-2 relative">
        {/* Icon with glow effect */}
        {icon && (
          <div 
            className={cn(
              'mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
              'bg-zinc-100 dark:bg-zinc-800/80',
              'text-zinc-700 dark:text-zinc-300',
              'transition-all duration-300',
              // Hover: enhance icon
              'group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-700/80',
              'group-hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]',
              'dark:group-hover:shadow-[0_4px_12px_-4px_rgba(255,255,255,0.05)]',
              'group-hover:scale-105'
            )}
          >
            {icon}
          </div>
        )}
        <CardTitle 
          className={cn(
            'text-base font-semibold',
            'text-zinc-900 dark:text-zinc-100',
            'group-hover:text-zinc-800 dark:group-hover:text-white',
            'transition-colors duration-200'
          )}
        >
          {title}
        </CardTitle>
      </CardHeader>

      {/* Description or children */}
      {(description || children) && (
        <CardContent className="pt-0 relative">
          <CardDescription className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {children || description}
          </CardDescription>
        </CardContent>
      )}

      {/* Arrow indicator for links - refined animation */}
      {href && (
        <ArrowRight
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4',
            'text-zinc-400 dark:text-zinc-500',
            'transition-all duration-300 ease-out',
            'opacity-0 -translate-x-2',
            'group-hover:opacity-100 group-hover:translate-x-0',
            'group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
          )}
          aria-hidden="true"
        />
      )}
    </ShadcnCard>
  )

  if (href) {
    return (
      <a 
        href={href} 
        className={cn(
          'block no-underline',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'focus-visible:ring-offset-2 rounded-xl'
        )}
      >
        {cardContent}
      </a>
    )
  }

  return cardContent
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
    <div className={cn('not-prose my-6 grid gap-4', gridCols[cols], className)}>{children}</div>
  )
}
