import { Type } from "@sinclair/typebox";
import { getTableColumns } from "drizzle-orm";
import { createSelectSchema } from "drizzle-typebox";

import {
  CURSOR_PAGINATION_META_CONTRACT,
  OFFSET_PAGINATION_META_CONTRACT,
  PAGINATION_STRATEGY,
} from "./pagination.contracts.js";

/**
 * Validates pagination config
 * @template T
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<T>} config - Pagination config
 * @throws {Error} If both excludeColumns and selectableColumns are provided
 */
const validatePaginationConfig = (config) => {
  const { excludeColumns, selectableColumns } = config;

  if (excludeColumns && excludeColumns.length > 0 && selectableColumns && selectableColumns.length > 0) {
    throw new Error("Cannot use both 'excludeColumns' and 'selectableColumns' in pagination config. Choose one approach.");
  }
};

/**
 * Gets selectable columns from config
 * If selectableColumns is provided, use it
 * If excludeColumns is provided, generate selectableColumns from all columns minus excluded
 * @template T
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<T>} config - Pagination config
 * @returns {string[]} Array of selectable column names
 */
const getSelectableColumns = (config) => {
  const { excludeColumns, selectableColumns, table } = config;

  if (selectableColumns && selectableColumns.length > 0) {
    return selectableColumns;
  }

  if (excludeColumns && excludeColumns.length > 0) {
    // @ts-expect-error - table is generic type, but getTableColumns works at runtime
    const allColumns = Object.keys(getTableColumns(table));
    return allColumns.filter((col) => !excludeColumns.includes(col));
  }

  return [];
};

/**
 * Generates TypeBox schema for pagination querystring based on config
 * @template T
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<T>} config - Pagination config
 * @returns {import("@sinclair/typebox").TObject} TypeBox querystring schema
 */
