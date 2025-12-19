/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, security/detect-object-injection */
import type { TSchema } from "@sinclair/typebox";
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, lte, notInArray, or } from "drizzle-orm";
import type { Column, SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { createSelectSchema } from "drizzle-typebox";

import type {
  FilterOperator,
  PaginationConfig,
  ParsedFilterValue,
  QueryExecutionResult,
  SortParam,
} from "./pagination.types.d.ts";

import { BadRequestException } from "#libs/errors/domain.errors.ts";

type DrizzleColumn = Column;
type TableColumns = Record<string, DrizzleColumn>;

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
} as const;

/** Default allowed operators for all filterable columns */
const DEFAULT_OPERATORS: FilterOperator[] = ["$eq", "$gt", "$gte", "$lt", "$lte", "$in", "$notIn", "$ilike"];

/** Operators that expect array values */
const ARRAY_OPERATORS = new Set<FilterOperator>(["$in", "$notIn"]);

/** Legacy operator prefix for backward compatibility */
const LEGACY_OPERATOR_PREFIX = "$";

/**
 * Query builder class for chainable API
 */
export class PaginationQueryBuilder<TTable, TStrategy extends "cursor" | "offset" = "offset"> {
  #config: PaginationConfig<TTable, TStrategy>;

  #db: PostgresJsDatabase<Record<string, never>>;

  #groupByColumns: Column[] = [];

  #havingConditions: SQL[] = [];

  #joinClauses: Array<{ condition: SQL; table: TTable; type: "inner" | "left" }> = [];

  #orderByConditions: SQL[] = [];

  #selectColumns: Record<string, Column> | undefined;

  #table: TTable;

  #whereConditions: SQL[] = [];

  constructor(db: PostgresJsDatabase<any>, table: TTable, config: PaginationConfig<TTable, TStrategy>) {
    this.#db = db;
    this.#table = table;
    this.#config = config;
    this.#selectColumns = undefined;
  }

  /**
   * Apply filters from query params (protected by config)
   */
  applyFilters(filters?: Record<string, string | string[]>): this {
    if (!filters || Object.keys(filters).length === 0) return this;

    const filterableColumnsObj = this.#normalizeFilterableColumns();

    for (const [columnName, filterValue] of Object.entries(filters)) {
      this.#validateFilterColumn(columnName, filterableColumnsObj);
      const allowedOperators = filterableColumnsObj[columnName];

      // @ts-expect-error - table is generic Drizzle type
      const column = this.#table[columnName] as TableColumns[string];
      if (!column) continue;

      const conditions = this.#buildFilterConditions(column, columnName, filterValue, allowedOperators);
      this.#applyFilterConditions(conditions);
    }

    return this;
  }

  /**
   * Apply select from querystring (protected by config)
   */
  applySelect(selectFields?: string[]): this {
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
   */
  applySorting(sortBy?: string[]): this {
    const { defaultSortBy, sortableColumns } = this.#config;
    const sortParams = this.#resolveSortParams(sortBy, defaultSortBy);

    for (const { column, direction } of sortParams) {
      this.#validateSortColumn(column, sortableColumns);

      // @ts-expect-error - table is generic Drizzle type
      const tableColumn = this.#table[column] as TableColumns[string];
      if (!tableColumn) continue;

      this.#addOrderBy(tableColumn, direction);
    }

    return this;
  }

  /**
   * Execute query with pagination
   */
  async execute({ limit, offset }: { limit: number; offset: number }): Promise<QueryExecutionResult> {
    try {
      // @ts-expect-error - Drizzle query builder types are complex and don't match generic constraints
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
   */
  groupBy(...columns: Column[]): this {
    this.#groupByColumns.push(...columns);
    return this;
  }

  /**
   * Add HAVING condition
   */
  having(condition: SQL): this {
    if (condition) {
      this.#havingConditions.push(condition);
    }
    return this;
  }

  /**
   * Add INNER JOIN
   */
  innerJoin(table: TTable, condition: SQL): this {
    this.#joinClauses.push({ condition, table, type: "inner" });
    return this;
  }

  /**
   * Add LEFT JOIN
   */
  leftJoin(table: TTable, condition: SQL): this {
    this.#joinClauses.push({ condition, table, type: "left" });
    return this;
  }

  /**
   * Set select columns
   */
  select(columns: Record<string, Column>): this {
    this.#selectColumns = columns;
    return this;
  }

  /**
   * Add WHERE condition
   */
  where(condition: SQL): this {
    if (condition) {
      this.#whereConditions.push(condition);
    }
    return this;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Add ORDER BY condition
   */
  #addOrderBy(column: Column, direction: "ASC" | "DESC"): void {
    this.#orderByConditions.push(direction === "DESC" ? desc(column) : asc(column));
  }

  /**
   * Apply filter conditions (OR for multiple, single for one)
   */
  #applyFilterConditions(conditions: SQL[]): void {
    if (conditions.length === 0) return;

    // @ts-expect-error - TypeScript doesn't understand that conditions only contains valid SQL
    this.where(conditions.length === 1 ? conditions[0] : or(...conditions));
  }

  /**
   * Apply all JOIN clauses to query
   */
  #applyJoins<TQuery>(query: TQuery): TQuery {
    for (const { condition, table, type } of this.#joinClauses) {
      // @ts-expect-error - Drizzle join methods have complex types that TypeScript can't infer correctly
      query = type === "left" ? query.leftJoin(table, condition) : query.innerJoin(table, condition);
    }
    return query;
  }

  /**
   * Build count query with proper GROUP BY support
   */
  #buildCountQuery(): unknown {
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
   */
  #buildFilterConditions(
    column: Column,
    columnName: string,
    filterValue: string | string[],
    allowedOperators: FilterOperator[],
  ): SQL[] {
    const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];

