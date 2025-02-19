import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
      outDir: 'dist'
  },
  publicDir: 'public',
  //base: '/dist/' // build local
  base: '/communities-directory/dist/' // build at gh-pages
})

