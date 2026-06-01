"use strict";
const fs = require("fs");
const path = require("path");
const MODULES_DIR = path.join(__dirname, "..", "..", "modules");

const files = [
  "namebases-southAmerica.js",
  "namebases-northAmerica.js",
  "namebases-oceania.js",
  "namebases-europe.js"
];

for (const f of files) {
  const c = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
  const nameCount = {};
  const re = /"name":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    const n = m[1];
    if (!nameCount[n]) nameCount[n] = 0;
    nameCount[n]++;
  }
  const dups = Object.entries(nameCount).filter(([n, count]) => count > 1);
  if (dups.length > 0) {
    console.log(f + " duplicates:");
    for (const [n, count] of dups) {
      console.log("  " + n + " x" + count);
    }
  } else {
    console.log(f + ": no duplicates");
  }
}
