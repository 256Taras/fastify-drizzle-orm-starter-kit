export class BadRequestException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "BadRequestException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new BadRequestException(message));
  }
}

export class ConflictException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "ConflictException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new ConflictException(message));
  }
}

export class ForbiddenException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "ForbiddenException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new ForbiddenException(message));
  }
}

export class ResourceAlreadyExistException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "ResourceAlreadyExistException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new ResourceAlreadyExistException(message));
  }
}

export class ResourceNotFoundException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "ResourceNotFoundException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new ResourceNotFoundException(message));
  }
}

export class UnauthorizedException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "UnauthorizedException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new UnauthorizedException(message));
  }
}

export class UnprocessableEntityException extends Error {
  /**
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "UnprocessableEntityException";
  }

  /**
   *
   * @param {string} message
   */
  static of(message) {
    return Promise.reject(new UnprocessableEntityException(message));
  }
}
