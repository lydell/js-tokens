export declare type Token =
  | { type: "StringLiteral"; value: string; closed: boolean }
  | { type: "NoSubstitutionTemplate"; value: string; closed: boolean }
  | { type: "TemplateHead"; value: string }
  | { type: "TemplateMiddle"; value: string }
  | { type: "TemplateTail"; value: string; closed: boolean }
  | { type: "RegularExpressionLiteral"; value: string; closed: boolean }
  | { type: "MultiLineComment"; value: string; closed: boolean }
  | { type: "SingleLineComment"; value: string }
  | { type: "IdentifierName"; value: string }
  | { type: "PrivateIdentifier"; value: string }
  | { type: "NumericLiteral"; value: string }
  | { type: "Punctuator"; value: string }
  | { type: "WhiteSpace"; value: string }
  | { type: "LineTerminatorSequence"; value: string }
  | { type: "Invalid"; value: string };

export declare type JSXToken =
  | { type: "JSXString"; value: string; closed: boolean }
  | { type: "JSXText"; value: string }
  | { type: "JSXIdentifier"; value: string }
  | { type: "JSXPunctuator"; value: string }
  | { type: "JSXInvalid"; value: string };

export default function jsTokens(
  input: string,
  options: { jsx: true }
): Iterable<Token | JSXToken>;

export default function jsTokens(
  input: string,
  options?: { jsx?: boolean }
): Iterable<Token>;

export default function jsTokens(input: string): Iterable<Token>;
