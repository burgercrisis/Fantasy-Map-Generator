"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function makeMulberry32(seed) {
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

  sandbox.Names = sandbox.window && sandbox.window.Names;

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) throw new Error("defaultNameBases not populated");
  return bases;
}

function createSeededMath(seed) {
  const rng = makeMulberry32(seed);
  const math = Object.create(Math);
  math.random = rng;
  return math;
}

function loadAppMixerSandbox({seed}) {
  const sandbox = {
    window: {},
    console,
    Math: createSeededMath(seed),
    ERROR: false,
    WARN: false,
    tip: function () {},
    XMLHttpRequest: function () {
      throw new Error("XMLHttpRequest is not available in Node sandbox");
    }
  };

  sandbox.window.__mixerComparatorCapture = true;

  const context = vm.createContext(sandbox);

  const preFiles = [
    path.join(root, "utils", "arrayUtils.js"),
    path.join(root, "utils", "probabilityUtils.js"),
    path.join(root, "utils", "languageUtils.js"),
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js"),
    path.join(root, "modules", "names-generator.js")
  ];

  for (const full of preFiles) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
  }

  sandbox.Names = sandbox.window && sandbox.window.Names;

  if (!sandbox.Names) {
    throw new Error("Failed to initialize window.Names in app sandbox (names-generator.js)");
  }

  if (!sandbox.window || !sandbox.window.defaultNameBases) {
    throw new Error("Failed to load defaultNameBases into app sandbox");
  }

  sandbox.nameBases = sandbox.window.defaultNameBases;
  sandbox.window.nameBases = sandbox.window.defaultNameBases;

  const mixerPath = path.join(root, "modules", "names-mixer.js");
  let mixerSrc = fs.readFileSync(mixerPath, "utf8");

  const beforeCurrentInject = mixerSrc;
  mixerSrc = mixerSrc.replace(
    /(\s*)const maxSegments = opts && typeof opts\.maxSegments === "number" && opts\.maxSegments > 0 \? opts\.maxSegments : 4;\r?\n/m,
    [
      "$&",
      "$1const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;",
      "$1const requiredUniqueBases =",
      "$1  opts && typeof opts.minUniqueBases === \"number\"",
      "$1    ? Math.max(1, Math.min(opts.minUniqueBases, availableUniqueBases || 1))",
      "$1    : 1;",
      ""
    ].join("\n")
  );

  mixerSrc = mixerSrc.replace(
    /^(\s*)const segs = \[\];\r?\n\1let total = 0;\r?\n\1let guard = 0;\r?\n/m,
    [
      "$1const segs = [];",
      "$1const usedBaseIdxs = new Set();",
      "$1let total = 0;",
      "$1let guard = 0;",
      ""
    ].join("\n")
  );

  mixerSrc = mixerSrc.replace(
    /while \(total < requestedMin && guard < maxSegments\) \{/g,
    "while ((total < requestedMin || usedBaseIdxs.size < requiredUniqueBases) && guard < maxSegments) {"
  );

  mixerSrc = mixerSrc.replace(
    /(\s*)let ctx = ra\(contexts\);\r?\n/g,
    [
      "$1let ctx = ra(contexts);",
      "",
      "$1if (requiredUniqueBases > 1 && usedBaseIdxs.size < requiredUniqueBases) {",
      "$1  const unused = contexts.filter(c => !usedBaseIdxs.has(c.idx));",
      "$1  if (unused.length) ctx = ra(unused);",
      "$1}",
      ""
    ].join("\n")
  );

  mixerSrc = mixerSrc.replace(
    /segs\.push\(\{text: segText, ctx, shape\}\);\r?\n(\s*)total \+= segText\.length;\r?\n\1guard\+\+;/g,
    [
      "segs.push({text: segText, ctx, shape});",
      "$1usedBaseIdxs.add(ctx.idx);",
      "$1total += segText.length;",
      "$1guard++;"
    ].join("\n")
  );

  const didCurrentInject = mixerSrc !== beforeCurrentInject;
  if (didCurrentInject) {
    const ok = mixerSrc.includes("const usedBaseIdxs = new Set()") && mixerSrc.includes("requiredUniqueBases");
    if (!ok) {
      throw new Error("compare-mixer-nextgen-to-app: failed to inject app-current minUniqueBases enforcement");
    }
  }

  mixerSrc = mixerSrc.replace(
    /function generateFromChain\(chain, baseConfig, options\) \{/g,
    "function generateFromChain(chain, baseConfig, options) {\n    let __sylls = [];"
  );

  mixerSrc = mixerSrc.replace(
    /w \+= cur;\s*\r?\n\s*cur = ra\(v\);/g,
    "if (window.__captureLegacySyllables && cur) __sylls.push(cur);\n\n      w += cur;\n      cur = ra(v);"
  );

  mixerSrc = mixerSrc.replace(
    /cur = \"\";\s*\r?\n\s*w = \"\";\s*\r?\n\s*v = chain\[\"\"\];/g,
    "cur = \"\";\n          w = \"\";\n          __sylls = [];\n          v = chain[\"\"];"
  );

  mixerSrc = mixerSrc.replace(
    /return name;\s*\r?\n\s*\}/g,
    "if (window.__captureLegacySyllables) window.__lastLegacySegTexts = (__sylls || []).slice();\n\n    return name;\n  }"
  );

  mixerSrc = mixerSrc.replace(
    /const name = generateFromChain\(chain, base0, legacyOptions\);/g,
    "window.__lastLegacySegTexts = [];\n        window.__captureLegacySyllables = true;\n        const name = generateFromChain(chain, base0, legacyOptions);\n        window.__captureLegacySyllables = false;"
  );

  mixerSrc = mixerSrc.replace(
    /return \{text: name, bases: \[ctx\.idx\]\};/g,
    "return {text: name, bases: [ctx.idx], segInfos: [{text: name, ctx, shape: getSegmentShape(name, ctx)}]};"
  );

  mixerSrc = mixerSrc.replace(
    /return \{text: best\.text, bases: usedIdxs\};/g,
    "return {text: best.text, bases: usedIdxs, segInfos: best.segInfos};"
  );

  mixerSrc = mixerSrc.replace(
    /names\.push\(name\);/g,
    [
      "if (window.__mixerComparatorCapture) {",
      "  const seq = (result && Array.isArray(result.segInfos) ? result.segInfos.map(s => s && s.ctx && s.ctx.idx).filter(x => x !== undefined) : []);",
      "  const segTexts = (result && Array.isArray(result.segInfos) ? result.segInfos.map(s => s && typeof s.text === 'string' ? s.text : '').filter(Boolean) : []);",
      "  names.push({text: name, baseSeq: seq, segTexts});",
      "} else {",
      "  names.push(name);",
      "}"
    ].join("\n")
  );

  mixerSrc = mixerSrc.replace(
    /legacyNames\.push\(name\);/g,
    [
      "if (window.__mixerComparatorCapture) {",
      "  let __segTexts = Array.isArray(window.__lastLegacySegTexts) ? window.__lastLegacySegTexts.slice() : [];",
      "  if (!__segTexts.length && typeof name === 'string' && name) __segTexts = [name];",
      "  legacyNames.push({text: name, baseSeq: baseIndices.slice(), segTexts: __segTexts});",
      "} else {",
      "  legacyNames.push(name);",
      "}"
    ].join("\n")
  );

  vm.runInContext(mixerSrc, context, {filename: mixerPath});

  const patchSrc = `
(function () {
  const Names = window && window.Names;
  if (!Names || typeof Names.getMixedBaseMany !== 'function') return;
  const original = Names.getMixedBaseMany;

  Names.getMixedBaseMany = function (baseIndices, options) {
    const opts = options || {};
    const useLegacy = !!opts.legacyChain;
    const requested = typeof opts.minUniqueBases === 'number' ? opts.minUniqueBases : 1;
    if (useLegacy || requested <= 1) return original(baseIndices, opts);

    const count = Math.max(1, Math.min(+((opts && opts.count) || 40), 200));
    const singleOpts = Object.assign({}, opts, {count: 1});
    const out = [];

    for (let i = 0; i < count; i++) {
      let chosen = null;
      let fallback = null;
      let guard = 0;
      const cap = 300;

      while (guard < cap) {
        const arr = original(baseIndices, singleOpts);
        const item = Array.isArray(arr) ? arr[0] : null;
        if (!item) break;

        const seq = item && Array.isArray(item.baseSeq) ? item.baseSeq : [];
        const uniq = new Set(seq);
        if (uniq.size >= requested) {
          chosen = item;
          break;
        }
        fallback = item;
        guard++;
      }

      if (!chosen) chosen = fallback;
      if (!chosen) break;
      out.push(chosen);
    }

    return out;
  };
})();
`;

  vm.runInContext(patchSrc, context, {filename: "compare-mixer-nextgen-to-app.js#patch"});

  return {sandbox, context};
}

