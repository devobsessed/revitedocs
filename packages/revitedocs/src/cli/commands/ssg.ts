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
 * Create the build index.html that references entry files
 */
function createBuildIndexHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="./entry-client.js"></script>
  </body>
</html>`;
}

/**
 * Create CSS entry file with Tailwind source configuration
 * Writes to physical file so Tailwind can scan for classes
 */
function writeCssEntry(revitedocsDir: string): string {
  const cssContent = `@import "tailwindcss";
@source "./entry-client.js";
@source "../../packages/revitedocs/src/**/*.tsx";
@source "../../packages/revitedocs/dist/**/*.js";

/* Enable class-based dark mode for Tailwind v4 */
@custom-variant dark (&:where(.dark, .dark *));

/* ============================================================================
   Essential Layout Utilities (for SSG builds)
   ============================================================================ */

/* Display */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.hidden { display: none; }
.block { display: block; }
.grid { display: grid; }

/* Flexbox */
.flex-1 { flex: 1 1 0%; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }

/* Position */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.top-14 { top: 3.5rem; }
.top-16 { top: 4rem; }
.left-0 { left: 0; }
.right-4 { right: 1rem; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
.inset-0 { inset: 0; }

/* Sizing */
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-8 { height: 2rem; }
.h-9 { height: 2.25rem; }
.h-14 { height: 3.5rem; }
.h-\\[calc\\(100vh-3\\.5rem\\)\\] { height: calc(100vh - 3.5rem); }
.w-4 { width: 1rem; }
.w-5 { width: 1.25rem; }
.w-8 { width: 2rem; }
.w-9 { width: 2.25rem; }
.w-52 { width: 13rem; }
.w-64 { width: 16rem; }
.w-full { width: 100%; }
.min-h-screen { min-height: 100vh; }
.min-w-0 { min-width: 0; }
.max-w-none { max-width: none; }
.max-h-\\[calc\\(100vh-5rem\\)\\] { max-height: calc(100vh - 5rem); }

/* Spacing */
.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }
.px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.pt-6 { padding-top: 1.5rem; }
.pl-3 { padding-left: 0.75rem; }
.m-0 { margin: 0; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.ml-4 { margin-left: 1rem; }
.mr-2 { margin-right: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.-ml-px { margin-left: -1px; }

/* Typography */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.whitespace-nowrap { white-space: nowrap; }

/* Borders */
.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-l { border-left-width: 1px; }
.border-r { border-right-width: 1px; }
.border-transparent { border-color: transparent; }
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }

/* Effects */
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.backdrop-blur { backdrop-filter: blur(8px); }
.backdrop-blur-sm { backdrop-filter: blur(4px); }
.overflow-y-auto { overflow-y: auto; }
.overflow-x-auto { overflow-x: auto; }
.transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }

/* Responsive - md (768px) */
@media (min-width: 768px) {
  .md\\:flex { display: flex; }
  .md\\:block { display: block; }
  .md\\:hidden { display: none; }
  .md\\:inline { display: inline; }
  .md\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .md\\:ml-64 { margin-left: 16rem; }
}

/* Responsive - lg (1024px) */
@media (min-width: 1024px) {
  .lg\\:block { display: block; }
  .lg\\:hidden { display: none; }
  .lg\\:mr-56 { margin-right: 14rem; }
}

/* Responsive - sm (640px) */
@media (min-width: 640px) {
  .sm\\:inline { display: inline; }
}

/* Special classes */
.not-prose { --tw-prose-body: initial; --tw-prose-headings: initial; }
.\\[\\&_svg\\]\\:pointer-events-none svg { pointer-events: none; }
.\\[\\&_svg\\]\\:size-4 svg { width: 1rem; height: 1rem; }
.\\[\\&_svg\\]\\:shrink-0 svg { flex-shrink: 0; }
.disabled\\:pointer-events-none:disabled { pointer-events: none; }
.disabled\\:opacity-50:disabled { opacity: 0.5; }
.focus-visible\\:outline-none:focus-visible { outline: none; }
.focus-visible\\:ring-1:focus-visible { box-shadow: 0 0 0 1px var(--tw-ring-color); }

