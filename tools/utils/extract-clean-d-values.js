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
  "namebases-unknown.js",
  "namebases-fantasy.js"
];

const cleanD = {};
const allD = {};

for (const f of files) {
  const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
  const re = /"name":\s*"([^"]+)"[^}]*"d":\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[1];
    const d = m[2];
    const shortF = f.replace("namebases-", "").replace(".js", "");

    if (!allD[d]) allD[d] = [];
    allD[d].push(name + " [" + shortF + "]");

    // Only truly clean: lowercase letters only
    if (d && /^[a-z]+$/.test(d)) {
      if (!cleanD[d]) cleanD[d] = [];
      cleanD[d].push(name + " [" + shortF + "]");
    }
  }
}

console.log("=== ALL d values ===");
for (const d of Object.keys(allD).sort((a, b) => allD[b].length - allD[a].length)) {
  console.log('d="' + d + '" (' + allD[d].length + " entries)");
}

console.log("\n=== CLEAN d values (lowercase only) ===");
for (const d of Object.keys(cleanD).sort((a, b) => cleanD[b].length - cleanD[a].length)) {
  console.log('d="' + d + '" (' + cleanD[d].length + "): " + cleanD[d].slice(0, 5).join(", ") + (cleanD[d].length > 5 ? "..." : ""));
}
