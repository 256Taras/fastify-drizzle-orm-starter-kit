import authSchemas from "./auth.schemas.js";

/** @type {import("@fastify/type-provider-typebox").FastifyPluginAsyncTypebox } */
export default async function authRouterV1(app) {
  const { authService } = app.diContainer.cradle;

  app.post("/sign-up", {
    schema: authSchemas.signUp,

    handler(req) {
      return authService.signUpUser(req.body);
    },
  });

  app.post("/sign-in", {
    schema: authSchemas.signIn,

    handler(req) {
      return authService.signInUser(req.body);
    },
  });

  app.post("/log-out", {
    preValidation: [app.auth([app.verifyJwtRefreshToken])],
    schema: authSchemas.logOut,

    async handler() {
      return authService.signOut();
    },
  });

  app.put("/refresh-tokens", {
    preValidation: [app.auth([app.verifyJwtRefreshToken])],
    schema: authSchemas.refreshTokens,

    async handler() {
      return authService.refreshAccessToken();
    },
  });
}
