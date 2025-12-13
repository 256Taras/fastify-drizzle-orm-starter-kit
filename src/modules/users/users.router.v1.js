import usersSchemas from "./users.schemas.js";

/** @type {import("#@types/index.jsdoc.js").FastifyPluginTypebox} */
export default async function usersRouterV1(app) {
  const { sessionStorageService, usersMutations, usersQueries } = app.diContainer.cradle;

  app.get("/profile", {
    async handler() {
      const { id } = sessionStorageService.get();
      return usersQueries.findOneById(id);
    },
    preHandler: app.auth([app.verifyJwt]),
    schema: usersSchemas.getProfile,
  });

  app.get("/", {
    async handler(req) {
      const pagination = app.transformers.getPaginationQuery(req);
      return usersQueries.findMany(pagination);
    },
    schema: usersSchemas.getList,
  });

  app.get("/:id", {
    async handler(req) {
      return usersQueries.findOneById(req.params.id);
    },
    schema: usersSchemas.getById,
  });

  app.post("/", {
    async handler(req, rep) {
      const user = await usersMutations.createUser(req.body);
      rep.status(201);
      return user;
    },
    schema: usersSchemas.create,
  });

  app.put("/:id", {
    async handler(req) {
      return usersMutations.updateUser(req.params.id, req.body);
    },
    schema: usersSchemas.update,
  });

  app.delete("/:id", {
    async handler(req) {
      return usersMutations.deleteUser(req.params.id);
    },
    schema: usersSchemas.delete,
  });
}
