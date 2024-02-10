import { test, expect } from "vitest";
import jsTokens from "../build/index.js";

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
    [
      {
        "type": "IdentifierName",
        "value": "if",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "WhiteSpace",
        "value": "    ",
      },
      {
        "type": "TemplateHead",
        "value": "\`\${",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "WhiteSpace",
        "value": "        ",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "type": "Punctuator",
        "value": ")",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "Punctuator",
        "value": "=>",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "Punctuator",
        "value": "{",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "WhiteSpace",
        "value": "            ",
      },
      {
        "type": "IdentifierName",
        "value": "if",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "type": "IdentifierName",
        "value": "x",
      },
      {
        "type": "Punctuator",
        "value": ")",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "closed": true,
        "type": "RegularExpressionLiteral",
        "value": "/r/i",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "WhiteSpace",
        "value": "            ",
      },
      {
        "type": "IdentifierName",
        "value": "return",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "IdentifierName",
        "value": "Math",
      },
      {
        "type": "Punctuator",
        "value": ".",
      },
      {
        "type": "IdentifierName",
        "value": "random",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "type": "Punctuator",
        "value": ")",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "WhiteSpace",
        "value": "        ",
      },
      {
        "type": "Punctuator",
        "value": "}",
      },
      {
        "type": "Punctuator",
        "value": ")",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "type": "Punctuator",
        "value": ")",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "WhiteSpace",
        "value": "    ",
      },
      {
        "closed": true,
        "type": "TemplateTail",
        "value": "}\`",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "Punctuator",
        "value": ">",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "NumericLiteral",
        "value": "0.5",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "Punctuator",
        "value": ")",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "closed": true,
        "type": "RegularExpressionLiteral",
        "value": "/a/g",
      },
    ]
  `);
});
