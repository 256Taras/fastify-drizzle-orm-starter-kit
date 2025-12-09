import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, lte, notInArray, or } from "drizzle-orm";
import { createSelectSchema } from "drizzle-typebox";

import { BadRequestException } from "#libs/errors/domain.errors.js";

/**
 * @typedef {import("./pagination.common-types.jsdoc.js").DrizzleColumn} DrizzleColumn
 *
 * @typedef {import("./pagination.common-types.jsdoc.js").TableColumns} TableColumns
 */

/** Valid filter operators */
const FILTER_OPERATORS = {
  $eq: eq,
  $gt: gt,
  $gte: gte,
  $ilike: ilike,
  $in: inArray,
  $lt: lt,
  $lte: lte,
  $notIn: notInArray,
};

/** Default allowed operators for all filterable columns */
const DEFAULT_OPERATORS = ["$eq", "$gt", "$gte", "$lt", "$lte", "$in", "$notIn", "$ilike"];

/** Operators that expect array values */
const ARRAY_OPERATORS = new Set(["$in", "$notIn"]);

/** Legacy operator prefix for backward compatibility */
const LEGACY_OPERATOR_PREFIX = "$";

/**
 * Query builder class for chainable API
 *
 * @template TTable - Drizzle table type (PgTable or similar)
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy type. Default is `'offset'`
 */
export class PaginationQueryBuilder {
  /** @type {import("./pagination.types.jsdoc.js").PaginationConfig<TTable, TStrategy>} */
  #config;

  /** @typedef {import("./pagination.types.jsdoc.js").PaginationStrategy} PaginationStrategy */

  /** @type {import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>>} */
  #db;

  /** @type {import("drizzle-orm").Column[]} */
  #groupByColumns = [];

  /** @type {import("drizzle-orm").SQL[]} */
  #havingConditions = [];

  /** @type {{ type: "left" | "inner"; table: TTable; condition: import("drizzle-orm").SQL }[]} */
  #joinClauses = [];

  /** @type {import("drizzle-orm").SQL[]} */
  #orderByConditions = [];

  /** @type {Record<string, import("drizzle-orm").Column> | undefined} */
  #selectColumns;

  /** @type {TTable} */
  #table;

  /** @type {import("drizzle-orm").SQL[]} */
  #whereConditions = [];

  /**
   * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>>} db - Drizzle database instance
   * @param {TTable} table - Table to query
   * @param {import("./pagination.types.jsdoc.js").PaginationConfig<TTable, TStrategy>} config - Pagination config
   */
  constructor(db, table, config) {
    this.#db = db;
    this.#table = table;
    this.#config = config;
    this.#selectColumns = undefined;
  }

  /**
   * Apply filters from query params (protected by config)
   *
   * @param {Record<string, string | string[]>} [filters] - Filter params (can be string or array of strings)
   * @returns {this}
   */
  applyFilters(filters) {
    if (!filters || Object.keys(filters).length === 0) return this;

    const filterableColumnsObj = this.#normalizeFilterableColumns();

    for (const [columnName, filterValue] of Object.entries(filters)) {
      this.#validateFilterColumn(columnName, filterableColumnsObj);
      const allowedOperators = filterableColumnsObj[columnName];

      // @ts-ignore - table is generic Drizzle type
      const column = /** @type {TableColumns} */ this.#table[columnName];
      if (!column) continue;

      const conditions = this.#buildFilterConditions(column, columnName, filterValue, allowedOperators);
      this.#applyFilterConditions(conditions);
    }

    return this;
  }

  /**
   * Apply select from querystring (protected by config)
   *
   * @param {string[]} [selectFields] - Fields to select from querystring
   * @returns {this}
   */
  applySelect(selectFields) {
    if (!selectFields?.length) return this;

    const allowedColumns = this.#getAllowedSelectColumns();
    if (allowedColumns.length === 0) return this;

    this.#validateSelectFields(selectFields, allowedColumns);

    const selectObject = this.#buildSelectObject(selectFields);
    if (Object.keys(selectObject).length > 0) {
      this.#selectColumns = selectObject;
    }

    return this;
  }

