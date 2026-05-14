import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import securityPlugin from "eslint-plugin-security";
import nodePlugin from "eslint-plugin-n";
import prettier from "eslint-config-prettier";

import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],

      ignores: ["dist/**", "node_modules/**", "coverage/**", "src/__tests__/**", "jest.config.ts"],    plugins: {
      import: importPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      n: nodePlugin,
    },

    languageOptions: {
      globals: globals.node,

      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      
    },

    rules: {
      /*
       |--------------------------------------------------------------------------
       | Possible Bugs
       |--------------------------------------------------------------------------
       */

      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-debugger": "error",

      eqeqeq: ["error", "always"],

      curly: ["error", "all"],

      /*
       |--------------------------------------------------------------------------
       | TypeScript
       |--------------------------------------------------------------------------
       */

      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/consistent-type-imports": "warn",

      "@typescript-eslint/no-floating-promises": "error",

      "@typescript-eslint/no-misused-promises": "error",

      /*
       |--------------------------------------------------------------------------
       | Promise Safety
       |--------------------------------------------------------------------------
       */

      "promise/always-return": "error",

      "promise/no-return-wrap": "error",

      "promise/catch-or-return": "error",

      /*
       |--------------------------------------------------------------------------
       | Imports
       |--------------------------------------------------------------------------
       */

      "import/order": [
        "warn",
        {
          alphabetize: {
            order: "asc",
          },

          "newlines-between": "always",

          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
        },
      ],

      "import/no-duplicates": "error",

      /*
       |--------------------------------------------------------------------------
       | Security
       |--------------------------------------------------------------------------
       */

      "security/detect-eval-with-expression": "error",

      "security/detect-child-process": "warn",

      "security/detect-non-literal-fs-filename": "warn",

      /*
       |--------------------------------------------------------------------------
       | Node.js
       |--------------------------------------------------------------------------
       */

      "n/no-process-exit": "warn",

      "n/no-deprecated-api": "error",

      /*
       |--------------------------------------------------------------------------
       | Maintainability
       |--------------------------------------------------------------------------
       */

      complexity: ["warn", 15],

      "max-depth": ["warn", 4],

      /*
       |--------------------------------------------------------------------------
       | Logging
       |--------------------------------------------------------------------------
       */

      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | Style
       |--------------------------------------------------------------------------
       */

      semi: ["error", "always"],

      quotes: ["error", "double"],
    },
  },

  prettier,
]);