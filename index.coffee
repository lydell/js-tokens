# Copyright 2014, 2015, 2016, 2017, 2018, 2019, 2020 Simon Lydell
# License: MIT.

# https://tc39.es/ecma262/#sec-lexical-grammar
# https://mathiasbynens.be/notes/javascript-identifiers
# https://github.com/tc39/proposal-regexp-unicode-property-escapes/#other-examples
# https://unicode.org/reports/tr31/#Backward_Compatibility
# https://stackoverflow.com/a/27120110/2010616

RegularExpressionLiteral = ///
  /(?![ * / ])
  (?:
    \[
    (?:
      (?![ \] \\ ]).
      |
      \\.
    )*
    \]
    |
    (?![ / \] \\ ]).
    |
    \\.
  )*
  (
    /
    [ $ _ \u200C \u200D \p{ID_Continue} ]*
    |
    \\
  )?
///yu

ValidPrecedingRegex = ///
  ^(?:
    [/+-]
    |
    \.{3}
    |
    \?(?:noLineTerminatorHere|nonExpressionParenEnd|unaryIncDec|templateInterpolation)
  )?$
  |
  [ { } ( [ , ; < > = * % & | ^ ! ~ ? : ]$
///

KeywordsWithExpressionAfter = ///
  ^(?:await|case|default|delete|do|else|extends|instanceof|new|return|throw|typeof|void|yield)$
///

KeywordsWithNoLineTerminatorAfter = ///
  ^(?:return|throw|yield)$
///

Punctuator = ///
  -- | \+\+
  |
  && | \|\|
  |
  =>
  |
  \.{3}
  |
  \??\. (?!\d)
  |
  \?{2}
  |
  (?:
    [ + \- % & | ^ ]
    |
    \*{1,2}
    |
    <{1,2} | >{1,3}
    |
    !=? | ={1,2}
    |
    /(?![ / * ])
  )=?
  |
  [ ? ~ , : ; [ \] ( ) { } ]
///y

PunctuatorsNotPrecedingObjectLiteral = ///
  ^(?:
    =>
    |
    [ ; \] ) { } ]
  )$
///

IdentifierName = ///
  (?=[ $ _ \p{ID_Start} \\ ])
  (?:
    [ $ _ \u200C \u200D \p{ID_Continue} ]
    |
    \\u[ \d a-f A-F ]{4}
    |
    \\u\{[ \d a-f A-F ]+\}
  )+
///yu

WhiteSpace = ///
  [ \t \v \f \ufeff \p{Zs} ]+
///yu

LineTerminatorSequence = ///
  \r?\n
  |
  [ \r \u2028 \u2029 ]
///y

Newline = ///
  [ \n \r \u2028 \u2029 ]
///

