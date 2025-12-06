import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, lte, notInArray, or } from "drizzle-orm";

import { BadRequestException } from "#libs/errors/domain.errors.js";

/**
 * Query builder class for chainable API
 */
export class PaginationQueryBuilder {
  /** @type {import('./pagination.types.jsdoc.js').PaginationConfig<any>} */
  #config;

  /** @type {any} */
  #db;

  /** @type {import("drizzle-orm").Column[]} */
  #groupByColumns = [];

  /** @type {import("drizzle-orm").SQL[]} */
  #havingConditions = [];

  /** @type {Array<{type: 'left' | 'inner', table: any, condition: import("drizzle-orm").SQL}>} */
  #joinClauses = [];

  /** @type {import("drizzle-orm").SQL[]} */
  #orderByConditions = [];

  /** @type {Record<string, any> | undefined} */
  #selectColumns;

  /** @type {any} */
  #table;

  /** @type {import("drizzle-orm").SQL[]} */
  #whereConditions = [];

  /**
   * @param {any} db - Drizzle database instance
   * @param {any} table - Table to query
   * @param {import('./pagination.types.jsdoc.js').PaginationConfig<any>} config - Pagination config
   */
  constructor(db, table, config) {
    this.#db = db;
    this.#table = table;
    this.#config = config;
    this.#selectColumns = undefined;
  }

  /**
   * Apply filters from query params (protected by config)
   * @param {Record<string, string | string[]>} [filters] - Filter params (can be string or array of strings)
   * @returns {PaginationQueryBuilder}
   */
  applyFilters(filters) {
    if (!filters || Object.keys(filters).length === 0) return this;

    const { filterableColumns: filterableColumnsConfig = [] } = this.#config;

    // Normalize filterableColumns - convert array to object if needed
    const filterableColumnsObj = Array.isArray(filterableColumnsConfig)
      ? Object.fromEntries(
          filterableColumnsConfig.map((col) => [col, ["$eq", "$gt", "$gte", "$lt", "$lte", "$in", "$notIn", "$ilike"]]),
        )
      : filterableColumnsConfig;

    for (const [key, value] of Object.entries(filters)) {
      if (!(key in filterableColumnsObj)) {
        throw new BadRequestException(`Column "${key}" is not filterable`);
      }

      const allowedOperators = filterableColumnsObj[key];
      if (!Array.isArray(allowedOperators) || allowedOperators.length === 0) {
        throw new BadRequestException(`No operators allowed for filter '${key}'`);
      }

      // eslint-disable-next-line security/detect-object-injection
      const column = this.#table[key];
      if (!column) continue;

      // Handle both single value and array of values
      const filterValues = Array.isArray(value) ? value : [value];
      /** @type {import("drizzle-orm").SQL[]} */
      const filterConditions = [];

      for (const filterValue of filterValues) {
        const { operator, value: parsedValue } = this.#parseFilterValue(filterValue);

        // Check if operator is allowed for this column
        if (!allowedOperators.includes(operator)) {
          throw new BadRequestException(
            `Operator "${operator}" is not allowed for column "${key}". Allowed operators: ${allowedOperators.join(", ")}`,
          );
        }

        let condition;
        switch (operator) {
          case "$eq": {
            condition = eq(column, parsedValue);
            break;
          }
          case "$gt": {
            condition = gt(column, parsedValue);
            break;
          }
          case "$gte": {
            condition = gte(column, parsedValue);
            break;
          }
          case "$ilike": {
            condition = ilike(column, `%${parsedValue}%`);
            break;
          }
          case "$in": {
            condition = inArray(column, parsedValue);
            break;
          }
          case "$lt": {
            condition = lt(column, parsedValue);
            break;
          }
          case "$lte": {
            condition = lte(column, parsedValue);
            break;
          }
          case "$notIn": {
            condition = notInArray(column, parsedValue);
            break;
          }
          default: {
            throw new BadRequestException(`Unknown filter operator: ${operator}`);
          }
        }

        // All cases in switch return a condition, so condition is always defined
        filterConditions.push(/** @type {import("drizzle-orm").SQL} */ condition);
      }

      // If multiple filter values for same column, combine with OR
      if (filterConditions.length === 1) {
        this.where(filterConditions[0]);
      } else if (filterConditions.length > 1) {
        // @ts-expect-error - TypeScript doesn't understand that filterConditions only contains valid SQL conditions
        this.where(or(...filterConditions));
      }
    }

    return this;
  }

