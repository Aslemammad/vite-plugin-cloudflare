import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})