function runAppMixer({baseIndices, count, seed, min, max, maxSegments, weights, legacyChain, minUniqueBases}) {
  const {sandbox} = loadAppMixerSandbox({seed});

  const Names = sandbox.window && sandbox.window.Names;
  if (!Names || typeof Names.getMixedBaseMany !== "function") {
    throw new Error("Names.getMixedBaseMany not available in app sandbox");
  }

  const options = {
    count,
    legacyChain: !!legacyChain
  };
  if (Array.isArray(weights)) options.weights = weights;
  if (typeof min === "number" && !Number.isNaN(min)) options.min = min;
  if (typeof max === "number" && !Number.isNaN(max)) options.max = max;
  if (typeof maxSegments === "number" && maxSegments > 0) options.maxSegments = maxSegments;
  if (!legacyChain && typeof minUniqueBases === "number") options.minUniqueBases = minUniqueBases;

  return Names.getMixedBaseMany(baseIndices, options);
}

function normalizeCapturedSamples(samples) {
  if (!Array.isArray(samples)) return [];
  return samples.map(s => {
    if (s && typeof s === "object" && typeof s.text === "string") {
      return {
        text: s.text,
        baseSeq: Array.isArray(s.baseSeq) ? s.baseSeq : [],
        segTexts: Array.isArray(s.segTexts) ? s.segTexts : []
      };
    }
    return {text: typeof s === "string" ? s : "", baseSeq: [], segTexts: []};
  });
}

