"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

const STRICT_MIN_UNIQUE_SEEDS = 1;
const NORMALIZED_MIN_UNIQUE_SEEDS = 10;

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
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

function isSyntheticFillerToken(iso, seed) {
  if (!iso || !seed) return false;
  const s = String(seed).trim();
  if (!s) return false;
  const re = new RegExp(`^${iso}_(?:unq|fill)\\d+$`, "i");
  return re.test(s);
}

function normalizeSeed(s) {
  if (!s) return "";
  let out = String(s).toLowerCase();
  out = out.normalize("NFD").replace(/\p{M}+/gu, "");
  out = out.replace(/[^\p{L}\p{N}]+/gu, "");
  return out;
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function computeCoverageSummary() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  let mapNotCatalog = 0;
  for (const iso of mapIsos) {
    if (!mixIsos.has(iso)) mapNotCatalog++;
  }

  let catalogNotMap = 0;
  for (const iso of mixIsos) {
    if (!mapIsos.has(iso)) catalogNotMap++;
  }

  return {
    mapTotal: mapIsos.size,
    catalogTotal: mixIsos.size,
    mapNotCatalog,
    catalogNotMap
  };
}

function loadValidBaseIndices() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];

  const indices = new Set();
  const re = /\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+)/g;

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const idx = Number(m[2]);
      if (!Number.isNaN(idx)) indices.add(idx);
    }
  }

  return indices;
}

function computeFailuresSummary() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");
  const validBaseIndices = loadValidBaseIndices();

  const mapByIso = new Map(map.map(e => [e.iso, e]));
  const catalogIsos = new Set(mixes.map(m => m.iso));

  let missingMapping = 0;
  let emptyBases = 0;
  let allBasesInvalid = 0;
  let partiallyInvalid = 0;

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;

    if (Array.isArray(lang.tags) && lang.tags.indexOf("family") !== -1) continue;

    const entry = mapByIso.get(lang.iso);
    if (!entry) {
      missingMapping++;
      continue;
    }

    if (!Array.isArray(entry.bases) || !entry.bases.length) {
      emptyBases++;
      continue;
    }

    const invalid = entry.bases.filter(b => !validBaseIndices.has(b));
    if (invalid.length === entry.bases.length) {
      allBasesInvalid++;
    } else if (invalid.length > 0) {
      partiallyInvalid++;
    }
  }

  let mapOnly = 0;
  for (const e of map) {
    if (!catalogIsos.has(e.iso)) mapOnly++;
  }

  const totalCatalogEntries = mixes.length;
  const totalFailures = missingMapping + emptyBases + allBasesInvalid;

  return {
    totalCatalogEntries,
    totalFailures,
    missingMapping,
    emptyBases,
    allBasesInvalid,
    partiallyInvalid,
    mapOnly
  };
}

function computeSeedUniquenessSummary() {
  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c || !c.iso) continue;
    catalogByIso.set(String(c.iso), c);
  }

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r || !r.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(String(r.iso), r.bases);
  }

  const targetIsos = [];
  for (const [iso, entry] of catalogByIso.entries()) {
    if (isFamilyEntry(entry)) continue;
    targetIsos.push(iso);
  }

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

  let missingMapping = 0;
  let noGloballyUniqueBaseIndex = 0;
  let strictBelowThreshold = 0;
  let normalizedBelowThreshold = 0;

  for (const iso of targetIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) {
      missingMapping++;
      continue;
    }

    const uniqueBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) === 1);
    const passUniqueBase = uniqueBases.length > 0;
    if (!passUniqueBase) {
      noGloballyUniqueBaseIndex++;
      continue;
    }

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

    if (strictUnique.size < STRICT_MIN_UNIQUE_SEEDS) strictBelowThreshold++;
    if (normUnique.size < NORMALIZED_MIN_UNIQUE_SEEDS) normalizedBelowThreshold++;
  }

  return {
    targetIsos: targetIsos.length,
    missingMapping,
    noGloballyUniqueBaseIndex,
    strictBelowThreshold,
    normalizedBelowThreshold
  };
}

