import { describe, test, expect } from "vitest";
import jsTokens from "../build/index.js";

describe("Template", () => {
  test("Complex", () => {
    expect(
      Array.from(
        jsTokens(
          "`a${}${a}${ `${b\r}` + `${`c${5}`}` } d $${\n(x=>{return x*2})(4)}$`"
        )
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "type": "TemplateHead",
          "value": "\`a\${",
        },
        {
          "type": "TemplateMiddle",
          "value": "}\${",
        },
        {
          "type": "IdentifierName",
          "value": "a",
        },
        {
          "type": "TemplateMiddle",
          "value": "}\${",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "TemplateHead",
          "value": "\`\${",
        },
        {
          "type": "IdentifierName",
          "value": "b",
        },
        {
          "type": "LineTerminatorSequence",
          "value": "
      ",
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
          "value": "+",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "TemplateHead",
          "value": "\`\${",
        },
        {
          "type": "TemplateHead",
          "value": "\`c\${",
        },
        {
          "type": "NumericLiteral",
          "value": "5",
        },
        {
          "closed": true,
          "type": "TemplateTail",
          "value": "}\`",
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
          "type": "TemplateMiddle",
          "value": "} d $\${",
        },
        {
          "type": "LineTerminatorSequence",
          "value": "
      ",
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
          "value": "=>",
        },
        {
          "type": "Punctuator",
          "value": "{",
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
          "value": "x",
        },
        {
          "type": "Punctuator",
          "value": "*",
        },
        {
          "type": "NumericLiteral",
          "value": "2",
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
          "type": "NumericLiteral",
          "value": "4",
        },
        {
          "type": "Punctuator",
          "value": ")",
        },
        {
          "closed": true,
          "type": "TemplateTail",
          "value": "}$\`",
        },
      ]
    `);
  });

  test("Unclosed", () => {
    expect(Array.from(jsTokens("`a ${b c`.length"))).toMatchInlineSnapshot(`
      [
        {
          "type": "TemplateHead",
          "value": "\`a \${",
        },
        {
          "type": "IdentifierName",
          "value": "b",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "IdentifierName",
          "value": "c",
        },
        {
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
      [
        {
          "type": "TemplateHead",
          "value": "\`a \${",
        },
        {
          "type": "TemplateHead",
          "value": "\`b\${",
        },
        {
          "type": "IdentifierName",
          "value": "c",
        },
        {
          "closed": true,
          "type": "NoSubstitutionTemplate",
          "value": "\`} d\`",
        },
        {
          "type": "Punctuator",
          "value": ".",
        },
        {
          "type": "IdentifierName",
          "value": "length",
        },
      ]
    `);
  });

  test("Unclosed with object literal", () => {
    expect(Array.from(jsTokens("`a ${ {c:d } e`.length")))
      .toMatchInlineSnapshot(`
      [
        {
          "type": "TemplateHead",
          "value": "\`a \${",
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
          "type": "IdentifierName",
          "value": "c",
        },
        {
          "type": "Punctuator",
          "value": ":",
        },
        {
          "type": "IdentifierName",
          "value": "d",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "Punctuator",
          "value": "}",
        },
        {
          "type": "WhiteSpace",
          "value": " ",
        },
        {
          "type": "IdentifierName",
          "value": "e",
        },
        {
          "closed": false,
          "type": "NoSubstitutionTemplate",
          "value": "\`.length",
        },
      ]
    `);
  });

  test("Invalid inside interpolation", () => {
    expect(Array.from(jsTokens("`${💩}`"))).toMatchInlineSnapshot(`
      [
        {
          "type": "TemplateHead",
          "value": "\`\${",
        },
        {
          "type": "Invalid",
          "value": "💩",
        },
        {
          "closed": true,
          "type": "TemplateTail",
          "value": "}\`",
        },
      ]
    `);
  });
});
