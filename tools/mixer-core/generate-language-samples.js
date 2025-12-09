"use strict";

// Helper CLI to generate sample names from mixer entries or bases.
//@
// Usage (from project root):
//   node tools/generate-language-samples.js --iso=amkoe --per-base=10 [--seed=123]
//   node tools/generate-language-samples.js --base=353,354 --count=30 [--seed=123]
//@
// This is intended for quick inspection of language mixes, e.g. validating
// new namebases or mixer mappings like Kx'a click+tone entries. With
// --analyze-lengths it can also act as a placename length tuner by printing
// suggested min/max values per base based on generated samples.

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

// Simple deterministic RNG (mulberry32) for reproducible output when --seed is given.
function makeRng(seed) {
  if (seed === null || seed === undefined || Number.isNaN(seed)) {
    return () => Math.random();
  }
  let x = seed >>> 0;
  return function () {
    x += 0x6d2b79f5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ra(arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return "";
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

function last(str) {
  return str && str.length ? str[str.length - 1] : "";
}

// Copied from utils/languageUtils.js
const VOWELS = "aeiouyɑ'əøɛœæɶɒɨɪɔɐʊɤɯаоиеёэыуюяàèìòùỳẁȁȅȉȍȕáéíóúýẃőűâêîôûŷŵäëïöüÿẅãẽĩõũỹąęįǫųāēīōūȳăĕĭŏŭǎěǐǒǔȧėȯẏẇạẹịọụỵẉḛḭṵṳ";
function vowel(c) {
  return VOWELS.includes(c);
}

// Based on Names.calculateChain in modules/names-generator.js
function calculateChainFromBlob(blob) {
  const chain = [];
  if (!blob || typeof blob !== "string") return chain;

  const array = blob.split(",");
  for (const n of array) {
    let name = n.trim().toLowerCase();
    if (!name) continue;
    const basic = !/[^\u0000-\u007f]/.test(name); // basic chars and English rules can be applied

    // split word into pseudo-syllables
    for (let i = -1, syllable = ""; i < name.length; i += syllable.length || 1, syllable = "") {
      let prev = name[i] || ""; // pre-onset letter
      let v = 0; // 0 if no vowels in syllable

      for (let c = i + 1; name[c] && syllable.length < 5; c++) {
        const that = name[c];
        const next = name[c + 1]; // next char
        syllable += that;
        if (syllable === " " || syllable === "-") break; // syllable starts with space or hyphen
        if (!next || next === " " || next === "-") break; // no need to check

        if (vowel(that)) v = 1; // check if letter is vowel

        // do not split some diphthongs
        if (that === "y" && next === "e") continue; // 'ye'
        if (basic) {
          // English-like
          if (that === "o" && next === "o") continue; // 'oo'
          if (that === "e" && next === "e") continue; // 'ee'
          if (that === "a" && next === "e") continue; // 'ae'
          if (that === "c" && next === "h") continue; // 'ch'
        }

        if (vowel(that) === next) break; // two same vowels in a row
        if (v && vowel(name[c + 2])) break; // syllable has vowel and additional vowel is expected soon
      }

      if (chain[prev] === undefined) chain[prev] = [];
      chain[prev].push(syllable);
    }
  }

  return chain;
}

// Simplified version of Names.getBase adapted for standalone use.
function generateFromBaseConfig(baseConfig, rng, opts) {
  if (!baseConfig) throw new Error("Base config is required");

  const chain = calculateChainFromBlob(baseConfig.b || "");
  if (!chain || chain[""] === undefined) {
    throw new Error("Namebase " + (baseConfig.i != null ? baseConfig.i : "?") + " is incorrect (no starting chain)");
  }

  const requestedMin = opts && typeof opts.min === "number" ? opts.min : baseConfig.min;
  const requestedMax = opts && typeof opts.max === "number" ? opts.max : baseConfig.max;
  const dupl = opts && typeof opts.dupl === "string" ? opts.dupl : baseConfig.d || "";

  function generateOne(minLen, maxLen) {
    let v = chain[""];
    let cur = ra(v, rng);
    let w = "";

    for (let i = 0; i < 20; i++) {
      if (cur === "") {
        // end of word
        if (w.length < minLen) {
          cur = "";
          w = "";
          v = chain[""];
        } else break;
      } else {
        if (w.length + cur.length > maxLen) {
          // word too long
          if (w.length < minLen) w += cur;
          break;
        } else {
          v = chain[last(cur)] || chain[""];
        }
      }

      w += cur;
      cur = ra(v, rng);
    }

    const l = last(w); // last letter
    if (l === "'" || l === " " || l === "-") w = w.slice(0, -1);

    let name = [...w].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !dupl.includes(c)) return r;
      if (!r.length) return c.toUpperCase();
      if (r.slice(-1) === "-" && c === " ") return r;
      if (r.slice(-1) === " ") return r + c.toUpperCase();
      if (r.slice(-1) === "-") return r + c.toUpperCase();
      if (c === "a" && d[i + 1] === "e") return r;
      if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2]) return r;
      return r + c;
    }, "");

    if (name.split(" ").some(part => part.length < 2)) {
      name = name
        .split(" ")
        .map((p, i) => (i ? p.toLowerCase() : p))
        .join("");
    }

    if (name.length < 2) {
      const seeds = (baseConfig.b || "").split(",").map(n => n.trim()).filter(Boolean);
      name = seeds.length ? ra(seeds, rng) : name;
    }

    return name;
  }

  let name = generateOne(requestedMin, requestedMax);

  const isKxa = baseConfig.i === 353 || baseConfig.i === 354;
  if (isKxa && typeof requestedMin === "number" && name.length < requestedMin) {
    const targetMin = requestedMin;
    const targetMax = requestedMax;
    const segmentMin = baseConfig.min;
    const segmentMax = baseConfig.max;

    const parts = [name];
    let total = name.length;
    let guard = 0;

    while (total < targetMin && guard < 5) {
      const seg = generateOne(segmentMin, segmentMax);
      parts.push(seg);
      total += seg.length;
      guard++;
    }

    const compound = parts.join("");
    if (compound.length >= targetMin && compound.length <= targetMax) {
      name = compound;
    }
  }

  return name;
}

