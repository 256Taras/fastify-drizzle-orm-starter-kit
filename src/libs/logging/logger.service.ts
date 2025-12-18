import { requestContext } from "@fastify/request-context";
import { DefaultLogger } from "drizzle-orm";
import pino from "pino";
import type { Logger } from "pino";

import { APP_CONFIG, LOGGER_CONFIG } from "#configs/index.ts";

const PinoPrettyTransport = {
  options: {
    colorize: LOGGER_CONFIG.enableColorizedPrint,
    ignore: "serviceContext",
    levelFirst: true,
    translateTime: "SYS:HH:MM:ss.l",
  },
  target: "pino-pretty",
};

export const TerminalOptions = {
  base: {
    serviceContext: { service: APP_CONFIG.applicationName, version: APP_CONFIG.version },
  },
  level: LOGGER_CONFIG.logLevel,
  redact: {
    paths: ["pid", "hostname", "body.password"],
    remove: true,
  },
  transport: LOGGER_CONFIG.enablePrettyPrint ? PinoPrettyTransport : undefined,
};

type _LogLevel = "debug" | "error" | "fatal" | "info" | "trace" | "warn";

// @ts-expect-error - pino is callable but TypeScript doesn't recognize it properly with complex options
const loggerService: Logger = pino(TerminalOptions) as Logger;

export const logger: Logger = requestContext.get("logger") ?? loggerService;

export const databaseLogger = new DefaultLogger({
  writer: {
    /**
     * Writes a database log message to the logger
     */
    write(message: string): void {
      logger.debug(message);
    },
  },
});

export default loggerService;
