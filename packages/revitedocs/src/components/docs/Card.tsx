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
 * Uses shadcn/ui Card under the hood.
 */
export function Card({ title, description, href, icon, className, children }: CardProps) {
  const cardContent = (
    <ShadcnCard
      className={cn(
        'group relative transition-all',
        href && 'hover:border-primary/50 hover:shadow-md cursor-pointer',
        className
      )}
    >
      <CardHeader className="pb-2">
        {/* Icon */}
        {icon && (
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <CardTitle className="text-base group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>

      {/* Description or children */}
      {(description || children) && (
        <CardContent className="pt-0">
          <CardDescription className="text-sm leading-relaxed">
            {children || description}
          </CardDescription>
        </CardContent>
      )}

      {/* Arrow indicator for links */}
      {href && (
        <ArrowRight
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5',
            'text-muted-foreground group-hover:text-primary group-hover:translate-x-1',
            'transition-all opacity-0 group-hover:opacity-100'
          )}
          aria-hidden="true"
        />
      )}
    </ShadcnCard>
  )

  if (href) {
    return (
      <a href={href} className="block no-underline">
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
