"use strict";

const { default: jsTokens } = require("../");

describe("Template", () => {
  test("Complex", () => {
    expect(
      Array.from(
        jsTokens(
          "`a${}${a}${ `${b\r}` + `${`c${5}`}` } d $${\n(x=>{return x*2})(4)}$`"
        )
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "TemplateHead",
          "value": "\`a\${",
        },
        Object {
          "type": "TemplateMiddle",
          "value": "}\${",
        },
        Object {
          "type": "IdentifierName",
          "value": "a",
        },
        Object {
          "type": "TemplateMiddle",
          "value": "}\${",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "TemplateHead",
          "value": "\`\${",
        },
        Object {
          "type": "IdentifierName",
          "value": "b",
        },
        Object {
          "type": "LineTerminatorSequence",
          "value": "
      ",
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
          "value": "+",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "TemplateHead",
          "value": "\`\${",
        },
        Object {
          "type": "TemplateHead",
          "value": "\`c\${",
        },
        Object {
          "type": "NumericLiteral",
          "value": "5",
        },
        Object {
          "closed": true,
          "type": "TemplateTail",
          "value": "}\`",
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
          "type": "TemplateMiddle",
          "value": "} d $\${",
        },
        Object {
          "type": "LineTerminatorSequence",
          "value": "
      ",
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
          "value": "=>",
        },
        Object {
          "type": "Punctuator",
          "value": "{",
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
          "value": "x",
        },
        Object {
          "type": "Punctuator",
          "value": "*",
        },
        Object {
          "type": "NumericLiteral",
          "value": "2",
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
          "type": "NumericLiteral",
          "value": "4",
        },
        Object {
          "type": "Punctuator",
          "value": ")",
        },
        Object {
          "closed": true,
          "type": "TemplateTail",
          "value": "}$\`",
        },
      ]
    `);
  });

  test("Unclosed", () => {
    expect(Array.from(jsTokens("`a ${b c`.length"))).toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "TemplateHead",
          "value": "\`a \${",
        },
        Object {
          "type": "IdentifierName",
          "value": "b",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "IdentifierName",
          "value": "c",
        },
        Object {
          "closed": false,
          "type": "NoSubstitutionTemplate",
          "value": "\`.length",
        },
      ]
    `);
  });

  test("Unclosed nested", () => {
    expect(Array.from(jsTokens("`a ${`b${c`} d`.length")))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "TemplateHead",
          "value": "\`a \${",
        },
        Object {
          "type": "TemplateHead",
          "value": "\`b\${",
        },
        Object {
          "type": "IdentifierName",
          "value": "c",
        },
        Object {
          "closed": true,
          "type": "NoSubstitutionTemplate",
          "value": "\`} d\`",
        },
        Object {
          "type": "Punctuator",
          "value": ".",
        },
        Object {
          "type": "IdentifierName",
          "value": "length",
        },
      ]
    `);
  });

  test("Unclosed with object literal", () => {
    expect(Array.from(jsTokens("`a ${ {c:d } e`.length")))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "type": "TemplateHead",
          "value": "\`a \${",
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
          "type": "IdentifierName",
          "value": "c",
        },
        Object {
          "type": "Punctuator",
          "value": ":",
        },
        Object {
          "type": "IdentifierName",
          "value": "d",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "Punctuator",
          "value": "}",
        },
        Object {
          "type": "WhiteSpace",
          "value": " ",
        },
        Object {
          "type": "IdentifierName",
          "value": "e",
        },
        Object {
          "closed": false,
          "type": "NoSubstitutionTemplate",
          "value": "\`.length",
        },
      ]
    `);
  });
});
