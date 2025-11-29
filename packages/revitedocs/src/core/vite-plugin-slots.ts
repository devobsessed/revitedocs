import type { Plugin, ViteDevServer } from 'vite'
import type { ResolvedConfig } from './config.js'
import path from 'node:path'
import fs from 'node:fs'

/**
 * Valid slot component names that can be overridden
 */
export const SLOT_COMPONENTS = ['Header', 'Footer', 'Sidebar', 'Layout', 'NotFound'] as const
export type SlotComponent = (typeof SLOT_COMPONENTS)[number]

const VIRTUAL_SLOT_PREFIX = 'virtual:revitedocs/theme/'
const RESOLVED_SLOT_PREFIX = '\0' + VIRTUAL_SLOT_PREFIX

/**
 * Map of slot names to their default exports from revitedocs/components
 */
const DEFAULT_EXPORTS: Record<SlotComponent, string | null> = {
  Header: 'Header',
  Sidebar: 'Sidebar',
  Layout: 'Layout',
  Footer: null, // No default Footer component
  NotFound: null, // No default NotFound component
}

export interface SlotResolution {
  isCustom: boolean
  path?: string
  defaultExport?: string
}

/**
 * Resolve a theme slot to either a custom user file or the default component
 */
export function resolveThemeSlot(component: SlotComponent, root: string): SlotResolution {
  // Check for custom component in .revitedocs/theme/
  const extensions = ['.tsx', '.jsx', '.ts', '.js']

  for (const ext of extensions) {
    const customPath = path.join(root, '.revitedocs', 'theme', `${component}${ext}`)
    if (fs.existsSync(customPath)) {
      return {
        isCustom: true,
        path: customPath,
      }
    }
  }

  // Fall back to default component
  return {
    isCustom: false,
    defaultExport: DEFAULT_EXPORTS[component] ?? undefined,
  }
}

/**
 * Generate the module code for a slot
 */
function generateSlotModule(resolution: SlotResolution, component: SlotComponent): string {
  if (resolution.isCustom && resolution.path) {
    // Export the user's custom component
    return `export { default } from '${resolution.path}'`
  }

  if (resolution.defaultExport) {
    // Export the default component from revitedocs/components
    return `export { ${resolution.defaultExport} as default } from 'revitedocs/components'`
  }

  // No default available - export empty component
  return `
import { createElement } from 'react'
export default function ${component}() {
  return null
}
`.trim()
}

/**
 * Check if a component name is a valid slot
 */
function isValidSlot(component: string): component is SlotComponent {
  return SLOT_COMPONENTS.includes(component as SlotComponent)
}

/**
 * Vite plugin that provides theme slot resolution via virtual modules
 *
 * Allows users to override layout components by placing files in:
 * .revitedocs/theme/Header.tsx
 * .revitedocs/theme/Footer.tsx
 * .revitedocs/theme/Sidebar.tsx
 * .revitedocs/theme/Layout.tsx
 * .revitedocs/theme/NotFound.tsx
 */
export function revitedocsSlotsPlugin(config: ResolvedConfig): Plugin {
  return {
    name: 'revitedocs:theme-slots',

    resolveId(id) {
      if (id.startsWith(VIRTUAL_SLOT_PREFIX)) {
        const component = id.slice(VIRTUAL_SLOT_PREFIX.length)
        if (isValidSlot(component)) {
          return RESOLVED_SLOT_PREFIX + component
        }
      }
    },

    async load(id) {
      if (id.startsWith(RESOLVED_SLOT_PREFIX)) {
        const component = id.slice(RESOLVED_SLOT_PREFIX.length) as SlotComponent
        const resolution = resolveThemeSlot(component, config.root)
        return generateSlotModule(resolution, component)
      }
    },

    /**
     * Watch theme directory for changes and trigger HMR
     */
    configureServer(server) {
      const themeDir = path.join(config.root, '.revitedocs', 'theme')

      // Watch for file additions/deletions in theme directory
      server.watcher.add(themeDir)

      server.watcher.on('add', (file) => {
        if (file.startsWith(themeDir)) {
          invalidateSlotModules(server, file)
        }
      })

      server.watcher.on('unlink', (file) => {
        if (file.startsWith(themeDir)) {
          invalidateSlotModules(server, file)
        }
      })

      server.watcher.on('change', (file) => {
        if (file.startsWith(themeDir)) {
          invalidateSlotModules(server, file)
        }
      })
    },
  }
}

/**
 * Invalidate slot virtual modules when theme files change
 */
function invalidateSlotModules(server: ViteDevServer, file: string) {
  const fileName = path.basename(file, path.extname(file))

  if (isValidSlot(fileName)) {
    const moduleId = RESOLVED_SLOT_PREFIX + fileName
    const mod = server.moduleGraph.getModuleById(moduleId)

    if (mod) {
      server.moduleGraph.invalidateModule(mod)
      server.ws.send({
        type: 'full-reload',
        path: '*',
      })
    }
  }
}
