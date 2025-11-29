---
title: Config Options
description: Complete configuration reference for ReviteDocs
---

Full reference for `.revitedocs/config.ts` options.

## defineConfig

Type-safe configuration helper:

```typescript
import { defineConfig } from 'revitedocs'

export default defineConfig({
  // options
})
```

---

## Site Options

### title

- **Type:** `string`
- **Default:** `'Documentation'`

Site title displayed in header and browser tab.

```typescript
export default defineConfig({
  title: 'My Documentation',
})
```

### description

- **Type:** `string`
- **Default:** `undefined`

Site description for SEO meta tags.

```typescript
export default defineConfig({
  description: 'Documentation for My Project',
})
```

### base

- **Type:** `string`
- **Default:** `'/'`

Base URL path for deployment to subdirectory.

```typescript
export default defineConfig({
  base: '/docs/',
})
```

---

## Theme Options

### theme.logo

- **Type:** `string`
- **Default:** `undefined`

Path to logo image.

```typescript
export default defineConfig({
  theme: {
    logo: '/logo.svg',
  },
})
```

### theme.nav

- **Type:** `NavItem[]`
- **Default:** `[]`

Top navigation links.

```typescript
interface NavItem {
  text: string
  link: string
}

export default defineConfig({
  theme: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
  },
})
```

### theme.sidebar

- **Type:** `Record<string, SidebarSection[]>`
- **Default:** `{}`

Sidebar navigation organized by path prefix.

```typescript
interface SidebarItem {
  text: string
  link: string
}

interface SidebarSection {
  text: string
  items: SidebarItem[]
}

export default defineConfig({
  theme: {
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
    },
  },
})
```

---

## Versioning

### versions

- **Type:** `string[]`
- **Default:** `undefined`

List of documentation versions.

```typescript
export default defineConfig({
  versions: ['v2', 'v1'],
})
```

### defaultVersion

- **Type:** `string`
- **Default:** First version in array

Default version to display.

```typescript
export default defineConfig({
  versions: ['v2', 'v1'],
  defaultVersion: 'v2',
})
```

---

## Internationalization

### locales

- **Type:** `Record<string, LocaleConfig>`
- **Default:** `undefined`

Locale configuration.

```typescript
interface LocaleConfig {
  label: string
  lang: string
}

export default defineConfig({
  locales: {
    en: { label: 'English', lang: 'en-US' },
    ja: { label: '日本語', lang: 'ja-JP' },
  },
})
```

### defaultLocale

- **Type:** `string`
- **Default:** First locale key

Default locale.

```typescript
export default defineConfig({
  locales: {
    en: { label: 'English', lang: 'en-US' },
    ja: { label: '日本語', lang: 'ja-JP' },
  },
  defaultLocale: 'en',
})
```

---

## Search

### search.enabled

- **Type:** `boolean`
- **Default:** `true`

Enable search functionality.

```typescript
export default defineConfig({
  search: {
    enabled: true,
  },
})
```

---

## LLMs

### llms.enabled

- **Type:** `boolean`
- **Default:** `true`

Generate llms.txt files for AI assistants.

### llms.title

- **Type:** `string`
- **Default:** Site title

Custom title for llms.txt.

### llms.description

- **Type:** `string`
- **Default:** Site description

Custom description for llms.txt.

```typescript
export default defineConfig({
  llms: {
    enabled: true,
    title: 'My Project Documentation',
    description: 'Complete API reference and guides',
  },
})
```

---

## Full Example

```typescript
import { defineConfig } from 'revitedocs'

export default defineConfig({
  title: 'My Project',
  description: 'Documentation for My Project',
  base: '/',

  theme: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/...' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/installation' },
          ],
        },
      ],
    },
  },

  versions: ['v2', 'v1'],
  defaultVersion: 'v2',

  locales: {
    en: { label: 'English', lang: 'en-US' },
  },
  defaultLocale: 'en',

  search: { enabled: true },
  
  llms: {
    enabled: true,
    title: 'My Project Docs',
  },
})
```

