"use strict";

// Markov full-upgrade tester helper for dev use.
//
// Goals (per user requirements):
// 1. A single name can mix parts from any mix of languages it is given.
// 2. Avoid strongly repetitive patterns like strict click+root, click+root, ...
// 3. Use the length of names in the languages themselves as guides for
//    mixed-name lengths, while still respecting user min/max more often than not.
// 4. Use Markov start/stop behavior and capitalization so that, with the
//    right settings, it can output names like:
//      "Persterton-Uxbrover Holboke Marsham-Chipseade" (one name).
//
// This script is standalone and does NOT affect the in-browser generator.
// It prints only to stdout.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

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
  if (!Array.isArray(bases)) throw new Error("defaultNameBases not populated");
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

// Simple deterministic RNG (mulberry32)
function makeRng(seed) {
  if (seed === null || seed === undefined || Number.isNaN(seed)) return () => Math.random();
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
const VOWELS = "aeiouyb'";
function vowel(c) {
  return VOWELS.includes(c);
}

// Basic Markov chain from a names blob (similar to Names.calculateChain)
function calculateChainFromBlob(blob) {
  const chain = [];
  if (!blob || typeof blob !== "string") return chain;

  const array = blob.split(",");
  for (const n of array) {
    let name = n.trim().toLowerCase();
    if (!name) continue;
    const basic = !/[^\u0000-\u007f]/.test(name); // ascii-only => English-like rules

    for (let i = -1, syllable = ""; i < name.length; i += syllable.length || 1, syllable = "") {
      let prev = name[i] || ""; // pre-onset letter
      let v = 0; // 0 if no vowels in syllable

      for (let c = i + 1; name[c] && syllable.length < 5; c++) {
        const that = name[c];
        const next = name[c + 1];
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

        if (vowel(that) && that === next) break; // two same vowels in a row
        if (v && vowel(name[c + 2])) break; // syllable has vowel and additional vowel is expected soon
      }

      if (chain[prev] === undefined) chain[prev] = [];
      chain[prev].push(syllable);
    }
  }

  return chain;
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

function generatePlainName(baseConfig, chain, rng, opts) {
  const minLen = typeof opts.min === "number" ? opts.min : baseConfig.min;
  const maxLen = typeof opts.max === "number" ? opts.max : baseConfig.max;
  const duplSet = typeof opts.dupl === "string" ? opts.dupl : baseConfig.d || "";

  function attempt() {
    const data = chain;
    let v = data[""];
    let cur = ra(v, rng);
    let w = "";

    for (let i = 0; i < 20; i++) {
      if (cur === "") {
        // end of word
        if (w.length < minLen) {
          cur = "";
          w = "";
          v = data[""];
        } else break;
      } else {
        if (w.length + cur.length > maxLen) {
          // word too long
          if (w.length < minLen) w += cur;
          break;
        } else {
          v = data[last(cur)] || data[""];
        }
      }

      w += cur;
      cur = ra(v, rng);
    }

    const l = last(w);
    if (l === "'" || l === " " || l === "-") w = w.slice(0, -1);

    let name = [...w].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !duplSet.includes(c)) return r; // duplication not allowed
      if (!r.length) return c.toUpperCase();
      if (r.slice(-1) === "-" && c === " ") return r; // remove space after hyphen
      if (r.slice(-1) === " ") return r + c.toUpperCase(); // capitalize after space
      if (r.slice(-1) === "-") return r + c.toUpperCase(); // capitalize after hyphen
      if (c === "a" && d[i + 1] === "e") return r; // "ae" => "e"
      if (i + 2 < d.length && c === d[i + 1] && c === d[i + 2]) return r; // remove triple letters
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
      const seeds = (baseConfig.b || "")
        .split(",")
        .map(n => n.trim())
        .filter(Boolean);
      name = seeds.length ? ra(seeds, rng) : name;
    }

    return name;
  }

  // Try several times to respect min/max better; pick closest length if none fit.
  let best = null;
  let bestDelta = Infinity;
  const target = (minLen + maxLen) / 2;
  for (let i = 0; i < 5; i++) {
    const candidate = attempt();
    const len = candidate.length;
    if (len >= minLen && len <= maxLen) return candidate;
    const delta = Math.abs(len - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate;
    }
  }

  return best || attempt();
}

