"use strict";

const babelParser = require("@babel/parser");
const fastGlob = require("fast-glob");
const fs = require("fs");
const jsTokens = require("./build/index");

const usage = `
Usage:

# Run almost everything in node_modules through js-tokens:
node benchmark.js

# Run the first million lines in node_modules through js-tokens:
node benchmark.js 1e6

# Run almost everything in node_modules through @babel/parser:
node benchmark.js babel
`.trim();

function parseOption(string) {
  if (string === "babel") {
    return "babel";
  }

  const number = Number(string);
  if (Number.isFinite(number) && Number.isInteger(number) && number > 0) {
    return number;
  }

  throw new Error(`Expected "babel" or a positive integer, but got: ${string}`);
}

function parseArguments(argv) {
  switch (argv.length) {
    case 0:
      return undefined;
    case 1:
      return parseOption(argv[0]);
    default:
      throw new Error(`Expected 0 or 1 argument, but got: ${argv.length}`);
  }
}

function read() {
  return fastGlob
    .sync("node_modules/**/*.js", {
      ignore: "node_modules/test262-parser-tests",
    })
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n;\n")
    .replace(/\n#.*/g, "\n");
}

function run(argv) {
  const option = parseArguments(argv);
  const allCode = read();
  const lines = allCode.split("\n");
  const code =
    typeof option === "number" ? lines.slice(0, option).join("\n") : allCode;
  const name = option === "babel" ? "babel" : "js-tokens";

  console.log("Total chars:", allCode.length);
  console.log("Total lines:", lines.length);
  if (code !== allCode) {
    console.log("Used chars: ", code.length);
    console.log("Used lines: ", option);
  }

  console.log(
    "Average line length:",
    lines.map((line) => line.length).reduce((a, b) => a + b, 0) / lines.length
  );

  console.time(name);
  if (option === "babel") {
    try {
      const { tokens } = babelParser.parse(code, {
        tokens: true,
        errorRecovery: true,
      });
      console.log("Number of tokens:", tokens.length);
    } catch (error) {
      console.error(error);
    }
  } else {
    const tokens = Array.from(jsTokens(code));
    console.log("Number of tokens:", tokens.length);
  }
  console.timeEnd(name);
}

try {
  run(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  console.log(usage);
  process.exit(1);
}