function buildSyllableCountMapFromChain(chain) {
  const counts = new Map();
  if (!chain) return counts;
  for (const k of Object.keys(chain)) {
    const arr = chain[k];
    if (!Array.isArray(arr)) continue;
    for (const s of arr) {
      if (typeof s !== "string" || !s) continue;
      counts.set(s, (counts.get(s) || 0) + 1);
    }
  }
  return counts;
}

function attributeSegsToBasesByChain(segTexts, baseIndices, buildChainForBaseIndex) {
  if (!Array.isArray(segTexts) || !segTexts.length) return [];
  if (!Array.isArray(baseIndices) || !baseIndices.length) return [];

  const baseCountMaps = baseIndices.map(idx => buildSyllableCountMapFromChain(buildChainForBaseIndex(idx)));

  const out = [];
  for (const seg of segTexts) {
    const isSpacer = typeof seg === "string" && (seg === " " || seg === "-" || seg === "'");
    if (isSpacer) {
      out.push(out.length ? out[out.length - 1] : baseIndices[0]);
      continue;
    }

    let bestI = 0;
    let bestScore = -1;
    for (let i = 0; i < baseIndices.length; i++) {
      const score = baseCountMaps[i].get(seg) || 0;
      if (score > bestScore) {
        bestScore = score;
        bestI = i;
      }
    }
    out.push(baseIndices[bestI]);
  }

  return out;
}

function attributeLegacySegsToBases(segTexts, baseIndices, bases) {
  if (!Array.isArray(segTexts) || !segTexts.length) return [];
  if (!Array.isArray(baseIndices) || !baseIndices.length) return [];
  if (!Array.isArray(bases) || !bases.length) return baseIndices.map(() => baseIndices[0]);

  const baseCountMaps = baseIndices.map(idx => {
    const base = bases[idx];
    const blob = base && typeof base.b === "string" ? base.b : "";
    const chain = calculateChainFromBlob(blob);
    return buildSyllableCountMapFromChain(chain);
  });

  const out = [];
  for (const seg of segTexts) {
    const isSpacer = typeof seg === "string" && (seg === " " || seg === "-" || seg === "'");
    if (isSpacer) {
      out.push(out.length ? out[out.length - 1] : baseIndices[0]);
      continue;
    }

    let bestI = 0;
    let bestScore = -1;
    for (let i = 0; i < baseIndices.length; i++) {
      const score = baseCountMaps[i].get(seg) || 0;
      if (score > bestScore) {
        bestScore = score;
        bestI = i;
      }
    }

    out.push(baseIndices[bestI]);
  }

  return out;
}

function normalizeSegsAndBaseSeqInPlace(row, baseIndices, bases, opts) {
  if (!row || typeof row !== "object") return;

  const options = opts || {};
  const forceAttribution = !!options.forceAttribution;

  if (!Array.isArray(row.segTexts)) row.segTexts = [];
  if (!Array.isArray(row.baseSeq)) row.baseSeq = [];

  if (!row.segTexts.length && typeof row.text === "string" && row.text) {
    row.segTexts = [row.text];
  }

  if (!row.segTexts.length) return;

  if (!forceAttribution && row.baseSeq.length === row.segTexts.length) return;

  if (row.baseSeq.length > row.segTexts.length) {
    row.baseSeq = row.baseSeq.slice(0, row.segTexts.length);
    return;
  }

  row.baseSeq = attributeLegacySegsToBases(row.segTexts, baseIndices, bases);
}

const VOWELS =
  "aeiouyɑ'əøɛœæɶɒɨɪɔɐʊɤɯаоиеёэыуюяàèìòùỳẁȁȅȉȍȕáéíóúýẃőűâêîôûŷŵäëïöüÿẅãẽĩõũỹąęįǫųāēīōūȳăĕĭŏŭǎěǐǒǔȧėȯẏẇạẹịọụỵẉḛḭṵṳ";
function vowel(c) {
  return VOWELS.includes(c);
}

function last(str) {
  return str && str.length ? str[str.length - 1] : "";
}

function ra(arr, rng) {
  if (!Array.isArray(arr) || !arr.length) return "";
  return arr[Math.floor(rng() * arr.length)];
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

        if (vowel(that) && that === next) break;
        if (v && vowel(name[c + 2])) break;
      }

      if (chain[prev] === undefined) chain[prev] = [];
      chain[prev].push(syllable);
    }
  }

  return chain;
}

function calculateMoraWideChainFromNames(names) {
  const chain = Object.create(null);
  chain[""] = [];

  const add = (key, value) => {
    if (!chain[key]) chain[key] = [];
    chain[key].push(value);
  };

  for (const raw of names) {
    const moras = tokenizeMorasWide(raw);
    if (!moras.length) continue;
    add("", moras[0]);
    for (let i = 0; i < moras.length - 1; i++) {
      add(last(moras[i]), moras[i + 1]);
    }
    add(last(moras[moras.length - 1]), "");
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

  if (!vowel(la) && la === fb && onsetSet.has(la)) {
    return a + b.slice(1);
  }

  if (vowel(la) && !vowel(fb) && onsetSet.has(fb)) {
    if (rng() < 0.7) return a + b.slice(1);
  }

  const laIsAscii = isAsciiLetter(la);
  const fbIsAscii = isAsciiLetter(fb);
  if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
    const r = rng();
    if (r < 0.6) return a + " " + b;
    if (r < 0.8) return a + "-" + b;
    return a + fb.toLowerCase() + b.slice(1);
  }

  if (vowel(la) && vowel(fb)) {
    return a + b.slice(1);
  }

  return a + b;
}

