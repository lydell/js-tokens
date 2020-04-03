"use strict";

const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const { default: jsTokensLib } = require("../");

const babelTypeMap = {
  bigint: "NumericLiteral",
  CommentBlock: "MultiLineComment",
  CommentLine: "SingleLineComment",
  name: "IdentifierName",
  num: "NumericLiteral",
  regexp: "RegularExpressionLiteral",
  string: "StringLiteral",
};

function babel(code, sourceType) {
  const { tokens } = babelParser.parse(code, {
    tokens: true,
    sourceType,
  });

  const result = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.type.label === "`") {
      const next2 = tokens[index + 2];
      result.push({
        type: "Template",
        value: code.slice(token.start, next2.end),
      });
      index += 2;
      continue;
    }

    if (token.type.label === "}") {
      const next1 = tokens[index + 1];
      const next2 = tokens[index + 2];
      if (next1 && next1.type.label === "template") {
        result.push({
          type: "Template",
          value: code.slice(token.start, next2.end),
        });
        index += 2;
        continue;
      }
    }

    if (token.type.label === "eof") {
      continue;
    }

    const value = code.slice(token.start, token.end);

    result.push({
      type:
        token.type === "CommentLine" &&
        (value.startsWith("<!--") || value.startsWith("-->"))
          ? "HTMLLikeComment"
          : babelTypeMap[token.type.label || token.type] ||
            (token.type.keyword !== undefined
              ? "IdentifierName"
              : "Punctuator"),
      value,
    });
  }

  return result;
}

const jsTokensTypeMap = {
  NoSubstitutionTemplate: "Template",
  TemplateHead: "Template",
  TemplateMiddle: "Template",
  TemplateTail: "Template",
  IdentifierName: "IdentifierName",
  Invalid: "Invalid",
  NumericLiteral: "NumericLiteral",
  Punctuator: "Punctuator",
  RegularExpressionLiteral: "RegularExpressionLiteral",
  StringLiteral: "StringLiteral",
  SingleLineComment: "SingleLineComment",
  MultiLineComment: "MultiLineComment",
};

function jsTokens(code) {
  return Array.from(jsTokensLib(code), (token) => {
    const type = jsTokensTypeMap[token.type];
    return type == null
      ? undefined
      : {
          type,
          value: token.value,
        };
  }).filter(Boolean);
}

function runFile(file) {
  test(file, () => {
    const code = fs.readFileSync(file).toString();
    const sourceType = /[.-]module\.js$/.test(file) ? "module" : "script";
    const babelTokens = babel(code, sourceType);
    const jsTokensTokens = jsTokens(code);

    if (babelTokens.some((token) => token.type === "HTMLLikeComment")) {
      return;
    }

    expect(jsTokensTokens).toEqual(babelTokens);
  });
}

function getFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(dir, file));
}

const dirs = [
  "./node_modules/everything.js",
  "./node_modules/test262-parser-tests/pass",
  "./node_modules/test262-parser-tests/pass-explicit",
];

const ignored = new Set([
  // Known cases where js-tokens mis-identifies regex as division.
  "node_modules/test262-parser-tests/pass/9d3d960e32528788.js",
  "node_modules/test262-parser-tests/pass/d53aef16fe683218.js",
  "node_modules/test262-parser-tests/pass-explicit/d53aef16fe683218.js",
]);

for (const dir of dirs) {
  for (const file of getFiles(dir)) {
    if (!ignored.has(file)) {
      runFile(file);
    }
  }
}