function classifyOnsets(blob) {
  const names = (blob || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const set = new Set();
  for (const n of names) {
    const ch = n[0];
    if (ch && !vowel(ch)) set.add(ch);
  }
  return set;
}

function isAsciiLetter(c) {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z");
}

function smoothJoin(a, b, onsetSet, rng) {
  if (!a) return b;
  if (!b) return a;

  const la = a[a.length - 1];
  const fb = b[0];

  // If both boundary chars are the same non-vowel onset (e.g. clicks), drop one.
  if (!vowel(la) && la === fb && onsetSet.has(la)) {
    return a + b.slice(1);
  }

  // If boundary is vowel + onset (click/consonant), often drop the onset
  // to avoid strict (onset+root)(onset+root) repetition.
  if (vowel(la) && !vowel(fb) && onsetSet.has(fb)) {
    if (rng() < 0.7) return a + b.slice(1);
  }

  // If boundary is ascii-letter + ascii-letter with capital second, occasionally
  // insert a space or hyphen instead of camel-casing.
  const laIsAscii = isAsciiLetter(la);
  const fbIsAscii = isAsciiLetter(fb);
  if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
    const r = rng();
    if (r < 0.6) {
      // space + keep capitalization on new word
      return a + " " + b;
    }
    if (r < 0.8) {
      // hyphen + keep capitalization
      return a + "-" + b;
    }
    // otherwise, smooth into a single word by lowercasing the new segment's first char
    return a + fb.toLowerCase() + b.slice(1);
  }

  // Vowel-vowel smoothing: if both vowels, drop the boundary vowel from the second.
  if (vowel(la) && vowel(fb)) {
    return a + b.slice(1);
  }

  return a + b;
}

const CLICKS = "";

