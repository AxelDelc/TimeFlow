import globals from "globals";
import { defineConfig } from "eslint/config";
import pluginSvelte from "eslint-plugin-svelte";
import configPrettier from "eslint-config-prettier";

export default defineConfig([
  // Fichiers ignorés
  {
    ignores: ["public/dist/**", "node_modules/**"],
  },

  // Backend Node.js (CJS)
  {
    files: ["src/**/*.js"],
    ignores: ["src/frontend/**"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "eqeqeq": ["error", "always"],
    },
  },

  // Frontend (ESM, bundlé par Vite)
  {
    files: ["src/frontend/**/*.js"],
    languageOptions: {
      globals: globals.browser,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },

  // Composants Svelte
  ...pluginSvelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": ["warn", { varsIgnorePattern: "^\\$", argsIgnorePattern: "^_" }],
      // Svelte 5 : les clés dans {#each} ne sont pas obligatoires
      "svelte/require-each-key": "off",
    },
  },

  // Tests unitaires (CJS + globals Vitest)
  {
    files: ["tests/unit/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        vi: false,
        describe: false,
        it: false,
        expect: false,
        beforeEach: false,
        afterEach: false,
        beforeAll: false,
        afterAll: false,
      },
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // Tests e2e Playwright (ESM)
  {
    files: ["tests/**/*.spec.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      sourceType: "module",
    },
  },

  // Fichiers de configuration (ESM)
  {
    files: ["*.mjs"],
    languageOptions: {
      globals: globals.node,
      sourceType: "module",
    },
  },

  // Désactive les règles ESLint qui conflictuent avec Prettier (toujours en dernier)
  configPrettier,
]);