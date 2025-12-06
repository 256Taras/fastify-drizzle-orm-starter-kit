/**
 * @file
 * Helper types for Fastify requests with TypeBox schemas
 * These types help TypeScript infer types in JavaScript files
 */

/**
 * Fastify request with typed querystring
 * @template {import('@sinclair/typebox').TSchema} TQuery
 * @typedef {import('fastify').FastifyRequest<{
 *   Querystring: import('@sinclair/typebox').Static<TQuery>
 * }>} FastifyRequestWithQuery
 */

/**
 * Fastify request with typed body
 * @template {import('@sinclair/typebox').TSchema} TBody
 * @typedef {import('fastify').FastifyRequest<{
 *   Body: import('@sinclair/typebox').Static<TBody>
 * }>} FastifyRequestWithBody
 */

/**
 * Fastify request with typed querystring and body
 * @template {import('@sinclair/typebox').TSchema} TQuery
 * @template {import('@sinclair/typebox').TSchema} TBody
 * @typedef {import('fastify').FastifyRequest<{
 *   Querystring: import('@sinclair/typebox').Static<TQuery>
 *   Body: import('@sinclair/typebox').Static<TBody>
 * }>} FastifyRequestWithQueryAndBody
 */

/**
 * Fastify request with pagination property
 * @typedef {import('fastify').FastifyRequest & {
 *   pagination: import('#libs/utils/pagination/pagination.types.jsdoc.js').PaginationParams
 * }} FastifyRequestWithPagination
 */

export {};