/* ============================================================================
   shadcn/ui CSS Variables
   ============================================================================ */

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 4%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 4%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 0 0% 96%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 0 0% 4%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 4%;
  --foreground: 0 0% 98%;
  --card: 0 0% 4%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 7%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 15%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 64%;
  --accent: 0 0% 15%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 18%;
  --input: 0 0% 18%;
  --ring: 0 0% 83%;
}

/* ============================================================================
   shadcn/ui Utility Classes
   ============================================================================ */

/* Background utilities */
.bg-background { background-color: hsl(var(--background)); }
.bg-foreground { background-color: hsl(var(--foreground)); }
.bg-card { background-color: hsl(var(--card)); }
.bg-popover { background-color: hsl(var(--popover)); }
.bg-primary { background-color: hsl(var(--primary)); }
.bg-secondary { background-color: hsl(var(--secondary)); }
.bg-muted { background-color: hsl(var(--muted)); }
.bg-accent { background-color: hsl(var(--accent)); }
.bg-destructive { background-color: hsl(var(--destructive)); }

.bg-background\\/60 { background-color: hsl(var(--background) / 0.6); }
.bg-background\\/80 { background-color: hsl(var(--background) / 0.8); }
.bg-background\\/95 { background-color: hsl(var(--background) / 0.95); }
.bg-primary\\/10 { background-color: hsl(var(--primary) / 0.1); }
.bg-primary\\/20 { background-color: hsl(var(--primary) / 0.2); }

/* Text utilities */
.text-foreground { color: hsl(var(--foreground)); }
.text-background { color: hsl(var(--background)); }
.text-card-foreground { color: hsl(var(--card-foreground)); }
.text-popover-foreground { color: hsl(var(--popover-foreground)); }
.text-primary { color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
.text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.text-accent-foreground { color: hsl(var(--accent-foreground)); }
.text-destructive { color: hsl(var(--destructive)); }
.text-destructive-foreground { color: hsl(var(--destructive-foreground)); }

/* Border utilities */
.border-border { border-color: hsl(var(--border)); }
.border-input { border-color: hsl(var(--input)); }
.border-primary { border-color: hsl(var(--primary)); }
.border-destructive { border-color: hsl(var(--destructive)); }

/* Ring utilities */
.ring-ring { --tw-ring-color: hsl(var(--ring)); }
.ring-offset-background { --tw-ring-offset-color: hsl(var(--background)); }

/* Hover states */
.hover\\:bg-accent:hover { background-color: hsl(var(--accent)); }
.hover\\:bg-muted:hover { background-color: hsl(var(--muted)); }
.hover\\:bg-primary:hover { background-color: hsl(var(--primary)); }
.hover\\:bg-secondary:hover { background-color: hsl(var(--secondary)); }
.hover\\:bg-destructive:hover { background-color: hsl(var(--destructive)); }
.hover\\:text-foreground:hover { color: hsl(var(--foreground)); }
.hover\\:text-accent-foreground:hover { color: hsl(var(--accent-foreground)); }
.hover\\:text-primary:hover { color: hsl(var(--primary)); }

/* Focus states */
.focus\\:ring-ring:focus { --tw-ring-color: hsl(var(--ring)); }
.focus-visible\\:ring-ring:focus-visible { --tw-ring-color: hsl(var(--ring)); }

/* Data state variants (for Radix UI) */
[data-state="open"].data-\\[state\\=open\\]\\:bg-accent { background-color: hsl(var(--accent)); }
[data-state="open"].data-\\[state\\=open\\]\\:text-muted-foreground { color: hsl(var(--muted-foreground)); }

/* ============================================================================
   Zinc color utilities (explicit for SSG builds)
   ============================================================================ */

/* White backgrounds (base) */
.bg-white { background-color: rgb(255 255 255); }
.bg-white\\/95 { background-color: rgb(255 255 255 / 0.95); }
.bg-white\\/80 { background-color: rgb(255 255 255 / 0.80); }
.bg-white\\/60 { background-color: rgb(255 255 255 / 0.60); }
@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))) {
  .supports-\\[backdrop-filter\\]\\:bg-white\\/60 { background-color: rgb(255 255 255 / 0.60); }
}

