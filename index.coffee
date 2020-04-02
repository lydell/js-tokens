###
# Copyright 2014, 2015, 2016, 2017, 2018, 2019, 2020 Simon Lydell
# License: MIT. (See LICENSE.)
#
# https://tc39.es/ecma262/#sec-lexical-grammar
# https://mathiasbynens.be/notes/javascript-identifiers
# https://stackoverflow.com/a/27120110/2010616
###

Object.defineProperty(exports, "__esModule", {
  value: true
})

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
    [$ _ \p{L} \p{Nl} \u200c \u200d \p{Mn} \p{Mc} \p{Nd} \p{Pc} ]*
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
    \?(?:nonExpressionParenEnd|unaryIncDec|templateInterpolation)
  )?$
  |
  [ { } ( [ , ; < > = * % & | ^ ! ~ ? : ]$
///

ValidPrecedingRegexOrUnaryIncDec = ///
  ^(?:await|case|default|delete|do|else|extends|instanceof|new|return|throw|typeof|void|yield)$
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
  (?=[ $ _ \p{L} \p{Nl} \\ ])
  (?:
    [$ _ \p{L} \p{Nl} \u200c \u200d \p{Mn} \p{Mc} \p{Nd} \p{Pc} ]
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
    \d*\.\d+
    |
    \d+\.?
  )
  (?: [eE][+-]?\d+ )?
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

exports.default = (input) ->
  {length} = input
  lastIndex = 0
  lastSignificantToken = ""
  braces = []
  templates = []
  parenNesting = 0
  nonExpressionParenStart = undefined
  postfixIncDec = false

  while lastIndex < length
    if input[lastIndex] == "/" && (
      ValidPrecedingRegex.test(lastSignificantToken) ||
      ValidPrecedingRegexOrUnaryIncDec.test(lastSignificantToken)
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
            (Punctuator.test(lastSignificantToken) &&
            Punctuator.lastIndex == lastSignificantToken.length &&
            !PunctuatorsNotPrecedingObjectLiteral.test(lastSignificantToken))
          braces.push(isExpression)
          postfixIncDec = false

        when "}"
          if templates.length > 0
            templateNesting = templates[templates.length - 1]
            if braces.length == templateNesting
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
          postfixIncDec = braces.pop()
          nextLastSignificantToken =
            if postfixIncDec then "?expressionBraceEnd" else "}"

        when "]"
          postfixIncDec = true

        when "++", "--"
          nextLastSignificantToken =
            if postfixIncDec then "?postfixIncDec" else "?unaryIncDec"

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
      postfixIncDec = !ValidPrecedingRegexOrUnaryIncDec.test(match[0])
      yield {
        type: "IdentifierName",
        value: match[0],
      }
      continue

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
      yield {
        type: "LineTerminatorSequence",
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

    firstCodePoint = String.fromCodePoint(input.codePointAt(lastIndex))
    lastIndex += firstCodePoint.length
    lastSignificantToken = firstCodePoint
    postfixIncDec = false
    yield {
      type: "Invalid",
      value: firstCodePoint,
    }

  undefined
