export class BAD_REQUEST_400 extends Error {
  validationContext;
  validation;
  constructor(message) {
    super(message);
    this.name = "BAD_REQUEST_400";
  }
}

export class INVALID_JSON_SYNTAX_400 extends Error {
  constructor(message) {
    super(message || "Invalid JSON syntax");
    this.name = "INVALID_JSON_SYNTAX_400";
  }
}

export class UNAUTHORIZED_ACCESS_401 extends Error {
  constructor(message) {
    super(message || "Unauthorized access");
    this.name = "UNAUTHORIZED_ACCESS_401";
  }
}

export class ENDPOINT_NOT_FOUND_404 extends Error {
  constructor(message = "The requested endpoint was not found.") {
    super(message);
    this.name = "ENDPOINT_NOT_FOUND_404";
  }
}

export class INTERNAL_SERVER_ERROR_500 extends Error {
  constructor(message) {
    super(message);
    this.name = "INTERNAL_SERVER_ERROR_500";
  }
}

export class FAILED_ON_SERIALIZATION_VALIDATION_500 extends Error {
  constructor(message) {
    super(message);
    this.name = "FAILED_ON_SERIALIZATION_VALIDATION_500";
  }
}

export class UNSUPPORTED_MEDIA_TYPE_415 extends Error {
  constructor(message) {
    super(message);
    this.name = "UNSUPPORTED_MEDIA_TYPE_415";
  }
}

export class TOO_MANY_REQUESTS_429 extends Error {
  constructor(message) {
    super(message);
    this.name = "TOO_MANY_REQUESTS_429";
  }
}

export class PAYLOAD_TOO_LARGE_413 extends Error {
  constructor(message) {
    super(message || "Payload too large");
    this.name = "PAYLOAD_TOO_LARGE_413";
  }
}

export class RESOURCE_NOT_ACCEPTABLE_406 extends Error {
  constructor(message) {
    super(message);
    this.name = "RESOURCE_NOT_ACCEPTABLE_406";
  }
}

export class SERVICE_UNAVAILABLE_EXCEPTION_503 extends Error {
  constructor(message) {
    super(message);
    this.name = "SERVICE_UNAVAILABLE_EXCEPTION_503";
  }
}

export class SERVER_TIMEOUT_408 extends Error {
  constructor(message) {
    super(message);
    this.name = "SERVER_TIMEOUT_408";
  }
}
