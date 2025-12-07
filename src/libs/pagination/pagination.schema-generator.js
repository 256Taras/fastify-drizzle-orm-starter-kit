import { Type } from "@sinclair/typebox";
import { getTableColumns } from "drizzle-orm";
import { createSelectSchema } from "drizzle-typebox";

import {
  CURSOR_PAGINATION_META_CONTRACT,
  OFFSET_PAGINATION_META_CONTRACT,
  PAGINATION_STRATEGY,
} from "./pagination.contracts.js";

/**
 * Documentation for filter operators
 */
const OPERATOR_DOCS = {
  $eq: { label: "Equals", example: "value" },
  $gt: { label: "Greater than", example: "100" },
  $gte: { label: "Greater or equal", example: "100" },
  $lt: { label: "Less than", example: "100" },
  $lte: { label: "Less or equal", example: "100" },
  $in: { label: "In list", example: "value1,value2" },
  $notIn: { label: "Not in list", example: "value1,value2" },
  $ilike: { label: "Case-insensitive like", example: "%value%" },
  $like: { label: "Like", example: "%value%" },
};

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
        description: [
          "Number of records per page.",
          "",
          `**Range:** 1 to ${maxLimit}`,
          `**Default:** ${defaultLimit}`,
          "",
          "_If provided value exceeds maximum, the maximum value will be applied._",
        ].join("\n"),
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
        description: [
          "Page number to retrieve.",
          "",
          "**Default:** 1",
          "",
          "_If invalid value is provided, default will be applied._",
        ].join("\n"),
        examples: [1, 2, 3],
        minimum: 1,
        title: "Page",
      }),
    );
  } else {
    schema.after = Type.Optional(
      Type.String({
        description: [
          "Cursor for forward pagination.",
          "",
          "Get items **after** this cursor.",
          "",
          "_Cursor is a base64-encoded string._",
        ].join("\n"),
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "After Cursor",
      }),
    );
    schema.before = Type.Optional(
      Type.String({
        description: [
          "Cursor for backward pagination.",
          "",
          "Get items **before** this cursor.",
          "",
          "_Cursor is a base64-encoded string._",
        ].join("\n"),
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "Before Cursor",
      }),
    );
  }

  if (sortableColumns.length > 0) {
    const sortPattern = sortableColumns.map((col) => `${col}:(ASC|DESC)`).join("|");
    const sortExamples = sortableColumns.slice(0, 2).map((col) => `${col}:ASC`);
    const availableFields = sortableColumns.map((col) => `- \`${col}\``).join("\n");

    schema.sortBy = Type.Optional(
      Type.Array(
        Type.String({
          description: `Format: \`fieldName:DIRECTION\``,
          examples: sortExamples,
          pattern: `^(${sortPattern})$`,
          title: "Sort Field",
        }),
        {
          description: [
            "Sort results by one or more fields.",
            "",
            "### Usage",
            "",
            "**Single field:**",
            "```",
            "sortBy=id:DESC",
            "```",
            "",
            "**Multiple fields:**",
            "```",
            "sortBy=id:DESC&sortBy=createdAt:ASC",
            "```",
            "",
            "_The order in URL defines the sorting priority._",
            "",
            "### Available Fields",
            "",
            availableFields,
            "",
            "### Directions",
            "",
            "- `ASC` - Ascending order",
            "- `DESC` - Descending order",
          ].join("\n"),
          examples: [sortExamples],
          title: "Sort By",
        },
      ),
    );
  }

  if (filterableColumnsObj && Object.keys(filterableColumnsObj).length > 0) {
    // Extract enum values from table schema using createSelectSchema
    // @ts-expect-error - table is generic type, but createSelectSchema works at runtime
    const baseSchema = createSelectSchema(config.table);
    const baseProperties = baseSchema.properties || {};

    for (const [column, allowedOperators] of Object.entries(filterableColumnsObj)) {
      const operatorsArray = Array.isArray(allowedOperators) ? allowedOperators : [];

      // Extract enum values from base schema if column exists
      let enumValues = [];
      const columnProperty = baseProperties[column];
      if (columnProperty) {
        // Check if property has enum values (from createSelectSchema for pgEnum columns)
        if (columnProperty.enum && Array.isArray(columnProperty.enum)) {
          enumValues = columnProperty.enum;
        }
        // Check if property has anyOf with const values (Union type from createSelectSchema for pgEnum)
        // createSelectSchema generates anyOf with const values for enum columns
        if (columnProperty.anyOf && Array.isArray(columnProperty.anyOf)) {
          for (const option of columnProperty.anyOf) {
            // Check for enum array
            if (option.enum && Array.isArray(option.enum)) {
              enumValues = option.enum;
              break;
            }
            // Check for const values (createSelectSchema generates const for pgEnum)
            if (option.const !== undefined) {
              enumValues.push(option.const);
            }
          }
        }
      }

      // Generate examples based on available operators and enum values
      const examples = [];
      if (enumValues.length > 0) {
        // Use actual enum values in examples
        const firstEnumValue = enumValues[0];
        const secondEnumValue = enumValues[1] || enumValues[0];

        if (operatorsArray.includes("$eq")) {
          examples.push(`$eq:${firstEnumValue}`);
        }
        if (operatorsArray.includes("$in")) {
          examples.push(`$in:${firstEnumValue},${secondEnumValue}`);
        }
        if (operatorsArray.includes("$ilike") || operatorsArray.includes("$like")) {
          examples.push(`$ilike:%${firstEnumValue}%`);
        }
      } else {
        // Fallback to generic examples if no enum values
        if (operatorsArray.includes("$eq")) {
          examples.push(`$eq:value`);
        }
        if (operatorsArray.includes("$ilike") || operatorsArray.includes("$like")) {
          examples.push(`$ilike:%value%`, `$ilike:John`);
        }
        if (operatorsArray.includes("$in")) {
          examples.push(`$in:value1,value2`);
        }
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

      // Generate available operations list with descriptions
      const availableOperations =
        operatorsArray.length > 0
          ? operatorsArray
              .map((op) => {
                const doc = OPERATOR_DOCS[op];
                return doc ? `- \`${op}\` - ${doc.label}` : `- \`${op}\``;
              })
              .join("\n")
          : Object.entries(OPERATOR_DOCS)
              .map(([op, doc]) => `- \`${op}\` - ${doc.label}`)
              .join("\n");

      // Generate example text based on available operators and enum values
      let usageExample = "";
      if (enumValues.length > 0) {
        const firstEnumValue = enumValues[0];
        const secondEnumValue = enumValues[1] || enumValues[0];
        if (operatorsArray.includes("$eq") && operatorsArray.includes("$in")) {
          usageExample = [
            "**Single filter:**",
            "```",
            `filter.${column}=$eq:${firstEnumValue}`,
            "```",
            "",
            "**Multiple filters:**",
            "```",
            `filter.${column}=$eq:${firstEnumValue}&filter.${column}=$in:${firstEnumValue},${secondEnumValue}`,
            "```",
          ].join("\n");
        } else if (operatorsArray.includes("$eq")) {
          usageExample = ["**Example:**", "```", `filter.${column}=$eq:${firstEnumValue}`, "```"].join("\n");
        } else if (operatorsArray.includes("$in")) {
          usageExample = ["**Example:**", "```", `filter.${column}=$in:${firstEnumValue},${secondEnumValue}`, "```"].join(
            "\n",
          );
        }
      } else {
        if (operatorsArray.includes("$ilike") || operatorsArray.includes("$like")) {
          usageExample = [
            "**Single filter:**",
            "```",
            `filter.${column}=$ilike:%John%`,
            "```",
            "",
            "**Multiple filters:**",
            "```",
            `filter.${column}=$ilike:%John%&filter.${column}=$eq:value`,
            "```",
          ].join("\n");
        } else if (operatorsArray.includes("$eq") && operatorsArray.includes("$in")) {
          usageExample = [
            "**Single filter:**",
            "```",
            `filter.${column}=$eq:value`,
            "```",
            "",
            "**Multiple filters:**",
            "```",
            `filter.${column}=$eq:value&filter.${column}=$in:value1,value2`,
            "```",
          ].join("\n");
        } else if (operatorsArray.includes("$eq")) {
          usageExample = ["**Example:**", "```", `filter.${column}=$eq:value`, "```"].join("\n");
        } else if (operatorsArray.length > 0) {
          const firstOp = operatorsArray[0];
          const doc = OPERATOR_DOCS[firstOp];
          usageExample = ["**Example:**", "```", `filter.${column}=${firstOp}:${doc?.example || "value"}`, "```"].join("\n");
        }
      }

      // Build description with enum values if available
      const descriptionParts = [
        `Filter results by \`${column}\` field.`,
        "",
        "### Format",
        "",
        `\`filter.${column}=OPERATION:VALUE\``,
        "",
      ];

      if (usageExample) {
        descriptionParts.push("### Usage", "", usageExample, "");
      }

      descriptionParts.push("### Available Operations", "", availableOperations);

      if (enumValues.length > 0) {
        const validValuesList = enumValues.map((val) => `- \`${val}\``).join("\n");
        descriptionParts.push("", "### Valid Values", "", validValuesList);
      }

      const description = descriptionParts.join("\n");

      // Generate pattern for enum validation if enum values exist
      let pattern;
      if (enumValues.length > 0) {
        // Pattern for $eq:VALUE or $in:VALUE1,VALUE2,...
        const enumPattern = enumValues.join("|");
        if (operatorsArray.includes("$eq") && operatorsArray.includes("$in")) {
          pattern = String.raw`^(\$eq:(${enumPattern})|\$in:(${enumPattern})(,(${enumPattern}))*)$`;
        } else if (operatorsArray.includes("$eq")) {
          pattern = String.raw`^\$eq:(${enumPattern})$`;
        } else if (operatorsArray.includes("$in")) {
          pattern = String.raw`^\$in:(${enumPattern})(,(${enumPattern}))*$`;
        }
      }

      schema[`filter.${column}`] = Type.Optional(
        Type.Union(
          [
            Type.String({
              description: `Single filter for ${column}`,
              examples: examples.length > 0 ? examples.slice(0, 2) : [`$eq:value`],
              pattern,
              title: `Filter ${column}`,
            }),
            Type.Array(
              Type.String({
                description: `Multiple filters for ${column}`,
                examples: examples.length > 0 ? examples : [`$eq:value`],
                pattern,
                title: `Filter ${column}`,
              }),
              {
                description: `Apply multiple filters to ${column}`,
                examples: examples.length > 1 ? [[examples[0], examples[1]]] : [[examples[0] || `$eq:value`]],
                title: `Filter ${column} (array)`,
              },
            ),
          ],
          {
            description,
            title: `Filter by ${column}`,
          },
        ),
      );
    }
  }

  if (selectableColumns.length > 0) {
    const selectExamples = selectableColumns.slice(0, 3);
    const availableColumnsList = selectableColumns.map((col) => `- \`${col}\``).join("\n");

    schema.select = Type.Optional(
      Type.Union(
        [
          Type.String({
            description: "Single column to select",
            enum: selectableColumns,
            examples: selectExamples.slice(0, 1),
            title: "Select Column",
          }),
          Type.Array(
            Type.String({
              description: "Column name to select",
              enum: selectableColumns,
              examples: selectExamples,
              title: "Select Column",
            }),
            {
              description: [
                "Select specific columns to include in the response.",
                "",
                "### Usage",
                "",
                "**Single column:**",
                "```",
                "select=email",
                "```",
                "",
                "**Multiple parameters:**",
                "```",
                "select=email&select=firstName&select=lastName",
                "```",
                "",
                "**Comma-separated:**",
                "```",
                "select=email,firstName,lastName",
                "```",
                "",
                "_By default, all columns are returned._",
                "",
                "### Available Columns",
                "",
                availableColumnsList,
              ].join("\n"),
              examples: [selectExamples],
              title: "Select Columns",
            },
          ),
        ],
        {
          description: [
            "Select specific columns to include in the response.",
            "",
            "### Usage",
            "",
            "**Single column:**",
            "```",
            "select=email",
            "```",
            "",
            "**Multiple parameters:**",
            "```",
            "select=email&select=firstName&select=lastName",
            "```",
            "",
            "**Comma-separated:**",
            "```",
            "select=email,firstName,lastName",
            "```",
            "",
            "_By default, all columns are returned._",
            "",
            "### Available Columns",
            "",
            availableColumnsList,
          ].join("\n"),
          title: "Select",
        },
      ),
    );
  }

  return Type.Object(schema, {
    additionalProperties: false,
    description: `Query parameters for ${strategy === PAGINATION_STRATEGY.cursor ? "cursor-based" : "offset-based"} pagination`,
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

  // Make all fields optional to support select parameter
  // When select is used, only selected fields are returned, so all fields must be optional
  const optionalProperties = {};
  for (const [column, property] of Object.entries(properties)) {
    // Skip if already optional from optionalColumns config
    optionalProperties[column] = optionalColumns[column] ? property : Type.Optional(property);
  }

  // Also apply optionalColumns config for fields that should be explicitly optional
  for (const [column, shouldBeOptional] of Object.entries(optionalColumns)) {
    if (shouldBeOptional && optionalProperties[column]) {
      optionalProperties[column] = Type.Optional(optionalProperties[column]);
    }
  }

  // Ensure optionalProperties is not empty
  if (Object.keys(optionalProperties).length === 0) {
    throw new Error("Cannot create item schema: no properties available after filtering");
  }

  // @ts-expect-error - TypeScript can't infer that optionalProperties is not empty, but we check above
  return Type.Object(optionalProperties, {
    additionalProperties: false,
    description: "Single item from the paginated result. All fields are optional to support the `select` parameter.",
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
      description: `Paginated response using ${strategy === PAGINATION_STRATEGY.cursor ? "cursor-based" : "offset-based"} pagination`,
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
 * @param {string[]} [options.tags] - OpenAPI tags
 * @returns {object} Complete route schema
 */
export const generatePaginatedRouteSchema = ({
  bodySchema,
  config,
  description,
  errorSchemas,
  paramsSchema,
  summary,
  tags,
}) => {
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
  if (tags) schema.tags = tags;

  return schema;
};
