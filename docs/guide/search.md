---
title: Search
description: Full-text search powered by Pagefind
---

ReviteDocs includes full-text search powered by Pagefind.

## How It Works

1. **Development**: Uses MiniSearch for instant in-memory search
2. **Production**: Uses Pagefind for optimized static search

Search is triggered with `⌘K` (Mac) or `Ctrl+K` (Windows/Linux).

## Configuration

Enable search in your config:

```typescript
export default defineConfig({
  search: {
    enabled: true,
  },
})
```

## Search Index

The search index is automatically generated during build:

```bash
revitedocs build ./docs
```

This creates a `pagefind/` directory in your output with the search index.

## Search UI

The built-in search modal includes:

- **Keyboard navigation** - Arrow keys to navigate, Enter to select
- **Highlighting** - Search terms highlighted in results
- **Excerpts** - Context around matches
- **Fast filtering** - Results update as you type

## Customizing Search

### Excluding Content

Add `data-pagefind-ignore` to exclude content from search:

```html
<div data-pagefind-ignore>
  This content won't be indexed
</div>
```

### Custom Search Weight

Prioritize certain content:

```html
<h1 data-pagefind-weight="10">Important Title</h1>
```

### Meta Information

Add custom metadata to search results:

```html
<div data-pagefind-meta="category:guide">
  <!-- content -->
</div>
```

## Offline Search

Pagefind search works completely offline. The entire index is:

- Self-contained in static files
- Lazy-loaded on first search
- Cached by the browser

No server or API calls required.

## Performance

Pagefind is highly optimized:

| Metric | Value |
|--------|-------|
| Index size | ~1KB per page |
| Load time | < 100ms |
| Search time | < 10ms |
| Browser support | All modern browsers |

