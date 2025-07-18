import { defineConfig } from 'vitest/config'
import * as path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    name: 'backend',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  }
})
