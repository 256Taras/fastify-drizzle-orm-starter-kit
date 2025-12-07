/**
 * Generates metadata for a paginated response.
 * @param {object} options - The input options for generating metadata.
 * @param {number} options.offset - The offset from the start of the collection.
 * @param {number} options.limit - The number of items per page.
 * @param {number} options.itemCount - The total number of items in the collection.
 * @returns {{
 *   page: number,
 *   limit: number,
 *   itemCount: number,
 *   pageCount: number,
 *   hasPreviousPage: boolean,
 *   hasNextPage: boolean
 * }} Metadata for the paginated response.
 */
const createPageMetaDto = ({ itemCount, limit, offset }) => {
  const page = Math.floor(offset / limit) + 1;

  const pageCount = Math.ceil(itemCount / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < pageCount;

  return { hasNextPage, hasPreviousPage, itemCount, limit, page, pageCount };
};

/**
 * @param {{page?: number, limit?:number}} root0
 * @returns {{offset: number }} Options for the paginated collection.
 */
export const calculatePaginationOffset = ({ limit = 10, page = 1 } = {}) => {
  const offset = (page - 1) * limit;
  return { offset };
};

/**
 * Creates a data transfer object (DTO) for a paginated collection of items.
 * @template T - The type of the items in the collection.
 * @param {T[]} data - An array of items for the current page.
 * @param {object} meta - The pagination metadata.
 * @returns {{
 *   data: T[],
 *   meta: object
 * }} A DTO representing the paginated collection.
 */
const createPageDto = (data, meta) => ({ data, meta });

/**
 * Creates a paginated response object with entities and pagination metadata.
 * This function encapsulates the process of creating pagination metadata and structuring the paginated response.
 * @template E - The entity type included in the paginated response.
 * @param {object} params - The parameters for creating the paginated response.
 * @param {E[]} params.entities - The entities to be included in the paginated response.
 * @param {number} params.itemCount - The total number of entities across all pages.
 * @param {number} params.offset - The offset for the current page.
 * @param {number} params.limit - The limit for the current page.
 * @returns {{
 *   data: E[],
 *   meta: {
 *     page: number,
 *     limit: number,
 *     itemCount: number,
 *     pageCount: number,
 *     hasPreviousPage: boolean,
 *     hasNextPage: boolean
 *   }
 * }} The paginated response object.
 */
export const createPaginatedResponse = ({ entities, itemCount, limit, offset }) => {
  const pageMetaDto = createPageMetaDto({ itemCount, limit, offset });
  return createPageDto(entities, pageMetaDto);
};
