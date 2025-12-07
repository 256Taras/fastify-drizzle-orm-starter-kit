# Libs Directory

Centralized library of utilities, services, and constants for the project.

## 📁 Structure

### Constants (`constants/`)
Basic constants and configuration values.

- **`pagination.constants.js`** - Pagination constants (LIMIT, OFFSET, ORDER_BY)
- **`constants/common.constants.js`** - Common constants:
  - Status (STATUS_SUCCESS, STATUS_FAIL)
  - Session Storage Keys (TOKENS)
  - Database Tables (TABLES)
  - User Roles (ROLES_NAMES)

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

### Libraries (organized by functionality)

Libraries are organized by their functionality, not by file type:

- **`auth/`** - Authentication library (auth.plugin.js)
- **`dependency-injection-container/`** - DI container library (di-container.plugin.js)
- **`encryption/`** - Encryption library (encrypter.service.js)
- **`logging/`** - Logging library (logger.plugin.js, logger.service.js)
- **`pagination/`** - Pagination library (plugin, service, utils, contracts, types)
- **`request-timeout/`** - Request timeout library (request-timeout.plugin.js)
- **`session-storage/`** - Session storage library (session-storage.service.js)
- **`upload/`** - File upload library (upload.plugin.js, upload.utils.js)

### Utils (`utils/`)
General utility functions (not library-specific).

- **`files.js`** - File system operations
- **`schemas.js`** - TypeBox schema utilities

## 📦 Usage

### Direct imports
```javascript
// Constants
import { LIMIT, OFFSET, ORDER_BY } from "#libs/constants/pagination.constants.js";
import { STATUS_SUCCESS, TOKENS } from "#libs/constants/common.constants.js";

// Contracts
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.js";

// Errors
import { BadRequestException } from "#libs/errors/domain.errors.js";
import { BAD_REQUEST_400 } from "#libs/errors/http.errors.js";

// Libraries
import encrypterService from "#libs/encryption/encrypter.service.js";
import { logger } from "#libs/logging/logger.service.js";
import { createPaginatedResponse } from "#libs/pagination/pagination.utils.js";

// Utils
import { getDirName } from "#libs/utils/files.js";
```

## 🎯 Organization Principles

1. **Libraries** - organized by functionality (auth, logging, pagination, etc.)
2. **Constants** - static values that don't change
3. **Contracts** - TypeBox schemas for validation
4. **Errors** - error classes and their mapping
5. **Utils** - general utility functions (not library-specific)

## 📝 Notes

- All files in `libs/` should be mostly stateless
- Services export factory functions, not instances
- Utils - pure functions, easy to test
- Plugins are registered in Fastify through `fastify-plugin`
