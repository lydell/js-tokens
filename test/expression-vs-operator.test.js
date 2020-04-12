"use strict";

const jsTokens = require("../build/index");

const keywords1 = [
  "await",
  "case",
  "default",
  "delete",
  "do",
  "instanceof",
  "new",
  "typeof",
  "void",
].map((keyword) => ({
  tokens: [keyword],
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const keywords2 = ["return", "throw", "yield"].map((keyword) => ({
  tokens: [keyword],
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: false,
  canHavePostfixIncDec: false,
}));

const keywords3 = ["else"].map((keyword) => ({
  tokens: [keyword],
  expressionAfter: true,
  braceAfterIsExpression: false,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const nonKeywords = [...keywords1, ...keywords2, ...keywords3].map(
  ({ tokens: [keyword] }) => ({
    tokens: [`x${keyword}`],
    expressionAfter: false,
    braceAfterIsExpression: false,
    canHaveLineTerminatorAfter: true,
    canHavePostfixIncDec: true,
  })
);

const literals = [
  ['""'],
  ["''"],
  ["``"],
  ["`${", "x", "}`"],
  ["/a/g"],
  ["0"],
  ["<", "div", "/", ">"],
  ["<", "div", ">", "<", "/", "div", ">"],
].map((tokens) => ({
  tokens,
  expressionAfter: false,
  braceAfterIsExpression: false,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: true,
}));

const interpolations = [
  ["`${"],
  ["`${", "x", "}${"],
  ["<", "div", " ", "x", "=", "{"],
  ["<", ">", "{"],
].map((tokens) => ({
  tokens,
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const unaryOperators = [
  ["+"],
  ["-"],
  ["~"],
  ["!"],
  ["[", "..."],
  ["{", "..."],
  ["<", "div", " ", "{", "..."],
  ["<", ">", "{", "..."],
].map((tokens) => ({
  tokens,
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const binaryOperators = [
  "&&",
  "||",
  "??",
  "<",
  "<=",
  ">",
  ">=",
  "!=",
  "!==",
  "==",
  "===",
  "+",
  "-",
  "%",
  "&",
  "|",
  "^",
  "/",
  "*",
  "**",
  "<<",
  ">>",
  ">>>",
  ",",
].map((operator) => ({
  tokens: ["x", operator],
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const ternaryOperators = [
  ["x", "?"],
  ["x", "?", "y", ":"],
].map((tokens) => ({
  tokens,
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const assignmentOperators = [
  "=",
  "+=",
  "-=",
  "%=",
  "&=",
  "|=",
  "^=",
  "/=",
  "*=",
  "**=",
  "<<=",
  ">>=",
  ">>>=",
].map((operator) => ({
  tokens: ["x", operator],
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const nonExpressionParenKeywords = ["for", "if", "while", "with"];

const nonExpressionParenEnds = []
  .concat(
    ...nonExpressionParenKeywords.map((keyword) => [
      [keyword, "(", "x", ")"],
      [keyword, " ", "(", "x", ")"],
      [keyword, "\n", "(", "x", ")"],
      [keyword, "//comment", "\r\n", "/*\n*/", "(", "x", ")"],
      [
        keyword,
        "(",
        "x",
        "(",
        "(",
        "1",
        "/",
        "2",
        ")",
        "/",
        "3",
        ")",
        "+",
        "(",
        "4",
        "*",
        "5",
        ")",
        ")",
      ],
    ])
  )
  .map((tokens) => ({
    tokens,
    expressionAfter: true,
    braceAfterIsExpression: false,
    canHaveLineTerminatorAfter: true,
    canHavePostfixIncDec: false,
  }));

const expressionParenEnds = [
  ["(", "x", ")"],
  ...nonExpressionParenKeywords.map((keyword) => [
    `x${keyword}`,
    "(",
    "x",
    ")",
  ]),
  ...nonExpressionParenKeywords.map((keyword) => [
    "x",
    ".",
    keyword,
    "(",
    "x",
    ")",
  ]),
  ...nonExpressionParenKeywords.map((keyword) => [
    "x",
    "?.",
    keyword,
    "(",
    "x",
    ")",
  ]),
  [
    "(",
    "x",
    "(",
    "(",
    "1",
    "/",
    "2",
    ")",
    "/",
    "3",
    ")",
    "+",
    "(",
    "4",
    "*",
    "5",
    ")",
    ")",
  ],
].map((tokens) => ({
  tokens,
  expressionAfter: false,
  braceAfterIsExpression: false,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: true,
}));

const miscPunctuators1 = [["("], ["["]].map((tokens) => ({
  tokens,
  expressionAfter: true,
  braceAfterIsExpression: true,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const miscPunctuators2 = [
  ["[", "]"],
  ["x", "[", "x", "]"],
].map((tokens) => ({
  tokens,
  expressionAfter: false,
  braceAfterIsExpression: false,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: true,
}));

const miscPunctuators3 = [["{"], [";"]].map((tokens) => ({
  tokens,
  expressionAfter: true,
  braceAfterIsExpression: false,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
}));

const arrowPunctuator = {
  tokens: ["x", "=>"],
  expressionAfter: true,
  braceAfterIsExpression: false,
  canHaveLineTerminatorAfter: true,
  canHavePostfixIncDec: false,
};

const all = [
  ...keywords1,
  ...keywords2,
  ...keywords3,
  ...nonKeywords,
  ...literals,
  ...interpolations,
  ...unaryOperators,
  ...binaryOperators,
  ...ternaryOperators,
  ...assignmentOperators,
  ...nonExpressionParenEnds,
  ...expressionParenEnds,
  ...miscPunctuators1,
  ...miscPunctuators2,
  ...miscPunctuators3,
  arrowPunctuator,
];

/* eslint-disable jest/no-standalone-expect */
function run(code, expressionType) {
  describe(expressionType, () => {
    for (const variation of all) {
      check(variation.tokens, code, (token) => {
        expect(token.type).toBe(
          variation.expressionAfter ? expressionType : "Punctuator"
        );
      });

      check([...variation.tokens, "\n"], code, (token) => {
        expect(token.type).toBe(
          variation.canHaveLineTerminatorAfter
            ? variation.expressionAfter
              ? expressionType
              : "Punctuator"
            : expressionType
        );
      });

      for (const incDec of ["++", "--"]) {
        for (const incDec2 of [undefined, "++", "--"]) {
          check(
            [...addIncDec(variation.tokens, incDec), incDec2].filter(Boolean),
            code,
            (token) => {
              expect(token.type).toBe(
                variation.canHavePostfixIncDec ? "Punctuator" : expressionType
              );
            }
          );

          check(
            [...variation.tokens, "\n", incDec, incDec2].filter(Boolean),
            code,
            (token) => {
              expect(token.type).toBe(expressionType);
            }
          );
        }
      }

      if (variation.expressionAfter) {
        if (variation.braceAfterIsExpression) {
          check([...variation.tokens, "{", "}"], code, (token) => {
            expect(token.type).toBe("Punctuator");
          });

          check(
            [...variation.tokens, "{", "key", ":", "{", "}", "}"],
            code,
            (token) => {
              expect(token.type).toBe("Punctuator");
            }
          );
        } else {
          check([...variation.tokens, "{", "}", "\n"], code, (token) => {
            expect(token.type).toBe(expressionType);
          });

          check(
            [...variation.tokens, "{", "label", ":", "{", "}", "}", "\n"],
            code,
            (token) => {
              expect(token.type).toBe(expressionType);
            }
          );
        }
      }

      check([...variation.tokens, "\n", "{", "}"], code, (token) => {
        expect(token.type).toBe(
          variation.canHaveLineTerminatorAfter
            ? variation.expressionAfter && variation.braceAfterIsExpression
              ? "Punctuator"
              : expressionType
            : expressionType
        );
      });
    }
  });
}
/* eslint-enable jest/no-standalone-expect */

function check(passedPreceding, code, fn) {
  const last = passedPreceding[passedPreceding.length - 1];
  const preceding = code.startsWith(last)
    ? [...passedPreceding, " "]
    : passedPreceding;

  const fullCode = preceding.join("") + code;
  const title = fullCode.replace(/\r/g, "␍").replace(/\n/g, "␊");

  test(title, () => {
    const tokens = Array.from(jsTokens(fullCode, { jsx: true }));

    expect(tokens.length).toBeGreaterThanOrEqual(preceding.length + 1);

    expect(
      tokens.slice(0, preceding.length).map((token) => token.value)
    ).toEqual(preceding);

    fn(tokens[preceding.length]);
  });
}

function addIncDec(preceding, incDec) {
  const last = preceding[preceding.length - 1];
  return incDec.startsWith(last)
    ? [...preceding, " ", incDec]
    : [...preceding, incDec];
}

run("/", "RegularExpressionLiteral");
run("<", "JSXPunctuator");
