import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Find the package root (where package.json is)
const findPackageRoot = () => {
  let dir = __dirname
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir
    }
    dir = path.dirname(dir)
  }
  return __dirname
}
const packageRoot = findPackageRoot()
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import { createServer, type Plugin } from 'vite'
import { loadConfig } from '../../core/config.js'
import { remarkContainerDirectives, remarkMermaid } from '../../core/remark-plugins.js'
import { revitedocsRoutesPlugin } from '../../core/vite-plugin-routes.js'
import { revitedocsSearchPlugin } from '../../core/vite-plugin-search.js'
import { revitedocsConfigPlugin } from '../../core/vite-plugin.js'

// Create require to resolve dependencies from revitedocs's location
const require = createRequire(import.meta.url)

export interface DevOptions {
  port: number
  open?: boolean
  host?: boolean
}

/**
 * Virtual entry point plugin - serves main.tsx
 */
function revitedocsEntryPlugin(): Plugin {
  return {
    name: 'revitedocs:entry',
    configureServer(server) {
      // Watch for new/deleted markdown files to regenerate routes
      server.watcher.on('add', (file) => {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          console.log(`\n📄 New file detected: ${path.basename(file)}`)
          server.restart()
        }
      })
      server.watcher.on('unlink', (file) => {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          console.log(`\n🗑️  File removed: ${path.basename(file)}`)
          server.restart()
        }
      })
    },
    resolveId(id) {
      if (id === '/.revitedocs/entry.js' || id.endsWith('.revitedocs/entry.js')) {
        return '\0revitedocs-entry'
      }
    },
    load(id) {
      if (id === '\0revitedocs-entry') {
        return `
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:revitedocs/routes'
import config from 'virtual:revitedocs/config'
import { search } from 'virtual:revitedocs/search'
import { DocsApp } from 'revitedocs/components'

// Import ReviteDocs theme CSS
import 'revitedocs/theme/globals.css'

// Render the app
const root = createRoot(document.getElementById('app'))
root.render(createElement(DocsApp, { routes, config, search }))

// Client-side navigation for hash links
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
    root.render(createElement(DocsApp, { routes, config, search }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

window.addEventListener('popstate', () => {
  root.render(createElement(DocsApp, { routes, config, search }))
})
`
      }
    },
  }
}

function createIndexHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script>
      // Set theme before page renders to prevent FOUC
      (function() {
        var theme = localStorage.getItem('revitedocs-theme');
        if (!theme) {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      })();
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
      .prose table, article table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
      .prose th, .prose td, article th, article td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
      .dark .prose th, .dark .prose td, .dark article th, .dark article td { border-color: #374151; }
      .prose th, article th { background: #f3f4f6; font-weight: 600; }
      .dark .prose th, .dark article th { background: #1f2937; }
      .prose tbody tr:nth-child(even), article tbody tr:nth-child(even) { background: rgba(243,244,246,0.5); }
      .dark .prose tbody tr:nth-child(even), .dark article tbody tr:nth-child(even) { background: rgba(31,41,55,0.5); }
      
    </style>
  </head>
  <body class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
    <div id="app"></div>
    <script type="module" src="/.revitedocs/entry.js"></script>
  </body>
</html>`
}

export async function dev(root: string, options: DevOptions): Promise<void> {
  const resolvedRoot = path.resolve(root)

  console.log(`Starting dev server in ${resolvedRoot}...`)
  console.log(`Options: port=${options.port}, open=${options.open}, host=${options.host}`)

  // Load config
  const config = await loadConfig(resolvedRoot)

  // Write index.html to docs folder
  const indexPath = path.join(resolvedRoot, 'index.html')
  const indexHtml = createIndexHtml(config.title)
  fs.writeFileSync(indexPath, indexHtml)

  // Resolve dependencies from revitedocs's installation location using Node's resolution
  // This works regardless of npm hoisting behavior
  const resolveDep = (dep: string) => {
    try {
      // Use require.resolve to get the actual path where the package is installed
      // Then get the package directory by going up from the resolved entry point
      const resolved = require.resolve(dep)
      // Find the package root by locating node_modules/package-name
      const nodeModulesIndex = resolved.lastIndexOf('node_modules')
      if (nodeModulesIndex === -1) {
        return resolved
      }
      // Get everything up to and including the package name (handles scoped packages too)
      const afterNodeModules = resolved.slice(nodeModulesIndex + 'node_modules/'.length)
      const packageName = afterNodeModules.startsWith('@')
        ? afterNodeModules.split('/').slice(0, 2).join('/')
        : afterNodeModules.split('/')[0]
      return resolved.slice(0, nodeModulesIndex + 'node_modules/'.length) + packageName
    } catch {
      return dep // Fall back to bare specifier if resolution fails
    }
  }

  const server = await createServer({
    root: resolvedRoot,
    plugins: [
      // Tailwind CSS v4 plugin
      tailwindcss(),
      // MDX plugin must come before React plugin
      {
        enforce: 'pre',
        ...mdx({
          remarkPlugins: [remarkGfm, remarkFrontmatter, remarkContainerDirectives, remarkMermaid],
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
      include: ['react', 'react-dom', '@mdx-js/react', 'mermaid'],
    },
    resolve: {
      dedupe: ['react', 'react-dom', '@mdx-js/react', 'mermaid'],
      alias: {
        // Resolve React and other deps from revitedocs's installation using Node resolution
        react: resolveDep('react'),
        'react-dom': resolveDep('react-dom'),
        '@mdx-js/react': resolveDep('@mdx-js/react'),
        mermaid: resolveDep('mermaid'),
        // In dev mode, use SOURCE files instead of built dist for HMR
        'revitedocs/components': path.join(packageRoot, 'src/components/index.ts'),
        'revitedocs/theme/globals.css': path.join(packageRoot, 'src/theme/globals.css'),
      },
    },
  })

  await server.listen()
  server.printUrls()

  // Cleanup on exit
  process.on('SIGINT', () => {
    try {
      fs.unlinkSync(indexPath)
    } catch {
      /* ignore cleanup errors */
    }
    process.exit()
  })
}
