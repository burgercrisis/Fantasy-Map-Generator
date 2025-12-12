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

  // Remaining Tai-Kadai size>=3 clusters (as of last scan) and minimal one-member tweaks.
  // We only change one member per cluster to break the shared signature.
  const edits = [
    // Cluster: [252,317,530,533] (4 members)
    { iso: "yong", expected: [252, 317, 530, 533], after: [252, 317, 318, 530, 533] },

    // Cluster: [251,252,318,530] (3 members)
    { iso: "tai-thanh", expected: [251, 252, 318, 530], after: [251, 252, 317, 318, 530] },

    // Cluster: [251,317,530,533] (3 members)
    { iso: "southern-tai", expected: [251, 317, 530, 533], after: [251, 317, 530, 532, 533] },

    // Cluster: [252,318,530] (3 members)
    { iso: "baoting-hlai", expected: [252, 318, 530], after: [252, 318, 530, 533] }
  ];

  let changed = 0;
  const skipped = [];

  for (const e of edits) {
    const entry = byIso.get(e.iso);
    if (!entry) {
      skipped.push({ iso: e.iso, reason: "not_found" });
      continue;
    }

    const before = Array.isArray(entry.bases) ? entry.bases.slice() : [];
    const beforeKey = keyOf(before);
    const expectedKey = keyOf(e.expected);

    if (beforeKey !== expectedKey) {
      skipped.push({ iso: e.iso, reason: `unexpected_before ${beforeKey} (expected ${expectedKey})` });
      continue;
    }

    const after = sortedUnique(e.after);
    entry.bases = after;
    changed++;
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Decluster Tai-Kadai final size>=3 clusters complete");
  console.log(JSON.stringify({ changed, skippedCount: skipped.length, skipped }, null, 2));
}

if (require.main === module) main();
