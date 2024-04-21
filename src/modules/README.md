## 🧩 Modules Folder

This directory is responsible for managing the routes to your application's endpoints. Every subdirectory here signifies a distinct endpoint, with each module behaving as a Fastify plugin endowed with its own encapsulation capabilities.

**Folder Structure Guide**:
- Name your file as `[module-name].router.[api-version].js` inside its designated folder to configure its routes.

### Best Practices:

- **Shared Route Functionality**: When functionality across routes overlaps, put this in the [Fastify
  plugin](https://www.fastify.io/docs/latest/Plugins/) folder and share it using [Fastify decorators](https://www.fastify.io/docs/latest/Decorators/).
- **Shared Module Logic**: For mutual business logic across modules, go to the `common/infra/services` folder. Files here are auto-loaded with `@fastify/awilix`.
- **Shared Use-Case Code**: Export to `your-module/services/your.service.js`.
- **Uniformity Across Modules**: Ensure that modules are alike and that data structures are consistent.
- **Grouping Multiple Services or ORM Models**: Organize them under folders like `services` or `entities`.
- **Async/Await Utilization in Routes**: If this feels daunting, revisit the fundamentals of Promise resolution.

---
## ⚙️ Module Generator

Module Generator is a script that automatically generates code for a new module in your application, based on your specifications. This includes files for models, schemas, routes, and types, structured in the directory pattern of your application.

### How to Use

Run the generator using the following command:

```shell
yarn generate:module ModuleName 'field1:type1(10), field2:type2, field3?:type3'
```
Replace ModuleName with the desired name for your new module, and field1:type1, field2:type2 with your desired field names and their respective types.

For example:

```shell
    node infra/bin/create-module.js name=Users fields='firstName:string, lastName:string, email:string!, password:string!, bio?:text'
```

This will generate a User module with fields firstName, lastName, email, password, and an optional bio, where email and password are unique.

After running the script, the files for the new module will be created in the src/modules directory.
