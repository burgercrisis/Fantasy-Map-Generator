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

const root = path.resolve(__dirname, "../..");

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

  const isKxa = baseConfig.i === 353 || baseConfig.i === 354 || baseConfig.i === 355;
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

function computeSeedStats(blob) {
  const names = (blob || "")
    .split(",")
    .map(n => n.trim())
    .filter(Boolean);
  if (!names.length) return null;

  const lengths = names.map(n => n.length).sort((a, b) => a - b);
  const count = lengths.length;
  const minLen = lengths[0];
  const maxLen = lengths[count - 1];
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  return {count, minLen, maxLen, mean};
}

function classifyOnsets(blob) {
  const names = (blob || "")
    .split(",")
    .map(n => n.trim().toLowerCase())
    .filter(Boolean);
  const set = new Set();
  for (const name of names) {
    const ch = name[0];
    if (ch) set.add(ch);
  }
  return set;
}

const CLICK_CHARS = "ǀǁǂǃ";
const CLICK_SMOOTH_PREFIXES = ["h", "ʼ", "kh", "qh", "sk", "ts", "tl", "ng", "x", "g", "n"];
const CLICK_BRIDGE_VOWELS = ["a", "e", "i", "o", "u", "aa", "oa", "ua", "ia", "ai", "ei", "ao"];
const CLICK_SUFFIXES = ["ka", "na", "sa", "sha", "ra", "ma", "ta", "la", "xa", "na", "za"];
const CLICK_ACCENTS = [
  ["a", "á"],
  ["e", "é"],
  ["i", "í"],
  ["o", "ó"],
  ["u", "ú"],
  ["a", "â"],
  ["o", "ô"]
];

function pickRandom(arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return "";
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

function applyAccent(str, rng) {
  for (const [plain, accented] of CLICK_ACCENTS) {
    const idx = str.indexOf(plain);
    if (idx !== -1 && rng() < 0.7) {
      return str.slice(0, idx) + accented + str.slice(idx + plain.length);
    }
  }
  return str;
}

function isClickHeavyLanguage(blob) {
  const names = (blob || "")
    .split(",")
    .map(n => n.trim())
    .filter(Boolean);
  if (!names.length) return false;

  let initialClicks = 0;
  let anyClicks = 0;
  for (const n of names) {
    const first = n[0];
    if (first && CLICK_CHARS.includes(first)) initialClicks++;
    if ([...n].some(ch => CLICK_CHARS.includes(ch))) anyClicks++;
  }

  const fracInitial = initialClicks / names.length;
  const fracAny = anyClicks / names.length;
  return fracInitial >= 0.25 || fracAny >= 0.5;
}

function getSegmentShape(text, ctx) {
  const trimmed = (text || "").trim();
  const len = trimmed.length;
  const first = trimmed[0] || "";
  const isClickSegment = !!first && CLICK_CHARS.includes(first);
  let lenBucket;
  if (len <= 4) lenBucket = "S";
  else if (len <= 8) lenBucket = "M";
  else lenBucket = "L";
  return {
    len,
    lenBucket,
    isClickSegment,
    baseIndex: ctx.idx,
    isClickLanguage: ctx.isClickHeavy
  };
}

function isRepetitiveClickPattern(segInfos) {
  const clickSegs = segInfos.filter(s => s.shape.isClickSegment);
  if (clickSegs.length < 3) return false;

  let run = 1;
  for (let i = 1; i < segInfos.length; i++) {
    const prev = segInfos[i - 1].shape;
    const cur = segInfos[i].shape;
    if (prev.isClickSegment && cur.isClickSegment && prev.lenBucket === cur.lenBucket) {
      run++;
      if (run >= 3) return true;
    } else {
      run = 1;
    }
  }

  return false;
}

function softenClickRuns(segs, rng) {
  if (!Array.isArray(segs) || segs.length < 2) return;
  const pickPrefix = () => pickRandom(CLICK_SMOOTH_PREFIXES, rng);

  const appendWithConnector = (base, addition) => {
    if (!addition) return base;
    if (!base) return addition;
    const connector = pickRandom(["", "", "-", " ", "’"], rng);
    if (!connector) return base + addition;
    if (connector.trim() === "-" || connector.trim() === "’") return base + connector + addition;
    return `${base}${connector}${addition.charAt(0).toUpperCase()}${addition.slice(1)}`;
  };

  let run = 0;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (!seg || !seg.shape) {
      run = 0;
      continue;
    }

    if (!seg.shape.isClickSegment) {
      run = 0;
      continue;
    }

    run++;
    if (run === 1 && rng() < 0.5) continue;

    const stripped = seg.text.replace(/^[ǀǁǂǃ]+/u, "");
    if (!stripped) continue;

    let softenedCore = stripped;
    if (rng() < 0.5) softenedCore = applyAccent(softenedCore, rng);
    if (run >= 3 && softenedCore.length > 3 && rng() < 0.6) {
      const splitPoint = 1 + Math.floor(rng() * Math.max(1, softenedCore.length - 2));
      const bridge = pickRandom(CLICK_BRIDGE_VOWELS, rng);
      softenedCore = `${softenedCore.slice(0, splitPoint)}${bridge}${softenedCore.slice(splitPoint)}`;
    }

    const prefix = rng() < 0.75 ? pickPrefix() : "";
    const bridgeVowel = rng() < 0.6 ? pickRandom(CLICK_BRIDGE_VOWELS, rng) : "";
    const suffix = rng() < 0.5 ? pickRandom(CLICK_SUFFIXES, rng) : "";

    let softened = "";
    softened = appendWithConnector(softened, prefix);
    softened = appendWithConnector(softened, bridgeVowel);
    softened = appendWithConnector(softened, softenedCore);
    if (suffix) softened = appendWithConnector(softened, suffix);

    if (rng() < 0.3) {
      softened = softened.charAt(0).toUpperCase() + softened.slice(1);
    }

    segs[i] = Object.assign({}, seg, {
      text: softened,
      shape: getSegmentShape(softened, seg.ctx)
    });

    run = rng() < 0.25 ? run : 0;
  }
}

