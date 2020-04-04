"use strict";

const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const { default: jsTokensLib } = require("../build/index");

const babelTypeMap = {
  bigint: "NumericLiteral",
  CommentBlock: "MultiLineComment",
  CommentLine: "SingleLineComment",
  name: "IdentifierName",
  num: "NumericLiteral",
  regexp: "RegularExpressionLiteral",
  string: "StringLiteral",
};

function babel(code, sourceType, fileType) {
  const { tokens } = babelParser.parse(code, {
    tokens: true,
    sourceType,
    plugins: [
      "classProperties",
      fileType === "ts" ? "typescript" : undefined,
    ].filter(Boolean),
  });

  const result = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (token.type.label === "`") {
      const next2 = tokens[index + 2];
      result.push({
        type:
          next2.type.label === "`" ? "NoSubstitutionTemplate" : "TemplateHead",
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
          type: next2.type.label === "`" ? "TemplateTail" : "TemplateMiddle",
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

function readJsonIfExists(file) {
  return fs.existsSync(file)
    ? () => JSON.parse(fs.readFileSync(file, "utf8"))
    : undefined;
}

function runFile(file, { compareWithBabel = true } = {}) {
  const code = fs.readFileSync(file, "utf8");
  const json = readJsonIfExists(file.replace(/\.\w+$/, ".json"));

  const sourceType = /[.-]module\.\w+$/.test(file) ? "module" : "script";
  const fileType = path.extname(file).slice(1);

  const features = [
    fileType.toUpperCase(),
    sourceType,
    compareWithBabel ? "Babel" : undefined,
    json ? "JSON" : undefined,
  ]
    .filter(Boolean)
    .join("/");

  test(`${features}: ${file}`, () => {
    const babelTokens = compareWithBabel
      ? babel(code, sourceType, fileType)
      : [];

    const jsTokens = Array.from(jsTokensLib(code), ({ type, value }) => ({
      type,
      value,
    }));

    const jsTokensValues = jsTokens.map((token) => token.value);

    const jsTokensWithoutBlanks = jsTokens.filter(
      (token) => !/^\s*$/.test(token.value)
    );

    if (babelTokens.some((token) => token.type === "HTMLLikeComment")) {
      return;
    }

    if (compareWithBabel) {
      expect(jsTokensWithoutBlanks).toEqual(babelTokens);
    }

    if (json) {
      expect(jsTokensValues).toEqual(json());
    }

    expect(jsTokensValues.join("")).toBe(code);
  });
}

function getFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => /\.[jt]s$/.test(file))
    .map((file) => path.join(dir, file));
}

const valid = [
  "./test/fixtures/valid",
  "./node_modules/everything.js",
  "./node_modules/test262-parser-tests/pass",
  "./node_modules/test262-parser-tests/pass-explicit",
];

const invalid = [
  "./test/fixtures/invalid",
  "./node_modules/test262-parser-tests/fail",
  "./node_modules/test262-parser-tests/early",
];

const ignored = new Set([
  // Known cases where js-tokens mis-identifies regex as division.
  "node_modules/test262-parser-tests/pass/9d3d960e32528788.js",
  "node_modules/test262-parser-tests/pass/d53aef16fe683218.js",
  "node_modules/test262-parser-tests/pass-explicit/d53aef16fe683218.js",
]);

describe("valid", () => {
  for (const dir of valid) {
    for (const file of getFiles(dir)) {
      if (!ignored.has(file)) {
        runFile(file);
      }
    }
  }
});

describe("invalid", () => {
  for (const dir of invalid) {
    for (const file of getFiles(dir)) {
      if (!ignored.has(file)) {
        runFile(file, { compareWithBabel: false });
      }
    }
  }
});
