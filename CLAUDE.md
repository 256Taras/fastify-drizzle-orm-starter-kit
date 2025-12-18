# Project Instructions

You are an expert Node.js architect working on a **production-grade Fastify starter kit**.

This project follows the engineering principles of **Matteo Collina** (Fastify founder, CTO) and modern Node.js best practices.

## 🎯 Core Engineering Principles

### Code Quality Standards
- **Clean Code**: SOLID principles, Low Coupling / High Cohesion
- **Essential Complexity Only**: No accidental complexity, no over-engineering
- **Clarity Over Cleverness**: Readable, explainable architecture
- **Business-Aware Engineering**: Pragmatic decisions that serve real needs
- **Low Cognitive Load**: Code should be easy to understand without mental overhead
- **Low Coupling**: Modules should depend on abstractions, not implementations
- **Elegant Code**: Prefer simple, linear flow over nested conditionals. Extract complex logic into pure functions. Reduce cognitive complexity by breaking down large methods into smaller, focused functions. Avoid unnecessary options/parameters - if a value is always the same, hardcode it. Use proper types instead of `@ts-expect-error` workarounds.

### Code Writing Rules
1. **Minimal and Intentional**: Every line must serve a purpose
2. **Pure Functions First**: Explicit data structures, predictable transformations
3. **No Magic**: No magic strings, no magic numbers, no boolean flags in functions
4. **Single Responsibility**: Every file, function, module has ONE clear job
5. **TypeScript Types**: Use proper TypeScript types for all functions and parameters
6. **Comments Explain Why, Not What**: Code should be self-documenting
7. **Multi-Paradigm but Pragmatic**: Use the right tool for the job
8. **Reduce Cognitive Complexity**: Extract complex logic into helper functions. Prefer early returns over nested conditionals. Break large methods into smaller, focused functions. Use functional helpers for common patterns (retry, timeout, abort handling). Remove unnecessary options/parameters - if a value never changes, hardcode it.

### Anti-Patterns to Avoid
- ❌ Clever tricks or "smart" code
- ❌ Unnecessary abstractions
- ❌ Over-engineering for hypothetical futures
- ❌ Boolean flags that obscure intent
- ❌ Deep nesting or complex conditionals
- ❌ Hidden state or implicit dependencies
- ❌ Verbose comments (types are self-documenting!)

## 🏗️ Project Architecture

### Technology Stack
- **Runtime**: Node.js v25+ (ESM modules, native TypeScript support)
- **Language**: TypeScript v5.9+ (native .ts execution)
- **Framework**: Fastify v5 (fast, low-overhead HTTP server)
- **Database**: PostgreSQL v14+ + Drizzle ORM v0.45
- **Validation**: TypeBox + Fastify Type Provider
- **DI Container**: Awilix (file-system level dependency injection)
- **Logging**: Pino (structured, high-performance logging)
- **Testing**: Node.js native test runner + c8 coverage
- **Event Bus**: Node.js EventEmitter (in-memory, synchronous)

### Architecture Overview

**Architecture Type**: N-Layer Architecture with CQ S-like separation
**Maturity Level**: High (production-ready with improvement opportunities)
**Complexity**: Medium-High (well-structured but requires pattern knowledge)

### N-Layer Architecture

```
┌─────────────────────────────────────────┐
│  Router Layer (HTTP Interface)          │
│  - Route definitions                    │
│  - Schema validation (TypeBox)          │
│  - Authentication guards                │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Queries/Mutations Layer (Operations)   │
│  - Business logic orchestration         │
│  - Transaction coordination             │
│  - Event emission                       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Repository Layer (Data Access)         │
│  - Database queries (Drizzle ORM)       │
│  - Data mapping                         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Database Layer (PostgreSQL)            │
└─────────────────────────────────────────┘
```

**Layer Responsibilities:**
- **Router Layer**: HTTP interface, request/response handling, validation
- **Queries/Mutations Layer**: Business logic, orchestration, domain events
- **Repository Layer**: Data persistence, query building, data mapping
- **Database Layer**: PostgreSQL storage

### Architectural Patterns

