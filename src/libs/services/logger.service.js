import Pino from "pino";
import { requestContext } from "@fastify/request-context";

import { APP_CONFIG, LOGGER_CONFIG } from "#configs/index.js";

const PinoPrettyTransport = {
  target: "pino-pretty",
  options: {
    colorize: LOGGER_CONFIG.enableColorizedPrint,
    levelFirst: true,
    ignore: "serviceContext",
    translateTime: "SYS:HH:MM:ss.l",
  },
};

export const TerminalOptions = {
  level: LOGGER_CONFIG.logLevel,
  base: {
    serviceContext: { service: APP_CONFIG.applicationName, version: APP_CONFIG.version },
  },
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

export default loggerService;
