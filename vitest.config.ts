import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    testTimeout: 60000, // 60s for real API calls
    hookTimeout: 30000,
    include: ["scripts/test/**/*.test.ts"],
  },
})
