// Layout components
export { Layout, type LayoutProps } from './layout/Layout.js'
export { Header, type HeaderProps, type NavItem } from './layout/Header.js'
export {
  Sidebar,
  type SidebarProps,
  type SidebarSection,
  type SidebarItem,
} from './layout/Sidebar.js'
export {
  TableOfContents,
  type TableOfContentsProps,
  type TocItem,
} from './layout/TableOfContents.js'
export { PageWrapper, type PageWrapperProps } from './layout/PageWrapper.js'
export {
  VersionSwitcher,
  stripVersionFromPath,
  addVersionToPath,
  type VersionSwitcherProps,
} from './layout/VersionSwitcher.js'
export {
  LanguageSwitcher,
  stripLocaleFromPath,
  addLocaleToPath,
  type LanguageSwitcherProps,
  type LocaleConfig,
} from './layout/LanguageSwitcher.js'

// Doc components
export { CodeBlock, type CodeBlockProps } from './docs/index.js'
export { Callout, type CalloutProps, type CalloutVariant } from './docs/index.js'
export { Tabs, TabGroup, type TabsProps, type TabGroupProps, type TabItem } from './docs/index.js'
export { Steps, Step, type StepsProps, type StepProps } from './docs/index.js'
export { Card, CardGroup, type CardProps, type CardGroupProps } from './docs/index.js'
export { FileTree, type FileTreeProps, type FileTreeItem } from './docs/index.js'
export {
  Badge,
  VersionBadge,
  StatusBadge,
  type BadgeProps,
  type BadgeVariant,
  type VersionBadgeProps,
  type StatusBadgeProps,
} from './docs/index.js'
export { MermaidDiagram, type MermaidDiagramProps } from './docs/index.js'
export { CopyMarkdownButton, type CopyMarkdownButtonProps } from './docs/index.js'

// Hooks
export { useTheme, type Theme, type UseThemeReturn } from './hooks/useTheme.js'
export { useScrollSpy } from './hooks/useScrollSpy.js'

// Search components
export {
  SearchModal,
  SearchProvider,
  useSearch,
  usePagefind,
  loadPagefind,
  searchWithPagefind,
  isPagefindAvailable,
  highlightMatches,
  setSearchFunction,
  type SearchModalProps,
  type SearchResult,
  type SearchContextValue,
  type SearchProviderProps,
  type UsePagefindReturn,
} from './search/index.js'

// App component
export {
  DocsApp,
  DocsAppSSR,
  type DocsAppProps,
  type DocsConfig,
  type RouteInfo,
  type SearchFn,
} from './app/index.js'

// shadcn/ui primitives
export * from './ui/index.js'

// Utilities
export { cn } from './utils.js'
