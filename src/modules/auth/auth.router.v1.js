import authSchemas from "./auth.schemas.js";

/** @type {import("#@types/index.jsdoc.js").FastifyPluginTypebox} */
export default async function authRouterV1(app) {
  const { authMutations } = app.diContainer.cradle;

  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  const ONE_HOUR = 60 * 60 * 1000;

  app.post("/sign-up", {
    schema: authSchemas.signUp,

    handler(req) {
      return authMutations.signUpUser(req.body);
    },
  });

  app.post("/sign-in", {
    config: {
      rateLimit: {
        max: 15,
        timeWindow: FIFTEEN_MINUTES,
      },
    },
    handler(req) {
      return authMutations.signInUser(req.body);
    },
    schema: authSchemas.signIn,
  });

  app.post("/log-out", {
    preValidation: [app.auth([app.verifyJwtRefreshToken])],
    schema: authSchemas.logOut,

    async handler() {
      return authMutations.signOutUser();
    },
  });

  app.put("/refresh-tokens", {
    preValidation: [app.auth([app.verifyJwtRefreshToken])],
    schema: authSchemas.refreshTokens,

    async handler() {
      return authMutations.refreshUserTokens();
    },
  });

  app.post("/forgot-password", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: ONE_HOUR,
      },
    },
    schema: authSchemas.forgotPassword,

    handler(req) {
      return authMutations.forgotUserPassword(req.body);
    },
  });

  app.post("/reset-password", {
    schema: authSchemas.resetPassword,

    handler(req) {
      return authMutations.resetUserPassword(req.body);
    },
  });

  app.post("/change-password", {
    preValidation: [app.auth([app.verifyJwt])],
    schema: authSchemas.changePassword,

    handler(req) {
      return authMutations.changeUserPassword(req.body);
    },
  });
}
