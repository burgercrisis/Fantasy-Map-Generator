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

function parseArgs(argv) {
  const args = argv.slice(2);

  function findValue(prefix) {
    const hit = args.find(a => a.startsWith(prefix + "="));
    if (!hit) return null;
    return hit.slice(prefix.length + 1);
  }

  const baselineDir = findValue("--baseline-dir");
  const baselineFile = findValue("--baseline-file");
  const maxBaselinesRaw = findValue("--max-baselines");
  const maxBaselines = maxBaselinesRaw != null && maxBaselinesRaw !== "" ? Number(maxBaselinesRaw) : 5;

  return {
    baselineDir,
    baselineFile,
    maxBaselines: Number.isFinite(maxBaselines) && maxBaselines > 0 ? maxBaselines : 5,
    strict: args.includes("--strict")
  };
}

function listBaselineFiles(baselineDir, maxBaselines) {
  const fullDir = path.isAbsolute(baselineDir) ? baselineDir : path.join(root, baselineDir);
  if (!fs.existsSync(fullDir)) return [];

  const files = fs
    .readdirSync(fullDir)
    .filter(f => /^baseline-\d{8}-\d{6}\.json$/i.test(f))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, maxBaselines)
    .map(f => path.join(fullDir, f));

  return files;
}

function indexIsoSet(arr) {
  const set = new Set();
  if (!Array.isArray(arr)) return set;
  for (const v of arr) {
    if (v == null) continue;
    const s = String(v);
    if (!s) continue;
    set.add(s);
  }
  return set;
}

function diffSet(a, b) {
  const out = [];
  for (const v of a) {
    if (!b.has(v)) out.push(v);
  }
  return out;
}

function main() {
  const opts = parseArgs(process.argv);

  if (opts.baselineDir || opts.baselineFile) {
    const currentMap = readJson("config/language-mixer-map.json");
    const currentMixes = readJson("config/language-mixes.json");

    const currentMapByIso = indexByIso(currentMap);
    const currentMixByIso = indexByIso(currentMixes);

    const currentMapIsos = new Set(currentMapByIso.keys());
    const currentCatalogIsos = new Set(currentMixByIso.keys());
    const currentAllIsos = new Set([...currentCatalogIsos, ...currentMapIsos]);

    const baselineFiles = opts.baselineFile
      ? [path.isAbsolute(opts.baselineFile) ? opts.baselineFile : path.join(root, opts.baselineFile)]
      : listBaselineFiles(opts.baselineDir, opts.maxBaselines);

    const lossesByIso = new Map();
    const baselinesUsed = [];

    for (const file of baselineFiles) {
      if (!fs.existsSync(file)) continue;
      let snap;
      try {
        snap = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
      } catch {
        continue;
      }

      const baseCatalog = indexIsoSet(snap && snap.catalogIsos ? snap.catalogIsos : []);
      const baseMap = indexIsoSet(snap && snap.mapIsos ? snap.mapIsos : []);
      const baseAll = indexIsoSet(
        snap && snap.allIsos
          ? snap.allIsos
          : Array.from(new Set([...baseCatalog, ...baseMap]))
      );

      if (!baseAll.size) continue;
      baselinesUsed.push(file);

      const missingAll = diffSet(baseAll, currentAllIsos);
      const missingCatalog = diffSet(baseCatalog, currentCatalogIsos);
      const missingMap = diffSet(baseMap, currentMapIsos);

      function recordMissing(iso, kind) {
        const rec = lossesByIso.get(iso) || {iso, missing: {catalog: false, map: false, all: false}, baselines: []};
        rec.missing[kind] = true;
        if (!rec.baselines.includes(file)) rec.baselines.push(file);
        lossesByIso.set(iso, rec);
      }

      for (const iso of missingAll) recordMissing(iso, "all");
      for (const iso of missingCatalog) recordMissing(iso, "catalog");
      for (const iso of missingMap) recordMissing(iso, "map");
    }

    const list = Array.from(lossesByIso.values()).sort((a, b) => String(a.iso).localeCompare(String(b.iso)));

    const summary = {
      baselinesConsidered: baselineFiles.length,
      baselinesUsed: baselinesUsed.length,
      lostCount: list.length,
      lostFromCatalog: list.filter(r => r.missing && r.missing.catalog).length,
      lostFromMap: list.filter(r => r.missing && r.missing.map).length,
      lostFromAll: list.filter(r => r.missing && r.missing.all).length,
    };

    const out = {
      generatedFrom: {
        repoRoot: root,
        baselineDir: opts.baselineDir || null,
        baselineFile: opts.baselineFile || null,
        maxBaselines: opts.maxBaselines,
      },
      summary,
      languages: list,
    };

    const outPath = path.join(root, "tools", "mixer-diagnostics", "_lost-languages-from-baselines.json");
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

    console.log("Wrote", path.relative(root, outPath).replace(/\\/g, "/"));
    console.log("Lost languages total:", summary.lostCount);
    console.log("Lost from catalog:", summary.lostFromCatalog);
    console.log("Lost from map:", summary.lostFromMap);
    console.log("Lost from all:", summary.lostFromAll);
    console.log("Baselines used:", summary.baselinesUsed);

    if (opts.strict && summary.lostCount > 0) {
      process.exitCode = 1;
    }

    return;
  }

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
