"use strict";

// Helper CLI that walks every catalog language pair, generates local mixer
// samples, and reports pairs whose samples never actually mix segments from
// both languages (i.e. every generated name draws from a single ISO only).
//
// Run from project root, e.g.:
//   node tools/mixer-core/generate-language-pair-samples.js --sample-count=4 --max-pairs=200

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

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ra(arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return "";
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

function last(str) {
  return str && str.length ? str[str.length - 1] : "";
}

const VOWELS =
  "aeiouyɑ'əøɛœæɶɒɨɪɔɐʊɤɯаоиеёэыуюяàèìòùỳẁȁȅȉȍȕáéíóúýẃőűâêîôûŷŵäëïöüÿẅãẽĩõũỹąęįǫųāēīōūȳăĕĭŏŭǎěǐǒǔȧėȯẏẇạẹịọụỵẉḛḭṵṳ";

function vowel(c) {
  return VOWELS.includes(c);
}

function calculateChainFromBlob(blob) {
  const chain = [];
  if (!blob || typeof blob !== "string") return chain;

  const array = blob.split(",");
  for (const n of array) {
    let name = n.trim().toLowerCase();
    if (!name) continue;
    const basic = !/[^\u0000-\u007f]/.test(name);

    for (let i = -1, syllable = ""; i < name.length; i += syllable.length || 1, syllable = "") {
      let prev = name[i] || "";
      let v = 0;

      for (let c = i + 1; name[c] && syllable.length < 5; c++) {
        const that = name[c];
        const next = name[c + 1];
        syllable += that;
        if (syllable === " " || syllable === "-") break;
        if (!next || next === " " || next === "-") break;

        if (vowel(that)) v = 1;

        if (that === "y" && next === "e") continue;
        if (basic) {
          if (that === "o" && next === "o") continue;
          if (that === "e" && next === "e") continue;
          if (that === "a" && next === "e") continue;
          if (that === "c" && next === "h") continue;
        }

        if (vowel(that) === next) break;
        if (v && vowel(name[c + 2])) break;
      }

      if (chain[prev] === undefined) chain[prev] = [];
      chain[prev].push(syllable);
    }
  }

  return chain;
}

function generateFromBaseConfig(baseConfig, rng, opts) {
  if (!baseConfig) throw new Error("Base config is required");

  const chain = calculateChainFromBlob(baseConfig.b || "");
  if (!chain || chain[""] === undefined) {
    throw new Error(
      "Namebase " + (baseConfig.i != null ? baseConfig.i : "?") + " is incorrect (no starting chain)"
    );
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
        if (w.length < minLen) {
          cur = "";
          w = "";
          v = chain[""];
        } else break;
      } else {
        if (w.length + cur.length > maxLen) {
          if (w.length < minLen) w += cur;
          break;
        } else {
          v = chain[last(cur)] || chain[""];
        }
      }

      w += cur;
      cur = ra(v, rng);
    }

    const l = last(w);
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
    iso: ctx.iso,
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

function buildContextsForEntry(entry, baseByIndex) {
  const contexts = [];
  if (!entry || !Array.isArray(entry.bases)) return contexts;

  entry.bases.forEach(baseIndex => {
    const base = baseByIndex.get(baseIndex);
    if (!base || !base.b) return;

    const stats = computeSeedStats(base.b);
    const onsetSet = classifyOnsets(base.b);
    const clickHeavy = isClickHeavyLanguage(base.b);

    contexts.push({
      idx: baseIndex,
      iso: entry.iso,
      base,
      stats,
      onsetSet,
      isClickHeavy: clickHeavy
    });
  });

  return contexts;
}

function generatePlainNameFromContext(ctx, rng, overrides) {
  const base = ctx && ctx.base;
  if (!base) return "";
  const opts = Object.assign({}, overrides || {});
  return generateFromBaseConfig(base, rng, opts);
}

function generateBlendedName(contexts, rng, opts) {
  if (!Array.isArray(contexts) || !contexts.length) {
    return {text: "", isoSet: new Set(), bases: []};
  }

  const globalMin = opts && typeof opts.min === "number" ? opts.min : null;
  const globalMax = opts && typeof opts.max === "number" ? opts.max : null;
  const maxSegments =
    opts && typeof opts.maxSegments === "number" && opts.maxSegments > 0 ? opts.maxSegments : 4;

  const fallbackMin = Math.min(...contexts.map(c => c.base.min || 4));
  const fallbackMax = Math.max(...contexts.map(c => c.base.max || fallbackMin + 4));

  const requestedMin = globalMin != null ? globalMin : fallbackMin;
  const requestedMax = globalMax != null ? globalMax : fallbackMax;
  const targetLen = (requestedMin + requestedMax) / 2;

  function buildOnce() {
    const segs = [];
    let total = 0;
    let guard = 0;

    while (total < requestedMin && guard < maxSegments) {
      let ctx = ra(contexts, rng);

      if (segs.length >= 2) {
        const last1 = segs[segs.length - 1].ctx;
        const last2 = segs[segs.length - 2].ctx;
        if (last1.isClickHeavy && last2.isClickHeavy) {
          const nonClick = contexts.filter(c => !c.isClickHeavy);
          if (nonClick.length) ctx = ra(nonClick, rng);
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
      guard++;
    }

    const hasMultipleIsos = new Set(contexts.map(c => c.iso)).size > 1;
    if (
      hasMultipleIsos &&
      segs.length &&
      new Set(segs.map(s => s.ctx.iso)).size < 2 &&
      segs.length < maxSegments
    ) {
      const usedIso = segs[0].ctx.iso;
      const candidates = contexts.filter(c => c.iso !== usedIso);
      const ctx = candidates.length ? ra(candidates, rng) : ra(contexts, rng);
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
      if (segText) {
        const shape = getSegmentShape(segText, ctx);
        segs.push({text: segText, ctx, shape});
        total += segText.length;
      }
    }

    if (!segs.length) {
      const ctx = ra(contexts, rng);
      const base = ctx.base;
      const name = generatePlainNameFromContext(ctx, rng, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || ""
      });
      return {
        text: name,
        segInfos: [
          {
            text: name,
            ctx,
            shape: getSegmentShape(name, ctx)
          }
        ]
      };
    }

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
    const name = generatePlainNameFromContext(ctx, rng, {
      min: requestedMin,
      max: requestedMax,
      dupl: base.d || ""
    });
    const isoSet = new Set([ctx.iso]);
    return {text: name, isoSet, bases: [ctx.idx], segInfos: []};
  }

  const isoSet = new Set(best.segInfos.map(s => s.shape.iso));
  const usedBases = Array.from(new Set(best.segInfos.map(s => s.shape.baseIndex))).sort((a, b) => a - b);
  return {text: best.text, isoSet, bases: usedBases, segInfos: best.segInfos};
}

function parseArgs(argv) {
  const opts = {
    sampleCount: 6,
    minLength: null,
    maxLength: null,
    maxSegments: 4,
    seed: 12345,
    maxPairs: null,
    includeFamilies: false,
    verbose: false
  };

  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, valueRaw] = arg.split("=");
    const value = valueRaw === undefined ? null : valueRaw;

    switch (key) {
      case "--sample-count":
        opts.sampleCount = Math.max(1, parseInt(value, 10) || opts.sampleCount);
        break;
      case "--min":
        opts.minLength = value === null ? null : parseInt(value, 10);
        break;
      case "--max":
        opts.maxLength = value === null ? null : parseInt(value, 10);
        break;
      case "--max-segments":
        opts.maxSegments = Math.max(1, parseInt(value, 10) || opts.maxSegments);
        break;
      case "--seed":
        opts.seed = value === null ? null : parseInt(value, 10);
        break;
      case "--max-pairs":
        opts.maxPairs = value === null ? null : Math.max(1, parseInt(value, 10));
        break;
      case "--include-families":
        opts.includeFamilies = true;
        break;
      case "--verbose":
        opts.verbose = true;
        break;
      default:
        break;
    }
  }

  return opts;
}

