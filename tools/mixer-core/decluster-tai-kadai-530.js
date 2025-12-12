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

  // We only target the former mega-cluster where bases were exactly [530].
  const targets = {
    // Hlai lects (Kra-Dai): anchor on Zhuang (530) but include Hlai (318)
    "baisha-hlai": [318, 530, 251],
    "baoting-hlai": [318, 530, 252],
    "changjiang-hlai": [318, 530, 532],
    "cun-hlai": [318, 530, 533],
    "yuanmen-hlai": [317, 318, 530, 533],

    // Zhuang / Zhuang-like
    "standard-zhuang": [317, 530],
    "dai-zhuang": [530, 532],
    "longsang-zhuang": [530, 533],
    "min-zhuang": [251, 530],
    "myang-zhuang": [252, 530],
    "nong-zhuang": [317, 530, 532],
    "pyang-zhuang": [317, 530, 533],
    "yang-zhuang": [251, 317, 530],
    "yei-zhuang": [252, 317, 530],
    "zandui": [251, 252, 530],
    "be-jizhao": [251, 530, 532],
    "jizhao": [252, 530, 532],
    "jiamao": [251, 530, 533],
    "macro-zhuang": [252, 530, 533],

    // Tai lects
    "e-tai": [251, 252, 317, 530],
    "nung-tai": [251, 252, 318, 530],
    "northwestern-tai": [251, 252, 530, 532],
    "tay-tai": [251, 252, 530, 533],
    "tay-tac": [251, 317, 530, 532],
    "central-tai": [251, 318, 530, 532],
    "southern-tai": [251, 317, 530, 533],
    "kam-tai": [251, 318, 530, 533],
    "nadou": [252, 317, 530, 532],
    "moyfaw": [252, 318, 530, 532],
    "yong": [252, 317, 530, 533],
    "yoy": [252, 318, 530, 533],
    "cao-lan": [251, 252, 317, 318, 530],
    "pa-di": [251, 252, 318, 530, 533]
  };

  // Ensure all target signatures are unique (within this batch).
  const seen = new Map();
  for (const [iso, bases] of Object.entries(targets)) {
    const key = JSON.stringify(sortedUnique(bases));
    const prev = seen.get(key);
    if (prev) {
      throw new Error(`Duplicate target bases set for ${prev} and ${iso}: ${key}`);
    }
    seen.set(key, iso);
  }

  let changed = 0;
  let skippedNotFound = 0;
  let skippedUnexpected = 0;

  const byIso = new Map(map.filter(e => e && e.iso).map(e => [String(e.iso), e]));

  for (const [iso, newBasesRaw] of Object.entries(targets)) {
    const entry = byIso.get(iso);
    if (!entry) {
      skippedNotFound++;
      continue;
    }

    const before = Array.isArray(entry.bases) ? entry.bases.slice() : [];
    const beforeKey = JSON.stringify(sortedUnique(before));

    // Only auto-apply if it was exactly the old mega-cluster signature.
    if (beforeKey !== "[530]") {
      skippedUnexpected++;
      continue;
    }

    const after = sortedUnique(newBasesRaw);
    entry.bases = after;

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changed++;
    }
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Decluster Tai-Kadai [530] batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
