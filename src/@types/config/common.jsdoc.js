/**
 * @file
 * Common configuration types
 */

import { CONFIG_SCHEMA } from "#configs/env.config.js";
import * as Config from "#configs/index.js";

/**
 * All application configurations
 * @typedef {typeof Config} Configs
 */

/**
 * Environment variables configuration
 * @typedef {import("@sinclair/typebox").Static<typeof CONFIG_SCHEMA>} Env
 */

export {};

