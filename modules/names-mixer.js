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

    const chain = calculateMixedChain(baseIndices, weights);
    if (!chain || chain[""] === undefined) {
      tip("Mixed namesbase is incorrect. Please verify bases", false, "error");
      ERROR && console.error("Names.getMixedBaseMany: mixed chain is incorrect");
      return [];
    }

    const names = [];
    const genOptions = Object.assign({}, options);
    delete genOptions.count;
    delete genOptions.weights;

    for (let i = 0; i < count; i++) {
      const name = generateFromChain(chain, base0, genOptions);
      if (name === "ERROR") break;
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
