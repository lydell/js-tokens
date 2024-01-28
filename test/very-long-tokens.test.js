"use strict";

const jsTokens = require("../build/index");

function run(input) {
  const types = Array.from(jsTokens(input), (token) => token.type);
  expect(types).toHaveLength(1);
  return types[0];
}

const LARGE = 1e7;

// See https://github.com/lydell/js-tokens/issues/42
// The regex engine can throw `Maximum call stack size exceeded` when
// the input is too long for certain regex features. At the time of writing,
// `(?:a|b)+` threw an error, while `[ab]+` did not. js-tokens uses alternation
// a lot to match things like “ordinary content OR escape”. The workaround is to
// add an unnecessary-looking `+` _inside_ the alternation (for “ordinary content”)
// to optimize the common case.

describe("Very long tokens", () => {
  describe("RegularExpressionLiteral", () => {
    test("basic", () => {
      expect(run(`/${"a".repeat(LARGE)}/`)).toBe("RegularExpressionLiteral");
    });

    test("character class", () => {
      expect(run(`/[${"a".repeat(LARGE)}]/`)).toBe("RegularExpressionLiteral");
    });

    test("flags", () => {
      expect(run(`/a/${"g".repeat(LARGE)}`)).toBe("RegularExpressionLiteral");
    });
  });

  test("IdentifierName", () => {
    expect(run("a".repeat(LARGE))).toBe("IdentifierName");
  });

  test("PrivateIdentifier", () => {
    expect(run(`#${"a".repeat(LARGE)}`)).toBe("PrivateIdentifier");
  });

  describe("StringLiteral", () => {
    test("single quote", () => {
      expect(run(`'${"a".repeat(LARGE)}'`)).toBe("StringLiteral");
    });

    test("double quote", () => {
      expect(run(`"${"a".repeat(LARGE)}"`)).toBe("StringLiteral");
    });
  });

  describe("Template", () => {
    test("NoSubstitutionTemplate", () => {
      expect(run(`\`${"a".repeat(LARGE)}\``)).toBe("NoSubstitutionTemplate");
    });

    test("TemplateHead + TemplateMiddle + TemplateTail", () => {
      expect(
        Array.from(
          jsTokens(
            `\`${"a".repeat(LARGE)}\${0}${"a".repeat(LARGE)}\${0}${"a".repeat(
              LARGE
            )}\``
          ),

          (token) => token.type
        )
      ).toMatchInlineSnapshot(`
        [
          "TemplateHead",
          "NumericLiteral",
          "TemplateMiddle",
          "NumericLiteral",
          "TemplateTail",
        ]
      `);
    });
  });

  test("WhiteSpace", () => {
    expect(run(" ".repeat(LARGE))).toBe("WhiteSpace");
  });

  test("MultiLineComment", () => {
    expect(run(`/*${"a".repeat(LARGE)}*/`)).toBe("MultiLineComment");
  });

  test("SingleLineComment", () => {
    expect(run(`//${"a".repeat(LARGE)}`)).toBe("SingleLineComment");
  });

  test("JSX", () => {
    expect(
      Array.from(
        jsTokens(
          `<${"a".repeat(LARGE)} ${"a".repeat(LARGE)}="${"a".repeat(
            LARGE
          )}">${"a".repeat(LARGE)}`,
          { jsx: true }
        ),
        (token) => token.type
      )
    ).toMatchInlineSnapshot(`
      [
        "JSXPunctuator",
        "JSXIdentifier",
        "WhiteSpace",
        "JSXIdentifier",
        "JSXPunctuator",
        "JSXString",
        "JSXPunctuator",
        "JSXText",
      ]
    `);
  });
});