function computeLengthStats(names) {
  const lengths = names
    .map(n => (typeof n === "string" ? n.trim() : ""))
    .filter(Boolean)
    .map(n => n.length);

  const count = lengths.length;
  if (!count) return {count: 0};

  lengths.sort((a, b) => a - b);
  const minLen = lengths[0];
  const maxLen = lengths[count - 1];
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const quantile = q => {
    if (!count) return 0;
    const idx = Math.floor(q * (count - 1));
    return lengths[idx];
  };

  const p10 = quantile(0.1);
  const p25 = quantile(0.25);
  const p50 = quantile(0.5);
  const p75 = quantile(0.75);
  const p90 = quantile(0.9);

  const suggestedMin = Math.max(2, p25);
  const suggestedMax = Math.max(suggestedMin, p90);

  return {count, minLen, maxLen, mean, p10, p25, p50, p75, p90, suggestedMin, suggestedMax};
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const iso = getValue("--iso");
  const baseArg = getValue("--base");
  const countArg = getValue("--count");
  const perBaseArg = getValue("--per-base");
  const seedArg = getValue("--seed");
  const minArg = getValue("--min");
  const maxArg = getValue("--max");

  const count = countArg ? parseInt(countArg, 10) : null;
  const perBase = perBaseArg ? parseInt(perBaseArg, 10) : null;
  const seed = seedArg != null ? parseInt(seedArg, 10) : null;
  const min = minArg != null ? parseInt(minArg, 10) : null;
  const max = maxArg != null ? parseInt(maxArg, 10) : null;

  const baseIndices = baseArg
    ? baseArg.split(",").map(s => s.trim()).filter(Boolean).map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n))
    : [];

  const help = args.includes("--help") || args.includes("-h");
  const analyzeLengths = args.includes("--analyze-lengths");
  const printPatch = args.includes("--print-patch");

  return {iso, baseIndices, count, perBase, seed, min, max, analyzeLengths, printPatch, help};
}

