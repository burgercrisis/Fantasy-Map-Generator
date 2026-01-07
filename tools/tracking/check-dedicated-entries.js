"use strict";

const fs = require("node:fs");

// Read the namebase files
const asiaContent = fs.readFileSync("namebases/namebases-asia.js", "utf8");
const europeContent = fs.readFileSync("namebases/namebases-europe.js", "utf8");

// Find all "(dedicated)" entries
const dedicatedPattern = /\([^)]+\)\s*\(dedicated\)/g;

const asiaMatches = asiaContent.match(dedicatedPattern) || [];
const europeMatches = europeContent.match(dedicatedPattern) || [];

console.log("=== (dedicated) entries in namebases-asia.js ===");
console.log(`Count: ${asiaMatches.length}`);
asiaMatches.forEach(m => console.log(`  ${m}`));

console.log("\n=== (dedicated) entries in namebases-europe.js ===");
console.log(`Count: ${europeMatches.length}`);
europeMatches.forEach(m => console.log(`  ${m}`));

// Now check the CSV for all score-20 entries to see what we need to fix
const csvContent = fs.readFileSync("docs/reports/language-quality-metrics.csv", "utf8");
const csvLines = csvContent.split("\n");

console.log("\n=== Score-20 entries from CSV that need fixing ===");
const score20Names = [];
for (const line of csvLines) {
  if (line.endsWith(",20")) {
    const cols = line.split(",");
    const name = cols[0];
    console.log(`  ${name}`);
    score20Names.push(name);
  }
}

console.log(`\nTotal: ${score20Names.length} score-20 entries`);
