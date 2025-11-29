import type { Plugin } from 'vite'
import type { ResolvedConfig } from './config.js'

const VIRTUAL_CONFIG_ID = 'virtual:revitedocs/config'
const RESOLVED_VIRTUAL_CONFIG_ID = '\0' + VIRTUAL_CONFIG_ID

/**
 * Vite plugin that provides config via virtual module
 */
export function revitedocsConfigPlugin(config: ResolvedConfig): Plugin {
  return {
    name: 'revitedocs:config',
    
    resolveId(id) {
      if (id === VIRTUAL_CONFIG_ID) {
        return RESOLVED_VIRTUAL_CONFIG_ID
      }
    },
    
    load(id) {
      if (id === RESOLVED_VIRTUAL_CONFIG_ID) {
        // Export config as JSON (excluding root for security)
        const clientConfig = {
          title: config.title,
          description: config.description,
          base: config.base,
          theme: config.theme,
          versions: config.versions,
          defaultVersion: config.defaultVersion,
          locales: config.locales,
          defaultLocale: config.defaultLocale,
          llms: config.llms,
          search: config.search,
        }
        return `export default ${JSON.stringify(clientConfig, null, 2)}`
      }
    },
  }
}

