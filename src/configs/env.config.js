import { Type } from "@sinclair/typebox";
import { envSchema } from "env-schema";

const TypeEnable = Type.Integer({
  maximum: 1,
  minimum: 0,
});

export const CONFIG_SCHEMA = Type.Object(
  {
    APPLICATION_DOMAIN: Type.String(),
    APPLICATION_NAME: Type.String(),
    APPLICATION_URL: Type.String(),
    COMPOSE_PROJECT_NAME: Type.String(),
    DATABASE_TIMEOUT: Type.Integer(),
    DATABASE_URL: Type.String(),
    ENABLE_COLORIZED_LOG: TypeEnable,
    ENABLE_DB_LOGGING: TypeEnable,
    ENABLE_DEBUG: TypeEnable,
    ENABLE_DEVELOPER_MESSAGE: TypeEnable,
    ENABLE_PERSISTENCE_FORCE_LOGGING: TypeEnable,
    ENABLE_PRETTY_LOG: TypeEnable,
    ENABLE_REQUEST_LOGGING: TypeEnable,
    ENABLE_RESPONSE_LOGGING_BODY: TypeEnable,
    ENABLE_SEEDS: TypeEnable,
    ENCRYPTION_KEY: Type.String({ minLength: 32 }),
    ENV_NAME: Type.String(), // add enum
    HTTP_PORT: Type.Integer(),
    IP: Type.String(),
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: Type.String(),
    JWT_ACCESS_TOKEN_SECRET: Type.String(),
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: Type.String(),
    JWT_REFRESH_TOKEN_SECRET: Type.String(),
    LOG_LEVEL: Type.Union(["trace", "debug", "info", "warn", "error", "fatal"].map((i) => Type.Literal(i))),
    NODE_ENV: Type.String(), // add enum
    RATE_LIMIT_MAX: Type.Integer(),
    RATE_LIMIT_TIME_WINDOW: Type.Integer(),
    REQUEST_TIMEOUT: Type.Integer(),
    SHUTDOWN_TIMEOUT: Type.Integer(),
    VERSION: Type.String(),
  },
  { additionalProperties: false },
);

/** @type {import("#@types/index.jsdoc.js").Env} */
export const ENV_CONFIG = envSchema({
  dotenv: {
    path: "configs/.env",
  },
  schema: CONFIG_SCHEMA,
});
