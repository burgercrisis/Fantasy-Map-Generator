"use strict";

// Check namebase length "home ranges".
//
// For each base in window.defaultNameBases this script:
// - Computes seed-based length stats from the raw b blob.
// - Samples generated names using the real Names.getBase Markov generator
//   (via modules/names-generator.js in a VM sandbox).
// - Compares configured min/max to both seed and generated stats.
// - Prints bases whose generated/seed behavior looks like an outlier
//   relative to the configured min/max.
//
// This is a dev-only tool; it does not affect the in-browser generator.
//
// Usage examples (from project root):
//   node tools/check-namebase-lengths.js --count=80
//   node tools/check-namebase-lengths.js --base=0,1,6,14,27,353,354 --count=80 --seed=1 --show-all

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function loadSandboxWithNames() {
  const sandbox = {
    window: {},
    console,
    // prevent UI-dependent code from throwing
    ERROR: false,
    WARN: false,
    tip: function () {},
    pack: {cultures: {}, states: {}},
  };

  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js"),
    path.join(root, "modules", "names-generator.js"),
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
  }

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  const Names = sandbox.window && sandbox.window.Names;

  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated in sandbox");
  }
  if (!Names || typeof Names.getBase !== "function") {
    throw new Error("window.Names.getBase is not available in sandbox");
  }

  return {sandbox, bases, Names};
}

