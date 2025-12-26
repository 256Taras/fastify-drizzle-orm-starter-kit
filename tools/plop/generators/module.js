/**
 * Module Generator - Creates full module with all files
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesPath = join(__dirname, "../templates");

export default function moduleGenerator(plop) {
  plop.setGenerator("module", {
    description: "Generate a complete module with all files",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Module name (plural, e.g. posts, articles, products):",
        validate: (input) => (input ? true : "Module name is required"),
      },
      {
        type: "input",
        name: "fields",
        message: 'Fields (e.g. "title:string, content:text, isPublished?:boolean"):',
        default: "name:string",
      },
      {
        type: "confirm",
        name: "withAuth",
        message: "Require authentication for routes?",
        default: false,
      },
      {
        type: "confirm",
        name: "withEvents",
        message: "Generate events and event handlers?",
        default: true,
      },
      {
        type: "confirm",
        name: "withPagination",
        message: "Generate pagination config?",
        default: true,
      },
      {
        type: "confirm",
        name: "softDelete",
        message: "Enable soft delete?",
        default: true,
      },
      {
        type: "confirm",
        name: "withTests",
        message: "Generate e2e tests?",
        default: true,
      },
    ],
    actions: (data) => {
      data.parsedFields = parseFields(data.fields);
      data.modulePath = `src/modules/{{kebabCase name}}`;
      data.testsPath = `tests/e2e/{{kebabCase name}}/v1`;

      const actions = [
        // Model
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.model.ts`,
          templateFile: join(templatesPath, "model/model.hbs"),
        },
        // Contracts
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.contracts.ts`,
          templateFile: join(templatesPath, "contracts/contracts.hbs"),
        },
        // Repository
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.repository.ts`,
          templateFile: join(templatesPath, "repository/repository.hbs"),
        },
        // Queries
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.queries.ts`,
          templateFile: join(templatesPath, "queries/queries.hbs"),
        },
        // Mutations
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.mutations.ts`,
          templateFile: join(templatesPath, "mutations/mutations.hbs"),
        },
        // Schemas
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.schemas.ts`,
          templateFile: join(templatesPath, "schemas/schemas.hbs"),
        },
        // Router
        {
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.router.v1.ts`,
          templateFile: join(templatesPath, "router/router.hbs"),
        },
      ];

      // Optional: Events
      if (data.withEvents) {
        actions.push(
          {
            type: "add",
            path: `${data.modulePath}/{{kebabCase name}}.events.ts`,
            templateFile: join(templatesPath, "events/events.hbs"),
          },
          {
            type: "add",
            path: `${data.modulePath}/{{kebabCase name}}.event-handlers.ts`,
            templateFile: join(templatesPath, "event-handlers/event-handlers.hbs"),
          },
        );
      }

      // Optional: Pagination config
      if (data.withPagination) {
        actions.push({
          type: "add",
          path: `${data.modulePath}/{{kebabCase name}}.pagination-config.ts`,
          templateFile: join(templatesPath, "pagination-config/pagination-config.hbs"),
        });
      }

      // Add table name to table-names.ts
      actions.push({
        type: "append",
        path: "src/infra/database/table-names.ts",
        pattern: /export const TABLE_NAMES = \{/,
        template: '  {{camelCase name}}: "{{snakeCase name}}",',
      });

      // Add import to db-schema.ts
      actions.push({
        type: "append",
        path: "src/infra/database/db-schema.ts",
        pattern: /import \{ users \} from "#modules\/users\/users\.model\.ts";/,
        template: 'import { {{camelCase name}} } from "#modules/{{kebabCase name}}/{{kebabCase name}}.model.ts";',
      });

      // Add to schema object in db-schema.ts
      actions.push({
        type: "append",
        path: "src/infra/database/db-schema.ts",
        pattern: /users,$/m,
        template: "  {{camelCase name}},",
      });

      // Add swagger tag
      actions.push({
        type: "append",
        path: "src/libs/constants/swagger-tags.constants.ts",
        pattern: /export const SWAGGER_TAGS = \{/,
        template: '  {{upperSnakeCase name}}: ["{{pascalCase name}}"],',
      });

      // Generate module-specific types (declaration merging for Cradle)
      actions.push({
        type: "add",
        path: `${data.modulePath}/{{kebabCase name}}.types.d.ts`,
        templateFile: join(templatesPath, "types/types.hbs"),
      });

      // Optional: E2E Tests
      if (data.withTests) {
        // Add table name to test db.utils.ts TABLE_NAMES
        actions.push({
          type: "append",
          path: "tests/helpers/utils/db.utils.ts",
          pattern: /export const TABLE_NAMES = \{/,
          template: '  {{camelCase name}}: "{{upperSnakeCase name}}",',
        });

        // Add import for drizzle table to db.utils.ts
        actions.push({
          type: "append",
          path: "tests/helpers/utils/db.utils.ts",
          pattern: /import \{ users \} from "#modules\/users\/users\.model\.ts";/,
          template: 'import { {{camelCase name}} } from "#modules/{{kebabCase name}}/{{kebabCase name}}.model.ts";',
        });

        // Add to DRIZZLE_TABLES in db.utils.ts
        actions.push({
          type: "append",
          path: "tests/helpers/utils/db.utils.ts",
          pattern: /\[TABLE_NAMES\.users\]: users,/,
          template: "  [TABLE_NAMES.{{camelCase name}}]: {{camelCase name}},",
        });

        // Factory
        actions.push({
          type: "add",
          path: `tests/helpers/factories/{{kebabCase (singular name)}}.factory.ts`,
          templateFile: join(templatesPath, "tests/factory.hbs"),
        });

        // GET /:id
        actions.push(
          {
            type: "add",
            path: `${data.testsPath}/get-one/get-one-{{kebabCase (singular name)}}.test.ts`,
            templateFile: join(templatesPath, "tests/get-one.test.hbs"),
          },
          {
            type: "add",
            path: `${data.testsPath}/get-one/get-one-{{kebabCase (singular name)}}.fixtures.ts`,
            templateFile: join(templatesPath, "tests/get-one.fixtures.hbs"),
          },
        );

        // GET / (list with pagination)
        if (data.withPagination) {
          actions.push(
            {
              type: "add",
              path: `${data.testsPath}/get-many/get-many-{{kebabCase (singular name)}}.test.ts`,
              templateFile: join(templatesPath, "tests/get-many.test.hbs"),
            },
            {
              type: "add",
              path: `${data.testsPath}/get-many/get-many-{{kebabCase (singular name)}}.fixtures.ts`,
              templateFile: join(templatesPath, "tests/get-many.fixtures.hbs"),
            },
          );
        }

        // POST /
        actions.push(
          {
            type: "add",
            path: `${data.testsPath}/create-one/create-one-{{kebabCase (singular name)}}.test.ts`,
            templateFile: join(templatesPath, "tests/create-one.test.hbs"),
          },
          {
            type: "add",
            path: `${data.testsPath}/create-one/create-one-{{kebabCase (singular name)}}.fixtures.ts`,
            templateFile: join(templatesPath, "tests/create-one.fixtures.hbs"),
          },
        );

        // PUT /:id
        actions.push(
          {
            type: "add",
            path: `${data.testsPath}/update-one/update-one-{{kebabCase (singular name)}}.test.ts`,
            templateFile: join(templatesPath, "tests/update-one.test.hbs"),
          },
          {
            type: "add",
            path: `${data.testsPath}/update-one/update-one-{{kebabCase (singular name)}}.fixtures.ts`,
            templateFile: join(templatesPath, "tests/update-one.fixtures.hbs"),
          },
        );

        // DELETE /:id
        actions.push(
          {
            type: "add",
            path: `${data.testsPath}/delete-one/delete-one-{{kebabCase (singular name)}}.test.ts`,
            templateFile: join(templatesPath, "tests/delete-one.test.hbs"),
          },
          {
            type: "add",
            path: `${data.testsPath}/delete-one/delete-one-{{kebabCase (singular name)}}.fixtures.ts`,
            templateFile: join(templatesPath, "tests/delete-one.fixtures.hbs"),
          },
        );
      }

      return actions;
    },
  });
}

function parseFields(fieldsStr) {
  if (!fieldsStr) return [];

  return fieldsStr.split(",").map((field) => {
    const trimmed = field.trim();
    const nullable = trimmed.includes("?");
    const [namePart, typePart] = trimmed.replace("?", "").split(":");

    let type = typePart || "string";
    let length = null;

    // Parse length: string(256)
    const lengthMatch = type.match(/^(\w+)\((\d+)\)$/);
    if (lengthMatch) {
      type = lengthMatch[1];
      length = parseInt(lengthMatch[2], 10);
    }

    return {
      name: namePart.trim(),
      type: type.trim(),
      nullable,
      length,
    };
  });
}
