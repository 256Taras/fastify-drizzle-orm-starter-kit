import type { Cradle } from "@fastify/awilix";

import { PAGINATION_STRATEGY } from "./pagination.contracts.ts";
import { paginateCursor } from "./pagination.cursor.service.ts";
import { paginateOffset } from "./pagination.offset.service.ts";
import type { PaginatedResponse, PaginationConfig, PaginationOptions, PaginationParams } from "./pagination.types.d.ts";

import { BadRequestException } from "#libs/errors/domain.errors.ts";

/**
 * Universal pagination function that chooses strategy based on config
 */
const paginate = async <TTable, TStrategy extends "cursor" | "offset" = "offset", TItem = unknown>(
  deps: Cradle,
  config: PaginationConfig<TTable, TStrategy>,
  paginationParams: PaginationParams<TStrategy>,
  options: PaginationOptions = {},
): Promise<PaginatedResponse<TItem, TStrategy>> => {
  const { strategy = PAGINATION_STRATEGY.offset, table } = config;

  if (!paginationParams) {
    deps.logger.error("paginationParams is undefined", { config, options });
    throw new Error("paginationParams is required");
  }

  if (strategy === PAGINATION_STRATEGY.cursor) {
    return paginateCursor(
      deps,
      table,
      config as PaginationConfig<TTable, "cursor">,
      paginationParams as PaginationParams<"cursor">,
      options,
    ) as Promise<PaginatedResponse<TItem, TStrategy>>;
  }

  if (strategy === PAGINATION_STRATEGY.offset) {
    return paginateOffset(
      deps,
      table,
      config as PaginationConfig<TTable, "offset">,
      paginationParams as PaginationParams<"offset">,
      options,
    ) as Promise<PaginatedResponse<TItem, TStrategy>>;
  }

  throw new BadRequestException(`Unknown pagination strategy: ${strategy}`);
};

/**
 * Pagination service factory
 */
export default function paginationService(deps: Cradle) {
  return {
    /**
     * Paginate data based on config and params
     */
    paginate: <TTable, TItem, TStrategy extends "cursor" | "offset" = "offset">(
      config: PaginationConfig<TTable, TStrategy>,
      paginationParams: PaginationParams<TStrategy>,
      options?: PaginationOptions,
    ): Promise<PaginatedResponse<TItem, TStrategy>> => paginate(deps, config, paginationParams, options),
  };
}
