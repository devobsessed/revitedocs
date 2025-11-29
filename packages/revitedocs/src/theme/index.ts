/**
 * ReviteDocs Theme System
 * 
 * CSS Variables schema for customizing colors, typography, and layout.
 * Users can override these in their custom CSS or extend via Tailwind config.
 */

// ============================================================================
// CSS Variable Names (type-safe keys)
// ============================================================================

export const CSS_VAR_PREFIX = '--rd' as const

/** Color CSS variable names */
export const colorVars = {
  // Core colors
  primary: `${CSS_VAR_PREFIX}-color-primary`,
  primaryForeground: `${CSS_VAR_PREFIX}-color-primary-foreground`,
  background: `${CSS_VAR_PREFIX}-color-background`,
  foreground: `${CSS_VAR_PREFIX}-color-foreground`,
  muted: `${CSS_VAR_PREFIX}-color-muted`,
  mutedForeground: `${CSS_VAR_PREFIX}-color-muted-foreground`,
  border: `${CSS_VAR_PREFIX}-color-border`,
  accent: `${CSS_VAR_PREFIX}-color-accent`,
  accentForeground: `${CSS_VAR_PREFIX}-color-accent-foreground`,
  
  // Semantic colors
  info: `${CSS_VAR_PREFIX}-color-info`,
  infoForeground: `${CSS_VAR_PREFIX}-color-info-foreground`,
  warning: `${CSS_VAR_PREFIX}-color-warning`,
  warningForeground: `${CSS_VAR_PREFIX}-color-warning-foreground`,
  error: `${CSS_VAR_PREFIX}-color-error`,
  errorForeground: `${CSS_VAR_PREFIX}-color-error-foreground`,
  success: `${CSS_VAR_PREFIX}-color-success`,
  successForeground: `${CSS_VAR_PREFIX}-color-success-foreground`,
  
  // Component-specific
  sidebarBackground: `${CSS_VAR_PREFIX}-color-sidebar-bg`,
  sidebarForeground: `${CSS_VAR_PREFIX}-color-sidebar-fg`,
  sidebarBorder: `${CSS_VAR_PREFIX}-color-sidebar-border`,
  headerBackground: `${CSS_VAR_PREFIX}-color-header-bg`,
  headerForeground: `${CSS_VAR_PREFIX}-color-header-fg`,
  headerBorder: `${CSS_VAR_PREFIX}-color-header-border`,
  codeBackground: `${CSS_VAR_PREFIX}-color-code-bg`,
  codeForeground: `${CSS_VAR_PREFIX}-color-code-fg`,
} as const

/** Layout CSS variable names */
export const layoutVars = {
  sidebarWidth: `${CSS_VAR_PREFIX}-sidebar-width`,
  tocWidth: `${CSS_VAR_PREFIX}-toc-width`,
  contentMaxWidth: `${CSS_VAR_PREFIX}-content-max-width`,
  headerHeight: `${CSS_VAR_PREFIX}-header-height`,
} as const

/** Typography CSS variable names */
export const typographyVars = {
  fontSans: `${CSS_VAR_PREFIX}-font-sans`,
  fontMono: `${CSS_VAR_PREFIX}-font-mono`,
  fontSizeBase: `${CSS_VAR_PREFIX}-font-size-base`,
  fontSizeSm: `${CSS_VAR_PREFIX}-font-size-sm`,
  fontSizeLg: `${CSS_VAR_PREFIX}-font-size-lg`,
  lineHeightBase: `${CSS_VAR_PREFIX}-line-height-base`,
} as const

/** Border radius CSS variable names */
export const radiusVars = {
  sm: `${CSS_VAR_PREFIX}-radius-sm`,
  md: `${CSS_VAR_PREFIX}-radius-md`,
  lg: `${CSS_VAR_PREFIX}-radius-lg`,
} as const

// ============================================================================
// Type Definitions
// ============================================================================

export type ColorVarKey = keyof typeof colorVars
export type LayoutVarKey = keyof typeof layoutVars
export type TypographyVarKey = keyof typeof typographyVars
export type RadiusVarKey = keyof typeof radiusVars

export interface ThemeColors {
  primary?: string
  primaryForeground?: string
  background?: string
  foreground?: string
  muted?: string
  mutedForeground?: string
  border?: string
  accent?: string
  accentForeground?: string
  info?: string
  infoForeground?: string
  warning?: string
  warningForeground?: string
  error?: string
  errorForeground?: string
  success?: string
  successForeground?: string
  sidebarBackground?: string
  sidebarForeground?: string
  sidebarBorder?: string
  headerBackground?: string
  headerForeground?: string
  headerBorder?: string
  codeBackground?: string
  codeForeground?: string
}