function isAsciiLetter(c) {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z");
}

function smoothJoin(a, b, onsetSet, rng) {
  if (!a) return b;
  if (!b) return a;

  const la = a[a.length - 1];
  const fb = b[0];
  const laLower = la ? la.toLowerCase() : "";
  const fbLower = fb ? fb.toLowerCase() : "";

  const onsetHas = ch => (onsetSet ? onsetSet.has(ch.toLowerCase()) : false);
  const roll = () => (typeof rng === "function" ? rng() : Math.random());

  if (!vowel(laLower) && laLower === fbLower && onsetHas(laLower)) {
    return a + b.slice(1);
  }

  if (vowel(laLower) && !vowel(fbLower) && onsetHas(fbLower)) {
    if (roll() < 0.7) return a + b.slice(1);
  }

  const laIsAscii = isAsciiLetter(la);
  const fbIsAscii = isAsciiLetter(fb);
  if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
    const r = roll();
    if (r < 0.6) {
      return a + " " + b;
    }
    if (r < 0.8) {
      return a + "-" + b;
    }
    return a + fb.toLowerCase() + b.slice(1);
  }

  if (vowel(laLower) && vowel(fbLower)) {
    return a + b.slice(1);
  }

  return a + b;
}

function normalizeWeights(length, weights) {
  if (!Array.isArray(weights) || weights.length !== length) {
    return Array.from({length}, () => 1);
  }
  return weights.map(w => {
    const n = parseInt(w, 10);
    if (!Number.isFinite(n) || n <= 0) return 1;
    return n;
  });
}