function printUsage() {
  console.log("Usage: node tools/generate-language-samples.js [options]\n");
  console.log("Options:");
  console.log("  --iso=ID              Generate for a mixer language ISO (e.g. amkoe, ekoka-kung).");
  console.log("  --base=IDX[,IDX...]   Generate directly from one or more base indices (e.g. 353,354).\n");
  console.log("Counts:");
  console.log("  --per-base=N          When using --iso, generate N names per mapped base (default 10).");
  console.log("  --count=N             When using --base, generate N names total (default 20).\n");
  console.log("Other:");
  console.log("  --seed=INT            Seed for deterministic output.");
  console.log("  --min=INT             Override minimum length.");
  console.log("  --max=INT             Override maximum length.");
  console.log("  --analyze-lengths     Also print length stats and suggested min/max per base; useful for placename tuning.");
  console.log(
    "  --print-patch         With --analyze-lengths, also emit JSON min/max patch suggestions per base.\\n"
  );
  console.log("Examples:");
  console.log("  node tools/generate-language-samples.js --iso=amkoe --per-base=10 --seed=1");
  console.log("  node tools/generate-language-samples.js --iso=kx-ao-ae --per-base=10");
  console.log("  node tools/generate-language-samples.js --base=353,354 --count=40 --seed=42");
}

