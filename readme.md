Overview [![Build Status](https://travis-ci.org/lydell/js-tokens.png?branch=master)](https://travis-ci.org/lydell/js-tokens)
========

A regex that tokenizes JavaScript.

```js
var jsTokens = require("js-tokens")

// Tokenize a whole string of JavaScript:
jsString.match(jsTokens)
// ["var", " ", "foo", "=", "opts", ".", "foo", ";", "\n", ...]

// Rename the variable `foo` to `bar`:
var lastSignificantToken
jsString.replace(jsTokens, function(token) {
  var index = 1
  while (arguments[index] === undefined) index++
  var name = jsTokens.names[index-1]

  if (lastSignificantToken !== "." && token === "foo") {
    return "bar"
  }
  if (name !== "comment" && name !== "whitespace") {
    lastSignificantToken = token
  }
  return token
})
// ["var", " ", "bar", "=", "opts", ".", "foo", ";", "\n", ...]
```


Installation
============

`npm install js-tokens`

```js
var jsTokens = require("js-tokens")
```


Usage
=====

### `jsTokens` ###

A regex with the `g` flag that matches JavaScript tokens.

The regex _always_ matches, even invalid JavaScript and the empty string. For
example, `jsTokens.exec(string)` never returns `null`.

The next match is always directly after the previous. Each token has its own
capturing group.

### `jsTokens.names` ###

An array of names for each token, in the capturing group order.


Invalid code handling
=====================

Unterminated strings are still matched as strings. JavaScript strings cannot
contain (unescaped) newlines, so unterminated strings simply end at the end of
the line. You may use `/['"]$/.test(matchedStringToken)` to determine if a
string was terminated or not.

Unterminated multi-line comments are also still matched as comments. They
simply go on to the end of the string.

Unterminated regex literals are likely matched as division and whatever is
inside the regex.

Invalid ASCII characters have their own capturing group.

Invalid non-ASCII characters are treated as names, to simplify the matching of
names.

Regex literals may contain invalid regex syntax. They are still matched as
regex literals. They may also contains repeated regex flags. (That _could_ be
fixed by using a capture group in `jsTokens`, but the capturing groups are
reserved—one for each token type.)

Strings may contain invalid escape sequences.


Limitations
===========

Tokenizing JavaScript using regexes—in fact, _one single regex_—won’t be
perfect. But that’s not the point either.

### Division and regex literals collision ###

Consider this example:

```js
var g = 9.82
var number = bar / 2/g

var regex = / 2/g
```

A human can easily understand that in the `number` line we’re dealing with
division, and in the `regex` line we’re dealing with a regex literal. How come?
Because humans can look at the whole code to put the `/` characters in context.
A JavaScript regex cannot. It only sees forwards.

When the `jsTokens` regex scans throught the above, it will see the following
at the end of both the `number` and `regex` rows:

```js
/ 2/g
```

It is then impossible to know if that is a regex literal, or part of an
expression dealing with division.

Here is a similar case:

```js
foo /= 2/g
foo(/= 2/g)
```

The first line divides the `foo` variable with `2/g`. The second line calls the
`foo` function with the regex literal `/= 2/g`. Again, since `jsTokens` only
sees forwards, it cannot tell the two cases apart.

There are some cases where we _can_ tell division and regex literals apart,
though.

First off, we have the simple cases where there’s only one slash in the line:

```js
var foo = 2/g
foo /= 2
```

Regex literals cannot contain newlines, so the above cases are correctly
identified as division. Things are only problematic when there are more than
one non-comment slash in a single line.

Secondly, not every character is a valid regex flag.

```js
var number = bar / 2/e
```

The above example is also correctly identified as division, because `e` is not
a valid regex flag. I initially wanted to future-proof by allowing `[a-zA-Z]*`
(any letter) as flags, but it is not worth it since it increases the amount of
ambigous cases. So only the standard `g`, `m` and `i` flags, as well as the `y`
flag supported by Firefox 3.6+, are allowed. This means that the above example
will be identified as division as long as you don’t rename the `e` variable to
some permutation of `gmiy` 1 to 4 characters long.

Lastly, we can look _forward_ for information.

- If the token following what looks like a regex literal is not valid after a
  regex literal, but is valid in a division expression, then the regex literal
  is treated as division instead. For example, a flagless regex cannot be
  followed by a string, number or name, but all of those three can be the
  denominator of a division.
- Generally, if what looks like a regex literal is followed by an operator, the
  regex literal is treated as division instead. This is because regexes are
  seldomly used with operators (such as `+`, `*`, `&&` and `==`), but division
  could likely be part of such an expression.

Please consult the regex source and the test cases for precise information on
when regex or division is matched (should you need to know). In short, you
could sum it up as:

If the end of a statement looks like a regex literal (even if it isn’t), it
will be treated as one. Otherwise it should work as expected (if you write sane
code).


Build
=====

index.js is generated by running `node generate-index.js`. The regex is written
in regex.coffee. Don’t worry, you don’t need to know anything about
CoffeeScript: regex.coffee should be kept as simple as possible. CoffeeScript
is only used for its block regexes, which have the following benefits:

- Insignificant whitespace.
- Comments.
- No need to escape slashes.
- No need to double-escape everything (as opposed to using `RegExp("regex as a
  string. One backslash: \\\\")`).
- Plenty of syntax highlighters available.

Everything else is written in JavaScript.


License
=======

[The X11 (“MIT”) License](LICENSE).
