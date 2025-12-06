import { partial } from "rambda";

import { BadRequestException } from "#libs/errors/domain.errors.js";
import { PAGINATION_STRATEGY } from "#libs/utils/pagination/pagination.contracts.js";
import { paginateCursor } from "#libs/utils/pagination/pagination.cursor.service.js";
import { paginateOffset } from "#libs/utils/pagination/pagination.offset.service.js";

/**
 * @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies
 */

/**
 * Universal pagination function that chooses strategy based on config
 * @template T
 * @param {Dependencies} deps - Dependencies
 * @param {import('#libs/utils/pagination/pagination.types.jsdoc.js').PaginationConfig<T>} config - Pagination config
 * @param {import('#libs/utils/pagination/pagination.types.jsdoc.js').PaginationParams} paginationParams - Pagination parameters
 * @param {import('#libs/utils/pagination/pagination.types.jsdoc.js').PaginationOptions} [options] - Additional options
 * @returns {Promise<import('#libs/utils/pagination/pagination.types.jsdoc.js').OffsetPaginatedResponse<any> | import('#libs/utils/pagination/pagination.types.jsdoc.js').CursorPaginatedResponse<any>>}
 */
const paginate = async (deps, config, paginationParams, options) => {
  const { strategy = PAGINATION_STRATEGY.offset, table } = config;

  if (strategy === PAGINATION_STRATEGY.cursor) {
    return paginateCursor(deps, table, config, paginationParams, options);
  }

  if (strategy === PAGINATION_STRATEGY.offset) {
    return paginateOffset(deps, table, config, paginationParams, options);
  }

  throw new BadRequestException(`Unknown pagination strategy: ${strategy}`);
};

/**
 * Create pagination service
 * @param {Dependencies} deps - Dependencies
 * @returns {{paginate: Function}}
 */
export default function paginationService(deps) {
  return {
    paginate: partial(paginate, [deps]),
  };
}
