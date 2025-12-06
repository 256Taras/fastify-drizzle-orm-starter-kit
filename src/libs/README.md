# Libs Directory

Centralized library of utilities, services, and constants for the project.

## 📁 Structure

### Constants (`constants/`)
Basic constants and configuration values.

- **`pagination.constants.js`** - Pagination constants (LIMIT, OFFSET, ORDER_BY)
- **`common.constants.js`** - Common constants:
  - Status (STATUS_SUCCESS, STATUS_FAIL)
  - Session Storage Keys (TOKENS)
  - Database Tables (TABLES)
  - User Roles (ROLES_NAMES)
- **`common.constants.js`** (root) - Re-exports all constants for backward compatibility

### Contracts (`contracts/`)
TypeBox schemas for API validation.

- **`v1/pagination.contracts.js`** - Pagination schemas (offsetLimit, orderBy, paginationQuery)
- **`v1/common.contracts.js`** - Common schemas (headers, id, status, timestamp)
- **`v1/index.js`** - Exports COMMON_CONTRACTS_V1 combining all schemas

### Errors (`errors/`)
Error classes and their collections.

- **`base-domain-error.js`** - Base class for all domain errors
- **`domain.errors.js`** - Domain-specific error classes (BadRequestException, etc.)
- **`http.errors.js`** - HTTP error classes (BAD_REQUEST_400, etc.)
- **`default-http-error-collection.js`** - Error mapping to HTTP responses

### Services (`services/`)
Service factories for dependency injection.

- **`encrypter.service.js`** - Cryptographic utilities (hash, encrypt, decrypt, UUID)
- **`logger.service.js`** - Logging service (Pino)
- **`session-storage.service.js`** - Service for storing data in request context

### Utils (`utils/`)
Utility functions.

- **`files.js`** - File system operations
- **`pagination.js`** - Pagination utilities
- **`schemas.js`** - TypeBox schema utilities
- **`upload.js`** - File path utilities

### Plugins (`plugins/`)
Fastify plugins for application configuration.

- **`auth.plugin.js`** - JWT authentication
- **`di-container.plugin.js`** - Dependency injection container
- **`logger.plugin.js`** - Request logging
- **`request-timeout.plugin.js`** - Timeout handling
- **`upload.plugin.js`** - File upload handling

## 📦 Usage

### Direct imports
```javascript
// Constants (preferred)
import { LIMIT, OFFSET, ORDER_BY } from "#libs/constants/pagination.constants.js";
import { STATUS_SUCCESS, TOKENS } from "#libs/constants/common.constants.js";

// Constants (backward compatible)
import { LIMIT, TOKENS } from "#libs/common.constants.js";

// Contracts
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.js";

// Errors
import { BadRequestException } from "#libs/errors/domain.errors.js";
import { BAD_REQUEST_400 } from "#libs/errors/http.errors.js";

// Services
import encrypterService from "#libs/encryption/encrypter.service.js";
import { logger } from "#libs/logging/logger.service.js";

// Utils
import { getDirName } from "#libs/utils/files.js";
import { createPaginatedResponse } from "#libs/pagination/pagination.utils.js";
```

## 🎯 Organization Principles

1. **Constants** - static values that don't change
2. **Contracts** - TypeBox schemas for validation
3. **Errors** - error classes and their mapping
4. **Services** - service factories (singleton pattern)
5. **Utils** - pure functions without state
6. **Plugins** - Fastify plugins for integration

## 📝 Notes

- All files in `libs/` should be mostly stateless
- Services export factory functions, not instances
- Utils - pure functions, easy to test
- Plugins are registered in Fastify through `fastify-plugin`