function buildBlendedContexts(baseIndices, baseByIndex, weights) {
  if (!Array.isArray(baseIndices) || !baseIndices.length) return [];
  const normalized = normalizeWeights(baseIndices.length, weights);
  const contexts = [];

  baseIndices.forEach((baseIndex, idx) => {
    const base = baseByIndex.get(baseIndex);
    if (!base || !base.b) return;

    const stats = computeSeedStats(base.b);
    const onsetSet = classifyOnsets(base.b);
    const clickHeavy = isClickHeavyLanguage(base.b);

    const weight = normalized[idx];
    for (let k = 0; k < weight; k++) {
      contexts.push({
        idx: baseIndex,
        base,
        stats,
        onsetSet,
        isClickHeavy: clickHeavy
      });
    }
  });

  return contexts;
}

function generatePlainNameFromContext(ctx, rng, opts) {
  const base = ctx && ctx.base;
  if (!base) return "";
  const overrides = Object.assign({}, opts || {});
  return generateFromBaseConfig(base, rng, overrides);
}

function generateBlendedName(contexts, rng, opts) {
  if (!Array.isArray(contexts) || !contexts.length) {
    return {text: "", bases: []};
  }

  const globalMin = opts && typeof opts.min === "number" ? opts.min : null;
  const globalMax = opts && typeof opts.max === "number" ? opts.max : null;
  const maxSegments =
    opts && typeof opts.maxSegments === "number" && opts.maxSegments > 0 ? opts.maxSegments : 4;
  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  let requiredUniqueBases =
    opts && typeof opts.minUniqueBases === "number"
      ? Math.max(1, Math.min(opts.minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const fallbackMin = Math.min(...contexts.map(c => c.base.min || 4));
  const fallbackMax = Math.max(...contexts.map(c => c.base.max || fallbackMin + 4));

  const requestedMin = globalMin != null ? globalMin : fallbackMin;
  const requestedMax = globalMax != null ? globalMax : fallbackMax;
  const targetLen = (requestedMin + requestedMax) / 2;

  function buildOnce() {
    const segs = [];
    const usedBaseIdxs = new Set();
    let total = 0;
    let guard = 0;

    while ((total < requestedMin || usedBaseIdxs.size < requiredUniqueBases) && guard < maxSegments) {
      let pool = contexts;

      if (segs.length >= 2) {
        const last1 = segs[segs.length - 1].shape;
        const last2 = segs[segs.length - 2].shape;
        if (last1.isClickLanguage && last2.isClickLanguage) {
          const nonClick = contexts.filter(c => !c.isClickHeavy);
          if (nonClick.length) pool = nonClick;
        }
      }

      if (requiredUniqueBases > 1 && usedBaseIdxs.size < requiredUniqueBases) {
        const unused = pool.filter(c => !usedBaseIdxs.has(c.idx));
        if (unused.length) pool = unused;
      }

      const ctx = ra(pool, rng);
      if (!ctx) break;

      const stats = ctx.stats;
      const base = ctx.base;
      let segMean;
      if (stats && typeof stats.mean === "number") {
        segMean = stats.mean;
      } else if (typeof base.min === "number" && typeof base.max === "number") {
        segMean = (base.min + base.max) / 2;
      } else {
        segMean = 4;
      }

      const jitter = (rng() - 0.5) * 2;
      const jitteredMean = Math.max(2, segMean + jitter);

      const baseMax = typeof base.max === "number" ? base.max : Math.round(jitteredMean + 4);
      const segMin = Math.max(2, Math.min(Math.round(jitteredMean), baseMax));
      const segMax = Math.max(segMin + 1, Math.min(baseMax, Math.round(jitteredMean + 2)));

      const segText = generatePlainNameFromContext(ctx, rng, {
        min: segMin,
        max: segMax,
        dupl: base.d || ""
      });

      if (!segText) break;

      const shape = getSegmentShape(segText, ctx);
      segs.push({text: segText, ctx, shape});
      total += segText.length;
      usedBaseIdxs.add(ctx.idx);
      guard++;
    }

    if (!segs.length) {
      const ctx = ra(contexts, rng);
      const base = ctx.base;
      const fallbackText = generatePlainNameFromContext(ctx, rng, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || ""
      });
      const shape = getSegmentShape(fallbackText, ctx);
      return {
        text: fallbackText,
        segInfos: [{text: fallbackText, ctx, shape}]
      };
    }

    softenClickRuns(segs, rng);

    let compound = segs[0].text;
    for (let i = 1; i < segs.length; i++) {
      const seg = segs[i];
      compound = smoothJoin(compound, seg.text, seg.ctx.onsetSet, rng);
    }

    return {
      text: compound,
      segInfos: segs
    };
  }

  function scoreCandidate(text, segInfos) {
    const len = text.length;
    let penalty = 0;

    if (len < requestedMin) penalty += (requestedMin - len) * 2;
    if (len > requestedMax) penalty += (len - requestedMax) * 2;

    const deltaToTarget = Math.abs(len - targetLen);
    penalty += deltaToTarget;

    if (isRepetitiveClickPattern(segInfos)) penalty += 50;

    return {len, penalty};
  }

  let best = null;
  let bestScore = Infinity;
  const attempts = 6;

  for (let i = 0; i < attempts; i++) {
      const {text, segInfos} = buildOnce();
      const {penalty} = scoreCandidate(text, segInfos);
      if (penalty < bestScore) {
        bestScore = penalty;
        best = {text, segInfos};
    }
    const len = text.length;
    if (len >= requestedMin && len <= requestedMax && !isRepetitiveClickPattern(segInfos)) {
      best = {text, segInfos};
      break;
    }
  }

  if (!best) {
    const ctx = ra(contexts, rng);
    const base = ctx.base;
    const fallbackText = generatePlainNameFromContext(ctx, rng, {
      min: requestedMin,
      max: requestedMax,
      dupl: base.d || ""
    });
    return {text: fallbackText, bases: [ctx.idx]};
  }

  const usedIdxs = Array.from(new Set(best.segInfos.map(s => s.ctx.idx))).sort((a, b) => a - b);
  return {text: best.text, bases: usedIdxs};
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
  const weightsArg = getValue("--weights");
  const maxSegmentsArg = getValue("--max-segments");

  const count = countArg ? parseInt(countArg, 10) : null;
  const perBase = perBaseArg ? parseInt(perBaseArg, 10) : null;
  const seed = seedArg != null ? parseInt(seedArg, 10) : null;
  const min = minArg != null ? parseInt(minArg, 10) : null;
  const max = maxArg != null ? parseInt(maxArg, 10) : null;
  const maxSegments = maxSegmentsArg != null ? parseInt(maxSegmentsArg, 10) : null;

  const baseIndices = baseArg
    ? baseArg.split(",").map(s => s.trim()).filter(Boolean).map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n))
    : [];

  const weights = weightsArg
    ? weightsArg
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseInt(s, 10))
    : null;

  const help = args.includes("--help") || args.includes("-h");
  const analyzeLengths = args.includes("--analyze-lengths");
  const printPatch = args.includes("--print-patch");

  return {iso, baseIndices, count, perBase, seed, min, max, maxSegments, weights, analyzeLengths, printPatch, help};
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
  console.log("  --weights=a,b,c       Optional weights for blended --base runs (matches number of indices).");
  console.log("  --max-segments=N      Upper bound on how many segments can be stitched inside a blended name (default 4).");
  console.log("  --analyze-lengths     Also print length stats and suggested min/max per base; useful for placename tuning.");
  console.log(
    "  --print-patch         With --analyze-lengths, also emit JSON min/max patch suggestions per base.\n"
  );
  console.log("Examples:");
  console.log("  node tools/generate-language-samples.js --iso=amkoe --per-base=10 --seed=1");
  console.log("  node tools/generate-language-samples.js --iso=kx-ao-ae --per-base=10");
  console.log("  node tools/generate-language-samples.js --base=353,354 --count=40 --seed=42");
}

