"use strict";

(function () {
  if (!window.Names) return;

  // internal cache for ISO→base mapping. Prefer a preloaded JS map (window.languageMixerMap)
  // and fall back to a tiny JSON fetch for older setups.
  let _languageMixerMap = null;

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
    const genOpts = {min, max, dupl};

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
      return {text: "", bases: []};
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
        segs.push({text: segText, ctx, shape});
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
      const ctx = ra(contexts);
      const base = ctx.base;
      const name = generatePlainNameFromChain(ctx.chain, base, {
        min: requestedMin,
        max: requestedMax,
        dupl: base.d || ""
      });
      return {text: name, bases: [ctx.idx]};
    }

    const usedIdxs = Array.from(new Set(best.segInfos.map(s => s.shape.baseIndex))).sort((a, b) => a - b);
    return {text: best.text, bases: usedIdxs};
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
      ERROR && console.error("Mixed name is too short! Random name will be selected");
      name = ra(baseConfig.b.split(","));
    }

    return name;
  }

  function getMixedBaseMany(baseIndices, options) {
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
    const useLegacy = options && options.legacyChain;

    if (useLegacy) {
      const chain = calculateMixedChain(baseIndices, weights);
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
        const name = generateFromChain(chain, base0, legacyOptions);
        if (name === "ERROR") break;
        legacyNames.push(name);
      }

      return legacyNames;
    }

    const contexts = buildBlendedContexts(baseIndices, weights);
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

    const many = getMixedBaseMany(baseIndices, Object.assign({}, opts, {count: 1}));
    return many[0];
  }

  function getMixedByIso(isoWeights, options) {
    const map = loadLanguageMixerMapSync();

    const baseIndices = [];
    const weights = [];
    const skipped = [];

    if (!isoWeights || typeof isoWeights !== "object") {
      ERROR && console.error("Names.getMixedByIso: isoWeights should be an object like { iso: weight }");
      return [];
    }

    const entries = Object.entries(isoWeights);
    for (const [iso, weight] of entries) {
      const entry = map.find(e => e.iso === iso);
      if (!entry || !Array.isArray(entry.bases) || !entry.bases.length) {
        skipped.push(iso);
        continue;
      }

      entry.bases.forEach(b => {
        baseIndices.push(b);
        weights.push(weight);
      });
    }

    if (!baseIndices.length) {
      if (skipped.length) {
        tip("No local bases mapped for selected languages: " + skipped.join(", "), false, "warn");
      }
      ERROR && console.error("Names.getMixedByIso: no mapped bases for provided ISO codes");
      return [];
    }

    const opts = Object.assign({}, options, {weights});
    return getMixedBaseMany(baseIndices, opts);
  }

  Names.getMixedBase = getMixedBase;
  Names.getMixedBaseMany = getMixedBaseMany;
  Names.getMixedByIso = getMixedByIso;
})();
