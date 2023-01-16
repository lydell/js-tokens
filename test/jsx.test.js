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
      [
        {
          "type": "JSXPunctuator",
          "value": "<",
        },
        {
          "type": "JSXIdentifier",
          "value": "A",
        },
        {
          "type": "JSXPunctuator",
          "value": ".",
        },
        {
          "type": "JSXIdentifier",
          "value": "a",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "JSXIdentifier",
          "value": "href",
        },
        {
          "type": "JSXPunctuator",
          "value": "=",
        },
        {
          "closed": true,
          "type": "JSXString",
          "value": ""/"",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "JSXInvalid",
          "value": "-",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "JSXPunctuator",
          "value": "{",
        },
        {
          "type": "Punctuator",
          "value": "...",
        },
        {
          "type": "IdentifierName",
          "value": "props",
        },
        {
          "type": "JSXPunctuator",
          "value": "}",
        },
        {
          "type": "JSXPunctuator",
          "value": ">",
        },
        {
          "type": "JSXText",
          "value": "
        Hello, ",
        },
        {
          "type": "JSXPunctuator",
          "value": "{",
        },
        {
          "closed": true,
          "type": "StringLiteral",
          "value": ""world"",
        },
        {
          "type": "JSXPunctuator",
          "value": "}",
        },
        {
          "type": "JSXText",
          "value": "!
      ",
        },
        {
          "type": "JSXPunctuator",
          "value": "<",
        },
        {
          "type": "JSXPunctuator",
          "value": "/",
        },
        {
          "type": "JSXIdentifier",
          "value": "A",
        },
        {
          "type": "JSXPunctuator",
          "value": ".",
        },
        {
          "type": "JSXIdentifier",
          "value": "a",
        },
        {
          "type": "JSXPunctuator",
          "value": ">",
        },
      ]
    `);
  });

  test("stray end tag does not blow up", () => {
    expect(jsxTokens("x=</div>\ncode")).toMatchInlineSnapshot(`
      [
        {
          "type": "IdentifierName",
          "value": "x",
        },
        {
          "type": "Punctuator",
          "value": "=",
        },
        {
          "type": "JSXPunctuator",
          "value": "<",
        },
        {
          "type": "JSXPunctuator",
          "value": "/",
        },
        {
          "type": "JSXIdentifier",
          "value": "div",
        },
        {
          "type": "JSXPunctuator",
          "value": ">",
        },
        {
          "type": "LineTerminatorSequence",
          "value": "
      ",
        },
        {
          "type": "IdentifierName",
          "value": "code",
        },
      ]
    `);
  });

  test("Invalid inside interpolation", () => {
    expect(jsxTokens("<>{💩}</>")).toMatchInlineSnapshot(`
      [
        {
          "type": "JSXPunctuator",
          "value": "<",
        },
        {
          "type": "JSXPunctuator",
          "value": ">",
        },
        {
          "type": "JSXPunctuator",
          "value": "{",
        },
        {
          "type": "Invalid",
          "value": "💩",
        },
        {
          "type": "JSXPunctuator",
          "value": "}",
        },
        {
          "type": "JSXPunctuator",
          "value": "<",
        },
        {
          "type": "JSXPunctuator",
          "value": "/",
        },
        {
          "type": "JSXPunctuator",
          "value": ">",
        },
      ]
    `);
  });
});
