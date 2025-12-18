import type { OffsetPaginatedResponse, OffsetPaginationMeta } from "./pagination.types.d.ts";

/**
 * Generates metadata for a paginated response.
 */
const createPageMetaDto = ({
  itemCount,
  limit,
  offset,
}: {
  itemCount: number;
  limit: number;
  offset: number;
}): OffsetPaginationMeta => {
  const page = Math.floor(offset / limit) + 1;

  const pageCount = Math.ceil(itemCount / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < pageCount;

  return { hasNextPage, hasPreviousPage, itemCount, limit, page, pageCount };
};

/**
 * Calculate pagination offset from page and limit
 */
export const calculatePaginationOffset = ({ limit = 10, page = 1 }: { limit?: number; page?: number } = {}): {
  offset: number;
} => {
  const offset = (page - 1) * limit;
  return { offset };
};

/**
 * Creates a data transfer object (DTO) for a paginated collection of items.
 */
const createPageDto = <TItem>(data: TItem[], meta: OffsetPaginationMeta): OffsetPaginatedResponse<TItem> => ({ data, meta });

/**
 * Creates a paginated response object with entities and pagination metadata. This function encapsulates the process of
 * creating pagination metadata and structuring the paginated response.
 */
export const createPaginatedResponse = <TItem>({
  entities,
  itemCount,
  limit,
  offset,
}: {
  entities: TItem[];
  itemCount: number;
  limit: number;
  offset: number;
}): OffsetPaginatedResponse<TItem> => {
  const pageMetaDto = createPageMetaDto({ itemCount, limit, offset });
  return createPageDto(entities, pageMetaDto);
};
