# js-tokens

The tiny, regex powered, lenient, _almost_ spec-compliant JavaScript tokenizer that never fails.

```js
const jsTokens = require("js-tokens").default;

const jsString = 'JSON.stringify({k:3.14**2}, null /*replacer*/, "\\t")';

Array.from(jsTokens(jsString, (token) => token.value)).join("|");
// JSON|.|stringify|(|{|k|:| |3.14|**|2|}|,| |null| |/*replacer*/|,| |"\t"|)
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [Tokens](#tokens)
  - [StringLiteral](#stringliteral)
  - [NoSubstitutionTemplate + TemplateHead + TemplateMiddle + TemplateTail](#nosubstitutiontemplate--templatehead--templatemiddle--templatetail)
  - [RegularExpressionLiteral](#regularexpressionliteral)
    - [Edge cases](#edge-cases)
  - [MultiLineComment](#multilinecomment)
  - [SingleLineComment](#singlelinecomment)
  - [NumericLiteral](#numericliteral)
  - [Punctuator](#punctuator)
  - [WhiteSpace](#whitespace)
  - [LineTerminatorSequence](#lineterminatorsequence)
  - [Invalid](#invalid)
- [Compatibility](#compatibility)
  - [Annex B](#annex-b)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

`npm install js-tokens`

```js
import jsTokens from "js-tokens";
// or:
var jsTokens = require("js-tokens").default;
```

## Usage

This package exports a generator function that turns a string of JavaScript code into token objects.

For the empty string, the function yields nothing (which can be turned into an empty list). For any other input, the function always yields _something,_ even for invalid JavaScript, and never throws. Concatenating the token values reproduces the input.

The package is very close to being fully spec compliant (it passes all [but 3](#edge-cases) of [test262-parser-tests]), but has taken a couple of shortcuts. See the following sections for limitations of some tokens.

## Tokens

```ts
type Token =
  | { type: "StringLiteral"; value: string; closed: boolean }
  | { type: "NoSubstitutionTemplate"; value: string; closed: boolean }
  | { type: "TemplateHead"; value: string }
  | { type: "TemplateMiddle"; value: string }
  | { type: "TemplateTail"; value: string; closed: boolean }
  | { type: "RegularExpressionLiteral"; value: string; closed: boolean }
  | { type: "MultiLineComment"; value: string; closed: boolean }
  | { type: "SingleLineComment"; value: string }
  | { type: "NumericLiteral"; value: string }
  | { type: "Punctuator"; value: string }
  | { type: "WhiteSpace"; value: string }
  | { type: "LineTerminatorSequence"; value: string }
  | { type: "Invalid"; value: string };
```

### StringLiteral

_Spec: [StringLiteral]_

If the ending `"` or `'` is missing, the token has `closed: false`. JavaScript strings cannot contain (unescaped) newlines, so unclosed strings simply end at the end of the line.

Escape sequences are supported, but may be invalid. For example, `"\u"` is matched as a `StringLiteral` even though it contains an invalid escape.

Examples:

<!-- prettier-ignore -->
```js
"string"
'string'
""
''
"valid: \u00a0, invalid: \u"
'valid: \u00a0, invalid: \u'
" unclosed
' unclosed
```

### NoSubstitutionTemplate + TemplateHead + TemplateMiddle + TemplateTail

_Spec: [NoSubstitutionTemplate] + [TemplateHead] + [TemplateMiddle] + [TemplateTail]_

A template without interpolations is matched as is. Example:

- `` `abc` ``: NoSubstitutionTemplate
- `` `abc ``: NoSubstitutionTemplate `closed: false`

A template _with_ interpolations is matched as many tokens. For example, `` `head${1}middle${2}tail` `` is matched as follows (apart from the two NumericLiterals):

- `` `head${ ``: TemplateHead
- `}middle${`: TemplateMiddle
- `` }tail` ``: TemplateTail
- `}tail`: TemplateTail `closed: false` (if unclosed)

Templates can contain unescaped newlines, so unclosed templates go on to the end of input.

Just like for StringLiteral, templates can also contain invalid escapes. `` `\u` `` is matched as a NoSubstitutionTemplate even though it contains an invalid escape. Also note that in _tagged_ templates, invalid escapes are _not_ syntax errors: `` x`\u` `` is syntactically valid JavaScript.

### RegularExpressionLiteral

_Spec: [RegularExpressionLiteral]_

Regex literals may contain invalid regex syntax. They are still matched as regex literals.

If the ending `/` is missing, the token has `closed: false`. JavaScript regex literals cannot contain newlines (not even escaped ones), so unclosed regex literals simply end at the end of the line.

According to the specification, the flags of regular expressions are [IdentifierPart]s (unknown and repeated regex flags become errors at a later stage).

Differentiating between regex and division in JavaScript is really tricky. js-tokens looks at the previous token to tell them apart. As long as the previous tokens are valid, it should do the right thing. For invalid code, js-tokens might be confused and start matching division as regex or vice versa.

Examples:

<!-- prettier-ignore -->
```js
/a/
/a/gimsuy
/a/Inva1id
/+/
/[/]\//
```

#### Edge cases

<details>

<summary>Here are some problematic cases:</summary>

<!-- prettier-ignore -->
```js
switch (x) {
  case 1: {}/a/g;
}

label: {}/a/g;

(function f() {}/a/g);
```

This is what they mean:

```js
switch (x) {
  case 1:
    {
    }
    /a/g;
}

label: {
}
/a/g;

(function f() {} / a / g);
```

But js-tokens thinks they mean:

```js
switch (x) {
  case 1:
    ({} / a / g);
}

