import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import pc from "picocolors";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { build as viteBuild, type Plugin } from "vite";
import type { ResolvedConfig } from "../../core/config.js";
import {
  remarkContainerDirectives,
  remarkMermaid,
} from "../../core/remark-plugins.js";
import { generateRoutes, type Route } from "../../core/router.js";
import { revitedocsRoutesPlugin } from "../../core/vite-plugin-routes.js";
import { revitedocsConfigPlugin } from "../../core/vite-plugin.js";

// Create require to resolve dependencies from revitedocs's location
const require = createRequire(import.meta.url);

/**
 * Resolve a dependency path using Node's resolution algorithm
 * Works regardless of npm hoisting behavior
 */
function resolveDep(dep: string): string {
  try {
    // Use require.resolve to get the actual path where the package is installed
    // Then get the package directory by locating node_modules/package-name
    const resolved = require.resolve(dep);
    const nodeModulesIndex = resolved.lastIndexOf("node_modules");
    if (nodeModulesIndex === -1) {
      return resolved;
    }
    // Get everything up to and including the package name (handles scoped packages too)
    const afterNodeModules = resolved.slice(
      nodeModulesIndex + "node_modules/".length
    );
    const packageName = afterNodeModules.startsWith("@")
      ? afterNodeModules.split("/").slice(0, 2).join("/")
      : afterNodeModules.split("/")[0];
    return (
      resolved.slice(0, nodeModulesIndex + "node_modules/".length) + packageName
    );
  } catch {
    return dep; // Fall back to bare specifier if resolution fails
  }
}

export interface SSGOptions {
  outDir: string;
  base?: string;
}

/**
 * Create the build index.html that references a real entry file
 */
function createBuildIndexHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/.revitedocs/entry-client.js"></script>
  </body>
</html>`;
}

/**
 * Create virtual CSS entry plugin for Tailwind processing
 */
function createCssEntryPlugin(): Plugin {
  return {
    name: "revitedocs:css-entry",
    resolveId(id) {
      if (
        id === "/.revitedocs/styles.css" ||
        id.endsWith(".revitedocs/styles.css")
      ) {
        // Use .css extension to ensure proper CSS handling
        return "\0revitedocs-styles.css";
      }
    },
    load(id) {
      if (id === "\0revitedocs-styles.css") {
        // Tailwind v4 uses @import "tailwindcss" syntax
        return `@import "tailwindcss";

