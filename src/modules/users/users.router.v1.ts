import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type { UserCreateInput, UserUpdateInput } from "./users.contracts.ts";
import usersSchemas from "./users.schemas.ts";

export default function usersRouterV1(app: FastifyInstance) {
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
    async handler(req: FastifyRequest) {
      const pagination = app.transformers.getPaginationQuery(req);
      return usersQueries.findMany(pagination);
    },
    schema: usersSchemas.getList,
  });

  app.get("/:id", {
    async handler(req: FastifyRequest<{ Params: { id: string } }>) {
      return usersQueries.findOneById(req.params.id);
    },
    schema: usersSchemas.getById,
  });

  app.post("/", {
    async handler(req: FastifyRequest<{ Body: UserCreateInput }>, rep: FastifyReply) {
      const user = await usersMutations.createUser(req.body);
      rep.status(201);
      return user;
    },
    schema: usersSchemas.create,
  });

  app.put("/:id", {
    async handler(req: FastifyRequest<{ Body: UserUpdateInput; Params: { id: string } }>) {
      return usersMutations.updateUser(req.params.id, req.body);
    },
    schema: usersSchemas.update,
  });

  app.delete("/:id", {
    async handler(req: FastifyRequest<{ Params: { id: string } }>) {
      return usersMutations.deleteUser(req.params.id);
    },
    schema: usersSchemas.delete,
  });
}
