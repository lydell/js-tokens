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

exports.default = ///
  (?<StringLiteral>
    ([ ' " ])
    (?:
      (?! \2 )[^ \\ \n \r ]
      |
      \\(?: \r\n | [^] )
    )*
    (?<StringLiteralEnd>\2)?
  )
  |
  (?<Template>
    `
    (?:
      [^ ` \\ $ ]
      |
      \\[^]
      |
      \$(?!\{)
      |
      \$\{
      (?:
        [^{}]
        |
        \{ [^}]* \}?
      )*
      \}?
    )*
    (?<TemplateEnd>`)?
  )
  |
  (?<MultiLineComment>
    /\*
    (?:
      [^*]
      |
      \*(?!/)
    )*
    (?<MultiLineCommentEnd> \*/ )?
  )
  |
  (?<SingleLineComment>
    //.*
  )
  |
  (?<RegularExpressionLiteral>
    (?<=
      (?:
        ^
        |
        \b(?:await|case|default|delete|do|else|extends|instanceof|new|return|throw|typeof|void|yield)
        |
        [ { ( [ . , ; < > = * / % & | ^ ! ~ ? : ]
        |
        (?<!\+)\+
        |
        (?<!-)-
        |
        [ \n \r \u2028 \u2029 ]
      )
      (?: (?!.)\s )*
    )
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
    (?:
      (?!
        \s*
        (?:
          \b
          |
          [ \u0080-\uFFFF $ \\ ' " ~ ( { ]
          |
          [ + \- ! ](?!=)
          |
          \.?\d
        )
      )
      |
      [ g m i y u s ]{1,6} \b
      (?!
        [ \u0080-\uFFFF $ \\ ]
        |
        \s*
        (?:
          [ + \- * % & | ^ < > ! = ? ( { ]
          |
          /(?! [ / * ] )
        )
      )
    )
  )
  |
  (?<NumericLiteral>
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
  )
  |
  (?<IdentifierName>
    (?=[ $ _ \p{L} \p{Nl} \\ ])
    (?:
      [$ _ \p{L} \p{Nl} \u200c \u200d \p{Mn} \p{Mc} \p{Nd} \p{Pc} ]
      |
      \\u[ \d a-f A-F ]{4}
      |
      \\u\{[ \d a-f A-F ]+\}
    )+
  )
  |
  (?<Punctuator>
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
  )
  |
  (?<LineTerminatorSequence>
    \r?\n
    |
    [ \r \u2028 \u2029 ]
  )
  |
  (?<WhiteSpace>
    [ \t \v \f \ufeff \p{Zs} ]+
  )
  |
  (?<Invalid>
    ^$
    |
    [^]
  )
///gu
