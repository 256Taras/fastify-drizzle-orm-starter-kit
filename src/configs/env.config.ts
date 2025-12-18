import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
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
    ENV_NAME: Type.String(),
    HTTP_PORT: Type.Integer(),
    IP: Type.String(),
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: Type.String(),
    JWT_ACCESS_TOKEN_SECRET: Type.String(),
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: Type.String(),
    JWT_REFRESH_TOKEN_SECRET: Type.String(),
    LOG_LEVEL: Type.Union(["trace", "debug", "info", "warn", "error", "fatal"].map((i) => Type.Literal(i))),
    RATE_LIMIT_MAX: Type.Integer(),
    RATE_LIMIT_TIME_WINDOW: Type.Integer(),
    REQUEST_TIMEOUT: Type.Integer(),
    SHUTDOWN_TIMEOUT: Type.Integer(),
    VERSION: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

const getEnvFilePath = (): string => {
  const env = process.env.ENV_NAME || "development";
  if (env === "development") {
    return "configs/.env";
  }
  return `configs/.env.${env}`;
};

export type Env = Static<typeof CONFIG_SCHEMA>;

export const ENV_CONFIG: Env = envSchema({
  dotenv: { path: getEnvFilePath() },
  schema: CONFIG_SCHEMA,
});

export const isDev = (): boolean => ENV_CONFIG.ENV_NAME === "development";
export const isTest = (): boolean => ENV_CONFIG.ENV_NAME === "test";
export const isProd = (): boolean => ENV_CONFIG.ENV_NAME === "production";
