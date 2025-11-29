---
title: Configuration
description: Configure your ReviteDocs site
---

ReviteDocs is configured via `.revitedocs/config.ts` in your docs directory.

## Basic Configuration

```typescript
import { defineConfig } from 'revitedocs'

export default defineConfig({
  title: 'My Documentation',
  description: 'A description for SEO',
  base: '/', // Base URL path
})
```

## Theme Configuration

### Navigation

Add top navigation links:

```typescript
export default defineConfig({
  theme: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/...' },
    ],
  },
})
```

### Sidebar

Configure sidebar navigation:

```typescript
export default defineConfig({
  theme: {
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'Reference',
          items: [
            { text: 'CLI', link: '/api/cli' },
          ],
        },
      ],
    },
  },
})
```

## Search Configuration

```typescript
export default defineConfig({
  search: {
    enabled: true, // Enable Pagefind search
  },
})
```

## LLMs.txt Configuration

Generate AI-friendly documentation:

```typescript
export default defineConfig({
  llms: {
    enabled: true,
    title: 'My Project Docs',
    description: 'Documentation for AI assistants',
  },
})
```

## Full Configuration Reference

```typescript
import { defineConfig } from 'revitedocs'

export default defineConfig({
  // Site metadata
  title: 'My Documentation',
  description: 'Site description',
  base: '/',

  // Theme customization
  theme: {
    logo: '/logo.svg',
    nav: [],
    sidebar: {},
    socialLinks: [],
  },

  // Versioning (optional)
  versions: ['v2', 'v1'],
  defaultVersion: 'v2',

  // Internationalization (optional)
  locales: {
    en: { label: 'English', lang: 'en-US' },
    ja: { label: '日本語', lang: 'ja-JP' },
  },
  defaultLocale: 'en',

  // Search
  search: {
    enabled: true,
  },

  // AI documentation
  llms: {
    enabled: true,
    title: 'Documentation',
    description: 'Full documentation',
  },
})
```

