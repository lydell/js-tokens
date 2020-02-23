# js-tokens [![Build Status](https://travis-ci.org/lydell/js-tokens.svg?branch=master)](https://travis-ci.org/lydell/js-tokens)

A regex that tokenizes JavaScript.

```js
var jsTokens = require("js-tokens").default;

var jsString = "var foo=opts.foo;\n...";

jsString.match(jsTokens);
// ["var", " ", "foo", "=", "opts", ".", "foo", ";", "\n", ...]

// If you need groups (Node.js 12+):
Array.from(jsString.matchAll(jsTokens));
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

One – and only one – of the following named capture groups contains a string for every match:

| Name | Spec | Closed | Notes |
| --- | --- | --- | --- |
| StringLiteral | [StringLiteral] | StringLiteralClosed: `'` or `"` |  |
| Template | [Template] + [TemplateSubstitutionTail] + [TODO invalid code handling] | TemplateClosed: `` ` `` |  |
| MultiLineComment | [MultiLineComment] | MultiLineCommentClosed: `*/` |  |
| SingleLineComment | [SingleLineComment] | n/a |  |
| RegularExpressionLiteral | [RegularExpressionLiteral] | special | TODO invalid code handling links |
| NumericLiteral | [NumericLiteral] | n/a |  |
| Punctuator | [Punctuator] + [DivPunctuator] + [RightBracePunctuator] | n/a |  |
| WhiteSpace | [WhiteSpace] | n/a | Matches multiple whitespace characters in a row, not just one. |
| LineTerminatorSequence | [LineTerminatorSequence] | n/a |  |
| Invalid | n/a | n/a | The empty string, as well as single code points not matched in another group. |

## ECMAScript support

The intention is to always support the latest ECMAScript version whose feature set has been finalized.

If adding support for a newer version requires changes, a new version with a major verion bump will be released.

Currently, ECMAScript 2019 is supported.

## Invalid code handling

Unterminated (template) strings are still matched as (template) strings. JavaScript strings cannot contain (unescaped) newlines, so unterminated strings simply end at the end of the line. Unterminated template strings can contain unescaped newlines, though, so they go on to the end of input.

Unterminated multi-line comments are also still matched as comments. They simply go on to the end of the input.

Unterminated regex literals are likely matched as division and whatever is inside the regex.

Invalid characters have their own capturing group.

Regex literals may contain invalid regex syntax. They are still matched as regex literals.

According to the specification, the flags of regular expressions are [IdentifierPart]s (unknown and repeated regex flags become errors at a later stage). This regex only matches `[a-z]`.

Strings may contain invalid escape sequences.

## Limitations

Tokenizing JavaScript using regexes—in fact, _one single regex_—won’t be perfect. But that’s not the point either.

You may compare jsTokens with [esprima] by using `esprima-compare.js`. See `npm run esprima-compare`!

[esprima]: http://esprima.org/

### Template string interpolation

Template strings are matched as single tokens, from the starting `` ` `` to the ending `` ` ``, including interpolations (whose tokens are not matched individually).

Matching template string interpolations requires recursive balancing of `{` and `}`—something that JavaScript regexes cannot do. Only one level of nesting is supported.

### Division and regex literals collision

<!-- prettier-ignore -->
```js
var g = 9.82;
if (condition) /a/g.exec("a");
(a)
```

Consider this example:

```js
var g = 9.82;
var number = bar / 2 / g;

var regex = / 2/g;
```

A human can easily understand that in the `number` line we’re dealing with division, and in the `regex` line we’re dealing with a regex literal. How come? Because humans can look at the whole code to put the `/` characters in context. A JavaScript regex cannot. It only sees forwards. (Well, ES2018 regexes can also look backwards. See the [ES2018](#es2018) section).

When the `jsTokens` regex scans throught the above, it will see the following at the end of both the `number` and `regex` rows:

```js
/ 2/g;
```

It is then impossible to know if that is a regex literal, or part of an expression dealing with division.

Here is a similar case:

```js
foo /= 2 / g;
foo(/= 2/g);
```

The first line divides the `foo` variable with `2/g`. The second line calls the `foo` function with the regex literal `/= 2/g`. Again, since `jsTokens` only sees forwards, it cannot tell the two cases apart.

There are some cases where we _can_ tell division and regex literals apart, though.

First off, we have the simple cases where there’s only one slash in the line:

```js
var foo = 2 / g;
foo /= 2;
```

Regex literals cannot contain newlines, so the above cases are correctly identified as division. Things are only problematic when there are more than one non-comment slash in a single line.

Secondly, not every character is a valid regex flag.

```js
var number = bar / 2 / e;
```

The above example is also correctly identified as division, because `e` is not a valid regex flag. I initially wanted to future-proof by allowing `[a-zA-Z]*` (any letter) as flags, but it is not worth it since it increases the amount of ambigous cases. So only the standard `g`, `m`, `i`, `y` and `u` flags are allowed. This means that the above example will be identified as division as long as you don’t rename the `e` variable to some permutation of `gmiyus` 1 to 6 characters long.

Lastly, we can look _forward_ for information.

- If the token following what looks like a regex literal is not valid after a regex literal, but is valid in a division expression, then the regex literal is treated as division instead. For example, a flagless regex cannot be followed by a string, number or name, but all of those three can be the denominator of a division.
- Generally, if what looks like a regex literal is followed by an operator, the regex literal is treated as division instead. This is because regexes are seldomly used with operators (such as `+`, `*`, `&&` and `==`), but division could likely be part of such an expression.

Please consult the regex source and the test cases for precise information on when regex or division is matched (should you need to know). In short, you could sum it up as:

If the end of a statement looks like a regex literal (even if it isn’t), it will be treated as one. Otherwise it should work as expected (if you write sane code).

## License

[MIT](LICENSE).

[stringliteral]: https://tc39.es/ecma262/#prod-StringLiteral
[template]: https://tc39.es/ecma262/#prod-Template
[templatesubstitutiontail]: https://tc39.es/ecma262/#prod-TemplateSubstitutionTail
[multilinecomment]: https://tc39.es/ecma262/#prod-MultiLineComment
[singlelinecomment]: https://tc39.es/ecma262/#prod-SingleLineComment
[regularexpressionliteral]: https://tc39.es/ecma262/#prod-RegularExpressionLiteral
[numericliteral]: https://tc39.es/ecma262/#prod-NumericLiteral
[punctuator]: https://tc39.es/ecma262/#prod-Punctuator
[divpunctuator]: https://tc39.es/ecma262/#prod-DivPunctuator
[rightbracepunctuator]: https://tc39.es/ecma262/#prod-RightBracePunctuator
[whitespace]: https://tc39.es/ecma262/#prod-WhiteSpace
[lineterminatorsequence]: https://tc39.es/ecma262/#prod-LineTerminatorSequence
[identifierpart]: https://tc39.es/ecma262/#prod-IdentifierPart
