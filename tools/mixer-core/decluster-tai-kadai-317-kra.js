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

  // Cluster to decluster: bases exactly [317] (Kra).
  // Ingredients chosen to stay regionally/family plausible:
  // - 530 Zhuang (Kra-Dai neighbor)
  // - 533 Kam-Sui (Kra-Dai neighbor)
  // - 318 Hlai (Kra-Dai neighbor)
  // - 532 Shan (Tai; nearby)
  // - 251/252 Thai/Lao (Tai; nearby)

  const targets = {
    // Keep kra as the anchor for the base itself
    kra: [317],

    buyang: [317, 530],
    "en-kra": [317, 533],
    gelao: [317, 318],
    lachi: [317, 532],
    laha: [317, 251],
    paha: [317, 252],
    qabiao: [317, 530, 533],
    qau: [317, 318, 530],
    telue: [317, 318, 533],
    vandu: [317, 530, 532],
    hagei: [317, 533, 532],
    "hezhang-buyi": [317, 251, 530],
    "mulao-kra": [317, 252, 530],

    // Proto entry gets a heavier mix, but still within neighborhood
    "proto-kra": [317, 318, 530, 533]
  };

  // Ensure targets are unique (within this batch).
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

    if (beforeKey !== "[317]") {
      // If it’s already been customized, don’t overwrite.
      skippedUnexpected++;
      continue;
    }

    const after = sortedUnique(newBasesRaw);
    entry.bases = after;

    if (JSON.stringify(before) !== JSON.stringify(after)) changed++;
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Decluster Tai-Kadai [317] (Kra) batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
