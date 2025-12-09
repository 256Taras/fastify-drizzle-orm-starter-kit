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
  $eq: { description: "Exact match", example: "active", label: "Equals" },
  $gt: { description: "Value must be greater than provided", example: "100", label: "Greater than" },
  $gte: { description: "Value must be greater than or equal to provided", example: "100", label: "Greater or equal" },
  $ilike: { description: "Case-insensitive pattern matching with %", example: "john", label: "Case-insensitive like" },
  $in: { description: "Value must be in the provided list", example: "active,pending", label: "In list" },
  $like: { description: "Case-sensitive pattern matching with %", example: "John", label: "Like" },
  $lt: { description: "Value must be less than provided", example: "100", label: "Less than" },
  $lte: { description: "Value must be less than or equal to provided", example: "100", label: "Less or equal" },
  $notIn: { description: "Value must not be in the provided list", example: "inactive,deleted", label: "Not in list" },
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
 * Build cursor description for pagination
 * @param {'after' | 'before'} type - Cursor type
 * @returns {string} Formatted description
 */
const buildCursorDescription = (type) => {
  const isAfter = type === "after";
  const cursorField = isAfter ? "endCursor" : "startCursor";
  const direction = isAfter ? "next" : "previous";
  const directionTitle = isAfter ? "Next" : "Previous";

  return [
    `**Cursor for ${direction} page (${isAfter ? "forward" : "backward"} pagination)**`,
    "",
    "### How to use:",
    "",
    ...(isAfter
      ? [
        "1. **First page** - don't provide `after` or `before` parameters",
        "   ```",
        "   GET /v1/users?limit=10",
        "   ```",
        "",
        `2. **${directionTitle} page** - use \`${cursorField}\` from the previous response`,
      ]
      : [`**${directionTitle} page** - use \`${cursorField}\` from the previous response`]),
    "   ```",
    `   GET /v1/users?limit=10&${type}=<${cursorField}>`,
    "   ```",
    `   Where \`<${cursorField}>\` is the value of \`meta.${cursorField}\` from the previous response`,
    "",
    "**⚠️ Important:** You cannot use `after` and `before` simultaneously!",
  ].join("\n");
};
/**
 * Build filter usage examples
 * @param {string} column - Column name
 * @param {string[]} operators - Available operators
 * @param {string[]} enumValues - Enum values if available
 * @returns {string} Formatted usage examples
 */
const buildFilterUsageExamples = (column, operators, enumValues) => {
  const hasEnum = enumValues.length > 0;
  const firstValue = hasEnum ? enumValues[0] : "value";
  const secondValue = hasEnum ? enumValues[1] || enumValues[0] : "value2";

  const examples = [];

  // Build examples based on available operators
  if (operators.includes("$ilike")) {
    examples.push({
      multi: [
        "**Multiple filters (OR logic):**",
        "```",
        `${column}=$ilike:john&${column}=$eq:admin`,
        "```",
        "_Returns records matching ANY of the conditions_",
      ].join("\n"),
      single: ["**Single filter:**", "```", `${column}=$ilike:john`, "```"].join("\n"),
    });
  } else if (operators.includes("$eq") && operators.includes("$in")) {
    examples.push({
      multi: [
        "**Multiple filters (OR logic):**",
        "```",
        `${column}=$eq:${firstValue}&${column}=$in:${firstValue},${secondValue}`,
        "```",
        "_Returns records matching ANY of the conditions_",
      ].join("\n"),
      single: ["**Single filter:**", "```", `${column}=$eq:${firstValue}`, "```"].join("\n"),
    });
  } else if (operators.includes("$eq")) {
    examples.push({
      single: ["**Example:**", "```", `${column}=$eq:${firstValue}`, "```"].join("\n"),
    });
  } else if (operators.includes("$in")) {
    examples.push({
      single: ["**Example:**", "```", `${column}=$in:${firstValue},${secondValue}`, "```"].join("\n"),
    });
  } else if (operators.length > 0) {
    const firstOp = operators[0];
    const doc = OPERATOR_DOCS[firstOp];
    examples.push({
      single: ["**Example:**", "```", `${column}=${firstOp}:${doc?.example || "value"}`, "```"].join("\n"),
    });
  }

  if (examples.length === 0) return "";

  const parts = ["### Usage", ""];
  if (examples[0].single) {
    parts.push(examples[0].single);
  }
  if (examples[0].multi) {
    parts.push("", examples[0].multi);
  }

  return parts.join("\n");
};

/**
 * Build available operations list
 * @param {string[]} operators - Available operators
 * @returns {string} Formatted operations list
 */
const buildOperationsList = (operators) => {
  if (operators.length === 0) {
    return Object.entries(OPERATOR_DOCS)
      .map(([op, doc]) => `- \`${op}\` - ${doc.label}: ${doc.description}`)
      .join("\n");
  }

  return operators
    .map((op) => {
      const doc = OPERATOR_DOCS[op];
      return doc ? `- \`${op}\` - ${doc.label}: ${doc.description}` : `- \`${op}\``;
    })
    .join("\n");
};

