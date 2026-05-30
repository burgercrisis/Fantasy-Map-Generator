"use strict";

const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "..", "..", "modules");

const NAMEBASE_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-oceania.js",
  "namebases-southAmerica.js",
  "namebases-fantasy.js",
  "namebases-creole.js"
];

function extractIndicesFromFile(filename) {
  const fullPath = path.join(MODULES_DIR, filename);
  if (!fs.existsSync(fullPath)) return new Set();

  const content = fs.readFileSync(fullPath, "utf8");
  const indices = new Set();

  const matches = content.match(/"i":\s*(\d+)/g) || [];
  matches.forEach(m => {
    const i = parseInt(m.match(/\d+/)[0], 10);
    indices.add(i);
  });

  return indices;
}

function findGaps(usedIndices, start, count) {
  const gaps = [];
  let current = start;

  while (gaps.length < count) {
    if (!usedIndices.has(current)) {
      gaps.push(current);
    }
    current++;
  }

  return gaps;
}

function main() {
  let allIndices = new Set();

  NAMEBASE_FILES.forEach(file => {
    const indices = extractIndicesFromFile(file);
    indices.forEach(i => allIndices.add(i));
  });

  const sortedIndices = [...allIndices].sort((a, b) => a - b);
  console.log(`Total unique indices: ${sortedIndices.length}`);
  console.log(`Index range: ${sortedIndices[0]} - ${sortedIndices[sortedIndices.length - 1]}`);

  const nonDedicatedGaps = findGaps(allIndices, 1, 50);
  console.log("\nNext 50 gaps in non-dedicated range (1-19999):");
  console.log(nonDedicatedGaps.join(", "));

  const dedicatedGaps = findGaps(allIndices, 20000, 100);
  console.log("\nNext 100 gaps in dedicated range (20000+):");
  console.log(dedicatedGaps.join(", "));

  const usedRanges = {
    low: sortedIndices.filter(i => i < 1000).length,
    mid: sortedIndices.filter(i => i >= 1000 && i < 10000).length,
    high: sortedIndices.filter(i => i >= 10000 && i < 20000).length,
    dedicated: sortedIndices.filter(i => i >= 20000).length
  };

  console.log("\nIndex distribution:");
  console.log(`  1-999:    ${usedRanges.low}`);
  console.log(`  1000-9999: ${usedRanges.mid}`);
  console.log(`  10000-19999: ${usedRanges.high}`);
  console.log(`  20000+:   ${usedRanges.dedicated}`);
}

main();
