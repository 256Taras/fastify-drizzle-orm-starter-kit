import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import bookingsSchemas from "./bookings.schemas.ts";

const bookingsRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { bookingsMutations, bookingsQueries } = app.diContainer.cradle;

  app.addHook("preHandler", app.auth([app.verifyJwt]));

  app.get("/", {
    schema: bookingsSchemas.getMany,
    async handler(req) {
      return bookingsQueries.findManyByUserId(app.transformers.getPaginationQuery(req));
    },
  });

  app.get("/:id", {
    schema: bookingsSchemas.getOne,
    async handler(req) {
      return bookingsQueries.findOneById(req.params.id);
    },
  });

  app.post("/", {
    schema: bookingsSchemas.createOne,
    async handler(req, rep) {
      rep.status(201);
      return bookingsMutations.createBooking(req.body);
    },
  });

  app.patch("/:id/cancel", {
    schema: bookingsSchemas.cancelOne,
    async handler(req) {
      return bookingsMutations.cancelBooking(req.params.id, req.body);
    },
  });

  app.patch("/:id/confirm", {
    schema: bookingsSchemas.confirmOne,
    async handler(req) {
      return bookingsMutations.confirmBooking(req.params.id);
    },
  });

  app.patch("/:id/complete", {
    schema: bookingsSchemas.completeOne,
    async handler(req) {
      return bookingsMutations.completeBooking(req.params.id);
    },
  });
};

export default bookingsRouterV1;
