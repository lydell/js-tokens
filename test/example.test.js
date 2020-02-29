"use strict";

const { default: jsTokens } = require("../");

test("switch", () => {
  function token(match) {
    const value = match[0];

    switch (value) {
      case match.groups.StringLiteral:
        return {
          type: "StringLiteral",
          value,
          closed: match.groups.StringLiteralEnd !== undefined,
        };

      case match.groups.Template:
        return {
          type: "Template",
          value,
          closed: match.groups.TemplateEnd !== undefined,
        };

      case match.groups.MultiLineComment:
        return {
          type: "MultiLineComment",
          value,
          closed: match.groups.MultiLineCommentEnd !== undefined,
        };

      case match.groups.SingleLineComment:
        return { type: "SingleLineComment", value };

      case match.groups.RegularExpressionLiteral:
        return { type: "RegularExpressionLiteral", value };

      case match.groups.NumericLiteral:
        return { type: "NumericLiteral", value };

      case match.groups.IdentifierName:
        return { type: "IdentifierName", value };

      case match.groups.Punctuator:
        return { type: "Punctuator", value };

      case match.groups.WhiteSpace:
        return { type: "WhiteSpace", value };

      case match.groups.LineTerminatorSequence:
        return { type: "LineTerminatorSequence", value };

      case match.groups.Invalid:
        return { type: "Invalid", value };

      default:
        throw new Error("Should never be reached");
    }
  }

  const code = 'console.log("", ``, /**/, /./, 0x1Fn) //\r\n#\'';

  const tokens = Array.from(code.matchAll(jsTokens)).map(token);

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
        "closed": true,
        "type": "Template",
        "value": "\`\`",
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
        "type": "Punctuator",
        "value": ",",
      },
      Object {
        "type": "WhiteSpace",
        "value": " ",
      },
      Object {
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
