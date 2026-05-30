"use strict";

/**
 * Comprehensive Namebase State Check
 * 
 * Performs a thorough analysis of namebase data quality across all continent files.
 * Checks for small bases, trailing spaces, fake names, placeholders, and index issues.
 * 
 * Usage:
 *   node tools/validation/comprehensive-check.js
 */

const fs = require("fs");
const path = require("path");

const CONTINENT_FILES = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-oceania.js",
  "modules/namebases-southAmerica.js"
];

const CONTINENT_NAMES = {
  "namebases-africa.js": "Africa",
  "namebases-asia.js": "Asia",
  "namebases-europe.js": "Europe",
  "namebases-northAmerica.js": "NorthAmerica",
  "namebases-oceania.js": "Oceania",
  "modules/namebases-southAmerica.js": "SouthAmerica"
};

function loadAllNamebases() {
  const allNamebases = [];
  
  for (const file of CONTINENT_FILES) {
    const fullPath = path.resolve(__dirname, "..", file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning: File not found: ${file}`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, "utf8");
    const match = content.match(/window\.(\w+)NameBases\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
      const continentName = match[1].replace("NameBases", "");
      const namebases = eval(match[2]);
      namebases.forEach(nb => {
        nb._file = file;
        nb._continent = continentName;
      });
      allNamebases.push(...namebases);
    }
  }
  
  return allNamebases;
}

const namebases = loadAllNamebases();

console.log("\n=== COMPREHENSIVE STATE CHECK ===\n");
console.log(`Total namebases: ${namebases.length}`);

const smallBases = [];
const trailingSpaces = [];
const fakeNames = [];
const primusPlaceholders = [];
const dedicatedSuffixes = [];

namebases.forEach((nb) => {
  if (!nb.name) return;
  const cities = nb.b ? nb.b.split(",") : [];
  
  if (cities.length < 3) {
    smallBases.push({ 
      idx: nb.i, 
      name: nb.name, 
      count: cities.length,
      continent: nb._continent 
    });
  }
  
  if (nb.name !== nb.name.trim()) {
    trailingSpaces.push({ 
      idx: nb.i, 
      name: nb.name, 
      trimmed: nb.name.trim(),
      continent: nb._continent 
    });
  }
  
  const lowerName = nb.name.toLowerCase();
  if (lowerName.includes("riangular") || lowerName.includes("big flowery") || 
      lowerName === "bph" || lowerName === "ita" || lowerName === "bum") {
    fakeNames.push({ 
      idx: nb.i, 
      name: nb.name,
      continent: nb._continent 
    });
  }
  
  if (nb.b && nb.b.includes("Primus")) {
    primusPlaceholders.push({ 
      idx: nb.i, 
      name: nb.name,
      continent: nb._continent 
    });
  }
  
  if (nb.name.includes("(dedicated)")) {
    dedicatedSuffixes.push({ 
      idx: nb.i, 
      name: nb.name,
      continent: nb._continent 
    });
  }
});

console.log("\n=== SMALL BASES (< 3 cities) ===");
console.log(`Count: ${smallBases.length}\n`);
smallBases.forEach(s => console.log(`  [${s.continent}] Index ${s.idx}: ${s.name} (${s.count} cities)`));

console.log("\n=== TRAILING SPACES ===");
console.log(`Count: ${trailingSpaces.length}\n`);
trailingSpaces.forEach(s => console.log(`  [${s.continent}] Index ${s.idx}: "${s.name}"`));

console.log("\n=== FAKE/SUSPICIOUS NAMES ===");
console.log(`Count: ${fakeNames.length}\n`);
fakeNames.forEach(s => console.log(`  [${s.continent}] Index ${s.idx}: ${s.name}`));

console.log("\n=== PRIMUS PLACEHOLDERS ===");
console.log(`Count: ${primusPlaceholders.length}\n`);
primusPlaceholders.forEach(nb => console.log(`  [${nb.continent}] Index ${nb.idx}: ${nb.name}`));

console.log("\n=== \"(DEDICATED)\" SUFFIXES ===");
console.log(`Count: ${dedicatedSuffixes.length}\n`);
dedicatedSuffixes.slice(0, 10).forEach(nb => console.log(`  [${nb.continent}] Index ${nb.idx}: ${nb.name}`));
if (dedicatedSuffixes.length > 10) {
  console.log(`  ... and ${dedicatedSuffixes.length - 10} more`);
}

const allIndices = namebases.map(nb => nb.i);
const uniqueIndices = new Set(allIndices);
console.log("\n=== INDEX UNIQUENESS ===");
console.log(`Total indices: ${allIndices.length}`);
console.log(`Unique indices: ${uniqueIndices.size}`);
console.log(`Duplicates: ${allIndices.length - uniqueIndices.size}`);

console.log("\n=== SUMMARY ===\n");
console.log(`✓ Primus placeholders: ${primusPlaceholders.length} (should be 0)`);
console.log(`✓ "(dedicated)" suffixes: ${dedicatedSuffixes.length} (should be 0 after renames)`);
console.log(`✓ Fake/suspicious: ${fakeNames.length} (should be 0)`);
console.log(`✓ Small bases: ${smallBases.length} (should be expanded)`);
console.log(`✓ Trailing spaces: ${trailingSpaces.length} (should be 0)`);
console.log(`✓ Duplicate indices: ${allIndices.length - uniqueIndices.size} (should be 0)`);
console.log("\n");
