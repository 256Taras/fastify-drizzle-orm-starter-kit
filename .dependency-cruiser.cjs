/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "This dependency is part of a circular relationship. You might want to revise " +
        "your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-orphans",
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a config file), " +
        "add an exception for it in your dependency-cruiser configuration. By default " +
        "this rule does not scrutinize dot-files (e.g. .eslintrc.js), TypeScript declaration " +
        "files (.d.ts), tsconfig.json and some of the babel and webpack configs.",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: [
          String.raw`(^|/)\.[^/]+\.(js|cjs|mjs|ts|json)$`, // dot files
          String.raw`\.d\.ts$`, // TypeScript declaration files
          String.raw`\.jsdoc\.js$`, // JSDoc type definition files
          String.raw`(^|/)tsconfig\.json$`, // TypeScript config
          String.raw`(^|/)(babel|webpack)\.config\.(js|cjs|mjs|ts|json)$`, // babel/webpack configs
        ],
      },
      to: {},
    },
    {
      name: "no-deprecated-core",
      comment:
        "A module depends on a node core module that has been deprecated. Find an alternative - these are " +
        "bound to exist - node doesn't deprecate lightly.",
      severity: "warn",
      from: {},
      to: {
        dependencyTypes: ["core"],
        path: [
          "^(v8/tools/codemap)$",
          "^(v8/tools/consarray)$",
          "^(v8/tools/csvparser)$",
          "^(v8/tools/logreader)$",
          "^(v8/tools/profile_view)$",
          "^(v8/tools/profile)$",
          "^(v8/tools/SourceMap)$",
          "^(v8/tools/splaytree)$",
          "^(v8/tools/tickprocessor-driver)$",
          "^(v8/tools/tickprocessor)$",
          "^(node-inspect/lib/_inspect)$",
          "^(node-inspect/lib/internal/inspect_client)$",
          "^(node-inspect/lib/internal/inspect_repl)$",
          "^(async_hooks)$",
          "^(punycode)$",
          "^(domain)$",
          "^(constants)$",
          "^(sys)$",
          "^(_linklist)$",
          "^(_stream_wrap)$",
        ],
      },
    },
    {
      name: "not-to-deprecated",
      comment:
        "This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later " +
        "version of that module, or find an alternative. Deprecated modules are a security risk.",
      severity: "warn",
      from: {},
      to: {
        dependencyTypes: ["deprecated"],
      },
    },
    {
      name: "no-non-package-json",
      severity: "error",
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
        "That's problematic as the package either (1) won't be available on live (2 - worse) will be " +
        "available on live with an non-guaranteed version. Fix it by adding the package to the dependencies " +
        "in your package.json.",
      from: {},
      to: {
        dependencyTypes: ["npm-no-pkg", "npm-unknown"],
      },
    },
    {
      name: "not-to-unresolvable",
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
        "module: add it to your package.json. In all other cases you likely already know what to do.",
      severity: "error",
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: "no-duplicate-dep-types",
      comment:
        "Likeley this module depends on an external ('npm') package that occurs more than once " +
        "in your package.json i.e. both in dependencies and in devDependencies. This will cause " +
        "maintenance problems later on.",
      severity: "warn",
      from: {},
      to: {
        moreThanOneDependencyType: true,
        // as it's pretty common to have a type import be a type only import
        // _and_ (e.g.) a devDependency - don't consider type-only dependencies
        // when detecting this problem
        dependencyTypesNot: ["type-only"],
      },
    },

    /* Architecture rules */
    {
      name: "route-to-handler-only",
      comment: "Routes should only import handlers, schemas, and contracts",
      severity: "error",
      from: {
        path: String.raw`^src/modules/.*/.*\.router\.v[0-9]+\.js$`,
      },
      to: {
        pathNot: [String.raw`^src/modules/.*/.*\.(handler|schemas|contracts|events)\.js$`, "^src/libs/", "^node_modules/"],
      },
    },
    {
      name: "handler-to-domain-or-repository",
      comment: "Handlers should only import domain services, repositories, queries, mutations, and libraries",
      severity: "error",
      from: {
        path: String.raw`^src/modules/.*/.*\.handler\.js$`,
      },
      to: {
        pathNot: [
          String.raw`^src/modules/.*/.*\.(domain|repository|queries|mutations|contracts|events)\.js$`,
          "^src/libs/",
          "^node_modules/",
        ],
      },
    },
    {
      name: "no-repository-in-routes",
      comment: "Routes should not directly import repositories",
      severity: "error",
      from: {
        path: String.raw`^src/modules/.*/.*\.router\.v[0-9]+\.js$`,
      },
      to: {
        path: String.raw`^src/modules/.*/.*\.repository\.js$`,
      },
    },
    {
      name: "no-cross-module-imports",
      comment:
        "Modules should not directly import from other modules. Use events or create public interfaces (queries/commands)",
      severity: "error",
      from: {
        path: "^src/modules/([^/]+)/",
      },
      to: {
        path: "^src/modules/(?!$1/)([^/]+)/",
        pathNot: String.raw`^src/modules/[^/]+/.*\.(events|contracts|model)\.js$`,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/(@[^/]+/[^/]+|[^/]+)",
      },
      archi: {
        collapsePattern: "^(node_modules/(@[^/]+/[^/]+|[^/]+)|src/[^/]+)/",
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
