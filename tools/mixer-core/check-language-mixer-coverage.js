"use strict";

// Report coverage between language-mixer-map.json and language-mixes.json
// so we can see which ISO codes will never show up in the Language Mixer
// dropdown and which catalog entries have no Markov mapping.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const inMapNotCatalog = [...mapIsos].filter(iso => !mixIsos.has(iso)).sort();
  const inCatalogNotMap = [...mixIsos].filter(iso => !mapIsos.has(iso)).sort();

  console.log("Total ISO codes in mixer map:", mapIsos.size);
  console.log("Total ISO codes in mixer catalog:", mixIsos.size);
  console.log("ISOs in map but missing from catalog (won't appear in dropdown):", inMapNotCatalog.length);
  console.log(inMapNotCatalog.join(", "));
  console.log("\nISOs in catalog but missing from map (no local Markov mapping):", inCatalogNotMap.length);
  console.log(inCatalogNotMap.join(", "));
}

if (require.main === module) main();