function computePremixNameGradesSummary({allowFillers}) {
  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r || !r.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(String(r.iso), r.bases);
  }

  const isos = [];
  for (const entry of catalog) {
    if (!entry || !entry.iso) continue;
    if (isFamilyEntry(entry)) continue;
    isos.push(String(entry.iso));
  }

  let missingMapping = 0;

  let a50Plus = 0;
  let gap40to49 = 0;
  let bUnder40 = 0;
  let cUnder30 = 0;
  let dUnder20 = 0;
  let fUnder10 = 0;

  let isosWithFillers = 0;
  let totalFillerTokens = 0;
  const fillerIsos = [];

  for (const iso of isos) {
    const bases = mapByIso.get(iso);
    if (!bases || !bases.length) {
      missingMapping++;
      fUnder10++;
      continue;
    }

    const premix = new Set();
    const fillers = new Set();
    for (const b of bases) {
      if (typeof b !== "number") continue;
      const base = nameBases[b];
      const seeds = base ? splitSeeds(base.b) : [];
      for (const s of seeds) {
        if (isSyntheticFillerToken(iso, s)) fillers.add(s);
        else premix.add(s);
      }
    }

    if (fillers.size) {
      isosWithFillers++;
      totalFillerTokens += fillers.size;
      fillerIsos.push({iso, fillerCount: fillers.size, fillerSamples: Array.from(fillers).slice(0, 5)});
    }

    const count = premix.size + (allowFillers ? fillers.size : 0);
    if (count >= 50) a50Plus++;
    else if (count >= 40) gap40to49++;
    else if (count >= 30) bUnder40++;
    else if (count >= 20) cUnder30++;
    else if (count >= 10) dUnder20++;
    else fUnder10++;
  }

  return {
    targetIsos: isos.length,
    missingMapping,
    allowFillers: !!allowFillers,
    a50Plus,
    gap40to49,
    bUnder40,
    cUnder30,
    dUnder20,
    fUnder10,
    fillerUsage: {
      isosWithFillers,
      totalFillerTokens,
      byIso: fillerIsos.sort((a, b) => b.fillerCount - a.fillerCount || a.iso.localeCompare(b.iso))
    }
  };
}

function computeBaseClusterSummary() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixByIso = new Map();
  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    mixByIso.set(String(lang.iso), lang);
  }

  let consideredCatalogLanguages = 0;
  const clusters = new Map();

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const iso = String(entry.iso);
    const lang = mixByIso.get(iso);
    if (!lang) continue;

    const tags = Array.isArray(lang.tags) ? lang.tags : [];
    if (tags.includes("family")) continue;

    const basesSource = Array.isArray(entry.bases) ? entry.bases : [];
    if (!basesSource.length) continue;

    const uniqueBases = Array.from(new Set(basesSource.map(b => Number(b)))).filter(b => !Number.isNaN(b));
    if (!uniqueBases.length) continue;

    const bases = uniqueBases.sort((a, b) => a - b);
    const key = bases.join(",");

    consideredCatalogLanguages++;
    if (!clusters.has(key)) clusters.set(key, 0);
    clusters.set(key, clusters.get(key) + 1);
  }

  const totalDistinctBaseSets = clusters.size;
  let clustersSizeGte2 = 0;
  let entriesInClusters = 0;
  let largestClusterSize = 0;

  for (const size of clusters.values()) {
    if (size > largestClusterSize) largestClusterSize = size;
    if (size >= 2) {
      clustersSizeGte2++;
      entriesInClusters += size;
    }
  }

  return {
    consideredCatalogLanguages,
    totalDistinctBaseSets,
    clustersSizeGte2,
    entriesInClusters,
    largestClusterSize
  };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    diff: args.includes("--diff"),
    allowFillers: args.includes("--allow-fillers") || args.includes("--fast-pass"),
    help: args.includes("--help") || args.includes("-h")
  };
}

function printUsage() {
  console.log("Usage:");
  console.log("  node tools/mixer-diagnostics/snapshot-mixer-health-stats.js [--diff] [--allow-fillers|--fast-pass]");
}

