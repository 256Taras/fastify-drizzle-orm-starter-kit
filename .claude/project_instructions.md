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
5. **JSDoc for Types Only**: Types reduce cognitive load, descriptions add noise
6. **Comments Explain Why, Not What**: Code should be self-documenting
7. **Multi-Paradigm but Pragmatic**: Use the right tool for the job
8. **Reduce Cognitive Complexity**: Extract complex logic into helper functions. Prefer early returns over nested conditionals. Break large methods into smaller, focused functions. Use functional helpers for common patterns (retry, timeout, abort handling). Remove unnecessary options/parameters - if a value never changes, hardcode it. Use proper TypeScript types instead of `@ts-expect-error` or `@ts-ignore` workarounds.

### Anti-Patterns to Avoid
- ❌ Clever tricks or "smart" code
- ❌ Unnecessary abstractions
- ❌ Over-engineering for hypothetical futures
- ❌ Boolean flags that obscure intent
- ❌ Deep nesting or complex conditionals
- ❌ Hidden state or implicit dependencies
- ❌ Verbose JSDoc descriptions (types only!)

## 🏗️ Project Architecture

### Technology Stack
- **Runtime**: Node.js v24+ (ESM modules, native features)
- **Framework**: Fastify v5 (fast, low-overhead HTTP server)
- **Database**: PostgreSQL v15 + Drizzle ORM v0.45
- **Validation**: TypeBox + Fastify Type Provider
- **DI Container**: Awilix (file-system level dependency injection)
- **Type Safety**: JSDoc + TypeScript compiler for type checking
- **Logging**: Pino (structured, high-performance logging)
- **Testing**: Node.js native test runner + c8 coverage
- **Email**: Nodemailer (SMTP transport)
- **Event Bus**: Node.js EventEmitter (in-memory, synchronous)

### Architecture Overview

**Architecture Type**: N-Layer Architecture with CQRS-like separation
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

#### 1. CQRS-like Separation (Command Query Responsibility Segregation)

The project separates read and write operations:
- **Queries** (`*.queries.js`) - Read operations, no side effects
- **Mutations** (`*.mutations.js`) - Write operations, side effects, event emission

**Guidelines:**
- Queries should be pure (no mutations, no events)
- Mutations handle business logic and emit domain events
- Keep queries and mutations in separate files

#### 2. Domain Events Pattern

Domain events enable loose coupling between modules:
- **Event Definition** (`*.events.js`) - Event constants
- **Event Emission** (in mutations) - `eventBus.emit(EVENT_NAME, payload)`
- **Event Handlers** (`*.event-handlers.js`) - Event subscribers

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
- **Repository** (`*.repository.js`) - Data access methods
- **Model** (`*.model.js`) - Drizzle schema definitions
- **Repository methods**: `findById`, `findByEmail`, `create`, `update`, `softDelete`

**Guidelines:**
- Repository methods return domain entities (not Drizzle types)
- Use `NON_PASSWORD_COLUMNS` for security (never return passwords)
- Always filter soft-deleted records (`isNull(deletedAt)`)

#### 4. Dependency Injection (DI)

Awilix provides file-system level DI:
- **Auto-loading**: Based on file naming conventions
- **Registration**: Via `di-container.plugin.js`
- **Access**: Through `app.diContainer.cradle`

**Naming Conventions:**
- `*.repository.js` → Repository pattern
- `*.queries.js` → Query operations
- `*.mutations.js` → Command operations
- `*.service.js` → Shared services

**Access Pattern:**
```javascript
// In router or service
const { usersRepository, usersQueries, eventBus } = app.diContainer.cradle;
```

### Module Structure

Each feature module follows this consistent pattern:

