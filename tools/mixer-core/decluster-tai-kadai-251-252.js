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

  const targets = {
    "chiang-saen": [251, 252, 532],
    "southwestern-tai": [251, 252, 532, 530],
    "kaloeng": [251, 252, 533],
    "khamti": [251, 252, 532, 317],
    "khamyang": [251, 252, 532, 318],
    "khun": [251, 252, 532, 533],
    "kuan": [251, 252, 530],
    "lao-nyo": [251, 252, 530, 317],
    "lao-phutai": [251, 252, 530, 318],
    "phake": [251, 252, 532, 530, 317],
    "phu-thai": [251, 252, 532, 530, 318],
    "phuan": [251, 252, 532, 317, 533],
    "saek": [251, 252, 532, 318, 533],
    "sapa": [251, 252, 317],
    "tai-don": [251, 252, 318],
    "tai-muong-vat": [251, 252, 317, 530, 533],
    "thai-song": [251, 252, 318, 530, 533],
    "tsun-lao": [251, 252, 317, 318],
    "turung": [251, 252, 317, 318, 532],
    "a-ou": [251, 252, 317, 318, 532, 533],
    "tai": [251, 252, 530, 533]
  };

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

    if (beforeKey !== "[251,252]") {
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

  console.log("Decluster Tai-Kadai [251,252] batch complete");
  console.log(JSON.stringify({ changed, skippedNotFound, skippedUnexpected }, null, 2));
}

if (require.main === module) main();
