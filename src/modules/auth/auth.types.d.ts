import type authPasswordResetTokenRepository from "./auth-password-reset-token.repository.ts";
import type authTokenRepository from "./auth-token.repository.ts";
import type authTokenService from "./auth-token.service.ts";
import type authMutations from "./auth.mutations.ts";

import type { User } from "#modules/users/users.contracts.ts";

export interface AuthPasswordChangedPayload {
  user: User;
}

export interface AuthSignedInPayload {
  user: User;
}

export interface AuthSignedOutPayload {
  userId: string;
}

export interface AuthSignedUpPayload {
  user: User;
}

declare module "@fastify/awilix" {
  interface Cradle {
    authMutations: ReturnType<typeof authMutations>;
    authPasswordResetTokenRepository: ReturnType<typeof authPasswordResetTokenRepository>;
    authTokenRepository: ReturnType<typeof authTokenRepository>;
    authTokenService: ReturnType<typeof authTokenService>;
  }
}
