"use strict";

// Select a worker-specific batch of languages from the Language Mixer
// base-set clusters, so multiple people (or runs) can split the work of
// giving each language a unique base set.
//
// This mirrors the core logic of `report-language-mixer-base-clusters.js`
// but flattens all cluster members into a single ordered "issue list",
// then slices out a batch for a given worker.
//
// Usage (from project root):
//   node tools/mixer-diagnostics/select-language-mixer-base-batch.js [options]
//
// Options:
//   --include-families          Include family-macro pseudo entries
//                               (tags contains "family"). Defaults to false.
//   --min-size=N                Only consider clusters with at least N members
//                               (default: 2).
//   --family=VALUE              Filter to languages whose family contains VALUE
//                               (case-insensitive substring).
//   --category=VALUE            Filter to languages whose category contains VALUE
//                               (case-insensitive substring).
//   --region=VALUE              Filter to languages whose region contains VALUE
//                               (case-insensitive substring).
//   --worker=N                  1-based worker index (default: 1).
//   --batch-size=N              Number of languages per worker batch (default: 10).
//   --skip-base-sets=SPEC       Optional; skip whole clusters whose normalized
//                               base-set key matches one of the keys in SPEC.
//                               SPEC is a semicolon-separated list of
//                               comma-separated base indices, e.g.:
//                                 9;140;18,23
//                               The script normalizes each set by sorting
//                               numerically, so "23,18" and "18,23" are
//                               equivalent.
//
// Output:
//   - Summary counts of clusters and issue languages.
//   - Selected batch for the requested worker, with global positions and
//     per-language metadata:
//       idx | iso | name | region | family | category | tags | bases
//
// This is a **read-only** helper and does not modify any files.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function toLower(str) {
  return (str || "").toString().toLowerCase();
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getFlag(name) {
    return args.includes(name);
  }

  function getArgValue(prefix, defaultValue = null) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    if (!arg) return defaultValue;
    const value = arg.slice(prefix.length + 1);
    return value === "" ? defaultValue : value;
  }

  const includeFamilies = getFlag("--include-families");

  const minSizeRaw = getArgValue("--min-size", "2");
  const minSizeNum = Number(minSizeRaw);
  const minSize = Math.max(2, Number.isFinite(minSizeNum) ? minSizeNum : 2);

  const familyFilter = toLower(getArgValue("--family", ""));
  const categoryFilter = toLower(getArgValue("--category", ""));
  const regionFilter = toLower(getArgValue("--region", ""));

  const workerRaw = getArgValue("--worker", "1");
  const workerNum = Number(workerRaw);
  const worker = Math.max(1, Number.isFinite(workerNum) ? workerNum : 1);

  const batchSizeRaw = getArgValue("--batch-size", "10");
  const batchSizeNum = Number(batchSizeRaw);
  const batchSize = Math.max(1, Number.isFinite(batchSizeNum) ? batchSizeNum : 10);

  const skipSpecRaw = getArgValue("--skip-base-sets", "") || "";
  const skipBaseKeys = new Set();
  if (skipSpecRaw.trim()) {
    const sets = skipSpecRaw.split(";");
    for (const setSpec of sets) {
      const trimmed = setSpec.trim();
      if (!trimmed) continue;
      const parts = trimmed
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n));
      if (!parts.length) continue;
      const key = Array.from(new Set(parts))
        .sort((a, b) => a - b)
        .join(",");
      if (key) skipBaseKeys.add(key);
    }
  }

  return {
    includeFamilies,
    minSize,
    familyFilter,
    categoryFilter,
    regionFilter,
    worker,
    batchSize,
    skipBaseKeys,
  };
}

