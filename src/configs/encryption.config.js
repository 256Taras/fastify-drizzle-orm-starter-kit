import { ENV_CONFIG } from "./env.config.js";

export const ENCRYPTION_CONFIG = {
  key: ENV_CONFIG.ENCRYPTION_KEY,
  algorithm: "aes-256-cbc",
  saltRounds: 10,
  keyLength: 64,
};