function main() {
  const {
    iso,
    baseIndices,
    count,
    perBase,
    seed,
    min,
    max,
    maxSegments,
    weights,
    analyzeLengths,
    printPatch,
    help
  } = parseArgs(process.argv);

  if (help || (!iso && (!baseIndices || !baseIndices.length))) {
    printUsage();
    return;
  }

  const rng = makeRng(seed);
  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const baseOverrides = {};
  if (typeof min === "number" && !Number.isNaN(min)) baseOverrides.min = min;
  if (typeof max === "number" && !Number.isNaN(max)) baseOverrides.max = max;

  const blendOverrides = Object.assign({}, baseOverrides);
  if (typeof maxSegments === "number" && maxSegments > 0) blendOverrides.maxSegments = maxSegments;

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
        const name = generateFromBaseConfig(baseConfig, rng, baseOverrides);
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

    if (baseIndices.length === 1) {
      const idx = baseIndices[0];
      const base = baseByIndex.get(idx);
      if (!base) {
        console.error("Base", idx, "not found in defaultNameBases");
        process.exitCode = 1;
        return;
      }

      console.log("=== Samples for base:", idx, "===");
      console.log("");

      const samples = analyzeLengths ? [] : null;
      for (let i = 0; i < total; i++) {
        const name = generateFromBaseConfig(base, rng, baseOverrides);
        if (samples) samples.push(name);
        console.log(`[${idx}] ${name}`);
      }

      if (analyzeLengths && samples) {
        console.log("");
        console.log("=== Length analysis ===");
        const stats = computeLengthStats(samples);
        if (stats.count) {
          console.log(`Base ${idx} | ${base.name || "(unnamed)"}`);
          console.log(
            `  [lengths] count=${stats.count} min=${stats.minLen} max=${stats.maxLen} ` +
              `mean=${stats.mean.toFixed(2)} p25=${stats.p25} p75=${stats.p75} p90=${stats.p90}`
          );
          console.log(
            `  [suggested min/max] ${stats.suggestedMin}-${stats.suggestedMax} ` +
              `(current: ${base.min}-${base.max})`
          );

          if (printPatch) {
            const currentMin = base.min;
            const currentMax = base.max;
            if (
              typeof currentMin === "number" &&
              typeof currentMax === "number" &&
              (currentMin !== stats.suggestedMin || currentMax !== stats.suggestedMax)
            ) {
              const patch = [
                {
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
                }
              ];
              console.log("");
              console.log("=== Suggested min/max patch (JSON) ===");
              console.log(JSON.stringify(patch, null, 2));
            }
          }
        } else {
          console.log("No non-empty samples generated for base", idx);
        }
      }
      return;
    }

    const contexts = buildBlendedContexts(baseIndices, baseByIndex, weights);
    if (!contexts.length) {
      console.error("Failed to build blended contexts — ensure all bases exist and have seeds");
      process.exitCode = 1;
      return;
    }

    console.log("=== Blended samples for bases:", baseIndices.join(", "), "===");
    console.log("");

    const blendedSamples = analyzeLengths ? [] : null;
    const baseUsage = new Map();

    for (let i = 0; i < total; i++) {
      const result = generateBlendedName(contexts, rng, blendOverrides);
      const text = result && result.text ? result.text : "";
      const used = result && Array.isArray(result.bases) && result.bases.length ? result.bases : [];
      const key = used.length ? used.join("+") : baseIndices.join("+");
      baseUsage.set(key, (baseUsage.get(key) || 0) + 1);
      if (blendedSamples) blendedSamples.push(text);
      console.log(`[${key}] ${text}`);
    }

    if (analyzeLengths && blendedSamples) {
      console.log("");
      console.log("=== Blended length analysis ===");
      const stats = computeLengthStats(blendedSamples);
      if (stats.count) {
        console.log(
          `count=${stats.count} min=${stats.minLen} max=${stats.maxLen} mean=${stats.mean.toFixed(2)} ` +
            `p25=${stats.p25} p75=${stats.p75} p90=${stats.p90}`
        );
        console.log(`suggested blended min/max: ${stats.suggestedMin}-${stats.suggestedMax}`);
      } else {
        console.log("No non-empty blended samples generated");
      }

      if (baseUsage.size) {
        console.log("");
        console.log("=== Segment usage breakdown ===");
        for (const [key, value] of baseUsage.entries()) {
          console.log(`  [${key}] ${value}`);
        }
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
