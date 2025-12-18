import { ENV_CONFIG } from "./env.config.ts";

export const ENCRYPTION_CONFIG = {
  algorithm: "aes-256-cbc",
  key: ENV_CONFIG.ENCRYPTION_KEY,
  keyLength: 64,
  saltRounds: 10,
} as const;
