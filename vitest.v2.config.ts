import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src-v2/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@v2": path.resolve(__dirname, "./src-v2"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

