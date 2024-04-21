# Error Handling Documentation

This README provides an overview of the error handling approach within our application, using the `auth` module as a representative example.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Custom Exceptions](#custom-exceptions)
- [Error Collection](#error-collection)
- [Router Integration](#router-integration)
- [Best Practices](#best-practices)

## Directory Structure

In a modular setup, each module (like `auth`) has its designated folder and set of files.

```
module-name/
|-- module-name.schemas.js
|-- module-name.router.js
|-- module-name.errors.js
|-- exceptions/
|   |-- specific-error.exception.ts
```

*Example for the `auth` module:*

```
auth/
|-- auth.schema.js
|-- auth.router.js
|-- auth.errors.js
|-- exceptions/
|   |-- email-already-exist.exception.js
|   |-- phone-number-already-exist.exception.js
```

## Custom Exceptions

**Purpose**: Create module-specific exceptions to handle particular error cases.

In `module-name/exceptions/`, you'll find exception classes. Each exception captures specific error details, giving more context and information about the issue.

*Example from `auth` module:*

```typescript
export class EmailAlreadyExistException extends Error {
name = "EmailAlreadyExistException";

constructor(message = EmailAlreadyExistException.defaultMessage) {
super(message);
}

static get userMessage() {
return "Email already exists, please enter another one.";
}

static get defaultMessage() {
return "Email already exists in the system.";
}

static of(message) {
return Promise.reject(new EmailAlreadyExistException(message));
}
}
```

## Error Collection

**Purpose**: Collate all module-specific exceptions into a unified error collection.

Within `module-name.errors.ts`, all the exceptions pertinent to that module get aggregated. This provides a structured way to access and manage module-related errors.

*Example from `auth` module:*

```typescript
import { defaultHttpErrorCollection } from "./errors/scaffold.js";
import { EmailAlreadyExistException } from "./exceptions/email-already-exist.exception.js";
import { PhoneNumberAlreadyExistException } from "./exceptions/phone-number-already-exist.exception.js";

export const authHttpErrorCollection = {
  ...defaultHttpErrorCollection,
  [EmailAlreadyExistException.name]: {
    code: 409001,
    httpStatusCode: 409,
    userMessage: EmailAlreadyExistException.userMessage,
    developerMessage: EmailAlreadyExistException.defaultMessage,
  },
  [PhoneNumberAlreadyExistException.name]: {
    code: 409002,
    httpStatusCode: 409,
    userMessage: PhoneNumberAlreadyExistException.userMessage,
    developerMessage: PhoneNumberAlreadyExistException.defaultMessage,
  },
};
```

## Schema Definitions

Purpose: Define input and output structures, along with error mapping for routes.

Within auth.schema.ts, you can define your input/output schema and integrate the errors.

Example from auth module:

```typescript

const authSchema = {
    signUp: {
      summary: "Create new user and return him a JWT.",
      body: SIGN_UP_INPUT_SCHEMA,
      response: {
        201: SIGN_IN_UP_OUTPUT_SCHEMA,
        ...convertHttpErrorCollectionToFastifyAjvSchemaErrorCollection(authHttpErrorCollection)
      },
    },
  }
```

## Router Integration

**Purpose**: Integrate the error handling seamlessly into your routing logic.

In the `module-name.router.ts` file, the error collection is integrated with routes to manage and respond to error scenarios.

*Example from `auth` module:*

``` typescript
import { authHttpErrorCollection } from './auth.errors';

//...

app.post("/auth/signup", {
schema: signUpSchema,
errorHandler: HttpFastifyErrorHandlerFactory(authHttpErrorCollection),
async handler(req, rep) {
rep.code(201);
return signUpUseCase(req.body);
},
});
```

## Best Practices

- Keep your error-handling modular, so each module manages its exceptions.
- Always provide user-friendly messages in exceptions for frontend display.
- Extend the base Error class to ensure stack traces are captured and can be logged.
- Regularly review the error collection for consistency and completeness.

---

Following this modular approach ensures that error handling remains self-contained, scalable, and maintainable across the application.