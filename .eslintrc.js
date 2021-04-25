"use strict";

module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
  ],
  plugins: ["jest"],
  parserOptions: {
    ecmaVersion: 2016,
  },
  env: {
    es6: true,
    node: true,
    "jest/globals": true,
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
    "jest/no-conditional-expect": "off",
    "jest/valid-title": "off",
  },
};
