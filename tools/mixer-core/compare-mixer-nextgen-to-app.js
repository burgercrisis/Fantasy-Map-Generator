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

function normalizeForRealism(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function buildSeedCorpusFromBases(indices, bases) {
  const uniq = Array.from(new Set(Array.isArray(indices) ? indices : []));
  const out = [];
  for (const idx of uniq) {
    const base = bases && bases[idx];
    const blob = base && typeof base.b === "string" ? base.b : "";
    if (!blob) continue;
    const parts = blob
      .split(",")
      .map(s => normalizeForRealism(s))
      .filter(Boolean);
    for (const p of parts) out.push(p);
  }
  return out;
}

function buildCharGramCounts(texts, n) {
  const counts = new Map();
  let total = 0;
  const nn = typeof n === "number" && n > 0 ? n : 3;
  const pad = "^".repeat(Math.max(0, nn - 1));
  for (const raw of Array.isArray(texts) ? texts : []) {
    const text = normalizeForRealism(raw);
    if (!text) continue;
    const s = pad + text + "$";
    if (s.length < nn) continue;
    for (let i = 0; i <= s.length - nn; i++) {
      const g = s.slice(i, i + nn);
      counts.set(g, (counts.get(g) || 0) + 1);
      total++;
    }
  }
  return {counts, total};
}

function buildCharLm(texts, n) {
  const contexts = new Map();
  const contextTotals = new Map();
  const vocab = new Set();
  const nn = typeof n === "number" && n > 1 ? n : 3;
  const ctxLen = nn - 1;
  const pad = "^".repeat(ctxLen);

  for (const raw of Array.isArray(texts) ? texts : []) {
    const text = normalizeForRealism(raw);
    if (!text) continue;
    for (const ch of text) vocab.add(ch);
    const s = pad + text + "$";
    if (s.length < nn) continue;
    for (let i = ctxLen; i < s.length; i++) {
      const ctx = s.slice(i - ctxLen, i);
      const ch = s[i];
      if (!contexts.has(ctx)) contexts.set(ctx, new Map());
      const row = contexts.get(ctx);
      row.set(ch, (row.get(ch) || 0) + 1);
      contextTotals.set(ctx, (contextTotals.get(ctx) || 0) + 1);
    }
  }

  const vocabSize = vocab.size + 1;

  function scoreBpc(raw) {
    const text = normalizeForRealism(raw);
    if (!text) return {bpc: null, chars: 0, oovChars: 0};
    const s = pad + text + "$";
    let bits = 0;
    let chars = 0;
    let oovChars = 0;
    for (let i = ctxLen; i < s.length; i++) {
      const ctx = s.slice(i - ctxLen, i);
      const ch = s[i];
      const row = contexts.get(ctx);
      const seen = row ? row.get(ch) || 0 : 0;
      const denom = (contextTotals.get(ctx) || 0) + vocabSize;
      const prob = (seen + 1) / denom;
      bits += -Math.log2(prob);
      chars++;
      if (!vocab.has(ch) && ch !== "^" && ch !== "$" && ch !== " ") oovChars++;
    }
    return {bpc: chars ? bits / chars : null, chars, oovChars};
  }

  return {scoreBpc, vocabSize};
}

function computeJsDivergenceFromCounts(aCounts, aTotal, bCounts, bTotal) {
  const keys = new Set();
  for (const k of aCounts.keys()) keys.add(k);
  for (const k of bCounts.keys()) keys.add(k);
  const v = keys.size || 1;
  const denomA = (aTotal || 0) + v;
  const denomB = (bTotal || 0) + v;
  let js = 0;
  for (const k of keys) {
    const pa = ((aCounts.get(k) || 0) + 1) / denomA;
    const pb = ((bCounts.get(k) || 0) + 1) / denomB;
    const m = (pa + pb) / 2;
    js += 0.5 * (pa * Math.log2(pa / m) + pb * Math.log2(pb / m));
  }
  return js;
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
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);
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

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV19({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  const seedNames = buildSeedCorpusFromBases(baseUniverse, bases);
  const seedNorm = seedNames.map(normalizeForRealism).filter(Boolean);
  const seedSet = new Set(seedNorm);
  const lm = buildCharLm(seedNorm, 3);
  const seedGram = buildCharGramCounts(seedNorm, 3);

  const topSeedKeys = Array.from(seedGram.counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1200)
    .map(([k]) => k);

  let seedBits = 0;
  let seedChars = 0;
  for (const s of seedNorm) {
    const {bpc, chars} = lm.scoreBpc(s);
    if (typeof bpc !== "number" || !Number.isFinite(bpc) || !chars) continue;
    seedBits += bpc * chars;
    seedChars += chars;
  }
  const seedBpcMean = seedChars ? seedBits / seedChars : null;
  const seedBpcTarget = typeof seedBpcMean === "number" && Number.isFinite(seedBpcMean) ? seedBpcMean + 0.08 : null;

  const REALISM_LAMBDA = 4;
  const JS_LAMBDA = 8;
  const COPY_PENALTY = 12;
  const DUPLICATE_PENALTY = 8;

  const seenGenerated = new Map();

  const baseChainCache = new Map(
    baseUniverse.map(idx => {
      const base = bases[idx];
      const blob = base && typeof base.b === "string" ? base.b : "";
      return [idx, calculateChainFromBlob(blob)];
    })
  );

  const jsLimited = (aCounts, aTotal, bCounts, bTotal, keys) => {
    const keySet = new Set(Array.isArray(keys) ? keys : []);
    for (const k of bCounts.keys()) keySet.add(k);
    const v = keySet.size || 1;
    const denomA = (aTotal || 0) + v;
    const denomB = (bTotal || 0) + v;
    let js = 0;
    for (const k of keySet) {
      const pa = ((aCounts.get(k) || 0) + 1) / denomA;
      const pb = ((bCounts.get(k) || 0) + 1) / denomB;
      const m = (pa + pb) / 2;
      js += 0.5 * (pa * Math.log2(pa / m) + pb * Math.log2(pb / m));
    }
    return js;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChainCache.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChainCache.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin;
    const requestedMax = typeof max === "number" ? max : fallbackMax;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    const diversityTarget = Math.max(1, Math.min(requiredUniqueBases, chosenBases.length));

    for (let t = 0; t < 12; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const outOfRange = len < requestedMin || len > requestedMax;
      const rangePenalty = outOfRange ? 25 : 0;

      const diversityScore = Math.min(1, candidate.usedBasesCount / diversityTarget);
      const diversityBonus = 1.25 * diversityScore;

      const norm = normalizeForRealism(candidate.text);
      const {bpc} = lm.scoreBpc(norm);
      const realismDelta =
        typeof bpc === "number" && typeof seedBpcTarget === "number" && Number.isFinite(bpc) && Number.isFinite(seedBpcTarget)
          ? REALISM_LAMBDA * (bpc - seedBpcTarget)
          : 0;

      const candGram = norm ? buildCharGramCounts([norm], 3) : {counts: new Map(), total: 0};
      const js = jsLimited(seedGram.counts, seedGram.total, candGram.counts, candGram.total, topSeedKeys);
      const jsPenalty = typeof js === "number" && Number.isFinite(js) ? JS_LAMBDA * js : 0;

      const copyPenalty = norm && seedSet.has(norm) ? COPY_PENALTY : 0;
      const seenCount = norm ? (seenGenerated.get(norm) || 0) : 0;
      const dupPenalty = seenCount ? DUPLICATE_PENALTY * Math.min(3, seenCount) : 0;

      const delta = Math.abs(len - target) + rangePenalty - diversityBonus + realismDelta + jsPenalty + copyPenalty + dupPenalty;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);

    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);

    const norm = normalizeForRealism(res.text);
    if (norm) seenGenerated.set(norm, (seenGenerated.get(norm) || 0) + 1);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV18({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  const seedNames = buildSeedCorpusFromBases(baseUniverse, bases);
  const seedNorm = seedNames.map(normalizeForRealism).filter(Boolean);
  const seedSet = new Set(seedNorm);
  const lm = buildCharLm(seedNorm, 3);

  let seedBits = 0;
  let seedChars = 0;
  for (const s of seedNorm) {
    const {bpc, chars} = lm.scoreBpc(s);
    if (typeof bpc !== "number" || !Number.isFinite(bpc) || !chars) continue;
    seedBits += bpc * chars;
    seedChars += chars;
  }
  const seedBpcMean = seedChars ? seedBits / seedChars : null;
  const seedBpcTarget = typeof seedBpcMean === "number" && Number.isFinite(seedBpcMean) ? seedBpcMean + 0.15 : null;

  const REALISM_LAMBDA = 3;
  const COPY_PENALTY = 12;
  const DUPLICATE_PENALTY = 8;

  const seenGenerated = new Map();

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin;
    const requestedMax = typeof max === "number" ? max : fallbackMax;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    const diversityTarget = Math.max(1, Math.min(requiredUniqueBases, chosenBases.length));

    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const outOfRange = len < requestedMin || len > requestedMax;
      const rangePenalty = outOfRange ? 25 : 0;

      const diversityScore = Math.min(1, candidate.usedBasesCount / diversityTarget);
      const diversityBonus = 1.25 * diversityScore;

      const norm = normalizeForRealism(candidate.text);
      const {bpc} = lm.scoreBpc(norm);
      const realismDelta =
        typeof bpc === "number" && typeof seedBpcTarget === "number" && Number.isFinite(bpc) && Number.isFinite(seedBpcTarget)
          ? REALISM_LAMBDA * (bpc - seedBpcTarget)
          : 0;

      const copyPenalty = norm && seedSet.has(norm) ? COPY_PENALTY : 0;
      const seenCount = norm ? (seenGenerated.get(norm) || 0) : 0;
      const dupPenalty = seenCount ? DUPLICATE_PENALTY * Math.min(3, seenCount) : 0;

      const delta = Math.abs(len - target) + rangePenalty - diversityBonus + realismDelta + copyPenalty + dupPenalty;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);

    const norm = normalizeForRealism(res.text);
    if (norm) seenGenerated.set(norm, (seenGenerated.get(norm) || 0) + 1);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV17({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  const seedNames = buildSeedCorpusFromBases(baseUniverse, bases);
  const seedNorm = seedNames.map(normalizeForRealism).filter(Boolean);
  const seedSet = new Set(seedNorm);
  const lm = buildCharLm(seedNorm, 3);

  let seedBits = 0;
  let seedChars = 0;
  for (const s of seedNorm) {
    const {bpc, chars} = lm.scoreBpc(s);
    if (typeof bpc !== "number" || !Number.isFinite(bpc) || !chars) continue;
    seedBits += bpc * chars;
    seedChars += chars;
  }
  const seedBpcMean = seedChars ? seedBits / seedChars : null;
  const seedBpcThreshold = typeof seedBpcMean === "number" && Number.isFinite(seedBpcMean) ? seedBpcMean + 0.35 : null;

  const REALISM_LAMBDA = 1.2;
  const COPY_PENALTY = 8;
  const DUPLICATE_PENALTY = 6;

  const seenGenerated = new Map();
  const updateBpcBaseline = bpc => {
    void bpc;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin;
    const requestedMax = typeof max === "number" ? max : fallbackMax;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    const diversityTarget = Math.max(1, Math.min(requiredUniqueBases, chosenBases.length));

    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const outOfRange = len < requestedMin || len > requestedMax;
      const rangePenalty = outOfRange ? 25 : 0;

      const diversityScore = Math.min(1, candidate.usedBasesCount / diversityTarget);
      const diversityBonus = 1.25 * diversityScore;

      const norm = normalizeForRealism(candidate.text);
      const {bpc} = lm.scoreBpc(norm);
      const realismPenalty =
        typeof bpc === "number" && typeof seedBpcThreshold === "number" && Number.isFinite(bpc) && Number.isFinite(seedBpcThreshold)
          ? REALISM_LAMBDA * Math.max(0, bpc - seedBpcThreshold)
          : 0;

      const copyPenalty = norm && seedSet.has(norm) ? COPY_PENALTY : 0;
      const seenCount = norm ? (seenGenerated.get(norm) || 0) : 0;
      const dupPenalty = seenCount ? DUPLICATE_PENALTY * Math.min(3, seenCount) : 0;

      const delta = Math.abs(len - target) + rangePenalty - diversityBonus + realismPenalty + copyPenalty + dupPenalty;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);

    const norm = normalizeForRealism(res.text);
    if (norm) {
      seenGenerated.set(norm, (seenGenerated.get(norm) || 0) + 1);
      const {bpc} = lm.scoreBpc(norm);
      updateBpcBaseline(bpc);
    }
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV12({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV13({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin;
    const requestedMax = typeof max === "number" ? max : fallbackMax;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV14({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin;
    const requestedMax = typeof max === "number" ? max : fallbackMax;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV15({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin;
    const requestedMax = typeof max === "number" ? max : fallbackMax;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    const diversityTarget = Math.max(1, Math.min(requiredUniqueBases, chosenBases.length));
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      if (len >= requestedMin && len <= requestedMax) {
        best = candidate;
        break;
      }

      const diversityScore = Math.min(1, candidate.usedBasesCount / diversityTarget);
      const diversityBonus = 1.25 * diversityScore;
      const delta = Math.abs(len - target) - diversityBonus;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV16({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);

    const poolSize = chosenBases.length;
    const poolScale = poolSize <= 1 ? 1 : 1 + Math.min(0.6, 0.15 * Math.log2(poolSize));
    const requestedMin = typeof min === "number" ? min : Math.max(1, Math.round(fallbackMin * poolScale));
    const requestedMax = typeof max === "number" ? max : Math.max(requestedMin, Math.round(fallbackMax * poolScale));

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguistic({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const pickDifferentBase = (choices, current) => {
    const others = Array.isArray(choices) ? choices.filter(x => x !== current) : [];
    if (!others.length) return current;
    return others[Math.floor(rng() * others.length)];
  };

  const pickNextSegFromBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";

    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty = boundaryPenalty(prevSeg, best);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
    const maxSegs = 20;
    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";
      const prevBase = baseSeq.length ? baseSeq[baseSeq.length - 1] : null;
      const prevCtx = prevBase != null ? ctxByIdx.get(prevBase) : null;

      if (chosenBases.length > 1 && i > 0) {
        const switchProb = 0.22;
        if (rng() < switchProb) {
          const nextBase = pickDifferentBase(chosenBases, currentBase);
          const nextCtx = ctxByIdx.get(nextBase);
          const p = baseSwitchPenalty(prevCtx, nextCtx);
          if (p < 3 || rng() < 0.2) currentBase = nextBase;
        }
      }

      const ctx = ctxByIdx.get(currentBase);
      const chain = baseChains.get(currentBase);
      const cur = pickNextSegFromBase(chain, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") usedBases.add(currentBase);
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") usedBases.add(currentBase);
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);

    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
    usedBasesCounts.push(typeof res.usedBasesCount === "number" ? res.usedBasesCount : 0);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList, usedBasesCounts};
}

function runNextgenSyllableLinguisticV7({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const pickDifferentBase = (choices, current) => {
    const others = Array.isArray(choices) ? choices.filter(x => x !== current) : [];
    if (!others.length) return current;
    return others[Math.floor(rng() * others.length)];
  };

  const pickNextSegFromBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";

    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty = boundaryPenalty(prevSeg, best);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
    let lastNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 20;
    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";
      const prevBase = baseSeq.length ? baseSeq[baseSeq.length - 1] : null;
      const prevCtx = prevBase != null ? ctxByIdx.get(prevBase) : null;

      if (chosenBases.length > 1 && i > 0) {
        const baseSwitchBaseProb = 0.12;
        const baseSwitchRamp = 0.18;
        const baseSwitchCap = 0.85;
        const effectiveRun = runLen > 0 ? runLen : 1;
        let switchProb = baseSwitchBaseProb + baseSwitchRamp * Math.max(0, effectiveRun - 1);
        if (switchProb > baseSwitchCap) switchProb = baseSwitchCap;
        if (effectiveRun >= 4) switchProb = 1;

        if (rng() < switchProb) {
          const nextBase = pickDifferentBase(chosenBases, currentBase);
          const nextCtx = ctxByIdx.get(nextBase);
          const p = baseSwitchPenalty(prevCtx, nextCtx);
          if (p < 3 || rng() < 0.2) currentBase = nextBase;
        }
      }

      const ctx = ctxByIdx.get(currentBase);
      const chain = baseChains.get(currentBase);
      const cur = pickNextSegFromBase(chain, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          lastNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          lastNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV8({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const pickNextSegFromBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";

    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty = boundaryPenalty(prevSeg, best);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.5 + 0.5 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const pickWeightedDifferentBase = (choices, current, prevBase) => {
    const others = Array.isArray(choices) ? choices.filter(x => x !== current) : [];
    if (!others.length) return current;

    const prevCtx = prevBase != null ? ctxByIdx.get(prevBase) : null;
    const weights = others.map(idx => {
      const nextCtx = ctxByIdx.get(idx);
      let w = 1;
      if (baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
      w *= onsetOverlapScore(prevCtx, nextCtx);
      return w;
    });

    const picked = weightedPick(others, weights);
    return picked == null ? current : picked;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
    let lastNonSpacerBase = null;
    let runLen = 0;

    const maxSegs = 20;
    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";
      const prevBase = baseSeq.length ? baseSeq[baseSeq.length - 1] : null;
      const prevCtx = prevBase != null ? ctxByIdx.get(prevBase) : null;

      if (chosenBases.length > 1 && i > 0) {
        const baseSwitchBaseProb = 0.12;
        const baseSwitchRamp = 0.18;
        const baseSwitchCap = 0.85;
        const effectiveRun = runLen > 0 ? runLen : 1;
        let switchProb = baseSwitchBaseProb + baseSwitchRamp * Math.max(0, effectiveRun - 1);
        if (switchProb > baseSwitchCap) switchProb = baseSwitchCap;
        if (effectiveRun >= 4) switchProb = 1;

        if (rng() < switchProb) {
          const nextBase = pickWeightedDifferentBase(chosenBases, currentBase, lastNonSpacerBase);
          const nextCtx = ctxByIdx.get(nextBase);
          const p = baseSwitchPenalty(prevCtx, nextCtx);
          if (p < 3 || rng() < 0.2) currentBase = nextBase;
        }
      }

      const ctx = ctxByIdx.get(currentBase);
      const chain = baseChains.get(currentBase);
      const cur = pickNextSegFromBase(chain, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          lastNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          lastNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV9({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const pickNextSegFromBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";

    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty = boundaryPenalty(prevSeg, best);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.5 + 0.5 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 20;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        let w = 1;

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.7;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);
        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV10({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const pickNextSegFromBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";

    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty = boundaryPenalty(prevSeg, best);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.5 + 0.5 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateBoundaryPenaltyForBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 3;
    let best = boundaryPenalty(prevSeg, arr[Math.floor(rng() * arr.length)]);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 20;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.7;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const bp = estimateBoundaryPenaltyForBase(chain, prevChar, prevSeg);
        if (bp >= 2) w *= 0.2;
        else if (bp === 1) w *= 0.6;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableLinguisticV11({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const baseUniverse = Array.from(new Set(contexts.map(c => c.idx))).filter(n => typeof n === "number" && !Number.isNaN(n));
  const availableUniqueBases = baseUniverse.length;

  const inferredMinUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases >= 12
        ? 4
        : availableUniqueBases >= 6
          ? 3
          : availableUniqueBases > 1
            ? 2
            : 1;

  const requiredUniqueBases = inferredMinUniqueBases;
  const ctxByIdx = new Map(contexts.map(c => [c.idx, c]));

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const isLetterChar = ch => typeof ch === "string" && ch.length && /\p{L}/u.test(ch);

  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const clusterPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (!isLetterChar(la) || !isLetterChar(fb)) return 0;
    if (isVowelChar(la) || isVowelChar(fb)) return 0;

    const tail = a.slice(Math.max(0, a.length - 3));
    const head = b.slice(0, 3);
    const joined = tail + head;
    let run = 0;
    let maxRun = 0;
    for (const ch of joined) {
      if (!isLetterChar(ch)) {
        run = 0;
        continue;
      }
      if (!isVowelChar(ch)) run++;
      else run = 0;
      if (run > maxRun) maxRun = run;
    }
    if (maxRun >= 4) return 4;
    if (maxRun === 3) return 2;
    return 0;
  };

  const repeatPenalty = (prevSeg, nextSeg) => {
    const a = typeof prevSeg === "string" ? prevSeg : "";
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (!a || !b) return 0;
    const la = last(a);
    const fb = b[0];
    if (!la || !fb) return 0;
    if (la !== fb) return 0;
    if (la === " " || la === "-" || la === "'") return 0;
    return 2;
  };

  const spacePenalty = (compound, nextSeg) => {
    const b = typeof nextSeg === "string" ? nextSeg : "";
    if (b !== " ") return 0;
    const a = typeof compound === "string" ? compound : "";
    if (!a.length) return 6;
    const l = last(a);
    if (l === " " || l === "-") return 10;
    if (a.length < 6) return 4;
    return 2;
  };

  const baseSwitchPenalty = (prevCtx, nextCtx) => {
    if (!prevCtx || !nextCtx) return 0;
    if (prevCtx.idx === nextCtx.idx) return 0;
    const a = !!prevCtx.isClickHeavy;
    const b = !!nextCtx.isClickHeavy;
    if (a !== b) return 3;
    return 0;
  };

  const onsetOverlapScore = (a, b) => {
    const setA = a && a.onsetSet ? a.onsetSet : null;
    const setB = b && b.onsetSet ? b.onsetSet : null;
    if (!setA || !setB || !setA.size || !setB.size) return 1;
    let common = 0;
    const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
    for (const x of small) if (large.has(x)) common++;
    const denom = Math.max(1, Math.min(setA.size, setB.size));
    const ratio = common / denom;
    return 0.6 + 0.4 * ratio;
  };

  const weightedPick = (items, ws) => {
    if (!Array.isArray(items) || !items.length) return null;
    const weightsArr = Array.isArray(ws) && ws.length === items.length ? ws : items.map(() => 1);
    let total = 0;
    for (const w of weightsArr) total += Math.max(0, +w || 0);
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    let r = rng() * total;
    for (let i = 0; i < items.length; i++) {
      r -= Math.max(0, +weightsArr[i] || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };

  const estimateJoinPenaltyForBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return 999;
    let best = Infinity;
    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < best) best = p;
      if (best === 0) break;
    }
    return best;
  };

  const pickNextSegFromBase = (chain, compound, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";
    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty =
      boundaryPenalty(prevSeg, best) +
      clusterPenalty(prevSeg, best) +
      repeatPenalty(prevSeg, best) +
      spacePenalty(compound, best);

    for (let t = 0; t < 3; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p =
        boundaryPenalty(prevSeg, cand) +
        clusterPenalty(prevSeg, cand) +
        repeatPenalty(prevSeg, cand) +
        spacePenalty(compound, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }
    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const segInfos = [];
    const baseSeq = [];
    const usedBases = new Set();
    let compound = "";

    let lastNonSpacerBase = null;
    let prevNonSpacerBase = null;
    let runLen = 0;
    const maxSegs = 24;

    for (let i = 0; i < maxSegs; i++) {
      const remainingBudget = requestedMax - compound.length;
      if (remainingBudget <= 0) break;

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";

      const prevCtx = lastNonSpacerBase != null ? ctxByIdx.get(lastNonSpacerBase) : null;
      const candidates = chosenBases.slice();
      const weights = candidates.map(idx => {
        const nextCtx = ctxByIdx.get(idx);
        const chain = baseChains.get(idx);
        let w = 1;

        if (usedBases.size < requiredUniqueBases) {
          if (!usedBases.has(idx)) w *= 2.5;
          else w *= 0.5;
        }

        if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
          const effectiveRun = runLen > 0 ? runLen : 1;
          if (effectiveRun >= 4) return 0;
          w *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
        }

        if (prevNonSpacerBase != null && idx === prevNonSpacerBase) w *= 0.75;
        if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) w *= 0.25;
        w *= onsetOverlapScore(prevCtx, nextCtx);

        const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
        if (jp >= 6) w *= 0.12;
        else if (jp >= 3) w *= 0.35;
        else if (jp >= 1) w *= 0.75;

        return w;
      });

      const currentBase = weightedPick(candidates, weights);
      const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
      const chain = currentBase != null ? baseChains.get(currentBase) : null;
      const cur = pickNextSegFromBase(chain, compound, prevChar, prevSeg);
      if (cur === "") {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }

      if (compound.length + cur.length > requestedMax) {
        if (compound.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          if (cur !== " " && cur !== "-" && cur !== "'") {
            usedBases.add(currentBase);
            if (lastNonSpacerBase === currentBase) runLen++;
            else {
              prevNonSpacerBase = lastNonSpacerBase;
              lastNonSpacerBase = currentBase;
              runLen = 1;
            }
          }
          compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
          if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") {
        usedBases.add(currentBase);
        if (lastNonSpacerBase === currentBase) runLen++;
        else {
          prevNonSpacerBase = lastNonSpacerBase;
          lastNonSpacerBase = currentBase;
          runLen = 1;
        }
      }
      compound = smoothJoin(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set(), rng);
      if (ctx) segInfos.push({text: cur, shape: getSegmentShape(cur, ctx)});

      if (typeof isRepetitiveClickPattern === "function" && isRepetitiveClickPattern(segInfos)) {
        if (compound.length < requestedMin) {
          compound = "";
          segs.length = 0;
          segInfos.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          lastNonSpacerBase = null;
          prevNonSpacerBase = null;
          runLen = 0;
          continue;
        }
        break;
      }
    }

    const l = last(compound);
    if (l === "'" || l === " " || l === "-") {
      compound = compound.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...compound].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq, usedBasesCount: usedBases.size};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = baseUniverse.slice();
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 8; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      const uniqOk = candidate.usedBasesCount >= Math.min(requiredUniqueBases, chosenBases.length);
      if (len >= requestedMin && len <= requestedMax && uniqOk) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target) + (uniqOk ? 0 : 1000);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
}

function runNextgenSyllableProvenance({baseIndices, count, seed, min, max, weights, minUniqueBases}) {
  const rng = makeMulberry32(seed);
  const bases = loadDefaultNameBases();
  const contexts = buildWeightedContexts(baseIndices, bases, weights);
  if (!contexts.length) return {names: [], segTextLists: [], baseSeqs: [], chosenBasesList: []};

  const names = [];
  const segTextLists = [];
  const baseSeqs = [];
  const chosenBasesList = [];

  const availableUniqueBases = Array.from(new Set(contexts.map(c => c.idx))).length;
  const requiredUniqueBases =
    typeof minUniqueBases === "number"
      ? Math.max(1, Math.min(minUniqueBases, availableUniqueBases || 1))
      : availableUniqueBases > 1
        ? 2
        : 1;

  const isVowelChar = ch => typeof ch === "string" && ch.length && VOWELS.includes(ch);
  const boundaryPenalty = (prevSeg, nextSeg) => {
    const a = last(prevSeg);
    const b = nextSeg && nextSeg.length ? nextSeg[0] : "";
    if (!a || !b) return 0;
    if (a === "'" || a === " " || a === "-") return 0;
    if (b === "'" || b === " " || b === "-") return 0;
    if (isVowelChar(a) && isVowelChar(b)) return 2;
    if (!isVowelChar(a) && !isVowelChar(b) && a === b) return 1;
    return 0;
  };

  const pickDifferentBase = (choices, current) => {
    const others = Array.isArray(choices) ? choices.filter(x => x !== current) : [];
    if (!others.length) return current;
    return others[Math.floor(rng() * others.length)];
  };

  const pickNextSegFromBase = (chain, prevChar, prevSeg) => {
    const arr = (chain && (chain[prevChar] || chain[""])) || [];
    if (!Array.isArray(arr) || !arr.length) return "";

    let best = arr[Math.floor(rng() * arr.length)];
    let bestPenalty = boundaryPenalty(prevSeg, best);
    for (let t = 0; t < 2; t++) {
      const cand = arr[Math.floor(rng() * arr.length)];
      const p = boundaryPenalty(prevSeg, cand);
      if (p < bestPenalty) {
        best = cand;
        bestPenalty = p;
        if (bestPenalty === 0) break;
      }
    }

    return best;
  };

  function attempt(chosenBases, requestedMin, requestedMax) {
    const baseChains = new Map(
      chosenBases.map(idx => {
        const base = bases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        return [idx, calculateChainFromBlob(blob)];
      })
    );

    const segs = [];
    const baseSeq = [];
    let w = "";

    let currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
    let spanLeft = 1 + Math.floor(rng() * 3);
    const usedBases = new Set();

    for (let i = 0; i < 20; i++) {
      const remainingBudget = requestedMax - w.length;
      if (remainingBudget <= 0) break;

      if (spanLeft <= 0) {
        const mustSwitchForUniq = usedBases.size < requiredUniqueBases && chosenBases.length > usedBases.size;
        const doSwitch = mustSwitchForUniq || rng() > 0.75;
        if (doSwitch) currentBase = pickDifferentBase(chosenBases, currentBase);
        spanLeft = 1 + Math.floor(rng() * 3);
      }

      const prevSeg = segs.length ? segs[segs.length - 1] : "";
      const prevChar = segs.length ? last(prevSeg) : "";
      const chain = baseChains.get(currentBase);
      let cur = pickNextSegFromBase(chain, prevChar, prevSeg);

      if (cur === "") {
        if (w.length < requestedMin) {
          w = "";
          segs.length = 0;
          baseSeq.length = 0;
          usedBases.clear();
          currentBase = chosenBases[Math.floor(rng() * chosenBases.length)];
          spanLeft = 1 + Math.floor(rng() * 3);
          continue;
        }
        break;
      }

      if (w.length + cur.length > requestedMax) {
        if (w.length < requestedMin) {
          segs.push(cur);
          baseSeq.push(currentBase);
          w += cur;
        }
        break;
      }

      segs.push(cur);
      baseSeq.push(currentBase);
      if (cur !== " " && cur !== "-" && cur !== "'") usedBases.add(currentBase);
      w += cur;
      spanLeft--;
    }

    const l = last(w);
    if (l === "'" || l === " " || l === "-") {
      w = w.slice(0, -1);
      if (segs.length) {
        segs.pop();
        baseSeq.pop();
      }
    }

    let name = [...w].reduce(function (r, c, i, d) {
      if (c === d[i + 1] && !"".includes(c)) return r;
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

    return {text: name, segTexts: segs, baseSeq};
  }

  for (let i = 0; i < count; i++) {
    const chosenBases = pickUniqueBasesFromContexts(contexts, rng, minUniqueBases);
    chosenBasesList.push(chosenBases);

    const baseMins = chosenBases.map(idx => (bases[idx] && typeof bases[idx].min === "number" ? bases[idx].min : 4));
    const baseMaxs = chosenBases.map(idx => (bases[idx] && typeof bases[idx].max === "number" ? bases[idx].max : 10));
    const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
    const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
    const requestedMin = typeof min === "number" ? min : fallbackMin * requiredUniqueBases;
    const requestedMax = typeof max === "number" ? max : fallbackMax * requiredUniqueBases;

    let best = null;
    let bestDelta = Infinity;
    const target = (requestedMin + requestedMax) / 2;
    for (let t = 0; t < 5; t++) {
      const candidate = attempt(chosenBases, requestedMin, requestedMax);
      const len = candidate.text.length;
      if (len >= requestedMin && len <= requestedMax) {
        best = candidate;
        break;
      }
      const delta = Math.abs(len - target);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = candidate;
      }
    }

    const res = best || attempt(chosenBases, requestedMin, requestedMax);
    names.push(res.text);
    segTextLists.push(Array.isArray(res.segTexts) ? res.segTexts : []);
    baseSeqs.push(Array.isArray(res.baseSeq) ? res.baseSeq : []);
  }

  return {names, segTextLists, baseSeqs, chosenBasesList};
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

function countPossiblePairs(uniqueBases) {
  const n = Array.isArray(uniqueBases) ? uniqueBases.length : 0;
  if (n < 2) return 0;
  return (n * (n - 1)) / 2;
}

function computeObservedCooccurPairs(samples) {
  const pairs = new Set();
  if (!Array.isArray(samples)) return pairs;

  for (const row of samples) {
    const seq = row && Array.isArray(row.baseSeq) ? row.baseSeq : [];
    const uniq = Array.from(new Set(seq.filter(n => typeof n === "number" && !Number.isNaN(n))));
    if (uniq.length < 2) continue;
    uniq.sort((a, b) => a - b);
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        pairs.add(`${uniq[i]},${uniq[j]}`);
      }
    }
  }

  return pairs;
}

function computeCooccurGraph(samples) {
  const neighbors = new Map();
  const usedCounts = new Map();
  if (!Array.isArray(samples)) return {neighbors, usedCounts};

  for (const row of samples) {
    const seq = row && Array.isArray(row.baseSeq) ? row.baseSeq : [];
    const uniq = Array.from(new Set(seq.filter(n => typeof n === "number" && !Number.isNaN(n))));
    if (!uniq.length) continue;

    for (const b of uniq) {
      usedCounts.set(b, (usedCounts.get(b) || 0) + 1);
      if (!neighbors.has(b)) neighbors.set(b, new Set());
    }

    if (uniq.length < 2) continue;
    uniq.sort((a, b) => a - b);
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i];
        const b = uniq[j];
        neighbors.get(a).add(b);
        neighbors.get(b).add(a);
      }
    }
  }

  return {neighbors, usedCounts};
}

function computeMissingPairs(baseUniverse, observedPairs, limit) {
  const bases = Array.isArray(baseUniverse) ? baseUniverse.slice() : [];
  bases.sort((a, b) => a - b);
  const observed = observedPairs instanceof Set ? observedPairs : new Set();
  const out = [];
  const max = typeof limit === "number" ? limit : 50;

  for (let i = 0; i < bases.length; i++) {
    for (let j = i + 1; j < bases.length; j++) {
      const a = bases[i];
      const b = bases[j];
      const key = `${a},${b}`;
      if (!observed.has(key)) {
        out.push([a, b]);
        if (out.length >= max) return {pairs: out, truncated: true};
      }
    }
  }

  return {pairs: out, truncated: false};
}

function formatPairLines(pairs, opts) {
  const options = opts || {};
  const perLine = typeof options.perLine === "number" ? Math.max(1, options.perLine) : 12;
  const maxLines = typeof options.maxLines === "number" ? Math.max(1, options.maxLines) : 10;

  const tokens = Array.isArray(pairs) ? pairs.map(([a, b]) => `[${a},${b}]`) : [];
  if (!tokens.length) return [];

  const lines = [];
  for (let i = 0; i < tokens.length; i += perLine) {
    lines.push(tokens.slice(i, i + perLine).join(" "));
    if (lines.length >= maxLines) {
      if (i + perLine < tokens.length) lines[lines.length - 1] += " ...";
      break;
    }
  }

  return lines;
}

function formatBaseList(list, limit) {
  const max = typeof limit === "number" ? limit : 40;
  if (!Array.isArray(list) || !list.length) return "[]";
  if (list.length <= max) return `[${list.join(",")}]`;
  const head = list.slice(0, max).join(",");
  return `[${head},... +${list.length - max} more]`;
}

const ALL_VERSION_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const VERSION_LABELS = {
  1: "legacy",
  2: "current",
  3: "nextgen",
  4: "nextgenSyll",
  5: "nextgenSyllProv",
  6: "syllLing_fixedSwitch",
  7: "syllLing_rampedSwitch",
  8: "syllLing_weightedSwitchTarget",
  9: "syllLing_weightedPerStep",
  10: "syllLing_boundaryAware",
  11: "syllLing_v11_styleStability",
  12: "syllLing_v12_noInferredMinUnique",
  13: "syllLing_v13_noLengthMultiplier",
  14: "syllLing_v14_noInferredMinUnique_noLengthMultiplier",
  15: "syllLing_v15_softDiversityObjective",
  16: "syllLing_v16_poolScaledLength",
  17: "syllLing_v17_realismObjective",
  18: "syllLing_v18_realismObjective_lowPpl",
  19: "syllLing_v19_realismObjective_lowPpl_lowJs"
};
if (!ALL_VERSION_IDS.length || ALL_VERSION_IDS[0] !== 1 || !ALL_VERSION_IDS.includes(10)) {
  throw new Error("compare-mixer-nextgen-to-app.js: expected ALL_VERSION_IDS to start at 1 and include v10");
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
  const printArg = getValue("--print");
  const seedArg = getValue("--seed");
  const minArg = getValue("--min");
  const maxArg = getValue("--max");
  const maxSegmentsArg = getValue("--max-segments");
  const weightsArg = getValue("--weights");
  const minUniqueBasesArg = getValue("--min-unique-bases");
  const realismArg = getValue("--realism");

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
  const vCsv = collectCsvAfter(["--v"]);

  function parseBaseList(expr) {
    if (expr == null) return [];
    const parts = String(expr)
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const out = [];
    const seen = new Set();

    const push = n => {
      if (Number.isNaN(n)) return;
      if (seen.has(n)) return;
      seen.add(n);
      out.push(n);
    };

    for (const part of parts) {
      const m = part.match(/^(-?\d+)\s*-\s*(-?\d+)$/);
      if (m) {
        const a = parseInt(m[1], 10);
        const b = parseInt(m[2], 10);
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        const step = a <= b ? 1 : -1;
        for (let x = a; step > 0 ? x <= b : x >= b; x += step) push(x);
        continue;
      }

      push(parseInt(part, 10));
    }

    return out;
  }

  const baseIndices = parseBaseList(baseCsv);

  function parseVersionList(expr) {
    if (expr == null) return ALL_VERSION_IDS.slice();
    const parts = String(expr)
      .split(/[\,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const out = [];
    const seen = new Set();
    const push = n => {
      if (Number.isNaN(n)) return;
      if (!ALL_VERSION_IDS.includes(n)) return;
      if (seen.has(n)) return;
      seen.add(n);
      out.push(n);
    };

    for (const part of parts) {
      const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        const a = parseInt(m[1], 10);
        const b = parseInt(m[2], 10);
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        const step = a <= b ? 1 : -1;
        for (let x = a; step > 0 ? x <= b : x >= b; x += step) push(x);
        continue;
      }
      push(parseInt(part, 10));
    }

    return out;
  }

  const versions = parseVersionList(vCsv);

  const weights = weightsArg
    ? weightsArg
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseInt(s, 10))
    : null;

  const count = countArg ? parseInt(countArg, 10) : 40;
  const print = printArg != null ? parseInt(printArg, 10) : 10;
  const seed = seedArg != null ? parseInt(seedArg, 10) : null;
  const min = minArg != null ? parseInt(minArg, 10) : null;
  const max = maxArg != null ? parseInt(maxArg, 10) : null;
  const maxSegments = maxSegmentsArg != null ? parseInt(maxSegmentsArg, 10) : 4;
  const minUniqueBases = minUniqueBasesArg != null ? parseInt(minUniqueBasesArg, 10) : null;

  const help = args.includes("--help") || args.includes("-h");
  const realism =
    args.includes("--realism") ||
    (realismArg != null && realismArg !== "0" && realismArg !== "false" && realismArg !== "no");

  return {iso, baseIndices, count, print, versions, seed, min, max, maxSegments, weights, minUniqueBases, realism, help};
}

function printUsage() {
  console.log("Usage: node tools/mixer-core/compare-mixer-nextgen-to-app.js [options]\n");
  console.log("Options:");
  console.log("  --iso=ID              Use mixer-map bases for ISO (e.g. amkoe).");
  console.log("  --base=IDX[,IDX...]   Compare directly from base indices.");
  console.log("  --count=N             Number of samples per generator (default 40).");
  console.log("  --print=N             How many samples to print in diff view (default 10).");
  const vDesc = ALL_VERSION_IDS.map(id => `${id}=${VERSION_LABELS[id] || ""}`.trim()).join(", ");
  console.log(`  --v=LIST              Which mixer versions to run (default all): ${vDesc}. Example: --v=1,4`);
  console.log("  --seed=INT            Seed for deterministic output.");
  console.log("  --min=INT             Override minimum length.");
  console.log("  --max=INT             Override maximum length.");
  console.log("  --max-segments=N      Segment cap for current app + nextgen (default 4).");
  console.log("  --min-unique-bases=N  Require at least N unique bases per generated name (default: 2 if multiple bases).");
  console.log("  --weights=a,b,c       Optional weights for base selection.");
  console.log("  --realism             Print realism metrics (seed-corpus n-grams) at the end.");
  console.log("Examples:");
  console.log("  node tools/mixer-core/compare-mixer-nextgen-to-app.js --iso=amkoe --count=40 --seed=1");
  console.log("  node tools/mixer-core/compare-mixer-nextgen-to-app.js --base=353,354 --count=40 --seed=42 --min=15 --max=50");
}

function main() {
  const {iso, baseIndices, count, print, versions, seed, min, max, maxSegments, weights, minUniqueBases, realism, help} = parseArgs(process.argv);
  if (help || (!iso && (!baseIndices || !baseIndices.length))) {
    printUsage();
    return;
  }

  if (!versions || !versions.length) {
    console.error("No valid versions selected via --v (expected 1-19)");
    process.exitCode = 1;
    return;
  }

  const selected = new Set(versions);
  const wantLegacy = selected.has(1);
  const wantCurrent = selected.has(2);
  const wantNextgen = selected.has(3);
  const wantNextgenSyll = selected.has(4);
  const wantNextgenSyllProv = selected.has(5);
  const wantNextgenSyllLing = selected.has(6);
  const wantNextgenSyllLingV7 = selected.has(7);
  const wantNextgenSyllLingV8 = selected.has(8);
  const wantNextgenSyllLingV9 = selected.has(9);
  const wantNextgenSyllLingV10 = selected.has(10);
  const wantNextgenSyllLingV11 = selected.has(11);
  const wantNextgenSyllLingV12 = selected.has(12);
  const wantNextgenSyllLingV13 = selected.has(13);
  const wantNextgenSyllLingV14 = selected.has(14);
  const wantNextgenSyllLingV15 = selected.has(15);
  const wantNextgenSyllLingV16 = selected.has(16);
  const wantNextgenSyllLingV17 = selected.has(17);
  const wantNextgenSyllLingV18 = selected.has(18);
  const wantNextgenSyllLingV19 = selected.has(19);

  if (wantNextgenSyllLingV10 && typeof runNextgenSyllableLinguisticV10 !== "function") {
    throw new Error("v=10 requested but runNextgenSyllableLinguisticV10 is missing");
  }

  if (wantNextgenSyllLingV11 && typeof runNextgenSyllableLinguisticV11 !== "function") {
    throw new Error("v=11 requested but runNextgenSyllableLinguisticV11 is missing");
  }

  if (wantNextgenSyllLingV12 && typeof runNextgenSyllableLinguisticV12 !== "function") {
    throw new Error("v=12 requested but runNextgenSyllableLinguisticV12 is missing");
  }

  if (wantNextgenSyllLingV13 && typeof runNextgenSyllableLinguisticV13 !== "function") {
    throw new Error("v=13 requested but runNextgenSyllableLinguisticV13 is missing");
  }

  if (wantNextgenSyllLingV14 && typeof runNextgenSyllableLinguisticV14 !== "function") {
    throw new Error("v=14 requested but runNextgenSyllableLinguisticV14 is missing");
  }

  if (wantNextgenSyllLingV15 && typeof runNextgenSyllableLinguisticV15 !== "function") {
    throw new Error("v=15 requested but runNextgenSyllableLinguisticV15 is missing");
  }

  if (wantNextgenSyllLingV16 && typeof runNextgenSyllableLinguisticV16 !== "function") {
    throw new Error("v=16 requested but runNextgenSyllableLinguisticV16 is missing");
  }

  if (wantNextgenSyllLingV17 && typeof runNextgenSyllableLinguisticV17 !== "function") {
    throw new Error("v=17 requested but runNextgenSyllableLinguisticV17 is missing");
  }

  if (wantNextgenSyllLingV18 && typeof runNextgenSyllableLinguisticV18 !== "function") {
    throw new Error("v=18 requested but runNextgenSyllableLinguisticV18 is missing");
  }

  if (wantNextgenSyllLingV19 && typeof runNextgenSyllableLinguisticV19 !== "function") {
    throw new Error("v=19 requested but runNextgenSyllableLinguisticV19 is missing");
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
  const explicitMinUniqueBases =
    typeof minUniqueBases === "number" && !Number.isNaN(minUniqueBases) ? minUniqueBases : undefined;
  const effectiveMinUniqueBases =
    typeof explicitMinUniqueBases === "number"
      ? explicitMinUniqueBases
      : uniqueIndexCount > 1
        ? 2
        : 1;

  const bases = loadDefaultNameBases();
  const legacySamples = wantLegacy
    ? runAppMixer({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        maxSegments,
        weights,
        legacyChain: true
      })
    : [];

  const currentSamples = wantCurrent
    ? runAppMixer({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        maxSegments,
        weights,
        minUniqueBases: effectiveMinUniqueBases,
        legacyChain: false
      })
    : [];

  const nextgen = wantNextgen
    ? runNextgenMixer({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        maxSegments,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: []};

  const nextgenSyllableProv = wantNextgenSyllProv
    ? runNextgenSyllableProvenance({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV14 = wantNextgenSyllLingV14
    ? runNextgenSyllableLinguisticV14({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV15 = wantNextgenSyllLingV15
    ? runNextgenSyllableLinguisticV15({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV16 = wantNextgenSyllLingV16
    ? runNextgenSyllableLinguisticV16({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV17 = wantNextgenSyllLingV17
    ? runNextgenSyllableLinguisticV17({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV18 = wantNextgenSyllLingV18
    ? runNextgenSyllableLinguisticV18({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV19 = wantNextgenSyllLingV19
    ? runNextgenSyllableLinguisticV19({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLing = wantNextgenSyllLing
    ? runNextgenSyllableLinguistic({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV7 = wantNextgenSyllLingV7
    ? runNextgenSyllableLinguisticV7({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV8 = wantNextgenSyllLingV8
    ? runNextgenSyllableLinguisticV8({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV9 = wantNextgenSyllLingV9
    ? runNextgenSyllableLinguisticV9({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV10 = wantNextgenSyllLingV10
    ? runNextgenSyllableLinguisticV10({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV11 = wantNextgenSyllLingV11
    ? runNextgenSyllableLinguisticV11({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV12 = wantNextgenSyllLingV12
    ? runNextgenSyllableLinguisticV12({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllableLingV13 = wantNextgenSyllLingV13
    ? runNextgenSyllableLinguisticV13({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: explicitMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: [], chosenBasesList: []};

  const nextgenSyllable = wantNextgenSyll
    ? runNextgenSyllableChain({
        baseIndices: indices,
        count,
        seed,
        min,
        max,
        weights,
        minUniqueBases: effectiveMinUniqueBases
      })
    : {names: [], baseSeqs: [], segTextLists: []};

  const legacy = wantLegacy ? normalizeCapturedSamples(legacySamples) : [];
  const current = wantCurrent ? normalizeCapturedSamples(currentSamples) : [];
  const nextgenSamples = wantNextgen
    ? nextgen.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgen.baseSeqs) ? nextgen.baseSeqs[i] || [] : []
      }))
    : [];

  if (wantNextgen) {
    const nextgenSegs = Array.isArray(nextgen.segTextLists) ? nextgen.segTextLists : [];
    nextgenSamples.forEach((row, i) => {
      row.segTexts = Array.isArray(nextgenSegs[i]) ? nextgenSegs[i] : [];
    });
  }

  const nextgenSyllSamples = wantNextgenSyll
    ? nextgenSyllable.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllable.baseSeqs) ? nextgenSyllable.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllable.segTextLists) ? nextgenSyllable.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllable.chosenBasesList) ? nextgenSyllable.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllProvSamples = wantNextgenSyllProv
    ? nextgenSyllableProv.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableProv.baseSeqs) ? nextgenSyllableProv.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableProv.segTextLists) ? nextgenSyllableProv.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableProv.chosenBasesList) ? nextgenSyllableProv.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingSamples = wantNextgenSyllLing
    ? nextgenSyllableLing.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLing.baseSeqs) ? nextgenSyllableLing.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLing.segTextLists) ? nextgenSyllableLing.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLing.chosenBasesList) ? nextgenSyllableLing.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV7Samples = wantNextgenSyllLingV7
    ? nextgenSyllableLingV7.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV7.baseSeqs) ? nextgenSyllableLingV7.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV7.segTextLists) ? nextgenSyllableLingV7.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV7.chosenBasesList) ? nextgenSyllableLingV7.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV8Samples = wantNextgenSyllLingV8
    ? nextgenSyllableLingV8.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV8.baseSeqs) ? nextgenSyllableLingV8.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV8.segTextLists) ? nextgenSyllableLingV8.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV8.chosenBasesList) ? nextgenSyllableLingV8.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV9Samples = wantNextgenSyllLingV9
    ? nextgenSyllableLingV9.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV9.baseSeqs) ? nextgenSyllableLingV9.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV9.segTextLists) ? nextgenSyllableLingV9.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV9.chosenBasesList) ? nextgenSyllableLingV9.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV10Samples = wantNextgenSyllLingV10
    ? nextgenSyllableLingV10.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV10.baseSeqs) ? nextgenSyllableLingV10.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV10.segTextLists) ? nextgenSyllableLingV10.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV10.chosenBasesList) ? nextgenSyllableLingV10.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV11Samples = wantNextgenSyllLingV11
    ? nextgenSyllableLingV11.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV11.baseSeqs) ? nextgenSyllableLingV11.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV11.segTextLists) ? nextgenSyllableLingV11.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV11.chosenBasesList) ? nextgenSyllableLingV11.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV12Samples = wantNextgenSyllLingV12
    ? nextgenSyllableLingV12.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV12.baseSeqs) ? nextgenSyllableLingV12.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV12.segTextLists) ? nextgenSyllableLingV12.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV12.chosenBasesList) ? nextgenSyllableLingV12.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV13Samples = wantNextgenSyllLingV13
    ? nextgenSyllableLingV13.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV13.baseSeqs) ? nextgenSyllableLingV13.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV13.segTextLists) ? nextgenSyllableLingV13.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV13.chosenBasesList) ? nextgenSyllableLingV13.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV14Samples = wantNextgenSyllLingV14
    ? nextgenSyllableLingV14.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV14.baseSeqs) ? nextgenSyllableLingV14.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV14.segTextLists) ? nextgenSyllableLingV14.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV14.chosenBasesList) ? nextgenSyllableLingV14.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV15Samples = wantNextgenSyllLingV15
    ? nextgenSyllableLingV15.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV15.baseSeqs) ? nextgenSyllableLingV15.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV15.segTextLists) ? nextgenSyllableLingV15.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV15.chosenBasesList) ? nextgenSyllableLingV15.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV16Samples = wantNextgenSyllLingV16
    ? nextgenSyllableLingV16.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV16.baseSeqs) ? nextgenSyllableLingV16.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV16.segTextLists) ? nextgenSyllableLingV16.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV16.chosenBasesList) ? nextgenSyllableLingV16.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV17Samples = wantNextgenSyllLingV17
    ? nextgenSyllableLingV17.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV17.baseSeqs) ? nextgenSyllableLingV17.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV17.segTextLists) ? nextgenSyllableLingV17.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV17.chosenBasesList) ? nextgenSyllableLingV17.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV18Samples = wantNextgenSyllLingV18
    ? nextgenSyllableLingV18.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV18.baseSeqs) ? nextgenSyllableLingV18.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV18.segTextLists) ? nextgenSyllableLingV18.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV18.chosenBasesList) ? nextgenSyllableLingV18.chosenBasesList[i] || [] : []
      }))
    : [];

  const nextgenSyllLingV19Samples = wantNextgenSyllLingV19
    ? nextgenSyllableLingV19.names.map((text, i) => ({
        text,
        baseSeq: Array.isArray(nextgenSyllableLingV19.baseSeqs) ? nextgenSyllableLingV19.baseSeqs[i] || [] : [],
        segTexts: Array.isArray(nextgenSyllableLingV19.segTextLists) ? nextgenSyllableLingV19.segTextLists[i] || [] : [],
        chosenBases: Array.isArray(nextgenSyllableLingV19.chosenBasesList) ? nextgenSyllableLingV19.chosenBasesList[i] || [] : []
      }))
    : [];

  if (wantLegacy) legacy.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases, {forceAttribution: true}));
  if (wantCurrent) current.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgen) nextgenSamples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyll) nextgenSyllSamples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllProv) nextgenSyllProvSamples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLing) nextgenSyllLingSamples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV7) nextgenSyllLingV7Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV8) nextgenSyllLingV8Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV9) nextgenSyllLingV9Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV10) nextgenSyllLingV10Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV11) nextgenSyllLingV11Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV12) nextgenSyllLingV12Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV13) nextgenSyllLingV13Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV14) nextgenSyllLingV14Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV15) nextgenSyllLingV15Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV16) nextgenSyllLingV16Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases));
  if (wantNextgenSyllLingV17) nextgenSyllLingV17Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases, {forceAttribution: true}));
  if (wantNextgenSyllLingV18) nextgenSyllLingV18Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases, {forceAttribution: true}));
  if (wantNextgenSyllLingV19) nextgenSyllLingV19Samples.forEach(row => normalizeSegsAndBaseSeqInPlace(row, indices, bases, {forceAttribution: true}));

  console.log(`Compared mixers for ${iso ? "iso=" + iso : "bases=" + indices.join(",")}`);
  console.log("");

  const safePrint = typeof print === "number" && !Number.isNaN(print) ? Math.max(0, Math.min(print, count)) : Math.min(10, count);
  const lines = safePrint;
  console.log(`=== Sample diff (showing ${lines}/${count}) ===`);

  function fmtSegs(segTexts) {
    if (!Array.isArray(segTexts) || !segTexts.length) return "";
    return segTexts.map(s => `[${s}]`).join("");
  }

  function fmtSeq(seq) {
    if (!Array.isArray(seq) || !seq.length) return "";
    return " " + seq.map(b => `[${b}]`).join(" ");
  }

  const sampleModes = [];
  if (wantLegacy) sampleModes.push({name: "legacy", rows: legacy});
  if (wantCurrent) sampleModes.push({name: "current", rows: current});
  if (wantNextgen) sampleModes.push({name: "nextgen", rows: nextgenSamples});
  if (wantNextgenSyll) sampleModes.push({name: "nextgenSyll", rows: nextgenSyllSamples});
  if (wantNextgenSyllProv) sampleModes.push({name: "nextgenSyllProv", rows: nextgenSyllProvSamples});
  if (wantNextgenSyllLing) sampleModes.push({name: "syllLing_fixedSwitch", rows: nextgenSyllLingSamples});
  if (wantNextgenSyllLingV7) sampleModes.push({name: "syllLing_rampedSwitch", rows: nextgenSyllLingV7Samples});
  if (wantNextgenSyllLingV8) sampleModes.push({name: "syllLing_weightedSwitchTarget", rows: nextgenSyllLingV8Samples});
  if (wantNextgenSyllLingV9) sampleModes.push({name: "syllLing_weightedPerStep", rows: nextgenSyllLingV9Samples});
  if (wantNextgenSyllLingV10) sampleModes.push({name: "syllLing_boundaryAware", rows: nextgenSyllLingV10Samples});
  if (wantNextgenSyllLingV11) sampleModes.push({name: "syllLing_v11_styleStability", rows: nextgenSyllLingV11Samples});
  if (wantNextgenSyllLingV12) sampleModes.push({name: "syllLing_v12_noInferredMinUnique", rows: nextgenSyllLingV12Samples});
  if (wantNextgenSyllLingV13) sampleModes.push({name: "syllLing_v13_noLengthMultiplier", rows: nextgenSyllLingV13Samples});
  if (wantNextgenSyllLingV14) sampleModes.push({name: "syllLing_v14_noInferredMinUnique_noLengthMultiplier", rows: nextgenSyllLingV14Samples});
  if (wantNextgenSyllLingV15) sampleModes.push({name: "syllLing_v15_softDiversityObjective", rows: nextgenSyllLingV15Samples});
  if (wantNextgenSyllLingV16) sampleModes.push({name: "syllLing_v16_poolScaledLength", rows: nextgenSyllLingV16Samples});
  if (wantNextgenSyllLingV17) sampleModes.push({name: "syllLing_v17_realismObjective", rows: nextgenSyllLingV17Samples});
  if (wantNextgenSyllLingV18) sampleModes.push({name: "syllLing_v18_realismObjective_lowPpl", rows: nextgenSyllLingV18Samples});
  if (wantNextgenSyllLingV19) sampleModes.push({name: "syllLing_v19_realismObjective_lowPpl_lowJs", rows: nextgenSyllLingV19Samples});

  for (let i = 0; i < lines; i++) {
    console.log(`#${i + 1}`);
    for (const mode of sampleModes) {
      const row = (mode.rows && mode.rows[i]) || {text: "", baseSeq: [], segTexts: []};
      console.log(`  ${mode.name}:`);
      console.log(`    segs: ${fmtSegs(row.segTexts)}`);
      console.log(`    name: ${row.text || ""}${fmtSeq(row.baseSeq)}`);
    }
  }

  console.log("");

  const reportModes = [];
  if (wantLegacy) reportModes.push({
    name: "legacy",
    title: "=== App legacyChain ===",
    samples: legacy
  });
  if (wantCurrent) reportModes.push({
    name: "current",
    title: "=== App current ===",
    samples: current
  });
  if (wantNextgen) reportModes.push({
    name: "nextgen",
    title: "=== Helper-only nextgen ===",
    samples: nextgenSamples
  });
  if (wantNextgenSyll) reportModes.push({
    name: "nextgenSyll",
    title: "=== Helper-only nextgenSyll ===",
    samples: nextgenSyllSamples
  });
  if (wantNextgenSyllProv) reportModes.push({
    name: "nextgenSyllProv",
    title: "=== Helper-only nextgenSyllProv ===",
    samples: nextgenSyllProvSamples
  });

  if (wantNextgenSyllLing) reportModes.push({
    name: "syllLing_fixedSwitch",
    title: "=== Helper-only syllLing_fixedSwitch (fixed switchProb) ===",
    samples: nextgenSyllLingSamples
  });

  if (wantNextgenSyllLingV7) reportModes.push({
    name: "syllLing_rampedSwitch",
    title: "=== Helper-only syllLing_rampedSwitch (anti-streak ramp) ===",
    samples: nextgenSyllLingV7Samples
  });

  if (wantNextgenSyllLingV8) reportModes.push({
    name: "syllLing_weightedSwitchTarget",
    title: "=== Helper-only syllLing_weightedSwitchTarget (ramped + weighted switch target) ===",
    samples: nextgenSyllLingV8Samples
  });

  if (wantNextgenSyllLingV9) reportModes.push({
    name: "syllLing_weightedPerStep",
    title: "=== Helper-only syllLing_weightedPerStep (per-step weighted + cooldown) ===",
    samples: nextgenSyllLingV9Samples
  });

  if (wantNextgenSyllLingV10) reportModes.push({
    name: "syllLing_boundaryAware",
    title: "=== Helper-only syllLing_boundaryAware (boundary-aware weighted per-step) ===",
    samples: nextgenSyllLingV10Samples
  });

  if (wantNextgenSyllLingV11) reportModes.push({
    name: "syllLing_v11_styleStability",
    title: "=== Helper-only syllLing_v11_styleStability (style stability + higher base diversity) ===",
    samples: nextgenSyllLingV11Samples
  });

  if (wantNextgenSyllLingV12) reportModes.push({
    name: "syllLing_v12_noInferredMinUnique",
    title: "=== Helper-only syllLing_v12_noInferredMinUnique (v11 - inferredMinUniqueBases) ===",
    samples: nextgenSyllLingV12Samples
  });

  if (wantNextgenSyllLingV13) reportModes.push({
    name: "syllLing_v13_noLengthMultiplier",
    title: "=== Helper-only syllLing_v13_noLengthMultiplier (v11 - length multiplier) ===",
    samples: nextgenSyllLingV13Samples
  });

  if (wantNextgenSyllLingV14) reportModes.push({
    name: "syllLing_v14_noInferredMinUnique_noLengthMultiplier",
    title: "=== Helper-only syllLing_v14_noInferredMinUnique_noLengthMultiplier (v11 - inferredMinUniqueBases + length multiplier) ===",
    samples: nextgenSyllLingV14Samples
  });

  if (wantNextgenSyllLingV15) reportModes.push({
    name: "syllLing_v15_softDiversityObjective",
    title: "=== Helper-only syllLing_v15_softDiversityObjective (v13 - hard diversity gate) ===",
    samples: nextgenSyllLingV15Samples
  });

  if (wantNextgenSyllLingV16) reportModes.push({
    name: "syllLing_v16_poolScaledLength",
    title: "=== Helper-only syllLing_v16_poolScaledLength (v13 + mild pool-based length scale) ===",
    samples: nextgenSyllLingV16Samples
  });

  if (wantNextgenSyllLingV17) reportModes.push({
    name: "syllLing_v17_realismObjective",
    title: "=== Helper-only syllLing_v17_realismObjective (v15 + seed-likeness + novelty) ===",
    samples: nextgenSyllLingV17Samples
  });

  if (wantNextgenSyllLingV18) reportModes.push({
    name: "syllLing_v18_realismObjective_lowPpl",
    title: "=== Helper-only syllLing_v18_realismObjective_lowPpl (v17 tuned for lower ppl) ===",
    samples: nextgenSyllLingV18Samples
  });

  if (wantNextgenSyllLingV19) reportModes.push({
    name: "syllLing_v19_realismObjective_lowPpl_lowJs",
    title: "=== Helper-only syllLing_v19_realismObjective_lowPpl_lowJs (v18 + per-candidate js objective) ===",
    samples: nextgenSyllLingV19Samples
  });

  const reportModeTexts = reportModes.map(m => ({
    name: m.name,
    title: m.title,
    samples: m.samples,
    texts: (m.samples || []).map(s => (s && s.text ? s.text : ""))
  }));

  for (const m of reportModeTexts) {
    const stats = computeLengthStats(m.texts);
    console.log(m.title);
    console.log(
      `count=${stats.count} min=${stats.minLen} max=${stats.maxLen} mean=${stats.mean?.toFixed?.(2)}`
    );
    console.log(`unique names: ${new Set(m.texts).size}/${m.texts.length}`);
    console.log("");
  }

  if (reportModeTexts.length > 1) {
    const overlap = (a, b) => {
      const setB = new Set(b);
      return a.filter(x => setB.has(x)).length;
    };

    for (let i = 0; i < reportModeTexts.length; i++) {
      for (let j = i + 1; j < reportModeTexts.length; j++) {
        const a = reportModeTexts[i];
        const b = reportModeTexts[j];
        console.log(`overlap ${a.name} ↔ ${b.name} (exact) = ${overlap(a.texts, b.texts)}/${count}`);
      }
    }
  }

  const baseUniverseForPairs = Array.from(new Set(indices)).sort((a, b) => a - b);
  const possiblePairs = countPossiblePairs(baseUniverseForPairs);
  const pairModes = reportModes.map(m => ({name: m.name, samples: m.samples}));

  console.log("");
  console.log("=== Pair coverage (co-occur) ===");
  if (!possiblePairs) {
    console.log("possible pairs: n/a (need at least 2 unique bases)");
  } else {
    console.log(`possible pairs: ${possiblePairs}`);
    for (const mode of pairModes) {
      const observed = computeObservedCooccurPairs(mode.samples);
      const pct = ((observed.size / possiblePairs) * 100).toFixed(1);
      console.log(`${mode.name}: ${observed.size}/${possiblePairs} (${pct}%)`);

      const missingCount = possiblePairs - observed.size;
      if (missingCount > 0) {
        const missing = computeMissingPairs(baseUniverseForPairs, observed, 80);
        console.log(`${mode.name} missing pairs (${missingCount}):`);
        const lines = formatPairLines(missing.pairs, {perLine: 12, maxLines: 10});
        for (const line of lines) console.log(`  ${line}`);
        if (missing.truncated) console.log("  ...");
      }
    }
  }

  const chosenCoverageModes = [
    {name: "nextgenSyll", enabled: wantNextgenSyll, samples: nextgenSyllSamples},
    {name: "nextgenSyllProv", enabled: wantNextgenSyllProv, samples: nextgenSyllProvSamples},
    {name: "syllLing_fixedSwitch", enabled: wantNextgenSyllLing, samples: nextgenSyllLingSamples},
    {name: "syllLing_rampedSwitch", enabled: wantNextgenSyllLingV7, samples: nextgenSyllLingV7Samples},
    {name: "syllLing_weightedSwitchTarget", enabled: wantNextgenSyllLingV8, samples: nextgenSyllLingV8Samples},
    {name: "syllLing_weightedPerStep", enabled: wantNextgenSyllLingV9, samples: nextgenSyllLingV9Samples},
    {name: "syllLing_boundaryAware", enabled: wantNextgenSyllLingV10, samples: nextgenSyllLingV10Samples},
    {name: "syllLing_v11_styleStability", enabled: wantNextgenSyllLingV11, samples: nextgenSyllLingV11Samples},
    {name: "syllLing_v12_noInferredMinUnique", enabled: wantNextgenSyllLingV12, samples: nextgenSyllLingV12Samples},
    {name: "syllLing_v13_noLengthMultiplier", enabled: wantNextgenSyllLingV13, samples: nextgenSyllLingV13Samples},
    {name: "syllLing_v14_noInferredMinUnique_noLengthMultiplier", enabled: wantNextgenSyllLingV14, samples: nextgenSyllLingV14Samples},
    {name: "syllLing_v15_softDiversityObjective", enabled: wantNextgenSyllLingV15, samples: nextgenSyllLingV15Samples},
    {name: "syllLing_v16_poolScaledLength", enabled: wantNextgenSyllLingV16, samples: nextgenSyllLingV16Samples},
    {name: "syllLing_v17_realismObjective", enabled: wantNextgenSyllLingV17, samples: nextgenSyllLingV17Samples},
    {name: "syllLing_v18_realismObjective_lowPpl", enabled: wantNextgenSyllLingV18, samples: nextgenSyllLingV18Samples},
    {name: "syllLing_v19_realismObjective_lowPpl_lowJs", enabled: wantNextgenSyllLingV19, samples: nextgenSyllLingV19Samples}
  ].filter(m => m.enabled && Array.isArray(m.samples) && m.samples.some(r => Array.isArray(r.chosenBases) && r.chosenBases.length));

  if (chosenCoverageModes.length) {
    console.log("");
    console.log("=== Pair coverage (chosen bases, pre-attribution) ===");
    if (!possiblePairs) {
      console.log("possible pairs: n/a (need at least 2 unique bases)");
    } else {
      console.log(`possible pairs: ${possiblePairs}`);
      for (const m of chosenCoverageModes) {
        const chosenPairSamples = m.samples.map(r => ({baseSeq: Array.isArray(r.chosenBases) ? r.chosenBases : []}));
        const observedChosen = computeObservedCooccurPairs(chosenPairSamples);
        const pctChosen = ((observedChosen.size / possiblePairs) * 100).toFixed(1);
        console.log(`${m.name} chosenBases: ${observedChosen.size}/${possiblePairs} (${pctChosen}%)`);

        const missingCount = possiblePairs - observedChosen.size;
        if (missingCount > 0) {
          const missing = computeMissingPairs(baseUniverseForPairs, observedChosen, 80);
          console.log(`${m.name} chosenBases missing pairs (${missingCount}):`);
          const lines = formatPairLines(missing.pairs, {perLine: 12, maxLines: 10});
          for (const line of lines) console.log(`  ${line}`);
          if (missing.truncated) console.log("  ...");
        }
      }
    }
  }

  const baseUniverse = Array.from(new Set(indices)).sort((a, b) => a - b);
  const modes = reportModes.map(m => ({name: m.name, samples: m.samples}));

  console.log("");
  console.log("=== Bases that did not mix (co-occur) ===");
  for (const mode of modes) {
    const {neighbors, usedCounts} = computeCooccurGraph(mode.samples);
    const unused = baseUniverse.filter(b => !(usedCounts.get(b) > 0));
    const usedButUnmixed = baseUniverse.filter(b => (usedCounts.get(b) > 0) && ((neighbors.get(b)?.size || 0) === 0));
    const neverMixed = baseUniverse.filter(b => (neighbors.get(b)?.size || 0) === 0);

    console.log(`${mode.name}:`);
    console.log(`  neverMixed: ${neverMixed.length}/${baseUniverse.length} ${formatBaseList(neverMixed)}`);
    console.log(`  usedButUnmixed: ${usedButUnmixed.length}/${baseUniverse.length} ${formatBaseList(usedButUnmixed)}`);
    console.log(`  unused: ${unused.length}/${baseUniverse.length} ${formatBaseList(unused)}`);
  }

  if (realism) {
    const seedNames = buildSeedCorpusFromBases(indices, bases);
    const seedNorm = seedNames.map(normalizeForRealism).filter(Boolean);
    const seedSet = new Set(seedNorm);
    const n = 3;
    const lm = buildCharLm(seedNorm, n);
    const seedGram = buildCharGramCounts(seedNorm, n);

    const fmtNum = (x, digits) => (typeof x === "number" && Number.isFinite(x) ? x.toFixed(digits) : "n/a");
    const summarizeBpc = rows => {
      let totalBits = 0;
      let totalChars = 0;
      let totalOov = 0;
      for (const r of rows) {
        const {bpc, chars, oovChars} = lm.scoreBpc(r);
        if (typeof bpc !== "number" || !Number.isFinite(bpc) || !chars) continue;
        totalBits += bpc * chars;
        totalChars += chars;
        totalOov += typeof oovChars === "number" ? oovChars : 0;
      }
      const bpc = totalChars ? totalBits / totalChars : null;
      const ppl = typeof bpc === "number" ? Math.pow(2, bpc) : null;
      const oovRate = totalChars ? totalOov / totalChars : null;
      return {bpc, ppl, oovRate, totalChars};
    };

    console.log("");
    console.log(`=== Realism (seed-corpus char ${n}-grams) ===`);
    console.log(
      `seed names: ${seedNorm.length} unique=${seedSet.size} vocabSize≈${lm.vocabSize} trigramCount=${seedGram.total}`
    );

    for (const m of reportModeTexts) {
      const gen = (m.texts || []).map(normalizeForRealism).filter(Boolean);
      const genGram = buildCharGramCounts(gen, n);
      const js = computeJsDivergenceFromCounts(seedGram.counts, seedGram.total, genGram.counts, genGram.total);
      const copied = gen.filter(x => seedSet.has(x)).length;
      const copyPct = gen.length ? (copied / gen.length) * 100 : 0;
      const {bpc, ppl, oovRate, totalChars} = summarizeBpc(gen);

      console.log(
        `${m.name}: bpc=${fmtNum(bpc, 3)} ppl=${fmtNum(ppl, 2)} js=${fmtNum(js, 4)} oov=${fmtNum(
          (oovRate || 0) * 100,
          2
        )}% copy=${copied}/${gen.length} (${fmtNum(copyPct, 1)}%) chars=${totalChars}`
      );
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while comparing mixers:",
      err && err.stack
        ? err.stack
        : err && err.message
          ? err.message
          : err
    );
    process.exitCode = 1;
  }
}
