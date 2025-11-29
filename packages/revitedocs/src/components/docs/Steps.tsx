import type { ReactNode } from 'react'
import { cn } from '../utils.js'

export interface StepProps {
  /** Step number (1-indexed) */
  number: number
  /** Step title (optional) */
  title?: string
  /** Step content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Individual step in a Steps container
 */
export function Step({ number, title, children, className }: StepProps) {
  return (
    <div className={cn('relative pl-10 pb-8 last:pb-0', className)}>
      {/* Step number circle */}
      <div
        className={cn(
          'absolute left-0 top-0 flex h-7 w-7 items-center justify-center',
          'rounded-full bg-blue-500 text-sm font-semibold text-white',
          'ring-4 ring-white dark:ring-zinc-900'
        )}
        aria-hidden="true"
      >
        {number}
      </div>

      {/* Connecting line (hidden for last step) */}
      <div
        className={cn(
          'absolute left-[13px] top-7 bottom-0 w-0.5',
          'bg-zinc-200 dark:bg-zinc-700',
          'last:hidden'
        )}
        aria-hidden="true"
      />

      {/* Step content */}
      <div className="pt-0.5">
        {title && (
          <h4 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h4>
        )}
        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export interface StepsProps {
  /** Step components as children */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Steps container for displaying numbered procedures/tutorials
 */
export function Steps({ children, className }: StepsProps) {
  return (
    <div
      className={cn('not-prose my-6 relative', className)}
      role="list"
      aria-label="Steps"
    >
      {children}
    </div>
  )
}

