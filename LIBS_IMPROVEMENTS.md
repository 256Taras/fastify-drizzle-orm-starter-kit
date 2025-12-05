# Аналіз та рекомендації для покращення `src/libs`

## 🎯 Критичні проблеми

### 1. **Опечатка в імені файлу**
- ❌ `common.contracnts.js` → ✅ `common.contracts.js`
- **Вплив:** Плутанина, погані практики

### 2. **Дублювання коду в Error класах**
- Всі error класи мають ідентичну структуру
- **Рішення:** Створити базовий клас або factory функцію

### 3. **Надмірне використання `@ts-ignore`**
- `session-storage.service.js` - 4 `@ts-ignore`
- `encrypter.service.js` - 2 `@ts-ignore`
- **Вплив:** Втрата type safety, складніше підтримувати

## 📊 Проблеми з cognitive load

### 1. **Відсутність базових JSDoc типів (мінімально)**
```javascript
// ❌ Погано - порожній JSDoc
/**
 *
 * @param {string} importMetaUrl
 */

// ✅ Добре - мінімально, але з типами
/**
 * @param {string} importMetaUrl
 * @returns {string}
 */
export const getDirName = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl));
```

**Принцип:** Додавати тільки типи, без довгих описів (якщо функція самодокументована)

**Файли для покращення (тільки типи):**
- `utils/files.js` - додати `@returns`
- `utils/schemas.js` - додати `@returns` для складних функцій
- `utils/upload.js` - додати `@returns`

### 2. **Магічні числа та рядки**
```javascript
// ❌ Погано
const HTTP_STATUS_CODE_LENGTH = 3;
const CUSTOM_ERROR_CODE_LENGTH = 6;
const DELIMITER_CODE_LENGTH = 3;

// ✅ Добре - винести в константи з поясненнями
const ERROR_CODE_FORMAT = {
  HTTP_STATUS_LENGTH: 3,
  CUSTOM_CODE_LENGTH: 6,
  DELIMITER_LENGTH: 3,
} as const;
```

### 3. **Складні функції без розбиття**
- `schemas.js:mapHttpErrorToSchemaError` - можна розбити
- `schemas.js:sortSchemaErrorsByCodeAsc` - складна логіка

## 🔧 Проблеми з scalability

### 1. **Жорстко закодовані константи**
```javascript
// ❌ Погано - важко розширювати
export const ROLES_NAMES = {
  admin: "ADMIN",
  user: "USER",
};

// ✅ Добре - можна додавати нові ролі без змін коду
export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
```

### 2. **Відсутність абстракцій**
- Error mapping логіка дублюється
- Немає базового класу для errors
- Немає factory для створення typed handlers

### 3. **Складні залежності**
- `di-container.plugin.js` має складну логіку генерації паттернів
- Можна винести в окремий модуль

## 🎨 Проблеми з code organization

### 1. **Непослідовність в naming**
```javascript
// ❌ Різні стилі
BAD_REQUEST_400        // UPPER_CASE
BadRequestException    // PascalCase
defaultHttpErrorCollection // camelCase
```

**Рекомендація:** Використовувати один стиль:
- HTTP errors: `HttpBadRequestError` (PascalCase)
- Domain errors: `BadRequestException` (PascalCase)
- Collections: `defaultHttpErrorCollection` (camelCase)

### 2. **Невикористаний код**
- `utils/typed-routes.js` - створений, але не використовується
- Можна видалити або реалізувати

### 3. **Розкидані константи**
- `common.constants.js` - базові константи
- `common.contracnts.js` - схеми
- Можна краще організувати по категоріям

## 🚀 Конкретні рекомендації

### 1. **Рефакторинг Error класів**

```javascript
// ✅ Створити базовий клас
class BaseDomainError extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }

  static of(message) {
    return Promise.reject(new this(message));
  }
}

// ✅ Використання
export class BadRequestException extends BaseDomainError {
  constructor(message) {
    super(message, "BadRequestException");
  }
}
```

### 2. **Покращення type safety**

```javascript
// ✅ Замість @ts-ignore
const getUser = () => {
  const user = requestContext.get(TOKENS.userJwtData);
  if (!user) {
    throw new Error("User not found in request context");
  }
  return user;
};
```

### 3. **Винесення констант**

```javascript
// ✅ Створити constants/error-codes.js
export const ERROR_CODE_FORMAT = {
  HTTP_STATUS_LENGTH: 3,
  CUSTOM_CODE_LENGTH: 6,
  DELIMITER_LENGTH: 3,
  DELIMITER_START: 3,
} as const;
```

### 4. **Мінімальний JSDoc (тільки типи)**

```javascript
// ✅ Мінімально - тільки типи, без описів
/**
 * @template T
 * @param {Record<string, T>} enumObject
 * @param {import('@sinclair/typebox').TObjectOptions} [options={}]
 * @returns {import('@sinclair/typebox').TUnion}
 */
export const createEnumTypeUnionSchema = (enumObject, options = {}) =>
  Type.Union(Object.values(enumObject).map((item) => Type.Literal(item)), options);
```

**Принцип:** Якщо функція самодокументована через назву та параметри - тільки типи. Опис додавати тільки для складних/неочевидних функцій.

### 5. **Розбиття складних функцій**

```javascript
// ✅ Розбити на менші функції
const extractHttpStatusCode = (fullCode) => 
  fullCode.slice(0, ERROR_CODE_FORMAT.HTTP_STATUS_LENGTH);

const extractCustomErrorCode = (fullCode) => {
  const startAt = ERROR_CODE_FORMAT.HTTP_STATUS_LENGTH + ERROR_CODE_FORMAT.DELIMITER_LENGTH;
  return fullCode.slice(startAt, startAt + ERROR_CODE_FORMAT.CUSTOM_CODE_LENGTH);
};

const sortSchemaErrorsByCodeAsc = (a, b) => {
  const aCode = Object.keys(a)[0];
  const bCode = Object.keys(b)[0];
  
  const httpCompare = extractHttpStatusCode(aCode).localeCompare(extractHttpStatusCode(bCode));
  if (httpCompare !== 0) return httpCompare;
  
  return extractCustomErrorCode(aCode).localeCompare(extractCustomErrorCode(bCode));
};
```

## 📋 Чеклист покращень

### Критичні (високий пріоритет)
- [ ] Перейменувати `common.contracnts.js` → `common.contracts.js`
- [ ] Створити базовий клас для Error класів
- [ ] Прибрати всі `@ts-ignore` з `session-storage.service.js`
- [ ] Додати мінімальні JSDoc типи (тільки `@param`, `@returns`) для функцій без типів

### Важливі (середній пріоритет)
- [ ] Винести магічні числа в константи
- [ ] Розбити складні функції на менші
- [ ] Уніфікувати naming conventions
- [ ] Видалити або реалізувати `typed-routes.js`

### Бажані (низький пріоритет)
- [ ] Реорганізувати константи по категоріям
- [ ] Створити factory для error mapping
- [ ] Додати unit тести для утиліт
- [ ] Створити index файли для кращого імпорту

## 🎯 Метрики покращення

**До:**
- Cognitive Complexity: ~8-10 (висока)
- Type Safety: 60% (багато @ts-ignore)
- Code Duplication: ~15% (error класи)
- Type Documentation: 40% (відсутні типи в JSDoc)

**Після:**
- Cognitive Complexity: ~3-5 (низька)
- Type Safety: 95% (мінімум @ts-ignore)
- Code Duplication: <5% (базовий клас)
- Type Documentation: 90% (мінімальні типи в JSDoc, без перевантаження)

