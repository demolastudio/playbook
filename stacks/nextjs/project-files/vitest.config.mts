// Tests run in plain Node against a real Postgres (.playbook/playbooks/core/testing.md).
// A separate file: vite.config.ts's Worker plugins break Node drivers such as pg.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    fileParallelism: false, // test files share one database
    exclude: ["e2e/**", "node_modules/**", ".playbook/**"],
  },
});
