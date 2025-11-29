import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area.js'
import { Button } from '../ui/button.js'
import { cn } from '../utils.js'
import { VersionSwitcher } from './VersionSwitcher.js'
import { LanguageSwitcher, type LocaleConfig } from './LanguageSwitcher.js'

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export interface SidebarProps {
  sections: SidebarSection[]
  currentPath?: string
  isOpen?: boolean
  onClose?: () => void
  className?: string
  /** Available documentation versions */
  versions?: string[]
  /** Currently active version */
  currentVersion?: string
  /** Default version */
  defaultVersion?: string
  /** Available locales configuration */
  locales?: Record<string, LocaleConfig>
  /** Currently active locale */
  currentLocale?: string
  /** Default locale */
  defaultLocale?: string
}

interface SidebarItemComponentProps {
  item: SidebarItem
  currentPath?: string
  depth?: number
  onNavigate?: () => void
}

function SidebarItemComponent({
  item,
  currentPath,
  depth = 0,
  onNavigate,
}: SidebarItemComponentProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(!item.collapsed)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.link && currentPath === item.link

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span>{item.text}</span>
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
          />
        </Button>
        {isExpanded && (
          <div className="ml-3 space-y-1">
            {item.items!.map((child, index) => (
              <SidebarItemComponent
                key={child.link || index}
                item={child}
                currentPath={currentPath}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <a
      href={item.link}
      onClick={onNavigate}
      className={cn(
        'block rounded-md px-3 py-2 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground'
      )}
    >
      {item.text}
    </a>
  )
}

/**
 * Sidebar navigation component with collapsible sections.
 * Uses shadcn/ui ScrollArea for smooth scrolling.
 */
export function Sidebar({
  sections,
  currentPath,
  isOpen = true,
  onClose,
  className,
  versions,
  currentVersion,
  defaultVersion,
  locales,
  currentLocale,
  defaultLocale,
}: SidebarProps) {
  const hasVersions = versions && versions.length > 0
  const hasLocales = locales && Object.keys(locales).length > 1

  return (
    <aside
      className={cn(
        'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background',
        'transform transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0', // Always visible on desktop
        className
      )}
    >
      <ScrollArea className="h-full">
        <nav className="p-4 pt-6 space-y-6">
          {/* Switchers container (version and/or language) */}
          {(hasVersions || hasLocales) && (
            <div className="px-3 pb-2 space-y-3">
              {/* Version Switcher (when versions are configured) */}
              {hasVersions && (
                <VersionSwitcher
                  versions={versions!}
                  currentVersion={currentVersion}
                  defaultVersion={defaultVersion}
                  currentPath={currentPath || '/'}
                />
              )}
              {/* Language Switcher (when multiple locales are configured) */}
              {hasLocales && (
                <LanguageSwitcher
                  locales={locales!}
                  currentLocale={currentLocale}
                  defaultLocale={defaultLocale}
                  currentPath={currentPath || '/'}
                />
              )}
            </div>
          )}

          {/* Navigation sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, index) => (
                  <SidebarItemComponent
                    key={item.link || index}
                    item={item}
                    currentPath={currentPath}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
