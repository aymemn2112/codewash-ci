import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest configuration for CodeWashGame.
// See docs/TESTING.md for the strategy (clock, randomness, audio, speech).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/test/**',
        'src/**/*.{test,spec}.{js,jsx}',
        'src/constants/**',
      ],
      // Measured baseline after the characterization suite:
      // statements 47.71%, branches 40.52%, functions 39.25%, lines 50.09%.
      // Set just below the measurement to leave a small margin; ratchet upward
      // as new tests land (see docs/TESTING.md).
      thresholds: {
        statements: 45,
        branches: 38,
        functions: 37,
        lines: 45,
      },
    },
  },
})