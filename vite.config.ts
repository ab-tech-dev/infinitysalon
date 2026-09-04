import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-runtime-assets',
      closeBundle() {
        for (const directory of ['video', 'shop']) {
          cpSync(
            resolve(root, 'assets', directory),
            resolve(root, 'dist', 'assets', directory),
            { recursive: true },
          )
        }
      },
    },
  ],
})
