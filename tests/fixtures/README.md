# Test Fixtures

Фікстури - це переиспользувані тестові дані та моки для тестування.

## Структура

```
tests/fixtures/
├── pagination/          # Фікстури для пагінації
│   ├── pagination-config.fixture.js    # Конфігурації пагінації
│   ├── pagination-params.fixture.js    # Параметри пагінації
│   ├── mock-dependencies.fixture.js     # Моки залежностей
│   └── index.js                         # Re-exports
└── README.md
```

## Використання

### Pagination Config Fixtures

```javascript
import { BASIC_OFFSET_CONFIG, FILTERABLE_OBJECT_CONFIG } from "#tests/fixtures/pagination";

// Використання в тестах
test("should work with basic config", () => {
  const config = BASIC_OFFSET_CONFIG;
  // ...
});
```

### Pagination Params Fixtures

```javascript
import { BASIC_OFFSET_PARAMS, OFFSET_PARAMS_WITH_FILTERS } from "#tests/fixtures/pagination";

test("should handle filters", () => {
  const params = OFFSET_PARAMS_WITH_FILTERS;
  // ...
});
```

### Mock Dependencies

```javascript
import { createMockDependencies, MOCK_LOGGER } from "#tests/fixtures/pagination";

test("should work with mocks", () => {
  const deps = createMockDependencies({
    db: customMockDb,
    logger: MOCK_LOGGER,
  });
  // ...
});
```

## Best Practices

1. **Переиспользуваність** - фікстури мають бути переиспользуваними
2. **Чіткі назви** - назви мають описувати призначення
3. **Мінімальність** - фікстури мають містити тільки необхідні дані
4. **Документація** - кожна фікстура має мати JSDoc коментар


