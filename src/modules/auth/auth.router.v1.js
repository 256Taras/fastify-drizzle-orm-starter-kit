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
    schema: authSchemas.logOut,
    preValidation: [app.auth([app.verifyJwtRefreshToken])],

    async handler() {
      return authService.signOut();
    },
  });

  app.put("/refresh-tokens", {
    schema: authSchemas.refreshTokens,
    preValidation: [app.auth([app.verifyJwtRefreshToken])],

    async handler() {
      return authService.refreshAccessToken();
    },
  });
}
