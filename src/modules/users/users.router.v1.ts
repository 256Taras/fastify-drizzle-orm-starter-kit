import type { UUID } from "node:crypto";

import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import usersSchemas from "./users.schemas.ts";

const usersRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { usersMutations, usersQueries } = app.diContainer.cradle;

  app.get("/profile", {
    preHandler: app.auth([app.verifyJwt]),
    schema: usersSchemas.getProfile,
    handler: () => usersQueries.getProfile(),
  });

  app.get("/", {
    schema: usersSchemas.getList,

    async handler(req) {
      const pagination = app.transformers.getPaginationQuery(req);
      return usersQueries.findMany(pagination);
    },
  });

  app.get("/:id", {
    schema: usersSchemas.getById,

    async handler(req) {
      return usersQueries.findOneById(req.params.id);
    },
  });

  app.post("/", {
    schema: usersSchemas.create,

    async handler(req, rep) {
      const user = await usersMutations.createUser(req.body);
      rep.status(201);
      return user;
    },
  });

  app.put("/:id", {
    schema: usersSchemas.update,

    async handler(req) {
      return usersMutations.updateUser(req.params.id as UUID, req.body);
    },
  });

  app.delete("/:id", {
    schema: usersSchemas.delete,

    async handler(req) {
      return usersMutations.deleteUser(req.params.id);
    },
  });
};

export default usersRouterV1;
