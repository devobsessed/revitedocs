import type { Plugin, ViteDevServer } from 'vite'
import {
  buildSearchIndex,
  generateSearchIndexModule,
  type SearchIndexData,
} from './search-index.js'

const VIRTUAL_MODULE_ID = 'virtual:revitedocs/search'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

/**
 * Vite plugin that provides search index as a virtual module
 * - In dev: builds index at startup, updates on file changes
 * - In build: pre-builds index for static output
 */
export function revitedocsSearchPlugin(rootDir: string): Plugin {
  let indexData: SearchIndexData | null = null
  let server: ViteDevServer | null = null

  async function rebuildIndex() {
    console.log('[revitedocs] Building search index...')
    const startTime = Date.now()
    indexData = await buildSearchIndex(rootDir)
    console.log(
      `[revitedocs] Search index built: ${indexData.documents.length} pages indexed in ${Date.now() - startTime}ms`
    )
    return indexData
  }

  return {
    name: 'revitedocs:search',

    async configureServer(_server) {
      server = _server

      // Build initial index
      await rebuildIndex()

      // Watch for markdown file changes
      server.watcher.on('change', async (file) => {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          await rebuildIndex()
          // Trigger HMR update for the virtual module
          const mod = server!.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
          if (mod) {
            server!.moduleGraph.invalidateModule(mod)
            server!.ws.send({
              type: 'full-reload',
              path: '*',
            })
          }
        }
      })

      server.watcher.on('add', async (file) => {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          await rebuildIndex()
        }
      })

      server.watcher.on('unlink', async (file) => {
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          await rebuildIndex()
        }
      })
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // Build index if not already built (for build mode)
        if (!indexData) {
          await rebuildIndex()
        }
        return generateSearchIndexModule(indexData!)
      }
    },
  }
}
