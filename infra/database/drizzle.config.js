import { defineConfig } from "drizzle-kit";

import { ENV_CONFIG } from "#configs/env.config.ts";

export default defineConfig({
  dbCredentials: {
    url: ENV_CONFIG.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "infra/database/migrations",
  schema: "src/**/*.model.ts",
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  },
  verbose: true,
  strict: true,
});