/* Zinc backgrounds */
.bg-zinc-50 { background-color: rgb(250 250 250); }
.bg-zinc-100 { background-color: rgb(244 244 245); }
.bg-zinc-200 { background-color: rgb(228 228 231); }
.bg-zinc-700 { background-color: rgb(63 63 70); }
.bg-zinc-800 { background-color: rgb(39 39 42); }
.bg-zinc-900 { background-color: rgb(24 24 27); }
.bg-zinc-950 { background-color: rgb(9 9 11); }

/* White text */
.text-white { color: rgb(255 255 255); }

/* Zinc text */
.text-zinc-50 { color: rgb(250 250 250); }
.text-zinc-100 { color: rgb(244 244 245); }
.text-zinc-400 { color: rgb(161 161 170); }
.text-zinc-500 { color: rgb(113 113 122); }
.text-zinc-600 { color: rgb(82 82 91); }
.text-zinc-900 { color: rgb(24 24 27); }

/* Zinc borders */
.border-zinc-200 { border-color: rgb(228 228 231); }
.border-zinc-700 { border-color: rgb(63 63 70); }
.border-zinc-800 { border-color: rgb(39 39 42); }

/* Dark mode zinc variants */
.dark\\:bg-zinc-100:is(.dark *) { background-color: rgb(244 244 245); }
.dark\\:bg-zinc-700:is(.dark *) { background-color: rgb(63 63 70); }
.dark\\:bg-zinc-800:is(.dark *) { background-color: rgb(39 39 42); }
.dark\\:bg-zinc-900:is(.dark *) { background-color: rgb(24 24 27); }
.dark\\:bg-zinc-950:is(.dark *) { background-color: rgb(9 9 11); }
.dark\\:bg-zinc-950\\/95:is(.dark *) { background-color: rgb(9 9 11 / 0.95); }
.dark\\:bg-zinc-950\\/80:is(.dark *) { background-color: rgb(9 9 11 / 0.80); }
.dark\\:text-zinc-50:is(.dark *) { color: rgb(250 250 250); }
.dark\\:text-zinc-100:is(.dark *) { color: rgb(244 244 245); }
.dark\\:text-zinc-400:is(.dark *) { color: rgb(161 161 170); }
.dark\\:text-zinc-900:is(.dark *) { color: rgb(24 24 27); }
.dark\\:border-zinc-700:is(.dark *) { border-color: rgb(63 63 70); }
.dark\\:border-zinc-800:is(.dark *) { border-color: rgb(39 39 42); }

/* Hover states for zinc */
.hover\\:bg-zinc-100:hover { background-color: rgb(244 244 245); }
.hover\\:bg-zinc-800:hover { background-color: rgb(39 39 42); }
.dark\\:hover\\:bg-zinc-800:is(.dark *):hover { background-color: rgb(39 39 42); }
.hover\\:text-zinc-900:hover { color: rgb(24 24 27); }
.dark\\:hover\\:text-zinc-100:is(.dark *):hover { color: rgb(244 244 245); }

/* Green for copy button success state */
.bg-green-500 { background-color: rgb(34 197 94); }
.hover\\:bg-green-600:hover { background-color: rgb(22 163 74); }

