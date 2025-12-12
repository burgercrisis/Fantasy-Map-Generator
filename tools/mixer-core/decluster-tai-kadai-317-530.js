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

function main() {
  const map = readJson("config/language-mixer-map.json");

  // Cluster to decluster: bases exactly [317,530] (Kra+Zhuang).
  // Keep standard-zhuang as the anchor; move the others to unique, plausible mixes.
  const targets = {
    "standard-zhuang": [317, 530],
    buyang: [317, 530, 533],
    "proto-kra-dai": [252, 317, 530, 533]
  };

  // Ensure uniqueness among the targets.
  const seen = new Map();
  for (const [iso, bases] of Object.entries(targets)) {
    const key = JSON.stringify(sortedUnique(bases));
    const prev = seen.get(key);
    if (prev) {
      throw new Error(`Duplicate target bases set for ${prev} and ${iso}: ${key}`);
    }
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
    const beforeKey = JSON.stringify(sortedUnique(before));

    if (beforeKey !== "[317,530]") {
      // Don't overwrite if it has already been customized.
      skippedUnexpected++;
      continue;
    }

    const after = sortedUnique(newBasesRaw);
    entry.bases = after;

    if (JSON.stringify(before) !== JSON.stringify(after)) changed++;
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Decluster Tai-Kadai [317,530] batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
