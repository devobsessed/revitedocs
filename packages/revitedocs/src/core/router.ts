import fg from 'fast-glob'
import path from 'node:path'

export interface Route {
  path: string
  file: string
  version?: string
  locale?: string
}

/**
 * Check if a folder name represents a version (e.g., v1, v2, v1.0, v2.3.1)
 */
export function isVersionFolder(folderName: string): boolean {
  // Match v followed by a number, optionally with dots and more numbers
  return /^v\d+(\.\d+)*$/i.test(folderName)
}

/**
 * Extract version from a file path if it starts with a version folder
 * Returns null if no version folder is found at the root level
 */
export function detectVersionFromPath(filePath: string): string | null {
  const parts = filePath.split('/')
  if (parts.length > 0 && isVersionFolder(parts[0])) {
    return parts[0]
  }
  return null
}

/**
 * Check if a folder name represents a locale (2-letter ISO code like en, ja, zh)
 * Also supports extended codes like en-US, zh-CN
 */
export function isLocaleFolder(folderName: string): boolean {
  // Match 2-letter code or 2-letter + region (e.g., en, ja, en-US, zh-CN)
  return /^[a-z]{2}(-[A-Z]{2})?$/i.test(folderName)
}

/**
 * Extract locale from a file path if it starts with a locale folder
 * Returns null if no locale folder is found at the root level
 */
export function detectLocaleFromPath(filePath: string): string | null {
  const parts = filePath.split('/')
  if (parts.length > 0 && isLocaleFolder(parts[0])) {
    return parts[0]
  }
  return null
}

/**
 * Convert a file path to a URL path
 *
 * Examples:
 * - guide.md → /guide
 * - guide/intro.md → /guide/intro
 * - index.md → /
 * - guide/index.md → /guide/
 * - README.md → /
 */
export function fileToUrlPath(filePath: string): string {
  let urlPath = filePath
    // Remove .md or .mdx extension
    .replace(/\.mdx?$/, '')
    // Handle README as index
    .replace(/README$/i, 'index')

  // Ensure leading slash first
  if (!urlPath.startsWith('/')) {
    urlPath = '/' + urlPath
  }

  // Handle index files - they map to directory paths
  if (urlPath === '/index') {
    return '/'
  }

  if (urlPath.endsWith('/index')) {
    return urlPath.replace(/index$/, '')
  }

  return urlPath
}

/**
 * Discover markdown files and generate route definitions
 */
export async function generateRoutes(root: string): Promise<Route[]> {
  const files = await fg(['**/*.md', '**/*.mdx'], {
    cwd: root,
    ignore: ['.revitedocs/**', 'node_modules/**', '**/_*'],
  })

  return files
    .filter((file) => !path.basename(file).startsWith('_'))
    .map((file) => {
      const version = detectVersionFromPath(file)
      const locale = detectLocaleFromPath(file)
      const route: Route = {
        path: fileToUrlPath(file),
        file: path.join(root, file),
      }
      if (version) {
        route.version = version
      }
      if (locale) {
        route.locale = locale
      }
      return route
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Generate a JavaScript module that exports route definitions
 */
export function generateRouteModule(routes: Route[]): string {
  if (routes.length === 0) {
    return `export const routes = [];`
  }

  const imports = routes
    .map((route, index) => {
      // MDX plugin may not export frontmatter/toc, use * import to get all exports
      return `import * as mod${index} from '${route.file}';`
    })
    .join('\n')

  const routeObjects = routes
    .map((route, index) => {
      return `  {
    path: '${route.path}',
    element: mod${index}.default,
    frontmatter: mod${index}.frontmatter || {},
    toc: mod${index}.toc || [],
  }`
    })
    .join(',\n')

  return `${imports}

export const routes = [
${routeObjects}
];`
}
