import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import reviewsSchemas from "./reviews.schemas.ts";

const reviewsRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { reviewsMutations, reviewsQueries } = app.diContainer.cradle;

  app.get<{ Params: { serviceId: string } }>("/service/:serviceId", {
    schema: reviewsSchemas.getByServiceId,

    async handler(req) {
      const pagination = app.transformers.getPaginationQuery(req);
      return reviewsQueries.findManyByServiceId(req.params.serviceId, pagination);
    },
  });

  app.post("/booking/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: reviewsSchemas.create,

    async handler(req, rep) {
      const review = await reviewsMutations.createReview(req.params.id, req.body);
      rep.status(201);
      return review;
    },
  });
};

export default reviewsRouterV1;
