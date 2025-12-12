"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(rel) {
  const p = path.join(root, rel);
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const p = path.join(root, rel);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function sortedUnique(arr) {
  return [...new Set(arr)].sort((a, b) => a - b);
}

function keyOf(arr) {
  return JSON.stringify(sortedUnique(arr));
}

function main() {
  const map = readJson("config/language-mixer-map.json");

  // Cluster to decluster: bases exactly [2] (French dialect cluster).
  // Keep standard-french as the anchor [2], and give the other Oïl/related lects unique
  // Romance-local mixes.
  // Neighbor bases:
  //  - 232 Occitan
  //  - 233 Sardinian
  //  - 234 Romansh
  //  - 231 Ladino
  //  - 286 Asturian
  //  - 272 Galician
  //  - 4   Castillian
  //  - 13  Portuguese
  //  - 8   Roman
  const targets = {
    "standard-french": [2],

    augeron: [2, 232, 286],
    auregnais: [2, 231, 233],
    landese: [2, 233, 234],
    magoua: [2, 233, 272],
    "moselle-romance": [2, 8, 234],
    "orl-anais": [2, 232, 233],
    "poitevin-saintongeais": [2, 232, 234],
    "r-mois": [2, 4, 232],
    "j-rriais": [2, 232, 233, 279],
    joual: [2, 13, 232]
  };

  // Validate uniqueness among target base-sets
  const seen = new Map();
  for (const [iso, bases] of Object.entries(targets)) {
    const key = keyOf(bases);
    const prev = seen.get(key);
    if (prev) throw new Error(`Duplicate target bases set for ${prev} and ${iso}: ${key}`);
    seen.set(key, iso);
  }

  const byIso = new Map(map.filter(e => e && e.iso).map(e => [String(e.iso), e]));

  let changed = 0;
  let skippedNotFound = 0;
  let skippedUnexpected = 0;

  for (const [iso, newBasesRaw] of Object.entries(targets)) {
    const entry = byIso.get(iso);
    if (!entry) {
      skippedNotFound++;
      continue;
    }

    const before = Array.isArray(entry.bases) ? entry.bases.slice() : [];
    if (keyOf(before) !== "[2]") {
      skippedUnexpected++;
      continue;
    }

    entry.bases = sortedUnique(newBasesRaw);
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);
  console.log("Decluster Romance [2] (French) batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