export interface ThemeLayout {
  sidebarWidth?: string
  tocWidth?: string
  contentMaxWidth?: string
  headerHeight?: string
}

export interface ThemeTypography {
  fontSans?: string
  fontMono?: string
  fontSizeBase?: string
  fontSizeSm?: string
  fontSizeLg?: string
  lineHeightBase?: string
}

export interface ThemeRadius {
  sm?: string
  md?: string
  lg?: string
}

export interface ThemeVariables {
  colors?: ThemeColors
  layout?: ThemeLayout
  typography?: ThemeTypography
  radius?: ThemeRadius
}

// ============================================================================
// Default Values
// ============================================================================

/** Default light theme values */
export const defaultLightTheme: Required<ThemeVariables> = {
  colors: {
    // Core
    primary: '220 90% 56%', // Blue
    primaryForeground: '0 0% 100%',
    background: '0 0% 100%',
    foreground: '224 71% 4%',
    muted: '220 14% 96%',
    mutedForeground: '220 9% 46%',
    border: '220 13% 91%',
    accent: '220 14% 96%',
    accentForeground: '224 71% 4%',
    
    // Semantic
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    error: '0 84% 60%',
    errorForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    
    // Component-specific
    sidebarBackground: '0 0% 98%',
    sidebarForeground: '224 71% 4%',
    sidebarBorder: '220 13% 91%',
    headerBackground: '0 0% 100%',
    headerForeground: '224 71% 4%',
    headerBorder: '220 13% 91%',
    codeBackground: '220 14% 96%',
    codeForeground: '224 71% 4%',
  },
  layout: {
    sidebarWidth: '280px',
    tocWidth: '224px',
    contentMaxWidth: '800px',
    headerHeight: '64px',
  },
  typography: {
    fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSizeBase: '16px',
    fontSizeSm: '14px',
    fontSizeLg: '18px',
    lineHeightBase: '1.7',
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
}

/** Default dark theme overrides */
export const defaultDarkTheme: ThemeVariables = {
  colors: {
    // Core
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    background: '224 71% 4%',
    foreground: '213 31% 91%',
    muted: '223 47% 11%',
    mutedForeground: '215 20% 65%',
    border: '216 34% 17%',
    accent: '216 34% 17%',
    accentForeground: '213 31% 91%',
    
    // Semantic
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    error: '0 84% 60%',
    errorForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    
    // Component-specific
    sidebarBackground: '224 71% 4%',
    sidebarForeground: '213 31% 91%',
    sidebarBorder: '216 34% 17%',
    headerBackground: '224 71% 4%',
    headerForeground: '213 31% 91%',
    headerBorder: '216 34% 17%',
    codeBackground: '223 47% 11%',
    codeForeground: '213 31% 91%',
  },
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get CSS variable reference (e.g., "var(--rd-color-primary)")
 */
export function cssVar(varName: string): string {
  return `var(${varName})`
}

/**
 * Get HSL color from CSS variable (e.g., "hsl(var(--rd-color-primary))")
 */
export function hslVar(varName: string): string {
  return `hsl(var(${varName}))`
}

/**
 * Generate CSS variable declarations from theme values
 */
export function generateCssVariables(
  theme: ThemeVariables,
  selector: string = ':root'
): string {
  const lines: string[] = [`${selector} {`]
  
  // Colors
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      if (value) {
        const varName = colorVars[key as ColorVarKey]
        if (varName) {
          lines.push(`  ${varName}: ${value};`)
        }
      }
    }
  }
  
  // Layout
  if (theme.layout) {
    for (const [key, value] of Object.entries(theme.layout)) {
      if (value) {
        const varName = layoutVars[key as LayoutVarKey]
        if (varName) {
          lines.push(`  ${varName}: ${value};`)
        }
      }
    }
  }
  
  // Typography
  if (theme.typography) {
    for (const [key, value] of Object.entries(theme.typography)) {
      if (value) {
        const varName = typographyVars[key as TypographyVarKey]
        if (varName) {
          lines.push(`  ${varName}: ${value};`)
        }
      }
    }
  }
  
  // Radius
  if (theme.radius) {
    for (const [key, value] of Object.entries(theme.radius)) {
      if (value) {
        const varName = radiusVars[key as RadiusVarKey]
        if (varName) {
          lines.push(`  ${varName}: ${value};`)
        }
      }
    }
  }
  
  lines.push('}')
  return lines.join('\n')
}

