"use strict";
const fs = require("fs");
const path = require("path");

const MODULES_DIR = "modules";
const CONFIG_DIR = "config";

const CONTINENT_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-unknown.js",
  "namebases-fantasy.js"
];

// Parse all namebase entries
const allEntries = [];
for (const f of CONTINENT_FILES) {
  const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
  const re = /"i":\s*(\d+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const idx = parseInt(m[1], 10);
    const before = content.slice(0, m.index);
    const afterIdx = before.lastIndexOf('"name":');
    if (afterIdx === -1) continue;
    const nameMatch = content.slice(afterIdx, afterIdx + 300).match(/"name":\s*"([^"]+)"/);
    if (!nameMatch) continue;

    // Extract the full entry for analysis
    const entryStart = content.lastIndexOf('{', m.index);
    const entryEnd = content.indexOf('}', m.index) + 1;
    const entryStr = content.slice(entryStart, entryEnd);

    let min, max, d, b;
    const minM = entryStr.match(/"min":\s*(\d+)/);
    const maxM = entryStr.match(/"max":\s*(\d+)/);
    const dM = entryStr.match(/"d":\s*"([^"]*)"/);
    const bM = entryStr.match(/"b":\s*"([^"]*)"/);

    allEntries.push({
      idx,
      name: nameMatch[1].trim(),
      file: f,
      min: minM ? parseInt(minM[1]) : null,
      max: maxM ? parseInt(maxM[1]) : null,
      d: dM ? dM[1] : null,
      bLen: bM ? bM[1].split(',').length : 0,
      bSample: bM ? bM[1].slice(0, 80) : ''
    });
  }
}

console.log("Total namebase entries:", allEntries.length);
console.log("Unique names:", new Set(allEntries.map(e => e.name)).size);
console.log("Unique indices:", new Set(allEntries.map(e => e.idx)).size);

// How many entries have bLen < 10 (very few seed names)?
const smallB = allEntries.filter(e => e.bLen < 10);
console.log("\nEntries with < 10 seed names:", smallB.length);
for (const e of smallB.slice(0, 20)) {
  console.log("  [" + e.idx + "] '" + e.name + "' (" + e.file + "): " + e.bLen + " names, d=" + JSON.stringify(e.d) + ", sample: " + e.bSample);
}

// Catalog stats
const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));
const catalogNoFamily = catalog.filter(c => !c.tags || !c.tags.includes("family"));
console.log("\nCatalog total:", catalog.length);
console.log("Catalog (no family):", catalogNoFamily.length);

// Name match analysis
const namebaseNames = new Set(allEntries.map(e => e.name));
let directMatch = 0, noMatch = 0;
const noMatchByRegion = {};
for (const c of catalogNoFamily) {
  if (namebaseNames.has(c.name)) {
    directMatch++;
  } else {
    noMatch++;
    if (!noMatchByRegion[c.region]) noMatchByRegion[c.region] = [];
    noMatchByRegion[c.region].push(c.name);
  }
}
console.log("\nDirect name matches:", directMatch);
console.log("No direct match:", noMatch);

console.log("\nNo-match by region:");
for (const [region, names] of Object.entries(noMatchByRegion).sort((a,b) => b[1].length - a[1].length)) {
  console.log("  " + region + ": " + names.length);
}
