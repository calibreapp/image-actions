import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*_test.{js,ts}', '__tests__/**/*.{test,spec}.{js,ts}']
  }
})