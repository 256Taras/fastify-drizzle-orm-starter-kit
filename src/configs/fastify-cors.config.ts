import { ENV_CONFIG } from "./env.config.ts";

const parseAllowedOrigins = (): boolean | string[] => {
  const origins = ENV_CONFIG.ALLOWED_ORIGINS;
  if (!origins || origins === "*") {
    return true;
  }
  return origins.split(",").map((origin) => origin.trim());
};

export const FASTIFY_CORS_CONFIG = {
  allowedHeaders: ["Origin", "Content-Type", "X-Requested-With", "Authorization", "Accept"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
  origin: parseAllowedOrigins(),
  preflightContinue: true,
} as const;
