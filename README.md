# ⬢ Node.js Application Development Starter Kit ⬢

The Starter Kit offers tools and features tailored for efficient application development using Node.js. It aims to streamline the process, especially for MVPs and scalable applications.

## 🗝️ Key Features & Benefits:

- **Modular Structure**: Organized pattern for application development.
- **Latest Node.js Capabilities**: Utilize contemporary Node.js features without relying on Babel or TypeScript.
- **Fastify Integration**: Fast and efficient HTTP servers with asynchronous support.
- **Drizzle-orm Integration**: Simplified database connectivity and operations.
- **Architectural Flexibility**: Suitable for MVPs, with easy adaptability for future architectural shifts.
- **Alternative to Nest.js**: Offers core functionalities without additional complexities.
- **Optimized Infrastructure**: Prioritizes efficiency and performance.
- **Clear Code Base**: Organized structure for easier navigation and modification.
- **Adaptable Components**: Components designed for customization based on project requirements.

## 📚 Prerequisites

We assume that everyone who comes here is **`programmer with intermediate knowledge`** and we also need to understand more before we begin in order to reduce the knowledge gap.

1. Understand [Fastify Fundamental](https://www.fastify.io/docs/latest/), Main Framework. Fast and low overhead web framework, for Node.js
2. Understand [Express Fundamental](https://expressjs.com/en/starter/installing.html), NodeJs Base Framework. Since the project is based on fastify, which is trying to solve problems specifically express
3. Understand The YAGNI Principle and KISS Principle for better write the code.
4. Optional. Understand[Typescript Fundamental](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html), Programming Language. It will help to write us contacts of types
5. Optional. Understanding [The Twelve Factor Apps](https://12factor.net/). It can help to serve the project.
6. Optional. Understanding [Docker](https://docs.docker.com/get-started/). It can help to run the project.

## ⚠️ Requirements

| Name           | Version  |
|----------------|----------|
| Node           | v24.x.x  |
| Typescript     | v5.4.x   |
| PostgreSQL     | v15.0.x  |
| Yarn           | v1.22.x  |
| NPM            | v10.x.x  |
| Docker         | v18.10.x |
| Docker Compose | v1.23.x  |


## 📌 Getting Started

Before start, we need to install some packages and tools.
The recommended version is the LTS version for every tool and package.

> Make sure to check that the tools have been installed successfully.

- [NodeJs](https://nodejs.org/en)
- [Docker](https://docs.docker.com/get-docker/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### Clone Repo

1. Clone the project with git.

  ```bash
git clone https://github.com/256Taras/fastify-drizzle-orm-starter-kit
  ```

### Install Dependencies
*Optional*: Use `nvm use` command which automatically will setup `node` of specified version in `.nvmrc` file.

2. This project needs some dependencies. Let's go install it.

  ```bash
pnpm install
  ```


### Create environment

3. Create `.environment` file in `configs` folder. Use `.environment.example` as example.
`.environment.example` has already fully functional settings, so server can be started with it without changes

  ```bash
cp .environment.example .environment
  ```


### Database Migration

4. Run migrations

  ```bash
pnpm typeorm:migration:run
  ```

## 🏃 Run Project

1. Run infrastructure in docker (db, etc.):

 ```bash
   pnpm docker:infra:up
 ```

2. Run server on local machine without docker:

 ```bash
   pnpm start
 ```

Finally, Cheers 🍻🍻 !!! you passed all steps.

## API Reference

You can check The ApiSpec after running this project. [here](http://localhost:8000/docs/static/index.html)


## 🧪 Testing

1. Run infrastructure in docker (db, etc.):

  ```bash
pnpm docker:infra:up
  ```


## 🤌 Development culture

- split by modules (scalability & better dev experience)
- store as much as can boilerplate code in shared
- has additional layers for easy cognitive perception:
  - handlers
  - services
  - scopes (extracted from infra)

## 🔐 Git & Commit culture

Prefer to use [Git Flow process](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

**Commit culture is based on [this article](https://chris.beams.io/posts/git-commit), here are seven simple rules:**

1. [Separate subject from body with a blank line](https://chris.beams.io/posts/git-commit/#separate)
2. [Limit the subject line to 50 characters](https://chris.beams.io/posts/git-commit/#limit-50)
3. [Capitalize the subject line](https://chris.beams.io/posts/git-commit/#capitalize)
4. [Do not end the subject line with a period](https://chris.beams.io/posts/git-commit/#end)
5. [Use the imperative mood in the subject line](https://chris.beams.io/posts/git-commit/#imperative)
6. [Wrap the body at 72 characters](https://chris.beams.io/posts/git-commit/#wrap-72)
7. [Use the body to explain what and why vs. how](https://chris.beams.io/posts/git-commit/#why-not-how)


Commit Convention is described in [this article](https://www.conventionalcommits.org/en/v1.0.0-beta.4/), here are seven simple rules:

1. Each commit message consists of a header, a body, and a footer.

```
   <header>
   <BLANK LINE>
   <body>
   <BLANK LINE>
   <footer>
```

- The header is mandatory and must conform to the Commit Message Header format.
- The body is mandatory for all commits except for those of type "docs".
  When the body is present it must be at least 20 characters long and must conform to the Commit Message Body format.
- The footer is optional. The Commit Message Footer format describes what the footer is used for and the structure it must have.

2. Commit Message Header

## Format of the commit message

```
<type>(<scope>): <short summary>
│       │             │
│       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
│       │
│       └─⫸ Commit Scope: common|core|account-crud|migrations
│
└─⫸ Commit Type: build|docs|feat|fix|refactor|test
```

The <type> and <summary> fields are mandatory, the (<scope>) field is optional.

3. Type

   Must be one of the following:

- build: Changes that affect the build system or external dependencies (example scopes: npm, infra)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- refactor: A code change that neither fixes a bug nor adds a feature
- test: Adding missing tests or correcting existing tests

4. Scope

   Usually the scope should be the name of task.

- none/empty string: useful for test and refactor changes that are done across all packages (e.g. `test: add missing unit tests`) and for docs changes that are not related to a specific package (e.g. `docs: fix typo in tutorial`).

5. Summary

   Use the summary field to provide a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

6. Commit Message Body

   Use the body to explain what and why vs. how

7. Commit Message Footer

   The footer can contain information about breaking changes and deprecations and is also the place to reference GitHub issues, Jira tickets, and other PRs that this commit closes or is related to.


## 💡 Features

- [x] production ready
- [x] automatic loading of modules and plugins
- [x] validate environment:
- [x] main script: initialize infra for proper server start, start server, add server stop handlers
- [x] graceful shutdown
- [x] configs: separate folder, split by files, setup using process environment
- [x] fastify application server
- [x] auto documentation: fastify-swagger. \*Require fastify input & output schemas
- [x] routers with input/output validation
- [x] separate router handler
- [x] logger powered by 'pino'
  - [x] console interface
  - [x] log levels
  - [x] trace ID
- [x] loggerService service implementation with LOG_LEVELs: wrapped pino into console.log interface
- [x] containerize in docker server and all 3rd parties if possible:
  - [x] server
  - [x] db (postgres)
- [x] DI: At the file system level
- [ ] TDD: node:test or tap, DI, unit-tests, e2e
- [x] [N-layer architecture] (#architecture-description-&-maintain-instructions)
- [] db:
  - [x] drizzle-orm
  - [x] postgres-js
  - [x] separate loggerService for db logging
  - [ ] cursor pagination
- [x] local code style support:
  - [x] esLint setup
  - [x] prettier setup
  - [x] editorconfig
  - [x] optional: words spelling checker (VScode plugin)
- [] built-in Auth:
  - [x] bearer token (JWT) (Manually)
  - [] API_KEY (Manually)
- [ ] permissions checks:
- [x] rate limiting (https://www.npmjs.com/package/fastify-rate-limit)
  - [x] global rate limit
  - [x] rate limit per route
- [x] request timeouts (implement manually)
- [x] request-scoped storage support, based on Asynchronous Local Storage to receive data without mutation request
- [ ] templates rendering support
- [ ] ability to run CPU intensive tasks in the Piscina worker pool
- [x] covering utilities with .d.ts files
- [x] support Docker installation

## 🙋 FAQ

[View FAQ](docs/faq.md)

## 📝 Docs

- [Project structure](./docs/project-structure.md)
- [Tests](./docs/tests.md)
- [Deploy](./docs/deploy.md)
- [Environment](./docs/env.md)
- [FAQ](./docs/faq.md)