#### 1. CQS-like Separation (Command Query Separation)

The project separates read and write operations:
- **Queries** (`*.queries.ts`) - Read operations, no side effects
- **Mutations** (`*.mutations.ts`) - Write operations, side effects, event emission

**Guidelines:**
- Queries should be pure (no mutations, no events)
- Mutations handle business logic and emit domain events
- Keep queries and mutations in separate files

#### 2. Domain Events Pattern

Domain events enable loose coupling between modules:
- **Event Definition** (`*.events.ts`) - Event constants
- **Event Emission** (in mutations) - `eventBus.emit(EVENT_NAME, payload)`
- **Event Handlers** (`*.event-handlers.ts`) - Event subscribers

**Current Implementation:**
- Uses Node.js EventEmitter (in-memory, synchronous)
- No retry mechanism
- No dead letter queue

**Best Practices:**
- Emit events after successful mutations
- Keep event payloads minimal (only necessary data)
- Event handlers should be idempotent when possible

#### 3. Repository Pattern

Data access is abstracted through repositories:
- **Repository** (`*.repository.ts`) - Data access methods
- **Model** (`*.model.ts`) - Drizzle schema definitions
- **Repository methods**: `findById`, `findByEmail`, `create`, `update`, `softDelete`

**Guidelines:**
- Repository methods return domain entities (not Drizzle types)
- Use `NON_PASSWORD_COLUMNS` for security (never return passwords)
- Always filter soft-deleted records (`isNull(deletedAt)`)

#### 4. Dependency Injection (DI)

Awilix provides file-system level DI:
- **Auto-loading**: Based on file naming conventions
- **Registration**: Via `di-container.plugin.ts`
- **Access**: Through `app.diContainer.cradle`

**Naming Conventions:**
- `*.repository.ts` → Repository pattern
- `*.queries.ts` → Query operations
- `*.mutations.ts` → Command operations
- `*.service.ts` → Shared services

**Access Pattern:**
```typescript
// In router or service
const { usersRepository, usersQueries, eventBus } = app.diContainer.cradle;
```

### Module Structure

Each feature module follows this consistent pattern:

```
modules/
└── users/
    ├── users.model.ts              # Drizzle schema definitions
    ├── users.contracts.ts          # TypeBox contracts (types)
    ├── users.schemas.ts            # Fastify route schemas
    ├── users.router.v1.ts          # HTTP route handlers
    ├── users.queries.ts            # Read operations (CQS Query)
    ├── users.mutations.ts          # Write operations (CQS Command)
    ├── users.repository.ts         # Data access layer
    ├── users.events.ts             # Domain events constants
    ├── users.event-handlers.ts     # Event subscribers
    └── users.pagination-config.ts  # Pagination config (if needed)
```

**File Responsibilities:**
- **model.ts**: Database schema (Drizzle tables, columns, relations)
- **contracts.ts**: TypeBox type definitions (shared types)
- **schemas.ts**: Fastify route validation schemas (input/output)
- **router.v1.ts**: HTTP endpoints, route registration
- **queries.ts**: Read operations (find, list, search)
- **mutations.ts**: Write operations (create, update, delete)
- **repository.ts**: Low-level database operations
- **events.ts**: Domain event constants
- **event-handlers.ts**: Event subscription and handling

### Current Project Structure

