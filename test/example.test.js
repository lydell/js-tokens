"use strict";

const jsTokens = require("../build/index");

test("all tokens", () => {
  const code =
    'console.log("", ``, `a${1}b${this.#private}`, /**/ /./, 0x1Fn) //\r\n#\'';

  const tokens = Array.from(jsTokens(code));

  expect(tokens).toMatchInlineSnapshot(`
    [
      {
        "type": "IdentifierName",
        "value": "console",
      },
      {
        "type": "Punctuator",
        "value": ".",
      },
      {
        "type": "IdentifierName",
        "value": "log",
      },
      {
        "type": "Punctuator",
        "value": "(",
      },
      {
        "closed": true,
        "type": "StringLiteral",
        "value": """",
      },
      {
        "type": "Punctuator",
        "value": ",",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "closed": true,
        "type": "NoSubstitutionTemplate",
        "value": "\`\`",
      },
      {
        "type": "Punctuator",
        "value": ",",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "TemplateHead",
        "value": "\`a\${",
      },
      {
        "type": "NumericLiteral",
        "value": "1",
      },
      {
        "type": "TemplateMiddle",
        "value": "}b\${",
      },
      {
        "type": "IdentifierName",
        "value": "this",
      },
      {
        "type": "Punctuator",
        "value": ".",
      },
      {
        "type": "PrivateIdentifier",
        "value": "#private",
      },
      {
        "closed": true,
        "type": "TemplateTail",
        "value": "}\`",
      },
      {
        "type": "Punctuator",
        "value": ",",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "closed": true,
        "type": "MultiLineComment",
        "value": "/**/",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "closed": true,
        "type": "RegularExpressionLiteral",
        "value": "/./",
      },
      {
        "type": "Punctuator",
        "value": ",",
      },
      {
        "type": "WhiteSpace",
        "value": " ",
      },
      {
        "type": "NumericLiteral",
        "value": "0x1Fn",
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
        "type": "SingleLineComment",
        "value": "//",
      },
      {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      {
        "type": "Invalid",
        "value": "#",
      },
      {
        "closed": false,
        "type": "StringLiteral",
        "value": "'",
      },
    ]
  `);
});
