import type { UUID } from "node:crypto";

import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import bookingsSchemas from "./bookings.schemas.ts";

const bookingsRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { bookingsMutations, bookingsQueries } = app.diContainer.cradle;

  app.get("/", {
    preHandler: app.auth([app.verifyJwt]),
    schema: bookingsSchemas.getMany,
    handler: (req) => bookingsQueries.findManyByUserId(app.transformers.getPaginationQuery(req)),
  });

  app.get("/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: bookingsSchemas.getOne,
    handler: (req) => bookingsQueries.findOneById(req.params.id),
  });

  app.post("/", {
    preHandler: app.auth([app.verifyJwt]),
    schema: bookingsSchemas.createOne,
    handler: async (req, rep) => {
      rep.status(201);
      return bookingsMutations.createBooking(req.body);
    },
  });

  app.patch("/:id/cancel", {
    preHandler: app.auth([app.verifyJwt]),
    schema: bookingsSchemas.cancelOne,
    handler: (req) => bookingsMutations.cancelBooking(req.params.id as UUID, req.body),
  });

  app.patch("/:id/confirm", {
    preHandler: app.auth([app.verifyJwt]),
    schema: bookingsSchemas.confirmOne,
    handler: (req) => bookingsMutations.confirmBooking(req.params.id as UUID),
  });

  app.patch("/:id/complete", {
    preHandler: app.auth([app.verifyJwt]),
    schema: bookingsSchemas.completeOne,
    handler: (req) => bookingsMutations.completeBooking(req.params.id as UUID),
  });
};

export default bookingsRouterV1;
