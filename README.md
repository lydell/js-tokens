# js-tokens [![Build Status](https://travis-ci.org/lydell/js-tokens.svg?branch=master)](https://travis-ci.org/lydell/js-tokens)

A regex that tokenizes JavaScript.

```js
var jsTokens = require("js-tokens").default;

var jsString = 'JSON.stringify({k:3.14**2}, null /*replacer*/, "\\t")';

jsString.match(jsTokens).join("|");
// JSON|.|stringify|(|{|k|:| |3.14|**|2|}|,| |null| |/*replacer*/|,| |"\t"|)
```

## Installation

`npm install js-tokens`

```js
import jsTokens from "js-tokens";
// or:
var jsTokens = require("js-tokens").default;
```

## Usage

This package exports a regex with the `g` flag that matches JavaScript tokens.

The regex _always_ matches, even invalid JavaScript and the empty string.

The next match is always directly after the previous.

Tokenizing JavaScript using regexes—in fact, _one single regex_—won’t be perfect. But that’s not the point either. See the following sections for limitations of some tokens.

### Named capture groups

One – and only one – of the following named capture groups contains a string for every match.

[example.test.js] shows how to use [String.prototype.matchAll] \(available in Node.js 12+) to get all matches, including named capture groups. The example just converts the match objects into another data structure to show what things looks like, but you can of course do whatever you need, such as constructing a string in the case of a syntax highlighter.

#### StringLiteral

**Spec: [StringLiteral]**

When the `StringLiteral` capture group is set, the `StringLiteralClosed` capture group is either `undefined` (which means that the string literal is unclosed) or `'` or `"` (which means that is _is_ closed). JavaScript strings cannot contain (unescaped) newlines, so unclosed strings simply end at the end of the line.

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

#### Template

**Spec: [Template] + [TemplateSubstitutionTail]**

When the `Template` capture group is set, the `TemplateClosed` capture group is either `undefined` (which means that the template is unclosed) or `` ` `` (which means that is _is_ closed). Templates can contain unescaped newlines, so unclosed templates go on to the end of input.

Just like for `StringLiteral`, `Template` can also contain invalid escapes. `` `\u` `` is matched as a `Template` even though it contains an invalid escape. Also note that in _tagged_ templates, invalid escapes are _not_ syntax errors: `` x`\u` `` is syntactically valid JavaScript.

Template strings are matched as single tokens, from the starting `` ` `` to the ending `` ` ``, including interpolations (whose tokens are not matched individually).

Matching template string interpolations requires recursive balancing of `{` and `}`—something that JavaScript regexes cannot do. Only one level of nesting is supported.

Examples:

<!-- prettier-ignore -->
```js
`template`
``
`${1 + 2}`
`with ${`a ${nested} template`.toUpperCase()}`
`one pair of braces: ${JSON.stringify({ a: 1, b: 2 })}`
` unclosed ${
```

#### MultiLineComment

**Spec: [MultiLineComment]**

When the `MultiLineComment` capture group is set, the `MultiLineCommentClosed` capture group is either `undefined` (which means that the comment is unclosed) or ``/ (which means that is _is_ closed). Unclosed multi-line comments go on to the end of the input.

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

#### SingleLineComment

**Spec: [SingleLineComment]**

Examples:

<!-- prettier-ignore -->
```js
// comment
// console.log("commented", out + code);
//
```

#### RegularExpressionLiteral

**Spec: [RegularExpressionLiteral]**

Unterminated regex literals are likely matched as division and whatever is inside the regex.

Regex literals may contain invalid regex syntax. They are still matched as regex literals.

According to the specification, the flags of regular expressions are [IdentifierPart]s (unknown and repeated regex flags become errors at a later stage). This regex only matches `[a-zA-Z]`, which likely catches both typos and future flags.

Examples:

<!-- prettier-ignore -->
```js
/a/
/a/gimsuy
/a/Invalid
/+/
/[/]\//
```

##### Regex vs division

Differentiating between regex and division in JavaScript is really tricky. Consider this example:

<!-- prettier-ignore -->
```js
var g = 9.82;
// Regex:
return/2/g;
// Division:
saturn/2/g;
```

Note how two lines end with `/2/g`, but only one of them contains a regex. The trick to knowing which is which is by looking at the _previous_ token. js-tokens uses regex lookbehind (requires ES2018+) for this.

There are still some edge cases that it can’t get right, such as:

<!-- prettier-ignore -->
```js
if(a+b)/2/g.exec("a");
fn(a+b)/2/g.toString();
```

The first line contains a regex, but js-tokens thinks it’s division just like on the next line. In both cases js-tokens looks back one token and sees `)`. It’s way more to have math code like `(a + b) / 2 / g` than putting a regex literal directly after control flow.

For all the ambigouos tokens `)`, `}`, `++` and `--` js-tokens always division since it is more likely. See [“When parsing Javascript, what determines the meaning of a slash?” on StackOverflow][stackoverflow-slash] for more details.

#### NumericLiteral

**Spec: [NumericLiteral]**

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
```

#### Punctuator

**Spec: [Punctuator] + [DivPunctuator] + [RightBracePunctuator]**

Examples:

<!-- prettier-ignore -->
```js
.
?.
<<<
/
}
```

#### WhiteSpace

**Spec: [WhiteSpace]**

Unlike the specification, multiple whitespace characters in a row are matched as _one_ token, not one token per character.

#### LineTerminatorSequence

**Spec: [LineTerminatorSequence]**

CR, LF, CRLF plus `\u2028` and `\u2029`.

#### Invalid

**Spec: n/a**

The empty string, as well as single code points not matched in another group.

Examples:

<!-- prettier-ignore -->
```js
#
@
ö
💩
```

## ECMAScript support

The intention is to always support the latest ECMAScript version whose feature set has been finalized.

If adding support for a newer version requires changes, a new version with a major verion bump will be released.

Currently, ECMAScript 2019 is supported.

## License

[MIT](LICENSE).

[divpunctuator]: https://tc39.es/ecma262/#prod-DivPunctuator
[example.test.js]: https://github.com/lydell/js-tokens/blob/master/test/example.test.js
[identifierpart]: https://tc39.es/ecma262/#prod-IdentifierPart
[lineterminatorsequence]: https://tc39.es/ecma262/#prod-LineTerminatorSequence
[multilinecomment]: https://tc39.es/ecma262/#prod-MultiLineComment
[numericliteral]: https://tc39.es/ecma262/#prod-NumericLiteral
[punctuator]: https://tc39.es/ecma262/#prod-Punctuator
[regularexpressionliteral]: https://tc39.es/ecma262/#prod-RegularExpressionLiteral
[rightbracepunctuator]: https://tc39.es/ecma262/#prod-RightBracePunctuator
[singlelinecomment]: https://tc39.es/ecma262/#prod-SingleLineComment
[stackoverflow-slash]: https://stackoverflow.com/a/27120110/2010616
[string.prototype.matchall]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
[stringliteral]: https://tc39.es/ecma262/#prod-StringLiteral
[template]: https://tc39.es/ecma262/#prod-Template
[templatesubstitutiontail]: https://tc39.es/ecma262/#prod-TemplateSubstitutionTail
[whitespace]: https://tc39.es/ecma262/#prod-WhiteSpace