  /**
   * Apply sorting (protected by config)
   *
   * @param {string[]} [sortBy] - Sort params
   * @returns {this}
   */
  applySorting(sortBy) {
    const { defaultSortBy, sortableColumns } = this.#config;
    const sortParams = this.#resolveSortParams(sortBy, defaultSortBy);

    for (const { column, direction } of sortParams) {
      this.#validateSortColumn(column, sortableColumns);

      // @ts-ignore - table is generic Drizzle type
      const tableColumn = /** @type {TableColumns} */ this.#table[column];
      if (!tableColumn) continue;

      this.#addOrderBy(tableColumn, direction);
    }

    return this;
  }

  /**
   * Execute query with pagination
   *
   * @param {object} options
   * @param {number} options.limit - Items per page
   * @param {number} options.offset - Offset
   * @returns {Promise<import("./pagination.types.jsdoc.js").QueryExecutionResult>}
   */
  async execute({ limit, offset }) {
    try {
      // @ts-expect-error - Drizzle query builder types are complex and dynamic
      const dataQuery = this.#buildQuery()
        .orderBy(...this.#orderByConditions)
        .limit(limit)
        .offset(offset);

      const countQuery = this.#buildCountQuery();

      const [[{ itemCount }], entities] = await Promise.all([countQuery, dataQuery]);

      return { entities, itemCount };
    } catch (error) {
      this.#handleDatabaseError(error);
      throw error;
    }
  }

  /**
   * Add GROUP BY
   *
   * @param {...import("drizzle-orm").Column} columns - Columns to group by
   * @returns {this}
   */
  groupBy(...columns) {
    this.#groupByColumns.push(...columns);
    return this;
  }

  /**
   * Add HAVING condition
   *
   * @param {import("drizzle-orm").SQL} condition - Having condition
   * @returns {this}
   */
  having(condition) {
    if (condition) {
      this.#havingConditions.push(condition);
    }
    return this;
  }

  /**
   * Add INNER JOIN
   *
   * @param {TTable} table - Table to join
   * @param {import("drizzle-orm").SQL} condition - Join condition
   * @returns {this}
   */
  innerJoin(table, condition) {
    this.#joinClauses.push({ condition, table, type: "inner" });
    return this;
  }

  /**
   * Add LEFT JOIN
   *
   * @param {TTable} table - Table to join
   * @param {import("drizzle-orm").SQL} condition - Join condition
   * @returns {this}
   */
  leftJoin(table, condition) {
    this.#joinClauses.push({ condition, table, type: "left" });
    return this;
  }

  /**
   * Set select columns
   *
   * @param {Record<string, import("drizzle-orm").Column>} columns - Columns to select
   * @returns {this}
   */
  select(columns) {
    this.#selectColumns = columns;
    return this;
  }

  /**
   * Add WHERE condition
   *
   * @param {import("drizzle-orm").SQL} condition - SQL condition
   * @returns {this}
   */
  where(condition) {
    if (condition) {
      this.#whereConditions.push(condition);
    }
    return this;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Add ORDER BY condition
   *
   * @param {import("drizzle-orm").Column} column - Column to sort
   * @param {"ASC" | "DESC"} direction - Sort direction
   */
  #addOrderBy(column, direction) {
    this.#orderByConditions.push(direction === "DESC" ? desc(column) : asc(column));
  }

  /**
   * Apply filter conditions (OR for multiple, single for one)
   *
   * @param {import("drizzle-orm").SQL[]} conditions - Filter conditions
   */
  #applyFilterConditions(conditions) {
    if (conditions.length === 0) return;

    // @ts-expect-error - TypeScript doesn't understand that conditions only contains valid SQL
    this.where(conditions.length === 1 ? conditions[0] : or(...conditions));
  }

