### Version 8.0.0 (2022-05-15)

Support for ES2022!

- Added: Support for the `d` regex flag.

- Added: A new token type – `PrivateIdentifier` – for things like `#name`.

  `this.#name` now tokenizes differently:

  - Before: `IdentifierName: this`, `Punctuator: .`, `Invalid: #`, `IdentifierName: name`
  - After: `IdentifierName: this`, `Punctuator: .`, `PrivateIdentifier: #name`

### Version 7.0.0 (2021-04-25)

- Added: Support for ES2021: The `||=`, `&&=` and `??=` operators, as well as underscores in numeric literals (`1_000`).

### Version 6.0.0 (2020-04-13)

- Changed: The main export of this module is no longer a regex (accompanied by a small helper function). Instead, the only export is a function that tokenizes JavaScript (which was the main use case of the regex). The tokenization is still powered by basically the same regex as before, but is now wrapped up in 300–400 lines of code. This is required to tokenize regex and templates correctly, and to support JSX (see below).
- Changed: You no longer need `.default` when using CommonJS: `const jsTokens = require("js-tokens")`. (`import jsTokens from "js-tokens"` also works in module environments.)
- Changed: Node.js 10 or later is now required (because [Unicode property escapes] are used.)
- Changed: The tokens are now named like in the ECMAScript spec.
- Changed: Whitespace and line terminator sequences are now matched as separate tokens to match the spec.
- Added: TypeScript definition.
- Added: Support for JSX: `jsTokens("<p>Hello, world!</p>", { jsx: true })`.
- Added: Support for BigInt syntax: `5n`.
- Added: Support for `?.` and `??`.
- Added: Support for legacy octal and octal like numeric literals.
- Improved: Template literals now support infinite nesting, and separate tokens are made for interpolations.
- Improved: Regex vs division detection. js-tokens now passes all [but 3][edge-cases] of [test262-parser-tests].
- Improved: Unclosed regular expressions are now matched as such, instead of as division.
- Improved: Invalid non-ASCII characters are no longer matched as identifier names.

### Version 5.0.0 (2019-06-15)

- Added: Support for ES2019. The only change is that `\u2028` and `\u2029` are now allowed unescaped inside string literals.

### Version 4.0.0 (2018-01-28)

- Added: Support for ES2018. The only change needed was recognizing the `s` regex flag.
- Changed: _All_ tokens returned by the `matchToToken` function now have a `closed` property. It is set to `undefined` for the tokens where “closed” doesn’t make sense. This means that all tokens objects have the same shape, which might improve performance.

These are the breaking changes:

- `'/a/s'.match(jsTokens)` no longer returns `['/', 'a', '/', 's']`, but `['/a/s']`. (There are of course other variations of this.)
- Code that rely on some token objects not having the `closed` property could now behave differently.

### Version 3.0.2 (2017-06-28)

- No code changes. Just updates to the readme.

### Version 3.0.1 (2017-01-30)

- Fixed: ES2015 unicode escapes with more than 6 hex digits are now matched correctly.

### Version 3.0.0 (2017-01-11)

This release contains one breaking change, that should [improve performance in V8][v8-perf]:

> So how can you, as a JavaScript developer, ensure that your RegExps are fast? If you are not interested in hooking into RegExp internals, make sure that neither the RegExp instance, nor its prototype is modified in order to get the best performance:
>
> ```js
> var re = /./g;
> re.exec(""); // Fast path.
> re.new_property = "slow";
> ```

This module used to export a single regex, with `.matchToToken` bolted on, just like in the above example. This release changes the exports of the module to avoid this issue.

Before:

```js
import jsTokens from "js-tokens";
// or:
var jsTokens = require("js-tokens");
var matchToToken = jsTokens.matchToToken;
```

After:

```js
import jsTokens, { matchToToken } from "js-tokens";
// or:
var jsTokens = require("js-tokens").default;
var matchToToken = require("js-tokens").matchToToken;
```

[v8-perf]: http://v8project.blogspot.se/2017/01/speeding-up-v8-regular-expressions.html

### Version 2.0.0 (2016-06-19)

- Added: Support for ES2016. In other words, support for the `**` exponentiation operator.

These are the breaking changes:

- `'**'.match(jsTokens)` no longer returns `['*', '*']`, but `['**']`.
- `'**='.match(jsTokens)` no longer returns `['*', '*=']`, but `['**=']`.

### Version 1.0.3 (2016-03-27)

- Improved: Made the regex ever so slightly smaller.
- Updated: The readme.

### Version 1.0.2 (2015-10-18)

- Improved: Limited npm package contents for a smaller download. Thanks to @zertosh!

### Version 1.0.1 (2015-06-20)

- Fixed: Declared an undeclared variable.

### Version 1.0.0 (2015-02-26)

- Changed: Merged the 'operator' and 'punctuation' types into 'punctuator'. That type is now equivalent to the Punctuator token in the ECMAScript specification. (Backwards-incompatible change.)
- Fixed: A `-` followed by a number is now correctly matched as a punctuator followed by a number. It used to be matched as just a number, but there is no such thing as negative number literals. (Possibly backwards-incompatible change.)

### Version 0.4.1 (2015-02-21)

- Added: Support for the regex `u` flag.

### Version 0.4.0 (2015-02-21)

- Improved: `jsTokens.matchToToken` performance.
- Added: Support for octal and binary number literals.
- Added: Support for template strings.

### Version 0.3.1 (2015-01-06)

- Fixed: Support for unicode spaces. They used to be allowed in names (which is very confusing), and some unicode newlines were wrongly allowed in strings and regexes.

### Version 0.3.0 (2014-12-19)

- Changed: The `jsTokens.names` array has been replaced with the `jsTokens.matchToToken` function. The capturing groups of `jsTokens` are no longer part of the public API; instead use said function. See this [gist] for an example. (Backwards-incompatible change.)
- Changed: The empty string is now considered an “invalid” token, instead an “empty” token (its own group). (Backwards-incompatible change.)
- Removed: component support. (Backwards-incompatible change.)

[gist]: https://gist.github.com/lydell/be49dbf80c382c473004

### Version 0.2.0 (2014-06-19)

- Changed: Match ES6 function arrows (`=>`) as an operator, instead of its own category (“functionArrow”), for simplicity. (Backwards-incompatible change.)
- Added: ES6 splats (`...`) are now matched as an operator (instead of three punctuations). (Backwards-incompatible change.)

### Version 0.1.0 (2014-03-08)

- Initial release.

[edge-cases]: https://github.com/lydell/js-tokens/blob/0db8dbbfad9aa2ed1c94370c9632ce682c224bf8/README.md#known-errors
[test262-parser-tests]: https://github.com/tc39/test262-parser-tests
[unicode property escapes]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes
