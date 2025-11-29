import type { ReactNode } from 'react'
import { Info, AlertTriangle, Lightbulb, Flame, AlertCircle } from 'lucide-react'
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
    iconContainerClass: string
    iconClass: string
    titleClass: string
    defaultTitle: string
  }
> = {
  info: {
    icon: Info,
    containerClass: [
      'border-zinc-200/60 dark:border-zinc-800/60',
      'bg-zinc-50/50 dark:bg-zinc-900/50',
      // Subtle left accent
      'relative before:absolute before:left-0 before:top-0 before:bottom-0',
      'before:w-[3px] before:rounded-l-lg',
      'before:bg-zinc-400 dark:before:bg-zinc-500',
    ].join(' '),
    iconContainerClass: 'bg-zinc-100 dark:bg-zinc-800',
    iconClass: 'text-zinc-500 dark:text-zinc-400',
    titleClass: 'text-zinc-700 dark:text-zinc-300',
    defaultTitle: 'Info',
  },
  note: {
    icon: AlertCircle,
    containerClass: [
      'border-zinc-200/60 dark:border-zinc-800/60',
      'bg-zinc-50/30 dark:bg-zinc-900/30',
      'relative before:absolute before:left-0 before:top-0 before:bottom-0',
      'before:w-[3px] before:rounded-l-lg',
      'before:bg-zinc-300 dark:before:bg-zinc-600',
    ].join(' '),
    iconContainerClass: 'bg-zinc-100/80 dark:bg-zinc-800/80',
    iconClass: 'text-zinc-400 dark:text-zinc-500',
    titleClass: 'text-zinc-600 dark:text-zinc-400',
    defaultTitle: 'Note',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: [
      'border-amber-200/60 dark:border-amber-900/40',
      'bg-amber-50/50 dark:bg-amber-950/30',
      'relative before:absolute before:left-0 before:top-0 before:bottom-0',
      'before:w-[3px] before:rounded-l-lg',
      'before:bg-amber-400 dark:before:bg-amber-500',
    ].join(' '),
    iconContainerClass: 'bg-amber-100/80 dark:bg-amber-900/40',
    iconClass: 'text-amber-600 dark:text-amber-400',
    titleClass: 'text-amber-700 dark:text-amber-400',
    defaultTitle: 'Warning',
  },
  tip: {
    icon: Lightbulb,
    containerClass: [
      'border-emerald-200/60 dark:border-emerald-900/40',
      'bg-emerald-50/50 dark:bg-emerald-950/30',
      'relative before:absolute before:left-0 before:top-0 before:bottom-0',
      'before:w-[3px] before:rounded-l-lg',
      'before:bg-emerald-400 dark:before:bg-emerald-500',
    ].join(' '),
    iconContainerClass: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    titleClass: 'text-emerald-700 dark:text-emerald-400',
    defaultTitle: 'Tip',
  },
  danger: {
    icon: Flame,
    containerClass: [
      'border-red-200/60 dark:border-red-900/40',
      'bg-red-50/50 dark:bg-red-950/30',
      'relative before:absolute before:left-0 before:top-0 before:bottom-0',
      'before:w-[3px] before:rounded-l-lg',
      'before:bg-red-400 dark:before:bg-red-500',
    ].join(' '),
    iconContainerClass: 'bg-red-100/80 dark:bg-red-900/40',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-700 dark:text-red-400',
    defaultTitle: 'Danger',
  },
}

/**
 * Callout component for highlighting important information.
 * Features: Polished design with subtle left accent, refined icon treatment
 */
export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      className={cn(
        'not-prose my-6 rounded-xl border p-4 pl-5',
        'transition-all duration-200',
        'hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]',
        'dark:hover:shadow-[0_2px_8px_-4px_rgba(255,255,255,0.03)]',
        config.containerClass,
        className
      )}
      role="alert"
      aria-label={displayTitle}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mt-0.5',
            'transition-transform duration-200',
            config.iconContainerClass
          )}
        >
          <Icon className={cn('h-4 w-4', config.iconClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm mb-1', config.titleClass)}>{displayTitle}</p>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
