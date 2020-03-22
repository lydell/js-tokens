"use strict";

const fs = require("fs");
const esprima = require("esprima");
const { default: jsTokens } = require("./");

const esprimaTypeMap = {
  Boolean: "IdentifierName",
  Identifier: "IdentifierName",
  Keyword: "IdentifierName",
  Null: "IdentifierName",
  Numeric: "NumericLiteral",
  Punctuator: "Punctuator",
  RegularExpression: "RegularExpressionLiteral",
  String: "StringLiteral",
  Template: "Template",
};

function getEsprimaTokens(code) {
  return esprima.tokenize(code, { loc: true }).map(token => ({
    type: esprimaTypeMap[token.type],
    value: token.value,
    loc: token.loc,
  }));
}

const jsTokensTypeMap = {
  NoSubstitutionTemplate: "Template",
  TemplateHead: "Template",
  TemplateMiddle: "Template",
  TemplateTail: "Template",
  IdentifierName: "IdentifierName",
  NumericLiteral: "NumericLiteral",
  Punctuator: "Punctuator",
  RegularExpressionLiteral: "RegularExpressionLiteral",
  StringLiteral: "StringLiteral",
};

function getJsTokensTokens(code) {
  return Array.from(jsTokens(code), token => {
    const type = jsTokensTypeMap[token.type];
    return type == null
      ? undefined
      : {
          type,
          value: token.value,
        };
  }).filter(Boolean);
}

function compare(file) {
  const code = fs.readFileSync(require.resolve(file)).toString();
  const esprimaTokens = getEsprimaTokens(code);
  const jsTokensTokens = getJsTokensTokens(code);

  const length = Math.min(esprimaTokens.length, jsTokensTokens.length);
  for (let index = 0; index < length; index++) {
    const esprimaToken = esprimaTokens[index];
    const jsTokensToken = jsTokensTokens[index];
    if (
      esprimaToken.type !== jsTokensToken.type ||
      esprimaToken.value !== jsTokensToken.value
    ) {
      const loc = esprimaToken.loc.start;
      console.error(
        `${file}:${loc.line}:${loc.column + 1}: ` +
          `(token #${index + 1})\n` +
          `  esprima:  '${esprimaToken.type}': ${esprimaToken.value}\n` +
          `  jsTokens: '${jsTokensToken.type}': ${jsTokensToken.value}`
      );
      return false;
    }
  }

  if (esprimaTokens.length !== jsTokensTokens.length) {
    console.error(
      `${file}: Number of tokens mismatch.\n` +
        `  esprima:  ${esprimaTokens.length + 1}\n` +
        `  jsTokens: ${jsTokensTokens.length + 1}`
    );
    return false;
  }

  return true;
}

const results = process.argv.slice(2).map(compare);

if (results.length === 0) {
  console.log("Nothing to compare.");
  process.exit(1);
} else if (results.every(Boolean)) {
  console.log(
    "Comparison succeeded: esprima and jsTokens produced the same tokens!"
  );
  process.exit(0);
} else {
  console.error("Comparison failed.");
  process.exit(1);
}