function isClickHeavyLanguage(blob) {
  const names = (blob || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (!names.length) return false;

  let initialClicks = 0;
  let anyClicks = 0;
  for (const n of names) {
    const first = n[0];
    if (first && CLICKS.includes(first)) initialClicks++;
    if ([...n].some(ch => CLICKS.includes(ch))) anyClicks++;
  }

  const fracInitial = initialClicks / names.length;
  const fracAny = anyClicks / names.length;
  return fracInitial >= 0.25 || fracAny >= 0.5;
}

function getSegmentShape(text, ctx) {
  const trimmed = text.trim();
  const len = trimmed.length;
  const first = trimmed[0] || "";
  const isClickSegment = !!first && CLICKS.includes(first);
  let lenBucket;
  if (len <= 4) lenBucket = "S";
  else if (len <= 8) lenBucket = "M";
  else lenBucket = "L";
  return {
    len,
    lenBucket,
    isClickSegment,
    baseIndex: ctx.idx,
    isClickLanguage: ctx.isClickHeavy,
  };
}

function isRepetitiveClickPattern(segInfos) {
  const clickSegs = segInfos.filter(s => s.shape.isClickSegment);
  if (clickSegs.length < 3) return false;

  // Look for runs of 3+ click segments with same length bucket.
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

function generateFullUpgradeName(contexts, rng, opts) {
  const globalMin = opts.min;
  const globalMax = opts.max;
  const maxSegments = typeof opts.maxSegments === "number" && opts.maxSegments > 0 ? opts.maxSegments : 4;

  const fallbackMin = Math.min(...contexts.map(c => (c.base.min || 4)));
  const fallbackMax = Math.max(...contexts.map(c => (c.base.max || (fallbackMin + 4))));

  const requestedMin = typeof globalMin === "number" ? globalMin : fallbackMin;
  const requestedMax = typeof globalMax === "number" ? globalMax : fallbackMax;
  const targetLen = (requestedMin + requestedMax) / 2;

  function buildOnce() {
    const segs = [];
    let total = 0;
    let guard = 0;

    while (total < requestedMin && guard < maxSegments) {
      let ctx = contexts[Math.floor(rng() * contexts.length)];

      // Light anti-pattern: if last two segments were from click-heavy bases
      // with similar length buckets, try to pick a non-click-heavy base.
      if (segs.length >= 2) {
        const last1 = segs[segs.length - 1].shape;
        const last2 = segs[segs.length - 2].shape;
        if (last1.isClickLanguage && last2.isClickLanguage && rng() < 0.7) {
          const nonClick = contexts.filter(c => !c.isClickHeavy);
          if (nonClick.length) ctx = nonClick[Math.floor(rng() * nonClick.length)];
        }
      }

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

      // Jitter segment mean a bit so we don't get perfectly uniform patterns.
      const jitter = (rng() - 0.5) * 2; // -1..1
      const jitteredMean = Math.max(2, segMean + jitter);

      const baseMax = typeof base.max === "number" ? base.max : Math.round(jitteredMean + 4);
      const segMin = Math.max(2, Math.min(Math.round(jitteredMean), baseMax));
      const segMax = Math.max(segMin + 1, Math.min(baseMax, Math.round(jitteredMean + 2)));

      const segText = generatePlainName(base, ctx.chain, rng, {
        min: segMin,
        max: segMax,
        dupl: base.d || "",
      });

      const shape = getSegmentShape(segText, ctx);
      segs.push({text: segText, ctx, shape});
      total += segText.length;
      guard++;
    }

    if (!segs.length) {
      const ctx = contexts[Math.floor(rng() * contexts.length)];
      const base = ctx.base;
      const name = generatePlainName(base, ctx.chain, rng, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || "",
      });
      return {
        text: name,
        segInfos: [
          {
            text: name,
            ctx,
            shape: getSegmentShape(name, ctx),
          },
        ],
      };
    }

    let compound = segs[0].text;
    for (let i = 1; i < segs.length; i++) {
      const seg = segs[i];
      compound = smoothJoin(compound, seg.text, seg.ctx.onsetSet, rng);
    }

    return {
      text: compound,
      segInfos: segs,
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
    // Early exit if we're inside band and not repetitive.
    const len = text.length;
    if (len >= requestedMin && len <= requestedMax && !isRepetitiveClickPattern(segInfos)) {
      best = {text, segInfos};
      break;
    }
  }

  if (!best) {
    const ctx = contexts[Math.floor(rng() * contexts.length)];
    const base = ctx.base;
    const name = generatePlainName(base, ctx.chain, rng, {
      min: requestedMin,
      max: requestedMax,
      dupl: base.d || "",
    });
    return {text: name, bases: [ctx.idx]};
  }

  const usedIdxs = Array.from(new Set(best.segInfos.map(s => s.shape.baseIndex))).sort((a, b) => a - b);
  return {text: best.text, bases: usedIdxs};
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const baseArg = getValue("--base");
  const countArg = getValue("--count");
  const minArg = getValue("--min");
  const maxArg = getValue("--max");
  const seedArg = getValue("--seed");
  const segArg = getValue("--segments");

  const baseIndices = baseArg
    ? baseArg
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseInt(s, 10))
        .filter(n => !Number.isNaN(n))
    : [];

  const count = countArg ? parseInt(countArg, 10) : 40;
  const min = minArg != null ? parseInt(minArg, 10) : null;
  const max = maxArg != null ? parseInt(maxArg, 10) : null;
  const seed = seedArg != null ? parseInt(seedArg, 10) : null;
  const segments = segArg != null ? parseInt(segArg, 10) : null;
  const help = args.includes("--help") || args.includes("-h");

  return {baseIndices, count, min, max, seed, segments, help};
}

function printUsage() {
  console.log("Usage: node tools/markov-full-upgrade-tester.js --base=IDX[,IDX...] [options]\n");
  console.log("Options:");
  console.log("  --base=IDX[,IDX...]   One or more base indices (e.g. 353,354). Required.");
  console.log("  --count=N            Number of names to generate (default 40).");
  console.log("  --min=INT            Target minimum total length.");
  console.log("  --max=INT            Target maximum total length.");
  console.log("  --segments=INT       Maximum Markov segments per name (default 4).");
  console.log("  --seed=INT           RNG seed for deterministic output.\n");
  console.log("Examples:");
  console.log(
    "  node tools/markov-full-upgrade-tester.js --base=353,354,0,1,6 --count=40 --min=20 --max=80 --segments=4 --seed=1",
  );
}

function main() {
  const {baseIndices, count, min, max, seed, segments, help} = parseArgs(process.argv);
  if (help || !baseIndices.length) {
    printUsage();
    return;
  }

  const rng = makeRng(seed);
  const bases = loadDefaultNameBases();
  const baseByIndex = buildBaseIndexMap(bases);

  const resolvedBases = baseIndices
    .map(idx => ({idx, base: baseByIndex.get(idx)}))
    .filter(x => !!x.base);

  if (!resolvedBases.length) {
    console.error("No valid bases resolved from --base argument");
    process.exitCode = 1;
    return;
  }

  const contexts = resolvedBases
    .map(({idx, base}) => ({
      idx,
      base,
      chain: calculateChainFromBlob(base.b || ""),
      stats: computeSeedLengthStats(base.b || ""),
      onsetSet: classifyOnsets(base.b || ""),
      isClickHeavy: isClickHeavyLanguage(base.b || ""),
    }))
    .filter(ctx => ctx.chain && ctx.chain[""] !== undefined);

  if (!contexts.length) {
    console.error("No valid chains built for the requested bases");
    process.exitCode = 1;
    return;
  }

  console.log("=== Markov full-upgrade tester ===");
  console.log("Bases:", baseIndices.join(", "));
  console.log(
    "Target length:",
    min != null ? min : "(auto)",
    "-",
    max != null ? max : "(auto)",
    "| max segments:",
    segments != null ? segments : 4,
  );
  console.log("");

  const lengths = [];
  console.log("-- Full-upgrade blended output --");
  for (let i = 0; i < count; i++) {
    const {text, bases: usedIdxs} = generateFullUpgradeName(contexts, rng, {
      min,
      max,
      maxSegments: segments,
    });
    lengths.push(text.length);
    const tag = usedIdxs.join("+");
    console.log(`[${tag}]`, text);
  }

  if (lengths.length) {
    lengths.sort((a, b) => a - b);
    const c = lengths.length;
    const minL = lengths[0];
    const maxL = lengths[c - 1];
    const mean = lengths.reduce((a, b) => a + b, 0) / c;
    const q = p => lengths[Math.floor(p * (c - 1))];
    console.log("");
    console.log(
      `  [lengths] count=${c} min=${minL} max=${maxL} mean=${mean.toFixed(2)} p25=${q(0.25)} p75=${q(
        0.75,
      )} p90=${q(0.9)}`,
    );
  }

  console.log("");
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error in markov-full-upgrade-tester:",
      err && err.message ? err.message : err,
    );
    process.exitCode = 1;
  }
}
