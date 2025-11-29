import type { ReactNode } from 'react'
import { Info, AlertTriangle, Lightbulb, Flame } from 'lucide-react'
import { cn } from '../utils.js'

export type CalloutVariant = 'info' | 'warning' | 'tip' | 'danger' | 'note'

export interface CalloutProps {
  /** Callout style variant */
  variant?: CalloutVariant
  /** Optional custom title (defaults to variant name) */
  title?: string
  /** Callout content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

const variantConfig: Record<
  CalloutVariant,
  {
    icon: typeof Info
    containerClass: string
    iconClass: string
    titleClass: string
    defaultTitle: string
  }
> = {
  info: {
    icon: Info,
    containerClass: 'border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10',
    iconClass: 'text-blue-500',
    titleClass: 'text-blue-600 dark:text-blue-400',
    defaultTitle: 'Note',
  },
  note: {
    icon: Info,
    containerClass: 'border-zinc-500/30 bg-zinc-500/5 dark:bg-zinc-500/10',
    iconClass: 'text-zinc-500',
    titleClass: 'text-zinc-600 dark:text-zinc-400',
    defaultTitle: 'Note',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/10',
    iconClass: 'text-yellow-500',
    titleClass: 'text-yellow-600 dark:text-yellow-400',
    defaultTitle: 'Warning',
  },
  tip: {
    icon: Lightbulb,
    containerClass: 'border-green-500/30 bg-green-500/5 dark:bg-green-500/10',
    iconClass: 'text-green-500',
    titleClass: 'text-green-600 dark:text-green-400',
    defaultTitle: 'Tip',
  },
  danger: {
    icon: Flame,
    containerClass: 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10',
    iconClass: 'text-red-500',
    titleClass: 'text-red-600 dark:text-red-400',
    defaultTitle: 'Danger',
  },
}

/**
 * Callout component for highlighting important information.
 * Supports info, warning, tip, danger, and note variants.
 */
export function Callout({
  variant = 'info',
  title,
  children,
  className,
}: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      className={cn(
        'not-prose my-6 rounded-lg border-l-4 p-4',
        config.containerClass,
        className
      )}
      role="alert"
      aria-label={displayTitle}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconClass)}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold mb-1', config.titleClass)}>
            {displayTitle}
          </p>
          <div className="text-sm text-muted-foreground leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

