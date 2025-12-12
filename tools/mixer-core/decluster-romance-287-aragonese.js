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

  // Cluster to decluster: bases exactly [287] (Aragonese dialect cluster).
  // Keep one anchor at [287], make the rest unique with Iberian-neighborhood ingredients.
  // Known neighbor bases:
  //  - 4   Castillian
  //  - 232 Occitan
  //  - 286 Asturian
  //  - 272 Galician
  //  - 13  Portuguese
  //  - 20  Basque
  //  - 231 Ladino
  //  - 2   French
  const targets = {
    "central-aragonese": [287],

    benasquese: [20, 287],
    cheso: [286, 287],
    "eastern-aragonese": [4, 287],
    navarrese: [4, 20, 287],
    "navarro-aragonese": [4, 232, 287],
    riojan: [4, 272, 287],
    "somontan-s": [232, 287],
    "southern-aragonese": [13, 287],
    "western-aragonese": [272, 287],
    "judeo-aragonese": [4, 231, 287]
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
    const beforeKey = keyOf(before);

    if (beforeKey !== "[287]") {
      skippedUnexpected++;
      continue;
    }

    const after = sortedUnique(newBasesRaw);
    entry.bases = after;
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);
  console.log("Decluster Romance [287] (Aragonese) batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
