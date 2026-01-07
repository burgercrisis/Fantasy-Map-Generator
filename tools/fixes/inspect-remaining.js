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
    for (const m of matches) {
      const char = m[0];
      console.log(`  Context: ...${content.substring(Math.max(0, m.index - 10), m.index)}[${char}]${content.substring(m.index + char.length, m.index + char.length + 10)}...`);
    }
  }
}
