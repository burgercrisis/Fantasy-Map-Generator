"use strict";

// Restore lost language mappings using the snapshot produced by
// tools/mixer-diagnostics/report-lost-language-mappings.js.
//
// This script is intended to re-insert mappings that existed in the
// previous revision (HEAD~1) of config/language-mixer-map.json but are
// missing now, without touching any mappings that already exist.
//
// It reads:
//   - tools/mixer-diagnostics/_lost-languages-from-declustering.json
//   - config/language-mixer-map.json (current working copy)
//
// For each entry in `languages[]` where:
//   - iso is NOT already present in the current map, and
//   - basesBefore is a non-empty array,
// it appends a new `{iso, bases: basesBefore}` row to the map.
//
// Existing ISOs in the map are left untouched. This makes the script
// idempotent and safe to re-run.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function main() {
  const snapshot = readJson("tools/mixer-diagnostics/_lost-languages-from-declustering.json");
  const map = readJson("config/language-mixer-map.json");

  const originalIsos = new Set(
    Array.isArray(map)
      ? map.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  const lost = Array.isArray(snapshot.languages) ? snapshot.languages : [];
  const existingIsos = new Set();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    existingIsos.add(String(entry.iso));
  }

  let added = 0;
  let skippedExisting = 0;
  let skippedNoBases = 0;

  for (const rec of lost) {
    if (!rec || !rec.iso) continue;
    const iso = String(rec.iso);
    if (existingIsos.has(iso)) {
      skippedExisting++;
      continue;
    }

    const bases = Array.isArray(rec.basesBefore) ? rec.basesBefore.slice() : [];
    if (!bases.length) {
      skippedNoBases++;
      continue;
    }

    map.push({iso, bases});
    existingIsos.add(iso);
    added++;
  }

  const finalIsos = new Set(
    Array.isArray(map)
      ? map.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  for (const iso of originalIsos) {
    if (!finalIsos.has(iso)) {
      console.error(
        "[restore-lost-language-mappings] refusing to write config/language-mixer-map.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Restored lost mappings from _lost-languages-from-declustering.json");
  console.log("  Added entries:", added);
  console.log("  Skipped (already present):", skippedExisting);
  console.log("  Skipped (no basesBefore):", skippedNoBases);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while restoring lost language mappings:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