function tryReadJson(fullPath) {
  try {
    const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readLastJsonl(fullPath) {
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return null;
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
  }
}

function diffNumbers(prev, next, pathLabel) {
  const pv = typeof prev === "number" ? prev : null;
  const nv = typeof next === "number" ? next : null;
  if (pv == null || nv == null) return null;
  return {path: pathLabel, prev: pv, next: nv, delta: nv - pv};
}

function main() {
  const {diff, allowFillers, help} = parseArgs(process.argv);
  if (help) {
    printUsage();
    return;
  }

  const latestRel = "tools/mixer-diagnostics/_mixer-health-stats.latest.json";
  const historyRel = "tools/mixer-diagnostics/_mixer-health-stats.history.jsonl";
  const latestFull = path.join(root, latestRel);
  const historyFull = path.join(root, historyRel);

  const prevSnapshot = tryReadJson(latestFull) || readLastJsonl(historyFull);

  const snapshot = {
    utcIso: new Date().toISOString(),
    coverage: computeCoverageSummary(),
    failures: computeFailuresSummary(),
    seedUniqueness: computeSeedUniquenessSummary(),
    premixNameGrades: computePremixNameGradesSummary({allowFillers}),
    baseClusters: computeBaseClusterSummary()
  };

  fs.mkdirSync(path.dirname(latestFull), {recursive: true});
  fs.writeFileSync(latestFull, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  fs.appendFileSync(historyFull, JSON.stringify(snapshot) + "\n", "utf8");

  console.log("Wrote", latestRel);
  console.log("Appended", historyRel);
  console.log("");

  console.log("Coverage:");
  console.log("  Total ISO codes in mixer map:", snapshot.coverage.mapTotal);
  console.log("  Total ISO codes in mixer catalog:", snapshot.coverage.catalogTotal);
  console.log("  ISOs in map but missing from catalog:", snapshot.coverage.mapNotCatalog);
  console.log("  ISOs in catalog but missing from map:", snapshot.coverage.catalogNotMap);
  console.log("");

  console.log("Failures (local mixer):");
  console.log("  Total catalog entries:", snapshot.failures.totalCatalogEntries);
  console.log("  Total failures (no usable bases):", snapshot.failures.totalFailures);
  console.log("    - Missing mapping entries:", snapshot.failures.missingMapping);
  console.log("    - Mapped but bases array empty:", snapshot.failures.emptyBases);
  console.log("    - Mapped but all bases invalid:", snapshot.failures.allBasesInvalid);
  console.log("    - Mapped but partially invalid:", snapshot.failures.partiallyInvalid);
  console.log("    - Map-only entries (not in catalog):", snapshot.failures.mapOnly);
  console.log("");

  console.log("Seed uniqueness:");
  console.log("  Target ISOs:", snapshot.seedUniqueness.targetIsos);
  console.log("  Missing mapping:", snapshot.seedUniqueness.missingMapping);
  console.log("  No globally-unique base index:", snapshot.seedUniqueness.noGloballyUniqueBaseIndex);
  console.log(
    "  Strict unique seeds below threshold (among those with unique base):",
    snapshot.seedUniqueness.strictBelowThreshold
  );
  console.log(
    "  Normalized unique seeds below threshold (among those with unique base):",
    snapshot.seedUniqueness.normalizedBelowThreshold
  );
  console.log("");

  console.log("Premix name grades (unique premix seed tokens per ISO):");
  console.log("  Target ISOs:", snapshot.premixNameGrades.targetIsos);
  console.log("  Missing mapping:", snapshot.premixNameGrades.missingMapping);
  console.log("  Allow fillers:", snapshot.premixNameGrades.allowFillers);
  console.log("  A (50+):", snapshot.premixNameGrades.a50Plus);
  console.log("  Gap (40-49):", snapshot.premixNameGrades.gap40to49);
  console.log("  B (<40, >=30):", snapshot.premixNameGrades.bUnder40);
  console.log("  C (<30, >=20):", snapshot.premixNameGrades.cUnder30);
  console.log("  D (<20, >=10):", snapshot.premixNameGrades.dUnder20);
  console.log("  F (<10):", snapshot.premixNameGrades.fUnder10);
  if (snapshot.premixNameGrades.fillerUsage && snapshot.premixNameGrades.fillerUsage.isosWithFillers) {
    console.log("  Synthetic filler usage detected:");
    console.log("    - ISOs with fillers:", snapshot.premixNameGrades.fillerUsage.isosWithFillers);
    console.log("    - Total filler tokens:", snapshot.premixNameGrades.fillerUsage.totalFillerTokens);
  }
  console.log("");

  console.log("Base-set clusters:");
  console.log("  Considered catalog languages:", snapshot.baseClusters.consideredCatalogLanguages);
  console.log("  Total distinct base sets (all sizes):", snapshot.baseClusters.totalDistinctBaseSets);
  console.log("  Clusters with identical base sets (size >= 2):", snapshot.baseClusters.clustersSizeGte2);
  console.log("  Total language entries participating in these clusters:", snapshot.baseClusters.entriesInClusters);
  console.log("  Largest cluster size:", snapshot.baseClusters.largestClusterSize);

  if (diff && prevSnapshot) {
    const diffs = [
      diffNumbers(prevSnapshot.coverage && prevSnapshot.coverage.mapTotal, snapshot.coverage.mapTotal, "coverage.mapTotal"),
      diffNumbers(prevSnapshot.coverage && prevSnapshot.coverage.catalogTotal, snapshot.coverage.catalogTotal, "coverage.catalogTotal"),
      diffNumbers(prevSnapshot.coverage && prevSnapshot.coverage.mapNotCatalog, snapshot.coverage.mapNotCatalog, "coverage.mapNotCatalog"),
      diffNumbers(prevSnapshot.coverage && prevSnapshot.coverage.catalogNotMap, snapshot.coverage.catalogNotMap, "coverage.catalogNotMap"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.totalCatalogEntries, snapshot.failures.totalCatalogEntries, "failures.totalCatalogEntries"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.totalFailures, snapshot.failures.totalFailures, "failures.totalFailures"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.missingMapping, snapshot.failures.missingMapping, "failures.missingMapping"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.emptyBases, snapshot.failures.emptyBases, "failures.emptyBases"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.allBasesInvalid, snapshot.failures.allBasesInvalid, "failures.allBasesInvalid"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.partiallyInvalid, snapshot.failures.partiallyInvalid, "failures.partiallyInvalid"),
      diffNumbers(prevSnapshot.failures && prevSnapshot.failures.mapOnly, snapshot.failures.mapOnly, "failures.mapOnly"),
      diffNumbers(prevSnapshot.seedUniqueness && prevSnapshot.seedUniqueness.targetIsos, snapshot.seedUniqueness.targetIsos, "seedUniqueness.targetIsos"),
      diffNumbers(prevSnapshot.seedUniqueness && prevSnapshot.seedUniqueness.missingMapping, snapshot.seedUniqueness.missingMapping, "seedUniqueness.missingMapping"),
      diffNumbers(prevSnapshot.seedUniqueness && prevSnapshot.seedUniqueness.noGloballyUniqueBaseIndex, snapshot.seedUniqueness.noGloballyUniqueBaseIndex, "seedUniqueness.noGloballyUniqueBaseIndex"),
      diffNumbers(prevSnapshot.seedUniqueness && prevSnapshot.seedUniqueness.strictBelowThreshold, snapshot.seedUniqueness.strictBelowThreshold, "seedUniqueness.strictBelowThreshold"),
      diffNumbers(prevSnapshot.seedUniqueness && prevSnapshot.seedUniqueness.normalizedBelowThreshold, snapshot.seedUniqueness.normalizedBelowThreshold, "seedUniqueness.normalizedBelowThreshold"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.targetIsos, snapshot.premixNameGrades.targetIsos, "premixNameGrades.targetIsos"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.missingMapping, snapshot.premixNameGrades.missingMapping, "premixNameGrades.missingMapping"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.a50Plus, snapshot.premixNameGrades.a50Plus, "premixNameGrades.a50Plus"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.gap40to49, snapshot.premixNameGrades.gap40to49, "premixNameGrades.gap40to49"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.bUnder40, snapshot.premixNameGrades.bUnder40, "premixNameGrades.bUnder40"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.cUnder30, snapshot.premixNameGrades.cUnder30, "premixNameGrades.cUnder30"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.dUnder20, snapshot.premixNameGrades.dUnder20, "premixNameGrades.dUnder20"),
      diffNumbers(prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.fUnder10, snapshot.premixNameGrades.fUnder10, "premixNameGrades.fUnder10"),
      diffNumbers(
        prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.fillerUsage && prevSnapshot.premixNameGrades.fillerUsage.isosWithFillers,
        snapshot.premixNameGrades.fillerUsage && snapshot.premixNameGrades.fillerUsage.isosWithFillers,
        "premixNameGrades.fillerUsage.isosWithFillers"
      ),
      diffNumbers(
        prevSnapshot.premixNameGrades && prevSnapshot.premixNameGrades.fillerUsage && prevSnapshot.premixNameGrades.fillerUsage.totalFillerTokens,
        snapshot.premixNameGrades.fillerUsage && snapshot.premixNameGrades.fillerUsage.totalFillerTokens,
        "premixNameGrades.fillerUsage.totalFillerTokens"
      ),
      diffNumbers(prevSnapshot.baseClusters && prevSnapshot.baseClusters.consideredCatalogLanguages, snapshot.baseClusters.consideredCatalogLanguages, "baseClusters.consideredCatalogLanguages"),
      diffNumbers(prevSnapshot.baseClusters && prevSnapshot.baseClusters.totalDistinctBaseSets, snapshot.baseClusters.totalDistinctBaseSets, "baseClusters.totalDistinctBaseSets"),
      diffNumbers(prevSnapshot.baseClusters && prevSnapshot.baseClusters.clustersSizeGte2, snapshot.baseClusters.clustersSizeGte2, "baseClusters.clustersSizeGte2"),
      diffNumbers(prevSnapshot.baseClusters && prevSnapshot.baseClusters.entriesInClusters, snapshot.baseClusters.entriesInClusters, "baseClusters.entriesInClusters"),
      diffNumbers(prevSnapshot.baseClusters && prevSnapshot.baseClusters.largestClusterSize, snapshot.baseClusters.largestClusterSize, "baseClusters.largestClusterSize")
    ].filter(Boolean);

    console.log("");
    console.log("Diff vs previous snapshot:");
    console.log("  prev.utcIso:", prevSnapshot.utcIso || "(unknown)");
    console.log("  next.utcIso:", snapshot.utcIso);
    for (const d of diffs) {
      const sign = d.delta > 0 ? "+" : "";
      console.log(`  ${d.path}: ${d.prev} -> ${d.next} (${sign}${d.delta})`);
    }
  } else if (diff) {
    console.log("");
    console.log("Diff vs previous snapshot:");
    console.log("  No previous snapshot found.");
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
