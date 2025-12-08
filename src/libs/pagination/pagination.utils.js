/**
 * Generates metadata for a paginated response.
 * @param {object} params - The input options for generating metadata.
 * @param {number} params.offset - The offset from the start of the collection.
 * @param {number} params.limit - The number of items per page.
 * @param {number} params.itemCount - The total number of items in the collection.
 * @returns {import('./pagination.types.jsdoc.js').OffsetPaginationMeta} Metadata for the paginated response.
 */
const createPageMetaDto = ({ itemCount, limit, offset }) => {
  const page = Math.floor(offset / limit) + 1;

  const pageCount = Math.ceil(itemCount / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < pageCount;

  return { hasNextPage, hasPreviousPage, itemCount, limit, page, pageCount };
};

/**
 * Calculate pagination offset from page and limit
 * @param {object} params - Pagination parameters
 * @param {number} [params.limit] - Number of items per page
 * @param {number} [params.page] - Current page number (1-based)
 * @returns {{offset: number}} Calculated offset
 */
export const calculatePaginationOffset = ({ limit = 10, page = 1 } = {}) => {
  const offset = (page - 1) * limit;
  return { offset };
};

/**
 * Creates a data transfer object (DTO) for a paginated collection of items.
 * @template {any} TItem - The type of the items in the collection.
 * @param {TItem[]} data - An array of items for the current page.
 * @param {import('./pagination.types.jsdoc.js').OffsetPaginationMeta} meta - The pagination metadata.
 * @returns {import('./pagination.types.jsdoc.js').OffsetPaginatedResponse<TItem>} A DTO representing the paginated collection.
 */
const createPageDto = (data, meta) => ({ data, meta });

/**
 * Creates a paginated response object with entities and pagination metadata.
 * This function encapsulates the process of creating pagination metadata and structuring the paginated response.
 * @template {any} TItem - The entity type included in the paginated response.
 * @param {object} params - The parameters for creating the paginated response.
 * @param {TItem[]} params.entities - The entities to be included in the paginated response.
 * @param {number} params.itemCount - The total number of entities across all pages.
 * @param {number} params.offset - The offset for the current page.
 * @param {number} params.limit - The limit for the current page.
 * @returns {import('./pagination.types.jsdoc.js').OffsetPaginatedResponse<TItem>} The paginated response object.
 */
export const createPaginatedResponse = ({ entities, itemCount, limit, offset }) => {
  const pageMetaDto = createPageMetaDto({ itemCount, limit, offset });
  return createPageDto(entities, pageMetaDto);
};
