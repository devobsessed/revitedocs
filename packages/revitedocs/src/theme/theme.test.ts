import { describe, it, expect } from 'vitest'
import {
  CSS_VAR_PREFIX,
  colorVars,
  layoutVars,
  typographyVars,
  radiusVars,
  defaultLightTheme,
  defaultDarkTheme,
  cssVar,
  hslVar,
  generateCssVariables,
  generateThemeCss,
  mergeTheme,
  getTailwindThemeExtension,
} from './index.js'

describe('theme', () => {
  describe('CSS variable names', () => {
    it('uses consistent prefix', () => {
      expect(CSS_VAR_PREFIX).toBe('--rd')
    })

    it('has all color variables prefixed correctly', () => {
      Object.values(colorVars).forEach((varName) => {
        expect(varName).toMatch(/^--rd-color-/)
      })
    })

    it('has all layout variables prefixed correctly', () => {
      Object.values(layoutVars).forEach((varName) => {
        expect(varName).toMatch(/^--rd-/)
      })
    })

    it('has all typography variables prefixed correctly', () => {
      Object.values(typographyVars).forEach((varName) => {
        expect(varName).toMatch(/^--rd-(font|line-height)/)
      })
    })

    it('has all radius variables prefixed correctly', () => {
      Object.values(radiusVars).forEach((varName) => {
        expect(varName).toMatch(/^--rd-radius/)
      })
    })
  })

  describe('default themes', () => {
    it('light theme has all required color values', () => {
      expect(defaultLightTheme.colors.primary).toBeDefined()
      expect(defaultLightTheme.colors.background).toBeDefined()
      expect(defaultLightTheme.colors.foreground).toBeDefined()
      expect(defaultLightTheme.colors.muted).toBeDefined()
      expect(defaultLightTheme.colors.border).toBeDefined()
      expect(defaultLightTheme.colors.accent).toBeDefined()
    })

    it('light theme has semantic colors', () => {
      expect(defaultLightTheme.colors.info).toBeDefined()
      expect(defaultLightTheme.colors.warning).toBeDefined()
      expect(defaultLightTheme.colors.error).toBeDefined()
      expect(defaultLightTheme.colors.success).toBeDefined()
    })

    it('light theme has component-specific colors', () => {
      expect(defaultLightTheme.colors.sidebarBackground).toBeDefined()
      expect(defaultLightTheme.colors.headerBackground).toBeDefined()
      expect(defaultLightTheme.colors.codeBackground).toBeDefined()
    })

    it('light theme has layout values', () => {
      expect(defaultLightTheme.layout.sidebarWidth).toBe('280px')
      expect(defaultLightTheme.layout.tocWidth).toBe('224px')
      expect(defaultLightTheme.layout.contentMaxWidth).toBe('800px')
      expect(defaultLightTheme.layout.headerHeight).toBe('64px')
    })

    it('light theme has typography values', () => {
      expect(defaultLightTheme.typography.fontSans).toContain('system-ui')
      expect(defaultLightTheme.typography.fontMono).toContain('monospace')
      expect(defaultLightTheme.typography.fontSizeBase).toBe('16px')
    })

    it('light theme has radius values', () => {
      expect(defaultLightTheme.radius.sm).toBe('0.25rem')
      expect(defaultLightTheme.radius.md).toBe('0.5rem')
      expect(defaultLightTheme.radius.lg).toBe('0.75rem')
    })

    it('dark theme overrides core colors', () => {
      expect(defaultDarkTheme.colors?.background).toBeDefined()
      expect(defaultDarkTheme.colors?.foreground).toBeDefined()
      expect(defaultDarkTheme.colors?.background).not.toBe(defaultLightTheme.colors.background)
    })
  })

  describe('cssVar', () => {
    it('wraps variable name in var()', () => {
      expect(cssVar('--rd-color-primary')).toBe('var(--rd-color-primary)')
    })

    it('works with any variable name', () => {
      expect(cssVar('--custom')).toBe('var(--custom)')
    })
  })

  describe('hslVar', () => {
    it('wraps variable in hsl() and var()', () => {
      expect(hslVar('--rd-color-primary')).toBe('hsl(var(--rd-color-primary))')
    })
  })

  describe('generateCssVariables', () => {
    it('generates CSS with :root selector by default', () => {
      const css = generateCssVariables({ colors: { primary: '220 90% 56%' } })
      expect(css).toContain(':root {')
      expect(css).toContain('}')
    })

    it('uses custom selector', () => {
      const css = generateCssVariables({ colors: { primary: '220 90% 56%' } }, '.dark')
      expect(css).toContain('.dark {')
    })

    it('generates color variables', () => {
      const css = generateCssVariables({
        colors: {
          primary: '220 90% 56%',
          background: '0 0% 100%',
        },
      })
      expect(css).toContain('--rd-color-primary: 220 90% 56%;')
      expect(css).toContain('--rd-color-background: 0 0% 100%;')
    })

    it('generates layout variables', () => {
      const css = generateCssVariables({
        layout: {
          sidebarWidth: '300px',
          headerHeight: '70px',
        },
      })
      expect(css).toContain('--rd-sidebar-width: 300px;')
      expect(css).toContain('--rd-header-height: 70px;')
    })

    it('generates typography variables', () => {
      const css = generateCssVariables({
        typography: {
          fontSans: 'Inter, sans-serif',
          fontSizeBase: '18px',
        },
      })
      expect(css).toContain('--rd-font-sans: Inter, sans-serif;')
      expect(css).toContain('--rd-font-size-base: 18px;')
    })

    it('generates radius variables', () => {
      const css = generateCssVariables({
        radius: {
          sm: '4px',
          lg: '12px',
        },
      })
      expect(css).toContain('--rd-radius-sm: 4px;')
      expect(css).toContain('--rd-radius-lg: 12px;')
    })

    it('skips undefined values', () => {
      const css = generateCssVariables({
        colors: {
          primary: '220 90% 56%',
          background: undefined,
        },
      })
      expect(css).toContain('--rd-color-primary')
      expect(css).not.toContain('--rd-color-background')
    })
  })

  describe('generateThemeCss', () => {
    it('generates both light and dark mode CSS', () => {
      const css = generateThemeCss()
      expect(css).toContain(':root {')
      expect(css).toContain('.dark {')
    })

    it('includes auto-generated comment', () => {
      const css = generateThemeCss()
      expect(css).toContain('ReviteDocs Theme')
    })

    it('uses default themes when no args provided', () => {
      const css = generateThemeCss()
      expect(css).toContain(`--rd-sidebar-width: ${defaultLightTheme.layout.sidebarWidth}`)
    })

    it('accepts custom themes', () => {
      const css = generateThemeCss(
        { colors: { primary: '100 50% 50%' } },
        { colors: { primary: '200 60% 60%' } }
      )
      expect(css).toContain('--rd-color-primary: 100 50% 50%')
      expect(css).toContain('--rd-color-primary: 200 60% 60%')
    })
  })

  describe('mergeTheme', () => {
    it('merges user theme with defaults', () => {
      const merged = mergeTheme({ colors: { primary: 'custom' } })
      expect(merged.colors?.primary).toBe('custom')
      expect(merged.colors?.background).toBe(defaultLightTheme.colors.background)
    })

    it('preserves all default values when user provides empty object', () => {
      const merged = mergeTheme({})
      expect(merged.colors).toEqual(defaultLightTheme.colors)
      expect(merged.layout).toEqual(defaultLightTheme.layout)
    })

    it('allows custom base theme', () => {
      const customBase = { colors: { primary: 'base' }, layout: { sidebarWidth: '200px' } }
      const merged = mergeTheme({ colors: { background: 'user' } }, customBase)
      expect(merged.colors?.primary).toBe('base')
      expect(merged.colors?.background).toBe('user')
      expect(merged.layout?.sidebarWidth).toBe('200px')
    })

    it('deeply merges nested objects', () => {
      const merged = mergeTheme({
        colors: { primary: 'new' },
        layout: { sidebarWidth: '320px' },
      })
      expect(merged.colors?.primary).toBe('new')
      expect(merged.colors?.background).toBe(defaultLightTheme.colors.background)
      expect(merged.layout?.sidebarWidth).toBe('320px')
      expect(merged.layout?.tocWidth).toBe(defaultLightTheme.layout.tocWidth)
    })
  })

  describe('getTailwindThemeExtension', () => {
    it('returns colors using CSS variables', () => {
      const extension = getTailwindThemeExtension()
      expect(extension.colors.primary.DEFAULT).toBe('hsl(var(--rd-color-primary))')
      expect(extension.colors.primary.foreground).toBe('hsl(var(--rd-color-primary-foreground))')
    })

    it('returns semantic colors', () => {
      const extension = getTailwindThemeExtension()
      expect(extension.colors.info.DEFAULT).toBe('hsl(var(--rd-color-info))')
      expect(extension.colors.warning.DEFAULT).toBe('hsl(var(--rd-color-warning))')
      expect(extension.colors.error.DEFAULT).toBe('hsl(var(--rd-color-error))')
      expect(extension.colors.success.DEFAULT).toBe('hsl(var(--rd-color-success))')
    })

    it('returns component-specific colors', () => {
      const extension = getTailwindThemeExtension()
      expect(extension.colors.sidebar.DEFAULT).toBe('hsl(var(--rd-color-sidebar-bg))')
      expect(extension.colors.header.DEFAULT).toBe('hsl(var(--rd-color-header-bg))')
      expect(extension.colors.code.DEFAULT).toBe('hsl(var(--rd-color-code-bg))')
    })

    it('returns font families using CSS variables', () => {
      const extension = getTailwindThemeExtension()
      expect(extension.fontFamily.sans).toBe('var(--rd-font-sans)')
      expect(extension.fontFamily.mono).toBe('var(--rd-font-mono)')
    })

    it('returns layout dimensions', () => {
      const extension = getTailwindThemeExtension()
      expect(extension.width.sidebar).toBe('var(--rd-sidebar-width)')
      expect(extension.width.toc).toBe('var(--rd-toc-width)')
      expect(extension.maxWidth.content).toBe('var(--rd-content-max-width)')
      expect(extension.height.header).toBe('var(--rd-header-height)')
    })

    it('returns border radius values', () => {
      const extension = getTailwindThemeExtension()
      expect(extension.borderRadius.sm).toBe('var(--rd-radius-sm)')
      expect(extension.borderRadius.md).toBe('var(--rd-radius-md)')
      expect(extension.borderRadius.lg).toBe('var(--rd-radius-lg)')
    })
  })
})

describe('theme exports', () => {
  it('exports all CSS variable maps', async () => {
    const theme = await import('./index.js')
    expect(theme.colorVars).toBeDefined()
    expect(theme.layoutVars).toBeDefined()
    expect(theme.typographyVars).toBeDefined()
    expect(theme.radiusVars).toBeDefined()
  })

  it('exports default themes', async () => {
    const theme = await import('./index.js')
    expect(theme.defaultLightTheme).toBeDefined()
    expect(theme.defaultDarkTheme).toBeDefined()
  })

  it('exports utility functions', async () => {
    const theme = await import('./index.js')
    expect(typeof theme.cssVar).toBe('function')
    expect(typeof theme.hslVar).toBe('function')
    expect(typeof theme.generateCssVariables).toBe('function')
    expect(typeof theme.generateThemeCss).toBe('function')
    expect(typeof theme.mergeTheme).toBe('function')
    expect(typeof theme.getTailwindThemeExtension).toBe('function')
  })
})
