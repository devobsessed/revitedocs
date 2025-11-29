import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import {
  getDefaultTailwindConfig,
  deepMerge,
  getUserTailwindConfigPath,
  mergeTailwindConfig,
  type TailwindConfig,
} from './tailwind.js'

describe('tailwind utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDefaultTailwindConfig', () => {
    it('returns config with darkMode set to class', () => {
      const config = getDefaultTailwindConfig('/docs')
      expect(config.darkMode).toBe('class')
    })

    it('includes docs content paths', () => {
      const config = getDefaultTailwindConfig('/docs')
      expect(config.content).toBeDefined()
      expect(config.content?.some(p => p.includes('/docs'))).toBe(true)
    })

    it('includes theme extension with CSS variables', () => {
      const config = getDefaultTailwindConfig('/docs')
      expect(config.theme?.extend).toBeDefined()
      expect(config.theme?.extend?.colors).toBeDefined()
    })

    it('initializes empty plugins array', () => {
      const config = getDefaultTailwindConfig('/docs')
      expect(config.plugins).toEqual([])
    })
  })

  describe('deepMerge', () => {
    it('merges flat objects', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = deepMerge(target, source)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('deeply merges nested objects', () => {
      const target = { 
        a: 1, 
        nested: { x: 1, y: 2, z: 0 } 
      }
      const source = { 
        a: 1,
        nested: { x: 1, y: 3, z: 4 } 
      }
      const result = deepMerge(target, source)
      expect(result).toEqual({
        a: 1,
        nested: { x: 1, y: 3, z: 4 },
      })
    })

    it('does not merge arrays (replaces them)', () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [4, 5] }
      const result = deepMerge(target, source)
      expect(result).toEqual({ arr: [4, 5] })
    })

    it('handles null values in source', () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { b: null }
      const result = deepMerge(target, source as any)
      expect(result.b).toBeNull()
    })

    it('ignores undefined source values', () => {
      const target = { a: 1, b: 2 }
      const source = { a: undefined, c: 3 }
      const result = deepMerge(target, source as any)
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('does not mutate original objects', () => {
      const target = { a: 1, nested: { x: 1, y: 0 } }
      const source = { a: 1, nested: { x: 1, y: 2 } }
      deepMerge(target, source)
      expect(target).toEqual({ a: 1, nested: { x: 1, y: 0 } })
    })
  })

  describe('getUserTailwindConfigPath', () => {
    it('returns path for tailwind.config.js if it exists', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((p) => 
        p === '/docs/.revitedocs/tailwind.config.js'
      )
      
      const result = getUserTailwindConfigPath('/docs')
      expect(result).toBe('/docs/.revitedocs/tailwind.config.js')
    })

    it('returns path for tailwind.config.ts if it exists', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((p) => 
        p === '/docs/.revitedocs/tailwind.config.ts'
      )
      
      const result = getUserTailwindConfigPath('/docs')
      expect(result).toBe('/docs/.revitedocs/tailwind.config.ts')
    })

    it('returns path for tailwind.config.mjs if it exists', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((p) => 
        p === '/docs/.revitedocs/tailwind.config.mjs'
      )
      
      const result = getUserTailwindConfigPath('/docs')
      expect(result).toBe('/docs/.revitedocs/tailwind.config.mjs')
    })

    it('prefers .js over .ts and .mjs', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      
      const result = getUserTailwindConfigPath('/docs')
      expect(result).toBe('/docs/.revitedocs/tailwind.config.js')
    })

    it('returns null if no config file exists', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)
      
      const result = getUserTailwindConfigPath('/docs')
      expect(result).toBeNull()
    })
  })

  describe('mergeTailwindConfig', () => {
    const defaultConfig: TailwindConfig = {
      darkMode: 'class',
      content: ['/default/**/*.tsx'],
      theme: {
        extend: {
          colors: { primary: 'blue' },
          spacing: { xs: '0.25rem' },
        },
      },
      plugins: [],
    }

    it('returns default config when user config is null', () => {
      const result = mergeTailwindConfig(defaultConfig, null)
      expect(result).toEqual(defaultConfig)
    })

    it('merges content arrays', () => {
      const userConfig: TailwindConfig = {
        content: ['/custom/**/*.tsx'],
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.content).toEqual([
        '/default/**/*.tsx',
        '/custom/**/*.tsx',
      ])
    })

    it('merges plugins arrays', () => {
      const customPlugin = { name: 'custom' }
      const userConfig: TailwindConfig = {
        plugins: [customPlugin],
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.plugins).toEqual([customPlugin])
    })

    it('deep merges theme.extend', () => {
      const userConfig: TailwindConfig = {
        theme: {
          extend: {
            colors: { secondary: 'green' },
            fontSize: { xl: '1.5rem' },
          },
        },
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.theme?.extend).toEqual({
        colors: { primary: 'blue', secondary: 'green' },
        spacing: { xs: '0.25rem' },
        fontSize: { xl: '1.5rem' },
      })
    })

    it('allows user to override darkMode', () => {
      const userConfig: TailwindConfig = {
        darkMode: 'media',
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.darkMode).toBe('media')
    })

    it('preserves default darkMode if user does not specify', () => {
      const userConfig: TailwindConfig = {
        content: ['/custom/**/*.tsx'],
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.darkMode).toBe('class')
    })

    it('copies other top-level keys from user config', () => {
      const userConfig: TailwindConfig = {
        prefix: 'rd-',
        important: true,
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.prefix).toBe('rd-')
      expect(result.important).toBe(true)
    })

    it('user theme values override default theme values', () => {
      const userConfig: TailwindConfig = {
        theme: {
          extend: {
            colors: { primary: 'red' },
          },
        },
      }
      const result = mergeTailwindConfig(defaultConfig, userConfig)
      expect(result.theme?.extend?.colors).toEqual({
        primary: 'red',
      })
    })
  })
})