label: ({} / a / g);

function f() {}
/a/g;
```

In other words, js-tokens mis-identifies regex as division in these cases.

This happens because js-tokens looks at the previous token when deciding whether to parse as regex or division. In these cases, the previous token is `}`, which either means “end of block” (→ regex) or “end of object literal” (→ division). How does js-tokens determine if the `}` belongs to a block or an object literal? By looking at the token before the matching `{`.

In the first two cases, that’s a `:`. A `:` _usually_ means that we have an object literal:

```js
let some = weird ? { value: {}/a/g } : {}/a/g;
```

It’s not easy to look for `case` before the `:` as an exception to the rule:

<!-- prettier-ignore -->
```js
switch (x) {
  case weird ? true : {}/a/g: {}/a/g
}
```

The first `{}/a/g` is a division, while the second `{}/a/g` is an empty block followed by a regex. Both are preceded by a colon with a `case` on the same line, and it does not seem like you can distinguish between the two without implementing a parser.

The case with the labeled statement is simlarly difficult, since it is so similar to an object literal:

<!-- prettier-ignore -->
```js
label: {}/a/g

({ label: {}/a/g })
```

The `(function () {}/a/g);` case is difficult, because a `)` before a `{` means that the `{` is part of a _block,_ and blocks are _usually_ statements:

```js
if (x) {
}
/a/g;

function f() {}
/a/g;
```

But it’s difficult to tell an function _expression_ from a function _statement._

Luckily, none of these edge cases are likely to occur in real code.

</details>

### MultiLineComment

_Spec: [MultiLineComment]_

If the ending `*/` is missing, the token has `closed: false`. Unclosed multi-line comments go on to the end of the input.

Examples:

<!-- prettier-ignore -->
```js
/* comment */
/* console.log(
    "commented", out + code);
    */
/**/
/* unclosed
```

### SingleLineComment

_Spec: [SingleLineComment]_

Examples:

<!-- prettier-ignore -->
```js
// comment
// console.log("commented", out + code);
//
```

### NumericLiteral

_Spec: [NumericLiteral]_

Examples:

<!-- prettier-ignore -->
```js
0;
1.5;
1;
12e9;
0.123e-32;
0xDeadbeef;
0b110;
12n;
07;
09.5;
```

### Punctuator

_Spec: [Punctuator] + [DivPunctuator] + [RightBracePunctuator]_

Examples:

<!-- prettier-ignore -->
```js
+
.
?.
<<<
=>
(
/
}
```

### WhiteSpace

_Spec: [WhiteSpace]_

Unlike the specification, multiple whitespace characters in a row are matched as _one_ token, not one token per character.

### LineTerminatorSequence

_Spec: [LineTerminatorSequence]_

CR, LF and CRLF, plus `\u2028` and `\u2029`.

### Invalid

_Spec: n/a_

Single code points not matched in another group.

Examples:

<!-- prettier-ignore -->
```js
#
@
💩
```

## Compatibility

The intention is to always support the latest ECMAScript version whose feature set has been finalized.

Currently, ECMAScript 2020 is supported.

js-tokens should work in any JavaScript environment that supports [Unicode property escapes].

### Annex B

[Annex B: Additional ECMAScript Features for Web Browsers][annexb] of the spec is optional if the ECMAScript host is not a web browser, and specifies some additional syntax.

- Numeric literals: js-tokens supports legacy octal and octal like numeric literals. It was easy enough, so why not.
- String literals: js-tokens supports legacy octal escapes, since it allows any invalid escapes.
- HTML-like comments: **Not supported.** js-tokens prefers treating `5<!--x` as `5 < !(--x)` rather than as `5 //x`.
- Regular expression patterns: js-tokens doesn’t care what’s between the starting and ending `/`, so this is supported.

## License

[MIT](LICENSE).

[annexb]: https://tc39.es/ecma262/#sec-additional-ecmascript-features-for-web-browsers
[divpunctuator]: https://tc39.es/ecma262/#prod-DivPunctuator
[example.test.js]: https://github.com/lydell/js-tokens/blob/master/test/example.test.js
[identifierpart]: https://tc39.es/ecma262/#prod-IdentifierPart
[lineterminatorsequence]: https://tc39.es/ecma262/#prod-LineTerminatorSequence
[multilinecomment]: https://tc39.es/ecma262/#prod-MultiLineComment
[nosubstitutiontemplate]: https://tc39.es/ecma262/#prod-NoSubstitutionTemplate
[numericliteral]: https://tc39.es/ecma262/#prod-annexB-NumericLiteral
[punctuator]: https://tc39.es/ecma262/#prod-Punctuator
[regularexpressionliteral]: https://tc39.es/ecma262/#prod-RegularExpressionLiteral
[rightbracepunctuator]: https://tc39.es/ecma262/#prod-RightBracePunctuator
[singlelinecomment]: https://tc39.es/ecma262/#prod-SingleLineComment
[stackoverflow-slash]: https://stackoverflow.com/a/27120110/2010616
[string.prototype.matchall]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
[stringliteral]: https://tc39.es/ecma262/#prod-StringLiteral
[templatehead]: https://tc39.es/ecma262/#prod-TemplateHead
[templatemiddle]: https://tc39.es/ecma262/#prod-TemplateMiddle
[templatetail]: https://tc39.es/ecma262/#prod-TemplateTail
[test262-parser-tests]: https://github.com/tc39/test262-parser-tests
[unicode property escapes]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes
[whitespace]: https://tc39.es/ecma262/#prod-WhiteSpace
