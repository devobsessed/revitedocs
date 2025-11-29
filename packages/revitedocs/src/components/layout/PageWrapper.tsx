import { createElement, type ReactNode } from 'react'
import { cn } from '../utils.js'
import type { Frontmatter, TocItem } from '../../core/markdown.js'
import { CopyMarkdownButton } from '../docs/CopyMarkdownButton.js'

export interface PageWrapperProps {
  children: ReactNode
  frontmatter?: Frontmatter
  toc?: TocItem[]
  /** Raw markdown content for copy functionality */
  rawMarkdown?: string
  className?: string
}

/**
 * Wrapper component for markdown page content
 * Provides consistent styling and layout for documentation pages
 */
export function PageWrapper({ children, frontmatter, rawMarkdown, className }: PageWrapperProps) {
  return createElement('article', {
    className: cn('prose prose-zinc dark:prose-invert max-w-none', className),
  },
    // Page header with title and copy button
    (frontmatter?.title || rawMarkdown) && createElement('div', {
      className: 'flex items-start justify-between gap-4 mb-4 not-prose',
    },
      // Title
      frontmatter?.title 
        ? createElement('h1', {
            className: 'text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100',
          }, frontmatter.title)
        : createElement('div'), // Spacer if no title
      
      // Copy Markdown button
      rawMarkdown && createElement(CopyMarkdownButton, {
        markdown: rawMarkdown,
        className: 'flex-shrink-0 mt-1',
      })
    ),

    // Page description from frontmatter
    frontmatter?.description && createElement('p', {
      className: 'text-lg text-zinc-600 dark:text-zinc-400 mb-8',
    }, frontmatter.description),

    // Main content
    children
  )
}

