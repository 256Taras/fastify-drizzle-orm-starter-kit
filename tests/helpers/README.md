# Test Helpers

Утиліти для тестування згідно best practices Node.js test runner.

## Структура

```
tests/
├── helpers/              # Загальні утиліти для всіх тестів
│   ├── testing-app.js    # Створення тестового додатку
│   ├── db-utils.js       # Робота з базою даних
│   └── fixtures.js       # Базові функції для створення даних
└── integration/
    └── users/
        ├── fixtures.js   # Специфічні фікстури для users тестів
        └── *.test.js     # Тести
```

## Використання

### Створення тестового додатку

```javascript
import { createTestingApp } from "../../helpers/index.js";

let app, database, teardown;

before(async () => {
  const testingApp = await createTestingApp();
  app = testingApp.app;
  database = testingApp.database;
  teardown = testingApp.teardown;
});

after(async () => {
  await teardown();
});
```

### Робота з базою даних

```javascript
import { dbUtils } from "../../helpers/index.js";
import { users } from "#modules/users/users.model.js";

beforeEach(async () => {
  await dbUtils.cleanUp(database.drizzle);
});

// Seed таблиці
await dbUtils.seed(database.drizzle, users, [userData1, userData2]);
```

### Створення тестових даних

**Базові функції** (використовуються в специфічних фікстурах):

```javascript
import { fixtures } from "../../helpers/index.js";

// Створити одного користувача
const userSeed = await fixtures.createUserSeed({
  email: "test@example.com",
  firstName: "John",
});

// Створити адміна
const adminSeed = await fixtures.createAdminSeed();

// Створити кілька користувачів
const users = await fixtures.createMultipleUserSeeds(5);
```

**Специфічні фікстури** (в папці тестів):

```javascript
import { usersFixtures } from "./fixtures.js";

const { positive, negative } = usersFixtures;

// Фікстури називаються так само як тести
test("should return paginated users list", async () => {
  const testUsers = await positive.shouldReturnPaginatedUsersList();
  await dbUtils.seed(database.drizzle, users, testUsers);
  // ...
});
```

## Best Practices

1. **Фікстури мають називатися так само як тести** - легко знайти відповідність
2. **Розділяйте фікстури на `positive` та `negative`** - для позитивних та негативних кейсів
3. **Фікстури в папці тестів** - специфічні фікстури мають бути близько до тестів
4. **Використовуйте `describe` для групування тестів**
5. **`before` - один раз перед усіма тестами** (setup app, database)
6. **`beforeEach` - перед кожним тестом** (clean DB, reset state)
7. **`after` - один раз після всіх тестів** (cleanup, close connections)
8. **Тести мають бути ізольованими** - кожен тест незалежний
9. **Arrange-Act-Assert pattern** - чітка структура тесту

## Приклад повного тесту

```javascript
import assert from "node:assert";
import { after, before, beforeEach, test, describe } from "node:test";
import { users } from "#modules/users/users.model.js";
import { createTestingApp, dbUtils } from "../../helpers/index.js";
import { usersFixtures } from "./fixtures.js";

const { positive, negative } = usersFixtures;

let app, database, teardown;

before(async () => {
  const testingApp = await createTestingApp();
  app = testingApp.app;
  database = testingApp.database;
  teardown = testingApp.teardown;
});

beforeEach(async () => {
  await dbUtils.cleanUp(database.drizzle);
});

after(async () => {
  await teardown();
});

describe("GET /v1/users/", () => {
  test("should return paginated users list", async () => {
    // Arrange - фікстура називається так само як тест
    const testUsers = await positive.shouldReturnPaginatedUsersList();
    await dbUtils.seed(database.drizzle, users, testUsers);

    // Act
    const response = await app.inject({
      method: "GET",
      url: "/v1/users/",
      query: { limit: "10", page: "1" },
    });

    // Assert
    assert.strictEqual(response.statusCode, 200);
    const body = response.json();
    assert.ok(Array.isArray(body.data));
  });

  test("should return 400 for invalid enum value", async () => {
    // Negative case - не потребує даних
    await negative.shouldReturn400ForInvalidEnumValue();
    
    const response = await app.inject({
      method: "GET",
      url: "/v1/users/",
      query: { limit: "10", page: "1", "filter.role": "$eq:INVALID" },
    });

    assert.strictEqual(response.statusCode, 400);
  });
});
```
