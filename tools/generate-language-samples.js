"use strict";

// Helper CLI to generate sample names from mixer entries or bases.
//
// Usage (from project root):
//   node tools/generate-language-samples.js --iso=amkoe --per-base=10 [--seed=123]
//   node tools/generate-language-samples.js --base=353,354 --count=30 [--seed=123]
//
// This is intended for quick inspection of language mixes, e.g. validating
// new namebases or mixer mappings like Kx'a click+tone entries.

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

  const min = opts && typeof opts.min === "number" ? opts.min : baseConfig.min;
  const max = opts && typeof opts.max === "number" ? opts.max : baseConfig.max;
  const dupl = opts && typeof opts.dupl === "string" ? opts.dupl : baseConfig.d || "";

  let v = chain[""];
  let cur = ra(v, rng);
  let w = "";

  for (let i = 0; i < 20; i++) {
    if (cur === "") {
      // end of word
      if (w.length < min) {
        cur = "";
        w = "";
        v = chain[""];
      } else break;
    } else {
      if (w.length + cur.length > max) {
        // word too long
        if (w.length < min) w += cur;
        break;
      } else {
        v = chain[last(cur)] || chain[""];
      }
    }

    w += cur;
    cur = ra(v, rng);
  }

  // parse word to get a final name (adapted from Names.getBase)
  const l = last(w); // last letter
  if (l === "'" || l === " " || l === "-") w = w.slice(0, -1); // not allow some characters at the end

  let name = [...w].reduce(function (r, c, i, d) {
    if (c === d[i + 1] && !dupl.includes(c)) return r; // duplication is not allowed
    if (!r.length) return c.toUpperCase();
    if (r.slice(-1) === "-" && c === " ") return r; // remove space after hyphen
    if (r.slice(-1) === " ") return r + c.toUpperCase(); // capitalize letter after space
    if (r.slice(-1) === "-") return r + c.toUpperCase(); // capitalize letter after hyphen
    if (c === "a" && d[i + 1] === "e") return r; // "ae" => "e"
    if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2]) return r; // remove three same letters in a row
    return r + c;
  }, "");

  // join the word if any part has only 1 letter
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

  return {iso, baseIndices, count, perBase, seed, min, max, help};
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
  console.log("  --max=INT             Override maximum length.\n");
  console.log("Examples:");
  console.log("  node tools/generate-language-samples.js --iso=amkoe --per-base=10 --seed=1");
  console.log("  node tools/generate-language-samples.js --iso=kx-ao-ae --per-base=10");
  console.log("  node tools/generate-language-samples.js --base=353,354 --count=40 --seed=42");
}

function main() {
  const {iso, baseIndices, count, perBase, seed, min, max, help} = parseArgs(process.argv);

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
      for (let i = 0; i < per; i++) {
        const name = generateFromBaseConfig(baseConfig, rng, overrides);
        console.log("  ", name);
      }
      console.log("");
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

    for (let i = 0; i < total; i++) {
      const choice = resolvedBases[i % resolvedBases.length];
      const name = generateFromBaseConfig(choice.base, rng, overrides);
      console.log(`[${choice.idx}] ${name}`);
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
