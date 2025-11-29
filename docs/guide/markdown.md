---
title: Markdown Features
description: Write docs with powerful markdown extensions
---

ReviteDocs supports GitHub Flavored Markdown plus custom extensions.

## Basic Syntax

All standard markdown is supported:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold** and *italic* text

- Unordered list
- Another item

1. Ordered list
2. Second item

[Links](https://example.com)

![Images](/image.png)
```

## Code Blocks

Syntax highlighting powered by Shiki:

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`
}
```

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

## Tables

| Feature | Support |
|---------|---------|
| GFM Tables | ✅ |
| Alignment | ✅ |
| Complex content | ✅ |

## Callouts

Use container directives for callouts:

```markdown
::: info
This is an informational callout.
:::

::: tip
Pro tips go here!
:::

::: warning
Be careful about this.
:::

::: danger
This is dangerous!
:::
```

**Available types:** `info`, `tip`, `warning`, `danger`, `note`

## Tabs

Group related content in tabs using the TabGroup component (in MDX files):

```mdx
<TabGroup labels={['JavaScript', 'TypeScript', 'Python']}>
  <div>console.log('Hello')</div>
  <div>console.log('Hello')</div>
  <div>print('Hello')</div>
</TabGroup>
```

## Steps

Document procedures with steps:

```markdown
::: steps
### Install dependencies
npm install revitedocs

### Create configuration
Create `.revitedocs/config.ts`

### Start development
npm run dev
:::
```

## File Trees

Display directory structures:

```markdown
::: file-tree
- src/
  - components/
    - Button.tsx
    - Card.tsx
  - utils/
    - helpers.ts
  - index.ts
- package.json
- tsconfig.json
:::
```

## Frontmatter

Every page can have YAML frontmatter:

```yaml
---
title: Page Title
description: SEO description
---
```

## MDX Components

Import and use React components:

```mdx
import { CustomComponent } from './components'

# My Page

<CustomComponent prop="value" />
```