```
modules/
└── users/
    ├── users.model.js           # Drizzle schema definitions
    ├── users.contracts.js       # TypeBox contracts (types)
    ├── users.schemas.js         # Fastify route schemas
    ├── users.router.v1.js       # HTTP route handlers
    ├── users.queries.js         # Read operations (CQRS Query)
    ├── users.mutations.js       # Write operations (CQRS Command)
    ├── users.repository.js      # Data access layer
    ├── users.events.js          # Domain events constants
    ├── users.event-handlers.js  # Event subscribers
    └── users.pagination.config.js  # Pagination config (if needed)
```

**File Responsibilities:**
- **model.js**: Database schema (Drizzle tables, columns, relations)
- **contracts.js**: TypeBox type definitions (shared types)
- **schemas.js**: Fastify route validation schemas (input/output)
- **router.v1.js**: HTTP endpoints, route registration
- **queries.js**: Read operations (find, list, search)
- **mutations.js**: Write operations (create, update, delete)
- **repository.js**: Low-level database operations
- **events.js**: Domain event constants
- **event-handlers.js**: Event subscription and handling

### Project Structure

```
src/
├── modules/          # Business logic (domain modules)
│   ├── auth/         # Authentication module
│   ├── users/        # User management module
│   └── health-check/ # Health check module
├── libs/             # Shared utilities and services
│   ├── auth/         # Authentication utilities
│   ├── email/        # Email service
│   ├── encryption/   # Encryption service
│   ├── events/       # Event bus service
│   ├── pagination/   # Pagination utilities
│   └── ...
├── infra/            # Infrastructure layer
│   ├── api/http/     # HTTP server setup
│   └── database/     # Database connection
├── configs/          # Configuration files
├── @types/           # Type definitions (JSDoc)
└── index.js          # Application entry point
```

**Layer Separation:**
- **modules/**: Domain logic, business rules
- **libs/**: Reusable utilities, cross-cutting concerns
- **infra/**: Infrastructure concerns (HTTP, database)
- **configs/**: Application configuration
- **@types/**: Type definitions for IDE support

### Dependency Injection

Dependencies are auto-loaded via Awilix patterns:
- `*.repository.js` → Repository pattern
- `*.queries.js` → Query operations
- `*.mutations.js` → Command operations
- `*.service.js` → Shared services

**Access Pattern:**
```javascript
// In router handlers
const { usersRepository, usersQueries, sessionStorageService } = app.diContainer.cradle;

// In service functions
const findUser = async ({ usersRepository, logger }, userId) => {
  // Use injected dependencies
};
```

**DI Container Registration:**
- Core dependencies registered in `di-container.plugin.js`
- Module dependencies auto-loaded via file patterns
- All dependencies available in `app.diContainer.cradle`

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

### Comment Rules
- ✅ **Explain WHY, not WHAT**
- ✅ **Document non-obvious decisions**
- ✅ **Warn about consequences**
- ❌ **Don't comment bad code** - rewrite it
- ❌ **Don't leave commented-out code**

### DRY (Don't Repeat Yourself)
- Extract duplicated logic into functions
- Use composition over copy-paste
- **Three strikes rule**: abstract after third duplication

### Low Coupling / High Cohesion
- ✅ **Modules should know little about each other**
- ✅ **Depend on abstractions (interfaces), not concrete implementations**
- ✅ **Group related functionality together**
- ✅ **Minimize inter-module dependencies**
- ❌ **Avoid circular dependencies**
- ❌ **Don't reach across layers**

### SOLID Principles
- **S**ingle Responsibility: One reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many small interfaces > one large
- **D**ependency Inversion: Depend on abstractions

## 📘 JSDoc Guidelines

### RULE: Types Only, No Descriptions

**IMPORTANT: JSDoc is for TYPES ONLY**
- ✅ Type annotations
- ✅ Parameter types
- ✅ Return types
- ❌ NO descriptive text (code should be self-documenting)
- ❌ NO "what it does" explanations
- ❌ NO parameter descriptions
- ❌ NO examples in JSDoc (put in tests)

### Good (types only)
```javascript
/**
 * @param {Dependencies} deps
 * @param {UserInsert} data
 * @returns {Promise<User>}
 */
