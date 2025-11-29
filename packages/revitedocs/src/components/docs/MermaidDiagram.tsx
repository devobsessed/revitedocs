'use client'

import { useEffect, useState, useRef, useId, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react'
import { cn } from '../utils.js'

export interface MermaidDiagramProps {
  /** Mermaid chart definition string */
  chart: string
  /** Additional CSS classes */
  className?: string
}

// Lazy-load mermaid to avoid SSR issues
let mermaidPromise: Promise<typeof import('mermaid')> | null = null

async function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
  }
  return mermaidPromise
}

/**
 * MermaidDiagram component for rendering Mermaid diagrams with fullscreen pan/zoom.
 * Renders client-side only to avoid SSR issues.
 */
export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const uniqueId = useId().replace(/:/g, '-')

  // Client-side only flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize and render mermaid
  const renderDiagram = useCallback(async () => {
    if (!isClient) return

    try {
      setError(null)
      const mermaidModule = await getMermaid()
      const mermaid = mermaidModule.default

      // Detect theme
      const isDark = typeof document !== 'undefined' && 
        document.documentElement.classList.contains('dark')

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      })

      const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart)
      setSvg(renderedSvg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram')
      console.error('Mermaid render error:', err)
    }
  }, [chart, uniqueId, isClient])

  // Render diagram on mount and when chart changes
  useEffect(() => {
    renderDiagram()
  }, [renderDiagram])

  // Re-render when theme changes
  useEffect(() => {
    if (typeof document === 'undefined') return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          renderDiagram()
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [renderDiagram])

  // Handle fullscreen dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isFullscreen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isFullscreen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // SSR placeholder
  if (!isClient) {
    return (
      <div className={cn('rounded-lg border bg-zinc-100 dark:bg-zinc-800/50 p-8', className)}>
        <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center">Loading diagram...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('rounded-lg border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 p-4', className)}>
        <p className="text-sm text-red-600 dark:text-red-400">Failed to render diagram: {error}</p>
        <pre className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 overflow-auto bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
          {chart}
        </pre>
      </div>
    )
  }

  // Loading state
  if (!svg) {
    return (
      <div className={cn('rounded-lg border bg-zinc-100 dark:bg-zinc-800/50 p-8', className)}>
        <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <>
      {/* Inline diagram with expand button */}
      <div
        ref={containerRef}
        className={cn(
          'group relative rounded-lg border border-zinc-200 dark:border-zinc-700',
          'bg-zinc-50 dark:bg-zinc-800/50 p-4',
          className
        )}
      >
        <div
          className="flex items-center justify-center overflow-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {/* Expand button overlay */}
        <button
          type="button"
          className={cn(
            'absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-md',
            'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300',
            'hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all',
            'opacity-0 group-hover:opacity-100 shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          onClick={() => setIsFullscreen(true)}
          aria-label="View fullscreen"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Fullscreen Dialog (native HTML dialog) */}
      <dialog
        ref={dialogRef}
        className={cn(
          'fixed inset-0 m-0 p-0 w-screen h-screen max-w-none max-h-none',
          'bg-black/90 backdrop:bg-black/90',
          'overflow-hidden'
        )}
        onClose={() => setIsFullscreen(false)}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.25}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="relative w-full h-full">
              {/* Controls header */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-zinc-900/90 backdrop-blur border-b border-zinc-700">
                <span className="text-sm font-medium text-zinc-300">
                  Mermaid Diagram
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    onClick={() => zoomOut()}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    onClick={() => zoomIn()}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    onClick={() => resetTransform()}
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="w-px h-6 bg-zinc-700 mx-1" aria-hidden="true" />
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    onClick={() => setIsFullscreen(false)}
                    aria-label="Close fullscreen"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Zoomable/pannable content */}
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center pt-14"
              >
                <div
                  className="p-16 [&_svg]:max-w-none [&_svg]:max-h-none"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </TransformComponent>

              {/* Help text */}
              <div className="absolute bottom-3 left-3 text-xs text-zinc-400 bg-zinc-900/80 backdrop-blur px-2 py-1 rounded">
                Scroll to zoom • Drag to pan • Escape to close
              </div>
            </div>
          )}
        </TransformWrapper>
      </dialog>
    </>
  )
}