function generatePlainName(baseConfig, chain, rng, opts) {
  const minLen = typeof opts.min === "number" ? opts.min : baseConfig.min;
  const maxLen = typeof opts.max === "number" ? opts.max : baseConfig.max;
  const duplSet = typeof opts.dupl === "string" ? opts.dupl : baseConfig.d || "";

  function attempt() {
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
      if (c === d[i + 1] && !duplSet.includes(c)) return r;
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
      const seeds = (baseConfig.b || "")
        .split(",")
        .map(n => n.trim())
        .filter(Boolean);
      name = seeds.length ? ra(seeds, rng) : name;
    }

    return name;
  }

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

const CLICKS = "ǀǁǂǃ";
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

function generateFullUpgradeName(contexts, rng, opts) {
  const globalMin = opts.min;
  const globalMax = opts.max;
  const maxSegments = typeof opts.maxSegments === "number" && opts.maxSegments > 0 ? opts.maxSegments : 4;

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    opts && typeof opts.minUniqueBases === "number"
      ? Math.max(1, Math.min(opts.minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const fallbackMin = Math.min(...contexts.map(c => c.base.min || 4));
  const fallbackMax = Math.max(...contexts.map(c => c.base.max || fallbackMin + 4));

  const requestedMin = typeof globalMin === "number" ? globalMin : fallbackMin;
  const requestedMax = typeof globalMax === "number" ? globalMax : fallbackMax;
  const targetLen = (requestedMin + requestedMax) / 2;

  function buildOnce() {
    const segs = [];
    const usedBaseIdxs = new Set();
    let total = 0;
    let guard = 0;

    while ((total < requestedMin || usedBaseIdxs.size < requiredUniqueBases) && guard < maxSegments) {
      let ctx;
      if (requiredUniqueBases > 1 && usedBaseIdxs.size < requiredUniqueBases) {
        const unused = contexts.filter(c => !usedBaseIdxs.has(c.idx));
        ctx = unused.length ? unused[Math.floor(rng() * unused.length)] : contexts[Math.floor(rng() * contexts.length)];
      } else {
        ctx = contexts[Math.floor(rng() * contexts.length)];
      }

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
      if (stats && typeof stats.mean === "number") segMean = stats.mean;
      else if (typeof base.min === "number" && typeof base.max === "number") segMean = (base.min + base.max) / 2;
      else segMean = 4;

      const jitter = (rng() - 0.5) * 2;
      const jitteredMean = Math.max(2, segMean + jitter);

      const baseMax = typeof base.max === "number" ? base.max : Math.round(jitteredMean + 4);
      const segMin = Math.max(2, Math.min(Math.round(jitteredMean), baseMax));
      const segMax = Math.max(segMin + 1, Math.min(baseMax, Math.round(jitteredMean + 2)));

      const segText = generatePlainName(base, ctx.chain, rng, {
        min: segMin,
        max: segMax,
        dupl: base.d || ""
      });

      const shape = getSegmentShape(segText, ctx);
      segs.push({text: segText, ctx, shape});
      total += segText.length;
      usedBaseIdxs.add(ctx.idx);
      guard++;
    }

    if (!segs.length) {
      const ctx = contexts[Math.floor(rng() * contexts.length)];
      const base = ctx.base;
      const name = generatePlainName(base, ctx.chain, rng, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || ""
      });
      return {text: name, segInfos: [{text: name, ctx, shape: getSegmentShape(name, ctx)}]};
    }

    let compound = segs[0].text;
    for (let i = 1; i < segs.length; i++) {
      const seg = segs[i];
      compound = smoothJoin(compound, seg.text, seg.ctx.onsetSet, rng);
    }

    return {text: compound, segInfos: segs};
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
    const ctx = contexts[Math.floor(rng() * contexts.length)];
    const base = ctx.base;
    const name = generatePlainName(base, ctx.chain, rng, {
      min: requestedMin,
      max: requestedMax,
      dupl: base.d || ""
    });
    return {text: name, baseSeq: [ctx.idx], segTexts: [name]};
  }

  const baseSeq = Array.isArray(best.segInfos)
    ? best.segInfos.map(s => (s && s.ctx ? s.ctx.idx : undefined)).filter(x => x !== undefined)
    : [];
  const segTexts = Array.isArray(best.segInfos)
    ? best.segInfos.map(s => (s && typeof s.text === "string" ? s.text : "")).filter(Boolean)
    : [];
  return {text: best.text, baseSeq, segTexts};
}

function buildWeightedContexts(baseIndices, bases, weights) {
  const contexts = [];
  const normalized = Array.isArray(weights) && weights.length === baseIndices.length ? weights : baseIndices.map(() => 1);

  baseIndices.forEach((idx, i) => {
    const base = bases[idx];
    if (!base || !base.b) return;

    const chain = calculateChainFromBlob(base.b || "");
    if (!chain || chain[""] === undefined) return;

    const stats = computeSeedLengthStats(base.b || "");
    const onsetSet = classifyOnsets(base.b || "");
    const isClickHeavy = isClickHeavyLanguage(base.b || "");

    const w = Math.max(1, Math.floor(+normalized[i] || 1));
    for (let k = 0; k < w; k++) {
      contexts.push({idx, base, chain, stats, onsetSet, isClickHeavy});
    }
  });

  return contexts;
}

function runNextgenMixer({baseIndices, count, seed, min, max, maxSegments, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], baseSeqs: [], segTextLists: []};

  const names = [];
  const baseSeqs = [];
  const segTextLists = [];

  for (let i = 0; i < count; i++) {
    const res = generateFullUpgradeName(contexts, rng, {min, max, maxSegments, minUniqueBases});
    names.push(res.text);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
  }

  return {names, baseSeqs, segTextLists};
}

