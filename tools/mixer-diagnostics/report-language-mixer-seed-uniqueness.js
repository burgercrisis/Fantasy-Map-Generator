"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

const STRICT_MIN_UNIQUE_SEEDS = 1;
const NORMALIZED_MIN_UNIQUE_SEEDS = 10;

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw);
}

function loadDefaultNameBases() {
  const sandbox = {window: {}, module: {exports: {}}, exports: {}, console, nameBases: []};
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js")
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

function splitSeeds(blob) {
  if (!blob || typeof blob !== "string") return [];
  return blob
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function normalizeSeed(s) {
  if (!s) return "";
  let out = String(s).toLowerCase();
  out = out.normalize("NFD").replace(/\p{M}+/gu, "");
  out = out.replace(/[^\p{L}\p{N}]+/gu, "");
  return out;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const includeFamilies = args.includes("--include-families");
  const onlyFailures = args.includes("--only-failures");

  const onlyArg = args.find(a => a.startsWith("--only="));
  const onlyIsosArg = args.find(a => a.startsWith("--only-isos="));
  const onlyIsos = onlyArg
    ? onlyArg
        .split("=")
        .slice(1)
        .join("=")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    : onlyIsosArg
      ? onlyIsosArg
          .split("=")
          .slice(1)
          .join("=")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      : [];

  const limitArg = args.find(a => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 60;

  const help = args.includes("--help") || args.includes("-h");

  return {includeFamilies, onlyFailures, onlyIsos, limit, help};
}

function printUsage() {
  console.log("Usage:");
  console.log("  node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  --include-families   Include tags:[\"family\"] catalog entries in the report.");
  console.log("  --only-failures      Print only rows that fail at least one rule.");
  console.log("  --only=iso1,iso2     Restrict targets to the specified ISO codes.");
  console.log("  --only-isos=iso1,iso2 Alias for --only=.");
  console.log("  --limit=N            Max rows to print (default: 60).");
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function main() {
  const parsed = parseArgs(process.argv);
  const {includeFamilies, onlyFailures, limit, help} = parsed;
  const onlyIsos = parsed.onlyIsos || [];
  if (help) {
    printUsage();
    return;
  }

  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c || !c.iso) continue;
    catalogByIso.set(c.iso, c);
  }

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r || !r.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(r.iso, r.bases);
  }

  // Evaluate compliance primarily for catalog entries ("languages in the app").
  const targetIsos = [];
  for (const [iso, entry] of catalogByIso.entries()) {
    if (!includeFamilies && isFamilyEntry(entry)) continue;
    targetIsos.push(iso);
  }

  if (onlyIsos && onlyIsos.length) {
    const set = new Set(onlyIsos);
    targetIsos.splice(0, targetIsos.length, ...targetIsos.filter(iso => set.has(iso)));
  }
  targetIsos.sort((a, b) => a.localeCompare(b));

  // Uniqueness comparisons are computed over *all* mapping entries in the project,
  // excluding family-macro catalog entries.
  const comparisonIsos = [];
  for (const [iso] of mapByIso.entries()) {
    const entry = catalogByIso.get(iso);
    if (entry && isFamilyEntry(entry)) continue;
    comparisonIsos.push(iso);
  }

  const baseUseCount = new Map();
  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;
    for (const b of bases) {
      if (typeof b !== "number") continue;
      baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
    }
  }

  const baseSeedCache = new Map();
  const getBaseSeedSets = baseIndex => {
    if (baseSeedCache.has(baseIndex)) return baseSeedCache.get(baseIndex);
    const base = nameBases[baseIndex];
    const strictArr = base ? splitSeeds(base.b) : [];
    const strictSet = new Set(strictArr);
    const normSet = new Set(strictArr.map(normalizeSeed).filter(Boolean));
    const value = {strictSet, normSet};
    baseSeedCache.set(baseIndex, value);
    return value;
  };

  // Build global token -> iso-count maps across all bases used by an ISO.
  const strictIsoCount = new Map();
  const normIsoCount = new Map();

  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;

    const isoStrict = new Set();
    const isoNorm = new Set();

    for (const b of bases) {
      if (typeof b !== "number") continue;
      const {strictSet, normSet} = getBaseSeedSets(b);
      for (const t of strictSet) isoStrict.add(t);
      for (const t of normSet) isoNorm.add(t);
    }

    for (const t of isoStrict) strictIsoCount.set(t, (strictIsoCount.get(t) || 0) + 1);
    for (const t of isoNorm) normIsoCount.set(t, (normIsoCount.get(t) || 0) + 1);
  }

  const results = [];

  for (const iso of targetIsos) {
    const entry = catalogByIso.get(iso);
    const bases = mapByIso.get(iso);

    if (!bases) {
      results.push({
        iso,
        name: entry && entry.name ? entry.name : "",
        hasMapping: false,
        uniqueBases: [],
        strictUniqueSeeds: 0,
        normUniqueSeeds: 0,
        passUniqueBase: false,
        passStrict: false,
        passNormalized: false
      });
      continue;
    }

    const uniqueBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) === 1);

    const strictUnique = new Set();
    const normUnique = new Set();

    for (const b of uniqueBases) {
      const {strictSet, normSet} = getBaseSeedSets(b);
      for (const t of strictSet) {
        if ((strictIsoCount.get(t) || 0) === 1) strictUnique.add(t);
      }
      for (const t of normSet) {
        if ((normIsoCount.get(t) || 0) === 1) normUnique.add(t);
      }
    }

    const passUniqueBase = uniqueBases.length > 0;
    const passStrict = strictUnique.size >= STRICT_MIN_UNIQUE_SEEDS;
    const passNormalized = normUnique.size >= NORMALIZED_MIN_UNIQUE_SEEDS;

    results.push({
      iso,
      name: entry && entry.name ? entry.name : "",
      hasMapping: true,
      uniqueBases,
      strictUniqueSeeds: strictUnique.size,
      normUniqueSeeds: normUnique.size,
      passUniqueBase,
      passStrict,
      passNormalized
    });
  }

  const missingMapping = results.filter(r => !r.hasMapping).length;
  const failUniqueBase = results.filter(r => r.hasMapping && !r.passUniqueBase).length;
  const failStrict = results.filter(r => r.hasMapping && r.passUniqueBase && !r.passStrict).length;
  const failNorm = results.filter(r => r.hasMapping && r.passUniqueBase && !r.passNormalized).length;

  const summaryLines = [
    "=== Language mixer seed uniqueness report ===",
    `Scope (targets): catalog entries${includeFamilies ? " (including families)" : " (non-family only)"}`,
    "Compared against: all mapping entries excluding family-macro catalog isos",
    `Thresholds: strict>=${STRICT_MIN_UNIQUE_SEEDS} normalized>=${NORMALIZED_MIN_UNIQUE_SEEDS}`,
    "",
    `Target ISOs: ${results.length}`,
    `Missing mapping: ${missingMapping}`,
    `No globally-unique base index: ${failUniqueBase}`,
    `Strict unique seeds below threshold (among those with unique base): ${failStrict}`,
    `Normalized unique seeds below threshold (among those with unique base): ${failNorm}`,
    "",
  ];

  const rows = (onlyFailures
    ? results.filter(r => !r.hasMapping || !r.passUniqueBase || !r.passStrict || !r.passNormalized)
    : results
  )
    .sort((a, b) => {
      const ak = (a.passUniqueBase ? 1 : 0) + (a.passStrict ? 1 : 0) + (a.passNormalized ? 1 : 0);
      const bk = (b.passUniqueBase ? 1 : 0) + (b.passStrict ? 1 : 0) + (b.passNormalized ? 1 : 0);
      return ak - bk || a.iso.localeCompare(b.iso);
    })
    .slice(0, Math.max(0, limit));

  for (const r of rows) {
    const status = [
      r.hasMapping ? "map" : "NO_MAP",
      r.passUniqueBase ? "uniqBase" : "NO_UNIQ_BASE",
      r.passStrict ? "strictOK" : `strict<${STRICT_MIN_UNIQUE_SEEDS}`,
      r.passNormalized ? "normOK" : `norm<${NORMALIZED_MIN_UNIQUE_SEEDS}`
    ].join(" |");

    console.log(`${r.iso} | ${r.name} | ${status}`);
    if (r.hasMapping) {
      console.log(
        `  uniqueBases=[${r.uniqueBases.join(",")}] strictUniqueSeeds=${r.strictUniqueSeeds} normUniqueSeeds=${r.normUniqueSeeds}`
      );
    }
  }

  console.log("");
  for (const line of summaryLines) {
    console.log(line);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}
