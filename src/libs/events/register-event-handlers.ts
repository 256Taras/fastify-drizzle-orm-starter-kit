import { glob } from "node:fs/promises";
import path from "node:path";

import type { Cradle } from "@fastify/awilix";

import { logger } from "#libs/logging/logger.service.ts";

const basePath = path.resolve(import.meta.dirname, "../../");

export async function registerEventHandlers(cradle: Cradle): Promise<void> {
  const pattern = path.join(basePath, "modules/**/*.event-handlers.ts");

  const files: string[] = [];
  for await (const file of glob(pattern)) {
    files.push(file);
  }

  await Promise.all(
    files.map(async (file) => {
      const module = (await import(file)) as { default?: (cradle: Cradle) => void };
      const handler = module.default;

      if (typeof handler === "function") {
        handler(cradle);
        logger.debug(`[EventBus] Handler loaded: ${path.basename(file)}`);
      }
    }),
  );
}