function buildCombinedNamesFromBaseIndices(baseIndices, bases, weights) {
  const combined = [];
  if (!Array.isArray(baseIndices) || !baseIndices.length) return combined;
  const normalized = Array.isArray(weights) && weights.length === baseIndices.length ? weights : baseIndices.map(() => 1);

  baseIndices.forEach((idx, i) => {
    const base = bases[idx];
    if (!base || !base.b) return;
    const names = String(base.b)
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (!names.length) return;

    const w = Math.max(1, Math.floor(+normalized[i] || 1));
    for (let k = 0; k < w; k++) combined.push(...names);
  });

  return combined;
}

function calculateMixedChainFromBaseIndices(baseIndices, bases, weights) {
  const combinedNames = buildCombinedNamesFromBaseIndices(baseIndices, bases, weights);
  if (!combinedNames.length) return null;
  return calculateChainFromBlob(combinedNames.join(","));
}

function tokenizeMoras(text) {
  const s = String(text || "").trim();
  if (!s) return [];

  const vowels = new Set(["a", "e", "i", "o", "u", "y"]);
  const moras = [];
  let buf = "";

  for (const chRaw of s) {
    const ch = chRaw;
    const lower = ch.toLowerCase();
    const isAsciiLetter = lower >= "a" && lower <= "z";
    const isVowel = isAsciiLetter && vowels.has(lower);

    if (!isAsciiLetter) {
      if (buf) {
        moras.push(buf);
        buf = "";
      }
      moras.push(ch);
      continue;
    }

    buf += ch;
    if (isVowel) {
      moras.push(buf);
      buf = "";
    }
  }

  if (buf) moras.push(buf);
  return moras.filter(Boolean);
}

function tokenizeMorasWide(text) {
  const s = String(text || "").trim();
  if (!s) return [];

  const isCombiningMark = ch => /\p{M}/u.test(ch);
  const isLetter = ch => /\p{L}/u.test(ch);
  const isVowel = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);

  const moras = [];
  let buf = "";
  let vowelSeen = false;

  for (const ch of s) {
    if (isCombiningMark(ch)) {
      if (buf) buf += ch;
      continue;
    }

    if (!isLetter(ch)) {
      if (buf) {
        moras.push(buf);
        buf = "";
        vowelSeen = false;
      }
      moras.push(ch);
      continue;
    }

    if (vowelSeen) {
      moras.push(buf);
      buf = "";
      vowelSeen = false;
    }

    buf += ch;
    if (isVowel(ch)) vowelSeen = true;
  }

  if (buf) moras.push(buf);
  return moras.filter(Boolean);
}

function calculateMoraChainFromNames(names) {
  const chain = Object.create(null);
  chain[""] = [];

  const add = (key, value) => {
    if (!chain[key]) chain[key] = [];
    chain[key].push(value);
  };

  for (const raw of names) {
    const moras = tokenizeMoras(raw);
    if (!moras.length) continue;
    add("", moras[0]);
    for (let i = 0; i < moras.length - 1; i++) {
      add(last(moras[i]), moras[i + 1]);
    }
    add(last(moras[moras.length - 1]), "");
  }

  return chain;
}

