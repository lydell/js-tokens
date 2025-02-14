import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: [
      "build",
      "coverage",
      "test/fixtures",
      "benchmark.input.js",
      "test.*",
    ],
  },
  {
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...vitest.configs.recommended.rules,
      "arrow-body-style": "error",
      curly: "error",
      "dot-notation": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-shadow": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "SequenceExpression",
          message:
            "The comma operator is confusing and a common mistake. Don’t use it!",
        },
      ],
      "no-var": "error",
      "object-shorthand": "error",
      "one-var": ["error", "never"],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-destructuring": ["error", { object: true, array: false }],
      "prefer-exponentiation-operator": "error",
      "prefer-numeric-literals": "error",
      "prefer-object-spread": "error",
      "prefer-promise-reject-errors": "error",
      "prefer-regex-literals": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "prefer-template": "error",
      "vitest/no-disabled-tests": "error",
      "vitest/no-focused-tests": "error",
      "vitest/valid-title": "off",
    },
  },
];
