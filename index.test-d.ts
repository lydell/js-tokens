import { expectType, expectError } from "tsd";
import jsTokens, { Token } from ".";
import { JSXToken } from "./build";

// Requires one string:
expectError(jsTokens());
expectError(jsTokens(123));
expectError(jsTokens("", ""));

// Does not return an array:
expectError(jsTokens("").slice());

expectType<Array<Token>>([...jsTokens("")]);
expectType<Array<Token>>([...jsTokens("", {})]);
expectType<Array<Token>>([...jsTokens("", { jsx: false })]);
expectType<Array<Token | JSXToken>>([...jsTokens("", { jsx: true })]);

for (const token of jsTokens("")) {
  expectType<Token>(token);
}

const tokens: Array<string> = Array.from(jsTokens(""), (token) => {
  switch (token.type) {
    case "StringLiteral":
      expectType<boolean>(token.closed);
      return token.value;

    case "NoSubstitutionTemplate":
      expectType<boolean>(token.closed);
      return token.value;

    case "TemplateHead":
      expectError(token.closed);
      return token.value;

    case "TemplateMiddle":
      expectError(token.closed);
      return token.value;

    case "TemplateTail":
      expectType<boolean>(token.closed);
      return token.value;

    case "RegularExpressionLiteral":
      expectType<boolean>(token.closed);
      return token.value;

    case "MultiLineComment":
      expectType<boolean>(token.closed);
      return token.value;

    case "SingleLineComment":
      expectError(token.closed);
      return token.value;

    case "NumericLiteral":
      expectError(token.closed);
      return token.value;

    case "Punctuator":
      expectError(token.closed);
      return token.value;

    case "WhiteSpace":
      expectError(token.closed);
      return token.value;

    case "LineTerminatorSequence":
      expectError(token.closed);
      return token.value;

    case "Invalid":
      expectError(token.closed);
      return token.value;
  }
});

expectType<Array<string>>(tokens);