function main() {
  const {
    includeFamilies,
    minSize,
    familyFilter,
    categoryFilter,
    regionFilter,
    worker,
    batchSize,
    skipBaseKeys,
  } = parseArgs(process.argv);

  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  let consideredLanguages = 0;
  const clusters = new Map(); // key => array of meta

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue; // map entry not present in catalog

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    const isFamilyMacro = tags.includes("family");
    if (isFamilyMacro && !includeFamilies) continue; // skip UI-invisible macros by default

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue; // nothing to cluster on

    const uniqueBases = Array.from(
      new Set(basesSource.map(b => Number(b)))
    ).filter(b => !Number.isNaN(b));
    if (!uniqueBases.length) continue;

    const bases = uniqueBases.sort((a, b) => a - b);
    const key = bases.join(",");

    const meta = {
      iso,
      name: lang.name || "",
      region: lang.region || "",
      family: lang.family || "",
      category: lang.category || "",
      tags,
      bases,
      basesKey: key,
    };

    if (familyFilter && !toLower(meta.family).includes(familyFilter)) continue;
    if (categoryFilter && !toLower(meta.category).includes(categoryFilter)) continue;
    if (regionFilter && !toLower(meta.region).includes(regionFilter)) continue;

    consideredLanguages++;

    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(meta);
  }

  const rawClusters = Array.from(clusters.entries());

  const multiClusters = rawClusters
    .map(([key, entries]) => ({key, entries}))
    .filter(group => group.entries.length >= minSize);

  // Sort clusters: largest first, then by bases key.
  multiClusters.sort((a, b) => {
    if (b.entries.length !== a.entries.length) return b.entries.length - a.entries.length;
    return a.key.localeCompare(b.key);
  });

  const totalClusters = rawClusters.length;
  const multiCount = multiClusters.length;

  const flatIssues = [];
  for (const group of multiClusters) {
    if (skipBaseKeys.has(group.key)) continue;
    // Keep member order stable, but sort by ISO within each group for determinism.
    const sortedEntries = group.entries.slice().sort((a, b) => a.iso.localeCompare(b.iso));
    for (const meta of sortedEntries) {
      flatIssues.push(meta);
    }
  }

  const totalIssues = flatIssues.length;

  console.log("=== Language Mixer base-set issue batch selector ===");
  console.log("Considered catalog languages (after filters):", consideredLanguages);
  console.log("Total distinct base sets (all sizes):", totalClusters);
  console.log(
    "Clusters with identical base sets (size >= " +
      minSize +
      "):",
    multiCount,
  );
  console.log("Total issue languages after skips:", totalIssues);
  console.log("");

  if (!totalIssues) {
    console.log("No issue languages remain after applying filters and skips.");
    return;
  }

  const startIndex = (worker - 1) * batchSize;
  const endIndexExclusive = startIndex + batchSize;

  if (startIndex >= totalIssues) {
    console.log(
      "Requested worker=" +
        worker +
        " batch-size=" +
        batchSize +
        " starts at index " +
        (startIndex + 1) +
        ", but only " +
        totalIssues +
        " issue languages remain.",
    );
    const maxWorker = Math.ceil(totalIssues / batchSize);
    console.log("Max worker index with a non-empty batch:", maxWorker);
    return;
  }

  const batch = flatIssues.slice(startIndex, endIndexExclusive);
  console.log(
    "Selected batch for worker=" +
      worker +
      ", batch-size=" +
      batchSize +
      ":",
  );
  console.log(
    "Global positions " +
      (startIndex + 1) +
      ".." +
      (startIndex + batch.length) +
      " of " +
      totalIssues +
      ".",
  );
  console.log("Columns: idx | iso | name | region | family | category | tags | bases");

  batch.forEach((meta, i) => {
    const idx = startIndex + i + 1;
    const tagsStr = meta.tags && meta.tags.length ? meta.tags.join(",") : "";
    console.log(
      `${idx} | ${meta.iso} | ${meta.name || "(no name)"} | ${meta.region || ""} | ${
        meta.family || ""
      } | ${meta.category || ""} | ${tagsStr} | [${meta.bases.join(",")}]`,
    );
  });

  const baseKeysInBatch = Array.from(
    new Set(batch.map(m => (Array.isArray(m.bases) ? m.bases.join(",") : ""))),
  )
    .filter(Boolean)
    .sort();

  console.log("");
  console.log("Base-set keys in this batch:", baseKeysInBatch.join(" ; "));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while selecting language mixer base-set batch:",
      err && err.message ? err.message : err,
    );
    process.exitCode = 1;
  }
}
