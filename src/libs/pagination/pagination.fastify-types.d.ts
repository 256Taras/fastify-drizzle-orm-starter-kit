/**
 * @file Fastify pagination type augmentation
 *
 * Extends FastifyInstance with pagination transformers using declare module "fastify".
 * This adds the `transformers.getPaginationQuery()` method to FastifyInstance.
 */

import type { FastifyRequest, RouteGenericInterface } from "fastify";

import type { PaginationParams } from "./pagination.types.d.ts";
/**
 * Get pagination query from request
 *
 * This helper ensures proper type inference for req.pagination.
 * Works for both offset and cursor pagination strategies.
 *
 * @example
 * ```typescript
 * const paginationParams = app.transformers.getPaginationQuery<typeof routeGeneric, "offset">(req);
 * ```
 */
export type GetPaginationQueryFunction<
  TRouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  TStrategy extends "cursor" | "offset" = "offset",
> = (
  request: {
    pagination?: PaginationParams<TStrategy> | undefined;
  } & FastifyRequest<TRouteGeneric>,
) => PaginationParams<TStrategy>;

/**
 * Pagination transformers interface
 */
export interface PaginationTransformers {
  getPaginationQuery: GetPaginationQueryFunction;
}

/**
 * Augment Fastify with pagination transformers
 *
 * This adds the following methods to FastifyInstance:
 * - transformers.getPaginationQuery() - Extract pagination params from request
 */
declare module "fastify" {
  interface FastifyInstance {
    transformers: PaginationTransformers;
  }
}
