"use strict";

// Mixer-map sanity sweep.
//
// This helper inspects config/language-mixes.json and
// config/language-mixer-map.json to surface:
//
// - ISOs that exist in mixes but are missing a base mapping, and vice versa.
// - Bases (by index) that are used across multiple, potentially unrelated
//   families / regions.
// - For each suspicious base, a short summary of the families/regions and
//   ISOs that pull from it.
//
// It is a dev-only tool; it does not affect in-app behavior.
//
// Usage examples (from project root):
//   node tools/check-language-mixer-map-inconsistencies.js
//   node tools/check-language-mixer-map-inconsistencies.js --family=Germanic
//   node tools/check-language-mixer-map-inconsistencies.js --region=Eurasia
//   node tools/check-language-mixer-map-inconsistencies.js --show-all-bases

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

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
    path.join(root, "modules", "namebases-all.js"),
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
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

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const family = getValue("--family");
  const region = getValue("--region");
  const limitArg = getValue("--limit");
  const showAllBases = args.includes("--show-all-bases");
  const help = args.includes("--help") || args.includes("-h");

  const limit = limitArg ? parseInt(limitArg, 10) : null;

  return {family, region, limit, showAllBases, help};
}

function printUsage() {
  console.log("Usage: node tools/check-language-mixer-map-inconsistencies.js [options]\n");
  console.log("Options:");
  console.log("  --family=NAME       Filter mixes by family (e.g. Germanic, Romance, Uralic).");
  console.log("  --region=NAME       Filter mixes by region (e.g. Africa, Eurasia, Americas).");
  console.log("  --limit=N           Limit number of mixes considered after filters.");
  console.log("  --show-all-bases    Also print bases that do not look suspicious.\n");
  console.log("Examples:");
  console.log("  node tools/check-language-mixer-map-inconsistencies.js");
  console.log("  node tools/check-language-mixer-map-inconsistencies.js --family=Germanic");
  console.log("  node tools/check-language-mixer-map-inconsistencies.js --region=Eurasia");
}

function main() {
  const {family, region, limit, showAllBases, help} = parseArgs(process.argv);
  if (help) {
    printUsage();
    return;
  }

  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const mixes = readJson("config/language-mixes.json");
  const mixerMap = readJson("config/language-mixer-map.json");

  const mixByIso = new Map();
  for (const m of mixes) {
    if (!m || !m.iso) continue;
    if (!mixByIso.has(m.iso)) mixByIso.set(m.iso, m);
  }

  const mapByIso = new Map();
  for (const entry of mixerMap) {
    if (!entry || !entry.iso) continue;
    mapByIso.set(entry.iso, entry);
  }

  // Determine which ISOs we care about based on filters.
  let isoEntries = [];
  for (const [iso, mix] of mixByIso.entries()) {
    const mapEntry = mapByIso.get(iso) || null;
    if (family && mix.family !== family) continue;
    if (region && mix.region !== region) continue;
    isoEntries.push({iso, mix, mapEntry});
  }

  isoEntries.sort((a, b) => a.iso.localeCompare(b.iso));
  if (typeof limit === "number" && limit > 0 && isoEntries.length > limit) {
    isoEntries = isoEntries.slice(0, limit);
  }

  const consideredIsos = new Set(isoEntries.map(e => e.iso));

  // Missing mappings: mixes without map, and map entries without mixes.
  const mixesMissingMap = [];
  const mapsMissingMix = [];

  for (const {iso, mix, mapEntry} of isoEntries) {
    if (!mapEntry || !Array.isArray(mapEntry.bases) || !mapEntry.bases.length) {
      mixesMissingMap.push({iso, mix});
    }
  }

  for (const [iso, entry] of mapByIso.entries()) {
    if (!consideredIsos.has(iso)) {
      const mix = mixByIso.get(iso) || null;
      mapsMissingMix.push({iso, entry, mix});
    }
  }

  // Base usage aggregation: which families/regions and ISOs use each base.
  const baseUsage = new Map();

  function ensureUsage(idx) {
    let u = baseUsage.get(idx);
    if (!u) {
      u = {
        idx,
        families: new Map(),
        regions: new Map(),
        isos: new Set(),
      };
      baseUsage.set(idx, u);
    }
    return u;
  }

  for (const {iso, mix, mapEntry} of isoEntries) {
    if (!mapEntry || !Array.isArray(mapEntry.bases)) continue;
    const fam = mix && mix.family;
    const reg = mix && mix.region;

    for (const idx of mapEntry.bases) {
      const u = ensureUsage(idx);
      u.isos.add(iso);
      if (fam) {
        u.families.set(fam, (u.families.get(fam) || 0) + 1);
      }
      if (reg) {
        u.regions.set(reg, (u.regions.get(reg) || 0) + 1);
      }
    }
  }

  console.log("=== Language mixer map sanity sweep ===");
  console.log("Mixes (after filters):", isoEntries.length);
  console.log("Bases referenced (after filters):", baseUsage.size);
  console.log("");

  if (mixesMissingMap.length) {
    console.log("-- Mix entries with NO base mapping (in language-mixer-map.json) --");
    for (const {iso, mix} of mixesMissingMap) {
      console.log(`  ${iso} | ${mix.name || "(unnamed)"} | family=${mix.family || "?"} | region=${mix.region || "?"}`);
    }
    console.log("");
  }

  if (mapsMissingMix.length) {
    console.log("-- Map entries with NO mix definition (in language-mixes.json) --");
    for (const {iso, entry, mix} of mapsMissingMix) {
      const note = mix ? "(has mix globally but filtered out)" : "(no mix entry)";
      console.log(`  ${iso} | bases=${Array.isArray(entry.bases) ? entry.bases.join(",") : "[]"} ${note}`);
    }
    console.log("");
  }

  // Suspicious bases: used across multiple families or regions.
  console.log("-- Bases used across multiple families/regions (potentially suspicious) --");

  const sortedUsage = Array.from(baseUsage.values()).sort((a, b) => a.idx - b.idx);

  for (const u of sortedUsage) {
    const base = baseByIndex.get(u.idx);
    const name = base && base.name ? base.name : "(unnamed)";

    const famEntries = Array.from(u.families.entries());
    const regEntries = Array.from(u.regions.entries());

    const famLabels = famEntries.map(([f, c]) => `${f}(${c})`);
    const regLabels = regEntries.map(([r, c]) => `${r}(${c})`);

    const famDistinct = famEntries.length;
    const regDistinct = regEntries.length;

    const isSuspicious = famDistinct > 1 || regDistinct > 1;
    if (!isSuspicious && !showAllBases) continue;

    console.log(`  [${u.idx}] ${name}`);
    console.log("    families:", famDistinct ? famLabels.join(", ") : "(none)");
    console.log("    regions: ", regDistinct ? regLabels.join(", ") : "(none)");

    const isoList = Array.from(u.isos).sort();
    const sampleIsos = isoList.length > 8 ? isoList.slice(0, 8).concat(["..."]) : isoList;
    console.log("    isos:    ", sampleIsos.join(", "));
    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error in check-language-mixer-map-inconsistencies:",
      err && err.message ? err.message : err,
    );
    process.exitCode = 1;
  }
}