  /**
   * Apply all JOIN clauses to query
   *
   * @template TQuery - Query builder type
   * @param {TQuery} query - Query builder
   * @returns {TQuery} Query with joins applied
   */
  #applyJoins(query) {
    for (const { condition, table, type } of this.#joinClauses) {
      // @ts-expect-error - Drizzle join methods have complex types that TypeScript can't infer correctly
      query = type === "left" ? query.leftJoin(table, condition) : query.innerJoin(table, condition);
    }
    return query;
  }

  /**
   * Build count query with proper GROUP BY support
   *
   * @returns {unknown} Count query builder (Drizzle has complex types)
   */
  #buildCountQuery() {
    if (this.#groupByColumns.length > 0) {
      return this.#buildGroupedCountQuery();
    }

    // @ts-expect-error - Drizzle table types are dynamic and complex
    let query = this.#db.select({ itemCount: count() }).from(this.#table);
    query = this.#applyJoins(query);

    const whereCondition = this.#combineConditions(this.#whereConditions);
    if (whereCondition) {
      // @ts-expect-error - Drizzle query builder types are complex
      query = query.where(whereCondition);
    }

    return query;
  }

  /**
   * Build filter conditions for a column
   *
   * @param {any} column - Drizzle column
   * @param {string} columnName - Column name
   * @param {string | string[]} filterValue - Filter value(s)
   * @param {string[]} allowedOperators - Allowed operators
   * @returns {import("drizzle-orm").SQL[]} Filter conditions
   */
  #buildFilterConditions(column, columnName, filterValue, allowedOperators) {
    const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];

    return filterValues.map((value) => {
      const { operator, value: parsedValue } = this.#parseFilterValue(value);
      this.#validateOperator(operator, columnName, allowedOperators);
      return this.#createFilterCondition(column, operator, parsedValue);
    });
  }

  /**
   * Build grouped count query using subquery
   *
   * @returns {unknown} Grouped count query (Drizzle has complex types)
   */
  #buildGroupedCountQuery() {
    // @ts-expect-error - table structure is dynamic, id column may not exist in type but exists at runtime
    let subquery = this.#db.select({ id: this.#table.id }).from(this.#table);

    subquery = this.#applyJoins(subquery);

    if (this.#whereConditions.length > 0) {
      // @ts-expect-error - Drizzle query builder types are complex
      subquery = subquery.where(and(...this.#whereConditions));
    }

    // @ts-expect-error - Drizzle groupBy accepts dynamic column types
    subquery = subquery.groupBy(...this.#groupByColumns);

    if (this.#havingConditions.length > 0) {
      // @ts-expect-error - Drizzle query builder types are complex
      subquery = subquery.having(and(...this.#havingConditions));
    }

    return /** @type {unknown} */ this.#db.select({ itemCount: count() }).from(subquery.as("grouped"));
  }

  /**
   * Build final query with all conditions
   *
   * @returns {unknown} Query builder (Drizzle has complex types)
   */
  #buildQuery() {
    // @ts-expect-error - Drizzle select accepts undefined for select all, but TypeScript doesn't understand this
    let query = this.#db.select(this.#selectColumns || undefined).from(this.#table);

    query = this.#applyJoins(query);

    const whereCondition = this.#combineConditions(this.#whereConditions);
    if (whereCondition) {
      // @ts-expect-error - Drizzle query builder types are complex
      query = query.where(whereCondition);
    }

    if (this.#groupByColumns.length > 0) {
      // @ts-expect-error - Drizzle groupBy accepts dynamic column types
      query = query.groupBy(...this.#groupByColumns);
    }

    const havingCondition = this.#combineConditions(this.#havingConditions);
    if (havingCondition) {
      // @ts-expect-error - Drizzle query builder types are complex
      query = query.having(havingCondition);
    }

    return query;
  }

  /**
   * Build select object from field names
   *
   * @param {string[]} selectFields - Field names to select
   * @returns {TableColumns} Select object
   */
  #buildSelectObject(selectFields) {
    return selectFields.reduce(
      (acc, field) => {
        // @ts-ignore - table is generic Drizzle type
        const column = /** @type {TableColumns} */ this.#table[field];
        if (column) {
          // @ts-ignore - accumulator type
          acc[field] = column;
        }
        return acc;
      },
      /** @type {TableColumns} */ {},
    );
  }

  /**
   * Combine multiple conditions with AND
   *
   * @param {import("drizzle-orm").SQL[]} conditions - Conditions to combine
   * @returns {import("drizzle-orm").SQL | undefined} Combined condition
   */
  #combineConditions(conditions) {
    if (conditions.length === 0) return;
    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }

  /**
   * Create filter condition based on operator
   *
   * @param {import("drizzle-orm").Column} column - Drizzle column
   * @param {import("./pagination.types.jsdoc.js").FilterOperator} operator - Filter operator
   * @param {string | number | boolean | string[]} value - Filter value
   * @returns {import("drizzle-orm").SQL} SQL condition
   */
  #createFilterCondition(column, operator, value) {
    if (operator === "$ilike") {
      return ilike(column, `%${value}%`);
    }

    const operatorFn = FILTER_OPERATORS[operator];
    if (!operatorFn) {
      throw new BadRequestException(`Unknown filter operator: ${operator}`);
    }

    // @ts-expect-error - Drizzle operators have different signatures, but we handle them correctly
    return operatorFn(column, value);
  }

  /**
   * Extract enum values from schema for better error messages
   *
   * @returns {string[]} Enum values or empty array
   */
  #extractEnumValues() {
    try {
      // @ts-expect-error - createSelectSchema accepts any table type at runtime
      const baseSchema = createSelectSchema(this.#config.table);
      const baseProperties = baseSchema.properties || {};

      for (const columnProperty of Object.values(baseProperties)) {
        if (columnProperty.enum && Array.isArray(columnProperty.enum)) {
          return columnProperty.enum;
        }

        if (columnProperty.anyOf && Array.isArray(columnProperty.anyOf)) {
          const enumValues = columnProperty.anyOf.reduce((acc, option) => {
            if (option.enum && Array.isArray(option.enum)) {
              return option.enum;
            }
            if (option.const !== undefined) {
              acc.push(option.const);
            }
            return acc;
          }, []);

          if (enumValues.length > 0) return enumValues;
        }
      }
    } catch {
      // Schema extraction is optional, fail silently
    }

    return [];
  }

  /**
   * Get allowed columns for select
   *
   * @returns {string[]} Allowed column names
   */
  #getAllowedSelectColumns() {
    const { excludeColumns = [], selectableColumns = [] } = this.#config;

    if (selectableColumns.length > 0) {
      return selectableColumns;
    }

    if (excludeColumns.length > 0) {
      // @ts-expect-error - table is an object at runtime, Object.keys works
      const tableKeys = Object.keys(this.#table);
      return tableKeys.filter((col) => !excludeColumns.includes(col));
    }

    return [];
  }

  /**
   * Handle database errors and convert to user-friendly exceptions
   *
   * @param {unknown} error - Database error
   * @throws {BadRequestException} User-friendly error
   */
  #handleDatabaseError(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const cause = (error && typeof error === "object" && "cause" in error ? error.cause : error) || error;
    const causeMessage = cause instanceof Error ? cause.message : String(cause);
    const fullMessage = `${errorMessage} ${causeMessage}`;

    // PostgreSQL enum validation error (code 22P02)
    if (fullMessage.includes("invalid input value for enum")) {
      const enumMatch = fullMessage.match(/invalid input value for enum (\w+): "([^"]+)"/);

      if (enumMatch) {
        const [, enumName, invalidValue] = enumMatch;
        const validValues = this.#extractEnumValues();
        const validValuesText = validValues.length > 0 ? ` Valid values: ${validValues.join(", ")}.` : "";

        throw new BadRequestException(`Invalid value "${invalidValue}" for enum "${enumName}".${validValuesText}`);
      }

      throw new BadRequestException("Invalid enum value provided in filter");
    }

    // Re-throw other errors as-is
    throw error;
  }

  /**
   * Normalize filterableColumns config to object format
   *
   * @returns {Record<string, string[]>} Normalized filterable columns
   */
  #normalizeFilterableColumns() {
    const { filterableColumns: filterableColumnsConfig = [] } = this.#config;

    return Array.isArray(filterableColumnsConfig)
      ? Object.fromEntries(filterableColumnsConfig.map((col) => [col, DEFAULT_OPERATORS]))
      : filterableColumnsConfig;
  }

  /**
   * Parse filter value into operator and value
   *
   * @param {string} value - Filter value string
   * @returns {import("./pagination.types.jsdoc.js").ParsedFilterValue} Parsed filter
   */
  #parseFilterValue(value) {
    if (!value) return { operator: "$eq", value };

    // Match operator pattern: $operator:value
    const operatorMatch = value.match(/^(\$\w+):(.+)$/);
    if (operatorMatch) {
      const [, operator, val] = operatorMatch;

      // Validate operator exists in FILTER_OPERATORS
      const validOperators =
        /** @type {import("./pagination.types.jsdoc.js").FilterOperator[]} */ Object.keys(FILTER_OPERATORS);
      if (!validOperators.includes(/** @type {import("./pagination.types.jsdoc.js").FilterOperator} */ operator)) {
        throw new BadRequestException(`Unknown filter operator: ${operator}. Valid operators: ${validOperators.join(", ")}`);
      }

      // Type assertion is safe because we validated operator exists in FILTER_OPERATORS
      // @ts-ignore - operator is validated against FILTER_OPERATORS
      const op = operator;

      // Parse array values for $in and $notIn
      if (ARRAY_OPERATORS.has(op)) {
        // @ts-ignore - operator type is checked
        return { operator: op, value: val.split(",") };
      }

      // @ts-ignore - operator type is checked
      return { operator: op, value: val };
    }

    // Legacy support: $value → $ilike:value
    if (value.startsWith(LEGACY_OPERATOR_PREFIX)) {
      return { operator: "$ilike", value: value.slice(1) };
    }

    // Default to equality
    return { operator: "$eq", value };
  }

  /**
   * Parse sort parameter string
   *
   * @param {string} sortParam - Sort parameter (e.g., "name:DESC")
   * @returns {import("./pagination.types.jsdoc.js").SortParam} Parsed sort param
   */
  #parseSortParam(sortParam) {
    const [column, direction = "ASC"] = sortParam.split(":");
    const upperDir = direction.toUpperCase();
    /** @type {"ASC" | "DESC"} */
    const dir = upperDir === "ASC" || upperDir === "DESC" ? upperDir : "ASC";
    return { column, direction: dir };
  }

  /**
   * Resolve sort parameters from query or defaults
   *
   * @param {string[]} [sortBy] - Sort params from query
   * @param {[string, "ASC" | "DESC"][]} [defaultSortBy] - Default sort config
   * @returns {import("./pagination.types.jsdoc.js").SortParam[]} Resolved sort params
   */
  #resolveSortParams(sortBy, defaultSortBy) {
    if (sortBy && sortBy.length > 0) {
      return sortBy.map((param) => this.#parseSortParam(param));
    }

    if (defaultSortBy && defaultSortBy.length > 0) {
      return defaultSortBy.map(([column, direction]) => ({ column, direction }));
    }

    return [];
  }

  /**
   * Validate filter column is allowed
   *
   * @param {string} columnName - Column name
   * @param {Record<string, string[]>} filterableColumns - Allowed filterable columns
   * @throws {BadRequestException} If column is not filterable
   */
  #validateFilterColumn(columnName, filterableColumns) {
    if (!(columnName in filterableColumns)) {
      throw new BadRequestException(`Column "${columnName}" is not filterable`);
    }

    const allowedOperators = filterableColumns[columnName];
    if (!Array.isArray(allowedOperators) || allowedOperators.length === 0) {
      throw new BadRequestException(`No operators allowed for filter '${columnName}'`);
    }
  }

  /**
   * Validate operator is allowed for column
   *
   * @param {string} operator - Operator to validate
   * @param {string} columnName - Column name
   * @param {string[]} allowedOperators - Allowed operators
   * @throws {BadRequestException} If operator is not allowed
   */
  #validateOperator(operator, columnName, allowedOperators) {
    if (!allowedOperators.includes(operator)) {
      throw new BadRequestException(
        `Operator "${operator}" is not allowed for column "${columnName}". Allowed: ${allowedOperators.join(", ")}`,
      );
    }
  }

  /**
   * Validate select fields are allowed
   *
   * @param {string[]} selectFields - Fields to validate
   * @param {string[]} allowedColumns - Allowed columns
   * @throws {BadRequestException} If field is not selectable
   */
  #validateSelectFields(selectFields, allowedColumns) {
    for (const field of selectFields) {
      if (!allowedColumns.includes(field)) {
        throw new BadRequestException(`Column "${field}" is not selectable`);
      }
    }
  }

  /**
   * Validate sort column is allowed
   *
   * @param {string} column - Column name
   * @param {string[]} sortableColumns - Allowed sortable columns
   * @throws {BadRequestException} If column is not sortable
   */
  #validateSortColumn(column, sortableColumns) {
    if (!sortableColumns.includes(column)) {
      throw new BadRequestException(`Column "${column}" is not sortable`);
    }
  }
}
