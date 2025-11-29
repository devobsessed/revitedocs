import { preview as vitePreview } from 'vite'
import path from 'node:path'

export interface PreviewOptions {
  port: number
}

export async function preview(root: string, options: PreviewOptions): Promise<void> {
  const resolvedRoot = path.resolve(root)
  
  console.log(`Previewing build in ${resolvedRoot}...`)
  console.log(`Options: port=${options.port}`)

  const server = await vitePreview({
    root: resolvedRoot,
    preview: {
      port: options.port,
    },
  })

  server.printUrls()
}
