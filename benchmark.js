"use strict";

const babelParser = require("@babel/parser");
const fastGlob = require("fast-glob");
const fs = require("fs");
const jsTokens = require("./build/index");

const usage = `
Usage: node benchmark.js [TOKENIZER] [NUM_FILES]

TOKENIZER:
- js-tokens (default)
- babel

NUM_FILES:
Positive integer.

# Run almost everything in node_modules through js-tokens:
node benchmark.js

# Run the 1000 shortest, non-empty JS files in node_modules through @babel/parser:
node benchmark.js babel 1000
`.trim();

function parseTokenizer(string) {
  switch (string) {
    case "babel":
    case "js-tokens":
      return string;
    default:
      throw new Error(`Expected "js-tokens" or "babel", but got: ${string}`);
  }
}

function parseNumFiles(string) {
  const number = Number(string);
  if (Number.isFinite(number) && Number.isInteger(number) && number > 0) {
    return number;
  }

  throw new Error(`Expected a positive integer, but got: ${string}`);
}

function parseArguments(argv) {
  switch (argv.length) {
    case 0:
      return ["js-tokens", Infinity];
    case 1:
      return [parseTokenizer(argv[0]), Infinity];
    case 2:
      return [parseTokenizer(argv[0]), parseNumFiles(argv[1])];
    default:
      throw new Error(`Expected 0 to 2 arguments, but got: ${argv.length}`);
  }
}

function read() {
  return fastGlob
    .sync("node_modules/**/*.js", {
      ignore: ["node_modules/test262-parser-tests"],
    })
    .map((file) => [
      file,
      fs.readFileSync(file, "utf8").replace(/^#!.*\r?\n/, ""),
    ])
    .filter(
      ([, content]) =>
        /\S/.test(content) &&
        (content.trim().includes("\n") || content.length > 100)
    )
    .sort(
      ([fileA, contentA], [fileB, contentB]) =>
        contentA.length - contentB.length || fileA.localeCompare(fileB)
    )
    .map(([file, content]) => `/*${file.replace(/\*\//g, "* /")}*/ ${content}`);
}

function mean(array) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}

function median(array) {
  const sorted = array.slice().sort((a, b) => a - b);
  const half = sorted.length / 2;
  return half === 0
    ? 0
    : Number.isInteger(half)
    ? (sorted[half - 1] + sorted[half]) / 2
    : sorted[Math.floor(half)];
}

function common(array) {
  const map = new Map();
  for (const i of array) {
    map.set(i, (map.get(i) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
}

function nonEmptyLines(string) {
  return string.split("\n").filter((line) => line.length > 0);
}

const KiB = 2 ** 10;
const MiB = 2 ** 20;

function fileSize(string) {
  const byteLength = Buffer.byteLength(string, "utf8");
  return byteLength < KiB
    ? `${byteLength} B`
    : byteLength < MiB
    ? `${(byteLength / KiB).toFixed(1)} KiB`
    : `${(byteLength / MiB).toFixed(1)} MiB`;
}

function run(argv) {
  const [tokenizer, numFiles] = parseArguments(argv);
  const allFiles = read();
  const files = allFiles.slice(0, numFiles);
  const allCode = allFiles.join("\n;");
  const code = files.join("\n;");
  const fileLengths = files.map((file) => file.length);
  const lineLengths = nonEmptyLines(code).map((line) => line.length);

  console.log("Total files:", allFiles.length);
  console.log("Total chars:", allCode.length, fileSize(allCode));
  console.log("Total lines:", nonEmptyLines(allCode).length);
  if (code !== allCode) {
    console.log("Used files: ", files.length);
    console.log("Used chars: ", code.length, fileSize(code));
    console.log("Used lines: ", nonEmptyLines(code).length);
  }

  console.log("File length mean:  ", mean(fileLengths));
  console.log("File length median:", median(fileLengths));
  console.log("File length common:", common(fileLengths));
  console.log("Line length mean:  ", mean(lineLengths));
  console.log("Line length median:", median(lineLengths));
  console.log("Line length common:", common(lineLengths));

  fs.writeFileSync("benchmark.input.js", code);

  console.time(tokenizer);
  if (tokenizer === "babel") {
    try {
      const { tokens } = babelParser.parse(code, {
        tokens: true,
        errorRecovery: true,
        plugins: ["jsx", "flow"],
      });
      console.log("Number of tokens:", tokens.length);
    } catch (error) {
      console.error(error);
    }
  } else {
    // `Array.from` causes an out-of-memory crash in Node.js 10.
    const tokens = [];
    for (const token of jsTokens(code, { jsx: true })) {
      tokens.push(token);
    }
    console.log("Number of tokens:", tokens.length);
  }
  console.timeEnd(tokenizer);
}

try {
  run(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  console.log();
  console.log(usage);
  process.exit(1);
}
