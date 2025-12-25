/** @file Auth module types */

import type authPasswordResetTokenRepository from "./auth-password-reset-token.repository.ts";
import type authTokenRepository from "./auth-token.repository.ts";
import type authTokenService from "./auth-token.service.ts";
import type authMutations from "./auth.mutations.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    authMutations: ReturnType<typeof authMutations>;
    authPasswordResetTokenRepository: ReturnType<typeof authPasswordResetTokenRepository>;
    authTokenRepository: ReturnType<typeof authTokenRepository>;
    authTokenService: ReturnType<typeof authTokenService>;
  }
}
