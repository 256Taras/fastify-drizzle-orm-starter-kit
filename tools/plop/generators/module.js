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
    ],
    actions: (data) => {
      data.parsedFields = parseFields(data.fields);
      data.modulePath = `src/modules/{{camelCase name}}`;

      const actions = [
        // Model
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.model.ts`,
          templateFile: join(templatesPath, "model/model.hbs"),
        },
        // Contracts
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.contracts.ts`,
          templateFile: join(templatesPath, "contracts/contracts.hbs"),
        },
        // Repository
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.repository.ts`,
          templateFile: join(templatesPath, "repository/repository.hbs"),
        },
        // Queries
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.queries.ts`,
          templateFile: join(templatesPath, "queries/queries.hbs"),
        },
        // Mutations
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.mutations.ts`,
          templateFile: join(templatesPath, "mutations/mutations.hbs"),
        },
        // Schemas
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.schemas.ts`,
          templateFile: join(templatesPath, "schemas/schemas.hbs"),
        },
        // Router
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.router.v1.ts`,
          templateFile: join(templatesPath, "router/router.hbs"),
        },
      ];

      // Optional: Events
      if (data.withEvents) {
        actions.push(
          {
            type: "add",
            path: `${data.modulePath}/{{camelCase name}}.events.ts`,
            templateFile: join(templatesPath, "events/events.hbs"),
          },
          {
            type: "add",
            path: `${data.modulePath}/{{camelCase name}}.event-handlers.ts`,
            templateFile: join(templatesPath, "event-handlers/event-handlers.hbs"),
          },
        );
      }

      // Optional: Pagination config
      if (data.withPagination) {
        actions.push({
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.pagination-config.ts`,
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
        template: 'import { {{camelCase name}} } from "#modules/{{camelCase name}}/{{camelCase name}}.model.ts";',
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
        path: `${data.modulePath}/{{camelCase name}}.types.d.ts`,
        templateFile: join(templatesPath, "types/types.hbs"),
      });

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
