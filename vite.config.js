import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
// https://vite.dev/config/

function injectSwBuildVersion() {
  return {
    name: 'inject-sw-build-version',
    closeBundle() {
      const swPath = resolve('./dist/sw.js')
      const sw = readFileSync(swPath, 'utf8')
      writeFileSync(swPath, sw.replace('__BUILD_VERSION__', Date.now()))
    },
  }
}

export default ({ mode }) => {
  // 1. Carga las variables de entorno que empiecen por VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return defineConfig({
    plugins: [react(), injectSwBuildVersion()],
    root: './',
    build: {
        outDir: 'dist'
    },
    publicDir: 'public',
    base: env.VITE_BASE // build at gh-pages
  })
}