import { ENV_CONFIG } from "./env.config.ts";

export const SERVER_CONFIG = {
  ip: ENV_CONFIG.IP ?? "localhost",
  port: ENV_CONFIG.HTTP_PORT ?? 3000,
  requestTimeout: ENV_CONFIG.REQUEST_TIMEOUT ?? 6000,
  shutdownTimeout: ENV_CONFIG.SHUTDOWN_TIMEOUT ?? 5000,
} as const;
