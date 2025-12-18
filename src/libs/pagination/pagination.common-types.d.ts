/** @file Common types for pagination system Centralized type definitions to avoid duplication */

import type { Column } from "drizzle-orm";

/**
 * Drizzle ORM column type
 */
export type DrizzleColumn = Column;

/**
 * Query parameters from request (Fastify query type)
 */
export type QueryParams = Record<string, string | string[] | undefined>;

/**
 * Drizzle table columns record
 */
export type TableColumns = Record<string, DrizzleColumn>;
