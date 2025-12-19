/** @file Auth module types */

import type authTokenService from "./auth-token.service.ts";
import type authMutations from "./auth.mutations.ts";
import type authRepository from "./auth.repository.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    authMutations: ReturnType<typeof authMutations>;
    authRepository: ReturnType<typeof authRepository>;
    authTokenService: ReturnType<typeof authTokenService>;
  }
}
