"use strict";

const { default: jsTokens } = require("../");

function token(name, fn) {
  describe(name, () => {
    fn(matchHelper.bind(undefined, name));
  });
}

const endSequences = {
  StringLiteral: /^['"]$/,
  Template: "`",
  MultiLineComment: "*/",
};

function matchHelper(type, string, expected, extra = {}) {
  if (typeof expected === "object" && !Array.isArray(expected)) {
    extra = expected;
    expected = undefined;
  }

  jsTokens.lastIndex = 0;
  const match = jsTokens.exec(string);

  test(printInvisibles(String(string)), () => {
    if (expected === false) {
      expect(match.groups[type]).toBeUndefined();
    } else {
      if (Array.isArray(expected)) {
        expect(Array.from(string.match(jsTokens))).toEqual(expected);
      } else {
        expect(match.groups[type]).toBe(
          typeof expected === "string" ? expected : string
        );
      }

      const expectedEnd = endSequences[type];
      if (expectedEnd != null) {
        const end = match.groups[`${type}End`];
        if (extra.closed === false) {
          expect(end).toBeUndefined();
        } else if (expectedEnd instanceof RegExp) {
          expect(end).toMatch(expectedEnd);
        } else {
          expect(end).toBe(expectedEnd);
        }
      }
    }
  });
}

const escapeTable = {
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\v": "\\v",
  " ": "\\x20",
};

function printInvisibles(string) {
  if (string === "") {
    return "(empty string)";
  }

  if (/\S/.test(string)) {
    return string
      .replace(/\r/g, "␍")
      .replace(/\n/g, "␊")
      .replace(
        // eslint-disable-next-line no-control-regex
        /[\x00-\x1f]/g,
        char =>
          `\\x${char
            .charCodeAt(0)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase()}`
      );
  }

  return string
    .split("")
    .map(
      char =>
        escapeTable[char] ||
        `\\u${char
          .charCodeAt(0)
          .toString(16)
          .padStart(4, "0")
          .toUpperCase()}`
    )
    .join("");
}

describe("jsTokens", () => {
  test("is a regex", () => {
    expect(jsTokens).toBeInstanceOf(RegExp);
  });
});

describe("tokens", () => {
  token("WhiteSpace", match => {
    match(" ");
    match("    ");
    match(" a", " ");
    match("\t");
    match("\t\t\t");
    match("\ta", "\t");
    match("\f");
    match("\v");

    match("\u00a0");
    match("\u1680");
    match("\u2000");
    match("\u2001");
    match("\u2002");
    match("\u2003");
    match("\u2004");
    match("\u2005");
    match("\u2006");
    match("\u2007");
    match("\u2008");
    match("\u2009");
    match("\u200a");
    match("\u202f");
    match("\u205f");
    match("\u3000");
  });

  token("LineTerminatorSequence", match => {
    match("\n");
    match("\n\n\n", ["\n", "\n", "\n"]);
    match("\na", "\n");
    match("\r");
    match("\r\r\r", ["\r", "\r", "\r"]);
    match("\ra", "\r");
    match("\r\n");
    match("\r\n\r\n\r\n", ["\r\n", "\r\n", "\r\n"]);
    match("\r\na", "\r\n");
    match("\u2028");
    match("\u2029");
    match(" \t\n\r \r\n", [" \t", "\n", "\r", " ", "\r\n"]);
    match(" \t\n\r \r\n-1", [" \t", "\n", "\r", " ", "\r\n", "-", "1"]);
  });

  token("SingleLineComment", match => {
    match("//");
    match("//comment");
    match("// comment");
    match("//comment ");
    match("///");
    match("//**//");
    match("//comment\n", "//comment");
    match("//comment\r", "//comment");
    match("//comment\u2028", "//comment");
    match("//comment\u2029", "//comment");
    match("//comment\r\n", "//comment");
    match("//comment \n", "//comment ");
    match("//comment\t\n", "//comment\t");
  });

  token("MultiLineComment", match => {
    match("/**/");
    match("/*comment*/");
    match("/* comment */");
    match("/***/");
    match("/*/*/");
    match("/*\n\r\u2028\u2029 \r\n*/");

    match("/*", { closed: false });
    match("/*/", { closed: false });
    match("/*unclosed", { closed: false });
    match("/*unclosed\nnew Line(this == code ? true : false)", {
      closed: false,
    });
  });

  token("StringLiteral", match => {
    match("''");
    match('""');
    match("'string'");
    match('"string"');
    match("'\\''");
    match('"\\""');
    match("'\\\\''", "'\\\\'");
    match('"\\\\""', '"\\\\"');
    match("'\\\\\\''");
    match('"\\\\\\""');
    match("'\\u05aF'");
    match('"\\u05aF"');
    match("'invalid escape sequence is OK: \\u'");
    match('"invalid escape sequence is OK: \\u"');
    match("'\\\n'");
    match('"\\\n"');
    match("'\\\r'");
    match('"\\\r"');
    match("'\u2028'");
    match('"\u2028"');
    match("'\u2029'");
    match('"\u2029"');
    match("'\\\u2028'");
    match('"\\\u2028"');
    match("'\\\u2029'");
    match('"\\\u2029"');
    match("'\\\r\n'");
    match('"\\\r\n"');
    match("'string'code'another string'", "'string'");
    match('"string"code"another string"', '"string"');
    match("'\"'");
    match("'`'");
    match('"\'"');
    match('"`"');

    match("'", { closed: false });
    match('"', { closed: false });
    match("'unclosed", { closed: false });
    match('"unclosed', { closed: false });
    match("'\n", "'", { closed: false });
    match('"\n', '"', { closed: false });
    match("'\r", "'", { closed: false });
    match('"\r', '"', { closed: false });
    match("'\u2028", { closed: false });
    match('"\u2028', { closed: false });
    match("'\u2029", { closed: false });
    match('"\u2029', { closed: false });
    match("'\r\n", "'", { closed: false });
    match('"\r\n', '"', { closed: false });
    match("'\\\n", { closed: false });
    match('"\\\n', { closed: false });
    match("'\\\r", { closed: false });
    match('"\\\r', { closed: false });
    match("'\\\u2028", { closed: false });
    match('"\\\u2028', { closed: false });
    match("'\\\u2029", { closed: false });
    match('"\\\u2029', { closed: false });
    match("'\\\r\n", { closed: false });
    match('"\\\r\n', { closed: false });

    match("'${}'");
    match('"${}"');
    match("'${a}'");
    match('"${a}"');
    match("'a${b}c'");
    match('"a${b}c"');
    match("'${'a'}'", "'${'");
    match('"${"a"}"', '"${"');
  });

  token("Template", match => {
    match("``");
    match("`string`");
    match("`\\``");
    match("`\\\\``", "`\\\\`");
    match("`\\\\\\``");
    match("`\\u05aF`");
    match("`invalid escape sequence is OK: \\u`");
    match("`\\\n`");
    match("`\\\r`");
    match("`\u2028`");
    match("`\u2029`");
    match("`\\\u2028`");
    match("`\\\u2029`");
    match("`\\\r\n`");
    match("`string`code`another string`", "`string`");
    match("`'`");
    match('`"`');

    match("`", { closed: false });
    match("`unclosed", { closed: false });
    match("`\n", { closed: false });
    match("`\r", { closed: false });
    match("`\u2028", { closed: false });
    match("`\u2029", { closed: false });
    match("`\r\n", { closed: false });
    match("`\\\n", { closed: false });
    match("`\\\r", { closed: false });
    match("`\\\u2028", { closed: false });
    match("`\\\u2029", { closed: false });
    match("`\\\r\n", { closed: false });

    match("`${}`");
    match("`${a}`");
    match("`a${b}c`");
    match("`${`a`}`");
    match("`${`${a}`}`");
    match("`${fn({a: b})}`");
    match("`${fn({a: '{'})}`");
    match("`a${}${a}${ `${b\r}` + `${`c`}` } d $${\n(x=>{return x*2})(4)}$`");
    match("`\\${{{}}}a`");

    match("`a ${b c`.length", { closed: false });
    match("`a ${`b${c`} d`.length", { closed: false });
    match("`a ${ {c:d } e`.length", { closed: false });
  });

  token("RegularExpressionLiteral", match => {
    match("//", false);
    match("/a/");
    match("/\\//");
    match("/\\\\//", "/\\\\/");
    match("/\\\\\\//");
    match("/[/]/");
    match("/[\\]]/");
    match("/[\\]/]/");
    match("/[\\\\]/]/", "/[\\\\]/");
    match("/[\\\\\\]/]/");
    match("/\\u05aF/");
    match("/invalid escape sequence is OK: \\u/");
    match("/?foo/");
    match("/*foo/", false);

    match("/a/g");
    match("/a/m");
    match("/a/i");
    match("/a/y");
    match("/a/u");
    match("/a/s");
    match("/a/gmiyus");
    match("/a/myg");
    match("/a/e");
    match("/a/E");
    match("/a/invalidFlags");
    match("/a/f00", "/a/f");

    match("/\n/", false);
    match("/\r/", false);
    match("/\u2028/", false);
    match("/\u2029/", false);
    match("/\r\n/", false);
    match("/\\\n/", false);
    match("/\\\r/", false);
    match("/\\\u2028/", false);
    match("/\\\u2029/", false);
    match("/\\\r\n/", false);
    match("/[\n]/", false);
    match("/[\r]/", false);
    match("/[\u2028]/", false);
    match("/[\u2029]/", false);
    match("/[\r\n]/", false);
    match("/[\\\n]/", false);
    match("/[\\\r]/", false);
    match("/[\\\u2028]/", false);
    match("/[\\\u2029]/", false);
    match("/[\\\r\n]/", false);

    match("/a/", "/a/");
    match("/a/g", "/a/g");
    match("/a///", "/a/");
    match("/a/g//", "/a/g");
    match("/a/ //", "/a/");
    match("/a/g //", "/a/g");
    match("/a//**/", "/a/");
    match("/a/g/**/", "/a/g");
    match("/a/ /**/", "/a/");
    match("/a/g /**/", "/a/g");

    match("/a/g0", "/a/g");
    match("/a/g0.1", "/a/g");
    match("/a/g.1", "/a/g");
    match("/a/g0x1", "/a/g");

    match("/a/ge", "/a/ge");
    match("/a/g_", "/a/g");
    match("/a/g$", "/a/g");
    match("/a/gé", "/a/g");

    match("await/a/g", ["await", "/a/g"]);
    match("case/a/g", ["case", "/a/g"]);
    match("export default/a/g", ["export", " ", "default", "/a/g"]);
    match("delete/a/g", ["delete", "/a/g"]);
    match("do/a/g", ["do", "/a/g"]);
    match("else/a/g", ["else", "/a/g"]);
    match("extends/a/g", ["extends", "/a/g"]);
    match("instanceof/a/g", ["instanceof", "/a/g"]);
    match("new/a/g", ["new", "/a/g"]);
    match("return/a/g", ["return", "/a/g"]);
    match("throw/a/g", ["throw", "/a/g"]);
    match("typeof/a/g", ["typeof", "/a/g"]);
    match("void/a/g", ["void", "/a/g"]);
    match("yield/a/g", ["yield", "/a/g"]);

    match("if(x){/a/g", ["if", "(", "x", ")", "{", "/a/g"]);
    match("(/a/g)", ["(", "/a/g", ")"]);
    match("[/a/g]", ["[", "/a/g", "]"]);
    match("x,/a/g", ["x", ",", "/a/g"]);
    match(";/a/g", [";", "/a/g"]);
    match("~/a/g", ["~", "/a/g"]);
    match("+/a/g", ["+", "/a/g"]);
    match("x+/a/g", ["x", "+", "/a/g"]);
    match("x+=/a/g", ["x", "+=", "/a/g"]);
    match("-/a/g", ["-", "/a/g"]);
    match("x-/a/g", ["x", "-", "/a/g"]);
    match("x-=/a/g", ["x", "-=", "/a/g"]);
    match("x//a/g", ["x", "//a/g"]);
    match("x/ /a/g", ["x", "/", " ", "/a/g"]);
    match("x/=/a/g", ["x", "/=", "/a/g"]);
    match("x%/a/g", ["x", "%", "/a/g"]);
    match("x%=/a/g", ["x", "%=", "/a/g"]);
    match("x&/a/g", ["x", "&", "/a/g"]);
    match("x&=/a/g", ["x", "&=", "/a/g"]);
    match("x&&/a/g", ["x", "&&", "/a/g"]);
    match("x|/a/g", ["x", "|", "/a/g"]);
    match("x|=/a/g", ["x", "|=", "/a/g"]);
    match("x||/a/g", ["x", "||", "/a/g"]);
    match("x^/a/g", ["x", "^", "/a/g"]);
    match("x^=/a/g", ["x", "^=", "/a/g"]);
    match("x*/a/g", ["x", "*", "/a/g"]);
    match("x*=/a/g", ["x", "*=", "/a/g"]);
    match("x**/a/g", ["x", "**", "/a/g"]);
    match("x**=/a/g", ["x", "**=", "/a/g"]);
    match("x</a/g", ["x", "<", "/a/g"]);
    match("x<=/a/g", ["x", "<=", "/a/g"]);
    match("x<</a/g", ["x", "<<", "/a/g"]);
    match("x<<=/a/g", ["x", "<<=", "/a/g"]);
    match("x>/a/g", ["x", ">", "/a/g"]);
    match("x>=/a/g", ["x", ">=", "/a/g"]);
    match("x>>/a/g", ["x", ">>", "/a/g"]);
    match("x>>=/a/g", ["x", ">>=", "/a/g"]);
    match("x>>>/a/g", ["x", ">>>", "/a/g"]);
    match("x>>>=/a/g", ["x", ">>>=", "/a/g"]);
    match("x=/a/g", ["x", "=", "/a/g"]);
    match("x==/a/g", ["x", "==", "/a/g"]);
    match("x===/a/g", ["x", "===", "/a/g"]);
    match("x!=/a/g", ["x", "!=", "/a/g"]);
    match("x!==/a/g", ["x", "!==", "/a/g"]);
    match("x??/a/g", ["x", "??", "/a/g"]);
    match("x?/a/g:/b/i", ["x", "?", "/a/g", ":", "/b/i"]);
    match("{.../a/g}", ["{", "...", "/a/g", "}"]);
    match("x=>/a/g", ["x", "=>", "/a/g"]);

    match("await /a/g", ["await", " ", "/a/g"]);
    match("await \n /a/g", ["await", " ", "\n", " ", "/a/g"]);
    match("await //comment1\n /*/a*//a/g", [
      "await",
      " ",
      "//comment1",
      "\n",
      " ",
      "/*/a*/",
      "/a/g",
    ]);
    match("&& //comment1\n /*/a*//a/g", [
      "&&",
      " ",
      "//comment1",
      "\n",
      " ",
      "/*/a*/",
      "/a/g",
    ]);
  });

  token("NumericLiteral", match => {
    match("0");
    match("0n");
    match("000");
    match("000n", "000");
    match("1000");
    match("1000n");
    match("1");
    match("1n");
    match("1.");
    match("1n.", "1n");
    match("1.n", "1.");
    match("1..", "1.");
    match("0.1");
    match("0.1n", "0.1");
    match(".1");
    match(".1n", ".1");
    match("0.1.", "0.1");

    match("-1", false);
    match("-1.", false);
    match("-1..", false);
    match("-0.1", false);
    match("-.1", false);
    match("-0.1.", false);
    match("-", false);

    match("1e1");
    match("1ne1", "1n");
    match("1e1n", "1e1");
    match("1.e1");
    match("1.e1.", "1.e1");
    match("0.1e1");
    match(".1e1");
    match("0.1e1.", "0.1e1");

    match("1e+1");
    match("1e-1");
    match("1e0123");
    match("1e0.123", "1e0");
    match("1e0x123", "1e0");
    match("1E1");
    match("1E+1");
    match("1E-1");
    match("1E0123");
    match("1E0.123", "1E0");
    match("1E0x123", "1E0");
    match("1E0o123", "1E0");
    match("1E0b123", "1E0");

    match("e1", false);
    match("e+1", false);
    match("e-1", false);
    match("E1", false);
    match("E+1", false);
    match("E-1", false);

    match("-e1", false);
    match("-e+1", false);
    match("-e-1", false);
    match("-E1", false);
    match("-E+1", false);
    match("-E-1", false);

    match("0x1");
    match("0x1n");
    match("0xa");
    match("0xan");
    match("0x015cF");
    match("0x015cFn");
    match("0x1e1");
    match("0x1e1n");
    match("0x1E1");
    match("0x1E1n");
    match("0x1g1", "0x1");
    match("0x1g1n", "0x1");

    match("0X1");
    match("0X1n");
    match("0Xa");
    match("0Xan");
    match("0X015cF");
    match("0X015cFn");
    match("0X1e1");
    match("0X1e1n");
    match("0X1E1");
    match("0X1E1n");
    match("0X1g1", "0X1");
    match("0X1g1n", "0X1");

    match("-0x1", false);
    match("-0xa", false);
    match("-0x015cF", false);
    match("-0x1e1", false);
    match("-0x1E1", false);
    match("-0x1g1", false);

    match("0x", "0");
    match("1x1", "1");
    match("0x1.", "0x1");
    match("0x1.1", "0x1");
    match("0.0x1", "0.0");
    match(".0x1", ".0");

    match("0o1");
    match("0o1n");
    match("0oa", "0");
    match("0oan", "0");
    match("0o01574");
    match("0o01574n");
    match("0o1e1", "0o1");
    match("0o1e1n", "0o1");
    match("0o1E1", "0o1");
    match("0o1E1n", "0o1");
    match("0o1g1", "0o1");
    match("0o1g1n", "0o1");

    match("0O1");
    match("0O1n");
    match("0Oa", "0");
    match("0Oan", "0");
    match("0O01574");
    match("0O01574n");
    match("0O1e1", "0O1");
    match("0O1e1n", "0O1");
    match("0O1E1", "0O1");
    match("0O1E1n", "0O1");
    match("0O1g1", "0O1");
    match("0O1g1n", "0O1");

    match("-0o1", false);
    match("-0oa", false);
    match("-0o01574", false);
    match("-0o1e1", false);
    match("-0o1E1", false);
    match("-0o1g1", false);

    match("0o", "0");
    match("1o1", "1");
    match("0o1.", "0o1");
    match("0o1.1", "0o1");
    match("0.0o1", "0.0");
    match(".0o1", ".0");

    match("0b1");
    match("0b1n");
    match("0ba", "0");
    match("0ban", "0");
    match("0b01011");
    match("0b01011n");
    match("0b1e1", "0b1");
    match("0b1e1n", "0b1");
    match("0b1E1", "0b1");
    match("0b1E1n", "0b1");
    match("0b1g1", "0b1");
    match("0b1g1n", "0b1");

    match("0B1");
    match("0B1n");
    match("0Ba", "0");
    match("0Ban", "0");
    match("0B01011");
    match("0B01011n");
    match("0B1e1", "0B1");
    match("0B1e1n", "0B1");
    match("0B1E1", "0B1");
    match("0B1E1n", "0B1");
    match("0B1g1", "0B1");
    match("0B1g1m", "0B1");

    match("-0b1", false);
    match("-0ba", false);
    match("-0b01011", false);
    match("-0b1e1", false);
    match("-0b1E1", false);
    match("-0b1g1", false);

    match("0b", "0");
    match("1b1", "1");
    match("0b1.", "0b1");
    match("0b1.1", "0b1");
    match("0.0b1", "0.0");
    match(".0b1", ".0");
  });

  token("IdentifierName", match => {
    match("$");
    match("_");
    match("a");
    match("z");
    match("A");
    match("Z");
    match("å");
    match("π");
    match("0", false);
    match("0a", false);
    match("$0");
    match("_0");
    match("a0");
    match("z0");
    match("A0");
    match("Z0");
    match("å0");
    match("π0");
    match("a_56åπ");
    match("Iñtërnâtiônàlizætiøn");

    match("a\u00a0", "a");
    match("a\u1680", "a");
    match("a\u2000", "a");
    match("a\u2001", "a");
    match("a\u2002", "a");
    match("a\u2003", "a");
    match("a\u2004", "a");
    match("a\u2005", "a");
    match("a\u2006", "a");
    match("a\u2007", "a");
    match("a\u2008", "a");
    match("a\u2009", "a");
    match("a\u200a", "a");
    match("a\u2028", "a");
    match("a\u2029", "a");
    match("a\u202f", "a");
    match("a\u205f", "a");
    match("a\u3000", "a");

    match("\\u0000");
    match("\\u15cF");
    match("\\u15cG", false);
    match("\\u000", false);
    match("\\u00000");
    match("a\\u0000b");

    match("\\u{0}");
    match("\\u{01}");
    match("\\u{012}");
    match("\\u{0123}");
    match("\\u{01234}");
    match("\\u{012345}");
    match("\\u{0123456}");
    match("\\u{00000000000000a0}");
    match("\\u{15cF}");
    match("\\u{15cG}", false);
    match("a\\u{0000}b");

    match("\\x09", false);
  });

  token("Punctuator", match => {
    match("+");
    match("++");
    match("+=");
    match("++=", "++");
    match("-");
    match("--");
    match("-=");
    match("--=", "--");
    match("*");
    match("**");
    match("*=");
    match("**=");
    match("/");
    match("//", false);
    match("/=");
    match("//=", false);
    match("%");
    match("%%", "%");
    match("%=");
    match("%%=", "%");
    match("&");
    match("&&");
    match("&=");
    match("&&=", "&&");
    match("|");
    match("||");
    match("|=");
    match("||=", "||");
    match("^");
    match("^^", "^");
    match("^=");
    match("^^=", "^");
    match("<");
    match("<<");
    match("<<<", "<<");
    match("<=");
    match("<<=");
    match(">");
    match(">>");
    match(">>>");
    match(">=");
    match(">>=");
    match(">>>=");
    match("!");
    match("!=");
    match("!==");
    match("!===", "!==");
    match("=");
    match("==");
    match("===");

    match("=>");
    match("==>", "==");
    match("=>>", "=>");

    match("...");
    match("..", ".");
    match(".");
    match("....", "...");

    match("?.");
    match("x?.a", ["x", "?.", "a"]);
    match("x?.0:1", ["x", "?", ".0", ":", "1"]);

    match("??");
    match("???", ["??", "?"]);

    match("?");
    match("~");
    match(".");
    match(",");
    match(":");
    match(";");
    match("[");
    match("]");
    match("(");
    match(")");
    match("{");
    match("}");

    match("xawait/a/g", ["xawait", "/", "a", "/", "g"]);
    match("xcase/a/g", ["xcase", "/", "a", "/", "g"]);
    match("xdefault/a/g", ["xdefault", "/", "a", "/", "g"]);
    match("xdelete/a/g", ["xdelete", "/", "a", "/", "g"]);
    match("xdo/a/g", ["xdo", "/", "a", "/", "g"]);
    match("xelse/a/g", ["xelse", "/", "a", "/", "g"]);
    match("xextends/a/g", ["xextends", "/", "a", "/", "g"]);
    match("xinstanceof/a/g", ["xinstanceof", "/", "a", "/", "g"]);
    match("xnew/a/g", ["xnew", "/", "a", "/", "g"]);
    match("xreturn/a/g", ["xreturn", "/", "a", "/", "g"]);
    match("xthrow/a/g", ["xthrow", "/", "a", "/", "g"]);
    match("xtypeof/a/g", ["xtypeof", "/", "a", "/", "g"]);
    match("xvoid/a/g", ["xvoid", "/", "a", "/", "g"]);
    match("xyield/a/g", ["xyield", "/", "a", "/", "g"]);

    match("(1/2)/g", ["(", "1", "/", "2", ")", "/", "g"]);
    match("(x)/a/g", ["(", "x", ")", "/", "a", "/", "g"]);
    match("+{}/a/g", ["+", "{", "}", "/", "a", "/", "g"]);
    match("5./a/g", ["5.", "/", "a", "/", "g"]);
    match("x++/a/g", ["x", "++", "/", "a", "/", "g"]);
    match("x--/a/g", ["x", "--", "/", "a", "/", "g"]);
  });

  token("Invalid", match => {
    match("");
    match("@");
    match("#");
    match("\\");
    match("\\xa9", "\\");
    match("\u0000");
    match("\u007F");
    match("☃");
    match("💩");
  });
});
