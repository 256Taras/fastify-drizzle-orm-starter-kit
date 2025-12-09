/**
 * @file Base FastifyInstance type
 *
 *   This is the foundation type that all other Fastify types extend from.
 */

/**
 * Base FastifyInstance type with TypeBox type provider support TypeBox type provider is applied via withTypeProvider() at
 * runtime
 *
 * @typedef {import("fastify").FastifyInstance<
 *   import("fastify").RawServerDefault,
 *   import("fastify").RawRequestDefaultExpression,
 *   import("fastify").RawReplyDefaultExpression,
 *   import("fastify").FastifyBaseLogger,
 *   import("@fastify/type-provider-typebox").TypeBoxTypeProvider
 * >} FastifyInstanceBase
 */

export {};
