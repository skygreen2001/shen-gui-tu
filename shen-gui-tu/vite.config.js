import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const pptSource = resolve(rootDir, '../docs/ppt/申归途H5.html')
const pptTarget = resolve(rootDir, 'dist/ppt.html')

// 构建完成后把 docs/ppt/申归途H5.html 复制为 dist/ppt.html
function copyPptPlugin() {
  return {
    name: 'copy-ppt-html',
    apply: 'build',
    closeBundle() {
      mkdirSync(dirname(pptTarget), { recursive: true })
      copyFileSync(pptSource, pptTarget)
      console.log(`[copy-ppt-html] ${pptSource} -> ${pptTarget}`)
    }
  }
}

export default defineConfig({
  plugins: [react(), copyPptPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000,
    rollupOptions: { output: { manualChunks: undefined } }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    css: true
  }
})
