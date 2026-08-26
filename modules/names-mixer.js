"use strict";

(function () {
  if (!window.Names) return;
  const { vowel } = window.languageUtils || {};
  const { ra } = window.probabilityUtils || {};
  const { last } = window.arrayUtils || {};

  let _languageMixerMap;

  function sanitizeName(name) {
    if (typeof name !== "string") return name;
    return name.replace(/\d/g, "").replace(/\|/g, "").replace(/_unq\d+\b/gi, "").replace(/_u\d+\b/gi, "").replace(/_/g, "");
  }
  let _mixedNameTooShortLogged = false;

  function loadLanguageMixerMapSync() {
    if (_languageMixerMap) return _languageMixerMap;

    // Preferred path: map preloaded via config/language-mixer-map.js
    if (Array.isArray(window.languageMixerMap)) {
      _languageMixerMap = window.languageMixerMap;
      return _languageMixerMap;
    }

    // Fallback: legacy synchronous JSON load (kept for compatibility)
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "config/language-mixer-map.json", false); // synchronous on purpose (tiny file, used rarely)
      xhr.send(null);

      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        _languageMixerMap = JSON.parse(xhr.responseText);
      } else {
        console.error("Names.getMixedByIso: failed to load language-mixer-map.json", xhr.status, xhr.statusText);
        _languageMixerMap = [];
      }
    } catch (e) {
      console.error("Names.getMixedByIso: error loading language-mixer-map.json", e);
      _languageMixerMap = [];
    }

    return _languageMixerMap;
  }

  function normalizeWeights(baseIndices, weights) {
    if (!Array.isArray(weights) || weights.length !== baseIndices.length) {
      return baseIndices.map(() => 1);
    }
    return weights.map(w => {
      const n = +w || 0;
      if (!isFinite(n) || n <= 0) return 1;
      return Math.floor(n) || 1;
    });
  }

  function getMixerVersionOverride() {
    try {
      const params = new URLSearchParams(window.location && window.location.search ? window.location.search : "");
      const v = params.get("mixer");
      if (v) return String(v);
    } catch (e) { }
    try {
      const v = localStorage.getItem("fmg-mixer-version");
      if (v) return String(v);
      const legacy = localStorage.getItem("fmg-mixer-v19");
      if (legacy === "1") return "v19";
    } catch (e) { }
    return "";
  }

  function shouldUseV19Mixer() {
    const v = getMixerVersionOverride().toLowerCase();
    return v === "19" || v === "v19";
  }

  function makeRng(seed) {
    if (seed === null || seed === undefined || Number.isNaN(seed)) return () => Math.random();
    let x = (seed >>> 0) || 1;
    return () => {
      x += 0x6d2b79f5;
      let t = x;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function computeSeedLengthStats(blob) {
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
    const q = p => lengths[Math.floor(p * (count - 1))];
    const p25 = q(0.25);
    const p75 = q(0.75);
    return { count, minLen, maxLen, mean, p25, p75 };
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

  const CLICKS = "ǀǁǂǃ";
  const CLICK_SMOOTH_PREFIXES = ["h", "ʼ", "kh", "qh", "sk", "ts", "tl", "ng", "x", "g", "n"];
  const CLICK_BRIDGE_VOWELS = ["a", "e", "i", "o", "u", "aa", "oa", "ua", "ia", "ai", "ei", "ao"];
  const CLICK_SUFFIXES = ["ka", "na", "sa", "sha", "sa", "ra", "ma", "ta", "la", "xa", "na", "za"];
  const CLICK_ACCENTS = [
    ["a", "á"],
    ["e", "é"],
    ["i", "í"],
    ["o", "ó"],
    ["u", "ú"],
    ["a", "â"],
    ["o", "ô"]
  ];

  function pickRandom(arr) {
    if (!Array.isArray(arr) || !arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function applyAccent(str) {
    for (const [plain, accented] of CLICK_ACCENTS) {
      const idx = str.indexOf(plain);
      if (idx !== -1) {
        return str.slice(0, idx) + accented + str.slice(idx + plain.length);
      }
    }
    return str;
  }

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

  function softenClickRuns(segs) {
    if (!Array.isArray(segs) || segs.length < 2) return;

    const appendWithConnector = (base, addition) => {
      if (!addition) return base;
      if (!base) return addition;
      const connector = pickRandom(["", "", "-", " ", "’"]);
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
      if (run === 1 && Math.random() < 0.5) continue;

      const stripped = seg.text.replace(/^[ǀǁǂǃ]+/u, "");
      if (!stripped) continue;

      let softenedCore = stripped;
      if (Math.random() < 0.5) softenedCore = applyAccent(softenedCore);
      if (run >= 3 && softenedCore.length > 3 && Math.random() < 0.6) {
        const splitPoint = 1 + Math.floor(Math.random() * Math.max(1, softenedCore.length - 2));
        const bridge = pickRandom(CLICK_BRIDGE_VOWELS);
        softenedCore = `${softenedCore.slice(0, splitPoint)}${bridge}${softenedCore.slice(splitPoint)}`;
      }

      const prefix = Math.random() < 0.75 ? pickRandom(CLICK_SMOOTH_PREFIXES) : "";
      const bridgeVowel = Math.random() < 0.6 ? pickRandom(CLICK_BRIDGE_VOWELS) : "";
      const suffix = Math.random() < 0.5 ? pickRandom(CLICK_SUFFIXES) : "";

      let softened = "";
      softened = appendWithConnector(softened, prefix);
      softened = appendWithConnector(softened, bridgeVowel);
      softened = appendWithConnector(softened, softenedCore);
      if (suffix) softened = appendWithConnector(softened, suffix);

      if (Math.random() < 0.3) {
        softened = softened.charAt(0).toUpperCase() + softened.slice(1);
      }

      segs[i] = Object.assign({}, seg, {
        text: softened,
        shape: getSegmentShape(softened, seg.ctx)
      });

      run = Math.random() < 0.25 ? run : 0;
    }
  }

  function smoothJoin(a, b, onsetSet) {
    if (!a) return b;
    if (!b) return a;

    const la = a[a.length - 1];
    const fb = b[0];

    if (!vowel(la) && la === fb && onsetSet.has(la)) {
      return a + b.slice(1);
    }

    if (vowel(la) && !vowel(fb) && onsetSet.has(fb)) {
      if (Math.random() < 0.7) return a + b.slice(1);
    }

    const laIsAscii = isAsciiLetter(la);
    const fbIsAscii = isAsciiLetter(fb);
    if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
      const r = Math.random();
      if (r < 0.6) {
        return a + " " + b;
      }
      if (r < 0.8) {
        return a + "-" + b;
      }
      return a + fb.toLowerCase() + b.slice(1);
    }

    if (vowel(la) && vowel(fb)) {
      return a + b.slice(1);
    }

    return a + b;
  }

  function buildBlendedContexts(baseIndices, weights) {
    if (!Array.isArray(baseIndices) || !baseIndices.length) return [];

    const w = normalizeWeights(baseIndices, weights);
    const contexts = [];

    baseIndices.forEach((baseIndex, idx) => {
      const base = nameBases && nameBases[baseIndex];
      if (!base || !base.b) return;

      const blob = base.b;
      const chain = Names.calculateChain(blob);
      if (!chain || chain[""] === undefined) return;

      const stats = computeSeedLengthStats(blob);
      const onsetSet = classifyOnsets(blob);
      const clickHeavy = isClickHeavyLanguage(blob);

      const weight = w[idx];
      for (let k = 0; k < weight; k++) {
        contexts.push({
          idx: baseIndex,
          base,
          chain,
          stats,
          onsetSet,
          isClickHeavy: clickHeavy
        });
      }
    });

    return contexts;
  }

  function generatePlainNameFromChain(chain, baseConfig, opts) {
    if (!chain || chain[""] === undefined || !baseConfig || !baseConfig.b) return "ERROR";

    const min = opts && opts.min != null ? opts.min : baseConfig.min;
    const max = opts && opts.max != null ? opts.max : baseConfig.max;
    const dupl = opts && opts.dupl !== undefined ? opts.dupl : baseConfig.d;
    const target = (min + max) / 2;
    const genOpts = { min, max, dupl };

    let best = null;
    let bestDelta = Infinity;

    for (let i = 0; i < 5; i++) {
      const name = generateFromChain(chain, baseConfig, genOpts);
      if (name === "ERROR") continue;
      const len = name.length;
      if (len >= min && len <= max) return name;
      const delta = Math.abs(len - target);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = name;
      }
    }

    if (best) return best;
    return generateFromChain(chain, baseConfig, genOpts);
  }

  function generateBlendedName(contexts, opts) {
    if (!Array.isArray(contexts) || !contexts.length) {
      return { text: "", bases: [] };
    }

    const globalMin = opts && opts.min;
    const globalMax = opts && opts.max;
    const maxSegments = opts && typeof opts.maxSegments === "number" && opts.maxSegments > 0 ? opts.maxSegments : 4;

    const fallbackMin = Math.min(...contexts.map(c => c.base.min || 4));
    const fallbackMax = Math.max(...contexts.map(c => c.base.max || (fallbackMin + 4)));

    const requestedMin = typeof globalMin === "number" ? globalMin : fallbackMin;
    const requestedMax = typeof globalMax === "number" ? globalMax : fallbackMax;
    const targetLen = (requestedMin + requestedMax) / 2;

    function buildOnce() {
      const segs = [];
      let total = 0;
      let guard = 0;

      while (total < requestedMin && guard < maxSegments) {
        let ctx = ra(contexts);

        if (segs.length >= 2) {
          const last1 = segs[segs.length - 1].shape;
          const last2 = segs[segs.length - 2].shape;
          if (last1.isClickLanguage && last2.isClickLanguage && Math.random() < 0.7) {
            const nonClick = contexts.filter(c => !c.isClickHeavy);
            if (nonClick.length) ctx = ra(nonClick);
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

        const jitter = (Math.random() - 0.5) * 2;
        const jitteredMean = Math.max(2, segMean + jitter);

        const baseMax = typeof base.max === "number" ? base.max : Math.round(jitteredMean + 4);
        const segMin = Math.max(2, Math.min(Math.round(jitteredMean), baseMax));
        const segMax = Math.max(segMin + 1, Math.min(baseMax, Math.round(jitteredMean + 2)));

        const segText = generatePlainNameFromChain(ctx.chain, base, {
          min: segMin,
          max: segMax,
          dupl: base.d || ""
        });

        const shape = getSegmentShape(segText, ctx);
        segs.push({ text: segText, ctx, shape });
        total += segText.length;
        guard++;
      }

      if (!segs.length) {
        const ctx = ra(contexts);
        const base = ctx.base;
        const name = generatePlainNameFromChain(ctx.chain, base, {
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

      softenClickRuns(segs);

      let compound = segs[0].text;
      for (let i = 1; i < segs.length; i++) {
        const seg = segs[i];
        compound = smoothJoin(compound, seg.text, seg.ctx.onsetSet);
      }

      return {
        text: sanitizeName(compound),
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

      return { len, penalty };
    }

    let best = null;
    let bestScore = Infinity;

    const attempts = 6;
    for (let i = 0; i < attempts; i++) {
      const { text, segInfos } = buildOnce();
      const { penalty } = scoreCandidate(text, segInfos);
      if (penalty < bestScore) {
        bestScore = penalty;
        best = { text, segInfos };
      }
      const len = text.length;
      if (len >= requestedMin && len <= requestedMax && !isRepetitiveClickPattern(segInfos)) {
        best = { text, segInfos };
        break;
      }
    }

    if (!best) {
      const ctx = ra(contexts);
      const base = ctx.base;
      const name = generatePlainNameFromChain(ctx.chain, base, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || ""
      });
      return { text: sanitizeName(name), bases: [ctx.idx] };
    }

    const usedIdxs = Array.from(new Set(best.segInfos.map(s => s.shape.baseIndex))).sort((a, b) => a - b);
    return { text: best.text, bases: usedIdxs };
  }

  function buildCombinedNames(baseIndices, weights) {
    const combined = [];
    if (!Array.isArray(baseIndices) || !baseIndices.length) return combined;

    const w = normalizeWeights(baseIndices, weights);

    baseIndices.forEach((baseIndex, idx) => {
      const base = nameBases && nameBases[baseIndex];
      if (!base || !base.b) return;

      const names = base.b
        .split(",")
        .map(n => n.trim())
        .filter(Boolean);

      if (!names.length) return;

      const weight = w[idx];
      for (let k = 0; k < weight; k++) combined.push(...names);
    });

    return combined;
  }

  function calculateMixedChain(baseIndices, weights) {
    const combinedNames = buildCombinedNames(baseIndices, weights);
    if (!combinedNames.length) return null;

    const combinedString = combinedNames.join(",");
    return Names.calculateChain(combinedString);
  }

  function generateFromChain(chain, baseConfig, options) {
    if (!chain || chain[""] === undefined) return "ERROR";
    if (!baseConfig || !baseConfig.b) return "ERROR";

    const opts = options || {};
    let min = opts.min != null ? opts.min : baseConfig.min;
    let max = opts.max != null ? opts.max : baseConfig.max;
    let dupl = opts.dupl !== undefined ? opts.dupl : baseConfig.d;

    let v = chain[""],
      cur = ra(v),
      w = "";

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
        } else v = chain[last(cur)] || chain[""];
      }

      w += cur;
      cur = ra(v);
    }

    const l = last(w);
    if (l === "'" || l === " " || l === "-") w = w.slice(0, -1);

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

    if (name.split(" ").some(part => part.length < 2))
      name = name
        .split(" ")
        .map((p, i) => (i ? p.toLowerCase() : p))
        .join("");

    if (name.length < 2) {
      if (ERROR && !_mixedNameTooShortLogged) {
        _mixedNameTooShortLogged = true;
        console.error("Mixed name is too short! Random name will be selected");
      }
      name = ra(baseConfig.b.split(","));
    }

    return sanitizeName(name);
  }

  function getMixedBaseManyV19(baseIndices, options) {
    if (!Array.isArray(baseIndices) || !baseIndices.length) {
      ERROR && console.error("Names.getMixedBaseMany: please provide at least one base index");
      return [];
    }

    const base0 = nameBases && nameBases[baseIndices[0]];
    if (!base0) {
      ERROR && console.error("Names.getMixedBaseMany: base config not found for", baseIndices[0]);
      return [];
    }

    const count = Math.max(1, Math.min(+((options && options.count) || 40), 200));
    const weights = options && options.weights;
    const w = normalizeWeights(baseIndices, weights);
    const rng = makeRng(options && typeof options.seed === "number" ? options.seed : null);

    const baseUniverse = Array.from(new Set(baseIndices)).filter(n => typeof n === "number" && !Number.isNaN(n));
    const availableUniqueBases = baseUniverse.length;
    const minUniqueBases = options && typeof options.minUniqueBases === "number" ? options.minUniqueBases : undefined;
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

    const IS_LETTER_RE = (() => {
      try {
        return new RegExp("\\p{L}", "u");
      } catch (e) {
        return /[A-Za-z]/;
      }
    })();

    const isVowelChar = ch => typeof ch === "string" && ch.length && vowel(ch);
    const isLetterChar = ch => typeof ch === "string" && ch.length && IS_LETTER_RE.test(ch);

    const ctxByIdx = new Map();
    for (const idx of baseUniverse) {
      const base = nameBases && nameBases[idx];
      const blob = base && typeof base.b === "string" ? base.b : "";
      if (!base || !blob) continue;
      const chain = Names.calculateChain(blob);
      if (!chain || chain[""] === undefined) continue;
      const onsetSet = classifyOnsets(blob);
      const clickHeavy = isClickHeavyLanguage(blob);
      ctxByIdx.set(idx, { idx, base, chain, onsetSet, isClickHeavy: clickHeavy });
    }

    if (!ctxByIdx.size) return [];

    const normalizeForRealism = s => (typeof s === "string" ? s.trim().toLowerCase() : "");

    const buildSeedCorpusFromBases = indices => {
      const uniq = Array.from(new Set(Array.isArray(indices) ? indices : []));
      const out = [];
      for (const idx of uniq) {
        const base = nameBases && nameBases[idx];
        const blob = base && typeof base.b === "string" ? base.b : "";
        if (!blob) continue;
        const parts = blob
          .split(",")
          .map(s => normalizeForRealism(s))
          .filter(Boolean);
        for (const p of parts) out.push(p);
      }
      return out;
    };

    const buildCharGramCounts = (texts, n) => {
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
      return { counts, total };
    };

    const buildCharLm = (texts, n) => {
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
        if (!text) return { bpc: null, chars: 0, oovChars: 0 };
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
        return { bpc: chars ? bits / chars : null, chars, oovChars };
      }

      return { scoreBpc };
    };

    const seedNames = buildSeedCorpusFromBases(baseUniverse);
    const seedNorm = seedNames.map(normalizeForRealism).filter(Boolean);
    const seedSet = new Set(seedNorm);
    const lm = buildCharLm(seedNorm, 3);
    const seedGram = buildCharGramCounts(seedNorm, 3);

    const topSeedKeys = Array.from(seedGram.counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1200)
      .map(([k]) => k);

    const topSeedKeyIndex = new Map(topSeedKeys.map((k, i) => [k, i]));
    const headV = topSeedKeys.length + 1;
    const seedDenom = (seedGram.total || 0) + headV;
    const seedHeadCounts = topSeedKeys.map(k => (seedGram.counts.get(k) || 0));
    const seedHeadSum = seedHeadCounts.reduce((a, b) => a + b, 0);
    const seedOther = Math.max(0, (seedGram.total || 0) - seedHeadSum);
    const seedPaHead = seedHeadCounts.map(c => (c + 1) / seedDenom);
    const seedPaOther = (seedOther + 1) / seedDenom;

    const buildHeadCountsForText = text => {
      const headCounts = new Uint16Array(topSeedKeys.length);
      let total = 0;
      if (typeof text !== "string" || text.length < 3) return { headCounts, total: 0 };
      for (let i = 0; i < text.length - 2; i++) {
        const gram = text.slice(i, i + 3);
        total++;
        const idx = topSeedKeyIndex.get(gram);
        if (typeof idx === "number") headCounts[idx]++;
      }
      return { headCounts, total };
    };

    const jsHeadOther = (bHeadCounts, totalB) => {
      const denomB = (totalB || 0) + headV;
      let js = 0;
      let bHeadSum = 0;
      for (let i = 0; i < topSeedKeys.length; i++) {
        const c = bHeadCounts[i] || 0;
        bHeadSum += c;
        const pa = seedPaHead[i];
        const pb = (c + 1) / denomB;
        const m = (pa + pb) / 2;
        js += 0.5 * (pa * Math.log2(pa / m) + pb * Math.log2(pb / m));
      }
      const bOther = Math.max(0, (totalB || 0) - bHeadSum);
      const pa = seedPaOther;
      const pb = (bOther + 1) / denomB;
      const m = (pa + pb) / 2;
      js += 0.5 * (pa * Math.log2(pa / m) + pb * Math.log2(pb / m));
      return js;
    };

    let seedBits = 0;
    let seedChars = 0;
    for (const s of seedNorm) {
      const { bpc, chars } = lm.scoreBpc(s);
      if (typeof bpc !== "number" || !isFinite(bpc) || !chars) continue;
      seedBits += bpc * chars;
      seedChars += chars;
    }
    const seedBpcMean = seedChars ? seedBits / seedChars : null;
    const seedBpcTarget = typeof seedBpcMean === "number" && isFinite(seedBpcMean) ? seedBpcMean + 0.08 : null;

    const REALISM_LAMBDA = 4;
    const JS_LAMBDA = 8;
    const COPY_PENALTY = 12;
    const DUPLICATE_PENALTY = 8;
    const seenGenerated = new Map();

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
      const small = setA.size <= setB.size ? setA : setB;
      const large = small === setA ? setB : setA;
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

    const smoothJoinRng = (a, b, onsetSet) => {
      if (!a) return b;
      if (!b) return a;

      const la = a[a.length - 1];
      const fb = b[0];

      if (!vowel(la) && la === fb && onsetSet && onsetSet.has(la)) {
        return a + b.slice(1);
      }

      if (vowel(la) && !vowel(fb) && onsetSet && onsetSet.has(fb)) {
        if (rng() < 0.7) return a + b.slice(1);
      }

      const laIsAscii = isAsciiLetter(la);
      const fbIsAscii = isAsciiLetter(fb);
      if (laIsAscii && fbIsAscii && fb >= "A" && fb <= "Z") {
        const r = rng();
        if (r < 0.6) {
          return a + " " + b;
        }
        if (r < 0.8) {
          return a + "-" + b;
        }
        return a + fb.toLowerCase() + b.slice(1);
      }

      if (vowel(la) && vowel(fb)) {
        return a + b.slice(1);
      }

      return a + b;
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
        const wts = candidates.map(idx => {
          const nextCtx = ctxByIdx.get(idx);
          const chain = nextCtx ? nextCtx.chain : null;
          let ww = 1;

          if (usedBases.size < requiredUniqueBases) {
            if (!usedBases.has(idx)) ww *= 2.5;
            else ww *= 0.5;
          }

          if (lastNonSpacerBase != null && idx === lastNonSpacerBase) {
            const effectiveRun = runLen > 0 ? runLen : 1;
            if (effectiveRun >= 4) return 0;
            ww *= Math.pow(0.35, Math.max(0, effectiveRun - 1));
          }

          if (prevNonSpacerBase != null && idx === prevNonSpacerBase) ww *= 0.75;
          if (prevCtx && nextCtx && baseSwitchPenalty(prevCtx, nextCtx) >= 3) ww *= 0.25;
          ww *= onsetOverlapScore(prevCtx, nextCtx);

          const jp = estimateJoinPenaltyForBase(chain, compound, prevChar, prevSeg);
          if (jp >= 6) ww *= 0.12;
          else if (jp >= 3) ww *= 0.35;
          else if (jp >= 1) ww *= 0.75;

          return ww;
        });

        const currentBase = weightedPick(candidates, wts);
        const ctx = currentBase != null ? ctxByIdx.get(currentBase) : null;
        const chain = ctx ? ctx.chain : null;
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
            compound = smoothJoinRng(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set());
            if (ctx) segInfos.push({ text: cur, shape: getSegmentShape(cur, ctx) });
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
        compound = smoothJoinRng(compound, cur, ctx && ctx.onsetSet ? ctx.onsetSet : new Set());
        if (ctx) segInfos.push({ text: cur, shape: getSegmentShape(cur, ctx) });

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

      return { text: sanitizeName(name), segTexts: segs, baseSeq, usedBasesCount: usedBases.size };
    }

    const names = [];

    for (let i = 0; i < count; i++) {
      const chosenBases = baseUniverse.slice();

      const baseMins = chosenBases.map(idx => {
        const b = nameBases && nameBases[idx];
        return b && typeof b.min === "number" ? b.min : 4;
      });
      const baseMaxs = chosenBases.map(idx => {
        const b = nameBases && nameBases[idx];
        return b && typeof b.max === "number" ? b.max : 10;
      });
      const fallbackMin = baseMins.length ? Math.min(...baseMins) : 4;
      const fallbackMax = baseMaxs.length ? Math.max(...baseMaxs) : Math.max(fallbackMin + 4, 10);
      const requestedMin = options && typeof options.min === "number" ? options.min : fallbackMin;
      const requestedMax = options && typeof options.max === "number" ? options.max : fallbackMax;

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
        const { bpc } = lm.scoreBpc(norm);
        const realismDelta =
          typeof bpc === "number" && typeof seedBpcTarget === "number" && isFinite(bpc) && isFinite(seedBpcTarget)
            ? REALISM_LAMBDA * (bpc - seedBpcTarget)
            : 0;

        const { headCounts: candHeadCounts, total: candTotal } = buildHeadCountsForText(norm);
        const js = jsHeadOther(candHeadCounts, candTotal);
        const jsPenalty = typeof js === "number" && isFinite(js) ? JS_LAMBDA * js : 0;

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

      const norm = normalizeForRealism(res.text);
      if (norm) seenGenerated.set(norm, (seenGenerated.get(norm) || 0) + 1);
    }

    return names;
  }

  function getMixedBaseMany(baseIndices, options) {
    if (!Array.isArray(baseIndices) || !baseIndices.length) {
      ERROR && console.error("Names.getMixedBaseMany: please provide at least one base index");
      return [];
    }

    const availableIndices = baseIndices.filter(idx => nameBases && nameBases[idx]);
    if (!availableIndices.length) {
      ERROR && console.error("Names.getMixedBaseMany: none of the provided base indices exist", baseIndices);
      return [];
    }

    const base0 = nameBases[availableIndices[0]];
    const count = Math.max(1, Math.min(+((options && options.count) || 40), 200));
    const weights = options && options.weights;
    const useLegacy = options && options.legacyChain;

    if (!useLegacy && shouldUseV19Mixer()) {
      return getMixedBaseManyV19(availableIndices, options);
    }

    if (useLegacy) {
      const chain = calculateMixedChain(availableIndices, weights);
      if (!chain || chain[""] === undefined) {
        tip("Mixed namesbase is incorrect. Please verify bases", false, "error");
        ERROR && console.error("Names.getMixedBaseMany: mixed chain is incorrect");
        return [];
      }

      const legacyNames = [];
      const legacyOptions = Object.assign({}, options);
      delete legacyOptions.count;
      delete legacyOptions.weights;

      for (let i = 0; i < count; i++) {
        let name = generateFromChain(chain, base0, legacyOptions);
        if (name === "ERROR") {
          name = ra(base0.b.split(","));
        }
        legacyNames.push(name);
      }

      return legacyNames;
    }

    const contexts = buildBlendedContexts(availableIndices, weights);
    if (!contexts.length) {
      tip("Mixed namesbase is incorrect. Please verify bases", false, "error");
      ERROR && console.error("Names.getMixedBaseMany: no valid contexts for mixed bases");
      return [];
    }

    const names = [];
    const genOptions = Object.assign({}, options);
    delete genOptions.count;
    delete genOptions.weights;
    delete genOptions.legacyChain;

    for (let i = 0; i < count; i++) {
      const result = generateBlendedName(contexts, genOptions);
      const name = result && result.text;
      if (!name) break;
      names.push(name);
    }

    return names;
  }

  function getMixedBase(baseIndices, options) {
    const opts = options || {};
    const count = opts.count != null ? +opts.count : 1;

    if (count && count > 1) {
      const many = getMixedBaseMany(baseIndices, opts);
      return many[0];
    }

    const many = getMixedBaseMany(baseIndices, Object.assign({}, opts, { count: 1 }));
    return many[0];
  }

  // ISO 639-1 / 639-3 -> mixer map entry alias resolution.
  // Many common languages use their full English name (e.g. "english", "korean") in the
  // mixer map, but the rest of the app passes 2-letter (ISO 639-1) or 3-letter (ISO 639-3)
  // codes. This map bridges the two by translating any common ISO code to the corresponding
  // mixer map key.  When a map key is not known at this stage the lookup falls through
  // to a substring/prefix search in the loaded mixer map.
  const ISO_TO_MAP_KEY = {
    // ISO 639-1 (2-letter) -> mixer map key
    "en": "english", "fr": "standard-french", "es": "spanish", "de": "standard-german",
    "it": "standard-italian", "pt": "european-portuguese", "nl": "dutch", "ru": "russian",
    "ja": "japanese-dialects", "ko": "korean", "zh": "beijing-mandarin", "ar": "standard-arabic",
    "hi": "hindustani", "bn": "bengali", "pa": "punjabi", "tr": "turkish", "vi": "vietnamese",
    "th": "thai", "fa": "persian", "ur": "urdu", "id": "indonesian", "ms": "alor-malay",
    "sw": "settler-swahili", "tl": "tagalog", "el": "greek", "he": "hebrew", "uk": "ukrainian",
    "pl": "polish", "cs": "czech", "sk": "slovak", "hu": "old-hungarian", "fi": "standard-finnish",
    "sv": "swedish", "no": "norwegian", "da": "danish", "is": "icelandic", "ga": "irish",
    "cy": "welsh", "eu": "basque-icelandic-pidgin", "ca": "central-catalan", "ro": "romanian", "bg": "bulgarian",
    "hr": "croatian", "sr": "serbian", "sl": "slovenian", "et": "estonian", "lv": "latvian",
    "lt": "lithuanian", "sq": "albanian", "mk": "macedonian", "bs": "bosnian",
    "mt": "maltese", "af": "afrikaans", "am": "amharic", "yo": "yoruba", "ig": "igbo",
    "ha": "hausa", "so": "somali", "mg": "malagasy", "xh": "xhosa", "zu": "zulu",
    "st": "southern-sotho", "tn": "tswana", "ve": "venda", "ts": "tsonga", "ss": "swati",
    "nr": "southern-ndebele", "nd": "northern-ndebele", "lo": "lao", "km": "khmer", "my": "burmese",
    "mn": "mongolian", "uz": "uzbek", "kk": "kazakh", "ky": "kyrgyz", "tk": "turkmen",
    "tg": "tajik", "az": "azerbaijani", "ka": "georgian", "hy": "armenian", "ne": "nepali",
    "si": "sinhala", "mi": "maori", "haw": "hawaiian", "sm": "samoan", "to": "tongan",
    "fj": "fijian", "qu": "quechua", "ay": "aymara", "gn": "guarani", "nah": "nahuatl",
    "chr": "cherokee", "nv": "navajo", "iu": "inuktitut", "kl": "kalaallisut", "fo": "faroese",
    "ik": "inupiaq", "oj": "ojibwe", "cr": "cree", "dak": "dakota", "gla": "scots-gaelic",
    "br": "breton", "co": "corsican", "rm": "romansh", "fur": "friulian", "lad": "ladino",
    "sc": "sardinian", "ast": "asturian", "an": "aragonese", "lmo": "lombard", "pms": "piemontese",
    "vec": "venetian", "lld": "ladin", "scn": "sicilian", "nap": "neapolitan", "mwl": "mirandese",
    "ext": "extremaduran", "wae": "walser", "gsw": "swiss-german", "nds": "low-german",
    "ksh": "colognian", "gu": "gujarati", "mr": "marathi", "te": "telugu", "ta": "tamil",
    "kn": "kannada", "ml": "malayalam", "or": "oriya", "as": "assamese", "bo": "tibetan",
    "dz": "dzongkha", "jv": "javanese", "su": "sundanese", "ceb": "cebuano", "ilo": "ilocano",
    "war": "waray", "pam": "pampangan", "bcl": "bikol", "pag": "pangasinan", "mad": "madurese",
    "ace": "acehnese", "bjn": "banjar", "mak": "makassarese", "bug": "buginese", "min": "minangkabau",
    "lg": "ganda", "ln": "lingala", "kg": "kongo", "lua": "luba-kasai", "kin": "kinyarwanda",
    "rn": "kirundi", "rw": "kinyarwanda", "ks": "kashmiri", "doi": "dogri", "brx": "bodo",
    "mni": "manipuri", "sat": "santali", "kha": "khasi", "kok": "konkani", "sa": "sanskrit",
    "bho": "bhojpuri", "mag": "magahi", "mai": "maithili", "awa": "awadhi", "rom": "romani",
    "rmy": "vlax-romani", "rmn": "balkan-romani", "kbd": "kabardian", "ady": "adyghe",
    "ava": "avar", "che": "chechen", "inh": "ingush", "os": "ossetian", "ab": "abkhazian",
    "ce": "chechen", "inh": "ingush", "os": "ossetian", "av": "avar", "kbd": "kabardian",
    "ady": "adyghe", "abk": "abkhazian", "lbe": "lak", "lez": "lezgian", "tab": "tabassaran",
    "rut": "rutul", "sah": "yakut", "alt": "altai", "tyv": "tuvinian", "kha": "khakas",
    "chg": "shughni", "krc": "karachay-balkar", "kum": "kumyk", "nog": "nogai",
    "ba": "bashkir", "tt": "tatar", "crh": "crimean-tatar",
    "din": "dinka", "kal": "kalaallisut", "fao": "faroese", "fas": "persian", "tha": "thai",
    "tgl": "tagalog", "mri": "maori", "mya": "burmese", "mon": "mongolian", "hin": "hindustani",
    "uzn": "uzbek", "swh": "swahili", "msa": "malay", "ind": "indonesian", "zul": "zulu",
    "swe": "swedish", "nor": "norwegian", "ces": "czech", "eng": "english", "fra": "french",
    "deu": "german", "ita": "italian", "por": "portuguese", "rus": "russian", "jpn": "japanese",
    "kor": "korean", "cmn": "beijing-mandarin", "ara": "arabic", "ben": "bengali", "tur": "turkish",
    "vie": "vietnamese", "fas": "persian", "urd": "urdu", "ell": "greek", "heb": "hebrew",
    "ukr": "ukrainian", "pol": "polish", "hun": "hungarian", "fin": "finnish", "isl": "icelandic",
    "eus": "basque", "cat": "catalan", "ron": "romanian", "slv": "slovenian", "bos": "bosnian",
    "mlt": "maltese", "afr": "afrikaans", "amh": "amharic", "ibo": "igbo", "hau": "hausa",
    "som": "somali", "mlg": "malagasy", "xho": "xhosa", "sot": "sesotho", "tsn": "setswana",
    "tso": "tsonga", "ssw": "swati", "nde": "ndebele-south", "ndo": "ndebele-north",
    "nya": "chichewa", "loz": "lozi", "kaz": "kazakh", "kir": "kyrgyz", "tuk": "turkmen",
    "tgk": "tajik", "aze": "azerbaijani", "kat": "georgian", "hye": "armenian", "asm": "assamese",
    "mri": "maori", "haw": "hawaiian", "smo": "samoan", "ton": "tongan", "fij": "fijian",
    "que": "quechua", "aym": "aymara", "grn": "guarani", "arn": "mapudungun", "nah": "nahuatl",
    "chr": "cherokee", "nav": "navajo", "iku": "inuktitut", "ipk": "inupiaq", "oji": "ojibwe",
    "cre": "cree", "dak": "dakota", "gla": "scots-gaelic", "bre": "breton", "cor": "corsican",
    "roh": "romansh", "srd": "sardinian", "ast": "asturian", "arg": "aragonese", "ext": "extremaduran",
    "lmo": "lombard", "pms": "piemontese", "vec": "venetian", "lld": "ladin", "scn": "sicilian",
    "nap": "neapolitan", "pdt": "plautdietsch", "wae": "walser", "gsw": "swiss-german", "nds": "low-german",
    "guj": "gujarati", "mar": "marathi", "tel": "telugu", "kan": "kannada", "mal": "malayalam",
    "ori": "oriya", "bod": "tibetan", "dzo": "dzongkha", "sin": "sinhala", "div": "dhivehi",
    "ceb": "cebuano", "min": "minangkabau", "ace": "acehnese", "bjn": "banjar", "war": "waray",
    "pam": "pampangan", "pag": "pangasinan", "bik": "bikol", "mad": "madurese", "mui": "musi",
    "rej": "rejang", "kaw": "kawi",
    // ISO 639-3 (3-letter) -> mixer map key
    "eng": "english", "fra": "standard-french", "spa": "spanish", "deu": "standard-german",
    "ita": "standard-italian", "por": "european-portuguese", "rus": "russian",
    "jpn": "japanese-dialects", "kor": "korean-bamboo-english", "cmn": "beijing-mandarin", "ara": "arabic-javanese-of-klego",
    "hin": "hindustani", "ben": "bengali", "pan": "punjabi", "tur": "turkish", "vie": "vie",
    "tha": "thai", "fas": "persian", "urd": "urdu", "ind": "indonesian", "msa": "alor-malay",
    "swh": "settler-swahili", "tgl": "tagalog", "ell": "greek", "heb": "hebrew", "ukr": "ukrainian",
    "pol": "polish", "ces": "czech", "slk": "slovak", "hun": "old-hungarian", "fin": "standard-finnish",
    "swe": "swedish", "nor": "norwegian", "dan": "danish", "isl": "icelandic", "gle": "irish",
    "cym": "welsh", "eus": "basque-icelandic-pidgin", "cat": "central-catalan", "ron": "romanian", "bul": "bulgarian",
    "hrv": "croatian", "srp": "serbian", "slv": "slovenian", "est": "estonian", "lav": "latvian",
    "lit": "lithuanian", "sqi": "albanian", "mkd": "macedonian", "bos": "bosnian",
    "mlt": "maltese", "afr": "afrikaans", "amh": "amharic", "yor": "yoruba", "ibo": "igbo",
    "hau": "hausa", "som": "somali", "mlg": "malagasy", "xho": "xhosa", "zul": "zulu",
    "sot": "southern-sotho", "tsn": "tswana", "ven": "venda", "tso": "tsonga", "ssw": "swati",
    "nde": "southern-ndebele", "ndo": "northern-ndebele", "loz": "lozi", "nya": "chichewa",
    "lao": "lao", "khm": "khm", "mya": "burmese", "mon": "mongolian", "uzb": "uzbek",
    "kaz": "kazakh", "kir": "kyrgyz", "tuk": "turkmen", "tgk": "tajik", "aze": "azerbaijani",
    "kat": "georgian", "hye": "armenian", "asm": "assamese", "mri": "maori", "haw": "hawaiian",
    "smo": "samoan", "ton": "tongan", "fij": "fijian", "que": "que", "aym": "aymara",
    "grn": "guarani", "arn": "mapudungun", "nah": "nahuatl", "chr": "cherokee", "nav": "navajo",
    "iku": "inuktitut", "kal": "kalaallisut", "fao": "faroese", "ipk": "inupiaq", "oji": "ojibwe",
    "cre": "plains-cree", "dak": "dakota", "gla": "scots-gaelic", "bre": "breton", "cor": "corsican",
    "roh": "romansh", "fur": "friulian", "lad": "ladino", "srd": "sardinian", "ast": "asturian",
    "arg": "aragonese", "ext": "extremaduran", "mwl": "mirandese", "lmo": "lombard", "pms": "piemontese",
    "vec": "venetian", "lld": "ladin", "scn": "sicilian", "nap": "neapolitan", "pdt": "plautdietsch",
    "wae": "walser", "gsw": "swiss-german", "nds": "low-german", "ksh": "colognian",
    "guj": "gujarati", "mar": "marathi", "tel": "telugu", "tam": "tamil", "kan": "kannada",
    "mal": "malayalam", "ori": "oriya", "bod": "tibetan", "dzo": "dzongkha", "sin": "sinhala",
    "div": "dhivehi", "nep": "nepali", "khm": "khm", "lao": "lao", "vie": "vie",
    "msa": "alor-malay", "ind": "indonesian", "tgl": "tagalog", "jav": "javanese", "sun": "sundanese",
    "ceb": "cebuano", "min": "minangkabau", "ace": "acehnese", "bjn": "banjar",
    "mak": "makassarese", "bug": "buginese", "bcl": "bikol", "war": "waray",
    "ilo": "ilocano", "pam": "pampangan", "pag": "pangasinan", "bik": "bikol",
    "mad": "madurese", "mui": "musi", "rej": "rejang", "kaw": "kawi", "din": "dinka",
    "mri": "maori", "haw": "hawaiian", "smo": "samoan", "ton": "tongan", "fij": "fijian",
    "que": "que", "aym": "aymara", "grn": "guarani", "arn": "mapudungun", "nah": "nahuatl",
    "chr": "cherokee", "nav": "navajo", "iku": "inuktitut", "ipk": "inupiaq", "oji": "ojibwe",
    "cre": "plains-cree", "dak": "dakota", "gla": "scots-gaelic", "bre": "breton", "cor": "corsican",
    "roh": "romansh", "srd": "sardinian", "ast": "asturian", "arg": "aragonese", "ext": "extremaduran",
    "lmo": "lombard", "pms": "piemontese", "vec": "venetian", "lld": "ladin", "scn": "sicilian",
    "nap": "neapolitan", "pdt": "plautdietsch", "wae": "walser", "gsw": "swiss-german", "nds": "low-german",
    "guj": "gujarati", "mar": "marathi", "tel": "telugu", "kan": "kannada", "mal": "malayalam",
    "ori": "oriya", "bod": "tibetan", "dzo": "dzongkha", "sin": "sinhala", "div": "dhivehi",
    "ceb": "cebuano", "min": "minangkabau", "ace": "acehnese", "bjn": "banjar", "war": "waray",
    "pam": "pampangan", "pag": "pangasinan", "bik": "bikol", "mad": "madurese", "mui": "musi",
    "rej": "rejang", "kaw": "kawi",
  };

  function getMixedByIso(isoWeights, options) {
    const map = loadLanguageMixerMapSync();

    const baseIndices = [];
    const weights = [];
    const skipped = [];
    const resolved = [];

    if (!isoWeights || typeof isoWeights !== "object") {
      ERROR && console.error("Names.getMixedByIso: isoWeights should be an object like { iso: weight }");
      return [];
    }

    const entries = Object.entries(isoWeights);
    for (const [iso, weight] of entries) {
      const mapKey = resolveIsoToMapKey(iso, map);
      const entry = mapKey ? map.find(e => e.iso === mapKey) : null;
      if (!entry || !Array.isArray(entry.bases) || !entry.bases.length) {
        skipped.push(iso);
        continue;
      }

      // Skip entries whose base indices are "cover language" placeholders (token entries
      // created to satisfy ISO 639-3 macro-language requirements). These entries have
      // empty b: fields and no real name data. Real namebase entries - including
      // displaced duplicates that live in the 200000+ range - all have non-empty
      // b: fields and should be kept.
      const validBases = entry.bases.filter(b => {
        if (b < 0 || !Number.isFinite(b)) return false;
        const e = nameBases && nameBases[b];
        if (!e) return false;
        if (typeof e.b !== "string" || e.b.length === 0) return false;
        if (!e.name || typeof e.name !== "string" || e.name.length === 0) return false;
        return true;
      });
      if (!validBases.length) {
        skipped.push(iso);
        continue;
      }

      validBases.forEach(b => {
        baseIndices.push(b);
        weights.push(weight);
      });
      resolved.push(iso + " -> " + mapKey);
    }

    if (!baseIndices.length) {
      if (skipped.length) {
        tip("No local bases mapped for selected languages: " + skipped.join(", ") + (resolved.length ? " (tried: " + resolved.join(", ") + ")" : ""), false, "warn");
      }
      ERROR && console.error("Names.getMixedByIso: no mapped bases for provided ISO codes");
      return [];
    }

    const opts = Object.assign({}, options, { weights });
    return getMixedBaseMany(baseIndices, opts);
  }

  // Resolve any common ISO 639-1 / 639-3 code to the mixer map's `iso` key for that language.
  // Strategy:
  //   1. Try the explicit alias table (most common codes).
  //   2. Fall back to a substring/prefix search inside the loaded mixer map (covers
  //      rare names and the 'cover' aliases that the previous code-as-key system
  //      could never have looked up).
  function resolveIsoToMapKey(iso, map) {
    if (!iso || typeof iso !== "string") return null;
    const norm = iso.toLowerCase().trim();
    if (!norm) return null;
    if (ISO_TO_MAP_KEY[norm]) return ISO_TO_MAP_KEY[norm];
    if (!map || !Array.isArray(map)) return null;

    // Helper: do a substring/prefix match.
    // We prefer "language-is-dash-prefix-of-key" matches (e.g. "japanese" -> "japanese-dialects")
    // to generic "key-contains-iso" matches (e.g. "nor" -> "north-bauchi").
    function tryMatch(predicate) {
      let first = null;
      for (const entry of map) {
        if (!entry || typeof entry.iso !== "string") continue;
        const key = entry.iso.toLowerCase();
        if (predicate(key)) {
          if (first === null) first = entry.iso;
          // Prefer the key that is shorter (closer to the ISO) on later iterations
          if (entry.iso.length < first.length) first = entry.iso;
        }
      }
      return first;
    }

    // 1. Exact match (case-insensitive)
    if (tryMatch(k => k === norm)) return norm;

    // 2. ISO is the entire key except for a suffix (e.g. "japanese" -> "japanese-dialects")
    if (tryMatch(k => k.startsWith(norm + "-") || k.startsWith(norm + "_"))) {
      return tryMatch(k => k.startsWith(norm + "-") || k.startsWith(norm + "_"));
    }

    // 3. The ISO code appears as a prefix or suffix separated by a dash.
    if (tryMatch(k => k.startsWith(norm) || k.endsWith(norm))) {
      return tryMatch(k => k.startsWith(norm) || k.endsWith(norm));
    }

    // 4. Generic substring match (lowest priority).
    if (tryMatch(k => k.includes(norm) || norm.includes(k))) {
      return tryMatch(k => k.includes(norm) || norm.includes(k));
    }

    return null;
  }

  window.Names.getMixedBase = getMixedBase;
  window.Names.getMixedBaseMany = getMixedBaseMany;
  window.Names.getMixedByIso = getMixedByIso;
})();
