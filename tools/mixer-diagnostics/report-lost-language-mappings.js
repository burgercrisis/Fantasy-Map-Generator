"use strict";

// Diagnostic helper: compare the previous revision (HEAD~1) of
// language-mixer-map.json and language-mixes.json against the current
// working copy, and list every ISO that has been "lost" in this process.
//
// A language is considered "lost" here if EITHER of the following is true:
//   - It had a mapping entry in the old map but does not have one now.
//   - It had a catalog entry in the old catalog but does not have one now.
//
// For each such ISO we record:
//   - whether it had/has catalog entries
//   - whether it had/has map entries
//   - basic catalog metadata before/now (name, region, family, category)
//   - bases[] before/now from the map, if any
//
// Output is written to:
//   tools/mixer-diagnostics/_lost-languages-from-declustering.json
// so it can be inspected or processed later.

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function readJsonFromGit(rev, relPath) {
  const repoPath = relPath.replace(/\\/g, "/");
  const cmd = `git show ${rev}:${repoPath}`;
  const raw = cp.execSync(cmd, {cwd: root, encoding: "utf8"}).replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function indexByIso(arr) {
  const map = new Map();
  if (!Array.isArray(arr)) return map;
  for (const entry of arr) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    if (!map.has(iso)) map.set(iso, entry);
  }
  return map;
}

function main() {
  const oldMap = readJsonFromGit("HEAD~1", "config/language-mixer-map.json");
  const newMap = readJson("config/language-mixer-map.json");
  const oldMixes = readJsonFromGit("HEAD~1", "config/language-mixes.json");
  const newMixes = readJson("config/language-mixes.json");

  const oldMapByIso = indexByIso(oldMap);
  const newMapByIso = indexByIso(newMap);
  const oldMixByIso = indexByIso(oldMixes);
  const newMixByIso = indexByIso(newMixes);

  const lost = new Map();

  // Languages that had a mapping before but not now
  for (const iso of oldMapByIso.keys()) {
    if (!newMapByIso.has(iso)) {
      const rec = lost.get(iso) || {iso};
      rec.hadMapBefore = true;
      rec.hasMapNow = false;
      lost.set(iso, rec);
    }
  }

  // Languages that had a catalog entry before but not now
  for (const iso of oldMixByIso.keys()) {
    if (!newMixByIso.has(iso)) {
      const rec = lost.get(iso) || {iso};
      rec.hadCatalogBefore = true;
      rec.hasCatalogNow = false;
      lost.set(iso, rec);
    }
  }

  // Enrich with metadata before/now and bases[]
  for (const rec of lost.values()) {
    const iso = rec.iso;

    const oldCat = oldMixByIso.get(iso) || null;
    const newCat = newMixByIso.get(iso) || null;
    const oldMapEntry = oldMapByIso.get(iso) || null;
    const newMapEntry = newMapByIso.get(iso) || null;

    rec.nameBefore = oldCat && oldCat.name || null;
    rec.nameNow = newCat && newCat.name || null;
    rec.regionBefore = oldCat && oldCat.region || null;
    rec.regionNow = newCat && newCat.region || null;
    rec.familyBefore = oldCat && oldCat.family || null;
    rec.familyNow = newCat && newCat.family || null;
    rec.categoryBefore = oldCat && oldCat.category || null;
    rec.categoryNow = newCat && newCat.category || null;

    rec.basesBefore = oldMapEntry && Array.isArray(oldMapEntry.bases) ? oldMapEntry.bases.slice() : [];
    rec.basesNow = newMapEntry && Array.isArray(newMapEntry.bases) ? newMapEntry.bases.slice() : [];
  }

  const list = Array.from(lost.values()).sort((a, b) => String(a.iso).localeCompare(String(b.iso)));

  const summary = {
    lostCount: list.length,
    lostMapOnly: list.filter(r => r.hadMapBefore && !r.hasMapNow && !r.hadCatalogBefore && !r.hasCatalogNow).length,
    lostCatalogOnly: list.filter(r => r.hadCatalogBefore && !r.hasCatalogNow && !r.hadMapBefore && !r.hasMapNow).length,
    lostBoth: list.filter(r => (r.hadMapBefore && !r.hasMapNow) && (r.hadCatalogBefore && !r.hasCatalogNow)).length,
    lostMapButStillInCatalog: list.filter(r => r.hadMapBefore && !r.hasMapNow && (r.hadCatalogBefore || r.hasCatalogNow)).length,
  };

  const out = {
    generatedFrom: {
      repoRoot: root,
      baselineRevision: "HEAD~1",
      description: "Languages that had map and/or catalog entries before the declustering commit but no longer do in the current working copy.",
    },
    summary,
    languages: list,
  };

  const outPath = path.join(root, "tools", "mixer-diagnostics", "_lost-languages-from-declustering.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  console.log("Wrote", path.relative(root, outPath).replace(/\\/g, "/"));
  console.log("Lost languages total:", summary.lostCount);
  console.log("Lost map-only entries (no catalog before/now):", summary.lostMapOnly);
  console.log("Lost catalog-only entries (no map before/now):", summary.lostCatalogOnly);
  console.log("Lost from both map and catalog:", summary.lostBoth);
  console.log("Lost from map but still present (before/now) in catalog:", summary.lostMapButStillInCatalog);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while reporting lost language mappings:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
