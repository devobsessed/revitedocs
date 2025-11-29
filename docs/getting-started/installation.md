---
title: Installation
description: How to install and set up ReviteDocs
---

ReviteDocs can be installed via npm, yarn, or pnpm.

## Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

## Install ReviteDocs

```bash
npm install revitedocs
# or
yarn add revitedocs
# or
pnpm add revitedocs
```

## Initialize a New Project

Run the init wizard to set up your docs:

```bash
npx revitedocs init
```

This will:
1. Create a `.revitedocs/config.ts` configuration file
2. Create an `index.md` homepage
3. Set up the basic folder structure

## Project Structure

After initialization, your project will look like this:

::: file-tree
- docs/
  - .revitedocs/
    - config.ts
  - index.md
  - guide/
    - getting-started.md
:::

## Add Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "docs:dev": "revitedocs dev ./docs",
    "docs:build": "revitedocs build ./docs",
    "docs:preview": "revitedocs preview ./docs"
  }
}
```

## Start Development Server

```bash
npm run docs:dev
```

Your docs site will be available at `http://localhost:3000`.

## Next Steps

- [Quick Start](/getting-started/quick-start) - Build your first page
- [Configuration](/guide/configuration) - Customize your site