/**
 * Build operator pattern for validation
 * @param {string[]} operators - Available operators
 * @returns {string} Regex pattern for operators
 */
const buildOperatorPattern = (operators) => {
  if (operators.length === 0) return String.raw`^\$\w+:.*$`;
  const escapedOps = operators.map((op) => op.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)).join("|");
  return String.raw`^(${escapedOps}):.*$`;
};

/**
 * Build enum pattern for validation
 * @param {string[]} enumValues - Enum values
 * @param {string[]} operators - Available operators
 * @returns {string | undefined} Regex pattern
 */
const buildEnumPattern = (enumValues, operators) => {
  if (enumValues.length === 0) return;

  const enumPattern = enumValues.map((v) => v.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)).join("|");
  const hasEq = operators.includes("$eq");
  const hasIn = operators.includes("$in");

  if (hasEq && hasIn) {
    return String.raw`^(\$eq:(${enumPattern})|\$in:(${enumPattern})(,(${enumPattern}))*)$`;
  }
  if (hasEq) {
    return String.raw`^\$eq:(${enumPattern})$`;
  }
  if (hasIn) {
    return String.raw`^\$in:(${enumPattern})(,(${enumPattern}))*$`;
  }

  return;
};

/**
 * Generate filter examples
 * @param {string[]} operators - Available operators
 * @param {string[]} enumValues - Enum values if available
 * @returns {string[]} Example values
 */
const generateFilterExamples = (operators, enumValues) => {
  const examples = [];
  const hasEnum = enumValues.length > 0;
  const firstValue = hasEnum ? enumValues[0] : "value";
  const secondValue = hasEnum ? enumValues[1] || enumValues[0] : "value2";

  if (operators.includes("$eq")) {
    examples.push(`$eq:${firstValue}`);
  }
  if (operators.includes("$in")) {
    examples.push(`$in:${firstValue},${secondValue}`);
  }
  if (operators.includes("$ilike")) {
    examples.push(hasEnum ? `$ilike:${firstValue}` : `$ilike:john`);
  }
  if (operators.includes("$gte")) {
    examples.push(`$gte:2024-01-01`);
  }
  if (operators.includes("$lte")) {
    examples.push(`$lte:2024-12-31`);
  }
  if (operators.includes("$gt")) {
    examples.push(`$gt:100`);
  }
  if (operators.includes("$lt")) {
    examples.push(`$lt:100`);
  }
  if (operators.includes("$notIn")) {
    examples.push(`$notIn:${firstValue},${secondValue}`);
  }

  return examples.length > 0 ? examples : ["$eq:value"];
};

/**
 * Extract enum values from column property
 * @param {any} columnProperty - Column property from schema
 * @returns {string[]} Enum values
 */
