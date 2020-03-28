declare type Token =
  | { type: "StringLiteral"; value: string; closed: boolean }
  | { type: "NoSubstitutionTemplate"; value: string; closed: boolean }
  | { type: "TemplateHead"; value: string }
  | { type: "TemplateMiddle"; value: string }
  | { type: "TemplateTail"; value: string; closed: boolean }
  | { type: "MultiLineComment"; value: string; closed: boolean }
  | { type: "SingleLineComment"; value: string }
  | { type: "RegularExpressionLiteral"; value: string }
  | { type: "NumericLiteral"; value: string }
  | { type: "Punctuator"; value: string }
  | { type: "WhiteSpace"; value: string }
  | { type: "LineTerminatorSequence"; value: string }
  | { type: "Invalid"; value: string };

declare function jsTokens(input: string): Iterable<Token>;

export default jsTokens;
