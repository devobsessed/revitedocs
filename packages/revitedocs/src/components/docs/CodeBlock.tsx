import { useState, useCallback, type ReactNode } from 'react'
import { Check, Copy, FileCode } from 'lucide-react'
import { cn } from '../utils.js'

export interface CodeBlockProps {
  /** Code content as string or React children */
  children: string | ReactNode
  /** Programming language for display */
  language?: string
  /** Optional filename header */
  filename?: string
  /** Show line numbers */
  showLineNumbers?: boolean
  /** Highlighted line numbers (e.g., [1, 3, 5] or "1,3,5-7") */
  highlightLines?: number[] | string
  /** Additional CSS classes */
  className?: string
}

/**
 * Parse highlight lines from string format (e.g., "1,3,5-7") to array
 */
function parseHighlightLines(input: number[] | string | undefined): Set<number> {
  if (!input) return new Set()
  if (Array.isArray(input)) return new Set(input)

  const lines = new Set<number>()
  const parts = input.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          lines.add(i)
        }
      }
    } else {
      const num = Number(trimmed)
      if (!isNaN(num)) {
        lines.add(num)
      }
    }
  }

  return lines
}

/**
 * Extract text content from children (handles both string and React nodes)
 */
function getCodeContent(children: string | ReactNode): string {
  if (typeof children === 'string') return children
  // Handle React elements (e.g., from MDX or Shiki output)
  if (children && typeof children === 'object' && 'props' in children) {
    const props = children.props as { children?: string | ReactNode }
    if (typeof props.children === 'string') return props.children
  }
  return ''
}

/**
 * CodeBlock component for displaying code with syntax highlighting,
 * line numbers, line highlighting, copy button, and filename header.
 */
export function CodeBlock({
  children,
  language = 'text',
  filename,
  showLineNumbers = false,
  highlightLines,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const codeContent = getCodeContent(children)
  const highlightedLineSet = parseHighlightLines(highlightLines)

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeContent.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [codeContent])

  const lines = codeContent.trim().split('\n')
  const hasHighlighting = highlightedLineSet.size > 0

  return (
    <div
      className={cn(
        'not-prose group relative my-6',
        // Subtle shadow
        'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.15)]',
        'dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.4)]',
        // Transition for hover
        'transition-shadow duration-300',
        'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
        'dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]',
        'rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Header with filename or language */}
      {(filename || language) && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2.5',
            'bg-zinc-900 dark:bg-zinc-800',
            'border-b border-zinc-800/50 dark:border-zinc-700/50'
          )}
        >
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {filename ? (
              <>
                <FileCode className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                <span className="font-mono text-zinc-300">{filename}</span>
              </>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                {language}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        <pre
          className={cn(
            'overflow-x-auto p-4 text-sm',
            'bg-zinc-950 dark:bg-[#0a0a0a]',
            // Inset shadow for depth
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
            !filename && !language && 'rounded-xl'
          )}
        >
          <code className="font-mono text-zinc-50 text-[13px] leading-relaxed">
            {showLineNumbers || hasHighlighting ? (
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, index) => {
                    const lineNum = index + 1
                    const isHighlighted = highlightedLineSet.has(lineNum)

                    return (
                      <tr
                        key={index}
                        className={cn(
                          'leading-6 transition-colors duration-150',
                          isHighlighted && 'bg-zinc-800/50'
                        )}
                      >
                        {showLineNumbers && (
                          <td
                            className={cn(
                              'select-none pr-4 text-right w-10 tabular-nums',
                              isHighlighted ? 'text-zinc-400' : 'text-zinc-600'
                            )}
                            aria-hidden="true"
                          >
                            {lineNum}
                          </td>
                        )}
                        <td
                          className={cn(
                            'whitespace-pre',
                            isHighlighted &&
                              !showLineNumbers &&
                              'border-l-2 border-zinc-500 pl-3 -ml-1'
                          )}
                        >
                          {line || ' '}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              codeContent.trim()
            )}
          </code>
        </pre>

        {/* Copy button - refined */}
        <button
          onClick={copyToClipboard}
          className={cn(
            'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg',
            'bg-zinc-800/80 backdrop-blur-sm',
            'text-zinc-500',
            'border border-zinc-700/50',
            'transition-all duration-200',
            'hover:bg-zinc-700/90 hover:text-zinc-200 hover:border-zinc-600/50',
            'opacity-0 group-hover:opacity-100 focus:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-zinc-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950',
            'active:scale-95',
            copied && 'bg-emerald-900/50 border-emerald-700/50'
          )}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          type="button"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