const extractEnumValues = (columnProperty) => {
  if (!columnProperty) return [];

  // Check if property has enum values
  if (columnProperty.enum && Array.isArray(columnProperty.enum)) {
    return columnProperty.enum;
  }

  // Check if property has anyOf with const values
  if (columnProperty.anyOf && Array.isArray(columnProperty.anyOf)) {
    const enumValues = [];
    for (const option of columnProperty.anyOf) {
      if (option.enum && Array.isArray(option.enum)) {
        return option.enum;
      }
      if (option.const !== undefined) {
        enumValues.push(option.const);
      }
    }
    return enumValues;
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
          "Number of records to return per page.",
          "",
          `**Range:** 1 to ${maxLimit}`,
          `**Default:** ${defaultLimit}`,
          "",
          "_If the provided value exceeds the maximum, the maximum value will be applied._",
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
          "Page number to retrieve (1-indexed).",
          "",
          "**Default:** 1",
          "",
          "### Examples:",
          "- `page=1` - First page",
          "- `page=2` - Second page",
          "- `page=3` - Third page",
          "",
          "_If an invalid value is provided, the default will be applied._",
        ].join("\n"),
        examples: [1, 2, 3],
        minimum: 1,
        title: "Page",
      }),
    );
  } else {
    schema.after = Type.Optional(
      Type.String({
        description: buildCursorDescription("after"),
        // eslint-disable-next-line no-secrets/no-secrets
        examples: ["eyJpZCI6IjVjYzA5NmE2LTI3OGMtNGE1My1iNGZjLWMwNjRmMDI3M2QyMyJ9"],
        title: "After Cursor",
      }),
    );
    schema.before = Type.Optional(
      Type.String({
        description: buildCursorDescription("before"),
        // eslint-disable-next-line no-secrets/no-secrets
        examples: ["eyJpZCI6ImVlYTA4MDExLTJlNDQtNDk4Yi05NWRkLWYxZjE3ZmRkMWUzOSJ9"],
        title: "Before Cursor",
      }),
    );
  }

  // Add sorting
  if (sortableColumns.length > 0) {
    const sortPattern = sortableColumns.map((col) => `${col}:(ASC|DESC)`).join("|");
    const sortExamples = sortableColumns.slice(0, 2).map((col) => `${col}:ASC`);
    const availableFields = sortableColumns.map((col) => `- \`${col}\``).join("\n");

    schema.sortBy = Type.Optional(
      Type.Array(
        Type.String({
          description: "Format: `fieldName:DIRECTION`",
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
            `sortBy=${sortableColumns[0]}:DESC`,
            "```",
            "",
            "**Multiple fields:**",
            "```",
            `sortBy=${sortableColumns[0]}:DESC&sortBy=${sortableColumns[1] || sortableColumns[0]}:ASC`,
            "```",
            "_The order in the URL defines the sorting priority._",
            "",
            "### Available Fields",
            "",
            availableFields,
            "",
            "### Directions",
            "",
            "- `ASC` - Ascending order (A-Z, 0-9, oldest first)",
            "- `DESC` - Descending order (Z-A, 9-0, newest first)",
          ].join("\n"),
          examples: [sortExamples],
          title: "Sort By",
        },
      ),
    );
  }

  if (filterableColumnsObj && Object.keys(filterableColumnsObj).length > 0) {
    // @ts-expect-error - table is generic type, but createSelectSchema works at runtime
    const baseSchema = createSelectSchema(config.table);
    const baseProperties = baseSchema.properties || {};

    for (const [column, allowedOperators] of Object.entries(filterableColumnsObj)) {
      const operators = Array.isArray(allowedOperators) ? allowedOperators : [];
      const enumValues = extractEnumValues(baseProperties[column]);
      const examples = generateFilterExamples(operators, enumValues);

      const descriptionParts = [
        `Filter results by \`${column}\` field.`,
        "",
        "### Format",
        "",
        `\`${column}=OPERATION:VALUE\``,
        "",
      ];

      const usageExample = buildFilterUsageExamples(column, operators, enumValues);
      if (usageExample) {
        descriptionParts.push(usageExample, "");
      }

      descriptionParts.push("### Available Operations", "", buildOperationsList(operators));

      if (enumValues.length > 0) {
        descriptionParts.push("", "### Valid Values", "", enumValues.map((val) => `- \`${val}\``).join("\n"));
      }

      const enumPattern = buildEnumPattern(enumValues, operators);
      const operatorPattern = buildOperatorPattern(operators);
      const pattern = enumPattern || operatorPattern;

      schema[`filter.${column}`] = Type.Optional(
        Type.Union(
          [
            Type.String({
              description: `Single filter for ${column}`,
              examples: examples.slice(0, 2),
              pattern,
              title: `Filter ${column}`,
            }),
            Type.Array(
              Type.String({
                description: `Multiple filters for ${column} (OR logic)`,
                examples,
                pattern,
                title: `Filter ${column}`,
              }),
              {
                description: `Apply multiple filters to ${column}. All conditions are combined with OR logic.`,
                examples: examples.length > 1 ? [[examples[0], examples[1]]] : [[examples[0]]],
                title: `Filter ${column} (array)`,
              },
            ),
          ],
          {
            description: descriptionParts.join("\n"),
            title: `Filter by ${column}`,
          },
        ),
      );
    }
  }

  if (selectableColumns.length > 0) {
    const selectExamples = selectableColumns.slice(0, 3);
    const availableColumnsList = selectableColumns.map((col) => `- \`${col}\``).join("\n");
    const selectPattern = selectableColumns.join("|");

    schema.select = Type.Optional(
      Type.Union(
        [
          Type.String({
            description: "Single column to select or comma-separated list",
            examples: [selectExamples[0], `${selectExamples[0]},${selectExamples[1]}`],
            pattern: `^(${selectPattern})(,(${selectPattern}))*$`,
            title: "Select Column",
          }),
          Type.Array(
            Type.String({
              description: "Column name to select",
              examples: selectExamples,
              pattern: `^(${selectPattern})$`,
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
                `select=${selectableColumns[0]}`,
                "```",
                "",
                "**Multiple parameters:**",
                "```",
                `select=${selectableColumns[0]}&select=${selectableColumns[1]}&select=${selectableColumns[2]}`,
                "```",
                "",
                "**Comma-separated:**",
                "```",
                `select=${selectableColumns[0]},${selectableColumns[1]},${selectableColumns[2]}`,
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

  const { excludeColumns = [], table } = config;

  // @ts-expect-error - table is generic type, but createSelectSchema works at runtime
  const baseSchema = createSelectSchema(table);
  const properties = { ...baseSchema.properties };

  // Remove excluded columns
  for (const column of excludeColumns) {
    delete properties[column];
  }

  // Make all fields optional to support select parameter
  /** @type {Record<string, any>} */
  const optionalProperties = {};
  for (const [columnName, columnSchema] of Object.entries(properties)) {
    optionalProperties[columnName] = Type.Optional(columnSchema);
  }

  if (Object.keys(optionalProperties).length === 0) {
    throw new Error("Cannot create item schema: no properties available after filtering");
  }

  return Type.Object(optionalProperties, {
    additionalProperties: true,
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
