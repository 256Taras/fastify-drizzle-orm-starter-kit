import usersSchemas from "./users.schemas.js";

/** @type {import("#@types/fastify-plugin.jsdoc.js").FastifyPluginAsyncTypeboxExtended} */
export default async function usersRouterV1(app) {
  const { sessionStorageService, usersService } = app.diContainer.cradle;

  app.get("/profile", {
    preHandler: app.auth([app.verifyJwt]),
    schema: usersSchemas.getProfile,

    async handler() {
      const { id } = sessionStorageService.get();

      return usersService.findOneById(id);
    },
  });

  app.get("/", {
    preHandler: app.auth([app.verifyJwt]),
    schema: usersSchemas.getList,

    async handler(req) {
      return usersService.findAll(req.query);
    },
  });
}
