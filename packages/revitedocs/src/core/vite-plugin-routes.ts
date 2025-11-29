import type { Plugin } from 'vite'
import fs from 'node:fs'
import { generateRoutes } from './router.js'
import { extractFrontmatter, extractToc } from './markdown.js'

const VIRTUAL_ROUTES_ID = 'virtual:revitedocs/routes'
const RESOLVED_VIRTUAL_ROUTES_ID = '\0' + VIRTUAL_ROUTES_ID

/**
 * Generate route module that includes frontmatter, toc, rawMarkdown, version, and locale extracted from files
 */
function generateRouteModuleWithMeta(
  routes: Array<{ path: string; file: string; version?: string; locale?: string }>
): string {
  if (routes.length === 0) {
    return `export const routes = [];`
  }

  // Extract frontmatter, toc, and raw content from each file
  const routeData = routes.map((route, index) => {
    try {
      const content = fs.readFileSync(route.file, 'utf-8')
      const { frontmatter, content: markdownContent } = extractFrontmatter(content)
      const toc = extractToc(markdownContent)
      return { ...route, index, frontmatter, toc, rawMarkdown: content }
    } catch {
      return { ...route, index, frontmatter: {}, toc: [], rawMarkdown: '' }
    }
  })

  const imports = routeData.map((r) => `import Page${r.index} from '${r.file}';`).join('\n')

  const routeObjects = routeData
    .map((r) => {
      const optionalFields = [
        r.version ? `version: '${r.version}'` : null,
        r.locale ? `locale: '${r.locale}'` : null,
      ].filter(Boolean)

      return `  {
    path: '${r.path}',
    element: Page${r.index},
    frontmatter: ${JSON.stringify(r.frontmatter)},
    toc: ${JSON.stringify(r.toc)},
    rawMarkdown: ${JSON.stringify(r.rawMarkdown)},${optionalFields.length > 0 ? '\n    ' + optionalFields.join(',\n    ') + ',' : ''}
  }`
    })
    .join(',\n')

  return `${imports}

export const routes = [
${routeObjects}
];`
}

/**
 * Vite plugin that generates routes from markdown files
 */
export function revitedocsRoutesPlugin(root: string): Plugin {
  return {
    name: 'revitedocs:routes',

    resolveId(id) {
      if (id === VIRTUAL_ROUTES_ID) {
        return RESOLVED_VIRTUAL_ROUTES_ID
      }
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_ROUTES_ID) {
        const routes = await generateRoutes(root)
        return generateRouteModuleWithMeta(routes)
      }
    },
  }
}
