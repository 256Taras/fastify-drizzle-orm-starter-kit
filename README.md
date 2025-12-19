# ⬢ Node.js Starter Kit

**Production-grade Fastify starter kit with native TypeScript support.**

Stop configuring. Start shipping.

---

## 🚀 What Makes This Different

### ⚡ Zero Build Step

Node.js 25+ executes TypeScript natively. No transpilers. No bundlers. No waiting.

```bash
node src/index.ts
```

Your code runs exactly as written. TypeScript serves one purpose: types. Nothing more.

### 🏗️ Battle-Tested Architecture

Built on patterns proven at scale:

- **CQS (Command Query Separation)** - queries read, mutations write. Never mixed.
- **Domain Events** - loose coupling between modules via EventEmitter
- **Repository Pattern** - clean data access abstraction
- **N-Layer Architecture** - Router → Queries/Mutations → Repository → Database

```
Router Layer        →  HTTP, validation, auth guards
Queries/Mutations   →  Business logic, events
Repository Layer    →  Data access, Drizzle ORM
Database Layer      →  PostgreSQL
```

### 📂 File-System Based Auto-Loading

Drop a file. It works.

| Pattern | Auto-loaded as |
|---------|----------------|
| `*.repository.ts` | Repository |
| `*.queries.ts` | Query operations |
| `*.mutations.ts` | Command operations |
| `*.service.ts` | Shared service |
| `*.plugin.ts` | Fastify plugin |
| `*.router.v1.ts` | HTTP routes |
| `*.event-handlers.ts` | Event subscribers |

No manual registration. No import chains. Awilix discovers and wires everything.

### 📝 Contract-First Development

TypeBox contracts define your API. Types flow from contract to database:

```typescript
// One source of truth
export const UserCreateContract = Type.Object({
  email: Type.String({ format: "email" }),
  firstName: Type.String({ minLength: 2 }),
  password: Type.String({ minLength: 8 }),
});

// Compile-time + runtime validation
// Swagger docs generated automatically
// TypeScript types inferred
```

### 📊 Observability Built-In

Know what's happening in production:

- **Pino** - structured JSON logging with request tracing
- **Prometheus** - metrics out of the box
- **Grafana** - dashboards ready to use
- **Loki** - log aggregation
- **Health checks** - `/api/health-check`

```bash
pnpm docker:monitoring:up  # Prometheus + Grafana + Loki
```

### 🛠️ Developer Experience

Every detail optimized for productivity:

- **Code generators** - scaffold modules in seconds
- **IDE snippets** - ready-made snippets for your editor
- **Claude Code** - AI assistant pre-configured
- **Hot reload** - `pnpm start:dev:watch`
- **Drizzle Studio** - visual database browser

---

## 🧰 The Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 25+, native TypeScript, ESM |
| Framework | Fastify 5 (fastest Node.js framework) |
| Database | PostgreSQL 15 + Drizzle ORM |
| Validation | TypeBox (compile-time + runtime) |
| DI | Awilix (file-system auto-discovery) |
| Auth | JWT (access + refresh tokens) |
| Security | Helmet, rate limiting, CORS |
| Logging | Pino (structured, high-performance) |
| Metrics | Prometheus + Grafana |
| Testing | Node.js native test runner |
| Quality | ESLint, Prettier, Husky |

---

## 📦 Module Structure

Every feature follows a consistent pattern:

```
modules/users/
├── users.model.ts           # Drizzle schema
├── users.contracts.ts       # TypeBox types
├── users.schemas.ts         # Route validation
├── users.router.v1.ts       # HTTP endpoints
├── users.queries.ts         # Read operations
├── users.mutations.ts       # Write operations
├── users.repository.ts      # Data access
├── users.events.ts          # Domain events
└── users.event-handlers.ts  # Event subscribers
```

Clear separation. Predictable structure. Easy to navigate.

---

## ⚡ Quick Start

```bash
# Enable corepack
corepack enable

# Install
pnpm install

# Environment
cp .environment.example .environment

# Database
pnpm docker:infra:up
pnpm database:push

# Run
pnpm start:dev
```

API: http://localhost:8000
Swagger: http://localhost:8000/docs
Metrics: http://localhost:8000/metrics

---

## 🤔 Why Not NestJS?

NestJS is powerful. But also:

| NestJS | This Starter |
|--------|--------------|
| Decorators everywhere | Plain functions |
| Angular-style DI | File-system auto-loading |
| Metadata reflection | Zero runtime overhead |
| Complex module system | Drop file, it works |
| Learning curve | Read and understand |

Same capabilities. Less ceremony.

---

## 🎯 Engineering Principles

Following clean code best practices:

- **KISS** - simple things stay simple
- **SOLID** - proven OOP principles
- **Clean Code** - readable, maintainable
- **Essential Complexity Only** - no over-engineering
- **Low Cognitive Load** - understand in 30 seconds

> *"Code is written once, read hundreds of times."*

---

## ✅ What's Included

### Infrastructure
- [x] Fastify 5 with TypeBox validation
- [x] PostgreSQL + Drizzle ORM
- [x] JWT authentication (access + refresh)
- [x] Rate limiting per route
- [x] Graceful shutdown with AbortController
- [x] Request timeouts
- [x] CORS, Helmet security

### Developer Experience
- [x] Native TypeScript (no build step)
- [x] Auto-loading (plugins, routes, DI)
- [x] Code generators
- [x] IDE snippets
- [x] Claude Code configured
- [x] Hot reload

### Observability
- [x] Pino structured logging
- [x] Request tracing (trace ID)
- [x] Prometheus metrics
- [x] Grafana dashboards
- [x] Health check endpoint

### Architecture
- [x] CQS pattern (queries/mutations)
- [x] Domain events
- [x] Repository pattern
- [x] Unit of Work (transactions)
- [x] Soft delete
- [x] Pagination (cursor + offset)

### Quality
- [x] ESLint + Prettier
- [x] Husky + lint-staged
- [x] Node.js native tests
- [x] Type checking

---

## 📋 Commands

```bash
# Development
pnpm start:dev           # Run with pretty logs
pnpm start:dev:watch     # Hot reload

# Database
pnpm database:push       # Push schema
pnpm database:generate   # Generate migrations
pnpm database:studio     # Visual browser

# Quality
pnpm check:types         # TypeScript
pnpm lint                # ESLint
pnpm test                # Tests

# Docker
pnpm docker:infra:up     # PostgreSQL
pnpm docker:monitoring:up # Full observability stack
```

---

## 📄 License

MIT

---

**Built for developers who value simplicity, performance, and clean code.**
