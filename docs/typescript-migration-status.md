# TypeScript Migration Status

## Прогрес міграції JS → TS

### ✅ Конвертовано в TypeScript:

1. **src/modules/users/users.repository.ts** - конвертовано з JSDoc на TypeScript
2. **src/modules/users/users.contracts.ts** - конвертовано з JSDoc на TypeScript
3. **src/modules/users/users.queries.ts** - конвертовано з JSDoc на TypeScript

### 📋 Залишилося конвертувати (15 файлів):

#### Configs (2 файли):
- [ ] `src/configs/fastify-metrics.config.js`
- [ ] `src/configs/index.js`

#### Infrastructure (2 файли):
- [ ] `src/infra/api/http/routes/health-check.router.js`
- [ ] `src/infra/database/table-names.js`

#### Libraries (5 файлів):
- [ ] `src/libs/constants/swagger-security.constants.js`
- [ ] `src/libs/email/email.service.js`
- [ ] `src/libs/email/templates/index.js`
- [ ] `src/libs/email/templates/password-changed.template.js`
- [ ] `src/libs/email/templates/password-reset.template.js`
- [ ] `src/libs/repositories/base-repository.js`
- [ ] `src/libs/repositories/index.js`

#### Auth Module (5 файлів):
- [ ] `src/modules/auth/auth-password-reset-token.model.js`
- [ ] `src/modules/auth/auth-password-reset-token.repository.js`
- [ ] `src/modules/auth/auth-token.repository.js`
- [ ] `src/modules/auth/auth.mutations.js`
- [ ] `src/modules/auth/auth.repository.js`

## Як працює міграція

### Node.js 24 підтримує TypeScript нативно:
- Можна міксувати `.js` та `.ts` файли
- Не потрібен build step
- Просто `node src/index.ts` працює

### Приклад конвертації:

**До (JSDoc):**
```javascript
/** @type {(deps: Dependencies, email: string) => Promise<User | undefined>} */
const findOneByEmail = async ({ db }, email) => {
  // ...
};
```

**Після (TypeScript):**
```typescript
import type { Dependencies } from "#@types/index.jsdoc.js";
import type { User } from "./users.contracts.ts";

const findOneByEmail = async (
  { db }: Dependencies,
  email: string
): Promise<User | undefined> => {
  // ...
};
```

## Наступні кроки

1. Конвертувати решту файлів модуля users (mutations, router)
2. Конвертувати auth module
3. Конвертувати libs
4. Конвертувати configs
5. Конвертувати infra
6. Оновити main entry point (index.js → index.ts)

## Важливо

- Зберігати сумісність з існуючим кодом
- Оновлювати імпорти поступово
- Тестувати після кожної конвертації

