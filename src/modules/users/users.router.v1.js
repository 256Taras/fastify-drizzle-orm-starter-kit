import usersSchemas from "./users.schemas.js";

/** @type {import("#@types/index.jsdoc.js").FastifyPluginTypebox} */
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
    // preHandler: app.auth([app.verifyJwt]),
    schema: usersSchemas.getList,

    async handler(req) {
      const pagination = app.transformers.getPaginationQuery(req);

      const result = await usersService.findAll(pagination);
      return result;
    },
  });
}
