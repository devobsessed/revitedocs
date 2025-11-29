import { describe, it, expect } from 'vitest'
import { createMarkdownProcessor, extractFrontmatter, extractToc, transformMarkdown } from './markdown.js'

describe('markdown', () => {
  describe('extractFrontmatter', () => {
    it('extracts YAML frontmatter from markdown', () => {
      const content = `---
title: Hello World
description: A test page
---

# Content here`

      const result = extractFrontmatter(content)

      expect(result.frontmatter).toEqual({
        title: 'Hello World',
        description: 'A test page',
      })
      expect(result.content.trim()).toBe('# Content here')
    })

    it('returns empty frontmatter when none present', () => {
      const content = '# Just a heading'

      const result = extractFrontmatter(content)

      expect(result.frontmatter).toEqual({})
      expect(result.content).toBe('# Just a heading')
    })

    it('handles empty frontmatter block', () => {
      const content = `---
---

# Content`

      const result = extractFrontmatter(content)

      expect(result.frontmatter).toEqual({})
    })
  })

  describe('extractToc', () => {
    it('extracts headings with IDs', () => {
      const content = `# Introduction

Some text

## Getting Started

More text

### Installation

## Configuration`

      const toc = extractToc(content)

      expect(toc).toHaveLength(4)
      expect(toc[0]).toEqual({ depth: 1, text: 'Introduction', id: 'introduction' })
      expect(toc[1]).toEqual({ depth: 2, text: 'Getting Started', id: 'getting-started' })
      expect(toc[2]).toEqual({ depth: 3, text: 'Installation', id: 'installation' })
      expect(toc[3]).toEqual({ depth: 2, text: 'Configuration', id: 'configuration' })
    })

    it('handles headings with special characters', () => {
      const content = `## What's New in v2.0?

### C++ Support`

      const toc = extractToc(content)

      expect(toc[0].id).toBe('whats-new-in-v20')
      expect(toc[1].id).toBe('c-support')
    })

    it('returns empty array for content without headings', () => {
      const content = 'Just some text without headings.'

      const toc = extractToc(content)

      expect(toc).toEqual([])
    })
  })

  describe('createMarkdownProcessor', () => {
    it('creates a unified processor', async () => {
      const processor = await createMarkdownProcessor()

      expect(processor).toBeDefined()
      expect(typeof processor.process).toBe('function')
    })
  })

  describe('transformMarkdown', () => {
    it('transforms markdown to HTML', async () => {
      const content = '# Hello World\n\nThis is a **bold** paragraph.'

      const result = await transformMarkdown(content)

      expect(result.html).toContain('<h1')
      expect(result.html).toContain('Hello World')
      expect(result.html).toContain('<strong>bold</strong>')
    })

    it('handles GFM features (tables, strikethrough)', async () => {
      const content = `| Name | Age |
|------|-----|
| John | 30  |

~~deleted~~`

      const result = await transformMarkdown(content)

      expect(result.html).toContain('<table>')
      expect(result.html).toContain('<del>deleted</del>')
    })

    it('adds IDs to headings', async () => {
      const content = '## Getting Started'

      const result = await transformMarkdown(content)

      expect(result.html).toContain('id="getting-started"')
    })

    it('syntax highlights code blocks', async () => {
      const content = '```javascript\nconst x = 1;\n```'

      const result = await transformMarkdown(content)

      // Shiki adds spans with classes/styles for highlighting
      expect(result.html).toContain('<pre')
      expect(result.html).toContain('<code')
    })

    it('extracts frontmatter and toc', async () => {
      const content = `---
title: Test Page
---

# Introduction

## Setup`

      const result = await transformMarkdown(content)

      expect(result.frontmatter.title).toBe('Test Page')
      expect(result.toc).toHaveLength(2)
      expect(result.toc[0].text).toBe('Introduction')
    })
  })
})