function computeSeedLengthStats(blob) {
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

function sampleGeneratedLengths(Names, baseIndex, baseConfig, count, seed) {
  // Names.getBase respects base-level min/max/dupl when min/max are falsy.
  // We keep the logic as close as possible to the in-app generator.
  const lengths = [];

  // Simple seeding: if a seed is provided, perturb Math.random deterministically
  // but only within this function's scope to avoid global side effects.
  let originalRandom = null;
  if (typeof seed === "number" && !Number.isNaN(seed)) {
    originalRandom = Math.random;
    let x = seed >>> 0;
    Math.random = function () {
      x += 0x6d2b79f5;
      let t = x;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  try {
    for (let i = 0; i < count; i++) {
      let name;
      try {
        name = Names.getBase(baseIndex);
      } catch (e) {
        // If generation fails for this base, stop early.
        break;
      }
      if (typeof name === "string" && name.length) {
        lengths.push(name.length);
      }
    }
  } finally {
    if (originalRandom) Math.random = originalRandom;
  }

  if (!lengths.length) return null;

  lengths.sort((a, b) => a - b);
  const c = lengths.length;
  const minLen = lengths[0];
  const maxLen = lengths[c - 1];
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = sum / c;
  const q = p => lengths[Math.floor(p * (c - 1))];
  const p25 = q(0.25);
  const p75 = q(0.75);

  return {count: c, minLen, maxLen, mean, p25, p75};
}

function classifyOutlier(base, seedStats, genStats) {
  const issues = [];
  if (!seedStats && !genStats) {
    issues.push("no-seed-no-gen");
    return issues;
  }

  const cMin = base.min;
  const cMax = base.max;
  const cfgCenter = typeof cMin === "number" && typeof cMax === "number"
    ? (cMin + cMax) / 2
    : null;

  if (seedStats && typeof cMin === "number" && typeof cMax === "number") {
    if (seedStats.mean < cMin - 2 || seedStats.mean > cMax + 2) {
      issues.push("seed-mean-outside-config");
    }
  }

  if (genStats && typeof cMin === "number" && typeof cMax === "number") {
    if (genStats.min < cMin - 3) issues.push("gen-min<<config-min");
    if (genStats.max > cMax + 3) issues.push("gen-max>>config-max");

    if (cfgCenter != null) {
      const delta = Math.abs(genStats.mean - cfgCenter);
      const cfgRange = Math.abs(cMax - cMin);
      const tolerance = Math.max(3, cfgRange);
      if (delta > tolerance) {
        issues.push("gen-mean-far-from-config-center");
      }
    }
  }

  return issues;
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const baseArg = getValue("--base");
  const countArg = getValue("--count");
  const seedArg = getValue("--seed");
  const showAll = args.includes("--show-all");
  const help = args.includes("--help") || args.includes("-h");

  const baseIndices = baseArg
    ? baseArg
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseInt(s, 10))
        .filter(n => !Number.isNaN(n))
    : null; // null means "all bases"

  const count = countArg ? parseInt(countArg, 10) : 80;
  const seed = seedArg != null ? parseInt(seedArg, 10) : null;

  return {baseIndices, count, seed, showAll, help};
}

function printUsage() {
  console.log("Usage: node tools/check-namebase-lengths.js [options]\n");
  console.log("Options:");
  console.log("  --base=IDX[,IDX...]   Optional subset of base indices to check.");
  console.log("  --count=N            How many generated names per base (default 80).");
  console.log("  --seed=INT           RNG seed for deterministic generation.");
  console.log("  --show-all           Print stats for all checked bases, not just outliers.");
  console.log("  --help, -h           Show this help.\n");
  console.log("Examples:");
  console.log("  node tools/check-namebase-lengths.js --count=80");
  console.log("  node tools/check-namebase-lengths.js --base=0,1,6,14,27,353,354 --count=80 --seed=1 --show-all");
}

function main() {
  const {baseIndices, count, seed, showAll, help} = parseArgs(process.argv);
  if (help) {
    printUsage();
    return;
  }

  const {bases, Names} = loadSandboxWithNames();

  const targets = baseIndices
    ? baseIndices
        .map(i => bases.find(b => b && b.i === i))
        .filter(Boolean)
    : bases.filter(b => b && typeof b.i === "number");

  console.log("=== Namebase length range check ===");
  console.log("Bases checked:", targets.length);
  console.log("Samples per base:", count);
  console.log("");

  const outliers = [];

  for (const base of targets) {
    const idx = base.i;
    const seedStats = computeSeedLengthStats(base.b || "");
    const genStats = sampleGeneratedLengths(Names, idx, base, count, seed);
    const issues = classifyOutlier(base, seedStats, genStats);

    if (!issues.length && !showAll) continue;

    const lineHeader = `[${idx}] ${base.name || "(unnamed)"}`;
    if (issues.length) {
      outliers.push({base, seedStats, genStats, issues});
      console.log(lineHeader);
    } else if (showAll) {
      console.log(lineHeader);
    }

    const cfgMin = base.min;
    const cfgMax = base.max;
    console.log(
      "  config:",
      typeof cfgMin === "number" ? `min=${cfgMin}` : "min=?",
      ",",
      typeof cfgMax === "number" ? `max=${cfgMax}` : "max=?",
    );

    if (seedStats) {
      console.log(
        `  seeds:  count=${seedStats.count} min=${seedStats.minLen} max=${seedStats.maxLen} ` +
          `mean=${seedStats.mean.toFixed(2)} p25=${seedStats.p25} p75=${seedStats.p75}`,
      );
    } else {
      console.log("  seeds:  (none)");
    }

    if (genStats) {
      console.log(
        `  gen:    count=${genStats.count} min=${genStats.minLen} max=${genStats.maxLen} ` +
          `mean=${genStats.mean.toFixed(2)} p25=${genStats.p25} p75=${genStats.p75}`,
      );
    } else {
      console.log("  gen:    (no names generated)");
    }

    if (issues.length) {
      console.log("  issues:", issues.join(", "));
    }

    console.log("");
  }

  if (!outliers.length) {
    console.log("No obvious length outliers found with current thresholds.");
  } else {
    console.log(`Total bases flagged as potential outliers: ${outliers.length}`);
  }

  console.log("");
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error in check-namebase-lengths:",
      err && err.message ? err.message : err,
    );
    process.exitCode = 1;
  }
}
