import * as coffee from "coffeescript";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const DIR = path.dirname(url.fileURLToPath(import.meta.url));
const BUILD = path.join(DIR, "build");

const READ_MORE = "**[➡️ Full readme](https://github.com/lydell/js-tokens/)**";

const FILES_TO_COPY = [
  { src: "LICENSE" },
  { src: "index.d.ts" },
  { src: "package-real.json", dest: "package.json" },
  {
    src: "README.md",
    transform: (content) => content.replace(/^##[^]*/m, READ_MORE),
  },
  {
    src: "index.coffee",
    dest: "index.js",
    transform: (content) =>
      coffee
        .compile(content, { bare: true })
        .replace(/ {2}/g, "\t")
        .replace(/\/\/ (?:Note:|https).*\n/g, "")
        .replace(/\n\n/g, "\n")
        .replace(/\{\s*(tag: "[^"]+")\s*\}/g, "{$1}"),
  },
];

fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD);

for (const { src, dest = src, transform } of FILES_TO_COPY) {
  if (transform) {
    fs.writeFileSync(
      path.join(BUILD, dest),
      transform(fs.readFileSync(path.join(DIR, src), "utf8"))
    );
  } else {
    fs.copyFileSync(path.join(DIR, src), path.join(BUILD, dest));
  }
}
