"use strict";

const { default: jsTokens } = require("../package/index");

test("switch", () => {
  const code = 'console.log("", `a${1}b${2}`, /**/ /./, 0x1Fn) //\r\n#\'';

  const tokens = Array.from(jsTokens(code));

  expect(tokens).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "IdentifierName",
        "value": "console",
      },
      Object {
        "type": "Punctuator",
        "value": ".",
      },
      Object {
        "type": "IdentifierName",
        "value": "log",
      },
      Object {
        "type": "Punctuator",
        "value": "(",
      },
      Object {
        "closed": true,
        "type": "StringLiteral",
        "value": "\\"\\"",
      },
      Object {
        "type": "Punctuator",
        "value": ",",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "TemplateHead",
        "value": "\`a\${",
      },
      Object {
        "type": "NumericLiteral",
        "value": "1",
      },
      Object {
        "type": "TemplateMiddle",
        "value": "}b\${",
      },
      Object {
        "type": "NumericLiteral",
        "value": "2",
      },
      Object {
        "closed": true,
        "type": "TemplateTail",
        "value": "}\`",
      },
      Object {
        "type": "Punctuator",
        "value": ",",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "closed": true,
        "type": "MultiLineComment",
        "value": "/**/",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "closed": true,
        "type": "RegularExpressionLiteral",
        "value": "/./",
      },
      Object {
        "type": "Punctuator",
        "value": ",",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
        "type": "NumericLiteral",
        "value": "0x1Fn",
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
        "type": "SingleLineComment",
        "value": "//",
      },
      Object {
        "type": "LineTerminatorSequence",
        "value": "
    ",
      },
      Object {
        "type": "Invalid",
        "value": "#",
      },
      Object {
        "closed": false,
        "type": "StringLiteral",
        "value": "'",
      },
    ]
  `);
});