const createUser = async ({ db }, data) => {
  // Function name and code explain what it does
  const [newUser] = await db
    .insert(users)
    .values(data)
    .returning(NON_PASSWORD_COLUMNS);

  return newUser;
};
```

### Bad (verbose descriptions)
```javascript
/**
 * Creates a new user account in the database
 *
 * This function takes user data and inserts it into the users table.
 * It returns the newly created user object without the password field.
 *
 * @param {Dependencies} deps - Injected dependencies
 * @param {UserInsert} data - User creation payload
 * @returns {Promise<User>} Created user object
 */
const createUser = async ({ db }, data) => {
  // ... (same code, unnecessary JSDoc noise)
};
```

### Exception: Complex Business Logic

Only add explanatory comments for:
- Non-obvious **WHY** decisions
- Performance trade-offs
- Security considerations
- Bug workarounds

```javascript
/**
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const validateToken = async (token) => {
  // Using constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
};
```

## 🔧 Function Design

### Prefer Pure, Partially-Applied Functions

```javascript
// ✅ Good: Pure function with dependency injection
const findById = async ({ db }, id) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  return user;
};

// Export with partial application
export default function usersRepository(deps) {
  return {
    findById: partial(findById, [deps]),
  };
}
```

### Avoid Boolean Flags

```javascript
// ❌ Bad: Boolean flags, unclear intent
function processUser(user, isActive, shouldNotify, isAdmin) {
  // ...
}

// ✅ Good: Explicit separate functions
function activateUser(user) { /* ... */ }
function notifyUser(user) { /* ... */ }
```

## ⚠️ Error Handling

**Use domain-specific errors:**
```javascript
import { NotFoundError, ConflictError } from "#libs/errors/domain.errors.js";

// Explicit, descriptive errors
if (!user) {
  throw new NotFoundError("USER_NOT_FOUND", { userId: id });
}

if (existingEmail) {
  throw new ConflictError("EMAIL_ALREADY_EXISTS", { email });
}
```

## ✅ Schema Validation

**Use TypeBox for runtime validation:**
```javascript
import { Type } from "@sinclair/typebox";

export const UserCreateSchema = Type.Object({
  email: Type.String({ format: "email" }),
  name: Type.String({ minLength: 2, maxLength: 100 }),
  age: Type.Integer({ minimum: 18 }),
});
```

## 🗄️ Database Operations

**Use Drizzle ORM query builder:**
```javascript
import { eq, and, isNull } from "drizzle-orm";

// Clear, composable queries
const user = await db
  .select()
  .from(users)
  .where(and(
    eq(users.id, id),
    isNull(users.deletedAt)
  ))
  .limit(1);
```

## 📂 File Organization

### Path Aliases

Use import aliases for clean paths:
```javascript
// ✅ Good: Clear, absolute imports
import { logger } from "#libs/logging/logger.service.js";
import { users } from "#modules/users/users.model.js";
import { CONFIG } from "#configs/index.js";

// ❌ Bad: Relative path hell
import { logger } from "../../libs/logging/logger.service.js";
```

### File Naming Conventions

- **Services**: `*.service.js`
- **Repositories**: `*.repository.js`
- **Queries**: `*.queries.js`
- **Mutations**: `*.mutations.js`
- **Schemas**: `*.schemas.js`
- **Contracts**: `*.contracts.js`
- **Models**: `*.model.js`
- **Plugins**: `*.plugin.js`
- **Routers**: `*.router.v1.js` (versioned)

## 🧪 Testing Guidelines

### Test Organization

- Use Node.js native test runner (`node:test`)
- Organize tests by type: `tests/e2e/`, `tests/integration/`, `tests/unit/`
- Mirror source structure: `tests/e2e/auth/v1/sign-in/sign-in.test.js`
- Test public interfaces, not internal implementation
- Use test fixtures for database setup
- Aim for high coverage but focus on critical paths
- **DRY in tests**: Extract common patterns into test helpers

### E2E Testing Best Practices

**For E2E tests, use real API endpoints:**
- ✅ Call actual HTTP endpoints (`app.inject()`)
- ✅ Use real email service (Mailhog in test environment)
- ✅ Test through API, not direct database access
- ❌ Don't use `db.drizzle.execute` directly
- ❌ Don't mock services (use real implementations)

**Example:**
```javascript
// ✅ Good: E2E test through API
const response = await app.inject({
  method: "POST",
  path: "/v1/auth/forgot-password",
  payload: { email: "test@example.com" },
});

