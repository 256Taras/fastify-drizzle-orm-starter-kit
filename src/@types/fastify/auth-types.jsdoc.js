/**
 * @file
 * Fastify Auth types
 *
 * Local types for \@fastify/auth to avoid import issues
 * Matches the type from \@fastify/auth package
 */

/**
 * Fastify Auth Function type
 * Matches fastifyAuth.FastifyAuthFunction from \@fastify/auth
 * @template {import('fastify').FastifyRequest} [Request=import('fastify').FastifyRequest]
 * @template {import('fastify').FastifyReply} [Reply=import('fastify').FastifyReply]
 * @typedef {(this: import('fastify').FastifyInstance, request: Request, reply: Reply) => Promise<void> | void} FastifyAuthFunction
 */

export {};
