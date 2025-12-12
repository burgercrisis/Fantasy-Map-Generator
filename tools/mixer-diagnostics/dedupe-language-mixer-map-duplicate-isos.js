"use strict";

// Dedupe duplicate ISO rows in config/language-mixer-map.json.
//
// Safety model:
// - By default this is read-only and only reports what it would change.
// - With --apply, it rewrites language-mixer-map.json BUT ONLY removes rows that
//   are exact duplicates (same iso + same bases array).
// - If an ISO has conflicting base arrays (same iso, different bases), it will
//   NOT modify those rows. It will report them for manual resolution.
// - Guard: refuses to write if the set of ISO codes would change.
//
// Usage (from project root):
//   node tools/mixer-diagnostics/dedupe-language-mixer-map-duplicate-isos.js
//   node tools/mixer-diagnostics/dedupe-language-mixer-map-duplicate-isos.js --apply

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const mapPath = path.join(root, "config", "language-mixer-map.json");

function readJson(fullPath) {
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function stableStringify(obj) {
  return JSON.stringify(obj, null, 2) + "\n";
}

function basesKey(entry) {
  return Array.isArray(entry.bases) ? entry.bases.join(",") : "";
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");

  const mixerMap = readJson(mapPath);

  const originalIsoSet = new Set();
  for (const e of mixerMap) {
    if (e && e.iso) originalIsoSet.add(String(e.iso));
  }

  // Track duplicates by iso and by exact row signature.
  const seenExact = new Set();
  const duplicatesExact = []; // {iso, index, bases}
  const conflictsByIso = new Map(); // iso -> Set(basesKey)

  const kept = [];

  for (let i = 0; i < mixerMap.length; i++) {
    const entry = mixerMap[i];
    if (!entry || !entry.iso) {
      kept.push(entry);
      continue;
    }

    const iso = String(entry.iso);
    const key = iso + "|" + basesKey(entry);

    if (seenExact.has(key)) {
      duplicatesExact.push({iso, index: i, bases: Array.isArray(entry.bases) ? entry.bases.slice() : []});
      // Skip adding to kept (removes exact dup)
      continue;
    }

    seenExact.add(key);
    kept.push(entry);

    if (!conflictsByIso.has(iso)) conflictsByIso.set(iso, new Set());
    conflictsByIso.get(iso).add(basesKey(entry));
  }

  // Conflicts are isos that still have >1 distinct basesKey after exact dedupe.
  const conflicting = [];
  for (const [iso, keys] of conflictsByIso.entries()) {
    if (keys.size > 1) conflicting.push({iso, keys: Array.from(keys)});
  }
  conflicting.sort((a, b) => a.iso.localeCompare(b.iso));

  console.log("=== language-mixer-map duplicate ISO dedupe (exact duplicates only) ===");
  console.log("rows:           ", mixerMap.length);
  console.log("rows after dedupe:", kept.length);
  console.log("exact dup rows removed:", duplicatesExact.length);
  console.log("isos w/ conflicting bases (NOT modified):", conflicting.length);
  console.log("");

  if (duplicatesExact.length) {
    console.log("-- exact duplicate rows (safe to remove) --");
    for (const d of duplicatesExact.slice(0, 50)) {
      console.log(`  iso=${d.iso} row=${d.index} bases=[${d.bases.join(",")}]`);
    }
    if (duplicatesExact.length > 50) console.log(`  ... (${duplicatesExact.length - 50} more)`);
    console.log("");
  }

  if (conflicting.length) {
    console.log("-- conflicting duplicates (manual decision needed; left untouched) --");
    for (const c of conflicting) {
      console.log(`  iso=${c.iso} base_arrays=${c.keys.map(k => "[" + k + "]").join(" vs ")}`);
    }
    console.log("");
  }

  if (!apply) {
    console.log("(dry-run) No files written. Re-run with --apply to remove exact duplicates.");
    return;
  }

  const newIsoSet = new Set();
  for (const e of kept) {
    if (e && e.iso) newIsoSet.add(String(e.iso));
  }

  if (originalIsoSet.size !== newIsoSet.size) {
    throw new Error(
      `Refusing to write: ISO set size changed original=${originalIsoSet.size} new=${newIsoSet.size}`
    );
  }

  for (const iso of originalIsoSet) {
    if (!newIsoSet.has(iso)) {
      throw new Error(`Refusing to write: ISO missing after dedupe: ${iso}`);
    }
  }

  fs.writeFileSync(mapPath, stableStringify(kept), "utf8");
  console.log("Wrote:", mapPath);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while deduping language-mixer-map duplicate ISOs:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
