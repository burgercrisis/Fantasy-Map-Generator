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

  // Only touch these known Tai-Kadai cluster members, and only if their current bases
  // match the expected (cluster) signature.
  const edits = [
    // Cluster: [317,530,533]
    { iso: "buyang", expected: [317, 530, 533], after: [317, 530, 533, 251] },
    { iso: "qabiao", expected: [317, 530, 533], after: [317, 530, 533, 252] },
    { iso: "kam-dong", expected: [317, 530, 533], after: [317, 530, 533, 532] },

    // Cluster: [251,252,317,530]
    { iso: "lao-nyo", expected: [251, 252, 317, 530], after: [251, 252, 317, 530, 533] },
    { iso: "proto-tai", expected: [251, 252, 317, 530], after: [251, 252, 317, 530, 532] },

    // Cluster: [251,252,530]
    { iso: "kuan", expected: [251, 252, 530], after: [251, 252, 317, 530] },
    { iso: "tai-thanh", expected: [251, 252, 530], after: [251, 252, 318, 530] },

    // Cluster: [251,317,530]
    { iso: "northern-tai", expected: [251, 317, 530], after: [251, 317, 530, 532] },
    { iso: "hezhang-buyi", expected: [251, 317, 530], after: [251, 317, 530, 533] },

    // Cluster: [252,317,530]
    { iso: "tai-hongjin", expected: [252, 317, 530], after: [252, 317, 530, 533] },
    { iso: "mulao-kra", expected: [252, 317, 530], after: [252, 317, 530, 532] },

    // Cluster: [252,530]
    { iso: "tai-daeng", expected: [252, 530], after: [252, 317, 530] },
    { iso: "tai-meuay", expected: [252, 530], after: [252, 318, 530] },

    // Cluster: [317,318,530]
    { iso: "qau", expected: [317, 318, 530], after: [317, 318, 530, 533] },
    { iso: "bouyei", expected: [317, 318, 530], after: [317, 318, 530, 532] },

    // Cluster: [317,318,530,533]
    { iso: "proto-hlai", expected: [317, 318, 530, 533], after: [251, 317, 318, 530, 533] },
    { iso: "proto-kra", expected: [317, 318, 530, 533], after: [252, 317, 318, 530, 533] },

    // Cluster: [318,530]
    { iso: "bouhin", expected: [318, 530], after: [251, 318, 530] },
    { iso: "be-lang", expected: [318, 530], after: [252, 318, 530] }
  ];

  // Validate internal consistency
  for (const e of edits) {
    if (keyOf(e.expected) === keyOf(e.after)) {
      throw new Error(`No-op edit for ${e.iso}: expected==after ${keyOf(e.expected)}`);
    }
  }

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

  console.log("Decluster Tai-Kadai small clusters complete");
  console.log(JSON.stringify({ changed, skippedCount: skipped.length, skipped: skipped.slice(0, 20) }, null, 2));
}

if (require.main === module) main();
