import * as p from '@clack/prompts'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'

interface InitOptions {
  docsDir: string
  title: string
  description: string
  useTypeScript: boolean
  addScripts: boolean
  scriptPrefix: string
}

export async function init(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Welcome to ReviteDocs! ')))

  const options = await promptOptions()

  if (p.isCancel(options)) {
    p.cancel('Setup cancelled.')
    process.exit(0)
  }

  const s = p.spinner()

  // Create docs directory if needed
  s.start('Creating directory structure')
  await createDirectoryStructure(options)
  s.stop('Directory structure created')

  // Create config file
  s.start('Creating config file')
  await createConfigFile(options)
  s.stop('Config file created')

  // Create example docs
  s.start('Creating example docs')
  await createExampleDocs(options)
  s.stop('Example docs created')

  // Update package.json
  if (options.addScripts) {
    s.start('Updating package.json')
    await updatePackageJson(options)
    s.stop('package.json updated')
  }

  // Install dependencies
  s.start('Installing dependencies')
  await installDependencies()
  s.stop('Dependencies installed')

  // Done!
  p.outro(pc.green('Done! Now run:'))

  console.log()
  if (options.addScripts && options.scriptPrefix) {
    console.log(pc.cyan(`  npm run ${options.scriptPrefix}:dev`))
  } else {
    console.log(pc.cyan(`  npx revitedocs dev ${options.docsDir}`))
  }
  console.log()
}

async function promptOptions(): Promise<InitOptions | symbol> {
  const docsDir = await p.text({
    message: 'Where should ReviteDocs initialize the config?',
    placeholder: './docs',
    defaultValue: './docs',
  })

  if (p.isCancel(docsDir)) return docsDir

  const title = await p.text({
    message: 'Site title:',
    placeholder: 'My Documentation',
    defaultValue: 'My Documentation',
  })

  if (p.isCancel(title)) return title

  const description = await p.text({
    message: 'Site description:',
    placeholder: 'A ReviteDocs site',
    defaultValue: 'A ReviteDocs site',
  })

  if (p.isCancel(description)) return description

  const useTypeScript = await p.confirm({
    message: 'Use TypeScript for config and theme files?',
    initialValue: true,
  })

  if (p.isCancel(useTypeScript)) return useTypeScript

  const addScripts = await p.confirm({
    message: 'Add ReviteDocs npm scripts to package.json?',
    initialValue: true,
  })

  if (p.isCancel(addScripts)) return addScripts

  let scriptPrefix = ''
  if (addScripts) {
    const prefixResult = await p.text({
      message: 'Prefix for npm scripts (e.g., "docs" → "docs:dev"):',
      placeholder: 'docs',
      defaultValue: 'docs',
    })

    if (p.isCancel(prefixResult)) return prefixResult
    scriptPrefix = prefixResult as string
  }

  return {
    docsDir: docsDir as string,
    title: title as string,
    description: description as string,
    useTypeScript: useTypeScript as boolean,
    addScripts: addScripts as boolean,
    scriptPrefix,
  }
}

async function createDirectoryStructure(options: InitOptions): Promise<void> {
  const docsPath = path.resolve(options.docsDir)
  const configPath = path.join(docsPath, '.revitedocs')

  fs.mkdirSync(configPath, { recursive: true })
}

async function createConfigFile(options: InitOptions): Promise<void> {
  const docsPath = path.resolve(options.docsDir)
  const ext = options.useTypeScript ? 'ts' : 'js'
  const configPath = path.join(docsPath, '.revitedocs', `config.${ext}`)

  const configContent = options.useTypeScript
    ? `import { defineConfig } from 'revitedocs'

export default defineConfig({
  title: '${options.title}',
  description: '${options.description}',

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
`
    : `export default {
  title: '${options.title}',
  description: '${options.description}',

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
}
`

  fs.writeFileSync(configPath, configContent)
}

async function createExampleDocs(options: InitOptions): Promise<void> {
  const docsPath = path.resolve(options.docsDir)
  const indexPath = path.join(docsPath, 'index.md')

  // Only create if doesn't exist
  if (fs.existsSync(indexPath)) {
    return
  }

  const indexContent = `---
title: ${options.title}
description: ${options.description}
---

# ${options.title}

Welcome to your new documentation site powered by ReviteDocs.

## Getting Started

Edit this file at \`${options.docsDir}/index.md\` to get started.

## Features

- 📝 Write in Markdown
- ⚡ Powered by Vite
- 🎨 Dark/Light themes
- 🔍 Built-in search
- 📱 Mobile responsive

## Learn More

Check out the [ReviteDocs documentation](https://github.com) to learn more.
`

  fs.writeFileSync(indexPath, indexContent)
}

async function updatePackageJson(options: InitOptions): Promise<void> {
  const packageJsonPath = path.resolve('package.json')

  let pkg: Record<string, unknown> = {}

  if (fs.existsSync(packageJsonPath)) {
    pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  } else {
    pkg = {
      name: path.basename(process.cwd()),
      version: '0.0.1',
      private: true,
      type: 'module',
    }
  }

  // Ensure type: module
  pkg.type = 'module'

  // Add scripts
  const scripts = (pkg.scripts || {}) as Record<string, string>
  const prefix = options.scriptPrefix || 'docs'
  const docsDir = options.docsDir

  scripts[`${prefix}:dev`] = `revitedocs dev ${docsDir}`
  scripts[`${prefix}:build`] = `revitedocs build ${docsDir}`
  scripts[`${prefix}:preview`] = `revitedocs preview ${docsDir}`

  pkg.scripts = scripts

  // Add devDependencies
  const devDeps = (pkg.devDependencies || {}) as Record<string, string>
  devDeps['revitedocs'] = 'latest'
  pkg.devDependencies = devDeps

  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function installDependencies(): Promise<void> {
  try {
    // Detect package manager
    const userAgent = process.env.npm_config_user_agent || ''
    let pm = 'npm'

    if (userAgent.includes('pnpm')) {
      pm = 'pnpm'
    } else if (userAgent.includes('yarn')) {
      pm = 'yarn'
    } else if (userAgent.includes('bun')) {
      pm = 'bun'
    }

    execSync(`${pm} install`, { stdio: 'ignore' })
  } catch {
    // Ignore install errors - user can install manually
  }
}
