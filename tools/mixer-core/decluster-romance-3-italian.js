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

  // Cluster to decluster: bases exactly [3] (Italian hub).
  // Keep `ita` as the anchor [3], and give the other Italian lects unique Italy-plausible
  // Romance-local mixes.
  // Neighbor bases used:
  //  - 8   Roman
  //  - 232 Occitan
  //  - 233 Sardinian
  //  - 234 Romansh
  //  - 279 Corsican
  //  - 2   French
  //  - 13  Portuguese
  const targets = {
    ita: [3],

    "standard-italian": [3, 8, 234],
    "regional-italian": [3, 8, 232, 234],
    florentine: [3, 8, 232],
    "pisano-livornese": [3, 8, 232, 279],
    basilicatine: [3, 8, 233],
    "maltese-italian": [3, 233, 279],
    "swiss-italian": [3, 234, 279],
    "italo-australian": [3, 2, 13]
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
    if (keyOf(before) !== "[3]") {
      skippedUnexpected++;
      continue;
    }

    entry.bases = sortedUnique(newBasesRaw);
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);
  console.log("Decluster Romance [3] (Italian) batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
