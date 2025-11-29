---
title: Quick Start
description: Create your first ReviteDocs site in 5 minutes
---

Let's create a documentation site in under 5 minutes.

## Step 1: Create a New Project

```bash
mkdir my-docs
cd my-docs
npm init -y
npm install revitedocs react react-dom
```

## Step 2: Create Your First Page

Create `docs/index.md`:

```markdown
---
title: Welcome
description: My awesome documentation
---

# Welcome to My Docs

This is my documentation site built with ReviteDocs.

## Features

- Fast and modern
- Beautiful by default
- Easy to customize
```

## Step 3: Add Configuration

Create `docs/.revitedocs/config.ts`:

```typescript
import { defineConfig } from 'revitedocs'

export default defineConfig({
  title: 'My Docs',
  description: 'My awesome documentation',
  theme: {
    nav: [
      { text: 'Guide', link: '/guide/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
          ],
        },
      ],
    },
  },
})
```

## Step 4: Start the Dev Server

```bash
npx revitedocs dev ./docs
```

Open `http://localhost:3000` to see your site!

## Step 5: Build for Production

```bash
npx revitedocs build ./docs
```

Your static site will be in `docs/dist/`.

## What's Next?

**Explore More:**
- Learn about [Markdown Features](/guide/markdown)
- Add [Custom Components](/guide/components)
- Configure [Search](/guide/search)

