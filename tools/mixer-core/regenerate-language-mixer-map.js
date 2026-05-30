"use strict";

// Regenerate config/language-mixer-map.json to ensure all catalog languages have bases assigned.
// This script:
//   1. Loads config/language-mixes.json (the catalog - ~27,961 languages)
//   2. Loads config/language-mixer-map.json (existing mapping - ~1,664 entries)
//   3. Collects valid base indices from continent file mapping (~2,594 valid indices)
//   4. For each language in catalog, assigns 1-3 valid bases if not already assigned
//   5. Saves to config/language-mixer-map.json
//
// Run from the project root with:
//   node tools/mixer-core/regenerate-language-mixer-map.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");

console.log("Starting regeneration...");

const catalog = JSON.parse(fs.readFileSync(path.join(root, "config/language-mixes.json"), "utf8"));
console.log("Catalog entries:", catalog.length);

const existing = JSON.parse(fs.readFileSync(path.join(root, "config/language-mixer-map.json"), "utf8"));
console.log("Existing map entries:", existing.length);

const continent = JSON.parse(fs.readFileSync(path.join(root, "tools/data/continent-file-mapping.json"), "utf8"));

// Get valid base indices from continent file mapping
const validBases = new Set();
for (const entry of continent.entries) {
  if (entry.index !== undefined) {
    validBases.add(entry.index);
  }
}
const validBaseArr = Array.from(validBases).sort((a, b) => a - b);
console.log("Valid bases found:", validBaseArr.length);

// Create lookup for existing entries
const existingByIso = new Map();
for (const e of existing) {
  existingByIso.set(e.iso, e.bases);
}

const newMap = [];
let assigned = 0;
let kept = 0;

for (const lang of catalog) {
  const iso = lang.iso;
  const existingBases = existingByIso.get(iso);
  
  if (existingBases && existingBases.length > 0) {
    newMap.push({ iso, bases: existingBases });
    kept++;
  } else {
    // Assign 1-3 random valid bases
    const numBases = 1 + Math.floor(Math.random() * 3);
    const shuffled = validBaseArr.slice().sort(() => Math.random() - 0.5);
    const bases = shuffled.slice(0, numBases);
    newMap.push({ iso, bases });
    assigned++;
  }
}

console.log("Kept existing:", kept);
console.log("Assigned new:", assigned);
console.log("Total entries:", newMap.length);

// Write output
const output = JSON.stringify(newMap, null, 2);
fs.writeFileSync(path.join(root, "config/language-mixer-map.json"), output);

console.log("Done! Regeneration complete.");