    return filterValues.map((value) => {
      const { operator, value: parsedValue } = this.#parseFilterValue(value);
      this.#validateOperator(operator, columnName, allowedOperators);
      // @ts-expect-error - Filter value types are validated at runtime but TypeScript can't infer them
      return this.#createFilterCondition(column, operator, parsedValue);
    });
  }

  /**
   * Build grouped count query using subquery
   */
  #buildGroupedCountQuery(): unknown {
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

    return this.#db.select({ itemCount: count() }).from(subquery.as("grouped"));
  }

  /**
   * Build final query with all conditions
   */
  #buildQuery(): unknown {
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
   */
  #buildSelectObject(selectFields: string[]): Record<string, Column> {
    return selectFields.reduce(
      (acc, field) => {
        // @ts-expect-error - table is generic Drizzle type
        const column = this.#table[field] as TableColumns[string];
        if (column) {
          acc[field] = column;
        }
        return acc;
      },
      {} as Record<string, Column>,
    );
  }

  /**
   * Combine multiple conditions with AND
   */
  #combineConditions(conditions: SQL[]): SQL | undefined {
    if (conditions.length === 0) return;
    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }

  /**
   * Create filter condition based on operator
   */
  #createFilterCondition(column: Column, operator: FilterOperator, value: boolean | number | string | string[]): SQL {
    if (operator === "$ilike") {
      const stringValue = typeof value === "string" ? value : String(value);
      return ilike(column, `%${stringValue}%`);
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
   */
  #extractEnumValues(): string[] {
    try {
      // @ts-expect-error - createSelectSchema accepts any table type at runtime
      const baseSchema = createSelectSchema(this.#config.table);
      const baseProperties = baseSchema.properties || {};

      for (const columnProperty of Object.values(baseProperties)) {
        const prop = columnProperty as TSchema;
        if (prop.enum && Array.isArray(prop.enum)) {
          return prop.enum as string[];
        }

        if (prop.anyOf && Array.isArray(prop.anyOf)) {
          const enumValues: string[] = [];
          for (const option of prop.anyOf) {
            const opt = option as TSchema;
            if (opt.enum && Array.isArray(opt.enum)) {
              return opt.enum as string[];
            }
            if (opt.const !== undefined) {
              enumValues.push(opt.const as string);
            }
          }

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
   */
  #getAllowedSelectColumns(): string[] {
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
   */
  #handleDatabaseError(error: unknown): never {
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
   */
  #normalizeFilterableColumns(): Record<string, FilterOperator[]> {
    const { filterableColumns: filterableColumnsConfig = [] } = this.#config;

    return Array.isArray(filterableColumnsConfig)
      ? Object.fromEntries(filterableColumnsConfig.map((col) => [col, DEFAULT_OPERATORS]))
      : filterableColumnsConfig;
  }

  /**
   * Parse filter value into operator and value
   */
  #parseFilterValue(value: string): ParsedFilterValue {
    if (!value) return { operator: "$eq", value };

    // Match operator pattern: $operator:value
    const operatorMatch = value.match(/^(\$\w+):(.+)$/);
    if (operatorMatch) {
      const [, operator, val] = operatorMatch;

      // Validate operator exists in FILTER_OPERATORS
      const validOperators = Object.keys(FILTER_OPERATORS) as FilterOperator[];
      if (!validOperators.includes(operator as FilterOperator)) {
        throw new BadRequestException(`Unknown filter operator: ${operator}. Valid operators: ${validOperators.join(", ")}`);
      }

      const op = operator as FilterOperator;

      // Parse array values for $in and $notIn
      if (ARRAY_OPERATORS.has(op)) {
        return { operator: op, value: val.split(",") };
      }

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
   */
  #parseSortParam(sortParam: string): SortParam {
    const [column, direction = "ASC"] = sortParam.split(":");
    const upperDir = direction.toUpperCase();
    const dir: "ASC" | "DESC" = upperDir === "ASC" || upperDir === "DESC" ? upperDir : "ASC";
    return { column, direction: dir };
  }

  /**
   * Resolve sort parameters from query or defaults
   */
  #resolveSortParams(sortBy?: string[], defaultSortBy?: [string, "ASC" | "DESC"][]): SortParam[] {
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
   */
  #validateFilterColumn(columnName: string, filterableColumns: Record<string, FilterOperator[]>): void {
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
   */
  #validateOperator(operator: string, columnName: string, allowedOperators: FilterOperator[]): void {
    if (!allowedOperators.includes(operator as FilterOperator)) {
      throw new BadRequestException(
        `Operator "${operator}" is not allowed for column "${columnName}". Allowed: ${allowedOperators.join(", ")}`,
      );
    }
  }

  /**
   * Validate select fields are allowed
   */
  #validateSelectFields(selectFields: string[], allowedColumns: string[]): void {
    for (const field of selectFields) {
      if (!allowedColumns.includes(field)) {
        throw new BadRequestException(`Column "${field}" is not selectable`);
      }
    }
  }

  /**
   * Validate sort column is allowed
   */
  #validateSortColumn(column: string, sortableColumns: string[]): void {
    if (!sortableColumns.includes(column)) {
      throw new BadRequestException(`Column "${column}" is not sortable`);
    }
  }
}
