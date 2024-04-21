export class ResourceNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = "ResourceNotFoundException";
  }

  static of(message) {
    return Promise.reject(new ResourceNotFoundException(message));
  }
}

export class ResourceAlreadyExistException extends Error {
  constructor(message) {
    super(message);
    this.name = "ResourceAlreadyExistException";
  }

  static of(message) {
    return Promise.reject(new ResourceAlreadyExistException(message));
  }
}

export class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestException";
  }

  static of(message) {
    return Promise.reject(new BadRequestException(message));
  }
}

export class UnauthorizedException extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedException";
  }

  static of(message) {
    return Promise.reject(new UnauthorizedException(message));
  }
}

export class ForbiddenException extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenException";
  }

  static of(message) {
    return Promise.reject(new ForbiddenException(message));
  }
}

export class ConflictException extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictException";
  }

  static of(message) {
    return Promise.reject(new ConflictException(message));
  }
}

export class UnprocessableEntityException extends Error {
  constructor(message) {
    super(message);
    this.name = "UnprocessableEntityException";
  }

  static of(message) {
    return Promise.reject(new UnprocessableEntityException(message));
  }
}