// eslint-disable-next-line complexity -- Complex dynamic schema generation based on config
export const generatePaginationQuerySchema = (config) => {
  validatePaginationConfig(config);

  const {
    defaultLimit = 10,
    filterableColumns: filterableColumnsConfig = [],
    maxLimit = 100,
    sortableColumns = [],
    strategy = PAGINATION_STRATEGY.offset,
  } = config;

  // Normalize filterableColumns - convert array to object if needed
  const filterableColumnsObj = Array.isArray(filterableColumnsConfig)
    ? Object.fromEntries(
        filterableColumnsConfig.map((col) => [col, ["$eq", "$gt", "$gte", "$lt", "$lte", "$in", "$notIn", "$ilike"]]),
      )
    : filterableColumnsConfig;

  const selectableColumns = getSelectableColumns(config);

  /** @type {Record<string, any>} */
  const schema = {
    limit: Type.Optional(
      Type.Integer({
        default: defaultLimit,
        description: `Number of records per page.\n\nIf provided value is greater than max value, max value will be applied.`,
        examples: [defaultLimit, 20, 50],
        maximum: maxLimit,
        minimum: 1,
        title: "Limit",
      }),
    ),
  };

  if (strategy === PAGINATION_STRATEGY.offset) {
    schema.page = Type.Optional(
      Type.Integer({
        default: 1,
        description: `Page number to retrieve.\n\nIf you provide invalid value the default page number will applied`,
        examples: [1, 2, 3],
        minimum: 1,
        title: "Page",
      }),
    );
  } else {
    schema.after = Type.Optional(
      Type.String({
        description: "Cursor for pagination (get items after this cursor)",
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "After Cursor",
      }),
    );
    schema.before = Type.Optional(
      Type.String({
        description: "Cursor for pagination (get items before this cursor)",
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "Before Cursor",
      }),
    );
  }

  if (sortableColumns.length > 0) {
    const sortPattern = sortableColumns.map((col) => `${col}:(ASC|DESC)`).join("|");
    const sortExamples = sortableColumns.slice(0, 2).map((col) => `${col}:ASC`);
    const availableSortValues = sortableColumns.flatMap((col) => [`${col}:ASC`, `${col}:DESC`]).join(", ");

    schema.sortBy = Type.Optional(
      Type.Array(
        Type.String({
          description: `Parameter to sort by.\n\nTo sort by multiple fields, just provide query param multiple times. The order in url defines an order of sorting\n\nFormat: fieldName:DIRECTION\n\nExample: sortBy=id:DESC&sortBy=createdAt:ASC`,
          examples: sortExamples,
          pattern: `^(${sortPattern})$`,
          title: "Sort By",
        }),
        {
          description: `Parameter to sort by.\n\nTo sort by multiple fields, just provide query param multiple times. The order in url defines an order of sorting\n\nFormat: fieldName:DIRECTION\n\nExample: sortBy=id:DESC&sortBy=createdAt:ASC\n\nDefault Value: No default sorting specified, the result order is not guaranteed\n\nAvailable Fields\n\n${sortableColumns.map((col) => `    ${col}`).join("\n")}\n\nAvailable values : ${availableSortValues}`,
          examples: [sortExamples],
          title: "Sort By",
        },
      ),
    );
  }

  if (filterableColumnsObj && Object.keys(filterableColumnsObj).length > 0) {
    for (const [column, allowedOperators] of Object.entries(filterableColumnsObj)) {
      const operatorsArray = Array.isArray(allowedOperators) ? allowedOperators : [];

      // Generate examples based on available operators only
      // Note: examples should be just the value part (without filter. prefix) since the parameter name already includes it
      const examples = [];
      if (operatorsArray.includes("$eq")) {
        examples.push(`$eq:value`);
      }
      if (operatorsArray.includes("$ilike") || operatorsArray.includes("$like")) {
        examples.push(`$ilike:%value%`, `$ilike:John`);
      }
      if (operatorsArray.includes("$in")) {
        examples.push(`$in:value1,value2`);
      }
      if (operatorsArray.includes("$gte")) {
        examples.push(`$gte:2024-01-01`);
      }
      if (operatorsArray.includes("$lte")) {
        examples.push(`$lte:2024-12-31`);
      }
      if (operatorsArray.includes("$gt")) {
        examples.push(`$gt:100`);
      }
      if (operatorsArray.includes("$lt")) {
        examples.push(`$lt:100`);
      }
      if (operatorsArray.includes("$notIn")) {
        examples.push(`$notIn:value1,value2`);
      }

      // Generate available operations list
      const availableOperations =
        operatorsArray.length > 0
          ? operatorsArray.map((op) => `    ${op}`).join("\n")
          : "    $eq\n    $gt\n    $gte\n    $lt\n    $lte\n    $in\n    $notIn\n    $ilike";

      // Generate example text based on available operators
      let exampleText = "";
      if (operatorsArray.includes("$ilike") || operatorsArray.includes("$like")) {
        exampleText = `Example: filter.${column}=$ilike:John&filter.${column}=$eq:value`;
      } else if (operatorsArray.includes("$eq") && operatorsArray.includes("$in")) {
        exampleText = `Example: filter.${column}=$eq:value&filter.${column}=$in:value1,value2`;
      } else if (operatorsArray.includes("$eq")) {
        exampleText = `Example: filter.${column}=$eq:value`;
      } else if (operatorsArray.length > 0) {
        const firstOp = operatorsArray[0];
        exampleText = `Example: filter.${column}=${firstOp}:value`;
      }

      const description = `Filter by ${column} query param.\n\nFormat: filter.${column}=OPERATION:VALUE${exampleText ? `\n\n${exampleText}` : ""}\n\nAvailable Operations\n\n${availableOperations}`;

      schema[`filter.${column}`] = Type.Optional(
        Type.Array(
          Type.String({
            description,
            examples: examples.length > 0 ? examples : [`$eq:value`],
            title: `Filter ${column}`,
          }),
          {
            description,
            examples: [examples.length > 0 ? examples : [`$eq:value`]],
            title: `Filter ${column}`,
          },
        ),
      );
    }
  }

  if (selectableColumns.length > 0) {
    const selectExamples = selectableColumns.slice(0, 3);
    const availableColumnsList = selectableColumns.map((col) => `    ${col}`).join("\n");

    schema.select = Type.Optional(
      Type.Array(
        Type.String({
          description: `Column name to select.\n\nAvailable columns:\n${availableColumnsList}`,
          enum: selectableColumns,
          examples: selectExamples,
          title: "Select Column",
        }),
        {
          description: `Select specific columns to include in the response.\n\nTo select multiple columns, provide the query param multiple times or use comma-separated values.\n\nExample: select=email&select=firstName&select=lastName or select=email,firstName,lastName\n\nAvailable columns:\n${availableColumnsList}`,
          examples: [selectExamples],
          title: "Select Columns",
        },
      ),
    );
  }

  if (config.searchableColumns && config.searchableColumns.length > 0) {
    schema.search = Type.Optional(
      Type.String({
        description: `Search across searchable columns: ${config.searchableColumns.join(", ")}`,
        examples: ["john", "example@email.com"],
        title: "Search",
      }),
    );
  }

  return Type.Object(schema, {
    additionalProperties: false,
    description: `Pagination query parameters for ${strategy === PAGINATION_STRATEGY.cursor ? "cursor" : "offset"} pagination strategy`,
    title: "Pagination Query",
  });
};

