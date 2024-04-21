// eslint-disable-next-line node/no-unpublished-import
import { defineConfig } from "drizzle-kit";

import { ENV_CONFIG } from "#configs/env.config.js";

export default defineConfig({
  schema: "src/**/*.model.js",
  out: "infra/database/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: ENV_CONFIG.DATABASE_URL,
  },
});