function formatEntry(entry) {
  if (!entry) return "(unknown)";
  const label = entry.meta && entry.meta.name ? entry.meta.name : entry.iso;
  return `${label} [${entry.iso}]`;
}

function main() {
  const argv = process.argv.slice(2);
  const cli = parseArgs(argv);

  const catalog = readJson("config/language-mixes.json");
  const catalogByIso = new Map(catalog.map(entry => [entry.iso, entry]));

  const mapEntries = readJson("config/language-mixer-map.json")
    .filter(entry => entry && entry.iso && Array.isArray(entry.bases) && entry.bases.length)
    .map(entry => Object.assign({}, entry, {meta: catalogByIso.get(entry.iso) || null}));

  const filteredEntries = mapEntries
    .filter(entry => {
      if (!entry.meta || cli.includeFamilies) return true;
      return !Array.isArray(entry.meta.tags) || entry.meta.tags.indexOf("family") === -1;
    })
    .sort((a, b) => String(a.iso).localeCompare(String(b.iso)));

  if (!filteredEntries.length) {
    console.error("No catalog entries with mapped bases found.");
    return;
  }

  const baseByIndex = buildBaseIndexMap(loadDefaultNameBases());
  const contextsByIso = new Map();

  for (const entry of filteredEntries) {
    const contexts = buildContextsForEntry(entry, baseByIndex);
    if (!contexts.length) continue;
    contextsByIso.set(entry.iso, contexts);
  }

  const usableEntries = filteredEntries.filter(entry => contextsByIso.has(entry.iso));
  if (!usableEntries.length) {
    console.error("No entries have usable local namebases to mix.");
    return;
  }

  const failures = [];
  let evaluatedPairs = 0;
  const totalPairsPossible = (usableEntries.length * (usableEntries.length - 1)) / 2;
  const isoMixStats = new Map();

  function markTested(iso) {
    const stats = isoMixStats.get(iso) || {tested: false, mixed: false};
    stats.tested = true;
    isoMixStats.set(iso, stats);
  }

  function markMixed(iso) {
    const stats = isoMixStats.get(iso) || {tested: false, mixed: false};
    stats.tested = true;
    stats.mixed = true;
    isoMixStats.set(iso, stats);
  }

  outer: for (let i = 0; i < usableEntries.length; i++) {
    for (let j = i + 1; j < usableEntries.length; j++) {
      if (cli.maxPairs && evaluatedPairs >= cli.maxPairs) break outer;

      const entryA = usableEntries[i];
      const entryB = usableEntries[j];
      const contexts = contextsByIso.get(entryA.iso).concat(contextsByIso.get(entryB.iso));
      if (!contexts.length) continue;

      const pairSeed =
        cli.seed == null ? null : hashString(`${entryA.iso}:${entryB.iso}:${cli.seed}`);
      const rng = makeRng(pairSeed);
      const samples = [];
      const genOptions = {
        min: cli.minLength,
        max: cli.maxLength,
        maxSegments: cli.maxSegments
      };

      for (let s = 0; s < cli.sampleCount; s++) {
        const result = generateBlendedName(contexts, rng, genOptions);
        if (!result || !result.text) break;
        samples.push({
          text: result.text,
          isoSet: result.isoSet,
          bases: result.bases
        });
      }

      if (!samples.length) continue;

      evaluatedPairs++;
      markTested(entryA.iso);
      markTested(entryB.iso);

      const allMonolingual = samples.every(sample => sample.isoSet.size <= 1);
      if (allMonolingual) {
        failures.push({entryA, entryB, samples});
        if (cli.verbose) {
          console.log(
            `Detected monolingual-only pair: ${formatEntry(entryA)} + ${formatEntry(entryB)}`
          );
        }
      } else {
        markMixed(entryA.iso);
        markMixed(entryB.iso);
      }
    }
  }

  if (failures.length) {
    console.log("Pairs that never produced multi-language segments:");
    for (const failure of failures) {
      const label = `${formatEntry(failure.entryA)} + ${formatEntry(failure.entryB)}`;
      console.log(`- ${label}`);
      failure.samples.forEach((sample, idx) => {
        const isoList = [...sample.isoSet];
        const isoText = isoList.length ? isoList.join(" + ") : "(none)";
        console.log(`    ${idx + 1}. ${sample.text}  ←  ${isoText}`);
      });
    }
    console.log("");
  }

  const neverMixed = Array.from(isoMixStats.entries())
    .filter(([, stats]) => stats.tested && !stats.mixed)
    .map(([iso]) => iso)
    .sort((a, b) => a.localeCompare(b));
  if (neverMixed.length) {
    console.log("Languages that never produced a mixed-name segment in this run:");
    for (const iso of neverMixed) {
      const entry = mapEntries.find(e => e.iso === iso);
      console.log(` - ${formatEntry(entry)}`);
    }
    console.log("");
  }
  console.log("=== Full language pair mix scan ===");
  console.log("Catalog entries considered:", filteredEntries.length);
  console.log("Entries with usable bases:", usableEntries.length);
  console.log("Pairs evaluated:", evaluatedPairs, "/", totalPairsPossible);
  console.log("Pairs with monolingual-only outputs:", failures.length);
  console.log("");
  console.log("Total monolingual pair failures:", failures.length);
}

if (require.main === module) main();
