"use strict";

// Report how many names each Language Mixer catalog entry effectively has
// available via its mapped namebases.
//
// Usage (from project root):
//   node tools/report-language-mixer-name-counts.js [--include-families] [--sort=...]
//
// Sorting is generally descending (most first) except for some special
// modes like --sort=duplicates (see --help for full list).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadDefaultNameBases() {
  const sandbox = {window: {}};
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js")
  ];

  for (const full of files) {
    let src;
    try {
      src = fs.readFileSync(full, "utf8");
    } catch (e) {
      throw new Error("Failed to read " + full + ": " + (e && e.message ? e.message : e));
    }

    try {
      vm.runInContext(src, context, {filename: full});
    } catch (e) {
      throw new Error("Failed to execute " + full + ": " + (e && e.message ? e.message : e));
    }
  }

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated; did namebases-all.js run?");
  }

  return bases;
}

function buildBaseIndexMap(bases) {
  const map = new Map();
  for (const base of bases) {
    if (!base || typeof base.i !== "number") continue;
    if (!map.has(base.i)) map.set(base.i, base);
  }
  return map;
}

function splitNames(blob) {
  if (!blob || typeof blob !== "string") return [];
  return blob
    .split(",")
    .map(n => n.trim())
    .filter(Boolean);
}

function countNamesForLanguage(entry, baseByIndex) {
  const baseIndices = entry && Array.isArray(entry.bases) ? entry.bases : [];
  const unique = new Set();
  let raw = 0;

  for (const idx of baseIndices) {
    const base = baseByIndex.get(idx);
    if (!base || !base.b) continue;
    const names = splitNames(base.b);
    raw += names.length;
    for (const name of names) unique.add(name);
  }

  const uniqueCount = unique.size;
  const duplicates = raw - uniqueCount;

  return {raw, unique: uniqueCount, baseCount: baseIndices.length, duplicates};
}

