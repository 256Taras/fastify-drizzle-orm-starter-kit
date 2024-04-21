import { FastifyAuthFunction } from "@fastify/auth";
import { FastifyInstance } from "fastify";
// eslint-disable-next-line node/file-extension-in-import,import/named
import { PostgresJsDatabase } from "drizzle-orm/postgres-js/driver";

import { logger } from "#libs/services/logger.service";

// eslint-disable-next-line import/no-duplicates
import * as configs from "../configs/index.js";

declare module "fastify" {
  interface FastifyInstance {
    verifyJwt: FastifyAuthFunction;
    verifyJwtRefreshToken: FastifyAuthFunction;
    verifyApiKey: FastifyAuthFunction;
    // eslint-disable-next-line no-use-before-define
    parseMultipartFields: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
    removeUploadIfExists: (filePath: string) => Promise<void>;
    uploadToStorage: (uploadedFile: Record<string, any>, folder: string) => Promise<string>;
    upload: (uploadedFile: Record<string, any>) => Promise<string>;
    configs: typeof configs;
  }
}

declare module "@fastify/jwt" {
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
  interface FastifyJWT {
    payload: { id: number };
    user: {
      id: number;
      name: string;
      age: number;
    };
  }
}

export declare type FastifyGlobalOptionConfig = {
  database: any;
  configs: typeof configs;
  app: FastifyInstance;
  [key: string]: any;
};

declare module "@fastify/awilix" {
  interface Cradle {
    app: FastifyInstance;
    configs: typeof configs;
    logger: typeof logger;
    db: PostgresJsDatabase;
  }
}
