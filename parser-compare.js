"use strict";

const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const esprimaLib = require("esprima");
const { default: jsTokens } = require("./");

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
  try {
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
          loc: token.loc,
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
            loc: token.loc,
          });
          index += 2;
          continue;
        }
      }

      if (token.type.label === "eof") {
        continue;
      }

      result.push({
        type:
          babelTypeMap[token.type.label || token.type] ||
          (token.type.keyword !== undefined ? "IdentifierName" : "Punctuator"),
        value: code.slice(token.start, token.end),
        loc: token.loc,
      });
    }
    return result;
  } catch (error) {
    return error;
  }
}

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

function esprima(code) {
  try {
    return esprimaLib.tokenize(code, { loc: true }).map((token) => ({
      type: esprimaTypeMap[token.type],
      value: token.value,
      loc: token.loc,
    }));
  } catch (error) {
    return error;
  }
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

function getJsTokensTokens(code) {
  return Array.from(jsTokens(code), (token) => {
    const type = jsTokensTypeMap[token.type];
    return type == null
      ? undefined
      : {
          type,
          value: token.value,
        };
  }).filter(Boolean);
}

function compare(file, parser, jsTokensTransform) {
  const code = fs.readFileSync(file).toString();

  // TODO temp
  if (code.includes("<!--") || code.includes("-->")) {
    return true;
  }

  const sourceType = /[.-]module\.js$/.test(file) ? "module" : "script";
  const parserTokens = parser(code, sourceType);
  const jsTokensTokens = jsTokensTransform(getJsTokensTokens(code));

  if (parserTokens instanceof Error) {
    console.error(
      `\n${file}:\n  ${parser.name} failed.\n  ${parserTokens.message.replace(
        /\n/g,
        "\n  "
      )}`
    );
    return false;
  }

  const length = Math.min(parserTokens.length, jsTokensTokens.length);
  for (let index = 0; index < length; index++) {
    const parserToken = parserTokens[index];
    const jsTokensToken = jsTokensTokens[index];
    if (
      parserToken.type !== jsTokensToken.type ||
      parserToken.value !== jsTokensToken.value
    ) {
      const loc = parserToken.loc.start;
      console.error(
        `\n${file}:${loc.line}:${loc.column + 1}:\n` +
          `  Token #${index + 1} mismatch.\n` +
          `  ${parser.name}: '${parserToken.type}': ${parserToken.value}\n` +
          `  jsTokens: '${jsTokensToken.type}': ${jsTokensToken.value}`
      );
      return false;
    }
  }

  if (parserTokens.length !== jsTokensTokens.length) {
    console.error(
      `\n${file}:\n` +
        `  Number of tokens mismatch.\n` +
        `  ${parser.name}: ${parserTokens.length + 1}\n` +
        `  jsTokens: ${jsTokensTokens.length + 1}`
    );
    return false;
  }

  return true;
}

function identity(x) {
  return x;
}

function removeComments(jsTokensTokens) {
  return jsTokensTokens.filter(
    (token) =>
      token.type !== "SingleLineComment" && token.type !== "MultiLineComment"
  );
}

function getParser(param) {
  switch (param) {
    case "babel":
      return [babel, identity];

    case "esprima":
      return [esprima, removeComments];

    default:
      console.error("Invalid parser:", param);
      process.exit(1);
  }
}

function getFiles(params) {
  try {
    return [].concat(
      ...params.map((param) =>
        fs.lstatSync(param).isDirectory()
          ? fs
              .readdirSync(param)
              .filter((file) => file.endsWith(".js"))
              .map((file) => path.join(param, file))
          : param
      )
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const [parser, jsTokensTransform] = getParser(process.argv[2]);
const results = getFiles(process.argv.slice(3)).map((file) =>
  compare(file, parser, jsTokensTransform)
);
const numSucceeded = results.filter(Boolean).length;

if (results.length === 0) {
  console.log("Nothing to compare.");
  process.exit(1);
} else if (numSucceeded === results.length) {
  console.log(
    `${numSucceeded} succeeded: ${parser.name} and jsTokens produced the same tokens!`
  );
  process.exit(0);
} else {
  console.error(`\n${results.length - numSucceeded}/${results.length} failed.`);
  process.exit(1);
}
