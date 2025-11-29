import { z, ZodError } from 'zod'
import { loadConfigFromFile } from 'vite'
import path from 'node:path'

// Schema definitions
const NavItemSchema = z.object({
  text: z.string(),
  link: z.string(),
})

const SidebarItemSchema: z.ZodType<SidebarItem> = z.lazy(() =>
  z.object({
    text: z.string(),
    link: z.string().optional(),
    items: z.array(SidebarItemSchema).optional(),
    collapsed: z.boolean().optional(),
  })
)

const SocialLinkSchema = z.object({
  icon: z.string(),
  link: z.string(),
})

const LocaleSchema = z.object({
  label: z.string(),
  lang: z.string(),
})

const ThemeSchema = z.object({
  logo: z.string().optional(),
  nav: z.array(NavItemSchema).default([]),
  sidebar: z.record(z.array(SidebarItemSchema)).default({}),
  socialLinks: z.array(SocialLinkSchema).default([]),
})

const LlmsSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().optional(),
  description: z.string().optional(),
})

const SearchSchema = z.object({
  enabled: z.boolean().default(true),
})

export const ConfigSchema = z.object({
  title: z.string().default('Documentation'),
  description: z.string().optional(),
  base: z.string().default('/'),
  theme: ThemeSchema.default({}),
  versions: z.array(z.string()).optional(),
  defaultVersion: z.string().optional(),
  locales: z.record(LocaleSchema).optional(),
  defaultLocale: z.string().optional(),
  llms: LlmsSchema.default({}),
  search: SearchSchema.default({}),
})

// Type definitions
export interface NavItem {
  text: string
  link: string
}

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

export interface SocialLink {
  icon: string
  link: string
}

export interface LocaleConfig {
  label: string
  lang: string
}

export interface ThemeConfig {
  logo?: string
  nav: NavItem[]
  sidebar: Record<string, SidebarItem[]>
  socialLinks: SocialLink[]
}

export interface LlmsConfig {
  enabled: boolean
  title?: string
  description?: string
}

export interface SearchConfig {
  enabled: boolean
}

export interface UserConfig {
  title?: string
  description?: string
  base?: string
  theme?: Partial<ThemeConfig>
  versions?: string[]
  defaultVersion?: string
  locales?: Record<string, LocaleConfig>
  defaultLocale?: string
  llms?: Partial<LlmsConfig>
  search?: Partial<SearchConfig>
}

export interface ResolvedConfig {
  root: string
  title: string
  description?: string
  base: string
  theme: ThemeConfig
  versions?: string[]
  defaultVersion?: string
  locales?: Record<string, LocaleConfig>
  defaultLocale?: string
  llms: LlmsConfig
  search: SearchConfig
}

/**
 * Define a revitedocs configuration with type checking
 */
export function defineConfig(config: UserConfig): UserConfig {
  return config
}

/**
 * Parse and validate a user config into a resolved config
 */
export function resolveConfig(root: string, userConfig: UserConfig): ResolvedConfig {
  const parsed = ConfigSchema.parse(userConfig)
  return {
    root,
    ...parsed,
  }
}

/**
 * Load config from .revitedocs/config.ts in the given root directory
 */
export async function loadConfig(root: string): Promise<ResolvedConfig> {
  const resolvedRoot = path.resolve(root)
  const configPath = path.join(resolvedRoot, '.revitedocs', 'config.ts')
  
  try {
    const result = await loadConfigFromFile(
      { command: 'serve', mode: 'development' },
      configPath
    )
    
    const userConfig = result?.config ?? {}
    return resolveConfig(resolvedRoot, userConfig as UserConfig)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Invalid config:\n${formatConfigError(error)}`)
    }
    throw error
  }
}

/**
 * Format Zod validation errors into readable messages
 */
export function formatConfigError(error: ZodError): string {
  return error.errors
    .map((err) => {
      const pathStr = err.path
        .map((p, i) => (typeof p === 'number' ? `[${p}]` : (i === 0 ? p : `.${p}`)))
        .join('')
      return `  - ${pathStr}: ${err.message}`
    })
    .join('\n')
}

