/**
 * @file Database types for Kysely automatically inferred from Drizzle schemas
 *
 *   Uses official Drizzle Team solution: Kyselify type from drizzle-orm/kysely This automatically converts Drizzle types to
 *   Kysely types - no manual typing needed!
 * @see {@link https://github.com/drizzle-team/drizzle-kysely} Official example
 */

import { schema } from "#infra/database/db-schema.js";

/**
 * Database interface for Kysely with automatic type inference from Drizzle
 *
 * Kyselify automatically converts Drizzle table types to Kysely-compatible types. Table names in Kysely match database table
 * names (snake_case for auth_tokens).
 *
 * @typedef {object} Database
 * @property {import("drizzle-orm/kysely").Kyselify<typeof schema.users>} users
 * @property {import("drizzle-orm/kysely").Kyselify<typeof schema.authTokens>} auth_tokens
 */

/**
 * Kysely database instance type Types are automatically inferred from Drizzle schema using Kyselify! Note: Using
 * PostgresJsDatabase from drizzle-orm which is compatible with Kysely types
 *
 * @typedef {import("drizzle-orm/postgres-js").PostgresJsDatabase<Database>} KyselyDatabase
 */

export {};
