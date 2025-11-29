import type { ReactNode } from 'react'
import { Badge as ShadcnBadge, type BadgeProps as ShadcnBadgeProps } from '../ui/badge.js'
import { cn } from '../utils.js'

// Legacy variant types for backward compatibility
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

// Map legacy variants to shadcn variants
const variantMap: Record<BadgeVariant, ShadcnBadgeProps['variant']> = {
  default: 'secondary',
  primary: 'default',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
}

/**
 * Badge component for status indicators, version tags, labels, etc.
 * Uses shadcn/ui Badge under the hood.
 */
export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <ShadcnBadge
      variant={variantMap[variant]}
      className={cn('rounded-full', className)}
    >
      {children}
    </ShadcnBadge>
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
