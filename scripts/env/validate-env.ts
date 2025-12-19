import { readFileSync } from "node:fs";
import { join } from "node:path";

import { logger } from "#libs/logging/logger.service.ts";

const CONFIG_DIR = join(import.meta.dirname, "../../configs");

const parseEnvKeys = (content: string): Set<string> =>
  new Set(
    content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split("=")[0]?.trim())
      .filter(Boolean),
  );

const readEnvFile = (path: string): null | string => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
};

const envContent = readEnvFile(join(CONFIG_DIR, ".env"));
const exampleContent = readEnvFile(join(CONFIG_DIR, ".env.example"));

if (!exampleContent) {
  logger.error(".env.example not found");
  process.exit(1);
}

if (!envContent) {
  logger.error(".env not found. Run: cp configs/.env.example configs/.env");
  process.exit(1);
}

const envKeys = parseEnvKeys(envContent);
const exampleKeys = parseEnvKeys(exampleContent);

const missing = [...exampleKeys].filter((key) => !envKeys.has(key));
const extra = [...envKeys].filter((key) => !exampleKeys.has(key));

if (missing.length > 0) logger.error({ missing }, "Missing environment variables");
if (extra.length > 0) logger.warn({ extra }, "Extra variables not in .env.example");

if (missing.length > 0) process.exit(1);

logger.info("Environment validated");
