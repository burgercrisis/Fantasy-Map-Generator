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

  // Cluster to decluster: bases exactly [2,279] (French+Corsican).
  // Keep one anchor at [2,279], make the rest unique with nearby Romance ingredients.
  // Neighbor bases:
  //  - 232 Occitan
  //  - 233 Sardinian
  //  - 234 Romansh
  //  - 231 Ladino
  //  - 286 Asturian
  //  - 272 Galician
  //  - 8 Roman
  //  - 3 Italian
  //  - 4 Castillian
  //  - 13 Portuguese
  const targets = {
    cauchois: [2, 279],

    berrichon: [2, 232, 279],
    bourbonnais: [2, 233, 279],
    cotentinais: [2, 231, 279],
    gaumais: [2, 234, 279],
    "guern-siais": [2, 3, 279],
    lorrain: [2, 8, 279],
    mayennais: [2, 272, 279],
    paydret: [2, 286, 279],
    vosgien: [2, 4, 279],
    "west-walloon": [2, 13, 279]
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
    if (keyOf(before) !== "[2,279]") {
      skippedUnexpected++;
      continue;
    }

    entry.bases = sortedUnique(newBasesRaw);
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);
  console.log("Decluster Romance [2,279] (French+Corsican) batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
