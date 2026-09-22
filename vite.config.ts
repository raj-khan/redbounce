/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
    },
  },
});