function calculateMoraChainFromBlob(blob) {
  const names = String(blob || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return calculateMoraChainFromNames(names);
}

function calculateMoraWideChainFromBlob(blob) {
  const names = String(blob || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return calculateMoraWideChainFromNames(names);
}

function calculateMixedMoraChainFromBaseIndices(baseIndices, bases, weights) {
  const combinedNames = buildCombinedNamesFromBaseIndices(baseIndices, bases, weights);
  if (!combinedNames.length) return null;
  return calculateMoraChainFromNames(combinedNames);
}

function calculateMixedMoraWideChainFromBaseIndices(baseIndices, bases, weights) {
  const combinedNames = buildCombinedNamesFromBaseIndices(baseIndices, bases, weights);
  if (!combinedNames.length) return null;
  return calculateMoraWideChainFromNames(combinedNames);
}

function generateFromChainWithChunkCapture(chain, rng, opts) {
  if (!chain || chain[""] === undefined) return {text: "", segTexts: []};
  const minLen = typeof opts.min === "number" ? opts.min : 4;
  const maxLen = typeof opts.max === "number" ? opts.max : Math.max(minLen + 4, 10);
  const duplSet = typeof opts.dupl === "string" ? opts.dupl : "";

  function attempt() {
    let v = chain[""];
    let cur = ra(v, rng);
    let w = "";
    let segs = [];

    for (let i = 0; i < 20; i++) {
      if (cur === "") {
        if (w.length < minLen) {
          w = "";
          segs = [];
          v = chain[""];
          cur = ra(v, rng);
          continue;
        }
        break;
      }

      if (w.length + cur.length > maxLen) {
        if (w.length < minLen) {
          segs.push(cur);
          w += cur;
        }
        break;
      }

      segs.push(cur);
      w += cur;
      v = chain[last(cur)] || chain[""];
      cur = ra(v, rng);
    }

    const l = last(w);
    if (l === "'" || l === " " || l === "-") {
      w = w.slice(0, -1);
      if (segs.length) segs = segs.slice(0, -1);
    }

    let name = [...w].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !duplSet.includes(c)) return r;
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

    return {text: name, segTexts: segs};
  }

  let best = null;
  let bestDelta = Infinity;
  const target = (minLen + maxLen) / 2;
  for (let i = 0; i < 5; i++) {
    const candidate = attempt();
    const len = candidate.text.length;
    if (len >= minLen && len <= maxLen) return candidate;
    const delta = Math.abs(len - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate;
    }
  }

  return best || attempt();
}

function pickUniqueBasesFromContexts(contexts, rng, minUniqueBases) {
  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const required =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const chosen = [];
  const used = new Set();
  let guard = 0;
  while (used.size < required && guard < 50) {
    const ctx = contexts[Math.floor(rng() * contexts.length)];
    if (ctx && ctx.idx !== undefined) used.add(ctx.idx);
    guard++;
  }
  used.forEach(x => chosen.push(x));
  return chosen;
}

function runNextgenSyllableChain({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    const chain = calculateMixedChainFromBaseIndices(chosenBases, bases, chosenBases.map(() => 1));

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);

    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    const res = generateFromChainWithChunkCapture(chain, rng, {min: requestedMin, max: requestedMax, dupl: ""});
    names.push(res.text);

    const segs = Array.isArray(res.segTexts) ? res.segTexts.filter(s => typeof s === "string" && s.length) : [];
    segTextLists.push(segs);

    const baseSeq = attributeLegacySegsToBases(segs, chosenBases, bases);
    baseSeqs.push(baseSeq);
  }

  return {names, segTextLists, baseSeqs};
}

function runNextgenMoraWideChain({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    const chain = calculateMixedMoraWideChainFromBaseIndices(chosenBases, bases, chosenBases.map(() => 1));

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);

    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    const res = generateFromChainWithChunkCapture(chain, rng, {min: requestedMin, max: requestedMax, dupl: ""});
    names.push(res.text);

    const segs = Array.isArray(res.segTexts) ? res.segTexts.filter(s => typeof s === "string" && s.length) : [];
    segTextLists.push(segs);

    const baseSeq = attributeSegsToBasesByChain(segs, chosenBases, idx => {
      const base = bases[idx];
      const blob = base && typeof base.b === "string" ? base.b : "";
      return calculateMoraWideChainFromBlob(blob);
    });
    baseSeqs.push(baseSeq);
  }

  return {names, segTextLists, baseSeqs};
}

function runNextgenMoraChain({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    const chain = calculateMixedMoraChainFromBaseIndices(chosenBases, bases, chosenBases.map(() => 1));

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);

    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    const res = generateFromChainWithChunkCapture(chain, rng, {min: requestedMin, max: requestedMax, dupl: ""});
    names.push(res.text);

    const segs = Array.isArray(res.segTexts) ? res.segTexts.filter(s => typeof s === "string" && s.length) : [];
    segTextLists.push(segs);

    const baseSeq = attributeSegsToBasesByChain(segs, chosenBases, idx => {
      const base = bases[idx];
      const blob = base && typeof base.b === "string" ? base.b : "";
      return calculateMoraChainFromBlob(blob);
    });
    baseSeqs.push(baseSeq);
  }

  return {names, segTextLists, baseSeqs};
}

