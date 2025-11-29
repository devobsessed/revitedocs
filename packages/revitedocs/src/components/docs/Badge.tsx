import type { ReactNode } from 'react'
import { cn } from '../utils.js'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export interface BadgeProps {
  /** Badge variant/color */
  variant?: BadgeVariant
  /** Badge content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  secondary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

/**
 * Badge component for status indicators, version tags, labels, etc.
 */
export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * VersionBadge - specialized badge for version numbers
 */
export interface VersionBadgeProps {
  /** Version string (e.g., "v1.0.0", "2.3.4") */
  version: string
  /** Badge variant */
  variant?: BadgeVariant
  /** Additional CSS classes */
  className?: string
}

export function VersionBadge({
  version,
  variant = 'primary',
  className,
}: VersionBadgeProps) {
  // Ensure version starts with 'v' if it doesn't
  const displayVersion = version.startsWith('v') ? version : `v${version}`

  return (
    <Badge variant={variant} className={className}>
      {displayVersion}
    </Badge>
  )
}

/**
 * StatusBadge - specialized badge for status indicators
 */
export interface StatusBadgeProps {
  /** Status type */
  status: 'stable' | 'beta' | 'alpha' | 'deprecated' | 'experimental' | 'new'
  /** Additional CSS classes */
  className?: string
}

const statusConfig: Record<
  StatusBadgeProps['status'],
  { label: string; variant: BadgeVariant }
> = {
  stable: { label: 'Stable', variant: 'success' },
  beta: { label: 'Beta', variant: 'warning' },
  alpha: { label: 'Alpha', variant: 'danger' },
  deprecated: { label: 'Deprecated', variant: 'danger' },
  experimental: { label: 'Experimental', variant: 'secondary' },
  new: { label: 'New', variant: 'info' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

