"use strict";

const fs = require("fs");
const { default: jsTokens } = require("../");

describe("fixtures", () => {
  function testFile(file) {
    const contents = fs.readFileSync(`test/fixtures/${file}.js`).toString();
    const expected = require(`./fixtures/${file}.json`);
    const actual = Array.from(jsTokens(contents), (t) => t.value);
    test(`${file}.js`, () => {
      expect(actual).toEqual(expected);
      expect(actual.join("")).toBe(contents);
    });
  }

  testFile("base64");
  testFile("errors");
  testFile("slashes");
});
