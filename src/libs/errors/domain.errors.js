import { BaseDomainError } from "./base-domain-error.js";

export class BadRequestException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "BadRequestException");
  }
}

export class ConflictException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "ConflictException");
  }
}

export class ForbiddenException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "ForbiddenException");
  }
}

export class ResourceAlreadyExistException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "ResourceAlreadyExistException");
  }
}

export class ResourceNotFoundException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "ResourceNotFoundException");
  }
}

export class UnauthorizedException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "UnauthorizedException");
  }
}

export class UnprocessableEntityException extends BaseDomainError {
  /** @param {string} message */
  constructor(message) {
    super(message, "UnprocessableEntityException");
  }
}
