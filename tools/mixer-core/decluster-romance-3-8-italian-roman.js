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

  // Cluster to decluster: bases exactly [3,8] (Italian+Roman cluster).
  // Keep one anchor as [3,8] and give each other lect a unique Italy-plausible mix.
  // Neighbor bases used:
  //  - 232 Occitan
  //  - 233 Sardinian
  //  - 234 Romansh
  //  - 279 Corsican
  //  - 2   French
  //  - 4   Castillian
  //  - 231 Ladino
  const targets = {
    // anchor
    tuscan: [3, 8],

    senese: [3, 8, 232],
    umbrian: [3, 8, 234],
    romanesco: [3, 8, 233],
    sabino: [3, 8, 279],
    tuscia: [3, 8, 231],
    "central-northern-lazian": [2, 3, 8],
    "pannonian-latin": [3, 4, 8, 234]
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
    if (keyOf(before) !== "[3,8]") {
      skippedUnexpected++;
      continue;
    }

    entry.bases = sortedUnique(newBasesRaw);
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);
  console.log("Decluster Romance [3,8] (Italian+Roman) batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
