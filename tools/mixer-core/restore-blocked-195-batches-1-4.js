"use strict";

/**
 * Blocked 195 Batches Restoration Script
 *
 * Restores language-mixer-map.json entries for blocked batch 1-4 languages.
 * Deduplicates map entries and applies dedicated base remaps for Papuan languages.
 *
 * Usage:
 *   node tools/mixer-core/restore-blocked-195-batches-1-4.js
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(rel) {
  const p = path.join(root, rel);
  const raw = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(rel, data) {
  const p = path.join(root, rel);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function main() {
  const rel = "config/language-mixer-map.json";
  const map = readJson(rel);

  if (!Array.isArray(map)) {
    throw new Error("Expected config/language-mixer-map.json to be an array");
  }

  // Dedupe by ISO: keep first occurrence, drop later duplicates.
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

  const byIso = new Map(deduped.filter(e => e && e.iso).map(e => [String(e.iso), e]));

  // Restore Blocked-195 batches 1–4 dedicated-base remaps.
  // Note: These bases are now present in modules/namebases-real.js (539–558).
  const overrides = {
    // Batch 1
    "mardijker-creole": [539],
    tetum: [540],
    sat: [541],
    rbb: [542],

    // Batches 2–4 (Papuan-heavy)
    abui: [543],
    angal: [544],
    asmat: [545],
    "asmat-citak": [546],
    "asmat-kamoro": [547],
    "becking-dawi": [548],
    benabena: [549],
    bimin: [550],
    gadsup: [551],
    gahuku: [552],
    gogodala: [553],
    awiyaana: [554],
    kasua: [555],
    kamoro: [556],
    kerewo: [557],
    kenati: [558],

    // Fix previously broken Bahnaric mapping
    bahnaric: [526],
    "juk-bahnaric": [526]
  };

  let applied = 0;
  let appended = 0;

  for (const [iso, bases] of Object.entries(overrides)) {
    if (byIso.has(iso)) {
      byIso.get(iso).bases = bases;
      applied++;
    } else {
      deduped.push({ iso, bases });
      byIso.set(iso, { iso, bases });
      appended++;
    }
  }

  writeJson(rel, deduped);

  console.log(
    JSON.stringify(
      {
        dedupe: { beforeRows: map.length, afterRows: deduped.length, removed },
        remaps: { applied, appended }
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "restore-blocked-195-batches-1-4 failed:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