function main() {
  const {iso, baseIndices, count, perBase, seed, min, max, analyzeLengths, printPatch, help} = parseArgs(
    process.argv
  );

  if (help || (!iso && (!baseIndices || !baseIndices.length))) {
    printUsage();
    return;
  }

  const rng = makeRng(seed);
  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const overrides = {};
  if (typeof min === "number" && !Number.isNaN(min)) overrides.min = min;
  if (typeof max === "number" && !Number.isNaN(max)) overrides.max = max;

  if (iso) {
    const mixes = readJson("config/language-mixes.json");
    const map = readJson("config/language-mixer-map.json");
    const mapByIso = new Map(map.map(e => [e.iso, e]));

    const lang = mixes.find(l => l && l.iso === iso);
    if (!lang) {
      console.error("No language-mix entry found for iso=", iso);
      process.exitCode = 1;
      return;
    }

    const entry = mapByIso.get(iso);
    if (!entry || !Array.isArray(entry.bases) || !entry.bases.length) {
      console.error("No base mapping found for iso=", iso);
      process.exitCode = 1;
      return;
    }

    const indices = entry.bases;
    const per = perBase && perBase > 0 ? perBase : 10;

    const patches = analyzeLengths && printPatch ? [] : null;

    console.log(`=== Samples for ${iso} | ${lang.name || ""} ===`);
    console.log(`Mapped bases: ${indices.join(", ")}`);
    console.log("");

    for (const idx of indices) {
      const baseConfig = baseByIndex.get(idx);
      if (!baseConfig) {
        console.warn("  [WARN] Base", idx, "not found in defaultNameBases");
        continue;
      }
      console.log(`-- Base ${idx} | ${baseConfig.name || "(unnamed)"} --`);
      const samples = [];
      for (let i = 0; i < per; i++) {
        const name = generateFromBaseConfig(baseConfig, rng, overrides);
        samples.push(name);
        console.log("  ", name);
      }
      if (analyzeLengths) {
        const stats = computeLengthStats(samples);
        if (stats.count) {
          console.log(
            `  [lengths] count=${stats.count} min=${stats.minLen} max=${stats.maxLen} ` +
              `mean=${stats.mean.toFixed(2)} p25=${stats.p25} p75=${stats.p75} p90=${stats.p90}`
          );
          console.log(
            `  [suggested min/max] ${stats.suggestedMin}-${stats.suggestedMax} ` +
              `(current: ${baseConfig.min}-${baseConfig.max})`
          );
          if (patches) {
            const currentMin = baseConfig.min;
            const currentMax = baseConfig.max;
            if (
              typeof currentMin === "number" &&
              typeof currentMax === "number" &&
              (currentMin !== stats.suggestedMin || currentMax !== stats.suggestedMax)
            ) {
              patches.push({
                i: baseConfig.i,
                name: baseConfig.name || null,
                from: {min: currentMin, max: currentMax},
                to: {min: stats.suggestedMin, max: stats.suggestedMax},
                stats: {
                  minLen: stats.minLen,
                  maxLen: stats.maxLen,
                  mean: Number(stats.mean.toFixed(2)),
                  p25: stats.p25,
                  p75: stats.p75,
                  p90: stats.p90
                }
              });
            }
          }
        } else {
          console.log("  [lengths] no non-empty samples");
        }
      }
      console.log("");
    }

    if (patches && patches.length) {
      console.log("");
      console.log("=== Suggested min/max patch (JSON) ===");
      console.log(JSON.stringify(patches, null, 2));
    }

    return;
  }

  if (baseIndices && baseIndices.length) {
    const total = count && count > 0 ? count : 20;
    const resolvedBases = baseIndices
      .map(idx => ({idx, base: baseByIndex.get(idx)}))
      .filter(x => !!x.base);

    if (!resolvedBases.length) {
      console.error("No valid bases resolved from --base argument");
      process.exitCode = 1;
      return;
    }

    console.log("=== Samples for bases:", baseIndices.join(", "), "===");
    console.log("");

    const samplesByBase = analyzeLengths ? new Map() : null;
    const patches = analyzeLengths && printPatch ? [] : null;

    for (let i = 0; i < total; i++) {
      const choice = resolvedBases[i % resolvedBases.length];
      const name = generateFromBaseConfig(choice.base, rng, overrides);
      if (samplesByBase) {
        if (!samplesByBase.has(choice.idx)) samplesByBase.set(choice.idx, []);
        samplesByBase.get(choice.idx).push(name);
      }
      console.log(`[${choice.idx}] ${name}`);
    }

    if (analyzeLengths) {
      console.log("");
      console.log("=== Length analysis ===");
      for (const {idx, base} of resolvedBases) {
        const samples = (samplesByBase && samplesByBase.get(idx)) || [];
        const stats = computeLengthStats(samples);
        if (!stats.count) {
          console.log(`Base ${idx}: no non-empty samples`);
          continue;
        }
        console.log(`Base ${idx} | ${base.name || "(unnamed)"}`);
        console.log(
          `  [lengths] count=${stats.count} min=${stats.minLen} max=${stats.maxLen} ` +
            `mean=${stats.mean.toFixed(2)} p25=${stats.p25} p75=${stats.p75} p90=${stats.p90}`
        );
        console.log(
          `  [suggested min/max] ${stats.suggestedMin}-${stats.suggestedMax} ` +
            `(current: ${base.min}-${base.max})`
        );

        if (patches) {
          const currentMin = base.min;
          const currentMax = base.max;
          if (
            typeof currentMin === "number" &&
            typeof currentMax === "number" &&
            (currentMin !== stats.suggestedMin || currentMax !== stats.suggestedMax)
          ) {
            patches.push({
              i: base.i,
              name: base.name || null,
              from: {min: currentMin, max: currentMax},
              to: {min: stats.suggestedMin, max: stats.suggestedMax},
              stats: {
                minLen: stats.minLen,
                maxLen: stats.maxLen,
                mean: Number(stats.mean.toFixed(2)),
                p25: stats.p25,
                p75: stats.p75,
                p90: stats.p90
              }
            });
          }
        }
      }

      if (patches && patches.length) {
        console.log("");
        console.log("=== Suggested min/max patch (JSON) ===");
        console.log(JSON.stringify(patches, null, 2));
      }
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while generating language samples:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
