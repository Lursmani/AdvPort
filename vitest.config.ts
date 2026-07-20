import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Keep test discovery out of tool-managed git worktrees, which contain
    // full checked-out copies of the repo (and its tests).
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
  resolve: {
    alias: {
      // Mirror the `@/*` path alias from tsconfig.json so tests can import
      // source modules that use it.
      "@": path.resolve(__dirname, "src"),
    },
  },
});
