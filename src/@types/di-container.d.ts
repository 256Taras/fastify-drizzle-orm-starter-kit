// eslint-disable-next-line import/named,node/file-extension-in-import
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Logger } from "pino";

import encrypterService from "#libs/services/encrypter.service";
import sessionStorageService from "#libs/services/session-storage.service";
import authService from "#modules/auth/auth.service";
import usersService from "#modules/users/users.service";
import authTokenService from "#modules/auth/auth-token.service";

declare global {
  interface Dependencies {
    encrypterService: ReturnType<typeof encrypterService>;
    sessionStorageService: ReturnType<typeof sessionStorageService>;

    db: PostgresJsDatabase;
    logger: Logger;

    usersService: ReturnType<typeof usersService>;

    authService: ReturnType<typeof authService>;
    authTokenService: ReturnType<typeof authTokenService>;
  }
}

declare module "@fastify/awilix" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  interface Cradle extends Dependencies {
    [key: string]: Record<string, any>;
  }
}