/**
 * Generate complete theme CSS (light + dark mode)
 */
export function generateThemeCss(
  lightTheme: ThemeVariables = defaultLightTheme,
  darkTheme: ThemeVariables = defaultDarkTheme
): string {
  const lightCss = generateCssVariables(lightTheme, ':root')
  const darkCss = generateCssVariables(darkTheme, '.dark')
  
  return `/* ReviteDocs Theme - Auto-generated */
${lightCss}

${darkCss}
`
}

/**
 * Merge user theme with defaults
 */
export function mergeTheme(
  userTheme: ThemeVariables,
  baseTheme: ThemeVariables = defaultLightTheme
): ThemeVariables {
  return {
    colors: { ...baseTheme.colors, ...userTheme.colors },
    layout: { ...baseTheme.layout, ...userTheme.layout },
    typography: { ...baseTheme.typography, ...userTheme.typography },
    radius: { ...baseTheme.radius, ...userTheme.radius },
  }
}

// ============================================================================
// Tailwind Integration
// ============================================================================

/**
 * Generate Tailwind theme extension using CSS variables
 * This allows users to use classes like `bg-primary` or `text-muted-foreground`
 */
export function getTailwindThemeExtension() {
  return {
    colors: {
      primary: {
        DEFAULT: hslVar(colorVars.primary),
        foreground: hslVar(colorVars.primaryForeground),
      },
      background: hslVar(colorVars.background),
      foreground: hslVar(colorVars.foreground),
      muted: {
        DEFAULT: hslVar(colorVars.muted),
        foreground: hslVar(colorVars.mutedForeground),
      },
      border: hslVar(colorVars.border),
      accent: {
        DEFAULT: hslVar(colorVars.accent),
        foreground: hslVar(colorVars.accentForeground),
      },
      info: {
        DEFAULT: hslVar(colorVars.info),
        foreground: hslVar(colorVars.infoForeground),
      },
      warning: {
        DEFAULT: hslVar(colorVars.warning),
        foreground: hslVar(colorVars.warningForeground),
      },
      error: {
        DEFAULT: hslVar(colorVars.error),
        foreground: hslVar(colorVars.errorForeground),
      },
      success: {
        DEFAULT: hslVar(colorVars.success),
        foreground: hslVar(colorVars.successForeground),
      },
      sidebar: {
        DEFAULT: hslVar(colorVars.sidebarBackground),
        foreground: hslVar(colorVars.sidebarForeground),
        border: hslVar(colorVars.sidebarBorder),
      },
      header: {
        DEFAULT: hslVar(colorVars.headerBackground),
        foreground: hslVar(colorVars.headerForeground),
        border: hslVar(colorVars.headerBorder),
      },
      code: {
        DEFAULT: hslVar(colorVars.codeBackground),
        foreground: hslVar(colorVars.codeForeground),
      },
    },
    fontFamily: {
      sans: cssVar(typographyVars.fontSans),
      mono: cssVar(typographyVars.fontMono),
    },
    fontSize: {
      base: cssVar(typographyVars.fontSizeBase),
      sm: cssVar(typographyVars.fontSizeSm),
      lg: cssVar(typographyVars.fontSizeLg),
    },
    borderRadius: {
      sm: cssVar(radiusVars.sm),
      md: cssVar(radiusVars.md),
      lg: cssVar(radiusVars.lg),
    },
    width: {
      sidebar: cssVar(layoutVars.sidebarWidth),
      toc: cssVar(layoutVars.tocWidth),
    },
    maxWidth: {
      content: cssVar(layoutVars.contentMaxWidth),
    },
    height: {
      header: cssVar(layoutVars.headerHeight),
    },
  }
}

// ============================================================================
// Component Slot Prop Types
// ============================================================================

// These types are used when creating custom slot components in .revitedocs/theme/

import type { ReactNode } from 'react'
import type { Theme } from '../components/hooks/useTheme.js'

/** Navigation item for header */
export interface NavItem {
  text: string
  link: string
}

/** Sidebar item with optional nested items */
export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

/** Sidebar section with title and items */
export interface SidebarSection {
  title: string
  items: SidebarItem[]
}

/** Table of contents item */
export interface TocItem {
  id: string
  text: string
  level: number
}

/** Page frontmatter */
export interface Frontmatter {
  title?: string
  description?: string
  [key: string]: unknown
}

/** Locale configuration */
export interface LocaleConfig {
  label: string
  lang: string
}

