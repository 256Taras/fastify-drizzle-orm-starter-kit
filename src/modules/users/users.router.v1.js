import usersSchemas from "./users.schemas.js";

/** @type {import("@fastify/type-provider-typebox").FastifyPluginAsyncTypebox } */
export default async function usersRouterV1(app) {
  const { usersService, sessionStorageService } = app.diContainer.cradle;

  app.get("/profile", {
    schema: usersSchemas.getProfile,
    preHandler: app.auth([app.verifyJwt]),
    async handler() {
      const { id } = sessionStorageService.get();

      return usersService.findOneById(id);
    },
  });

  app.get("/", {
    schema: usersSchemas.getList,
    //  preHandler: app.auth([app.verifyJwt]),
    async handler(req) {
      return usersService.findAll(req.query);
    },
  });
}
