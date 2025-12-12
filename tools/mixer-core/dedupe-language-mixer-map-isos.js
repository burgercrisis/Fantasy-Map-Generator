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

  // Keep first occurrence of each ISO (append-only + stable), and drop later duplicates.
  // This resolves accidental duplicated ISO rows introduced by earlier tooling.
  const seen = new Set();
  const deduped = [];
  let removed = 0;

  for (const row of map) {
    if (!row || !row.iso) {
      deduped.push(row);
      continue;
    }

    const iso = String(row.iso);
    if (seen.has(iso)) {
      removed++;
      continue;
    }

    seen.add(iso);
    deduped.push(row);
  }

  // Also normalize a couple of known-problematic mappings while we are here.
  // - bahnaric: base 334 does not exist; use dedicated Bahnaric base 526.
  // - duan-bahnaric: was mapped to an unrelated SE Asia blend; use 526 with a small local ingredient.
  const byIso = new Map(deduped.filter(e => e && e.iso).map(e => [String(e.iso), e]));

  if (byIso.has("bahnaric")) {
    byIso.get("bahnaric").bases = [526];
  }

  if (byIso.has("duan-bahnaric")) {
    byIso.get("duan-bahnaric").bases = sortedUnique([526, 29]);
  }

  writeJson("config/language-mixer-map.json", deduped);

  console.log("Deduped language-mixer-map.json by ISO");
  console.log(JSON.stringify({ beforeRows: map.length, afterRows: deduped.length, removed }, null, 2));
}

if (require.main === module) main();
