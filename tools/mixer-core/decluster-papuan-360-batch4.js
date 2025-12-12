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
  const byIso = new Map(map.filter(e => e && e.iso).map(e => [String(e.iso), e]));

  // Batch 4: finish the remaining members from the Papuan bases=[360] hub.
  // Keep Papuan (360) as anchor and add PNG-neighborhood ingredients:
  //  - 365 Engan Papuan
  //  - 366 Dani Papuan
  //  - 520 North New Guinea
  //  - 454 Papuan Malay
  //  - 455 Serui Malay
  //  - 399 Tok Pisin
  //  - 367 Eastern Indonesian
  const targets = {
    kayagaric: [360, 454, 455],
    kiwaian: [360, 520, 454, 455],
    kolopom: [360, 365, 454],
    maiwa: [360, 366, 454],
    makayam: [360, 365, 454, 367],
    mapena: [360, 366, 454, 367],
    maria: [360, 520, 399],
    uare: [360, 520, 399, 454],
    were: [360, 365, 399],
    yaqay: [360, 366, 399],
    yareba: [360, 520, 455],
    zimakani: [360, 365, 366, 455]
  };

  // Ensure uniqueness within this batch.
  const seen = new Map();
  for (const [iso, bases] of Object.entries(targets)) {
    const key = keyOf(bases);
    const prev = seen.get(key);
    if (prev) throw new Error(`Duplicate target bases set for ${prev} and ${iso}: ${key}`);
    seen.set(key, iso);
  }

  let changed = 0;
  const skipped = [];

  for (const [iso, newBasesRaw] of Object.entries(targets)) {
    const entry = byIso.get(iso);
    if (!entry) {
      skipped.push({ iso, reason: "not_found" });
      continue;
    }

    const before = Array.isArray(entry.bases) ? entry.bases.slice() : [];
    if (keyOf(before) !== "[360]") {
      skipped.push({ iso, reason: `unexpected_before ${keyOf(before)}` });
      continue;
    }

    entry.bases = sortedUnique(newBasesRaw);
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);
  console.log("Decluster Papuan [360] batch4 complete");
  console.log(JSON.stringify({ changed, skippedCount: skipped.length, skipped }, null, 2));
}

if (require.main === module) main();
