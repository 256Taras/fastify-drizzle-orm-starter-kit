import { BaseDomainError } from "./base-domain-error.ts";

export class BadRequestException extends BaseDomainError {
  constructor(message: string) {
    super(message, "BadRequestException");
  }
}

export class ConflictException extends BaseDomainError {
  constructor(message: string) {
    super(message, "ConflictException");
  }
}

export class ForbiddenException extends BaseDomainError {
  constructor(message: string) {
    super(message, "ForbiddenException");
  }
}

export class ResourceAlreadyExistException extends BaseDomainError {
  constructor(message: string) {
    super(message, "ResourceAlreadyExistException");
  }
}

export class ResourceNotFoundException extends BaseDomainError {
  constructor(message: string) {
    super(message, "ResourceNotFoundException");
  }
}

export class UnauthorizedException extends BaseDomainError {
  constructor(message: string) {
    super(message, "UnauthorizedException");
  }
}

export class UnprocessableEntityException extends BaseDomainError {
  constructor(message: string) {
    super(message, "UnprocessableEntityException");
  }
}
