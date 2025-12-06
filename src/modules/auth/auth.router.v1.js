import authSchemas from "./auth.schemas.js";

/** @type {import("#@types/index.jsdoc.js").FastifyPluginTypebox} */
export default async function authRouterV1(app) {
  const { authService } = app.diContainer.cradle;

  app.post("/sign-up", {
    schema: authSchemas.signUp,

    handler(req) {
      return authService.signUpUser(req.body);
    },
  });

  app.post("/sign-in", {
    handler(req) {
      return authService.signInUser(req.body);
    },
    schema: authSchemas.signIn,
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
