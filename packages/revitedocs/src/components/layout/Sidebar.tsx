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
      <div className="space-y-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full justify-between',
            'text-zinc-600 dark:text-zinc-400',
            'hover:text-zinc-900 dark:hover:text-zinc-100',
            'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70',
            'transition-all duration-200'
          )}
        >
          <span className="font-medium">{item.text}</span>
          <ChevronRight 
            className={cn(
              'h-4 w-4 text-zinc-400 dark:text-zinc-500',
              'transition-transform duration-200 ease-out',
              isExpanded && 'rotate-90'
            )} 
          />
        </Button>
        <div 
          className={cn(
            'ml-3 space-y-0.5 overflow-hidden',
            'transition-all duration-300 ease-out',
            // Subtle left border for nesting indication
            'border-l border-zinc-200/60 dark:border-zinc-800/60',
            'pl-2'
          )}
          style={{
            maxHeight: isExpanded ? '1000px' : '0',
            opacity: isExpanded ? 1 : 0,
          }}
        >
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
      </div>
    )
  }

  return (
    <a
      href={item.link}
      onClick={onNavigate}
      className={cn(
        'block rounded-lg px-3 py-2 text-sm',
        'transition-all duration-200 ease-out',
        // Base state
        'text-zinc-600 dark:text-zinc-400',
        // Hover state
        'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70',
        'hover:text-zinc-900 dark:hover:text-zinc-100',
        // Active state - refined indicator
        isActive && [
          'bg-zinc-100 dark:bg-zinc-800/80',
          'text-zinc-900 dark:text-zinc-100',
          'font-medium',
          // Subtle left accent
          'relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
          'before:h-5 before:w-0.5 before:rounded-full',
          'before:bg-zinc-400 dark:before:bg-zinc-500',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
        ],
        // Press effect
        'active:scale-[0.99]'
      )}
    >
      {item.text}
    </a>
  )
}

/**
 * Sidebar navigation component with collapsible sections.
 * Features: Glass morphism, smooth transitions, polished hover states
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
        'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64',
        // Glass morphism background
        'bg-white/80 dark:bg-zinc-950/80',
        'backdrop-blur-xl backdrop-saturate-150',
        // Refined border
        'border-r border-zinc-200/50 dark:border-zinc-800/50',
        // Smooth slide transition
        'transform transition-all duration-300 ease-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
        className
      )}
    >
      <ScrollArea className="h-full scrollbar-fade">
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
          {sections.map((section, sectionIndex) => (
            <div 
              key={section.title}
              className="animate-[fade-in_0.3s_ease-out_forwards] opacity-0"
              style={{ animationDelay: `${sectionIndex * 50}ms` }}
            >
              <h3 
                className={cn(
                  'mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider',
                  'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {section.title}
              </h3>
              <div className="space-y-0.5">
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