/* Backdrop filter support */
.bg-zinc-50\\/95 { background-color: rgb(250 250 250 / 0.95); }
.bg-zinc-50\\/60 { background-color: rgb(250 250 250 / 0.6); }
.dark\\:bg-zinc-950\\/60:is(.dark *) { background-color: rgb(9 9 11 / 0.6); }
@supports (backdrop-filter: blur(0)) {
  .supports-\\[backdrop-filter\\]\\:bg-zinc-50\\/60 { background-color: rgb(250 250 250 / 0.6); }
  .dark\\:supports-\\[backdrop-filter\\]\\:bg-zinc-950\\/60:is(.dark *) { background-color: rgb(9 9 11 / 0.6); }
}

/* ============================================================================
   Prose styles for markdown content 
   ============================================================================ */
.prose h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); }
.prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.5rem; color: hsl(var(--foreground)); }
.prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
.prose p { margin-bottom: 1rem; line-height: 1.7; }
.prose pre { background: hsl(var(--muted)); color: hsl(var(--foreground)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
.prose code { font-family: ui-monospace, monospace; font-size: 0.875rem; }
.prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose li { margin-bottom: 0.25rem; }
.prose a { color: hsl(var(--primary)); }
.prose a:hover { text-decoration: underline; }
.prose strong { font-weight: 600; }
.prose blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); margin: 1rem 0; }
`;
  const cssPath = path.join(revitedocsDir, "styles.css");
  fs.writeFileSync(cssPath, cssContent);
  return cssPath;
}

/**
 * Write client entry code to a physical file for Tailwind to scan
 */
function writeClientEntry(revitedocsDir: string): string {
  const entryPath = path.join(revitedocsDir, "entry-client.js");
  fs.writeFileSync(entryPath, generateClientEntryCode());
  return entryPath;
}

/**
 * Generate client entry code for hydration
 */
function generateClientEntryCode(): string {
  return `
import './styles.css'
import { createElement } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { routes } from 'virtual:revitedocs/routes'
import config from 'virtual:revitedocs/config'
import { search } from 'virtual:revitedocs/search'
import { DocsApp } from 'revitedocs/components'

// Hydrate or mount the app
const container = document.getElementById('app')
if (container.innerHTML.trim()) {
  // Hydrate SSR content
  hydrateRoot(container, createElement(DocsApp, { routes, config, search }))
} else {
  // Client-only render
  createRoot(container).render(createElement(DocsApp, { routes, config, search }))
}

