"use strict";

// Report clusters of Language Mixer catalog entries that share identical
// base index sets in config/language-mixer-map.json.
//
// This focuses on **catalog languages** (from config/language-mixes.json)
// and, by default, skips pure family-macro pseudo entries (tags contains
// "family"), matching mixer UI behavior.
//
// Usage (from project root):
//   node tools/report-language-mixer-base-clusters.js [options]
//
// Options:
//   --include-families        Include family-macro pseudo entries
//                             (tags contains "family").
//   --min-size=N              Only report clusters with at least N members
//                             (default: 2).
//   --family=VALUE            Filter to languages whose family contains VALUE
//                             (case-insensitive substring).
//   --category=VALUE          Filter to languages whose category contains VALUE
//                             (case-insensitive substring).
//   --region=VALUE            Filter to languages whose region contains VALUE
//                             (case-insensitive substring).
//
// Output:
//   - Summary of how many catalog languages are mapped.
//   - How many base-set clusters (size >= minSize) exist.
//   - For each cluster (sorted by size descending, then by bases key):
//       bases=[sorted base indices] | members=<count>
//       iso | name | region | family | category | tags
//
// This is a **read-only** helper and does not modify any files.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function toLower(str) {
  return (str || "").toString().toLowerCase();
}

function main() {
  const args = process.argv.slice(2);

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
  const minSize = Math.max(2, Number.isFinite(+minSizeRaw) ? +minSizeRaw : 2);

  const familyFilter = toLower(getArgValue("--family", ""));
  const categoryFilter = toLower(getArgValue("--category", ""));
  const regionFilter = toLower(getArgValue("--region", ""));

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

    // Normalize base set: unique + sorted numeric indices.
    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(b => !Number.isNaN(b));
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
      bases
    };

    // Apply optional metadata filters early so clusters reflect the
    // actual subset we care about.
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
  const totalMembersInMulti = multiClusters.reduce((sum, g) => sum + g.entries.length, 0);

  console.log("=== Language Mixer base-set clusters (catalog languages only) ===");
  console.log("Considered catalog languages (after filters):", consideredLanguages);
  console.log("Total distinct base sets (all sizes):", totalClusters);
  console.log(
    "Clusters with identical base sets (size >= " +
      minSize +
      "):",
    multiCount
  );
  console.log("Total language entries participating in these clusters:", totalMembersInMulti);
  console.log(
    "Columns: iso | name | region | family | category | tags (comma-separated); bases are shared per cluster."
  );
  console.log("");

  if (!multiClusters.length) {
    console.log("No base-set clusters of size >=", minSize, "found.");
    return;
  }

  for (const group of multiClusters) {
    const basesLabel = `[` + group.key + `]`;
    console.log(`-- bases=${basesLabel} | members=${group.entries.length} --`);
    for (const meta of group.entries) {
      const tagsStr = meta.tags && meta.tags.length ? meta.tags.join(",") : "";
      console.log(
        `${meta.iso} | ${meta.name || "(no name)"} | ${meta.region || ""} | ${meta.family || ""} | ${
          meta.category || ""
        } | ${tagsStr}`
      );
    }
    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting language mixer base-set clusters:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
