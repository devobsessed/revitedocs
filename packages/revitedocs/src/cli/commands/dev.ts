import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createServer, type Plugin } from "vite";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import { loadConfig } from "../../core/config.js";
import { remarkContainerDirectives, remarkMermaid } from "../../core/remark-plugins.js";
import { revitedocsRoutesPlugin } from "../../core/vite-plugin-routes.js";
import { revitedocsConfigPlugin } from "../../core/vite-plugin.js";
import { revitedocsSearchPlugin } from "../../core/vite-plugin-search.js";

// Create require to resolve dependencies from revitedocs's location
const require = createRequire(import.meta.url);

export interface DevOptions {
  port: number;
  open?: boolean;
  host?: boolean;
}

/**
 * Virtual entry point plugin - serves main.tsx
 */
function revitedocsEntryPlugin(): Plugin {
  return {
    name: "revitedocs:entry",
    configureServer(server) {
      // Watch for new/deleted markdown files to regenerate routes
      server.watcher.on("add", (file) => {
        if (file.endsWith(".md") || file.endsWith(".mdx")) {
          console.log(`\n📄 New file detected: ${path.basename(file)}`);
          server.restart();
        }
      });
      server.watcher.on("unlink", (file) => {
        if (file.endsWith(".md") || file.endsWith(".mdx")) {
          console.log(`\n🗑️  File removed: ${path.basename(file)}`);
          server.restart();
        }
      });
    },
    resolveId(id) {
      if (
        id === "/.revitedocs/entry.js" ||
        id.endsWith(".revitedocs/entry.js")
      ) {
        return "\0revitedocs-entry";
      }
    },
    load(id) {
      if (id === "\0revitedocs-entry") {
        return `
import { createElement, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
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
  // Find the most specific match
  const keys = Object.keys(sidebarConfig).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (path.startsWith(key) || (key === '/' && !keys.some(k => k !== '/' && path.startsWith(k)))) {
      return sidebarConfig[key] || []
    }
  }
  return sidebarConfig['/'] || []
}

// Simple router - just render based on current path
function App() {
  const path = window.location.pathname
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [activeId, setActiveId] = useState('')
  
  // Version detection
  const currentVersion = detectVersion(path)
  const hasVersions = config.versions && config.versions.length > 0
  const sidebarSections = getSidebarForPath(path, config.theme?.sidebar)
  
  // Locale detection
  const currentLocale = detectLocale(path)
  const hasLocales = config.locales && Object.keys(config.locales).length > 1
  
  // Handle Cmd/Ctrl+K for search
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

  // Handle theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  
  // Set HTML lang attribute based on locale
  useEffect(() => {
    const activeLocale = currentLocale || config.defaultLocale
    if (activeLocale && config.locales?.[activeLocale]) {
      document.documentElement.lang = config.locales[activeLocale].lang
    }
  }, [currentLocale])
  
  const route = routes.find(r => r.path === path || r.path === path.replace(/\\/$/, '') || (r.path === '/' && (path === '/' || path === '')))
    || routes[0]
    
  // Scroll spy for TOC
  useEffect(() => {
    if (!route?.toc?.length) return
    
    const ids = route.toc.map(item => item.id)
    if (ids.length === 0) return
    
    const handleScroll = () => {
      let currentId = ids[0]
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            currentId = id
          } else {
            break
          }
        }
      }
      setActiveId(currentId)
    }
    
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [route?.toc])
  
  if (!route) {
    return createElement('div', { className: 'p-8' }, 
      createElement('h1', { className: 'text-2xl font-bold text-red-500' }, '404 - No pages found'),
      createElement('p', null, 'Create an index.md file in your docs folder.')
    )
  }

  const Page = route.element
  
  // Navigate function for search results
  const handleNavigate = (url) => {
    window.history.pushState({}, '', url)
    window.location.reload()
  }

  return createElement('div', { className: 'min-h-screen bg-white dark:bg-gray-900' },
    // Search Modal
    createElement(SearchModal, {
      open: searchOpen,
      onOpenChange: setSearchOpen,
      onNavigate: handleNavigate,
    }),
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
        // Search button
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
        // Theme toggle
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
    // Main
    createElement('div', { className: 'flex' },
      // Sidebar
      createElement('aside', { 
        className: 'hidden md:block w-64 border-r h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto p-4'
      },
        // Version and Language Switchers
        (hasVersions || hasLocales) && createElement('div', { className: 'mb-4 space-y-3' },
          // Version Switcher
          hasVersions && createElement(VersionSwitcher, {
            versions: config.versions,
            currentVersion: currentVersion,
            defaultVersion: config.defaultVersion,
            currentPath: path,
          }),
          // Language Switcher
          hasLocales && createElement(LanguageSwitcher, {
            locales: config.locales,
            currentLocale: currentLocale,
            defaultLocale: config.defaultLocale,
            currentPath: path,
          })
        ),
        // Sidebar sections
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
      // Content - add right margin when TOC is present
      createElement('main', { 
        className: 'flex-1 min-w-0 px-6 md:px-8 py-8 ' + (route.toc?.length > 0 ? 'lg:mr-56' : '')
      },
        createElement('article', { className: 'prose dark:prose-invert max-w-none' },
          // Page header with title and copy button
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
      // TOC - fixed position on right side with scroll spy
      route.toc?.length > 0 && createElement('aside', {
        className: 'hidden lg:block fixed right-4 top-16 w-52 max-h-[calc(100vh-5rem)] overflow-y-auto py-4'
      },
        createElement('p', { className: 'text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100' }, 'On this page'),
        createElement('ul', { className: 'space-y-2 text-sm border-l border-gray-200 dark:border-gray-700' },
          route.toc.map((item, i) => {
            const isActive = activeId === item.id
            return createElement('li', { key: i, className: 'relative pl-3 -ml-px' },
              isActive && createElement('span', {
                className: 'absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400'
              }),
              createElement('a', {
                href: '#' + item.id,
                className: 'block transition-colors ' + (
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                )
              }, item.text)
            )
          })
        )
      )
    )
  )
}

const root = createRoot(document.getElementById('app'))
root.render(createElement(App))

// Simple client-side navigation
document.addEventListener('click', (e) => {
  const link = e.target.closest('a')
  if (!link) return
  
  // Handle hash links (TOC) with smooth scroll
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
  
  // Handle internal navigation
  if (link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
    e.preventDefault()
    window.history.pushState({}, '', link.href)
    root.render(createElement(App))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
window.addEventListener('popstate', () => root.render(createElement(App)))
`;
      }
    },
  };
}

function createIndexHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = { darkMode: 'class' }
    </script>
    <style>
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
    </style>
  </head>
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div id="app"></div>
    <script type="module" src="/.revitedocs/entry.js"></script>
  </body>
</html>`;
}

export async function dev(root: string, options: DevOptions): Promise<void> {
  const resolvedRoot = path.resolve(root);

  console.log(`Starting dev server in ${resolvedRoot}...`);
  console.log(
    `Options: port=${options.port}, open=${options.open}, host=${options.host}`
  );

  // Load config
  const config = await loadConfig(resolvedRoot);

  // Write index.html to docs folder
  const indexPath = path.join(resolvedRoot, "index.html");
  const indexHtml = createIndexHtml(config.title);
  fs.writeFileSync(indexPath, indexHtml);

  // Resolve dependencies from revitedocs's installation location using Node's resolution
  // This works regardless of npm hoisting behavior
  const resolveDep = (dep: string) => {
    try {
      // Use require.resolve to get the actual path where the package is installed
      // Then get the package directory by going up from the resolved entry point
      const resolved = require.resolve(dep);
      // Find the package root by locating node_modules/package-name
      const nodeModulesIndex = resolved.lastIndexOf('node_modules');
      if (nodeModulesIndex === -1) {
        return resolved;
      }
      // Get everything up to and including the package name (handles scoped packages too)
      const afterNodeModules = resolved.slice(nodeModulesIndex + 'node_modules/'.length);
      const packageName = afterNodeModules.startsWith('@') 
        ? afterNodeModules.split('/').slice(0, 2).join('/')
        : afterNodeModules.split('/')[0];
      return resolved.slice(0, nodeModulesIndex + 'node_modules/'.length) + packageName;
    } catch {
      return dep; // Fall back to bare specifier if resolution fails
    }
  };
  
  const server = await createServer({
    root: resolvedRoot,
    plugins: [
      // MDX plugin must come before React plugin
      {
        enforce: 'pre',
        ...mdx({
          remarkPlugins: [
            remarkGfm, 
            remarkFrontmatter,
            remarkContainerDirectives,
            remarkMermaid,
          ],
          rehypePlugins: [rehypeSlug],
          providerImportSource: '@mdx-js/react',
        }),
      },
      react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
      revitedocsEntryPlugin(),
      revitedocsConfigPlugin(config),
      revitedocsRoutesPlugin(resolvedRoot),
      revitedocsSearchPlugin(resolvedRoot),
    ],
    server: {
      port: options.port,
      open: options.open,
      host: options.host,
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@mdx-js/react", "mermaid"],
    },
    resolve: {
      dedupe: ["react", "react-dom", "@mdx-js/react", "mermaid"],
      alias: {
        // Resolve React and other deps from revitedocs's installation using Node resolution
        'react': resolveDep('react'),
        'react-dom': resolveDep('react-dom'),
        '@mdx-js/react': resolveDep('@mdx-js/react'),
        'mermaid': resolveDep('mermaid'),
      },
    },
  });

  await server.listen();
  server.printUrls();

  // Cleanup on exit
  process.on("SIGINT", () => {
    try {
      fs.unlinkSync(indexPath);
    } catch { /* ignore cleanup errors */ }
    process.exit();
  });
}
