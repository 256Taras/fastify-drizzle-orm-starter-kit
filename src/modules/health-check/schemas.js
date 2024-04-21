import { Type } from "@sinclair/typebox";

export const SIMPLE_SYSTEM_HEALTH_SCHEMA = Type.Object(
  {
    // The description field will be used by the swagger
    // generator to describe the route.
    // description: 'Returns status and version of the application',
    uptime: Type.Number(),
    memoryUsage: Type.Object({
      rss: Type.Number(),
      heapTotal: Type.Number(),
      heapUsed: Type.Number(),
      external: Type.Number(),
      arrayBuffers: Type.Number(),
    }),
    timestamp: Type.Number(),
  },
  { additionalProperties: false },
);

export const SYSTEM_HEALTH_SCHEMA = Type.Object(
  {
    uptime: Type.Number(),
    memoryUsage: Type.Object({
      rss: Type.Number(),
      heapTotal: Type.Number(),
      heapUsed: Type.Number(),
      external: Type.Number(),
      arrayBuffers: Type.Number(),
    }),
    osLoad: Type.Array(Type.Number()),
    eventLoopLag: Type.Number(),
    database: Type.Object({
      status: Type.String(),
    }),
    versions: Type.Object({
      node: Type.String(),
      fastify: Type.String(),
      application: Type.String(),
    }),
    diskSpace: Type.Array(
      Type.Object({
        filesystem: Type.String(),
        size: Type.Any(),
        free: Type.Number(),
        mount: Type.String(),
      }),
    ),
    environment: Type.String(),
    pid: Type.Number(),
    activeRequests: Type.Object({
      currentAsyncId: Type.Number(),
    }),
    timestamp: Type.Number(),
  },
  { additionalProperties: false },
);
export default {
  basic: {
    tags: ["dev"],
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
  },
  extended: {
    tags: ["dev"],
    response: {
      200: SYSTEM_HEALTH_SCHEMA,
    },
  },
};
