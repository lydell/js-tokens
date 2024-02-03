"use strict";

module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:vitest/recommended"],
  plugins: ["vitest"],
  parserOptions: {
    ecmaVersion: 2016,
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    "arrow-body-style": "error",
    curly: "error",
    "dot-notation": "error",
    "no-shadow": "error",
    "no-var": "error",
    "prefer-const": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-arrow-callback": "error",
    "prefer-destructuring": ["error", { array: false, object: true }],
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
    strict: "error",
    "vitest/no-disabled-tests": "error",
    "vitest/no-focused-tests": "error",
    "vitest/valid-title": "off",
  },
  overrides: [
    {
      files: ["test/*.js", "*.mjs"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
};
