import { ChevronDown, Check, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js'
import { Button } from '../ui/button.js'
import { Badge } from '../ui/badge.js'
import { cn } from '../utils.js'

export interface VersionSwitcherProps {
  versions: string[]
  currentVersion?: string
  defaultVersion?: string
  currentPath: string
  className?: string
}

/**
 * Remove version prefix from a path
 * e.g., /v2/guide/intro -> /guide/intro
 */
export function stripVersionFromPath(path: string, version: string): string {
  const versionPrefix = `/${version}`
  if (path.startsWith(versionPrefix)) {
    const stripped = path.slice(versionPrefix.length)
    return stripped || '/'
  }
  return path
}

/**
 * Add version prefix to a path
 * e.g., /guide/intro + v1 -> /v1/guide/intro
 */
export function addVersionToPath(path: string, version: string): string {
  if (path === '/') {
    return `/${version}/`
  }
  return `/${version}${path}`
}

/**
 * Version switcher dropdown component
 * Allows users to switch between documentation versions while staying on the same page.
 * Uses shadcn/ui DropdownMenu for polished appearance.
 */
export function VersionSwitcher({
  versions,
  currentVersion,
  defaultVersion,
  currentPath,
  className,
}: VersionSwitcherProps) {
  if (!versions || versions.length === 0) {
    return null
  }

  const displayVersion = currentVersion || defaultVersion || versions[0]
  const isLatest = displayVersion === versions[0]
  const isOldVersion = currentVersion && !isLatest

  /**
   * Get the target URL when switching to a different version
   * Tries to maintain the same page path, with version prefix adjusted
   */
  function getVersionUrl(targetVersion: string): string {
    // Strip current version from path to get the base path
    const basePath = currentVersion
      ? stripVersionFromPath(currentPath, currentVersion)
      : currentPath

    // Add target version prefix
    return addVersionToPath(basePath, targetVersion)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-1.5',
              isOldVersion &&
                'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400'
            )}
          >
            {isOldVersion && <AlertTriangle className="h-3.5 w-3.5" />}
            <span>{displayVersion}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[120px]">
          {versions.map((version, index) => {
            const isSelected = version === displayVersion
            const isVersionLatest = index === 0

            return (
              <DropdownMenuItem key={version} asChild>
                <a
                  href={getVersionUrl(version)}
                  className={cn(
                    'flex items-center justify-between',
                    isSelected && 'text-primary font-medium'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {version}
                    {isVersionLatest && (
                      <Badge variant="success" className="text-[10px] px-1 py-0">
                        latest
                      </Badge>
                    )}
                  </span>
                  {isSelected && <Check className="h-4 w-4" />}
                </a>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Old version warning banner */}
      {isOldVersion && (
        <div
          className={cn(
            'p-2 rounded-md text-xs',
            'bg-yellow-500/10 border border-yellow-500/30 text-yellow-700',
            'dark:text-yellow-400'
          )}
        >
          You're viewing docs for <strong>{currentVersion}</strong>.{' '}
          <a href={getVersionUrl(versions[0])} className="underline hover:no-underline">
            View latest →
          </a>
        </div>
      )}
    </div>
  )
}
