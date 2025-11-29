// Core exports
export { defineConfig, loadConfig, resolveConfig, formatConfigError } from './config.js'
export type {
  UserConfig,
  ResolvedConfig,
  NavItem,
  SidebarItem,
  SocialLink,
  LocaleConfig,
  ThemeConfig,
  LlmsConfig,
  SearchConfig,
} from './config.js'

// Markdown processing
export {
  transformMarkdown,
  extractFrontmatter,
  extractToc,
  createMarkdownProcessor,
} from './markdown.js'
export type { TocItem, Frontmatter, MarkdownResult } from './markdown.js'

// Remark plugins for custom syntax
export {
  remarkContainerDirectives,
  getDocComponentImports,
  isMermaidCodeBlock,
  transformMermaidToJsx,
} from './remark-plugins.js'

// Router
export { fileToUrlPath, generateRoutes, generateRouteModule } from './router.js'
export type { Route } from './router.js'

// Vite plugins
export { revitedocsConfigPlugin } from './vite-plugin.js'
export { revitedocsMarkdownPlugin } from './vite-plugin-markdown.js'
export { revitedocsRoutesPlugin } from './vite-plugin-routes.js'
export { revitedocsSearchPlugin } from './vite-plugin-search.js'
export { revitedocsSlotsPlugin, resolveThemeSlot, SLOT_COMPONENTS } from './vite-plugin-slots.js'
export type { SlotComponent, SlotResolution } from './vite-plugin-slots.js'

// Search index
export {
  buildSearchIndex,
  createSearchInstance,
  generateSearchIndexModule,
} from './search-index.js'
export type { SearchDocument, SearchIndexData } from './search-index.js'

// LLMs.txt generation
export { generateLlmsOverview, generateLlmsFull, generateLlmsTxt } from './llms.js'
export type { LlmsRoute } from './llms.js'
