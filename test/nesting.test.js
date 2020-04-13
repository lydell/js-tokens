"use strict";

const jsTokens = require("../build/index");

const ifInIf = `
if (
    \`\${
        (() => {
            if (x) /r/i
            return Math.random()
        })()
    }\` > 0.5
) /a/g
`.trim();

test("if-statement nested inside if-condition", () => {
  expect(Array.from(jsTokens(ifInIf))).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "IdentifierName",
        "value": "if",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "WhiteSpace",
        "value": "    ",
      },
      Object {
        "type": "TemplateHead",
        "value": "\`\${",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "WhiteSpace",
        "value": "        ",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "type": "Punctuator",
        "value": ")",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "Punctuator",
        "value": "=>",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "Punctuator",
        "value": "{",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "WhiteSpace",
        "value": "            ",
      },
      Object {
        "type": "IdentifierName",
        "value": "if",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "type": "IdentifierName",
        "value": "x",
      },
      Object {
        "type": "Punctuator",
        "value": ")",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "closed": true,
        "type": "RegularExpressionLiteral",
        "value": "/r/i",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "WhiteSpace",
        "value": "            ",
      },
      Object {
        "type": "IdentifierName",
        "value": "return",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "IdentifierName",
        "value": "Math",
      },
      Object {
        "type": "Punctuator",
        "value": ".",
      },
      Object {
        "type": "IdentifierName",
        "value": "random",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "type": "Punctuator",
        "value": ")",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "WhiteSpace",
        "value": "        ",
      },
      Object {
        "type": "Punctuator",
        "value": "}",
      },
      Object {
        "type": "Punctuator",
        "value": ")",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "type": "Punctuator",
        "value": ")",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "WhiteSpace",
        "value": "    ",
      },
      Object {
        "closed": true,
        "type": "TemplateTail",
        "value": "}\`",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "Punctuator",
        "value": ">",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "NumericLiteral",
        "value": "0.5",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "Punctuator",
        "value": ")",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "closed": true,
        "type": "RegularExpressionLiteral",
        "value": "/a/g",
      },
    ]
  `);
});