```
src/
├── index.ts                        # Application entry point (lifecycle manager)
├── configs/                        # Configuration files
│   ├── index.ts                    # Re-exports all configs
│   ├── env.config.ts               # Environment validation (TypeBox schema)
│   ├── app.config.ts               # Application settings
│   ├── db.config.ts                # Database configuration
│   ├── auth.config.ts              # Auth settings (JWT)
│   ├── server.config.ts            # Server settings (port, timeout)
│   ├── fastify.config.ts           # Fastify instance config
│   ├── fastify-cors.config.ts      # CORS settings
│   ├── fastify-helmet.config.ts    # Security headers
│   ├── fastify-jwt.config.ts       # JWT configuration
│   ├── fastify-rate-limit.config.ts # Rate limiting
│   ├── fastify-metrics.config.ts   # Prometheus metrics
│   ├── encryption.config.ts        # Encryption settings
│   ├── logger.config.ts            # Pino logger config
│   └── openapi.config.ts           # Swagger/OpenAPI config
├── infra/                          # Infrastructure layer
│   ├── api/http/
│   │   ├── fastify-server.ts       # RestApiServer class
│   │   ├── fastify-error-handler.ts # Global error handlers
│   │   ├── server.types.d.ts       # Server type definitions
│   │   └── routes/
│   │       └── health-check.router.ts # Health check endpoint
│   └── database/
│       ├── db.ts                   # DatabaseManager class
│       ├── db-schema.ts            # Schema registry
│       └── table-names.ts          # Table name constants
├── libs/                           # Shared utilities and services
│   ├── auth/                       # JWT authentication plugin
│   ├── di-container/               # Awilix DI plugin
│   ├── email/                      # Email service (mock)
│   ├── encryption/                 # Crypto utilities
│   ├── errors/                     # Error classes
│   ├── events/                     # Event bus
│   ├── logging/                    # Pino logger
│   ├── pagination/                 # Pagination system
│   ├── repositories/               # Base repository
│   ├── request-timeout/            # Request timeout plugin
│   ├── session-storage/            # Request-scoped session
│   ├── constants/                  # Shared constants
│   ├── contracts/v1/               # Shared TypeBox contracts
│   └── utils/                      # Utility functions
├── modules/                        # Business modules
│   ├── auth/                       # Authentication module
│   └── users/                      # User management module
└── types/                          # Global type definitions
```

**Layer Separation:**
- **modules/**: Domain logic, business rules
- **libs/**: Reusable utilities, cross-cutting concerns
- **infra/**: Infrastructure concerns (HTTP, database)
- **configs/**: Application configuration
- **types/**: Type definitions

### Dependency Injection

Dependencies are auto-loaded via Awilix patterns:
- `*.repository.ts` → Repository pattern
- `*.queries.ts` → Query operations
- `*.mutations.ts` → Command operations
- `*.service.ts` → Shared services

**Access Pattern:**
```typescript
// In router handlers
const { usersRepository, usersQueries, sessionStorageService } = app.diContainer.cradle;

// In service functions
const findUser = async ({ usersRepository, logger }: Cradle, userId: string) => {
  // Use injected dependencies
};
```

## 📝 Clean Code Principles

### The Boy Scout Rule
**Leave code cleaner than you found it**

### Naming Rules
- ✅ **Variables**: nouns (`user`, `totalCount`, `isActive`)
- ✅ **Functions**: verbs (`getUser`, `calculateTotal`, `validateEmail`)
- ✅ **Classes**: nouns (`UserRepository`, `EmailService`)
- ✅ **Booleans**: questions (`isValid`, `hasAccess`, `canDelete`)
- ❌ **Avoid abbreviations**: `usr` → `user`, `calc` → `calculate`
- ❌ **Avoid noise words**: `UserInfo`, `UserData` → just `User`

### Function Rules
- ✅ **Small**: < 20 lines (ideally < 10)
- ✅ **Do ONE thing** (Single Responsibility Principle)
- ✅ **One level of abstraction** per function
- ✅ **No side effects** (pure when possible)
- ✅ **Max 3 parameters** (use objects for more)
- ❌ **No boolean flags** (split into separate functions)
- ❌ **No output parameters** (return instead)

### SOLID Principles
- **S**ingle Responsibility: One reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many small interfaces > one large
- **D**ependency Inversion: Depend on abstractions

## 🔧 Function Design

### Prefer Pure, Partially-Applied Functions

```typescript
// ✅ Good: Pure function with dependency injection
const findById = async ({ db }: Cradle, id: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  return user;
};

// Export with partial application
export default function usersRepository(deps: Cradle) {
  return {
    findById: partial(findById, [deps]),
  };
}
```

### Avoid Boolean Flags

```typescript
// ❌ Bad: Boolean flags, unclear intent
function processUser(user: User, isActive: boolean, shouldNotify: boolean) {
  // ...
}

// ✅ Good: Explicit separate functions
function activateUser(user: User) { /* ... */ }
function notifyUser(user: User) { /* ... */ }
```

## ⚠️ Error Handling

**Use domain-specific errors:**
```typescript
import { ResourceNotFoundException, ConflictException } from "#libs/errors/domain.errors.ts";

