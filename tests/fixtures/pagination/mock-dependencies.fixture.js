/**
 * @file Mock dependencies fixtures for testing
 */

/**
 * Mock logger
 */
export const MOCK_LOGGER = {
  /**
   *
   */
  debug: () => {},
  /**
   *
   */
  info: () => {},
  /**
   *
   */
  error: () => {},
  /**
   *
   */
  warn: () => {},
  /**
   *
   */
  trace: () => {},
};

/**
 * Mock database instance
 * @param {object} [options] - Mock options
 * @returns {object} Mock database
 */
export const createMockDatabase = (options = {}) => {
  const { selectResult = [], countResult = 0 } = options;

  return {
    /**
     *
     */
    select: () => ({
      /**
       *
       */
      from: () => ({
        /**
         *
         */
        where: () => ({
          /**
           *
           */
          limit: () => ({
            /**
             *
             */
            offset: () => Promise.resolve(selectResult),
          }),
        }),
      }),
    }),
    /**
     *
     */
    $count: () => Promise.resolve(countResult),
  };
};

/**
 * Mock dependencies object
 * @param {object} [options] - Mock options
 * @returns {object} Mock dependencies
 */
export const createMockDependencies = (options = {}) => {
  const { db = createMockDatabase(), logger = MOCK_LOGGER } = options;

  return {
    db,
    logger,
  };
};

/**
 * Mock table with columns
 */
export const MOCK_TABLE = {
  id: { name: "id" },
  email: { name: "email" },
  firstName: { name: "first_name" },
  lastName: { name: "last_name" },
  role: { name: "role" },
  createdAt: { name: "created_at" },
  updatedAt: { name: "updated_at" },
  password: { name: "password" },
};

