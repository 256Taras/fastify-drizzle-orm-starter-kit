import { FastifyAuthFunction } from "@fastify/auth";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js/driver";
import { FastifyInstance } from "fastify";

import { logger } from "#libs/services/logger.service";

import * as configs from "../configs/index.js";

declare module "fastify" {
  interface FastifyInstance {
    configs: typeof configs;

    parseMultipartFields: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
    removeUploadIfExists: (filePath: string) => Promise<void>;
    upload: (uploadedFile: Record<string, any>) => Promise<string>;
    uploadToStorage: (uploadedFile: Record<string, any>, folder: string) => Promise<string>;
    verifyApiKey: FastifyAuthFunction;
    verifyJwt: FastifyAuthFunction;
    verifyJwtRefreshToken: FastifyAuthFunction;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number };
    user: {
      age: number;
      id: number;
      name: string;
    };
  }
  interface JWT {
    accessToken: {
      sign: (payload: { id: number; name: string }) => string;
      verify: (token: string | string[]) => Promise<{ id: number; name: string }>;
    };
    // Define a namespace or specific methods/types for the refresh token
    refreshToken: {
      sign: (payload: { id: number; refreshTokenId: string }) => string;
      verify: (token: string | string[]) => Promise<{ id: number; refreshTokenId: string }>;
    };
  }
}

export declare type FastifyGlobalOptionConfig = {
  [key: string]: any;
  app: FastifyInstance;
  configs: typeof configs;
  database: any;
};

declare module "@fastify/awilix" {
  interface Cradle {
    app: FastifyInstance;
    configs: typeof configs;
    db: PostgresJsDatabase;
    logger: typeof logger;
  }
}