// Explicit, descriptive errors
if (!user) {
  throw new ResourceNotFoundException(`User with id: ${id} not found`);
}

if (existingEmail) {
  throw new ConflictException(`User with email: ${email} already exists`);
}
```

**Available Domain Errors:**
- `BadRequestException` - Invalid input
- `UnauthorizedException` - Authentication required
- `ForbiddenException` - Access denied
- `ResourceNotFoundException` - Resource not found
- `ConflictException` - Conflict (duplicate, etc.)
- `UnprocessableEntityException` - Validation failed

## ✅ Schema Validation

**Use TypeBox for runtime validation:**
```typescript
import { Type } from "@sinclair/typebox";

export const UserCreateContract = Type.Object({
  email: Type.String({ format: "email" }),
  firstName: Type.String({ minLength: 2, maxLength: 100 }),
  lastName: Type.String({ minLength: 2, maxLength: 100 }),
  password: Type.String({ minLength: 8 }),
});

export type UserCreateInput = Static<typeof UserCreateContract>;
```

## 🗄️ Database Operations

**Use Drizzle ORM query builder:**
```typescript
import { eq, and, isNull } from "drizzle-orm";

// Clear, composable queries
const user = await db
  .select(NON_PASSWORD_COLUMNS)
  .from(users)
  .where(and(
    eq(users.id, id),
    isNull(users.deletedAt)
  ));
```

**Use Base Repository:**
```typescript
import { createBaseRepository } from "#libs/repositories/base-repository.ts";

export default function usersRepository(deps: Cradle) {
  const baseRepo = createBaseRepository({
    table: users,
    db: deps.db,
    logger: deps.logger,
    defaultSelectColumns: NON_PASSWORD_COLUMNS,
    softDeleteColumn: "deletedAt",
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    softDeleteOneById: baseRepo.softDeleteOneById,
    // Custom methods...
  };
}
```

## 📂 File Organization

### Path Aliases

Use import aliases for clean paths:
```typescript
// ✅ Good: Clear, absolute imports
import { logger } from "#libs/logging/logger.service.ts";
import { users } from "#modules/users/users.model.ts";
import { APP_CONFIG } from "#configs/index.ts";

// ❌ Bad: Relative path hell
import { logger } from "../../libs/logging/logger.service.ts";
```

### File Naming Conventions

- **Services**: `*.service.ts`
- **Repositories**: `*.repository.ts`
- **Queries**: `*.queries.ts`
- **Mutations**: `*.mutations.ts`
- **Schemas**: `*.schemas.ts`
- **Contracts**: `*.contracts.ts`
- **Models**: `*.model.ts`
- **Plugins**: `*.plugin.ts`
- **Routers**: `*.router.v1.ts` (versioned)
- **Event Handlers**: `*.event-handlers.ts`
- **Events**: `*.events.ts`
- **Type Definitions**: `*.types.d.ts`

## 🧪 Testing Guidelines

### E2E Testing Best Practices

**For E2E tests, use real API endpoints:**
- ✅ Call actual HTTP endpoints (`app.inject()`)
- ✅ Use real database (PostgreSQL in test environment)
- ✅ Test through API, not direct database access
- ❌ Don't mock services (use real implementations)

**Example:**
```typescript
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestingApp, createDbHelper } from "#tests/helpers/index.ts";

