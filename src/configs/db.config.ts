import { ENV_CONFIG } from "./env.config.ts";

export const DB_CONFIG = {
  databaseUrl: ENV_CONFIG.DATABASE_URL,
  timeout: ENV_CONFIG.DATABASE_TIMEOUT,
} as const;
