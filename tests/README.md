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

## Налаштування тестового середовища

Тести використовують **окреме Docker середовище** з ізольованою тестовою базою даних, щоб не чіпати розробницьку БД.

### Перший запуск

1. **Створіть `.env.test` файл** (скопіюйте з `.env.test.example`):
   ```bash
   cp configs/.env.test.example configs/.env.test
   ```

2. **Запустіть тестову БД в Docker**:
   ```bash
   npm run test:docker:up
   ```

3. **Запустіть міграції для тестової БД** (якщо потрібно):
   ```bash
   ENV_NAME=test npm run database:migrate
   ```

### Команди

#### Локальна розробка (Node.js локально, БД в Docker)

```bash
# Запустити тести локально (БД в Docker)
make test-local
# або
npm run test:local

# Тільки підняти залежності (БД)
make test-deps-up
# або
npm run test:deps:up

# Зупинити залежності
make test-deps-down
# або
npm run test:deps:down
```

#### CI/CD (все в Docker)

```bash
# Запустити тести в Docker (Node.js + БД)
make test-ci
# або
npm run test:ci
```

#### Інші команди

```bash
# Запустити всі тести (автоматично встановлює ENV_NAME=test)
npm test

# Запустити тести в watch режимі
npm run test:watch

# Запустити тести з coverage
npm run test:coverage

# Переглянути логи тестової БД
npm run test:docker:logs
```

### Як це працює

- **ENV_NAME=test** автоматично встановлюється при запуску тестів
- Конфігурація завантажується з `configs/.env.test` (якщо `ENV_NAME=test`)
- Тестова БД працює на порту **5434** (розробницька - на 5433)
- Тестова БД має окрему назву: `test_db` (розробницька - `oonhvxbq`)
- Тестова БД ізольована від розробницької через окремий Docker network

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

Для інтеграційних тестів з БД використовується **окрема тестова БД** в Docker контейнері.

### Автоматичне налаштування

При запуску тестів з `ENV_NAME=test`:
- Автоматично завантажується `configs/.env.test`
- `DATABASE_URL` вказує на тестову БД (`postgresql://test_user:test_password@localhost:5434/test_db`)
- Тестова БД ізольована від розробницької

### Приклад інтеграційного тесту

```javascript
import { test, before, after } from "node:test";
import assert from "node:assert";
import { Application } from "#index.js";

let app;

before(async () => {
  // Application автоматично використає .env.test через ENV_NAME=test
  app = await Application.create();
  await app.start();
});

after(async () => {
  await app.stop();
});

test("should create a user", async () => {
  // Ваш тест з реальною БД
  const response = await app.restApi.fastify.inject({
    method: "POST",
    url: "/v1/users",
    payload: { email: "test@example.com" },
  });

  assert.strictEqual(response.statusCode, 201);
});
```

### Очищення БД між тестами

Для очищення БД між тестами використовуйте `tests/helpers/db-utils.js`:

```javascript
import { test, beforeEach } from "node:test";
import { cleanUp } from "../helpers/db-utils.js";
import { getDatabase } from "#infra/database/db.js";

beforeEach(async () => {
  const db = getDatabase();
  await cleanUp(db);
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
