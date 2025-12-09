"use strict";

// ISO / mix style profiler for the language mixer.
//
// For each ISO in config/language-mixer-map.json that also appears in
// config/language-mixes.json, this tool prints a short style profile:
// - region, family, category
// - mapped base indices and base names
// - seed-based length stats per mix (min / max / mean / p25 / p75)
// - configured min/max ranges (per base)
// - a rough script / character profile (ascii-only vs extended, clicks, etc.)
//
// Usage examples (from project root):
//   node tools/profile-language-mixes.js --iso=afrikaans
//   node tools/profile-language-mixes.js --family=Romance --limit=20
//   node tools/profile-language-mixes.js --region=Eurasia
//
// This is a dev-only helper; it does not affect in-app behavior.

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

function buildBaseIndexMap(bases) {
  const map = new Map();
  for (const base of bases) {
    if (!base || typeof base.i !== "number") continue;
    if (!map.has(base.i)) map.set(base.i, base);
  }
  return map;
}

function computeSeedLengthStatsFromBlob(blob) {
  const names = (blob || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (!names.length) return null;

  const lengths = names.map(n => n.length).sort((a, b) => a - b);
  const count = lengths.length;
  const minLen = lengths[0];
  const maxLen = lengths[count - 1];
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const q = p => lengths[Math.floor(p * (count - 1))];
  const p25 = q(0.25);
  const p75 = q(0.75);

  return {count, minLen, maxLen, mean, p25, p75};
}

// Same click placeholder set as used by the in-browser mixer helpers.
const CLICKS = "\u001b\u001b\u001b\u001b";

function analyzeCharProfile(blob) {
  const text = (blob || "");
  let asciiOnly = true;
  let hasExtended = false;
  let hasClicks = false;
  let hasApostrophe = false;
  let hasHyphen = false;
  let hasSpace = false;

  for (const ch of text) {
    if (ch === ",") continue; // separators
    const code = ch.charCodeAt(0);
    if (code > 127) {
      asciiOnly = false;
      hasExtended = true;
    }
    if (CLICKS.includes(ch)) hasClicks = true;
    if (ch === "'") hasApostrophe = true;
    if (ch === "-") hasHyphen = true;
    if (ch === " ") hasSpace = true;
  }

  let scriptSummary;
  if (asciiOnly) scriptSummary = "latin-basic";
  else if (hasExtended) scriptSummary = "latin+extended-or-mixed";
  else scriptSummary = "mixed";

  const flags = [];
  if (hasClicks) flags.push("clicks");
  if (hasApostrophe) flags.push("apostrophe");
  if (hasHyphen) flags.push("hyphen");
  if (hasSpace) flags.push("space");

  return {asciiOnly, hasExtended, hasClicks, hasApostrophe, hasHyphen, hasSpace, scriptSummary, flags};
}

function aggregateBaseStats(baseIndices, baseByIndex) {
  const perBase = [];
  let aggMin = null;
  let aggMax = null;
  let weightedSum = 0;
  let totalCount = 0;
  let combinedBlob = "";

  for (const idx of baseIndices) {
    const base = baseByIndex.get(idx);
    if (!base || !base.b) continue;

    const stats = computeSeedLengthStatsFromBlob(base.b);
    perBase.push({idx, name: base.name || "(unnamed)", min: base.min, max: base.max, stats});

    if (stats && stats.count) {
      if (aggMin === null || stats.minLen < aggMin) aggMin = stats.minLen;
      if (aggMax === null || stats.maxLen > aggMax) aggMax = stats.maxLen;
      weightedSum += stats.mean * stats.count;
      totalCount += stats.count;
    }

    if (combinedBlob) combinedBlob += "," + base.b;
    else combinedBlob = base.b;
  }

  const aggMean = totalCount ? weightedSum / totalCount : null;
  const charProfile = analyzeCharProfile(combinedBlob);

  return {perBase, aggMin, aggMax, aggMean, charProfile};
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const iso = getValue("--iso");
  const family = getValue("--family");
  const region = getValue("--region");
  const limitArg = getValue("--limit");
  const help = args.includes("--help") || args.includes("-h");

  const limit = limitArg ? parseInt(limitArg, 10) : null;

  return {iso, family, region, limit, help};
}

function printUsage() {
  console.log("Usage: node tools/profile-language-mixes.js [options]\n");
  console.log("Options:");
  console.log("  --iso=ID            Profile a single ISO/mix (e.g. afrikaans, kx'a-ao-ae).");
  console.log("  --family=NAME       Filter by family (e.g. Romance, Germanic, Uralic).");
  console.log("  --region=NAME       Filter by region (e.g. Africa, Eurasia, Americas).");
  console.log("  --limit=N           Limit number of entries printed (after filters).\n");
  console.log("Examples:");
  console.log("  node tools/profile-language-mixes.js --iso=afrikaans");
  console.log("  node tools/profile-language-mixes.js --family=Romance --limit=20");
  console.log("  node tools/profile-language-mixes.js --region=Eurasia");
}

function main() {
  const {iso, family, region, limit, help} = parseArgs(process.argv);
  if (help) {
    printUsage();
    return;
  }

  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const mixes = readJson("config/language-mixes.json");
  const mixerMap = readJson("config/language-mixer-map.json");

  const mixesByIso = new Map();
  for (const m of mixes) {
    if (!m || !m.iso) continue;
    if (!mixesByIso.has(m.iso)) mixesByIso.set(m.iso, m);
  }

  const mapByIso = new Map();
  for (const entry of mixerMap) {
    if (!entry || !entry.iso) continue;
    mapByIso.set(entry.iso, entry);
  }

  let targets = [];

  if (iso) {
    const mix = mixesByIso.get(iso);
    const mapEntry = mapByIso.get(iso);
    if (!mix || !mapEntry) {
      console.error("No mix/mapping found for iso=", iso);
      process.exitCode = 1;
      return;
    }
    targets.push({iso, mix, mapEntry});
  } else {
    for (const [mIso, mix] of mixesByIso.entries()) {
      const mapEntry = mapByIso.get(mIso);
      if (!mapEntry || !Array.isArray(mapEntry.bases) || !mapEntry.bases.length) continue;

      if (family && mix.family !== family) continue;
      if (region && mix.region !== region) continue;

      targets.push({iso: mIso, mix, mapEntry});
    }

    targets.sort((a, b) => a.iso.localeCompare(b.iso));
    if (typeof limit === "number" && limit > 0 && targets.length > limit) {
      targets = targets.slice(0, limit);
    }
  }

  if (!targets.length) {
    console.log("No language mixes matched the given filters.");
    return;
  }

  console.log("=== ISO / mix style profiles ===");
  console.log("Total entries:", targets.length);
  console.log("");

  for (const {iso: mIso, mix, mapEntry} of targets) {
    const basesList = Array.isArray(mapEntry.bases) ? mapEntry.bases : [];
    const {perBase, aggMin, aggMax, aggMean, charProfile} = aggregateBaseStats(basesList, baseByIndex);

    console.log(`--- ${mIso} | ${mix.name || "(unnamed)"} ---`);
    console.log(
      "  region:", mix.region || "?",
      "| family:", mix.family || "?",
      "| category:", mix.category || "?"
    );

    if (!perBase.length) {
      console.log("  [warn] No valid bases resolved for this ISO in defaultNameBases.");
      console.log("");
      continue;
    }

    const baseSummary = perBase
      .map(b => `${b.idx}${b.name ? " (" + b.name + ")" : ""}`)
      .join(", ");
    console.log("  bases:", baseSummary);

    if (aggMean != null) {
      console.log(
        "  seed lengths (aggregated):",
        `min=${aggMin}, max=${aggMax}, mean=${aggMean.toFixed(2)}`
      );
    } else {
      console.log("  seed lengths (aggregated):", "no data");
    }

    console.log("  configured min/max per base:");
    for (const b of perBase) {
      const stats = b.stats;
      const cfgMin = b.min;
      const cfgMax = b.max;
      const statsPart = stats
        ? `seeds: count=${stats.count} min=${stats.minLen} max=${stats.maxLen} mean=${stats.mean.toFixed(2)} p25=${stats.p25} p75=${stats.p75}`
        : "seeds: (none)";
      console.log(
        `    [${b.idx}] ${b.name || "(unnamed)"}: config=${cfgMin}-${cfgMax} | ${statsPart}`
      );
    }

    const cp = charProfile;
    const flagStr = cp.flags.length ? cp.flags.join(", ") : "none";
    console.log(
      "  script/characters:",
      cp.scriptSummary,
      "| asciiOnly=",
      cp.asciiOnly,
      "| flags:",
      flagStr
    );

    console.log("");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error in profile-language-mixes:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
