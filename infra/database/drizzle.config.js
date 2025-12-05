import { defineConfig } from "drizzle-kit";

import { ENV_CONFIG } from "#configs/env.config.js";

export default defineConfig({
  dbCredentials: {
    url: ENV_CONFIG.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "infra/database/migrations",
  schema: "src/**/*.model.js",
});
