import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/

export default ({ mode }) => {
  // 1. Carga las variables de entorno que empiecen por VITE_  
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return defineConfig({
    plugins: [react()],
    root: './',
    build: {
        outDir: 'dist'
    },
    publicDir: 'public',
    base: env.VITE_BASE // build at gh-pages
  })
}