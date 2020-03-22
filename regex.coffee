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

RegularExpressionLiteral = ///
  /(?!\*)
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
  )+
  /
  [ a-z A-Z ]*
  (?! [ $ _ \p{L} \p{Nl} \\ ] )
///yu

ValidPrecedingRegex = ///
  ^(?:
    [/+-]
    |
    \.{3}
    |await|case|default|delete|do|else|extends|instanceof|new|return|throw|typeof|void|yield
  )?$
  |
  [ { ( [ , ; < > = * % & | ^ ! ~ ? : ]$
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

Punctuator = ///
  -- | \+\+
  |
  && | \|\|
  |
  =>
  |
  \.{3}
  |
  \?\. (?!\d)
  |
  \?{2}
  |
  (?:
    [ + \- / % & | ^ ]
    |
    \*{1,2}
    |
    <{1,2} | >{1,3}
    |
    !=? | ={1,2}
  )=?
  |
  [ ? ~ . , : ; [ \] ( ) { } ]
///y

MultiLineComment = ///
  /\*
  (?:
    [^*]
    |
    \*(?!/)
  )*
  (?<MultiLineCommentEnd> \*/ )?
///y

SingleLineComment = ///
  //.*
///y

LineTerminatorSequence = ///
  \r?\n
  |
  [ \r \u2028 \u2029 ]
///y

WhiteSpace = ///
  [ \t \v \f \ufeff \p{Zs} ]+
///yu

exports.default = (input) ->
  {length} = input
  lastIndex = 0
  lastSignificantToken = ""
  braceNesting = 0
  templates = []

  while lastIndex < length
    firstChar = input[lastIndex]

    switch firstChar
      when "`"
        Template.lastIndex = lastIndex
        match = Template.exec(input)
        lastIndex = Template.lastIndex
        lastSignificantToken = match[0]
        if match[1] == "${"
          templates.push(braceNesting)
          yield {
            type: "TemplateHead",
            value: match[0],
          }
        else
          yield {
            type: "NoSubstitutionTemplate",
            value: match[0],
            closed: match[1] == "`",
          }
        continue

      when "{"
        braceNesting++

      when "}"
        if templates.length > 0
          templateNesting = templates[templates.length - 1]
          if braceNesting == templateNesting
            Template.lastIndex = lastIndex
            match = Template.exec(input)
            lastIndex = Template.lastIndex
            lastSignificantToken = match[0]
            if match[1] == "${"
              yield {
                type: "TemplateMiddle",
                value: match[0],
              }
            else
              templates.pop()
              yield {
                type: "TemplateTail",
                value: match[0],
                closed: match[1] == "`",
              }
            continue
        braceNesting--

      when "/"
        MultiLineComment.lastIndex = lastIndex
        if match = MultiLineComment.exec(input)
          lastIndex = MultiLineComment.lastIndex
          yield {
            type: "MultiLineComment",
            value: match[0],
            closed: match[1] != undefined,
          }
          continue

        SingleLineComment.lastIndex = lastIndex
        if match = SingleLineComment.exec(input)
          lastIndex = SingleLineComment.lastIndex
          yield {
            type: "SingleLineComment",
            value: match[0],
          }
          continue

        if ValidPrecedingRegex.test(lastSignificantToken)
          RegularExpressionLiteral.lastIndex = lastIndex
          if match = RegularExpressionLiteral.exec(input)
            lastIndex = RegularExpressionLiteral.lastIndex
            lastSignificantToken = match[0]
            yield {
              type: "RegularExpressionLiteral",
              value: match[0],
            }
            continue

    StringLiteral.lastIndex = lastIndex
    if match = StringLiteral.exec(input)
      lastIndex = StringLiteral.lastIndex
      lastSignificantToken = match[0]
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
      yield {
        type: "NumericLiteral",
        value: match[0],
      }
      continue

    IdentifierName.lastIndex = lastIndex
    if match = IdentifierName.exec(input)
      lastIndex = IdentifierName.lastIndex
      lastSignificantToken = match[0]
      yield {
        type: "IdentifierName",
        value: match[0],
      }
      continue

    Punctuator.lastIndex = lastIndex
    if match = Punctuator.exec(input)
      lastIndex = Punctuator.lastIndex
      lastSignificantToken = match[0]
      yield {
        type: "Punctuator",
        value: match[0],
      }
      continue

    LineTerminatorSequence.lastIndex = lastIndex
    if match = LineTerminatorSequence.exec(input)
      lastIndex = LineTerminatorSequence.lastIndex
      yield {
        type: "LineTerminatorSequence",
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

    lastIndex++
    lastSignificantToken = firstChar
    yield {
      type: "Invalid",
      value: firstChar,
    }

