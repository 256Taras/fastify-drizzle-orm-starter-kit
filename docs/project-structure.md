# Project structure

## Folder structure

[Folder structure conventions](https://github.com/kriasoft/Folder-Structure-Conventions/blob/master/README.md)

## Top-level directory layout

    .
    ├── configs                 # Top level configs of project, related to infra & development time (`.ENV_CONFIG` files)
    ├── docs                    # Documentation files
    ├── src                     # Source files (alternatively `lib` or `app`)
    ├── tests                   # Automated tests (alternatively `spec` or `test`)
    ├── infra                   # Tools and utilities, scripts
    └── README.md

- `configs` - stores `.ENV_CONFIG` & files with configs.

### Automated tests

> **Q: Why tests are placed into a separate folder, as opposed to having them closer to the code under test?**
>
> **A:** Because you don't want to test the code, you want to test the _program_.

    .
    ├── ...
    ├── tests                   # Test files (alternatively `spec` or `test`)
    │   ├── benchmarks          # Load and stress tests
    │   ├── integration         # End-to-end, integration tests (alternatively `e2e`)
    │   └── unit                # Unit tests
    │   └── examples            # Example tests tests. Just shows how to implement tests
    └── ...

### Source code

    .
    ├── ...
    ├── src                     # Source files
    │   ├── infra               # Infrastructure layer (database, messaging systems)
    │   ├── libs                # Libraries and utilities shared across the project
    │   ├── configs             # Configurations related to the code: logger, fastify, etc.
    │   ├── @types              # Upper layer types used in the project (JSDoc, .d.ts files)
    │   ├── modules             # Store separate modules for specific functionalities
    │   │   ├── users           # User module (authentication, user management)
    │   │   ├── products        # Product module (product listings, inventory)
    │   │   ├── orders          # Order module (order processing, tracking)
    │   │   └── payment s       # Payment module (payment processing, integrations)
    │   └── app.ts              # Main application entry point
    └── ...


### `configs`

`configs` folder should contain all project related settings except code-related.
But there are some exceptions, for settings that cannot be placed in this folder.

<strong>Some exceptions explanation</strong>

- `.editorconfig` - Is not "When you add an .editorconfig file to a folder in your file hierarchy, its settings apply to all applicable files at that level and below."

- `.nvmrc` - should be placed in root, to enable `nvm use` command applicable easy.

- `package.json`/`package-lock.json`/`.gitignore`