function computeLengthStats(samples) {
  const lengths = samples
    .map(s => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .map(s => s.length);

  const count = lengths.length;
  if (!count) return {count: 0};

  lengths.sort((a, b) => a - b);
  const minLen = lengths[0];
  const maxLen = lengths[count - 1];
  const sum = lengths.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const q = p => lengths[Math.floor(p * (count - 1))];

  return {count, minLen, maxLen, mean, p25: q(0.25), p75: q(0.75), p90: q(0.9)};
}

function parseArgs(argv) {
  const args = argv.slice(2);

  function getValue(prefix) {
    const arg = args.find(a => a.startsWith(prefix + "="));
    return arg ? arg.slice(prefix.length + 1) : null;
  }

  const iso = getValue("--iso");
  const baseArg = null;
  const countArg = getValue("--count");
  const seedArg = getValue("--seed");
  const minArg = getValue("--min");
  const maxArg = getValue("--max");
  const maxSegmentsArg = getValue("--max-segments");
  const weightsArg = getValue("--weights");
  const minUniqueBasesArg = getValue("--min-unique-bases");

  function collectCsvAfter(prefixes) {
    let collected = null;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const isMatchEq = prefixes.some(p => a.startsWith(p + "="));
      const isMatchBare = prefixes.some(p => a === p);
      if (!isMatchEq && !isMatchBare) continue;

      if (isMatchEq) {
        const p = prefixes.find(p0 => a.startsWith(p0 + "="));
        collected = a.slice(p.length + 1);
      } else {
        collected = args[i + 1] || "";
        i++;
      }

      // PowerShell can split on commas: tolerate trailing pieces as separate args
      while (i + 1 < args.length && typeof args[i + 1] === "string" && !args[i + 1].startsWith("--")) {
        collected += "," + args[i + 1];
        i++;
      }
      break;
    }
    return collected;
  }

  const baseCsv = collectCsvAfter(["--base"]);

  const baseIndices = baseCsv
    ? baseCsv
        .split(/[\s,]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseInt(s, 10))
        .filter(n => !Number.isNaN(n))
    : [];

  const weights = weightsArg
    ? weightsArg
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseInt(s, 10))
    : null;

  const count = countArg ? parseInt(countArg, 10) : 40;
  const seed = seedArg != null ? parseInt(seedArg, 10) : null;
  const min = minArg != null ? parseInt(minArg, 10) : null;
  const max = maxArg != null ? parseInt(maxArg, 10) : null;
  const maxSegments = maxSegmentsArg != null ? parseInt(maxSegmentsArg, 10) : 4;
  const minUniqueBases = minUniqueBasesArg != null ? parseInt(minUniqueBasesArg, 10) : null;

  const help = args.includes("--help") || args.includes("-h");

  return {iso, baseIndices, count, seed, min, max, maxSegments, weights, minUniqueBases, help};
}

function printUsage() {
  console.log("Usage: node tools/mixer-core/compare-mixer-nextgen-to-app.js [options]\n");
  console.log("Options:");
  console.log("  --iso=ID              Use mixer-map bases for ISO (e.g. amkoe).");
  console.log("  --base=IDX[,IDX...]   Compare directly from base indices.");
  console.log("  --count=N             Number of samples per generator (default 40).");
  console.log("  --seed=INT            Seed for deterministic output.");
  console.log("  --min=INT             Override minimum length.");
  console.log("  --max=INT             Override maximum length.");
  console.log("  --max-segments=N      Segment cap for current app + nextgen (default 4).");
  console.log("  --min-unique-bases=N  Require at least N unique bases per generated name (default: 2 if multiple bases).");
  console.log("  --weights=a,b,c       Optional weights for base selection.");
  console.log("Examples:");
  console.log("  node tools/mixer-core/compare-mixer-nextgen-to-app.js --iso=amkoe --count=40 --seed=1");
  console.log("  node tools/mixer-core/compare-mixer-nextgen-to-app.js --base=353,354 --count=40 --seed=42 --min=15 --max=50");
}

