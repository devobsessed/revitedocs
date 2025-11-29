import { createElement, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, AlertTriangle } from 'lucide-react'
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
 * Allows users to switch between documentation versions while staying on the same page
 */
export function VersionSwitcher({
  versions,
  currentVersion,
  defaultVersion,
  currentPath,
  className,
}: VersionSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

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

  return createElement('div', {
    className: cn('space-y-2', className),
  },
    // Dropdown container (relative for positioning the menu)
    createElement('div', {
      ref: dropdownRef,
      className: 'relative',
    },
      // Version selector button
      createElement('button', {
        onClick: () => setIsOpen(!isOpen),
        className: cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium',
          'border transition-colors',
          isOldVersion
            ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        ),
        'aria-expanded': isOpen,
        'aria-haspopup': 'listbox',
      },
        isOldVersion && createElement(AlertTriangle, { className: 'h-3.5 w-3.5' }),
        createElement('span', null, displayVersion),
        createElement(ChevronDown, {
          className: cn('h-4 w-4 transition-transform', isOpen && 'rotate-180'),
        })
      ),

      // Dropdown menu (absolutely positioned within relative container)
      isOpen && createElement('div', {
        className: cn(
          'absolute top-full left-0 z-50 mt-1 min-w-[120px] rounded-md border shadow-lg',
          'bg-white dark:bg-gray-800 dark:border-gray-700'
        ),
        role: 'listbox',
      },
        createElement('div', { className: 'py-1' },
          versions.map((version, index) => {
            const isSelected = version === displayVersion
            const isVersionLatest = index === 0

            return createElement('a', {
              key: version,
              href: getVersionUrl(version),
              role: 'option',
              'aria-selected': isSelected,
              className: cn(
                'flex items-center justify-between px-3 py-2 text-sm',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                isSelected
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              ),
              onClick: () => setIsOpen(false),
            },
              createElement('span', { className: 'flex items-center gap-2' },
                version,
                isVersionLatest && createElement('span', {
                  className: 'text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                }, 'latest')
              ),
              isSelected && createElement(Check, { className: 'h-4 w-4' })
            )
          })
        )
      )
    ),

    // Old version warning banner (normal flow, not absolute)
    isOldVersion && !isOpen && createElement('div', {
      className: cn(
        'p-2 rounded-md text-xs',
        'bg-amber-50 border border-amber-200 text-amber-800',
        'dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300'
      ),
    },
      'You\'re viewing docs for ',
      createElement('strong', null, currentVersion),
      '. ',
      createElement('a', {
        href: getVersionUrl(versions[0]),
        className: 'underline hover:no-underline',
      }, 'View latest →')
    )
  )
}

