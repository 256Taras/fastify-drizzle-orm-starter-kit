/**
 * Individual File Generators
 * Generate single files for existing or new modules
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesPath = join(__dirname, "../templates");
const modulesPath = "src/modules";

// Simple name input prompt (for bypass mode support)
const simpleNamePrompt = {
  type: "input",
  name: "name",
  message: "Module name (plural, e.g. posts):",
  validate: (input) => (input ? true : "Module name is required"),
};

const fieldsPrompt = {
  type: "input",
  name: "fields",
  message: 'Fields (e.g. "title:string, content:text"):',
  default: "name:string",
};

function parseFields(fieldsStr) {
  if (!fieldsStr) return [];
  return fieldsStr.split(",").map((field) => {
    const trimmed = field.trim();
    const nullable = trimmed.includes("?");
    const [namePart, typePart] = trimmed.replace("?", "").split(":");
    let type = typePart || "string";
    let length = null;
    const lengthMatch = type.match(/^(\w+)\((\d+)\)$/);
    if (lengthMatch) {
      type = lengthMatch[1];
      length = parseInt(lengthMatch[2], 10);
    }
    return { name: namePart.trim(), type: type.trim(), nullable, length };
  });
}

export default function individualGenerators(plop) {
  // ========== REPOSITORY ==========
  plop.setGenerator("repository", {
    description: "Generate repository file",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.softDelete = true; // Default
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.repository.ts`,
          templateFile: join(templatesPath, "repository/repository.hbs"),
        },
      ];
    },
  });

  // ========== QUERIES ==========
  plop.setGenerator("queries", {
    description: "Generate queries file (read operations)",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.withPagination = existsSync(`${modulesPath}/${data.name}/${data.name}.pagination-config.ts`);
      data.softDelete = true;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.queries.ts`,
          templateFile: join(templatesPath, "queries/queries.hbs"),
        },
      ];
    },
  });

  // ========== MUTATIONS ==========
  plop.setGenerator("mutations", {
    description: "Generate mutations file (write operations)",
    prompts: [
      simpleNamePrompt,
      {
        type: "confirm",
        name: "withEvents",
        message: "Emit domain events?",
        default: true,
      },
    ],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.softDelete = true;
      const actions = [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.mutations.ts`,
          templateFile: join(templatesPath, "mutations/mutations.hbs"),
        },
      ];

      // Also generate events if they don't exist
      if (data.withEvents) {
        const eventsPath = `${modulesPath}/${data.name}/${data.name}.events.ts`;
        if (!existsSync(eventsPath)) {
          actions.push({
            type: "add",
            path: `${data.modulePath}/{{camelCase name}}.events.ts`,
            templateFile: join(templatesPath, "events/events.hbs"),
          });
        }
      }

      return actions;
    },
  });

  // ========== EVENTS ==========
  plop.setGenerator("events", {
    description: "Generate events and event handlers",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      return [
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
      ];
    },
  });

  // ========== ROUTER ==========
  plop.setGenerator("router", {
    description: "Generate router file (HTTP endpoints)",
    prompts: [
      simpleNamePrompt,
      {
        type: "confirm",
        name: "withAuth",
        message: "Require authentication?",
        default: false,
      },
    ],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.withPagination = existsSync(`${modulesPath}/${data.name}/${data.name}.pagination-config.ts`);
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.router.v1.ts`,
          templateFile: join(templatesPath, "router/router.hbs"),
        },
      ];
    },
  });

  // ========== SCHEMAS ==========
  plop.setGenerator("schemas", {
    description: "Generate schemas file (Fastify validation)",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.withPagination = existsSync(`${modulesPath}/${data.name}/${data.name}.pagination-config.ts`);
      data.softDelete = true;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.schemas.ts`,
          templateFile: join(templatesPath, "schemas/schemas.hbs"),
        },
      ];
    },
  });

  // ========== CONTRACTS ==========
  plop.setGenerator("contracts", {
    description: "Generate contracts file (TypeBox types)",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.softDelete = true;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.contracts.ts`,
          templateFile: join(templatesPath, "contracts/contracts.hbs"),
        },
      ];
    },
  });

  // ========== MODEL ==========
  plop.setGenerator("model", {
    description: "Generate model file (Drizzle schema)",
    prompts: [
      simpleNamePrompt,
      fieldsPrompt,
      {
        type: "confirm",
        name: "softDelete",
        message: "Enable soft delete?",
        default: true,
      },
    ],
    actions: (data) => {
      data.parsedFields = parseFields(data.fields);
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.model.ts`,
          templateFile: join(templatesPath, "model/model.hbs"),
        },
      ];
    },
  });

  // ========== PAGINATION CONFIG ==========
  plop.setGenerator("pagination", {
    description: "Generate pagination config",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      data.parsedFields = [];
      data.softDelete = true;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.pagination-config.ts`,
          templateFile: join(templatesPath, "pagination-config/pagination-config.hbs"),
        },
      ];
    },
  });

  // ========== SERVICE ==========
  plop.setGenerator("service", {
    description: "Generate service file (shared business logic)",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.service.ts`,
          templateFile: join(templatesPath, "service/service.hbs"),
        },
      ];
    },
  });

  // ========== TYPES (DI declaration merging) ==========
  plop.setGenerator("types", {
    description: "Generate types file (Cradle declaration merging)",
    prompts: [simpleNamePrompt],
    actions: (data) => {
      data.modulePath = `${modulesPath}/{{camelCase name}}`;
      return [
        {
          type: "add",
          path: `${data.modulePath}/{{camelCase name}}.types.d.ts`,
          templateFile: join(templatesPath, "types/types.hbs"),
        },
      ];
    },
  });
}