function main() {
  const args = process.argv.slice(2);

  const includeFamilies = args.includes("--include-families");
  const onlyMapped = args.includes("--only-mapped");
  const onlyUnmapped = args.includes("--only-unmapped");
  const onlyZeroNames = args.includes("--only-zero-names");
  const onlyHasNames = args.includes("--only-has-names");

  function getFilterValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const regionFilter = getFilterValue("--region");
  const familyFilter = getFilterValue("--family");
  const categoryFilter = getFilterValue("--category");
  const isoFilter = getFilterValue("--iso");

  const sortArg = args.find(a => a.startsWith("--sort="));
  const sortField = sortArg ? sortArg.split("=")[1] : "unique";

  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node tools/report-language-mixer-name-counts.js [options]\n");
    console.log("Filters:");
    console.log("  --include-families        Include family-only pseudo-languages (tags contain 'family').");
    console.log("  --only-mapped             Show only languages that have a mixer mapping.");
    console.log("  --only-unmapped           Show only languages without a mixer mapping.");
    console.log("  --only-zero-names         Show only entries with zero unique names.");
    console.log("  --only-has-names          Show only entries with at least one unique name.\n");
    console.log("Metadata filters (substring, case-insensitive):");
    console.log("  --region=VALUE            Filter by region (e.g. Africa, Mesoamerica).");
    console.log("  --family=VALUE            Filter by family (e.g. Niger-Congo, Mayan).");
    console.log("  --category=VALUE          Filter by category (e.g. Austroasiatic, Creole).");
    console.log("  --iso=VALUE               Filter by ISO id substring.\n");
    console.log("Sorting (default --sort=unique):");
    console.log("  --sort=unique             Sort by unique name count (descending).");
    console.log("  --sort=raw                Sort by raw name count (descending).");
    console.log("  --sort=bases|baseCount    Sort by number of mapped bases (descending).");
    console.log("  --sort=duplicates         Sort by duplicate names (raw - unique), from least to most.");
    console.log("  --sort=dupRatio           Sort by share of duplicates ((raw-unique)/raw), descending.");
    console.log("  --sort=iso                Sort by ISO id.");
    console.log("  --sort=name               Sort by language name.");
    console.log("  --sort=region             Sort by region.");
    console.log("  --sort=family             Sort by family.");
    console.log("  --sort=category           Sort by category.");
    console.log("  --sort=mapped             Mapped languages (1) before unmapped (0).");
    console.log("  --sort=hasNames           Languages with names (1) before those without (0).\n");
    console.log("Output columns:");
    console.log("  rank | u=<unique> r=<raw> b=<bases> m=<mapped?> | iso | name | region | family | category\n");
    console.log("Legend: u=unique names, r=raw names, b=base count, m=mapped?\n");
    return;
  }

  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");
  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const mapByIso = new Map(map.map(e => [e.iso, e]));

  const rows = [];

  const regionFilterLower = regionFilter && regionFilter.toLowerCase();
  const familyFilterLower = familyFilter && familyFilter.toLowerCase();
  const categoryFilterLower = categoryFilter && categoryFilter.toLowerCase();
  const isoFilterLower = isoFilter && isoFilter.toLowerCase();

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;

    // Match mixer UI: skip family-only pseudo-languages unless explicitly requested.
    if (!includeFamilies && Array.isArray(lang.tags) && lang.tags.indexOf("family") !== -1) continue;

    const entry = mapByIso.get(lang.iso);
    const counts = countNamesForLanguage(entry, baseByIndex);

    const row = {
      iso: lang.iso,
      name: lang.name || "",
      region: lang.region || "",
      family: lang.family || "",
      category: lang.category || "",
      raw: counts.raw,
      unique: counts.unique,
      baseCount: counts.baseCount,
      duplicates: counts.duplicates,
      hasMapping: !!entry
    };

    row.hasNames = row.unique > 0;

    if (onlyMapped && !row.hasMapping) continue;
    if (onlyUnmapped && row.hasMapping) continue;
    if (onlyZeroNames && row.hasNames) continue;
    if (onlyHasNames && !row.hasNames) continue;

    if (regionFilterLower && !row.region.toLowerCase().includes(regionFilterLower)) continue;
    if (familyFilterLower && !row.family.toLowerCase().includes(familyFilterLower)) continue;
    if (categoryFilterLower && !row.category.toLowerCase().includes(categoryFilterLower)) continue;
    if (isoFilterLower && !row.iso.toLowerCase().includes(isoFilterLower)) continue;

    rows.push(row);
  }

  const total = rows.length;
  const mappedCount = rows.filter(r => r.hasMapping).length;
  const zeroUnique = rows.filter(r => r.unique === 0).length;
  const withNames = total - zeroUnique;
  const unmappedCount = total - mappedCount;

  function getSortValue(r) {
    switch (sortField) {
      case "raw":
        return r.raw;
      case "bases":
      case "baseCount":
        return r.baseCount;
      case "duplicates": {
        const duplicates = r.raw - r.unique;
        // We want to sort from least to most duplicates, so we invert the
        // value here and keep the common "descending" comparator.
        return -duplicates;
      }
      case "dupRatio": {
        const raw = r.raw || 0;
        if (!raw) return 0;
        const duplicates = r.raw - r.unique;
        return duplicates / raw;
      }
      case "iso":
        return r.iso || "";
      case "name":
        return r.name || "";
      case "region":
        return r.region || "";
      case "family":
        return r.family || "";
      case "category":
        return r.category || "";
      case "mapped":
        return r.hasMapping ? 1 : 0;
      case "hasNames":
        return r.hasNames ? 1 : 0;
      case "unique":
      default:
        return r.unique;
    }
  }

  const sorter = (a, b) => {
    const va = getSortValue(a);
    const vb = getSortValue(b);

    let cmp;
    if (typeof va === "number" && typeof vb === "number") {
      cmp = vb - va; // descending for numeric fields
    } else {
      cmp = String(vb).localeCompare(String(va)); // descending-ish for strings
    }
    if (cmp !== 0) return cmp;

    if (a.unique !== b.unique) return b.unique - a.unique;
    if (a.raw !== b.raw) return b.raw - a.raw;
    return (a.iso || "").localeCompare(b.iso || "");
  };

  rows.sort(sorter);

  console.log("=== Language Mixer name counts ===");
  console.log("Total catalog languages included:", total);
  console.log("Mapped:", mappedCount, "Unmapped:", unmappedCount);
  console.log("With names:", withNames, "Zero names:", zeroUnique);
  if (sortField === "duplicates") {
    console.log("Sorted from least to most by", "duplicates (raw - unique).");
  } else {
    console.log("Sorted from most to least by", sortField + ".");
  }
  console.log("Columns: rank, uniqueCount, rawCount, bases, mapped?, iso, name, region, family, category");
  console.log("");

  if (!rows.length) return;

  const isoWidth = Math.max(3, ...rows.map(r => (r.iso || "").length));
  const nameWidth = Math.max(4, ...rows.map(r => (r.name || "").length));

  rows.forEach((r, idx) => {
    const rank = String(idx + 1).padStart(3, " ");
    const uniqueStr = String(r.unique).padStart(5, " ");
    const rawStr = String(r.raw).padStart(5, " ");
    const basesStr = String(r.baseCount).padStart(3, " ");
    const mappedStr = r.hasMapping ? "Y" : "N";
    const isoStr = (r.iso || "").padEnd(isoWidth, " ");
    const nameStr = (r.name || "").padEnd(nameWidth, " ");

    console.log(
      `${rank} | u=${uniqueStr} r=${rawStr} b=${basesStr} m=${mappedStr} | ${isoStr} | ${nameStr} | ${r.region} | ${r.family} | ${r.category}`
    );
  });

  if (zeroUnique) {
    console.log("");
    console.log("Languages with zero unique names (likely missing or empty mapping):", zeroUnique);
  }

  console.log("");
  console.log("Legend: u=unique names, r=raw names, b=base count, m=mapped?");
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting mixer name counts:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
