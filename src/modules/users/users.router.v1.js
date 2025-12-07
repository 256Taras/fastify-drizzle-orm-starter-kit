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
      // @ts-expect-error - pagination is added by paginationPlugin decorator
      // usersService.findAll uses partial, so it already has deps bound and takes paginationParams
      // partial(findAll, [deps]) creates a function that takes (paginationParams) and returns Promise
      const { pagination } = req;
      if (!pagination) {
        throw new Error("req.pagination is undefined - pagination plugin may not be registered");
      }
      const result = await usersService.findAll(pagination);
      return result;
    },
  });
}
