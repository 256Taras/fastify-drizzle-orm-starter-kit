/** @file Helper types for Fastify requests with TypeBox schemas These types help TypeScript infer types in JavaScript files */

/**
 * Fastify request with typed querystring
 *
 * @template {import("@sinclair/typebox").TSchema} TQuery
 * @typedef {import("fastify").FastifyRequest<{
 *   Querystring: import("@sinclair/typebox").Static<TQuery>;
 * }>} FastifyRequestWithQuery
 */

/**
 * Fastify request with typed body
 *
 * @template {import("@sinclair/typebox").TSchema} TBody
 * @typedef {import("fastify").FastifyRequest<{
 *   Body: import("@sinclair/typebox").Static<TBody>;
 * }>} FastifyRequestWithBody
 */

/**
 * Fastify request with typed params
 *
 * @template {import("@sinclair/typebox").TSchema} TParams
 * @typedef {import("fastify").FastifyRequest<{
 *   Params: import("@sinclair/typebox").Static<TParams>;
 * }>} FastifyRequestWithParams
 */

/**
 * Fastify request with typed querystring and body
 *
 * @template {import("@sinclair/typebox").TSchema} TQuery
 * @template {import("@sinclair/typebox").TSchema} TBody
 * @typedef {import("fastify").FastifyRequest<{
 *   Querystring: import("@sinclair/typebox").Static<TQuery>;
 *   Body: import("@sinclair/typebox").Static<TBody>;
 * }>} FastifyRequestWithQueryAndBody
 */

/**
 * Fastify request with pagination property
 *
 * @typedef {import("fastify").FastifyRequest & {
 *   pagination: import("#libs/pagination/pagination.types.jsdoc.js").PaginationParams | undefined;
 * }} FastifyRequestWithPagination
 */

/**
 * Extended FastifyRequest that always includes pagination property This type extends the base FastifyRequest to include
 * pagination Use this type in route handlers when paginationPlugin is registered
 *
 * @template {import("fastify").RouteGenericInterface} [TRouteGeneric=import('fastify').RouteGenericInterface] Default is
 *   `import('fastify').RouteGenericInterface`
 * @typedef {import("fastify").FastifyRequest<TRouteGeneric> & {
 *   pagination: import("#libs/pagination/pagination.types.jsdoc.js").PaginationParams | undefined;
 * }} FastifyRequestExtended
 */

export {};
