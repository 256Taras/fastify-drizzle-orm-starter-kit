import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import paymentsSchemas from "./payments.schemas.ts";

const paymentsRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { paymentsQueries, paymentsMutations } = app.diContainer.cradle;

  app.get("/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: paymentsSchemas.getById,

    async handler(req) {
      return paymentsQueries.findOneById(req.params.id);
    },
  });

  app.post("/bookings/:id/pay", {
    preHandler: app.auth([app.verifyJwt]),
    schema: paymentsSchemas.payBooking,

    async handler(req, rep) {
      const payment = await paymentsMutations.payBooking(req.params.id);
      rep.status(201);
      return payment;
    },
  });
};

export default paymentsRouterV1;