/* Prose styles for markdown content */
.prose h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; }
.prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
.prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.prose p { margin-bottom: 1rem; line-height: 1.7; }
.prose pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
.prose code { font-family: ui-monospace, monospace; font-size: 0.875rem; }
.prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose li { margin-bottom: 0.25rem; }
.prose a { color: #3b82f6; }
.prose a:hover { text-decoration: underline; }
.prose strong { font-weight: 600; }
.prose blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #6b7280; margin: 1rem 0; }

/* Dark mode prose styles */
.dark .prose h2 { border-color: #374151; }
.dark .prose pre { background: #111827; }
.dark .prose a { color: #60a5fa; }
.dark .prose blockquote { border-color: #60a5fa; color: #9ca3af; }
`;
      }
    },
  };
}

/**
 * Generate client entry code for hydration
 */
function generateClientEntryCode(): string {
  return `
import '/.revitedocs/styles.css'
import { createElement, useState, useEffect } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { MDXProvider } from '@mdx-js/react'
import { routes } from 'virtual:revitedocs/routes'
import config from 'virtual:revitedocs/config'
import { search } from 'virtual:revitedocs/search'
import { Callout, MermaidDiagram, TabGroup, Steps, Step, FileTree, SearchModal, setSearchFunction, VersionSwitcher, LanguageSwitcher, CopyMarkdownButton } from 'revitedocs/components'

// Initialize search with the virtual module's search function
setSearchFunction(search)

// MDX components mapping
const mdxComponents = {
  Callout,
  MermaidDiagram,
  TabGroup,
  Steps,
  Step,
  FileTree,
}

// Detect version from path (e.g., /v2/guide/intro -> 'v2')
function detectVersion(path) {
  const match = path.match(/^\\/?(v\\d+(?:\\.\\d+)*)/)
  return match ? match[1] : null
}

// Detect locale from path (e.g., /en/guide/intro -> 'en')
function detectLocale(path) {
  const match = path.match(/^\\/([a-z]{2}(?:-[A-Z]{2})?)(?:\\/|$)/)
  return match ? match[1] : null
}

// Get the appropriate sidebar config for the current path
function getSidebarForPath(path, sidebarConfig) {
  if (!sidebarConfig) return []
  const keys = Object.keys(sidebarConfig).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (path.startsWith(key) || (key === '/' && !keys.some(k => k !== '/' && path.startsWith(k)))) {
      return sidebarConfig[key] || []
    }
  }
  return sidebarConfig['/'] || []
}

// Simple router - render based on current path
function App() {
  const path = window.location.pathname
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [isMounted, setIsMounted] = useState(false)
  
  const currentVersion = detectVersion(path)
  const hasVersions = config.versions && config.versions.length > 0
  const sidebarSections = getSidebarForPath(path, config.theme?.sidebar)
  
  const currentLocale = detectLocale(path)
  const hasLocales = config.locales && Object.keys(config.locales).length > 1
  
  // Mark as mounted after hydration to enable client-only components
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  
  useEffect(() => {
    const activeLocale = currentLocale || config.defaultLocale
    if (activeLocale && config.locales?.[activeLocale]) {
      document.documentElement.lang = config.locales[activeLocale].lang
    }
  }, [currentLocale])
  
  const route = routes.find(r => r.path === path || r.path === path.replace(/\\/$/, '') || (r.path === '/' && (path === '/' || path === '')))
    || routes[0]
  
  if (!route) {
    return createElement('div', { className: 'p-8' }, 
      createElement('h1', { className: 'text-2xl font-bold text-red-500' }, '404 - No pages found'),
      createElement('p', null, 'Create an index.md file in your docs folder.')
    )
  }

  const Page = route.element
  
  const handleNavigate = (url) => {
    window.history.pushState({}, '', url)
    window.location.reload()
  }

  return createElement('div', { className: 'min-h-screen bg-white dark:bg-gray-900' },
    // SearchModal is client-only - render after hydration to avoid mismatch
    isMounted && createElement(SearchModal, {
      open: searchOpen,
      onOpenChange: setSearchOpen,
      onNavigate: handleNavigate,
    }),
    createElement('header', { 
      className: 'sticky top-0 z-50 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur'
    },
      createElement('div', { className: 'flex h-14 items-center px-6' },
        createElement('div', { className: 'flex items-center gap-2' },
          createElement('div', { 
            className: 'h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold'
          }, config.title?.[0] || 'D'),
          createElement('span', { className: 'font-semibold' }, config.title || 'Documentation')
        ),
        createElement('div', { className: 'flex-1' }),
        createElement('button', {
          onClick: () => setSearchOpen(true),
          className: 'flex items-center h-9 px-3 mr-2 rounded-md border bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
        },
          createElement('svg', { className: 'h-4 w-4 mr-2', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
          ),
          createElement('span', { className: 'hidden md:inline text-sm' }, 'Search...'),
          createElement('kbd', { className: 'hidden md:inline ml-4 px-1.5 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700' }, '⌘K')
        ),
        createElement('button', {
          onClick: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
          className: 'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
        },
          theme === 'dark' 
            ? createElement('svg', { className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' })
              )
            : createElement('svg', { className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' })
              )
        ),
        createElement('nav', { className: 'flex items-center gap-4 ml-4' },
          (config.theme?.nav || []).map((item, i) => 
            createElement('a', { 
              key: i,
              href: item.link, 
              className: 'text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400'
            }, item.text)
          )
        )
      )
    ),
    createElement('div', { className: 'flex' },
      createElement('aside', { 
        className: 'hidden md:block w-64 border-r h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto p-4'
      },
        (hasVersions || hasLocales) && createElement('div', { className: 'mb-4 space-y-3' },
          hasVersions && createElement(VersionSwitcher, {
            versions: config.versions,
            currentVersion: currentVersion,
            defaultVersion: config.defaultVersion,
            currentPath: path,
          }),
          hasLocales && createElement(LanguageSwitcher, {
            locales: config.locales,
            currentLocale: currentLocale,
            defaultLocale: config.defaultLocale,
            currentPath: path,
          })
        ),
        sidebarSections.map((section, i) => 
          createElement('div', { key: i, className: 'mb-4' },
            createElement('h3', { 
              className: 'text-xs font-semibold uppercase text-gray-500 mb-2' 
            }, section.text),
            createElement('ul', { className: 'space-y-1' },
              (section.items || []).map((item, j) =>
                createElement('li', { key: j },
                  createElement('a', {
                    href: item.link,
                    className: 'block px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 ' + 
                      (path === item.link ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50' : 'text-gray-600 dark:text-gray-400')
                  }, item.text)
                )
              )
            )
          )
        )
      ),
      createElement('main', { 
        className: 'flex-1 min-w-0 px-6 md:px-8 py-8 ' + (route.toc?.length > 0 ? 'lg:mr-56' : '')
      },
        createElement('article', { className: 'prose dark:prose-invert max-w-none' },
          (route.frontmatter?.title || route.rawMarkdown) && createElement('div', {
            className: 'flex items-start justify-between gap-4 mb-4 not-prose'
          },
            route.frontmatter?.title 
              ? createElement('h1', { 
                  className: 'text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 m-0'
                }, route.frontmatter.title)
              : createElement('div'),
            route.rawMarkdown && createElement(CopyMarkdownButton, {
              markdown: route.rawMarkdown,
              className: 'flex-shrink-0 mt-1'
            })
          ),
          createElement(MDXProvider, { components: mdxComponents },
            createElement(Page)
          )
        )
      ),
      route.toc?.length > 0 && createElement('aside', {
        className: 'hidden lg:block fixed right-4 top-16 w-52 max-h-[calc(100vh-5rem)] overflow-y-auto py-4'
      },
        createElement('p', { className: 'text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100' }, 'On this page'),
        createElement('ul', { className: 'space-y-2 text-sm border-l border-gray-200 dark:border-gray-700' },
          route.toc.map((item, i) =>
            createElement('li', { key: i, className: 'pl-3 -ml-px' },
              createElement('a', {
                href: '#' + item.id,
                className: 'block text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors'
              }, item.text)
            )
          )
        )
      )
    )
  )
}

// Hydrate or mount the app
const container = document.getElementById('app')
if (container.innerHTML.trim()) {
  // Hydrate SSR content
  hydrateRoot(container, createElement(App))
} else {
  // Client-only render
  createRoot(container).render(createElement(App))
}

// Client-side navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a')
  if (!link) return
  
  if (link.hash && link.pathname === window.location.pathname) {
    e.preventDefault()
    const target = document.getElementById(link.hash.slice(1))
    if (target) {
      const headerOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      window.history.pushState(null, '', link.hash)
    }
    return
  }
  
  if (link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
    e.preventDefault()
    window.location.href = link.href
  }
})
`;
}

/**
 * Create client entry plugin for build
 */
function createClientEntryPlugin(): Plugin {
  return {
    name: "revitedocs:client-entry",
    resolveId(id) {
      if (
        id === "/.revitedocs/entry-client.js" ||
        id.endsWith(".revitedocs/entry-client.js")
      ) {
        return "\0revitedocs-client-entry";
      }
    },
    load(id) {
      if (id === "\0revitedocs-client-entry") {
        return generateClientEntryCode();
      }
    },
  };
}

/**
 * Create Pagefind search plugin that loads from static files
 */
function createBuildSearchPlugin(): Plugin {
  return {
    name: "revitedocs:build-search",
    resolveId(id) {
      if (id === "virtual:revitedocs/search") {
        return "\0revitedocs-build-search";
      }
    },
    load(id) {
      if (id === "\0revitedocs-build-search") {
        // Return Pagefind-based search
        // Use new Function to create dynamic import that won't be analyzed at build time
        return `
const loadPagefind = new Function('return import("/pagefind/pagefind.js")')

export async function search(query) {
  if (!query || query.length < 2) return []
  
  try {
    // Load Pagefind dynamically at runtime
    if (!window.__pagefind) {
      window.__pagefind = await loadPagefind()
      await window.__pagefind.init()
    }
    
    const results = await window.__pagefind.search(query)
    const items = await Promise.all(
      results.results.slice(0, 10).map(async (r) => {
        const data = await r.data()
        return {
          title: data.meta?.title || data.url,
          url: data.url,
          excerpt: data.excerpt,
        }
      })
    )
    return items
  } catch (e) {
    console.warn('Search not available:', e)
    return []
  }
}
`;
      }
    },
  };
}

/**
 * Generate the server entry code for SSR rendering
 * IMPORTANT: This must match the client's initial render state exactly to avoid hydration errors
 */
function generateServerEntryCode(): string {
  return `
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MDXProvider } from '@mdx-js/react'
import { routes } from 'virtual:revitedocs/routes'
import config from 'virtual:revitedocs/config'
import { Callout, MermaidDiagram, TabGroup, Steps, Step, FileTree, VersionSwitcher, LanguageSwitcher, CopyMarkdownButton } from 'revitedocs/components'

// MDX components mapping
const mdxComponents = {
  Callout,
  MermaidDiagram,
  TabGroup,
  Steps,
  Step,
  FileTree,
}

// Get the appropriate sidebar config for the current path
function getSidebarForPath(path, sidebarConfig) {
  if (!sidebarConfig) return []
  const keys = Object.keys(sidebarConfig).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (path.startsWith(key) || (key === '/' && !keys.some(k => k !== '/' && path.startsWith(k)))) {
      return sidebarConfig[key] || []
    }
  }
  return sidebarConfig['/'] || []
}

// Detect version from path
function detectVersion(path) {
  const match = path.match(/^\\/?(v\\d+(?:\\.\\d+)*)/)
  return match ? match[1] : null
}

// Detect locale from path
function detectLocale(path) {
  const match = path.match(/^\\/([a-z]{2}(?:-[A-Z]{2})?)(?:\\/|$)/)
  return match ? match[1] : null
}

// Render a page at a given route path
export function render(routePath) {
  const route = routes.find(r => r.path === routePath)
  
  if (!route) {
    return {
      html: '<div>Page not found</div>',
      frontmatter: {},
    }
  }
  
  const Page = route.element
  const currentVersion = detectVersion(routePath)
  const currentLocale = detectLocale(routePath)
  const sidebarSections = getSidebarForPath(routePath, config.theme?.sidebar)
  
  const hasVersions = config.versions && config.versions.length > 0
  const hasLocales = config.locales && Object.keys(config.locales).length > 1
  
  // Build the full page HTML structure - must match client initial state exactly
  const appHtml = renderToString(
    createElement('div', { className: 'min-h-screen bg-white dark:bg-gray-900' },
      // Header
      createElement('header', { 
        className: 'sticky top-0 z-50 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur'
      },
        createElement('div', { className: 'flex h-14 items-center px-6' },
          createElement('div', { className: 'flex items-center gap-2' },
            createElement('div', { 
              className: 'h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold'
            }, config.title?.[0] || 'D'),
            createElement('span', { className: 'font-semibold' }, config.title || 'Documentation')
          ),
          createElement('div', { className: 'flex-1' }),
          // Search button - matches client initial render
          createElement('button', {
            className: 'flex items-center h-9 px-3 mr-2 rounded-md border bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
          },
            createElement('svg', { className: 'h-4 w-4 mr-2', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
            ),
            createElement('span', { className: 'hidden md:inline text-sm' }, 'Search...'),
            createElement('kbd', { className: 'hidden md:inline ml-4 px-1.5 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700' }, '⌘K')
          ),
          // Theme toggle - initial state is 'light' so render moon icon (to switch to dark)
          createElement('button', {
            className: 'p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
          },
            createElement('svg', { className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' })
            )
          ),
          createElement('nav', { className: 'flex items-center gap-4 ml-4' },
            ...(config.theme?.nav || []).map((item, i) => 
              createElement('a', { 
                key: i,
                href: item.link, 
                className: 'text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }, item.text)
            )
          )
        )
      ),
      // Main layout
      createElement('div', { className: 'flex' },
        // Sidebar
        createElement('aside', { 
          className: 'hidden md:block w-64 border-r h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto p-4'
        },
          // Version and Language Switchers - must match client
          (hasVersions || hasLocales) && createElement('div', { className: 'mb-4 space-y-3' },
            hasVersions && createElement(VersionSwitcher, {
              versions: config.versions,
              currentVersion: currentVersion,
              defaultVersion: config.defaultVersion,
              currentPath: routePath,
            }),
            hasLocales && createElement(LanguageSwitcher, {
              locales: config.locales,
              currentLocale: currentLocale,
              defaultLocale: config.defaultLocale,
              currentPath: routePath,
            })
          ),
          // Sidebar sections
          ...sidebarSections.map((section, i) => 
            createElement('div', { key: i, className: 'mb-4' },
              createElement('h3', { 
                className: 'text-xs font-semibold uppercase text-gray-500 mb-2' 
              }, section.text),
              createElement('ul', { className: 'space-y-1' },
                ...(section.items || []).map((item, j) =>
                  createElement('li', { key: j },
                    createElement('a', {
                      href: item.link,
                      className: 'block px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 ' + 
                        (routePath === item.link ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50' : 'text-gray-600 dark:text-gray-400')
                    }, item.text)
                  )
                )
              )
            )
          )
        ),
        // Content
        createElement('main', { 
          className: 'flex-1 min-w-0 px-6 md:px-8 py-8 ' + (route.toc?.length > 0 ? 'lg:mr-56' : '')
        },
          createElement('article', { className: 'prose dark:prose-invert max-w-none' },
            // Page header with title and copy button - must match client
            (route.frontmatter?.title || route.rawMarkdown) && createElement('div', {
              className: 'flex items-start justify-between gap-4 mb-4 not-prose'
            },
              route.frontmatter?.title 
                ? createElement('h1', { 
                    className: 'text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 m-0'
                  }, route.frontmatter.title)
                : createElement('div'),
              route.rawMarkdown && createElement(CopyMarkdownButton, {
                markdown: route.rawMarkdown,
                className: 'flex-shrink-0 mt-1'
              })
            ),
            createElement(MDXProvider, { components: mdxComponents },
              createElement(Page)
            )
          )
        ),
        // TOC - must match client structure (including 'relative' class)
        route.toc?.length > 0 && createElement('aside', {
          className: 'hidden lg:block fixed right-4 top-16 w-52 max-h-[calc(100vh-5rem)] overflow-y-auto py-4'
        },
          createElement('p', { className: 'text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100' }, 'On this page'),
          createElement('ul', { className: 'space-y-2 text-sm border-l border-gray-200 dark:border-gray-700' },
            ...route.toc.map((item, i) =>
              createElement('li', { key: i, className: 'relative pl-3 -ml-px' },
                createElement('a', {
                  href: '#' + item.id,
                  className: 'block transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }, item.text)
              )
            )
          )
        )
      )
    )
  )
  
  return {
    html: appHtml,
    frontmatter: route.frontmatter || {},
    toc: route.toc || [],
  }
}

// Export routes for pre-rendering
export { routes }
export { config }
`;
}

/**
 * Create the server entry plugin for SSG build
 */
function createServerEntryPlugin(): import("vite").Plugin {
  return {
    name: "revitedocs:server-entry",
    resolveId(id) {
      if (id === "virtual:revitedocs/server-entry") {
        return "\0revitedocs-server-entry";
      }
    },
    load(id) {
      if (id === "\0revitedocs-server-entry") {
        return generateServerEntryCode();
      }
    },
  };
}

/**
 * Create the virtual search plugin that returns a no-op for SSR
 */
function createSSRSearchPlugin(): Plugin {
  return {
    name: "revitedocs:ssr-search",
    resolveId(id) {
      if (id === "virtual:revitedocs/search") {
        return "\0revitedocs-ssr-search";
      }
    },
    load(id) {
      if (id === "\0revitedocs-ssr-search") {
        // Return a stub search function for SSR - actual search uses Pagefind on client
        return `export async function search(query) { return [] }`;
      }
    },
  };
}

/**
 * Create full HTML page from rendered content
 */
function createHtmlPage(
  config: ResolvedConfig,
  appHtml: string,
  route: Route,
  frontmatter: Record<string, unknown>,
  clientScripts: string[],
  clientStyles: string[],
  base: string
): string {
  const title = frontmatter.title
    ? `${frontmatter.title} | ${config.title}`
    : config.title;
  const description =
    (frontmatter.description as string) || config.description || "";

  // Normalize base - ensure single slash between base and asset paths
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;

  const scriptTags = clientScripts
    .map((src) => {
      const normalizedSrc = src.startsWith("/") ? src : "/" + src;
      return `<script type="module" src="${normalizedBase}${normalizedSrc}"></script>`;
    })
    .join("\n    ");

  const styleTags = clientStyles
    .map((href) => {
      const normalizedHref = href.startsWith("/") ? href : "/" + href;
      return `<link rel="stylesheet" href="${normalizedBase}${normalizedHref}">`;
    })
    .join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${base}${route.path}">
    ${styleTags}
  </head>
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div id="app">${appHtml}</div>
    ${scriptTags}
  </body>
</html>`;
}

/**
 * Build SSG - pre-render all routes to static HTML
 */
export async function buildSSG(
  rootDir: string,
  config: ResolvedConfig,
  options: SSGOptions
): Promise<void> {
  const { outDir, base = "/" } = options;
  const distPath = path.join(rootDir, outDir);
  // Server bundle goes inside .revitedocs for building
  const revitedocsDir = path.join(rootDir, ".revitedocs");
  const distServerPath = path.join(revitedocsDir, "server");

  console.log(pc.cyan("\n📦 Building SSG..."));

  // Create .revitedocs directory for build artifacts
  if (!fs.existsSync(revitedocsDir)) {
    fs.mkdirSync(revitedocsDir, { recursive: true });
  }

  // Write build index.html in .revitedocs folder
  const indexPath = path.join(revitedocsDir, "index.html");
  const buildIndexHtml = createBuildIndexHtml(config.title);
  fs.writeFileSync(indexPath, buildIndexHtml);

  try {
    // Step 1: Build client bundle
    console.log(pc.dim("  Building client bundle..."));
    await viteBuild({
      root: revitedocsDir,
      base,
      plugins: [
        tailwindcss(),
        createCssEntryPlugin(),
        {
          enforce: "pre",
          ...mdx({
            remarkPlugins: [
              remarkGfm,
              remarkFrontmatter,
              remarkContainerDirectives,
              remarkMermaid,
            ],
            rehypePlugins: [rehypeSlug],
            providerImportSource: "@mdx-js/react",
          }),
        },
        react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
        revitedocsConfigPlugin(config),
        revitedocsRoutesPlugin(rootDir),
        createClientEntryPlugin(),
        createBuildSearchPlugin(),
      ],
      build: {
        // outDir is relative to rootDir (e.g., .revitedocs/dist), convert to relative from revitedocsDir
        outDir: path.relative(revitedocsDir, distPath),
        ssrManifest: true,
        emptyOutDir: true,
      },
      logLevel: "warn",
      optimizeDeps: {
        include: ["react", "react-dom", "@mdx-js/react"],
      },
      resolve: {
        dedupe: ["react", "react-dom", "@mdx-js/react"],
        alias: {
          react: resolveDep("react"),
          "react-dom": resolveDep("react-dom"),
          "@mdx-js/react": resolveDep("@mdx-js/react"),
          mermaid: resolveDep("mermaid"),
        },
      },
    });
    console.log(pc.green("  ✓ Client bundle built"));

    // Step 2: Build server bundle for pre-rendering
    console.log(pc.dim("  Building server bundle..."));

    // Create the server entry plugin with higher priority for resolving
    const serverEntryPlugin = createServerEntryPlugin();

    await viteBuild({
      root: revitedocsDir,
      base,
      plugins: [
        // Server entry plugin must come first to resolve the virtual entry
        {
          ...serverEntryPlugin,
          enforce: "pre",
        },
        {
          enforce: "pre",
          ...mdx({
            remarkPlugins: [
              remarkGfm,
              remarkFrontmatter,
              remarkContainerDirectives,
              remarkMermaid,
            ],
            rehypePlugins: [rehypeSlug],
            providerImportSource: "@mdx-js/react",
          }),
        },
        react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
        revitedocsConfigPlugin(config),
        revitedocsRoutesPlugin(rootDir),
        createSSRSearchPlugin(),
      ],
      build: {
        outDir: "server",
        ssr: true,
        emptyOutDir: true,
        rollupOptions: {
          input: {
            "server-entry": "virtual:revitedocs/server-entry",
          },
          output: {
            entryFileNames: "[name].js",
          },
        },
      },
      logLevel: "warn",
      resolve: {
        dedupe: ["react", "react-dom", "@mdx-js/react"],
        alias: {
          react: resolveDep("react"),
          "react-dom": resolveDep("react-dom"),
          "@mdx-js/react": resolveDep("@mdx-js/react"),
          mermaid: resolveDep("mermaid"),
        },
      },
      ssr: {
        // Don't externalize revitedocs components - we need them bundled
        noExternal: ["revitedocs"],
      },
    });
    console.log(pc.green("  ✓ Server bundle built"));

    // Step 3: Pre-render routes
    console.log(pc.dim("  Pre-rendering routes..."));

    // Get all routes
    const routes = await generateRoutes(rootDir);

    // Load server bundle
    const serverEntryPath = path.join(distServerPath, "server-entry.js");
    const serverModule = await import(serverEntryPath);
    const { render } = serverModule;

    // Get client assets from the built HTML
    const builtIndexPath = path.join(distPath, "index.html");
    let clientScripts: string[] = [];
    let clientStyles: string[] = [];

    if (fs.existsSync(builtIndexPath)) {
      const builtHtml = fs.readFileSync(builtIndexPath, "utf-8");
      // Extract script src from built HTML
      const scriptMatches = builtHtml.match(/src="([^"]+\.js)"/g) || [];
      clientScripts = scriptMatches
        .map((m) => m.match(/src="([^"]+)"/)?.[1] || "")
        .filter(Boolean);
      // Extract CSS links
      const cssMatches = builtHtml.match(/href="([^"]+\.css)"/g) || [];
      clientStyles = cssMatches
        .map((m) => m.match(/href="([^"]+)"/)?.[1] || "")
        .filter(Boolean);
    }

    // Pre-render each route
    let renderedCount = 0;
    for (const route of routes) {
      try {
        const { html: appHtml, frontmatter } = render(route.path);

        const fullHtml = createHtmlPage(
          config,
          appHtml,
          route,
          frontmatter,
          clientScripts,
          clientStyles,
          base
        );

        // Determine output path
        const outPath =
          route.path === "/"
            ? path.join(distPath, "index.html")
            : path.join(distPath, route.path, "index.html");

        // Ensure directory exists
        const outDirPath = path.dirname(outPath);
        if (!fs.existsSync(outDirPath)) {
          fs.mkdirSync(outDirPath, { recursive: true });
        }

        // Write pre-rendered HTML
        fs.writeFileSync(outPath, fullHtml);
        renderedCount++;
        console.log(
          pc.dim(`    ${route.path} → ${path.relative(rootDir, outPath)}`)
        );
      } catch (error) {
        console.error(pc.yellow(`  ⚠ Failed to render ${route.path}:`), error);
      }
    }

    console.log(pc.green(`  ✓ Pre-rendered ${renderedCount} pages`));

    // Step 4: Clean up server bundle
    console.log(pc.dim("  Cleaning up..."));
    fs.rmSync(distServerPath, { recursive: true, force: true });
    console.log(pc.green("  ✓ Cleanup complete"));
  } finally {
    // Remove the temporary build index.html from .revitedocs
    try {
      fs.unlinkSync(indexPath);
    } catch {
      /* ignore cleanup errors */
    }
  }
}

/**
 * Generate sitemap.xml from routes
 */
export async function generateSitemap(
  rootDir: string,
  config: ResolvedConfig,
  outDir: string,
  baseUrl?: string
): Promise<void> {
  const routes = await generateRoutes(rootDir);
  const base = baseUrl || config.base || "https://example.com";

  // Ensure base URL doesn't end with slash
  const normalizedBase = base.replace(/\/$/, "");

  const now = new Date().toISOString().split("T")[0];

  const urls = routes
    .map((route) => {
      const loc =
        route.path === "/" ? normalizedBase + "/" : normalizedBase + route.path;

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const sitemapPath = path.join(rootDir, outDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemap);

  console.log(pc.green(`✓ Sitemap generated (${routes.length} URLs)`));
}
