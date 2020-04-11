"use strict";

const jsTokens = require("../build/index");

const jsxTokens = (input) => Array.from(jsTokens(input, { jsx: true }));

describe("JSX", () => {
  test("stray end tag does not blow up", () => {
    expect(jsxTokens("x=</div>\ncode")).toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "IdentifierName",
          "value": "x",
        },
        Object {
          "type": "Punctuator",
          "value": "=",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "<",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "/",
        },
        Object {
          "type": "JSXIdentifier",
          "value": "div",
        },
        Object {
          "type": "JSXPunctuator",
          "value": ">",
        },
        Object {
          "type": "LineTerminatorSequence",
          "value": "
      ",
        },
        Object {
          "type": "IdentifierName",
          "value": "code",
        },
      ]
    `);
  });
});
