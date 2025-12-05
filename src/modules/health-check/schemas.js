import { Type } from "@sinclair/typebox";

export const SIMPLE_SYSTEM_HEALTH_SCHEMA = Type.Object(
  {
    memoryUsage: Type.Object({
      arrayBuffers: Type.Number(),
      external: Type.Number(),
      heapTotal: Type.Number(),
      heapUsed: Type.Number(),
      rss: Type.Number(),
    }),
    timestamp: Type.Number(),
    // The description field will be used by the swagger
    // generator to describe the route.
    // description: 'Returns status and version of the application',
    uptime: Type.Number(),
  },
  { additionalProperties: false },
);

export const SYSTEM_HEALTH_SCHEMA = Type.Object(
  {
    activeRequests: Type.Object({
      currentAsyncId: Type.Number(),
    }),
    database: Type.Object({
      status: Type.String(),
    }),
    diskSpace: Type.Array(
      Type.Object({
        filesystem: Type.String(),
        free: Type.Number(),
        mount: Type.String(),
        size: Type.Any(),
      }),
    ),
    environment: Type.String(),
    eventLoopLag: Type.Number(),
    memoryUsage: Type.Object({
      arrayBuffers: Type.Number(),
      external: Type.Number(),
      heapTotal: Type.Number(),
      heapUsed: Type.Number(),
      rss: Type.Number(),
    }),
    osLoad: Type.Array(Type.Number()),
    pid: Type.Number(),
    timestamp: Type.Number(),
    uptime: Type.Number(),
    versions: Type.Object({
      application: Type.String(),
      fastify: Type.String(),
      node: Type.String(),
    }),
  },
  { additionalProperties: false },
);
export default {
  basic: {
    // You can define different schemas
    // based on the response status code.
    // Be aware that if you are using a response
    // schema, and you don't define property, this property
    // will not be serialized in the final response, even if you
    // are returing it in your route handler.
    response: {
      // You can define different schemas
      // based on the response status code.
      // Be aware that if you are using a response
      // schema, and you don't define property, this property
      // will not be serialized in the final response, even if you
      // are returning it in your route handler.
      200: SIMPLE_SYSTEM_HEALTH_SCHEMA,
    },
    tags: ["dev"],
  },
  extended: {
    response: {
      200: SYSTEM_HEALTH_SCHEMA,
    },
    tags: ["dev"],
  },
};