  /**
   * Apply search across searchable columns (protected by config)
   * @param {string} [searchQuery] - Search query
   * @returns {PaginationQueryBuilder}
   */
  applySearch(searchQuery) {
    if (!searchQuery) return this;

    const { searchableColumns = [] } = this.#config;
    if (searchableColumns.length === 0) return this;

    const searchConditions = searchableColumns
      .map((columnName) => {
        // eslint-disable-next-line security/detect-object-injection
        const column = this.#table[columnName];
        return column ? ilike(column, `%${searchQuery}%`) : null;
      })
      .filter((condition) => condition !== null)
      .map((condition) => /** @type {import("drizzle-orm").SQL} */ condition);

    if (searchConditions.length > 0) {
      const condition = searchConditions.length === 1 ? searchConditions[0] : or(...searchConditions);
      if (condition) {
        this.where(condition);
      }
    }

    return this;
  }

  /**
   * Apply select from querystring (protected by config)
   * @param {string[]} [selectFields] - Fields to select from querystring
   * @returns {PaginationQueryBuilder}
   */
  applySelect(selectFields) {
    if (!selectFields || selectFields.length === 0) return this;

    const { excludeColumns = [], selectableColumns = [] } = this.#config;

    let allowedColumns = [];

    if (selectableColumns.length > 0) {
      allowedColumns = selectableColumns;
    } else if (excludeColumns.length > 0) {
      const allColumns = Object.keys(this.#table);
      allowedColumns = allColumns.filter((col) => !excludeColumns.includes(col));
    }

    if (allowedColumns.length === 0) return this;

    for (const field of selectFields) {
      if (!allowedColumns.includes(field)) {
        throw new BadRequestException(`Column "${field}" is not selectable`);
      }
    }

    const selectObject = {};
    for (const field of selectFields) {
      // eslint-disable-next-line security/detect-object-injection
      const column = this.#table[field];
      if (column) {
        selectObject[field] = column;
      }
    }

    if (Object.keys(selectObject).length > 0) {
      this.#selectColumns = selectObject;
    }

    return this;
  }

  /**
   * Apply sorting (protected by config)
   * @param {string[]} [sortBy] - Sort params
   * @returns {PaginationQueryBuilder}
   */
  applySorting(sortBy) {
    const { defaultSortBy, sortableColumns } = this.#config;

    const sortParams =
      sortBy && sortBy.length > 0
        ? sortBy.map(this.#parseSortParam.bind(this))
        : (defaultSortBy || []).map(([column, direction]) => ({ column, direction }));

    for (const { column, direction } of sortParams) {
      if (!sortableColumns.includes(column)) {
        throw new BadRequestException(`Column "${column}" is not sortable`);
      }

      // eslint-disable-next-line security/detect-object-injection
      const tableColumn = this.#table[column];
      if (!tableColumn) continue;

      this.#addOrderBy(tableColumn, direction);
    }

    return this;
  }

  /**
   * Execute query with pagination
   * @param {object} options
   * @param {number} options.limit - Items per page
   * @param {number} options.offset - Offset
   * @returns {Promise<import('./pagination.types.jsdoc.js').QueryExecutionResult>}
   */
  async execute({ limit, offset }) {
    const dataQuery = this.#buildQuery()
      .orderBy(...this.#orderByConditions)
      .limit(limit)
      .offset(offset);

    const countQuery = this.#buildCountQuery();

    const [[{ itemCount }], entities] = await Promise.all([countQuery, dataQuery]);

    return { entities, itemCount };
  }

  /**
   * Add GROUP BY
   * @param {...import("drizzle-orm").Column} columns - Columns to group by
   * @returns {PaginationQueryBuilder}
   */
  groupBy(...columns) {
    this.#groupByColumns.push(...columns);
    return this;
  }

  /**
   * Add HAVING condition
   * @param {import("drizzle-orm").SQL} condition - Having condition
   * @returns {PaginationQueryBuilder}
   */
  having(condition) {
    if (condition) {
      this.#havingConditions.push(condition);
    }
    return this;
  }

  /**
   * Add INNER JOIN
   * @param {any} table - Table to join
   * @param {import("drizzle-orm").SQL} condition - Join condition
   * @returns {PaginationQueryBuilder}
   */
  innerJoin(table, condition) {
    this.#joinClauses.push({ condition, table, type: "inner" });
    return this;
  }

  /**
   * Add LEFT JOIN
   * @param {any} table - Table to join
   * @param {import("drizzle-orm").SQL} condition - Join condition
   * @returns {PaginationQueryBuilder}
   */
  leftJoin(table, condition) {
    this.#joinClauses.push({ condition, table, type: "left" });
    return this;
  }

  /**
   * Set select columns
   * @param {Record<string, any>} columns - Columns to select
   * @returns {PaginationQueryBuilder}
   */
  select(columns) {
    this.#selectColumns = columns;
    return this;
  }

  /**
   * Add WHERE condition
   * @param {import("drizzle-orm").SQL} condition - SQL condition
   * @returns {PaginationQueryBuilder}
   */
  where(condition) {
    if (condition) {
      this.#whereConditions.push(condition);
    }
    return this;
  }

  /**
   * Add ORDER BY (internal use only, protected by config)
   * @param {any} column - Column to sort
   * @param {'ASC' | 'DESC'} direction - Sort direction
   */
  #addOrderBy(column, direction) {
    this.#orderByConditions.push(direction === "DESC" ? desc(column) : asc(column));
  }

  /**
   * Build count query
   * @returns {any} Count query builder
   */
  #buildCountQuery() {
    let query = this.#db.select({ itemCount: count() }).from(this.#table);

    for (const { condition, table, type } of this.#joinClauses) {
      query = type === "left" ? query.leftJoin(table, condition) : query.innerJoin(table, condition);
    }

    if (this.#whereConditions.length > 0) {
      const whereCondition = this.#whereConditions.length === 1 ? this.#whereConditions[0] : and(...this.#whereConditions);
      query = query.where(whereCondition);
    }

    if (this.#groupByColumns.length > 0) {
      const subquery = this.#db.select({ id: this.#table.id }).from(this.#table);

      for (const { condition, table, type } of this.#joinClauses) {
        if (type === "left") {
          subquery.leftJoin(table, condition);
        } else {
          subquery.innerJoin(table, condition);
        }
      }

      if (this.#whereConditions.length > 0) {
        subquery.where(and(...this.#whereConditions));
      }

      subquery.groupBy(...this.#groupByColumns);

      if (this.#havingConditions.length > 0) {
        subquery.having(and(...this.#havingConditions));
      }

      return this.#db.select({ itemCount: count() }).from(subquery.as("grouped"));
    }

    return query;
  }

  /**
   * Build final query
   * @returns {any} Query builder
   */
  #buildQuery() {
    let query = this.#db.select(this.#selectColumns || undefined).from(this.#table);

    for (const { condition, table, type } of this.#joinClauses) {
      query = type === "left" ? query.leftJoin(table, condition) : query.innerJoin(table, condition);
    }

    if (this.#whereConditions.length > 0) {
      const whereCondition = this.#whereConditions.length === 1 ? this.#whereConditions[0] : and(...this.#whereConditions);
      query = query.where(whereCondition);
    }

    if (this.#groupByColumns.length > 0) {
      query = query.groupBy(...this.#groupByColumns);
    }

    if (this.#havingConditions.length > 0) {
      const havingCondition =
        this.#havingConditions.length === 1 ? this.#havingConditions[0] : and(...this.#havingConditions);
      query = query.having(havingCondition);
    }

    return query;
  }

  /**
   * Parse filter value
   * @param {string} value - Filter value
   * @returns {import('./pagination.types.jsdoc.js').ParsedFilterValue}
   */
  #parseFilterValue(value) {
    if (!value) return { operator: "$eq", value };

    const operatorMatch = value.match(/^(\$\w+):(.+)$/);
    if (operatorMatch) {
      const [, operator, val] = operatorMatch;
      const validOperators = ["$eq", "$ilike", "$gt", "$gte", "$lt", "$lte", "$in", "$notIn"];
      if (!validOperators.includes(operator)) {
        return { operator: "$eq", value };
      }
      // TypeScript type narrowing after includes check
      const op = /** @type {import('./pagination.types.jsdoc.js').FilterOperator} */ (operator);
      if (op === "$in" || op === "$notIn") {
        return { operator: op, value: val.split(",") };
      }
      return { operator: op, value: val };
    }

    if (value.startsWith("$")) {
      return { operator: "$ilike", value: value.slice(1) };
    }

    return { operator: "$eq", value };
  }

  /**
   * Parse sort param
   * @param {string} sortParam - Sort parameter
   * @returns {import('./pagination.types.jsdoc.js').SortParam}
   */
  #parseSortParam(sortParam) {
    const [column, direction = "ASC"] = sortParam.split(":");
    const upperDir = direction.toUpperCase();
    /** @type {'ASC' | 'DESC'} */
    const dir = upperDir === "ASC" || upperDir === "DESC" ? upperDir : "ASC";
    return { column, direction: dir };
  }
}
