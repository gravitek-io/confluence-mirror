import { defineConfig } from "vitest/config";

// Unit tests run in plain Node (no DOM): the core package is framework-free.
export default defineConfig({
  test: {
    environment: "node",
    // Expose describe/it/expect globally, as the tests are written without imports.
    globals: true,
    include: ["test/**/*.test.ts"],
  },
});
