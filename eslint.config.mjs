// eslint.config.mjs
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import pluginSecurity from 'eslint-plugin-security';
import noSecrets from 'eslint-plugin-no-secrets';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

/**
 * Flat ESLint configuration for Node.js project
 * Based on ESLint 9 flat config format
 */
export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'types/**',
      '*.min.js',
      'public/**',
      'storage/**',
      'infra/docker/pgadmin/**',
      'tools/**',
      'pnpm-lock.yaml',
      'package-lock.json',
      'eslint.config.mjs',
      '.git/**',
      '.DS_Store',
      '.vscode/**',
      '.idea/**',
    ],
  },

  // Perfectionist alphabetical sorting
  perfectionist.configs['recommended-alphabetical'],

  // Base recommended ESLint configuration
  eslint.configs.recommended,

  // TypeScript recommended configuration (without type checking)
  ...tseslint.configs.recommended,

  // Prettier recommended configuration
  eslintPluginPrettierRecommended,

  // Security plugin recommended configuration
  pluginSecurity.configs.recommended,

  // Import plugin flat configuration
  importPlugin.flatConfigs.recommended,

  // Unicorn plugin configuration
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      ...eslintPluginUnicorn.configs.recommended.rules,
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [/^[A-Z]/, /\.d\.ts$/],
        },
      ],
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-top-level-await': 'error',
      'unicorn/no-process-exit': 'off',
    },
  },

  // No-secrets plugin for JS files (excluding contracts and configs)
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ignores: ['**/*.contracts.js', '**/*.config.{js,cjs,mjs}', '**/configs/**/*.js'],
    plugins: {
      'no-secrets': noSecrets,
    },
    rules: {
      'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
    },
  },

  // Main configuration
  {
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.node,
        ...globals.es2022,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        'eslint-import-resolver-custom-alias': {
          alias: {
            '@types': './src/@types',
            '#configs': './src/configs',
            '#infra': './src/infra',
            '#libs': './src/libs',
            '#modules': './src/modules',
            '#tests': './tests',
          },
          extensions: ['.js', '.cjs', '.mjs', '.ts', '.d.ts'],
        },
      },
    },
    rules: {
      // Base rules
      'no-console': 'error',
      'func-names': 'error',
      'no-process-exit': 'off',
      'class-methods-use-this': 'off',
      'new-cap': 'off',
      'complexity': ['error', 15],
      'max-params': ['error', 5],
      'no-nested-ternary': 'error',
      'quote-props': ['error', 'as-needed'],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Import rules
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/no-namespace': 'off',
      'import/no-commonjs': 'off',
      'import/prefer-default-export': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '#*',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '#tests/*',
              group: 'internal',
              position: 'after',
            },
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],

      // Security rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // Perfectionist rules
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-decorator': 'off',
      'perfectionist/sort-objects': 'off',

      // Unicorn additional rules
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-immediate-mutation': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',

      // TypeScript rules
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Other rules
      'no-constant-binary-expression': 'off',
    },
  },

  // Override for config files
  {
    files: ['**/*.config.{js,cjs,mjs}', '**/configs/**/*.js', '**/*.cjs'],
    rules: {
      'no-secrets/no-secrets': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'unicorn/import-style': 'off',
    },
  },

  // Override for .d.ts files
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Override for TypeScript contract files
  {
    files: ['**/*.contracts.js', '**/*.contracts.ts'],
    rules: {
      'no-secrets/no-secrets': 'off',
    },
  },

  // Override for main entry point
  {
    files: ['src/index.js'],
    rules: {
      'unicorn/consistent-function-scoping': 'off',
    },
  },

  // Override for generators
  {
    files: ['tools/generators/**/*.js'],
    rules: {
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
    },
  },

  // Override for JSDoc type definition files
  // Imports are used in JSDoc via typeof, so they should not be flagged as unused
  {
    files: ['**/*.jsdoc.js', 'src/@types/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unicorn/require-module-specifiers': 'off', // Allow export {} for type-only files
    },
  },

  // Override for router files - handler should be last
  // Using partitionByNewLine to keep handler in separate group (after newline)
  {
    files: ['**/*.router*.js', '**/router.js'],
    rules: {
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          partitionByNewLine: true,
        },
      ],
    },
  },

  // TypeScript files with type checking (only for .ts files, not .d.ts)
  {
    files: ['**/*.ts'],
    ignores: ['**/*.d.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
);

