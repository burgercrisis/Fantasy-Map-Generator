"use strict";
const fs = require("fs");
const path = require("path");
const MODULES_DIR = path.join(__dirname, "..", "..", "modules");

const files = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-unknown.js"
];

for (const f of files) {
  const c = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");

  // Check for double commas
  const doubleCommas = (c.match(/,,/g) || []).length;

  // Count corrupted d-fields (contain uppercase or dashes but aren't empty)
  const dRe = /"d":\s*"([^"]*)"/g;
  let m;
  let corrupted = 0;
  let clean = 0;
  let empty = 0;
  while ((m = dRe.exec(c)) !== null) {
    const d = m[1];
    if (!d || d === "") {
      empty++;
    } else if (/^[a-z]*$/.test(d)) {
      clean++;
    } else {
      corrupted++;
    }
  }

  // Count Chinese characters
  const chinese = (c.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // Count leading spaces in names
  const leadingSpaces = (c.match(/"name":\s*" +/g) || []).length;

  console.log(
    f + ": d-corrupted=" + corrupted + " d-clean=" + clean + " d-empty=" + empty +
    " doubleCommas=" + doubleCommas + " chinese=" + chinese + " leadingSpaces=" + leadingSpaces
  );
}
