"use strict";

const jsTokens = require("../build/index");

const jsxTokens = (input) => Array.from(jsTokens(input, { jsx: true }));

const example = `
<A.a href="/" - {...props}>
  Hello, {"world"}!
</A.a>
`.trim();

describe("JSX", () => {
  test("token types", () => {
    expect(jsxTokens(example)).toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "JSXPunctuator",
          "value": "<",
        },
        Object {
          "type": "JSXIdentifier",
          "value": "A",
        },
        Object {
          "type": "JSXPunctuator",
          "value": ".",
        },
        Object {
          "type": "JSXIdentifier",
          "value": "a",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "JSXIdentifier",
          "value": "href",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "=",
        },
        Object {
          "closed": true,
          "type": "JSXString",
          "value": "\\"/\\"",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "JSXInvalid",
          "value": "-",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "{",
        },
        Object {
          "type": "Punctuator",
          "value": "...",
        },
        Object {
          "type": "IdentifierName",
          "value": "props",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "}",
        },
        Object {
          "type": "JSXPunctuator",
          "value": ">",
        },
        Object {
          "type": "JSXText",
          "value": "
        Hello, ",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "{",
        },
        Object {
          "closed": true,
          "type": "StringLiteral",
          "value": "\\"world\\"",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "}",
        },
        Object {
          "type": "JSXText",
          "value": "!
      ",
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
          "value": "A",
        },
        Object {
          "type": "JSXPunctuator",
          "value": ".",
        },
        Object {
          "type": "JSXIdentifier",
          "value": "a",
        },
        Object {
          "type": "JSXPunctuator",
          "value": ">",
        },
      ]
    `);
  });

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

  test("Invalid inside interpolation", () => {
    expect(jsxTokens("<>{💩}</>")).toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "JSXPunctuator",
          "value": "<",
        },
        Object {
          "type": "JSXPunctuator",
          "value": ">",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "{",
        },
        Object {
          "type": "Invalid",
          "value": "💩",
        },
        Object {
          "type": "JSXPunctuator",
          "value": "}",
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
          "type": "JSXPunctuator",
          "value": ">",
        },
      ]
    `);
  });
});
