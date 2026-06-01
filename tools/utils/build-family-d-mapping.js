"use strict";
const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "..", "..", "modules");
const CONFIG_DIR = path.join(__dirname, "..", "..", "config");

// Load catalog
const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));
const catalogByName = new Map();
for (const entry of catalog) {
  catalogByName.set(entry.name, entry);
}

// Also try matching with " language" suffix stripped
const catalogByNameStripped = new Map();
for (const entry of catalog) {
  if (entry.name.endsWith(" language")) {
    const stripped = entry.name.slice(0, -9);
    catalogByNameStripped.set(stripped, entry);
  }
}

// Parse all continent files
const files = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-unknown.js"
];

// Extract all d-values that look like real phonotactic rules (lowercase only)
const familyToD = {};
const categoryToD = {};
const dValueSources = {};

for (const f of files) {
  const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
  const re = /"name":\s*"([^"]+)"[^}]*"d":\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[1];
    const d = m[2];

    // Skip if d is corrupted (contains uppercase, dash, or is empty)
    if (!d || d !== d.toLowerCase() || d.includes("-")) continue;

    // Look up in catalog
    let cat = catalogByName.get(name);
    if (!cat) cat = catalogByNameStripped.get(name);
    if (!cat) continue;

    const family = cat.family || "Unknown";
    const category = cat.category || "Unknown";

    if (!familyToD[family]) familyToD[family] = {};
    if (!familyToD[family][d]) familyToD[family][d] = 0;
    familyToD[family][d]++;

    if (!categoryToD[category]) categoryToD[category] = {};
    if (!categoryToD[category][d]) categoryToD[category][d] = 0;
    categoryToD[category][d]++;

    if (!dValueSources[d]) dValueSources[d] = [];
    dValueSources[d].push(name + " (" + family + ")");
  }
}

console.log("=== Family -> d-value mapping (from entries with clean d-values) ===");
const sortedFamilies = Object.keys(familyToD).sort((a, b) => {
  const aTotal = Object.values(familyToD[a]).reduce((s, v) => s + v, 0);
  const bTotal = Object.values(familyToD[b]).reduce((s, v) => s + v, 0);
  return bTotal - aTotal;
});

for (const family of sortedFamilies) {
  const dVals = Object.entries(familyToD[family]).sort((a, b) => b[1] - a[1]);
  const total = dVals.reduce((s, v) => s + v[1], 0);
  if (total >= 2) {
    console.log(family + " (" + total + "): " + dVals.map(v => '"' + v[0] + '"(' + v[1] + ")").join(", "));
  }
}

console.log("\n=== Category -> d-value mapping (from entries with clean d-values) ===");
const sortedCats = Object.keys(categoryToD).sort((a, b) => {
  const aTotal = Object.values(categoryToD[a]).reduce((s, v) => s + v, 0);
  const bTotal = Object.values(categoryToD[b]).reduce((s, v) => s + v, 0);
  return bTotal - aTotal;
});

for (const cat of sortedCats) {
  const dVals = Object.entries(categoryToD[cat]).sort((a, b) => b[1] - a[1]);
  const total = dVals.reduce((s, v) => s + v[1], 0);
  if (total >= 3) {
    console.log(cat + " (" + total + "): " + dVals.map(v => '"' + v[0] + '"(' + v[1] + ")").join(", "));
  }
}

// Output JS-friendly mapping for the fix script
console.log("\n=== JS MAPPING OBJECT ===");
console.log("const familyDMap = {");
for (const family of sortedFamilies) {
  const dVals = Object.entries(familyToD[family]).sort((a, b) => b[1] - a[1]);
  const bestD = dVals[0][0];
  console.log('  "' + family.replace(/"/g, '\\"') + '": "' + bestD + '",');
}
console.log("};");
