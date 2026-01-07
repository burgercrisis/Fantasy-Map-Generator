"use strict";

const fs = require("node:fs");

const files = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js"
];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const matches = [...content.matchAll(/â[^a-zA-Z0-9\s]*/g)];
  if (matches.length > 0) {
    console.log(`\n${file}:`);
    for (const m of matches.slice(0, 5)) {
      console.log(`  Found: "${m[0]}" at position ${m.index}`);
    }
  }
}