// Get token from email (via Mailhog helper)
const token = await requestPasswordResetAndGetToken(app, email);

// ❌ Bad: Direct database access in E2E test
const token = await db.drizzle.execute(
  sql`SELECT token FROM password_reset_tokens WHERE email = ${email}`
);
```

### Unit Testing (Future)

**For unit tests, mock dependencies:**
- Test individual functions in isolation
- Mock dependencies via DI container
- Test business logic, not infrastructure
- Use test doubles for external services

**Example:**
```javascript
// Unit test for mutation
const mockRepository = { create: async () => ({ id: "123" }) };
const mockEventBus = { emit: async () => {} };

const result = await createUser(
  { usersRepository: mockRepository, eventBus: mockEventBus },
  { email: "test@example.com", password: "pass123" }
);
```

### Test Helpers

**Available helpers:**
- `createTestingApp()` - Create test Fastify instance
- `createDbHelper()` - Database utilities for tests
- `requestPasswordResetAndGetToken()` - Auth test helpers
- `waitForEmail()` - Email testing (Mailhog)
- `clearAllEmails()` - Clean email state

## 🔄 Development Workflow

### Database
```bash
pnpm database:generate   # Generate migrations
pnpm database:push       # Push schema changes
pnpm database:migrate    # Run migrations
pnpm database:seed:dev   # Seed development data
```

### Running
```bash
pnpm docker:infra:up     # Start PostgreSQL
pnpm start:dev           # Run with pretty logs
pnpm start:dev:watch     # Run with hot reload
```

## ➕ When Adding New Features

### Feature Development Workflow

1. **Start with the contract** (TypeBox schemas in `*.contracts.js`)
   - Define input/output types
   - Use TypeBox for runtime validation

2. **Define the model** (Drizzle schema in `*.model.js`)
   - Create table schema
   - Define columns, indexes, relations

3. **Build repository layer** (data access in `*.repository.js`)
   - Implement CRUD operations
   - Use `NON_PASSWORD_COLUMNS` for security
   - Always filter soft-deleted records

4. **Implement queries** (read operations in `*.queries.js`)
   - Pure functions (no side effects)
   - Use repository for data access
   - Throw domain errors (ResourceNotFoundException)

5. **Implement mutations** (write operations in `*.mutations.js`)
   - Business logic orchestration
   - Use repository for data access
   - Emit domain events after success
   - Throw domain errors (ConflictException, etc.)

6. **Define domain events** (in `*.events.js`)
   - Event constants
   - Event payload types

7. **Create event handlers** (in `*.event-handlers.js`)
   - Subscribe to events
   - Handle side effects (email, notifications)

8. **Create router** (HTTP interface in `*.router.v1.js`)
   - Define routes
   - Use queries/mutations
   - Apply authentication/authorization

9. **Add validation schemas** (in `*.schemas.js`)
   - Fastify route schemas
   - Input/output validation

10. **Write tests** (if critical path)
    - E2E tests for user flows
    - Unit tests for complex business logic

### Example: Adding a New Feature

```javascript
// 1. contracts.js
export const CreateProductContract = Type.Object({
  name: Type.String({ minLength: 1 }),
  price: Type.Number({ minimum: 0 }),
});