StringLiteral = ///
  ([ ' " ])
  (?:
    (?! \1 )[^ \\ \n \r ]
    |
    \\(?: \r\n | [^] )
  )*
  (\1)?
///y

NumericLiteral = ///
  (?:
    0[xX][ \d a-f A-F ]+
    |
    0[oO][0-7]+
    |
    0[bB][01]+
  )n?
  |
  0n
  |
  [1-9]\d*n
  |
  (?:
    (?:
      0(?!\d)
      |
      0\d*[89]\d*
      |
      [1-9]\d*
    )
    (?: \.\d* )?
    |
    \.\d+
  )
  (?: [eE][+-]?\d+ )?
  |
  0[0-7]+
///y

Template = ///
  [ ` } ]
  (?:
    [^ ` \\ $ ]
    |
    \\[^]
    |
    \$(?!\{)
  )*
  ( ` | \$\{ )?
///y

MultiLineComment = ///
  /\*
  (?:
    [^*]
    |
    \*(?!/)
  )*
  (\*/)?
///y

SingleLineComment = ///
  //.*
///y

JSXPunctuator = ///
  [ < > / . : = { } ]
///y

JSXIdentifier = ///
  [ $ _ \p{ID_Start} ]
  [ $ _ \u200C \u200D \p{ID_Continue} - ]*
///yu

JSXString = ///
  ([ ' " ])
  (?:
    (?! \1 )[^]
  )*
  (\1)?
///y

JSXText = ///
  [^ < > { } ]+
///y

module.exports = jsTokens = (input, {jsx = false} = {}) ->
  {length} = input
  lastIndex = 0
  lastSignificantToken = ""
  modes = ["JS"]
  braces = []
  templates = []
  parenNesting = 0
  jsxInterpolations = []
  nonExpressionParenStart = undefined
  postfixIncDec = false

  while lastIndex < length
    WhiteSpace.lastIndex = lastIndex
    if match = WhiteSpace.exec(input)
      lastIndex = WhiteSpace.lastIndex
      yield {
        type: "WhiteSpace",
        value: match[0],
      }
      continue

    LineTerminatorSequence.lastIndex = lastIndex
    if match = LineTerminatorSequence.exec(input)
      lastIndex = LineTerminatorSequence.lastIndex
      postfixIncDec = false
      if KeywordsWithNoLineTerminatorAfter.test(lastSignificantToken)
        lastSignificantToken = "?noLineTerminatorHere"
      yield {
        type: "LineTerminatorSequence",
        value: match[0],
      }
      continue

    MultiLineComment.lastIndex = lastIndex
    if match = MultiLineComment.exec(input)
      lastIndex = MultiLineComment.lastIndex
      if Newline.test(match[0])
        postfixIncDec = false
      yield {
        type: "MultiLineComment",
        value: match[0],
        closed: match[1] != undefined,
      }
      continue

    SingleLineComment.lastIndex = lastIndex
    if match = SingleLineComment.exec(input)
      lastIndex = SingleLineComment.lastIndex
      postfixIncDec = false
      yield {
        type: "SingleLineComment",
        value: match[0],
      }
      continue

    mode = modes[modes.length - 1]
    switch mode
      when "JS"
        if input[lastIndex] == "/" && (
          ValidPrecedingRegex.test(lastSignificantToken) ||
          KeywordsWithExpressionAfter.test(lastSignificantToken)
        )
          RegularExpressionLiteral.lastIndex = lastIndex
          if match = RegularExpressionLiteral.exec(input)
            lastIndex = RegularExpressionLiteral.lastIndex
            lastSignificantToken = match[0]
            postfixIncDec = true
            yield {
              type: "RegularExpressionLiteral",
              value: match[0],
              closed: match[1] != undefined && match[1] != "\\",
            }
            continue

        Punctuator.lastIndex = lastIndex
        if match = Punctuator.exec(input)
          punctuator = match[0]
          nextLastIndex = Punctuator.lastIndex
          nextLastSignificantToken = punctuator

          switch punctuator
            when "("
              if lastSignificantToken == "?nonExpressionParenKeyword"
                nonExpressionParenStart = parenNesting
              parenNesting++
              postfixIncDec = false

            when ")"
              parenNesting--
              postfixIncDec = true
              if parenNesting == nonExpressionParenStart
                nonExpressionParenStart = undefined
                nextLastSignificantToken = "?nonExpressionParenEnd"
                postfixIncDec = false

            when "{"
              Punctuator.lastIndex = 0
              isExpression =
                lastSignificantToken == "?templateInterpolation" ||
                lastSignificantToken == "?unaryIncDec" ||
                (KeywordsWithExpressionAfter.test(lastSignificantToken) &&
                lastSignificantToken != "else") ||
                (Punctuator.test(lastSignificantToken) &&
                Punctuator.lastIndex == lastSignificantToken.length &&
                !PunctuatorsNotPrecedingObjectLiteral.test(lastSignificantToken))
              braces.push(isExpression)
              postfixIncDec = false

            when "}"
              if templates.length > 0
                nesting = templates[templates.length - 1]
                if braces.length == nesting
                  Template.lastIndex = lastIndex
                  match = Template.exec(input)
                  lastIndex = Template.lastIndex
                  lastSignificantToken = match[0]
                  if match[1] == "${"
                    lastSignificantToken = "?templateInterpolation"
                    postfixIncDec = false
                    yield {
                      type: "TemplateMiddle",
                      value: match[0],
                    }
                  else
                    templates.pop()
                    postfixIncDec = true
                    yield {
                      type: "TemplateTail",
                      value: match[0],
                      closed: match[1] == "`",
                    }
                  continue
              if jsxInterpolations.length > 0
                nesting = jsxInterpolations[jsxInterpolations.length - 1]
                if braces.length == nesting
                  jsxInterpolations.pop()
                  modes.pop()
                  lastIndex += 1
                  lastSignificantToken = "}"
                  yield {
                    type: "JSXPunctuator",
                    value: "}"
                  }
                  continue
              postfixIncDec = braces.pop()
              nextLastSignificantToken =
                if postfixIncDec then "?expressionBraceEnd" else "}"

            when "]"
              postfixIncDec = true

            when "++", "--"
              nextLastSignificantToken =
                if postfixIncDec then "?postfixIncDec" else "?unaryIncDec"

            when "<"
              if jsx && (
                ValidPrecedingRegex.test(lastSignificantToken) ||
                KeywordsWithExpressionAfter.test(lastSignificantToken)
              )
                modes.push("JSXTag")
                lastIndex += 1
                lastSignificantToken = "<"
                yield {
                  type: "JSXPunctuator",
                  value: punctuator,
                }
                continue
              postfixIncDec = false

            else
              postfixIncDec = false

          lastIndex = nextLastIndex
          lastSignificantToken = nextLastSignificantToken
          yield {
            type: "Punctuator",
            value: punctuator,
          }
          continue

        IdentifierName.lastIndex = lastIndex
        if match = IdentifierName.exec(input)
          lastIndex = IdentifierName.lastIndex
          nextLastSignificantToken = match[0]
          switch match[0]
            when "for", "if", "while", "with"
              if lastSignificantToken != "." && lastSignificantToken != "?."
                nextLastSignificantToken = "?nonExpressionParenKeyword"
          lastSignificantToken = nextLastSignificantToken
          postfixIncDec = !KeywordsWithExpressionAfter.test(match[0])
          yield {
            type: "IdentifierName",
            value: match[0],
          }
          continue

        StringLiteral.lastIndex = lastIndex
        if match = StringLiteral.exec(input)
          lastIndex = StringLiteral.lastIndex
          lastSignificantToken = match[0]
          postfixIncDec = true
          yield {
            type: "StringLiteral",
            value: match[0],
            closed: match[2] != undefined,
          }
          continue

        NumericLiteral.lastIndex = lastIndex
        if match = NumericLiteral.exec(input)
          lastIndex = NumericLiteral.lastIndex
          lastSignificantToken = match[0]
          postfixIncDec = true
          yield {
            type: "NumericLiteral",
            value: match[0],
          }
          continue

        Template.lastIndex = lastIndex
        if match = Template.exec(input)
          lastIndex = Template.lastIndex
          lastSignificantToken = match[0]
          if match[1] == "${"
            lastSignificantToken = "?templateInterpolation"
            templates.push(braces.length)
            postfixIncDec = false
            yield {
              type: "TemplateHead",
              value: match[0],
            }
          else
            postfixIncDec = true
            yield {
              type: "NoSubstitutionTemplate",
              value: match[0],
              closed: match[1] == "`",
            }
          continue

      when "JSXTag", "JSXTagEnd"
        JSXPunctuator.lastIndex = lastIndex
        if match = JSXPunctuator.exec(input)
          lastIndex = JSXPunctuator.lastIndex
          switch match[0]
            when "<"
              modes.push("JSXTag")
            when ">"
              modes.pop()
              if mode == "JSXTagEnd"
                modes.pop()
                if modes[modes.length - 1] == "JSXChildren"
                  modes.pop()
                lastSignificantToken = "?jsx"
                postfixIncDec = true
              else if lastSignificantToken == "/"
                lastSignificantToken = "?jsx"
                postfixIncDec = true
              else
                modes.push("JSXChildren")
            when "{"
              modes.push("JS")
              jsxInterpolations.push(braces.length)
              lastSignificantToken = ""
              postfixIncDec = false
            when "/"
              if lastSignificantToken == "<"
                modes.push("JSXTagEnd")
          lastSignificantToken = match[0]
          yield {
            type: "JSXPunctuator",
            value: match[0],
          }
          continue

        JSXIdentifier.lastIndex = lastIndex
        if match = JSXIdentifier.exec(input)
          lastIndex = JSXIdentifier.lastIndex
          lastSignificantToken = match[0]
          yield {
            type: "JSXIdentifier",
            value: match[0],
          }
          continue

        JSXString.lastIndex = lastIndex
        if match = JSXString.exec(input)
          lastIndex = JSXString.lastIndex
          lastSignificantToken = match[0]
          yield {
            type: "JSXString",
            value: match[0],
            closed: match[2] != undefined,
          }
          continue

      when "JSXChildren"
        JSXText.lastIndex = lastIndex
        if match = JSXText.exec(input)
          lastIndex = JSXText.lastIndex
          lastSignificantToken = match[0]
          yield {
            type: "JSXText",
            value: match[0],
          }
          continue

        switch input[0]
          when "<"
            modes.push("JSXTag")
            yield {
              type: "JSXPunctuator",
              value: match[0],
            }
            continue
          when "{"
            modes.push("JS")
            jsxInterpolations.push(braces.length)
            lastSignificantToken = ""
            postfixIncDec = false
            yield {
              type: "JSXPunctuator",
              value: match[0],
            }
            continue

    firstCodePoint = String.fromCodePoint(input.codePointAt(lastIndex))
    lastIndex += firstCodePoint.length
    lastSignificantToken = firstCodePoint
    postfixIncDec = false
    yield {
      type: if mode == "JS" then "Invalid" else "JSXInvalid",
      value: firstCodePoint,
    }

  undefined
