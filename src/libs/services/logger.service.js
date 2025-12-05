import { requestContext } from "@fastify/request-context";
import { DefaultLogger } from "drizzle-orm";
import Pino from "pino";

import { APP_CONFIG, LOGGER_CONFIG } from "#configs/index.js";

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

/**@typedef {'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'} LOG_LEVEL */
const loggerService = Pino(TerminalOptions);

// @ts-ignore
export const logger = requestContext.get("logger") ?? loggerService;

export const databaseLogger = new DefaultLogger({
  writer: {
    /**
     *
     * @param {string} message
     */
    write(message) {
      logger.debug(message);
    },
  },
});

export default loggerService;