function main() {
  const {iso, baseIndices, count, seed, min, max, maxSegments, weights, minUniqueBases, help} = parseArgs(process.argv);
  if (help || (!iso && (!baseIndices || !baseIndices.length))) {
    printUsage();
    return;
  }

  let indices = baseIndices;
  if (iso) {
    const map = readJson("config/language-mixer-map.json");
    const byIso = new Map(map.map(e => [e.iso, e]));
    const entry = byIso.get(iso);
    if (!entry || !Array.isArray(entry.bases) || !entry.bases.length) {
      console.error("No base mapping found for iso=", iso);
      process.exitCode = 1;
      return;
    }
    indices = entry.bases;
  }

  const uniqueIndexCount = Array.from(new Set(indices)).length;
  const effectiveMinUniqueBases =
    typeof minUniqueBases === "number" && !Number.isNaN(minUniqueBases)
      ? minUniqueBases
      : uniqueIndexCount > 1
        ? 2
        : 1;

  const legacySamples = runAppMixer({
    baseIndices: indices,
    count,
    seed,
    min,
    max,
    maxSegments,
    weights,
    legacyChain: true
  });

  const currentSamples = runAppMixer({
    baseIndices: indices,
    count,
    seed,
    min,
    max,
    maxSegments,
    weights,
    minUniqueBases: effectiveMinUniqueBases,
    legacyChain: false
  });

  const nextgen = runNextgenMixer({
    baseIndices: indices,
    count,
    seed,
    min,
    max,
    maxSegments,
    weights,
    minUniqueBases: effectiveMinUniqueBases
  });

  const nextgenSyllable = runNextgenSyllableChain({
    baseIndices: indices,
    count,
    seed,
    min,
    max,
    weights,
    minUniqueBases: effectiveMinUniqueBases
  });

  const legacy = normalizeCapturedSamples(legacySamples);
  const bases = loadDefaultNameBases();
  const current = normalizeCapturedSamples(currentSamples);
  const nextgenSamples = nextgen.names.map((text, i) => ({
    text,
    baseSeq: Array.isArray(nextgen.baseSeqs) ? nextgen.baseSeqs[i] || [] : []
  }));

  const nextgenSegs = Array.isArray(nextgen.segTextLists) ? nextgen.segTextLists : [];
  nextgenSamples.forEach((row, i) => {
    row.segTexts = Array.isArray(nextgenSegs[i]) ? nextgenSegs[i] : [];
  });

  const nextgenSyllSamples = nextgenSyllable.names.map((text, i) => ({
    text,
    baseSeq: Array.isArray(nextgenSyllable.baseSeqs) ? nextgenSyllable.baseSeqs[i] || [] : [],
    segTexts: Array.isArray(nextgenSyllable.segTextLists) ? nextgenSyllable.segTextLists[i] || [] : []
  }));

  legacy.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases, {forceAttribution: true}));
  current.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  nextgenSamples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  nextgenSyllSamples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));

  console.log(`Compared mixers for ${iso ? "iso=" + iso : "bases=" + indices.join(",")}`);
  console.log("");

  const lines = Math.min(10, count);
  console.log("=== Sample diff (first 10) ===");

  function fmtSegs(segTexts) {
    if (!Array.isArray(segTexts) || !segTexts.length) return "";
    return segTexts.map(s => `[${s}]`).join("");
  }

  function fmtSeq(seq) {
    if (!Array.isArray(seq) || !seq.length) return "";
    return " " + seq.map(b => `[${b}]`).join(" ");
  }

  for (let i = 0; i < lines; i++) {
    const legacyRow = legacy[i] || {text: "", baseSeq: [], segTexts: []};
    const curRow = current[i] || {text: "", baseSeq: [], segTexts: []};
    const ngRow = nextgenSamples[i] || {text: "", baseSeq: [], segTexts: []};
    const ngSylRow = nextgenSyllSamples[i] || {text: "", baseSeq: [], segTexts: []};
    console.log(`#${i + 1}`);

    console.log(`  legacy:`);
    console.log(`    segs: ${fmtSegs(legacyRow.segTexts)}`);
    console.log(`    name: ${legacyRow.text || ""}${fmtSeq(legacyRow.baseSeq)}`);

    console.log(`  current:`);
    console.log(`    segs: ${fmtSegs(curRow.segTexts)}`);
    console.log(`    name: ${curRow.text || ""}${fmtSeq(curRow.baseSeq)}`);

    console.log(`  nextgen:`);
    console.log(`    segs: ${fmtSegs(ngRow.segTexts)}`);
    console.log(`    name: ${ngRow.text || ""}${fmtSeq(ngRow.baseSeq)}`);

    console.log(`  nextgenSyll:`);
    console.log(`    segs: ${fmtSegs(ngSylRow.segTexts)}`);
    console.log(`    name: ${ngSylRow.text || ""}${fmtSeq(ngSylRow.baseSeq)}`);
  }

  console.log("");

  const legacyTexts = legacy.map(s => s.text);
  const currentTexts = current.map(s => s.text);
  const nextgenTexts = nextgenSamples.map(s => s.text);
  const nextgenSyllTexts = nextgenSyllSamples.map(s => s.text);

  const legacyStats = computeLengthStats(legacyTexts);
  const currentStats = computeLengthStats(currentTexts);
  const nextgenStats = computeLengthStats(nextgenTexts);
  const nextgenSyllStats = computeLengthStats(nextgenSyllTexts);

  console.log("=== App legacyChain ===");
  console.log(
    `count=${legacyStats.count} min=${legacyStats.minLen} max=${legacyStats.maxLen} mean=${legacyStats.mean?.toFixed?.(2)}`
  );
  console.log(`unique names: ${new Set(legacyTexts).size}/${legacyTexts.length}`);
  console.log("");

  console.log("=== App current ===");
  console.log(
    `count=${currentStats.count} min=${currentStats.minLen} max=${currentStats.maxLen} mean=${currentStats.mean?.toFixed?.(2)}`
  );
  console.log(`unique names: ${new Set(currentTexts).size}/${currentTexts.length}`);
  console.log("");

  console.log("=== Helper-only nextgen ===");
  console.log(
    `count=${nextgenStats.count} min=${nextgenStats.minLen} max=${nextgenStats.maxLen} mean=${nextgenStats.mean?.toFixed?.(2)}`
  );
  console.log(`unique names: ${new Set(nextgenTexts).size}/${nextgenTexts.length}`);
  console.log("");

  console.log("=== Helper-only nextgenSyll ===");
  console.log(
    `count=${nextgenSyllStats.count} min=${nextgenSyllStats.minLen} max=${nextgenSyllStats.maxLen} mean=${nextgenSyllStats.mean?.toFixed?.(2)}`
  );
  console.log(`unique names: ${new Set(nextgenSyllTexts).size}/${nextgenSyllTexts.length}`);
  console.log("");

  const overlap = (a, b) => {
    const setB = new Set(b);
    return a.filter(x => setB.has(x)).length;
  };

  console.log(`overlap legacy ↔ current (exact) = ${overlap(legacyTexts, currentTexts)}/${count}`);
  console.log(`overlap legacy ↔ nextgen (exact) = ${overlap(legacyTexts, nextgenTexts)}/${count}`);
  console.log(`overlap current ↔ nextgen (exact) = ${overlap(currentTexts, nextgenTexts)}/${count}`);
  console.log(`overlap legacy ↔ nextgenSyll (exact) = ${overlap(legacyTexts, nextgenSyllTexts)}/${count}`);
  console.log(`overlap current ↔ nextgenSyll (exact) = ${overlap(currentTexts, nextgenSyllTexts)}/${count}`);
  console.log(`overlap nextgen ↔ nextgenSyll (exact) = ${overlap(nextgenTexts, nextgenSyllTexts)}/${count}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error while comparing mixers:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}
