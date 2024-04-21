import { ENV_CONFIG } from "./env.config.js";

export const SERVER_CONFIG = {
  port: ENV_CONFIG.HTTP_PORT ?? 3000,
  ip: ENV_CONFIG.IP ?? "localhost",
  shutdownTimeout: ENV_CONFIG.SHUTDOWN_TIMEOUT ?? 5000, // in ms
  requestTimeout: ENV_CONFIG.REQUEST_TIMEOUT ?? 6000,
};