/**
 * Generates TypeBox schema for single item based on Drizzle table
 * @template T
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<T>} config - Pagination config
 * @returns {import("@sinclair/typebox").TObject} TypeBox item schema
 */
export const generateItemSchema = (config) => {
  validatePaginationConfig(config);

  const { excludeColumns = [], optionalColumns = {}, table } = config;

  // @ts-expect-error - table is generic type, but createSelectSchema works at runtime
  const baseSchema = createSelectSchema(table);

  const properties = { ...baseSchema.properties };

  for (const column of excludeColumns) {
    delete properties[column];
  }

  for (const [column, shouldBeOptional] of Object.entries(optionalColumns)) {
    if (shouldBeOptional && properties[column]) {
      properties[column] = Type.Optional(properties[column]);
    }
  }

  return Type.Object(properties, {
    additionalProperties: false,
    description: "Single item from the paginated result",
    title: "Item",
  });
};

/**
 * Generates TypeBox schema for paginated response based on config
 * @template T
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<T>} config - Pagination config
 * @returns {import("@sinclair/typebox").TObject} TypeBox response schema
 */
export const generatePaginatedResponseSchema = (config) => {
  validatePaginationConfig(config);

  const { strategy = PAGINATION_STRATEGY.offset } = config;

  const itemSchema = generateItemSchema(config);

  const metaSchema =
    strategy === PAGINATION_STRATEGY.cursor ? CURSOR_PAGINATION_META_CONTRACT : OFFSET_PAGINATION_META_CONTRACT;

  return Type.Object(
    {
      data: Type.Array(itemSchema, {
        description: "Array of paginated items",
        title: "Data",
      }),
      meta: metaSchema,
    },
    {
      additionalProperties: false,
      description: `Paginated response with ${strategy === PAGINATION_STRATEGY.cursor ? "cursor" : "offset"} pagination strategy`,
      title: "Paginated Response",
    },
  );
};

/**
 * Generates complete Fastify route schema with pagination
 * @template T
 * @param {object} options
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<T>} options.config - Pagination config
 * @param {Record<number, import("@sinclair/typebox").TSchema>} [options.errorSchemas] - Error schemas
 * @param {import("@sinclair/typebox").TSchema} [options.bodySchema] - Request body schema
 * @param {import("@sinclair/typebox").TSchema} [options.paramsSchema] - Route params schema
 * @param {string} [options.description] - Route description
 * @param {string} [options.summary] - Route summary
 * @returns {object} Complete route schema
 */
export const generatePaginatedRouteSchema = ({ bodySchema, config, description, errorSchemas, paramsSchema, summary }) => {
  validatePaginationConfig(config);

  /** @type {Record<string, any>} */
  const schema = {
    querystring: generatePaginationQuerySchema(config),
    response: {
      200: generatePaginatedResponseSchema(config),
      ...errorSchemas,
    },
  };

  if (bodySchema) schema.body = bodySchema;
  if (paramsSchema) schema.params = paramsSchema;
  if (description) schema.description = description;
  if (summary) schema.summary = summary;

  return schema;
};