describe("GET /v1/users", () => {
  let app, db, teardown;

  before(async () => {
    const payload = await createTestingApp();
    app = payload.app;
    db = createDbHelper(payload.database.drizzle);
    teardown = payload.teardown;
  });

  beforeEach(async () => {
    await db.cleanUp();
  });

  after(async () => {
    await teardown();
  });

  it("[200] should return paginated users list", async () => {
    await db.seed(fixtures.seeds.MULTIPLE_USERS);

    const response = await app.inject({
      method: "GET",
      path: "/v1/users",
      query: { page: "1", limit: "10" },
    });

    assert.strictEqual(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().data));
  });
});
```

## 🔄 Development Workflow

### Database Commands
```bash
pnpm database:generate   # Generate migrations
pnpm database:push       # Push schema changes
pnpm database:migrate    # Run migrations
pnpm database:seed:dev   # Seed development data
pnpm database:studio     # Open Drizzle Studio
```

### Running the App
```bash
pnpm docker:infra:up     # Start PostgreSQL
pnpm start:dev           # Run with pretty logs
pnpm start:dev:watch     # Run with hot reload
```

### Code Quality
```bash
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix ESLint errors
pnpm prettier:fix        # Format code
pnpm check:types         # TypeScript type check
pnpm test                # Run tests
```

### Docker Commands
```bash
pnpm docker:infra:up         # Start PostgreSQL only
pnpm docker:dev:up           # Start full dev environment
pnpm docker:monitoring:up    # Start monitoring stack (Prometheus, Grafana, Loki)
```

## ➕ When Adding New Features

### Feature Development Workflow

1. **Start with the contract** (TypeBox schemas in `*.contracts.ts`)
2. **Define the model** (Drizzle schema in `*.model.ts`)
3. **Build repository layer** (data access in `*.repository.ts`)
4. **Implement queries** (read operations in `*.queries.ts`)
5. **Implement mutations** (write operations in `*.mutations.ts`)
6. **Define domain events** (in `*.events.ts`)
7. **Create event handlers** (in `*.event-handlers.ts`)
8. **Create router** (HTTP interface in `*.router.v1.ts`)
9. **Add validation schemas** (in `*.schemas.ts`)
10. **Write tests** (if critical path)

## 🎨 Code Style

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always use semicolons
- **Line Length**: Max 120 characters
- **ESLint**: `pnpm lint` (auto-fix with `pnpm lint:fix`)
- **Prettier**: `pnpm prettier:fix`

## 🔒 Security

- Never commit secrets (`.env` files are gitignored)
- Use `env-schema` for environment validation
- Rate limiting enabled by default
- Helmet.js for security headers
- JWT for authentication (access + refresh tokens)
- Input validation on all routes
- Password hashing with scrypt
- Soft delete (data preservation)

## 📝 Commit Convention

Follow Conventional Commits:
```
<type>(<scope>): <short summary>

feat(users): add user profile endpoint
fix(auth): resolve JWT expiration bug
refactor(db): simplify query builder logic
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `chore`

## 🗺️ Roadmap: Structure Expansion

### Libs - Future Additions

```
src/libs/
├── cache/                      # Redis caching
├── queue/                      # Background jobs (BullMQ)
├── storage/                    # File storage (S3/Local)
├── websocket/                  # Real-time (Socket.io)
├── notifications/              # Push/SMS notifications
├── audit/                      # Audit logging
├── i18n/                       # Internationalization
├── health/                     # Health checks
└── http-client/                # External API client
```

### Modules - Future Additions

```
src/modules/
├── roles/                      # RBAC system
├── organizations/              # Multi-tenancy
├── files/                      # File management
├── notifications/              # User notifications
├── settings/                   # User/App settings
├── activity-log/               # Activity tracking
└── webhooks/                   # Webhook management
```

## 💡 Remember

- **Simplicity wins**: If you can delete code, delete it
- **Readability matters**: Code is read 10x more than written
- **Types are documentation**: TypeScript types are not optional
- **Test what matters**: Don't chase 100% coverage
- **Performance later**: Correct first, fast second
- **No premature abstraction**: Three strikes rule before abstracting
- **Low cognitive load**: Reader should understand code in < 30 seconds
- **Layer boundaries**: Respect the architecture layers
- **E2E first**: Test through API, not direct database access

---

**When in doubt, ask:**
1. Is this the simplest solution?
2. Can someone else understand this in 6 months?
3. Am I solving a real problem or a hypothetical one?
4. Would Matteo approve of this code?
5. Am I respecting layer boundaries?
6. Should this be an event instead of direct call?
7. Can I test this through the API?
