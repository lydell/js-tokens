"use strict";

const fs = require("fs");
const esprima = require("esprima");
const { default: jsTokens } = require("./");

const typeMap = {
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
  const tokens = esprima.tokenize(code, { loc: true });
  tokens.forEach(token => {
    token.type = typeMap[token.type];
  });
  return tokens;
}

function getJsTokensTokens(code) {
  return code
    .matchAll(jsTokens)
    .filter(
      match =>
        match.groups.SingleLineComment === undefined &&
        match.groups.MultiLineComment === undefined &&
        match.groups.LineTerminatorSequence === undefined &&
        match.groups.WhiteSpace === undefined
    );
}

function printGroups(match) {
  return Object.entries(match.groups)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `'${key}': ${value}`)
    .join("\n");
}

function compare(file) {
  const code = fs.readFileSync(require.resolve(file)).toString();
  const esprimaTokens = getEsprimaTokens(code);
  const jsTokensTokens = getJsTokensTokens(code);

  const length = Math.min(esprimaTokens.length, jsTokensTokens.length);
  for (let index = 0; index < length; index++) {
    const esprimaToken = esprimaTokens[index];
    const jsTokensMatch = jsTokensTokens[index];
    if (esprimaToken.value !== jsTokensMatch.groups[esprimaToken.type]) {
      const loc = esprimaToken.loc.start;
      console.error(
        `${file}:${loc.line}:${loc.column + 1}: ` +
          `(token #${index + 1})\n` +
          `  esprima:  '${esprimaToken.type}': ${esprimaToken.value}\n` +
          `  jsTokens: ${printGroups(jsTokensMatch)}`
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

if (results.every(Boolean)) {
  console.log(
    "Comparison succeeded: esprima and jsTokens produced the same tokens!"
  );
} else {
  console.error("Comparison failed.");
}
