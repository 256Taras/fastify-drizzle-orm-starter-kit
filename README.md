# ⬢ Node.js Starter Kit

**Production-grade Fastify starter kit. Native TypeScript. Zero build step.**

Start simple. Scale when needed.

---

## 💡 Philosophy

> *"Simple things should be simple, complex things should be possible."* — Alan Kay

This starter embraces **essential complexity only**. We don't know what your project will become — a simple CRUD API or a complex domain-driven system. So we give you a solid foundation that:

- **Starts simple** — N-layer architecture that anyone can understand in 5 minutes
- **Scales gracefully** — patterns that naturally evolve into DDD, Clean Architecture, or Hexagonal when you need them
- **Avoids lock-in** — plain functions over frameworks, conventions over configuration

The architecture is intentionally minimal. Add complexity when requirements demand it, not before.

---

## ⚡ What Makes This Different

### Native TypeScript (Type Stripping)

Node.js 25+ runs `.ts` files directly. Types are stripped at runtime — zero transpilation overhead.

```bash
node src/index.ts  # Just works
```

### Node.js Native First

We use what Node.js provides. Less dependencies = less vulnerabilities.

| Instead of | We use |
|------------|--------|
| tsc, ts-node, tsx | Node.js type stripping |
| Jest, Mocha, Vitest | `node:test` |
| nodemon | `node --watch` |
| dotenv | `--env-file` |
| bcrypt | `node:crypto` (scrypt) |
| cls-hooked | `AsyncLocalStorage` |
| EventEmitter2 | `EventEmitter` |
| tsconfig-paths | Subpath imports (`#libs/*`) |

### File-System Based Everything

Your folder structure IS your API and DI structure:

```text
modules/users/users.router.v1.ts  →  /api/v1/users/*
modules/auth/auth.router.v1.ts    →  /api/v1/auth/*
```

Drop a file with the right suffix — it auto-registers:

| `*.repository.ts` | `*.queries.ts` | `*.mutations.ts` | `*.router.v1.ts` | `*.service.ts` |

### Multi-Paradigm

- **Procedural + FP** — business logic as functions with explicit data flow
- **OOP where it fits** — infrastructure (App, Server, Database) as classes
- **No dogma** — use what makes sense

---

## 🏗️ Architecture

```text
Router Layer        →  HTTP, validation, auth
Queries/Mutations   →  Business logic, events
Repository Layer    →  Data access (Drizzle)
Database Layer      →  PostgreSQL
```

**Current patterns:**
- CQS (Command Query Separation)
- Repository Pattern
- Domain Events (EventEmitter)
- Unit of Work (transactions)

**When you outgrow this**, the structure supports evolution to:
- DDD (add domain layer, aggregates, value objects)
- Clean Architecture (add use cases, entities)
- Hexagonal/Ports & Adapters (add ports, adapters)

The foundation is the same. Complexity is added incrementally.

---

## ✅ Features

**Infrastructure**
- Fastify 5 with TypeBox validation
- PostgreSQL + Drizzle ORM
- JWT authentication (access + refresh tokens)
- Rate limiting (global + per route)
- Graceful shutdown (`AbortController`)
- Request timeouts
- CORS, Helmet security
- Environment validation (TypeBox schema)

**Architecture**
- CQS (queries/mutations separation)
- Domain events (native `EventEmitter`)
- Repository pattern
- Unit of Work (transactions)
- Request-scoped context (`AsyncLocalStorage`)
- Soft delete, Pagination (cursor + offset)

**Quality**
- Strong ESLint config (security, unicorn, perfectionist)
- Prettier, Husky, lint-staged
- Node.js native test runner
- Type checking

**Observability**
- Pino structured logging + trace ID
- Prometheus metrics
- Grafana dashboards
- Health check endpoint

---

## 🧰 Stack

| | |
|-|-|
| **Runtime** | Node.js 25+, native TypeScript, ESM |
| **Framework** | Fastify 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | TypeBox |
| **DI** | Awilix |
| **Auth** | JWT (access + refresh) |
| **Logging** | Pino |
| **Metrics** | Prometheus + Grafana |
| **Package Manager** | pnpm |

---

## 📦 Module Structure

```text
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

---

## ⚡ Quick Start

```bash
corepack enable
pnpm install
cp .environment.example .environment
pnpm docker:infra:up
pnpm database:push
pnpm start:dev
```

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Metrics: `http://localhost:8000/metrics`

---

## 📋 Commands

```bash
# Development
pnpm start:dev           # Run with pretty logs
pnpm start:dev:watch     # Hot reload

# Database
pnpm database:push       # Push schema
pnpm database:studio     # Visual browser

# Quality
pnpm check:types         # TypeScript
pnpm lint                # ESLint
pnpm test                # Tests

# Docker
pnpm docker:infra:up     # PostgreSQL
pnpm docker:monitoring:up # Observability stack
```

---

## 🛠️ Developer Experience

- **Code generators** — `pnpm generate:module`
- **IDE snippets** — VS Code snippets included
- **Hot reload** — `node --watch`
- **Drizzle Studio** — visual database browser
- **Claude Code** — AI assistant configured

---

## 📄 License

MIT

---

**Start simple. Add complexity when you need it. Not before.**
