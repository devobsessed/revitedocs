---
title: CLI Commands
description: ReviteDocs command line interface reference
---

ReviteDocs provides a CLI for development, building, and previewing your docs.

## revitedocs dev

Start the development server with hot module replacement.

```bash
revitedocs dev [root] [options]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `root` | Docs directory path | `.` |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port <port>` | Server port | `3000` |
| `--open` | Open browser on start | `false` |
| `--host` | Expose to network | `false` |

### Examples

```bash
# Start dev server in current directory
revitedocs dev

# Start in specific directory
revitedocs dev ./docs

# Custom port and open browser
revitedocs dev ./docs --port 8080 --open

# Expose to network
revitedocs dev --host
```

---

## revitedocs build

Build static HTML for production deployment.

```bash
revitedocs build [root] [options]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `root` | Docs directory path | `.` |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--outDir <dir>` | Output directory | `dist` |
| `--base <path>` | Public base path | `/` |
| `--skip-ssg` | Skip pre-rendering | `false` |
| `--skip-search` | Skip Pagefind index | `false` |
| `--skip-llms` | Skip llms.txt generation | `false` |
| `--skip-sitemap` | Skip sitemap.xml | `false` |
| `--site-url <url>` | Base URL for sitemap | - |

### Examples

```bash
# Build with defaults
revitedocs build ./docs

# Custom output directory
revitedocs build ./docs --outDir public

# Deploy to subdirectory
revitedocs build ./docs --base /docs/

# Skip search indexing
revitedocs build ./docs --skip-search

# Full production build with site URL
revitedocs build ./docs --site-url https://docs.example.com
```

### Output Structure

```
dist/
├── index.html          # Pre-rendered pages
├── guide/
│   └── index.html
├── assets/             # JS/CSS bundles
├── pagefind/           # Search index
├── llms.txt            # AI summary
├── llms-full.txt       # Full AI content
└── sitemap.xml         # SEO sitemap
```

---

## revitedocs preview

Preview the production build locally.

```bash
revitedocs preview [root] [options]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `root` | Docs directory path | `.` |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port <port>` | Server port | `4173` |

### Examples

```bash
# Preview build
revitedocs build ./docs
revitedocs preview ./docs

# Custom port
revitedocs preview ./docs --port 5000
```

---

## revitedocs init

Initialize a new ReviteDocs project with interactive prompts.

```bash
revitedocs init
```

### What It Creates

::: steps
### Configuration file
`.revitedocs/config.ts` with default settings

### Homepage
`index.md` with starter content

### Example page
`guide/getting-started.md`
:::

### Example

```bash
$ revitedocs init

? What is your project name? My Docs
? Where should we create your docs? ./docs
? Enable search? Yes
? Enable llms.txt? Yes

✓ Created .revitedocs/config.ts
✓ Created index.md
✓ Created guide/getting-started.md

Done! Run `npm run dev` to start writing.
```

