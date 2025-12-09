import { BadRequestException } from "#libs/errors/domain.errors.js";

import { PAGINATION_STRATEGY } from "./pagination.contracts.js";
import { paginateCursor } from "./pagination.cursor.service.js";
import { paginateOffset } from "./pagination.offset.service.js";

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */

/**
 * Universal pagination function that chooses strategy based on config
 *
 * @template TTable - Drizzle table type (PgTable or similar)
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy type. Default is `'offset'`
 * @template [TItem=unknown] - Item type in the response (inferred from table). Default is `unknown`
 * @param {Dependencies} deps - Dependencies
 * @param {import("./pagination.types.jsdoc.js").PaginationConfig<TTable, TStrategy>} config - Pagination config
 * @param {import("./pagination.types.jsdoc.js").PaginationParams<TStrategy>} paginationParams - Pagination parameters
 * @param {import("./pagination.types.jsdoc.js").PaginationOptions} [options] - Additional options
 * @returns {Promise<import("./pagination.types.jsdoc.js").PaginatedResponse<TItem, TStrategy>>}
 */
const paginate = async (deps, config, paginationParams, options = {}) => {
  const { strategy = PAGINATION_STRATEGY.offset, table } = config;

  if (!paginationParams) {
    deps.logger.error("paginationParams is undefined", { config, options });
    throw new Error("paginationParams is required");
  }

  if (strategy === PAGINATION_STRATEGY.cursor) {
    // @ts-expect-error - TypeScript can't narrow TStrategy to 'cursor' here, but runtime check ensures correctness
    return paginateCursor(deps, table, config, paginationParams, options);
  }

  if (strategy === PAGINATION_STRATEGY.offset) {
    // @ts-expect-error - TypeScript can't narrow TStrategy to 'offset' here, but runtime check ensures correctness
    return paginateOffset(deps, table, config, paginationParams, options);
  }

  throw new BadRequestException(`Unknown pagination strategy: ${strategy}`);
};

/**
 * Pagination service factory
 *
 * @param {Dependencies} deps - Dependencies
 * @returns {{
 *   paginate: <TTable, TStrategy extends "offset" | "cursor" = "offset", TItem>(
 *     config: import("./pagination.types.jsdoc.js").PaginationConfig<TTable, TStrategy>,
 *     paginationParams: import("./pagination.types.jsdoc.js").PaginationParams<TStrategy>,
 *     options?: import("./pagination.types.jsdoc.js").PaginationOptions,
 *   ) => Promise<import("./pagination.types.jsdoc.js").PaginatedResponse<TItem, TStrategy>>;
 * }}
 */
export default function paginationService(deps) {
  return {
    /**
     * Paginate data based on config and params
     *
     * @template TTable - Drizzle table type (PgTable or similar)
     * @template TItem - Item type in the response (inferred from table)
     * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy type. Default is `'offset'`
     * @param {import("./pagination.types.jsdoc.js").PaginationConfig<TTable, TStrategy>} config - Pagination config
     * @param {import("./pagination.types.jsdoc.js").PaginationParams<TStrategy>} paginationParams - Pagination parameters
     * @param {import("./pagination.types.jsdoc.js").PaginationOptions} [options] - Additional options
     * @returns {Promise<import("./pagination.types.jsdoc.js").PaginatedResponse<TItem, TStrategy>>}
     */
    paginate: (config, paginationParams, options) => paginate(deps, config, paginationParams, options),
  };
}