// 2. model.js
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. repository.js
const create = async ({ db }, data) => {
  const [product] = await db.insert(products).values(data).returning();
  return product;
};

// 4. mutations.js
const createProduct = async ({ productsRepository, eventBus, logger }, input) => {
  const product = await productsRepository.create(input);
  await eventBus.emit(PRODUCT_EVENTS.CREATED, { productId: product.id });
  return product;
};

// 5. router.js
app.post("/products", {
  schema: productSchemas.create,
  handler(req) {
    return productsMutations.createProduct(req.body);
  },
});
```

## 🎨 Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line Length**: Max 120 characters
- **ESLint**: `pnpm lint` (auto-fix with `pnpm lint:fix`)
- **Prettier**: `pnpm prettier:fix`

## 🔒 Security

- Never commit secrets (`.env` files are gitignored)
- Use `env-schema` for environment validation
- Rate limiting enabled by default
- Helmet.js for security headers
- JWT for authentication
- Input validation on all routes

## 📝 Commit Convention

Follow Conventional Commits:
```
<type>(<scope>): <short summary>

feat(users): add user profile endpoint
fix(auth): resolve JWT expiration bug
refactor(db): simplify query builder logic
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `build`

## 🎯 Architecture Decisions & Trade-offs

### Current Architecture Strengths

1. **Clear Layer Separation**
   - Easy to understand and navigate
   - Each layer has single responsibility
   - Easy to test in isolation

2. **CQRS-like Separation**
   - Read/write operations separated
   - Better scalability potential
   - Clearer intent

3. **Domain Events**
   - Loose coupling between modules
   - Easy to add new event handlers
   - Enables event-driven architecture

4. **Dependency Injection**
   - Easy to test (mock dependencies)
   - Low coupling
   - Auto-discovery via conventions

### Known Limitations & Future Improvements

1. **Type Strategy**
   - Current: Hybrid JSDoc + TypeScript
   - Recommendation: Choose one approach (full TypeScript or full JSDoc)
   - Action: Gradually migrate to chosen approach

2. **Event Bus**
   - Current: In-memory EventEmitter (synchronous)
   - Limitation: No retry, no dead letter queue
   - Future: Consider message broker (RabbitMQ, Kafka) for critical events

3. **Database Migrations**
   - Current: `drizzle-kit push` (direct schema push)
   - Limitation: No versioning, no rollback
   - Future: Implement proper migrations with versioning

4. **Testing Coverage**
   - Current: E2E tests only
   - Limitation: Hard to test individual functions
   - Future: Add unit tests for complex business logic

5. **Domain Layer**
   - Current: Business logic in queries/mutations
   - Future: Extract domain entities and value objects
   - Future: Add domain services for complex business rules

### Architecture Principles

**When making architectural decisions:**
1. **Start simple**: Add complexity only when needed
2. **Layer boundaries**: Don't skip layers (router → queries → repository → DB)
3. **Event-driven**: Use events for cross-module communication
4. **Testability**: Design for easy testing
5. **Type safety**: Use types for documentation and safety

## 💡 Remember

- **Simplicity wins**: If you can delete code, delete it
- **Readability matters**: Code is read 10x more than written
- **Types are documentation**: JSDoc is not optional (but keep it minimal!)
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
5. Does my JSDoc have unnecessary descriptions? (Remove them!)
6. Am I respecting layer boundaries?
7. Should this be an event instead of direct call?
8. Can I test this through the API?

---

## 📚 Additional Resources

- [Architecture Analysis](docs/ARCHITECTURE_ANALYSIS.md) - Detailed architecture analysis
- [Project Structure](docs/project-structure.md) - Project structure documentation
- [Error Handling](docs/error-handling.md) - Error handling patterns
- [FAQ](docs/faq.md) - Frequently asked questions
