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

function getNamebaseType(filename) {
  if (filename.includes("africa")) return "africa";
  if (filename.includes("asia")) return "asia";
  if (filename.includes("europe")) return "europe";
  if (filename.includes("northAmerica")) return "northAmerica";
  if (filename.includes("southAmerica")) return "southAmerica";
  if (filename.includes("oceania")) return "oceania";
  if (filename.includes("fantasy")) return "fantasy";
  if (filename.includes("creole")) return "creole";
  return "unknown";
}

function parseEntryBlock(block) {
  const result = { name: null, i: null, block: block };

  const nameMatch = block.match(/"name":\s*"([^"]+)"/);
  if (nameMatch) result.name = nameMatch[1];

  const iMatch = block.match(/"i":\s*(\d+)/);
  if (iMatch) result.i = parseInt(iMatch[1], 10);

  return result;
}

function scanFile(file) {
  const fullPath = path.join(MODULES_DIR, file);
  if (!fs.existsSync(fullPath)) return [];

  const content = fs.readFileSync(fullPath, "utf8");
  const type = getNamebaseType(file);
  const placeholders = [];

  const blocks = content.match(/\{[\s\S]*?\}/g) || [];

  blocks.forEach(block => {
    if (block.includes("New Place") || block.includes("_unq")) {
      const entry = parseEntryBlock(block);
      placeholders.push({
        file: file,
        type: type,
        name: entry.name,
        index: entry.i
      });
    }
  });

  return placeholders;
}

function main() {
  const allPlaceholders = [];

  NAMEBASE_FILES.forEach(file => {
    const placeholders = scanFile(file);
    allPlaceholders.push(...placeholders);
  });

  console.log("Languages with placeholders:");
  console.log(`Total: ${allPlaceholders.length}\n`);

  const byType = {};
  allPlaceholders.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  Object.entries(byType).forEach(([type, entries]) => {
    console.log(`${type} (${entries.length}):`);
    entries.forEach(e => {
      console.log(`  - ${e.name} (i:${e.index})`);
    });
    console.log();
  });
}

main();
