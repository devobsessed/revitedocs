/**
 * Tailwind Configuration Utilities
 *
 * Load and merge user's Tailwind config from .revitedocs/ directory
 */

import path from 'node:path'
import fs from 'node:fs'
import { getTailwindThemeExtension } from './index.js'

export interface TailwindConfig {
  darkMode?: 'class' | 'media' | ['class', string]
  content?: string[]
  theme?: {
    extend?: Record<string, unknown>
    [key: string]: unknown
  }
  plugins?: unknown[]
  [key: string]: unknown
}

/**
 * Default Tailwind configuration for ReviteDocs
 */
export function getDefaultTailwindConfig(docsRoot: string): TailwindConfig {
  return {
    darkMode: 'class',
    content: [
      path.join(docsRoot, '**/*.{md,mdx,tsx,jsx}'),
      // Include revitedocs package components
      path.join(
        path.dirname(import.meta.url.replace('file://', '')),
        '../components/**/*.{js,tsx}'
      ),
    ],
    theme: {
      extend: getTailwindThemeExtension(),
    },
    plugins: [],
  }
}

/**
 * Deep merge two objects, with source values overwriting target values
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T]
    }
  }

  return result
}

/**
 * Check if a Tailwind config file exists in the .revitedocs directory
 */
export function getUserTailwindConfigPath(docsRoot: string): string | null {
  const possiblePaths = [
    path.join(docsRoot, '.revitedocs', 'tailwind.config.js'),
    path.join(docsRoot, '.revitedocs', 'tailwind.config.ts'),
    path.join(docsRoot, '.revitedocs', 'tailwind.config.mjs'),
  ]

  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      return configPath
    }
  }

  return null
}

/**
 * Load user's Tailwind config from .revitedocs/ directory
 * Returns null if no config file exists
 */
export async function loadUserTailwindConfig(docsRoot: string): Promise<TailwindConfig | null> {
  const configPath = getUserTailwindConfigPath(docsRoot)

  if (!configPath) {
    return null
  }

  try {
    // Dynamic import to load the config
    const userConfig = await import(configPath)
    return userConfig.default || userConfig
  } catch (error) {
    console.warn(
      `[revitedocs] Warning: Failed to load Tailwind config from ${configPath}:`,
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Merge user's Tailwind config with ReviteDocs defaults
 * User values take precedence, theme.extend is deeply merged
 */
export function mergeTailwindConfig(
  defaultConfig: TailwindConfig,
  userConfig: TailwindConfig | null
): TailwindConfig {
  if (!userConfig) {
    return defaultConfig
  }

  // Start with default config
  const merged: TailwindConfig = { ...defaultConfig }

  // Merge content arrays
  if (userConfig.content) {
    merged.content = [...(defaultConfig.content || []), ...userConfig.content]
  }

  // Merge plugins arrays
  if (userConfig.plugins) {
    merged.plugins = [...(defaultConfig.plugins || []), ...userConfig.plugins]
  }

  // Deep merge theme.extend
  if (userConfig.theme) {
    merged.theme = {
      ...defaultConfig.theme,
      ...userConfig.theme,
      extend: deepMerge(
        (defaultConfig.theme?.extend || {}) as Record<string, unknown>,
        (userConfig.theme?.extend || {}) as Record<string, unknown>
      ),
    }
  }

  // Override darkMode if user specifies it
  if (userConfig.darkMode !== undefined) {
    merged.darkMode = userConfig.darkMode
  }

  // Copy any other top-level keys from user config
  for (const key of Object.keys(userConfig)) {
    if (!['content', 'plugins', 'theme', 'darkMode'].includes(key)) {
      merged[key] = userConfig[key]
    }
  }

  return merged
}

/**
 * Get the final Tailwind configuration for a docs project
 * Loads user config if present and merges with defaults
 */
export async function getTailwindConfig(docsRoot: string): Promise<TailwindConfig> {
  const defaultConfig = getDefaultTailwindConfig(docsRoot)
  const userConfig = await loadUserTailwindConfig(docsRoot)
  return mergeTailwindConfig(defaultConfig, userConfig)
}
