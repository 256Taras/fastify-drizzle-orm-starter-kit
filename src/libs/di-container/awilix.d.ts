/**
 * @file Awilix Cradle type definition
 *
 * Defines the Cradle type for dependency injection container.
 * Import and use this type directly instead of relying on module augmentation.
 */

import type { Dependencies } from "./container.types.d.ts";

/**
 * Global container with all singleton dependencies
 *
 * This type represents the DI container cradle available via:
 * - `app.diContainer.cradle` in Fastify plugins and routes
 * - Function parameters in services, repositories, queries, and mutations
 *
 * @example
 * ```typescript
 * import type { Cradle } from "@fastify/awilix";
 *
 * function myService({ db, logger }: Cradle) {
 *   // ...
 * }
 * ```
 */
export type Cradle = Dependencies;

/**
 * Request-scoped container (currently unused)
 *
 * This type would be used for request-specific dependencies.
 * Available via: request.diScope.cradle
 */
export type RequestCradle = Record<string, never>;

/**
 * Module augmentation for @fastify/awilix
 *
 * This extends the @fastify/awilix module to provide type information
 * for the Cradle and RequestCradle interfaces.
 */
declare module "@fastify/awilix" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Cradle extends Dependencies {}

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RequestCradle {}
}
