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
  return mergeTemplates(
    esprima.tokenize(code, { loc: true }).map(token => ({
      type: typeMap[token.type],
      value: token.value,
      loc: token.loc,
    }))
  );
}

function mergeTemplates(tokens) {
  const start = findIndex(
    tokens,
    0,
    token => token.type === "Template" && token.value.startsWith("`")
  );
  if (start == null) {
    return tokens;
  }

  let end = start - 1;
  let start2 = undefined;
  do {
    const newEnd = findIndex(
      tokens,
      end + 1,
      token => token.type === "Template" && token.value.endsWith("`")
    );
    if (newEnd == null) {
      return tokens;
    }
    start2 = findIndex(
      tokens,
      end + 2,
      token => token.type === "Template" && token.value.startsWith("`")
    );
    end = newEnd;
  } while (start2 != null && start2 < end);

  const before = tokens.slice(0, start);
  const middle = tokens.slice(start, end + 1);
  const after = tokens.slice(end + 1);
  const merged = {
    type: "Template",
    value: middle.map(token => token.value).join(""),
    loc: middle[0].loc,
  };
  return [...before, merged, ...mergeTemplates(after)];
}

function findIndex(array, startIndex, f) {
  for (let i = startIndex; i < array.length; i++) {
    if (f(array[i])) {
      return i;
    }
  }
  return undefined;
}

function getJsTokensTokens(code) {
  return Array.from(code.matchAll(jsTokens))
    .map(match => ({ groups: match.groups }))
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
    .join("  |  ");
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
