# Project Scripts 📜

Here's a breakdown of all the npm scripts available in this project, each designed to facilitate specific development, testing, and operational tasks:

## 🚀 Running the Application

- **`start`**: `node src/index.js` - Starts the production version of the application.
- **`start:dev`**: `node src/index.js | pino-pretty --ignore serviceContext` - Starts the application in development mode with pretty logging.
- **`start:dev:watch`**: `node --watch src/index.js | pino-pretty --ignore serviceContext` - Starts the application in development mode with live reloading.

## 🐳 Docker Management

- **`docker:dev:up`**: Starts all Docker containers for development using `docker-compose`.
- **`docker:dev:down`**: Stops all Docker containers for development.
- **`docker:infra:up`**: Starts the infrastructure Docker containers.
- **`docker:infra:down`**: Stops the infrastructure Docker containers.

## 🗄️ Database Operations with Drizzle ORM

- **`database:generate`**: Generates new database migrations based on the current Drizzle schema.
- **`database:push`**: Applies the schema changes directly to the database.
- **`database:studio`**: Launches Drizzle Studio on port 3000 for database management.
- **`database:check`**: Checks for migration consistency and potential conflicts.
- **`database:drop`**: Removes all migration files from the specified directory.
- **`database:up`**: Updates the Drizzle metadata to the latest version.
- **`database:introspect`**: Generates a TypeScript schema file from the current database state.

## 🧹 Code Quality and Formatting

- **`lint`**: Runs ESLint to identify and report on patterns found in ECMAScript/JavaScript code.
- **`lint:fix`**: Automatically fixes linting errors.
- **`prettier:fix`**: Formats the code to ensure consistent style.

## 🪝 Git Hooks

- **`prepare`**: Installs Git hooks with Husky.
- **`precommit`**: Runs linting and tests before each commit.
- **`prepush`**: Runs linting and tests before each push.

## 🔍 Checks and Balances

- **`check:types`**: Runs TypeScript to check for type errors.
- **`check:env`**: Validates that all required environment variables are set.
- **`check:dep`**: Checks for unused or missing dependencies.

## 🚧 Continuous Integration

- **`ci`**: Runs a comprehensive series of commands for linting, formatting, and testing the codebase.

## 🛠️ Miscellaneous

- **`generate:module`**: Scaffolds a new module using configured templates.

Feel free to run these scripts directly with `pnpm <script-name>` or `pnpm <script-name>` to streamline your development workflows and ensure high standards of code hygiene and deployment readiness! 🌟