/**
 * Props passed to custom Header component
 * 
 * @example
 * ```tsx
 * import type { HeaderProps } from 'revitedocs/theme'
 * 
 * export default function Header({ title, nav, onSearchOpen }: HeaderProps) {
 *   return (
 *     <header>
 *       <h1>{title}</h1>
 *       <button onClick={onSearchOpen}>Search</button>
 *     </header>
 *   )
 * }
 * ```
 */
export interface HeaderProps {
  /** Site title */
  title: string
  /** Logo URL */
  logo?: string
  /** Navigation items */
  nav: NavItem[]
  /** Current theme (light/dark) */
  theme: Theme
  /** Toggle theme callback */
  onThemeToggle: () => void
  /** Open search modal callback */
  onSearchOpen: () => void
  /** Toggle mobile menu callback */
  onMenuToggle?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Props passed to custom Sidebar component
 * 
 * @example
 * ```tsx
 * import type { SidebarProps } from 'revitedocs/theme'
 * 
 * export default function Sidebar({ sections, currentPath }: SidebarProps) {
 *   return (
 *     <nav>
 *       {sections.map(section => (
 *         <div key={section.title}>
 *           <h3>{section.title}</h3>
 *           {section.items.map(item => (
 *             <a href={item.link} className={item.link === currentPath ? 'active' : ''}>
 *               {item.text}
 *             </a>
 *           ))}
 *         </div>
 *       ))}
 *     </nav>
 *   )
 * }
 * ```
 */
export interface SidebarProps {
  /** Sidebar sections with items */
  sections: SidebarSection[]
  /** Current page path for highlighting */
  currentPath?: string
  /** Whether sidebar is open (mobile) */
  isOpen?: boolean
  /** Close sidebar callback (mobile) */
  onClose?: () => void
  /** Available versions (if versioning enabled) */
  versions?: string[]
  /** Current version */
  currentVersion?: string
  /** Available locales (if i18n enabled) */
  locales?: Record<string, LocaleConfig>
  /** Current locale */
  currentLocale?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Props passed to custom Footer component
 * 
 * @example
 * ```tsx
 * import type { FooterProps } from 'revitedocs/theme'
 * 
 * export default function Footer({ copyright }: FooterProps) {
 *   return (
 *     <footer>
 *       <p>{copyright}</p>
 *     </footer>
 *   )
 * }
 * ```
 */
export interface FooterProps {
  /** Copyright text */
  copyright?: string
  /** Footer links */
  links?: Array<{ text: string; link: string }>
  /** Additional CSS classes */
  className?: string
}

/**
 * Props passed to custom Layout component
 * 
 * @example
 * ```tsx
 * import type { LayoutProps } from 'revitedocs/theme'
 * import { Header, Sidebar, TableOfContents } from 'revitedocs/components'
 * 
 * export default function Layout({ children, toc, frontmatter }: LayoutProps) {
 *   return (
 *     <div>
 *       <Header {...headerProps} />
 *       <Sidebar {...sidebarProps} />
 *       <main>{children}</main>
 *       <TableOfContents items={toc} />
 *     </div>
 *   )
 * }
 * ```
 */
export interface LayoutProps {
  /** Page content */
  children: ReactNode
  /** Table of contents items */
  toc: TocItem[]
  /** Page frontmatter */
  frontmatter: Frontmatter
  /** Site title */
  title?: string
  /** Logo URL */
  logo?: string
  /** Navigation items */
  nav?: NavItem[]
  /** Sidebar sections */
  sidebar?: SidebarSection[]
  /** Current page path */
  currentPath?: string
  /** Custom navigate function for SPA navigation */
  onNavigate?: (url: string) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Props passed to custom NotFound component
 * 
 * @example
 * ```tsx
 * import type { NotFoundProps } from 'revitedocs/theme'
 * 
 * export default function NotFound({ message }: NotFoundProps) {
 *   return (
 *     <div>
 *       <h1>404</h1>
 *       <p>{message || 'Page not found'}</p>
 *       <a href="/">Go home</a>
 *     </div>
 *   )
 * }
 * ```
 */
export interface NotFoundProps {
  /** Custom message */
  message?: string
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// Re-exports
// ============================================================================

// Tailwind utilities
export {
  getDefaultTailwindConfig,
  deepMerge,
  getUserTailwindConfigPath,
  loadUserTailwindConfig,
  mergeTailwindConfig,
  getTailwindConfig,
  type TailwindConfig,
} from './tailwind.js'

// Slot-related exports from core
export { SLOT_COMPONENTS } from '../core/vite-plugin-slots.js'
export type { SlotComponent, SlotResolution } from '../core/vite-plugin-slots.js'

// Types are already exported above via their definitions