// Client-side navigation for hash links
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
      results.results.slice(0, 10).map(async (r, i) => {
        const data = await r.data()
        return {
          id: data.url || String(i),
          title: data.meta?.title || data.url,
          description: data.excerpt || '',
          url: data.url,
          score: r.score || 1,
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
 * Uses static HTML structure for SSR (no React hooks)
 */
function generateServerEntryCode(): string {
  return `
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MDXProvider } from '@mdx-js/react'
import { routes } from 'virtual:revitedocs/routes'
import config from 'virtual:revitedocs/config'
import { Callout, MermaidDiagram, TabGroup, Steps, Step, FileTree, CopyMarkdownButton } from 'revitedocs/components'

// MDX components mapping
const mdxComponents = {
  Callout,
  MermaidDiagram,
  TabGroup,
  Steps,
  Step,
  FileTree,
}

// Get sidebar for path
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
  const sidebarSections = getSidebarForPath(routePath, config.theme?.sidebar)
  
  // Build static HTML structure for SSR - MUST match DocsApp.tsx exactly to avoid hydration errors
  const appHtml = renderToString(
    createElement('div', { className: 'min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100' },
      // Header - matches DocsApp.tsx
      createElement('header', { 
        className: 'sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60'
      },
        createElement('div', { className: 'flex h-14 items-center px-4 md:px-6' },
          createElement('div', { className: 'flex items-center gap-2' },
            createElement('div', { 
              className: 'h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold'
            }, config.title?.[0] || 'D'),
            createElement('span', { className: 'font-semibold hidden sm:inline' }, config.title || 'Documentation')
          ),
          createElement('div', { className: 'flex-1' }),
          // Search button placeholder
          createElement('button', {
            className: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 h-8 px-3 mr-2 text-zinc-500 dark:text-zinc-400'
          },
            createElement('svg', { className: 'h-4 w-4 mr-2', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
            ),
            createElement('span', { className: 'hidden md:inline' }, 'Search...'),
            createElement('kbd', { className: 'hidden md:inline ml-4 px-1.5 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700' }, '⌘K')
          ),
          // Theme toggle placeholder
          createElement('button', {
            className: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 w-9'
          },
            createElement('svg', { className: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' })
            )
          ),
          // Nav links
          createElement('nav', { className: 'hidden md:flex items-center gap-4 ml-4' },
            ...(config.theme?.nav || []).map((item, i) => 
              createElement('a', { 
                key: i,
                href: item.link, 
                className: 'text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors'
              }, item.text)
            )
          )
        )
      ),
      // Main layout
      createElement('div', { className: 'flex' },
        // Sidebar - matches DocsApp.tsx
        createElement('aside', { 
          className: 'hidden md:block fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-y-auto'
        },
          createElement('nav', { className: 'p-4 pt-6 space-y-6' },
            ...sidebarSections.map((section, i) => 
              createElement('div', { key: i },
                createElement('h3', { 
                  className: 'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400'
                }, section.text),
                createElement('div', { className: 'space-y-1' },
                  ...(section.items || []).map((item, j) =>
                    createElement('a', {
                      key: j,
                      href: item.link,
                      className: 'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ' + 
                        (routePath === item.link ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400')
                    }, item.text)
                  )
                )
              )
            )
          )
        ),
        // Content - matches DocsApp.tsx
        createElement('main', { 
          className: 'flex-1 min-w-0 px-4 md:px-8 py-8 md:ml-64 bg-white dark:bg-zinc-950 ' + (route.toc?.length > 0 ? 'lg:mr-56' : '')
        },
          createElement('article', { className: 'prose dark:prose-invert max-w-none' },
            // Page header
            (route.frontmatter?.title || route.rawMarkdown) && createElement('div', {
              className: 'flex items-start justify-between gap-4 mb-4 not-prose'
            },
              route.frontmatter?.title 
                ? createElement('h1', { 
                    className: 'text-3xl font-bold tracking-tight m-0'
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
        // TOC - matches DocsApp.tsx
        route.toc?.length > 0 && createElement('aside', {
          className: 'hidden lg:block fixed right-4 top-16 w-52 max-h-[calc(100vh-5rem)] overflow-y-auto py-4'
        },
          createElement('p', { className: 'text-sm font-semibold mb-3' }, 'On this page'),
          createElement('ul', { className: 'space-y-2 text-sm border-l border-zinc-200 dark:border-zinc-800' },
            ...route.toc.map((item, i) =>
              createElement('li', { key: i, className: 'pl-3 -ml-px' },
                createElement('a', {
                  href: '#' + item.id,
                  className: 'block transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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

  // Inline script to set theme before page renders (prevents FOUC)
  const themeScript = `<script>
(function() {
  var theme = localStorage.getItem('revitedocs-theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
</script>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${base}${route.path}">
    ${styleTags}
    ${themeScript}
  </head>
  <body class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
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

  // Write build files to .revitedocs folder
  const indexPath = path.join(revitedocsDir, "index.html");
  const buildIndexHtml = createBuildIndexHtml(config.title);
  fs.writeFileSync(indexPath, buildIndexHtml);

  // Write client entry to physical file for Tailwind to scan
  writeClientEntry(revitedocsDir);

  // Write CSS entry with @source pointing to client entry
  writeCssEntry(revitedocsDir);

  try {
    // Step 1: Build client bundle
    console.log(pc.dim("  Building client bundle..."));
    await viteBuild({
      root: revitedocsDir,
      base,
      plugins: [
        tailwindcss(),
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
    // Remove the temporary build files from .revitedocs
    try {
      fs.unlinkSync(indexPath);
      fs.unlinkSync(path.join(revitedocsDir, "entry-client.js"));
      fs.unlinkSync(path.join(revitedocsDir, "styles.css"));
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
