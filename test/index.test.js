import { describe, test, expect } from "vitest";
import jsTokens from "../build/index.js";

function testToken(name, preceding, fn) {
  describe(name, () => {
    fn(matchHelper.bind(undefined, name, preceding));
  });
}

function matchHelper(type, preceding, string, expected = string, extra = {}) {
  if (typeof expected === "object" && !Array.isArray(expected)) {
    extra = expected;
    expected = string;
  }

  const title = [
    printInvisibles(string),
    expected === string ? undefined : JSON.stringify(expected),
  ]
    .filter(Boolean)
    .join(" → ");

  test(title, () => {
    const tokens = Array.from(
      jsTokens(preceding.join("") + string, { jsx: type.startsWith("JSX") }),
    );
    expect(tokens.length).toBeGreaterThanOrEqual(preceding.length + 1);
    expect(
      tokens.slice(0, preceding.length).map((token) => token.value),
    ).toEqual(preceding);
    const token = tokens[preceding.length];
    if (expected === false) {
      expect(token.type).not.toBe(type);
    } else {
      if (Array.isArray(expected)) {
        expect(tokens.map((token2) => token2.value)).toEqual(
          preceding.concat(expected),
        );
      } else {
        expect(token.type).toBe(type);
        expect(token.value).toBe(expected);
        if (expected === string) {
          expect(tokens).toHaveLength(preceding.length + 1);
        }
        if ("closed" in token) {
          const { closed = true } = extra;
          expect(token.closed).toBe(closed);
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
        (char) =>
          `\\x${char.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()}`,
      );
  }

  return string
    .split("")
    .map(
      (char) =>
        escapeTable[char] ||
        `\\u${char.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase()}`,
    )
    .join("");
}

describe("jsTokens", () => {
  test("is a function", () => {
    expect(typeof jsTokens).toBe("function");
  });

  test("empty string", () => {
    expect(Array.from(jsTokens(""))).toEqual([]);
  });

  test("succeeds for any single character", () => {
    for (let c = 0; c <= 0xffff; c++) {
      expect(() => jsTokens(String.fromCharCode(c))).not.toThrow();
    }
  });
});

describe("Token", () => {
  testToken("Invalid", [], (match) => {
    match("@");
    match("#");
    match("\\");
    match("\\xa9", "\\");
    match("\u0000");
    match("\u007F");
    match("☃");
    match("💩");
    match("\ud83d"); // First half of 💩
  });

  testToken("WhiteSpace", [], (match) => {
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

  testToken("LineTerminatorSequence", [], (match) => {
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

  testToken("SingleLineComment", [], (match) => {
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

  testToken("HashbangComment", [], (match) => {
    match("#!");
    match("#!comment");
    match("#! comment");
    match("#!comment ");
    match("#!comment\n", "#!comment");
    match("#!comment\r", "#!comment");
    match("#!comment\u2028", "#!comment");
    match("#!comment\u2029", "#!comment");
    match("#!comment\r\n", "#!comment");
    match("#!comment \n", "#!comment ");
    match("#!comment\t\n", "#!comment\t");
    match("#!comment\ncode", ["#!comment", "\n", "code"]);
    match("#!comment\r\ncode", ["#!comment", "\r\n", "code"]);
    match(" #!", false);
    match("\n#!", false);
  });

  testToken("MultiLineComment", [], (match) => {
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

  testToken("StringLiteral", [], (match) => {
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

  testToken("NoSubstitutionTemplate", [], (match) => {
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

    match("`${}`", ["`${", "}`"]);
    match("`${a}`", ["`${", "a", "}`"]);
    match("`a${b}c`", ["`a${", "b", "}c`"]);
    match("`${`a`}`", ["`${", "`a`", "}`"]);
    match("`${`${a}`}`", ["`${", "`${", "a", "}`", "}`"]);
    match("`${fn({a: b})}`", [
      "`${",
      "fn",
      "(",
      "{",
      "a",
      ":",
      " ",
      "b",
      "}",
      ")",
      "}`",
    ]);
    match("`${fn({a: '{'})}`", [
      "`${",
      "fn",
      "(",
      "{",
      "a",
      ":",
      " ",
      "'{'",
      "}",
      ")",
      "}`",
    ]);
    match("`\\${{{}}}a`");
    match("`${}", ["`${", "}"]);
  });

  testToken("NumericLiteral", [], (match) => {
    match("0");
    match("0n");
    match("000");
    match("000n", "000");
    match("1000");
    match("1000n");
    match("0001");
    match("0008");
    match("00090");
    match("1");
    match("1n");
    match("1.");
    match("0.");
    match("00.", "00");
    match("07.", "07");
    match("08.", "08.");
    match("09.", "09.");
    match("00.0", "00");
    match("07.0", "07");
    match("08.0", "08.0");
    match("09.5", "09.5");
    match("019.5", "019.5");
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
    match("08e1");
    match("07e1", "07");
    match("00e1", "00");

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

    match("_0", false);
    match("_0n", false);
    match("_.0", false);
    match("_0.0", false);
    match("_0e0", false);
    match("_0x0", false);
    match("_0x0n", false);
    match("_0o0", false);
    match("_0o0n", false);
    match("_0b0", false);
    match("_0b0n", false);

    match("0_", "0");
    match("0n_", "0n");
    match(".0_", ".0");
    match("0.0_", "0.0");
    match("0e0_", "0e0");
    match("0x0_", "0x0");
    match("0o0_", "0o0");
    match("0b0_", "0b0");

    match("0_n", "0");
    match("1_n", "1");
    match("0_.0", "0");
    match("1_.0", "1");
    match("0_e0", "0");
    match("1_e0", "1");
    match("0_x0", "0");
    match("0_x0n", "0");
    match("0_o0", "0");
    match("0_o0n", "0");
    match("0_b0", "0");
    match("0_b0n", "0");

    match("0._0", "0.");
    match("0e_0", "0");
    match("0x_0", "0");
    match("0x_0n", "0");
    match("0o_0", "0");
    match("0o_0n", "0");
    match("0b_0", "0");
    match("0b_0n", "0");

    match("0_0", "0");
    match("0_0n", "0");
    match("1_0");
    match("1_0n");
    match(".0_0");
    match("0.0_0");
    match("0e0_0");
    match("0x0_0");
    match("0x0_0n");
    match("0o0_0");
    match("0o0_0n");
    match("0b0_0");
    match("0b0_0n");

    match("1__0", "1");
    match("1__0n", "1");
    match("1__0.0", "1");
    match(".0__0", ".0");
    match("0.0__0", "0.0");
    match("1__0e0", "1");
    match("0e0__0", "0e0");
    match("0x0__0", "0x0");
    match("0x0__0n", "0x0");
    match("0o0__0", "0o0");
    match("0o0__0n", "0o0");
    match("0b0__0", "0b0");
    match("0b0__0n", "0b0");

    match("0x0_fg", "0x0_f");
    match("0o0_78", "0o0_7");
    match("0b0_12", "0b0_1");

    match("1_2_3_4_5_6_7_8_9_0");
    match("1_2_3_4_5_6_7_8_9_0n");
    match(".0_1_2_3_4_5_6_7_8_9");
    match("1_2_3_4_5_6_7_8_9_0.0_1_2_3_4_5_6_7_8_9");
    match("1_2_3_4_5_6_7_8_9_0.0_1_2_3_4_5_6_7_8_9e+0_1_2_3_4_5_6_7_8_9");
    match("0x0_1_2_3_4_5_6_7_8_9_a_b_c_d_e_f");
    match("0X0_1_2_3_4_5_6_7_8_9_a_b_c_d_e_f");
    match("0x0_1_2_3_4_5_6_7_8_9_a_b_c_d_e_fn");
    match("0X0_1_2_3_4_5_6_7_8_9_a_b_c_d_e_fn");
    match("0o0_1_2_3_4_5_6_7");
    match("0O0_1_2_3_4_5_6_7");
    match("0o0_1_2_3_4_5_6_7n");
    match("0O0_1_2_3_4_5_6_7n");
    match("0b0_1_1_0");
    match("0B0_1_1_0");
    match("0b0_1_1_0n");
    match("0B0_1_1_0n");

    match("1_335_000");
    match("0b111_111_000");
    match("0b1111_10101011_11110000_00001101");
    match("0xFAB_F00D");
    match("9.109_383_56e-31");
    match("1e1_2");
  });

  testToken("IdentifierName", [], (match) => {
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
    match("℮");
    match("℘");
    match("゛");
    match("゜");
    match("℮℘");
    match("·", false);
    match("℮·");
    match("·", false);
    match("℮·");
    match("᧚", false);
    match("℮᧚");
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

  testToken("PrivateIdentifier", [], (match) => {
    match("#", false);
    match("#$");
    match("#_");
    match("#a");
    match("#z");
    match("#A");
    match("#Z");
    match("#å");
    match("#π");
    match("#0", false);
    match("#0a", false);
    match("#$0");
    match("#_0");
    match("#a0");
    match("#z0");
    match("#A0");
    match("#Z0");
    match("#å0");
    match("#π0");
    match("#a_56åπ");
    match("#℮");
    match("#℘");
    match("#゛");
    match("#゜");
    match("#℮℘");
    match("#·", false);
    match("#℮·");
    match("#·", false);
    match("#℮·");
    match("#᧚", false);
    match("#℮᧚");
    match("#Iñtërnâtiônàlizætiøn");

    match("#a\u00a0", "#a");
    match("#a\u1680", "#a");
    match("#a\u2000", "#a");
    match("#a\u2001", "#a");
    match("#a\u2002", "#a");
    match("#a\u2003", "#a");
    match("#a\u2004", "#a");
    match("#a\u2005", "#a");
    match("#a\u2006", "#a");
    match("#a\u2007", "#a");
    match("#a\u2008", "#a");
    match("#a\u2009", "#a");
    match("#a\u200a", "#a");
    match("#a\u2028", "#a");
    match("#a\u2029", "#a");
    match("#a\u202f", "#a");
    match("#a\u205f", "#a");
    match("#a\u3000", "#a");

    match("#\\u0000");
    match("#\\u15cF");
    match("#\\u15cG", false);
    match("#\\u000", false);
    match("#\\u00000");
    match("#a\\u0000b");

    match("#\\u{0}");
    match("#\\u{01}");
    match("#\\u{012}");
    match("#\\u{0123}");
    match("#\\u{01234}");
    match("#\\u{012345}");
    match("#\\u{0123456}");
    match("#\\u{00000000000000a0}");
    match("#\\u{15cF}");
    match("#\\u{15cG}", false);
    match("#a\\u{0000}b");

    match("#\\x09", false);
  });

  testToken("RegularExpressionLiteral", [], (match) => {
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
    match("/a[/]/");
    match("/a[\\]]/");
    match("/a[\\]/]/");
    match("/a[\\\\]/]/", "/a[\\\\]/");
    match("/a[\\\\\\]/]/");
    match("/abc]xyz/", "/abc]xyz/");
    match("/\\u05aF/");
    match("/invalid escape sequence is OK: \\u/");
    match("/?foo/");
    match("/*foo/", false);

    match("/[p{Decimal_Number}--[0-9]]/v");
    match("/[[[a-z]--[b-d]]&&[0-2[q{a|bc|def}]]]/v");
    match("/[/]/v"); // Valid token, invalid at later regex parsing stage.
    match("/[[a]/]/v", "/[[a]/"); // This is why slash isn't valid in character class when nesting came to play.

    match("/a/d");
    match("/a/g");
    match("/a/m");
    match("/a/i");
    match("/a/y");
    match("/a/u");
    match("/a/s");
    match("/a/dgmiyus");
    match("/a/myg");
    match("/a/e");
    match("/a/E");
    match("/a/invalidFlags");
    match("/a/f00", "/a/f00");

    match("/\n/", "/", { closed: false });
    match("/\r/", "/", { closed: false });
    match("/\u2028/", "/", { closed: false });
    match("/\u2029/", "/", { closed: false });
    match("/\r\n/", "/", { closed: false });
    match("/\\\n/", "/\\", { closed: false });
    match("/\\\r/", "/\\", { closed: false });
    match("/\\\u2028/", "/\\", { closed: false });
    match("/\\\u2029/", "/\\", { closed: false });
    match("/\\\r\n/", "/\\", { closed: false });
    match("/[\n]/", "/[", { closed: false });
    match("/[\r]/", "/[", { closed: false });
    match("/[\u2028]/", "/[", { closed: false });
    match("/[\u2029]/", "/[", { closed: false });
    match("/[\r\n]/", "/[", { closed: false });
    match("/[\\\n]/", "/[\\", { closed: false });
    match("/[\\\r]/", "/[\\", { closed: false });
    match("/[\\\u2028]/", "/[\\", { closed: false });
    match("/[\\\u2029]/", "/[\\", { closed: false });
    match("/[\\\r\n]/", "/[\\", { closed: false });

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
    match("/a/**/", ["/a/", "**", "/"]);

    match("/a/g0", "/a/g0");
    match("/a/g0.1", "/a/g0");
    match("/a/g.1", "/a/g");
    match("/a/g0x1", "/a/g0x1");

    match("/a/ge", "/a/ge");
    match("/a/g_", "/a/g_");
    match("/a/g$", "/a/g$");
    match("/a/gé", "/a/gé");

    match("{}/a/g", ["{", "}", "/a/g"]);
    match("function x(){}\n/a/g", [
      "function",
      " ",
      "x",
      "(",
      ")",
      "{",
      "}",
      "\n",
      "/a/g",
    ]);
  });

  testToken("Punctuator", [], (match) => {
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
    match("1/2", ["1", "/", "2"]);
    match("//", false);
    match("x/=2", ["x", "/=", "2"]);
    match("//=", false);
    match("%");
    match("%%", "%");
    match("%=");
    match("%%=", "%");
    match("&");
    match("&&");
    match("&=");
    match("&&=");
    match("|");
    match("||");
    match("|=");
    match("||=");
    match("??");
    match("??=");
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

    match("+{}/a/g", ["+", "{", "}", "/", "a", "/", "g"]);
    match("-{}/a/g", ["-", "{", "}", "/", "a", "/", "g"]);
    match("++{}/a/g", ["++", "{", "}", "/", "a", "/", "g"]);
    match("--{}/a/g", ["--", "{", "}", "/", "a", "/", "g"]);
    match("+{}++/a/g", ["+", "{", "}", "++", "/", "a", "/", "g"]);
    match("+{}--/a/g", ["+", "{", "}", "--", "/", "a", "/", "g"]);
  });
});

describe("JSXToken", () => {
  testToken("JSXInvalid", ["<", "a"], (match) => {
    match("<", false);
  });

  testToken("JSXInvalid", ["<"], (match) => {
    match(">", false);
    match("{", false);
    match("}", false);
    match("1");
    match("`");
    match("+");
    match(",");
    match("@");
    match("#");
    match("\\");
    match("\\xa9", "\\");
    match("\u0000");
    match("\u007F");
    match("☃");
    match("💩");
    match("\ud83d"); // First half of 💩
  });

  testToken("JSXInvalid", ["<", ">"], (match) => {
    match("<", false);
    match(">");
    match("{", false);
    match("}");
    match("1", false);
    match("`", false);
    match("+", false);
    match(",", false);
    match("@", false);
    match("#", false);
    match("\\", false);
    match("\\xa9", false);
    match("\u0000", false);
    match("\u007F", false);
    match("☃", false);
    match("💩", false);
    match("\ud83d", false); // First half of 💩
  });

  testToken("JSXString", ["<"], (match) => {
    match("''");
    match('""');
    match("'string'");
    match('"string"');
    match("'\\''", "'\\'");
    match('"\\""', '"\\"');
    match("'\\\\''", "'\\\\'");
    match('"\\\\""', '"\\\\"');
    match("'\n'");
    match('"\n"');
    match("'\r'");
    match('"\r"');
    match("'\u2028'");
    match('"\u2028"');
    match("'\u2029'");
    match('"\u2029"');
    match("'\r\n'");
    match('"\r\n"');
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
    match("'\n", { closed: false });
    match('"\n', { closed: false });
    match("'\r", { closed: false });
    match('"\r', { closed: false });
    match("'\u2028", { closed: false });
    match('"\u2028', { closed: false });
    match("'\u2029", { closed: false });
    match('"\u2029', { closed: false });
    match("'\r\n", { closed: false });
    match('"\r\n', { closed: false });
  });

  testToken("JSXText", ["<", ">"], (match) => {
    match("  /**///\n\t/+?.& some text Iñtërnâtiônàlizætiøn");
    match("1<5", "1");
    match("2>1", "2");
    match("a{1}", "a");
    match("a}", "a");
  });

  testToken("JSXPunctuator", ["<", "a"], (match) => {
    match("<");
    match("=");
  });

  testToken("JSXPunctuator", ["<"], (match) => {
    match(">");
    match("/");
    match(".");
    match(":");
    match("{");
    match("}");

    match("+", false);
    match("-", false);
    match("*", false);
    match("^", false);
    match("~", false);
    match("(", false);
    match(")", false);
    match("[", false);
    match("]", false);
    match("!", false);
    match("?", false);
    match(",", false);
    match(";", false);
  });

  testToken("JSXPunctuator", ["<", ">"], (match) => {
    match("<");
    match(">", false);
    match("{");
    match("}", false);
  });

  testToken("JSXIdentifier", ["<"], (match) => {
    match("#div", false);
    match("div");
    match("class");
    match("xml");
    match("x-element");
    match("x------");
    match("$htm1_element");
    match("ಠ_ಠ");
    match("-", false);
    match("-f--", ["-", "f--"]);

    match("#", false);
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
    match("℮");
    match("℘");
    match("゛");
    match("゜");
    match("℮℘");
    match("·", false);
    match("℮·");
    match("·", false);
    match("℮·");
    match("᧚", false);
    match("℮᧚");
    match("Iñtërnâtiônàlizætiøn");
  });

  testToken("JSXIdentifier", ["<", ">"], (match) => {
    match("div", false);
  });
});
