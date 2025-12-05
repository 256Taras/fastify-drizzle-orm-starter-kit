import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Logger } from "pino";

import encrypterService from "#libs/services/encrypter.service";
import sessionStorageService from "#libs/services/session-storage.service";
import authTokenService from "#modules/auth/auth-token.service";
import authService from "#modules/auth/auth.service";
import usersService from "#modules/users/users.service";

declare global {
  interface Dependencies {
    authService: ReturnType<typeof authService>;
    authTokenService: ReturnType<typeof authTokenService>;

    db: PostgresJsDatabase;
    encrypterService: ReturnType<typeof encrypterService>;

    logger: Logger;

    sessionStorageService: ReturnType<typeof sessionStorageService>;
    usersService: ReturnType<typeof usersService>;
  }
}

declare module "@fastify/awilix" {
  // @ts-ignore
  interface Cradle extends Dependencies {
    [key: string]: Record<string, any>;
  }
}
