# Testing Guide

Цей проект використовує **вбудований Node.js test runner** (`node --test`) - не потребує додаткових залежностей, швидкий та простий.

## Структура тестів

```
tests/
├── unit/              # Юніт тести (ізольовані, без залежностей)
├── integration/       # Інтеграційні тести (з БД, HTTP тощо)
└── helpers/           # Допоміжні функції для тестів
    ├── setup.js           # Глобальна конфігурація
    ├── fastify-helper.js   # Хелпери для Fastify
    └── database-helper.js  # Хелпери для БД
```

## Команди

```bash
# Запустити всі тести
npm test

# Запустити тести в watch режимі
npm run test:watch

# Запустити тести з coverage
npm run test:coverage
```

## Написання тестів

### Юніт тест (приклад)

```javascript
import { test } from "node:test";
import assert from "node:assert";
import { someFunction } from "#libs/utils/some-util.js";

test("someFunction should return expected value", () => {
  const result = someFunction("input");
  assert.strictEqual(result, "expected");
});
```

### Інтеграційний тест (приклад)

```javascript
import { test, before, after } from "node:test";
import assert from "node:assert";
import { createTestApp, injectRequest } from "../helpers/fastify-helper.js";

let app;

before(async () => {
  app = await createTestApp();
  // Реєструємо потрібні плагіни/роути
  await app.register(usersRouter);
});

after(async () => {
  await app.close();
});

test("GET /api/users should return users list", async () => {
  const response = await injectRequest(app, {
    method: "GET",
    url: "/api/users",
  });

  assert.strictEqual(response.statusCode, 200);
  const body = response.json();
  assert.ok(body.data);
});
```

## Node.js Test Runner API

### Основні функції:

- `test(name, fn)` - створити тест
- `test.skip(name, fn)` - пропустити тест
- `test.todo(name)` - тест в розробці
- `before(fn)` - виконати перед усіма тестами
- `after(fn)` - виконати після усіх тестів
- `beforeEach(fn)` - виконати перед кожним тестом
- `afterEach(fn)` - виконати після кожного тесту

### Assertions:

- `assert.strictEqual(actual, expected)` - строге порівняння
- `assert.deepStrictEqual(actual, expected)` - глибоке порівняння
- `assert.ok(value)` - перевірка на truthy
- `assert.throws(fn)` - перевірка на викидання помилки

## Тестування з базою даних

Для інтеграційних тестів з БД:

1. **Використовуйте окрему тестову БД** (рекомендовано):
   - Створіть окрему БД для тестів
   - Використовуйте `DATABASE_URL_TEST` в `.env.test`

2. **Або використовуйте транзакції**:
   - Створюйте транзакцію перед тестом
   - Робите rollback після тесту

Приклад:

```javascript
import { test, before, after } from "node:test";
import { createTestDatabase, closeTestDatabase } from "../helpers/database-helper.js";

let db;
let client;

before(async () => {
  const testDb = await createTestDatabase(process.env.DATABASE_URL_TEST);
  db = testDb.db;
  client = testDb.client;
});

after(async () => {
  await closeTestDatabase(client);
});

test("should create a user", async () => {
  // Ваш тест
});
```

## Best Practices

1. **Юніт тести** - тестуйте логіку без залежностей (БД, HTTP)
2. **Інтеграційні тести** - тестуйте повний flow (роути, БД, сервіси)
3. **Mocking** - використовуйте `node:test` mocking або `sinon` для складних випадків
4. **Cleanup** - завжди очищайте ресурси в `after`/`afterEach`
5. **Isolation** - кожен тест повинен бути незалежним

## Coverage

Coverage звіти генеруються через `c8` в `coverage/` директорії. Мінімальний рівень покриття: 80%.

## Додаткова інформація

- [Node.js Test Runner Documentation](https://nodejs.org/api/test.html)
- [Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)
