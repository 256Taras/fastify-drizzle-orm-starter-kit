/**
 * @file Common configuration types
 *
 * Type definitions for application configurations and environment variables.
 */

import { CONFIG_SCHEMA } from "#configs/env.config.ts";
import * as Config from "#configs/index.ts";

/**
 * All application configurations
 *
 * This type represents all configuration modules exported from the configs directory.
 */
export type Configs = typeof Config;

/**
 * Environment variables configuration
 *
 * Type-safe environment variables validated against CONFIG_SCHEMA.
 */
export type Env = import("@sinclair/typebox").Static<typeof CONFIG_SCHEMA>;
