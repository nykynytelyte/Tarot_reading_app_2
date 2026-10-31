import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Local dev and local builds stay at the root. GitHub Pages serves this repo
  // from /Tarot_reading_app_2/, so the deploy workflow sets VITE_BASE instead of
  // hardcoding the subpath here (a hardcoded base breaks `npm run dev`).
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
})
