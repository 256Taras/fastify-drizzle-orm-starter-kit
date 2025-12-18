/** Base class for all domain errors Reduces code duplication and provides consistent error structure */
export class BaseDomainError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}
