# Database Seeding

This directory contains seed files for populating the database with initial data.

## Structure

```
seeds/
  development/     # Development environment seeds
  test/           # Test environment seeds
  production/     # Production seeds (if needed)
```

## Usage

### Run seeds for development
```bash
npm run database:seed:dev
```

### Run seeds for test
```bash
npm run database:seed:test
```

### Run seeds (defaults to development)
```bash
npm run database:seed
```

## Seed Files

Each seed file should export a default function that accepts:
- `db` - Drizzle database instance
- `logger` - Optional logger instance

Example:
```javascript
export default async function seedUsers(db, logger) {
  // Your seeding logic here
  await db.insert(users).values([...]);
  logger?.info("Seeded users");
}
```

## Using drizzle-seed for Test Data

For generating large amounts of fake/test data, you can use the official `drizzle-seed` package:

```bash
npm install drizzle-seed
```

Example usage:
```javascript
import { seed } from "drizzle-seed";
import * as schema from "#modules/users/users.model.js";

export default async function seedTestData(db, logger) {
  await seed(db, schema, { count: 100 });
  logger?.info("Generated 100 test users");
}
```

See [Drizzle Seed Documentation](https://orm.drizzle.team/docs/seed-overview) for more details.

## Best Practices

- Use specific seed files for initial data (admin users, default settings, etc.)
- Use `drizzle-seed` for generating large amounts of test/fake data
- Always check if data already exists before seeding
- Use environment-specific seed files
- Keep seed files idempotent (can be run multiple times safely)
