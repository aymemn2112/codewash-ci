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
      // Thresholds are set in test/characterization once the baseline
      // coverage is measured. See docs/TESTING.md.
    },
  },
})