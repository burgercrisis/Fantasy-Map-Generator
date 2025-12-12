"use strict";

// Read-only helper: report duplicate ISO entries inside config/language-mixer-map.json.
// Usage (from project root):
//   node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function main() {
  const mixerMap = readJson(path.join("config", "language-mixer-map.json"));
  const byIso = new Map();
  const dups = new Map();

  for (let i = 0; i < mixerMap.length; i++) {
    const entry = mixerMap[i];
    if (!entry || !entry.iso) continue;

    const iso = String(entry.iso);
    if (!byIso.has(iso)) {
      byIso.set(iso, {entry, index: i});
      continue;
    }

    if (!dups.has(iso)) dups.set(iso, [byIso.get(iso)]);
    dups.get(iso).push({entry, index: i});
  }

  console.log("=== Duplicate ISO entries in language-mixer-map.json ===");
  console.log("Total rows:", mixerMap.length);
  console.log("Unique ISOs:", byIso.size);
  console.log("Duplicate ISO codes:", dups.size);
  console.log("");

  if (!dups.size) return;

  const sorted = Array.from(dups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [iso, rows] of sorted) {
    console.log(`ISO: ${iso} (count=${rows.length})`);
    for (const r of rows) {
      const bases = Array.isArray(r.entry.bases) ? r.entry.bases.join(",") : "";
      console.log(`  - row=${r.index} bases=[${bases}]`);
    }
    const uniqueBaseSets = new Set(
      rows.map(r => (Array.isArray(r.entry.bases) ? r.entry.bases.join(",") : ""))
    );
    console.log(`  unique base arrays: ${uniqueBaseSets.size}`);
    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while checking language-mixer-map duplicate ISOs:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
