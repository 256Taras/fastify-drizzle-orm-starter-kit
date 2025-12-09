/** @file Common types for pagination system Centralized type definitions to avoid duplication */

/**
 * Drizzle ORM column type
 *
 * @typedef {import("drizzle-orm").Column} DrizzleColumn
 */

/**
 * Drizzle table columns record
 *
 * @typedef {Record<string, DrizzleColumn>} TableColumns
 */

/**
 * Query parameters from request (Fastify query type)
 *
 * @typedef {Record<string, string | string[] | undefined>} QueryParams
 */

/**
 * Filter parameters record
 *
 * @typedef {Record<string, string | string[]>} FilterParams
 */

export {};
