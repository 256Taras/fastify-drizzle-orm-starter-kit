/**
 * Base class for all domain errors
 * Reduces code duplication and provides consistent error structure
 */
export class BaseDomainError extends Error {
  /**
   * @param {string} message
   * @param {string} name
   */
  constructor(message, name) {
    super(message);
    this.name = name;
  }

  /**
   * Factory method to create and reject with error
   * @param {string} message
   * @returns {Promise<never>}
   */
  static of(message) {
    // @ts-expect-error - this is a class constructor, works at runtime
    return Promise.reject(new this(message));
  }
}
