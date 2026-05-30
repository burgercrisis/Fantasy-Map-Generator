"use strict";

window.Cultures = (function () {
  let cells;

  const generate = function () {
    TIME && console.time("generateCultures");
    cells = pack.cells;

    const cultureIds = new Uint16Array(cells.i.length); // cell cultures

    const culturesInputNumber = +byId("culturesInput").value;
    const culturesInSetNumber = +byId("culturesSet").selectedOptions[0].dataset.max;
    let count = Math.min(culturesInputNumber, culturesInSetNumber);

    const populated = cells.i.filter(i => cells.s[i]); // populated cells
    if (populated.length < count * 25) {
      count = Math.floor(populated.length / 50);
      if (!count) {
        WARN && console.warn(`There are no populated cells. Cannot generate cultures`);
        pack.cultures = [{ name: "Wildlands", i: 0, base: 1, shield: "round" }];
        cells.culture = cultureIds;

        alertMessage.innerHTML = /* html */ `The climate is harsh and people cannot live in this world.<br />
          No cultures, states and burgs will be created.<br />
          Please consider changing climate settings in the World Configurator`;

        $("#alert").dialog({
          resizable: false,
          title: "Extreme climate warning",
          buttons: {
            Ok: function () {
              $(this).dialog("close");
            }
          }
        });
        return;
      } else {
        WARN && console.warn(`Not enough populated cells (${populated.length}). Will generate only ${count} cultures`);
        alertMessage.innerHTML = /* html */ ` There are only ${populated.length} populated cells and it's insufficient livable area.<br />
          Only ${count} out of ${culturesInput.value} requested cultures will be generated.<br />
          Please consider changing climate settings in the World Configurator`;
        $("#alert").dialog({
          resizable: false,
          title: "Extreme climate warning",
          buttons: {
            Ok: function () {
              $(this).dialog("close");
            }
          }
        });
      }
    }

    const cultures = (pack.cultures = selectCultures(count));
    const centers = d3.quadtree();
    const colors = getColors(count);
    const emblemShape = document.getElementById("emblemShape").value;

    const codes = [];

    cultures.forEach(function (c, i) {
      const newId = i + 1;

      if (c.lock) {
        codes.push(c.code);
        centers.add(c.center);

        for (const i of cells.i) {
          if (cells.culture[i] === c.i) cultureIds[i] = newId;
        }

        c.i = newId;
        return;
      }

      const sortingFn = c.sort ? c.sort : i => cells.s[i];
      const center = placeCenter(sortingFn);

      centers.add(cells.p[center]);
      c.center = center;
      c.i = newId;
      delete c.odd;
      delete c.sort;
      c.color = colors[i];
      c.type = defineCultureType(center);
      c.expansionism = defineCultureExpansionism(c.type);
      c.origins = [0];
      c.code = abbreviate(c.name, codes);
      codes.push(c.code);
      cultureIds[center] = newId;
      if (emblemShape === "random") c.shield = getRandomShield();
    });

    cells.culture = cultureIds;

    function placeCenter(sortingFn) {
      let spacing = (graphWidth + graphHeight) / 2 / count;
      const MAX_ATTEMPTS = 100;

      const sorted = [...populated].sort((a, b) => sortingFn(b) - sortingFn(a));
      const max = Math.floor(sorted.length / 2);

      let cellId = 0;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        cellId = sorted[biased(0, max, 5)];
        spacing *= 0.9;
        if (!cultureIds[cellId] && !centers.find(cells.p[cellId][0], cells.p[cellId][1], spacing)) break;
      }

      return cellId;
    }

    // the first culture with id 0 is for wildlands
    cultures.unshift({ name: "Wildlands", i: 0, base: 1, origins: [null], shield: "round" });

    // make sure all bases exist in nameBases
    if (!nameBases.length) {
      ERROR && console.error("Name base is empty, default nameBases will be applied");
      nameBases = Names.getNameBases();
    }

    const getCultureMixerSeed = cultureId => {
      const seedStr = typeof seed === "string" ? seed : String(seed || "");
      let h = 2166136261;
      const s = `culture-mixer|${seedStr}|${cultureId}`;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };

    const makeRng = seedInt => {
      let x = seedInt >>> 0;
      return () => {
        x += 0x6d2b79f5;
        let t = x;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const buildCultureMixerIsoWeights = cultureId => {
      const catalog = Array.isArray(window.languageMixerCatalog) ? window.languageMixerCatalog : [];
      if (!catalog.length) return null;

      const culture = pack.cultures && pack.cultures[cultureId];
      if (culture && typeof getRaceLanguageIsoWeights === "function") {
        const raceName = typeof getRaceNameForCulture === "function" ? getRaceNameForCulture(culture) : "";
        if (raceName) {
          const weights = getRaceLanguageIsoWeights(raceName);
          if (weights) return weights;
        }
      }

      const languages = catalog.filter(l => l && l.iso && !(l.tags && l.tags.includes("family")));
      if (!languages.length) return null;

      const rng = makeRng(getCultureMixerSeed(cultureId));
      const isoWeights = {};

      const picks = 3 + Math.floor(rng() * 4); // 3..6
      for (let i = 0; i < picks; i++) {
        const lang = languages[Math.floor(rng() * languages.length)];
        if (!lang || !lang.iso) continue;
        isoWeights[lang.iso] = (isoWeights[lang.iso] || 0) + 1;
      }

      return Object.keys(isoWeights).length ? isoWeights : null;
    };

    const generateFictionalDisplayNameFromNames = (names, options) => {
      if (!Names || typeof Names.calculateChain !== "function") return "";
      if (!Array.isArray(names) || names.length < 3) return "";

      const sanitized = names
        .map(n =>
          String(n || "")
            .replace(/[/|,\d]/g, "")
            .replace(/_unq\d+\b/gi, "")
            .replace(/_/g, "")
            .trim()
        )
        .filter(Boolean);

      if (sanitized.length < 3) return "";

      const chain = Names.calculateChain(sanitized.join(","));
      if (!chain || chain[""] === undefined) return "";

      const seedInt = options && typeof options.seed === "number" ? (options.seed >>> 0) : 0;
      const rng = makeRng(seedInt || 1);
      const pick = arr => arr[Math.floor(rng() * arr.length)];

      const min = 4;
      const max = 14;
      const dupl = "lnrt";

      let v = chain[""],
        cur = pick(v),
        w = "";

      for (let i = 0; i < 20; i++) {
        if (cur === "") {
          if (w.length < min) {
            cur = "";
            w = "";
            v = chain[""];
          } else break;
        } else {
          if (w.length + cur.length > max) {
            if (w.length < min) w += cur;
            break;
          } else v = chain[last(cur)] || chain[""];
        }

        w += cur;
        cur = pick(v);
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

      name = String(name || "").trim();
      if (!name || name.length < 4) return "";
      if (/^(elven|dwarven|orcish|draconic)$/i.test(name)) return "";
      if (/\s/.test(name)) return "";
      return name;
    };

    const ensureCultureMixerBaseIndex = cultureId => {
      if (!Names || typeof Names.getMixedByIso !== "function") return null;

      const existingIndex =
        Array.isArray(nameBases) &&
        nameBases.findIndex(b => b && b.cultureMixer && b.cultureMixerFor === cultureId);
      if (existingIndex >= 0) return existingIndex;

      const isoWeights = buildCultureMixerIsoWeights(cultureId);
      if (!isoWeights) return null;

      const mixSeed = getCultureMixerSeed(cultureId);
      const count = 240;
      let names;
      try {
        names = Names.getMixedByIso(isoWeights, { count, seed: mixSeed });
      } catch (e) {
        return null;
      }

      if (!Array.isArray(names) || names.length < 3) return null;
      const sanitized = names
        .map(n =>
          String(n || "")
            .replace(/[/|,\d]/g, "")
            .replace(/_unq\d+\b/gi, "")
            .replace(/_/g, "")
            .trim()
        )
        .filter(Boolean);
      if (sanitized.length < 3) return null;

      let min = 4;
      let max = 12;
      try {
        const lengths = sanitized.map(n => n.length).sort((a, b) => a - b);
        const q = p => lengths[Math.floor(p * (lengths.length - 1))];
        const p25 = q(0.25);
        const p75 = q(0.75);
        const computedMin = Math.max(3, Math.min(12, Math.floor(p25)));
        const computedMax = Math.max(computedMin, Math.min(16, Math.ceil(p75) + 2));
        min = computedMin;
        max = computedMax;
      } catch (e) { }

      const nameSeed = (mixSeed ^ 0x9e3779b9) >>> 0;
      const displayName = generateFictionalDisplayNameFromNames(sanitized, { seed: nameSeed });
      const b = sanitized.join(",");
      const baseIndex = nameBases.length;

      const fallbackName = (() => {
        const sample = sanitized[0] ? String(sanitized[0]).trim() : "";
        if (sample.length >= 4 && !/\s/.test(sample)) {
          return sample.charAt(0).toUpperCase() + sample.slice(1).toLowerCase();
        }
        const consonants = "bcdfghjklmnpqrstvwxz";
        const vowels = "aeiouy";
        const rng = makeRng(nameSeed || 1);
        const pick = s => s[Math.floor(rng() * s.length)];
        let out = "";
        const target = 6 + Math.floor(rng() * 4);
        while (out.length < target) {
          out += pick(consonants) + pick(vowels);
          if (rng() < 0.15) out += pick(consonants);
        }
        out = out.slice(0, Math.min(10, Math.max(5, target)));
        return out.charAt(0).toUpperCase() + out.slice(1);
      })();

      nameBases.push({
        name: displayName || fallbackName,
        min,
        max,
        d: "",
        m: 0,
        b,
        cultureMixer: true,
        cultureMixerFor: cultureId,
        isoWeights
      });
      if (typeof window.refreshDefaultNameBaseIds === "function") {
        window.refreshDefaultNameBaseIds();
      }

      return baseIndex;
    };

    function selectCultures(culturesNumber) {
      let defaultCultures = getDefault(culturesNumber);
      const cultures = [];

      pack.cultures?.forEach(function (culture) {
        if (culture.lock && !culture.removed) cultures.push(culture);
      });

      if (!cultures.length) {
        if (culturesNumber === defaultCultures.length) return defaultCultures;
        if (defaultCultures.every(d => d.odd === 1)) return defaultCultures.splice(0, culturesNumber);
      }

      for (let culture, rnd, i = 0; cultures.length < culturesNumber && defaultCultures.length > 0;) {
        do {
          rnd = rand(defaultCultures.length - 1);
          culture = defaultCultures[rnd];
          i++;
        } while (i < 200 && !P(culture.odd));
        cultures.push(culture);
        defaultCultures.splice(rnd, 1);
      }
      return cultures;
    }

    // set culture type based on culture center position
    function defineCultureType(i) {
      if (cells.h[i] < 70 && [1, 2, 4].includes(cells.biome[i])) return "Nomadic"; // high penalty in forest biomes and near coastline
      if (cells.h[i] > 50) return "Highland"; // no penalty for hills and moutains, high for other elevations
      const f = pack.features[cells.f[cells.haven[i]]]; // opposite feature
      if (f.type === "lake" && f.cells > 5) return "Lake"; // low water cross penalty and high for growth not along coastline
      if (
        (cells.harbor[i] && f.type !== "lake" && P(0.1)) ||
        (cells.harbor[i] === 1 && P(0.6)) ||
        (pack.features[cells.f[i]].group === "isle" && P(0.4))
      )
        return "Naval"; // low water cross penalty and high for non-along-coastline growth
      if (cells.r[i] && cells.fl[i] > 100) return "River"; // no River cross penalty, penalty for non-River growth
      if (cells.t[i] > 2 && [3, 7, 8, 9, 10, 12].includes(cells.biome[i])) return "Hunting"; // high penalty in non-native biomes
      return "Generic";
    }

    function defineCultureExpansionism(type) {
      let base = 1; // Generic
      if (type === "Lake") base = 0.8;
      else if (type === "Naval") base = 1.5;
      else if (type === "River") base = 0.9;
      else if (type === "Nomadic") base = 1.5;
      else if (type === "Hunting") base = 0.7;
      else if (type === "Highland") base = 1.2;
      return rn(((Math.random() * byId("sizeVariety").value) / 2 + 1) * base, 1);
    }

    // Assign mixer bases to all cultures (except wildlands at index 0)
    for (const c of (pack.cultures || [])) {
      if (!c || c.i === 0 || c.removed) continue;
      const baseIndex = ensureCultureMixerBaseIndex(c.i);
      if (typeof baseIndex === "number") c.base = baseIndex;
    }

    TIME && console.timeEnd("generateCultures");
  };

  const add = function (center) {
    const defaultCultures = getDefault();
    let culture, base, name;

    if (pack.cultures.length < defaultCultures.length) {
      // add one of the default cultures
      culture = pack.cultures.length;
      base = defaultCultures[culture].base;
      name = defaultCultures[culture].name;
    } else {
      // add random culture besed on one of the current ones
      culture = rand(pack.cultures.length - 1);
      name = Names.getCulture(culture, 5, 8, "");
      base = pack.cultures[culture].base;
    }

    const code = abbreviate(
      name,
      pack.cultures.map(c => c.code)
    );
    const i = pack.cultures.length;
    const color = getRandomColor();

    // define emblem shape
    let shield = culture.shield;
    const emblemShape = document.getElementById("emblemShape").value;
    if (emblemShape === "random") shield = getRandomShield();

    pack.cultures.push({
      name,
      color,
      base,
      center,
      i,
      expansionism: 1,
      type: "Generic",
      cells: 0,
      area: 0,
      rural: 0,
      urban: 0,
      origins: [pack.cells.culture[center]],
      code,
      shield
    });
  };

  const getDefault = function (count) {
    // generic sorting functions
    const cells = pack.cells,
      s = cells.s,
      sMax = d3.max(s),
      t = cells.t,
      h = cells.h,
      temp = grid.cells.temp;
    const n = cell => Math.ceil((s[cell] / sMax) * 3); // normalized cell score
    const td = (cell, goal) => {
      const d = Math.abs(temp[cells.g[cell]] - goal);
      return d ? d + 1 : 1;
    }; // temperature difference fee
    const bd = (cell, biomes, fee = 4) => (biomes.includes(cells.biome[cell]) ? 1 : fee); // biome difference fee
    const sf = (cell, fee = 4) =>
      cells.haven[cell] && pack.features[cells.f[cells.haven[cell]]].type !== "lake" ? 1 : fee; // not on sea coast fee

    if (culturesSet.value === "european") {
      return [
        { name: "Shwazen", base: 0, odd: 1, sort: i => n(i) / td(i, 10) / bd(i, [6, 8]), shield: "swiss" },
        { name: "Angshire", base: 1, odd: 1, sort: i => n(i) / td(i, 10) / sf(i), shield: "wedged" },
        { name: "Luari", base: 2, odd: 1, sort: i => n(i) / td(i, 12) / bd(i, [6, 8]), shield: "french" },
        { name: "Tallian", base: 3, odd: 1, sort: i => n(i) / td(i, 15), shield: "horsehead" },
        { name: "Astellian", base: 4, odd: 1, sort: i => n(i) / td(i, 16), shield: "spanish" },
        { name: "Slovan", base: 5, odd: 1, sort: i => (n(i) / td(i, 6)) * t[i], shield: "polish" },
        { name: "Norse", base: 6, odd: 1, sort: i => n(i) / td(i, 5), shield: "heater" },
        { name: "Elladan", base: 7, odd: 1, sort: i => (n(i) / td(i, 18)) * h[i], shield: "boeotian" },
        { name: "Romian", base: 8, odd: 0.2, sort: i => n(i) / td(i, 15) / t[i], shield: "roman" },
        { name: "Soumi", base: 9, odd: 1, sort: i => (n(i) / td(i, 5) / bd(i, [9])) * t[i], shield: "pavise" },
        { name: "Portuzian", base: 13, odd: 1, sort: i => n(i) / td(i, 17) / sf(i), shield: "renaissance" },
        { name: "Vengrian", base: 15, odd: 1, sort: i => (n(i) / td(i, 11) / bd(i, [4])) * t[i], shield: "horsehead2" },
        { name: "Turchian", base: 16, odd: 0.05, sort: i => n(i) / td(i, 14), shield: "round" },
        { name: "Euskati", base: 20, odd: 0.05, sort: i => (n(i) / td(i, 15)) * h[i], shield: "oldFrench" },
        { name: "Keltan", base: 22, odd: 0.05, sort: i => (n(i) / td(i, 11) / bd(i, [6, 8])) * t[i], shield: "oval" }
      ];
    }

    if (culturesSet.value === "oriental") {
      return [
        { name: "Koryo", base: 10, odd: 1, sort: i => n(i) / td(i, 12) / t[i], shield: "round" },
        { name: "Hantzu", base: 11, odd: 1, sort: i => n(i) / td(i, 13), shield: "banner" },
        { name: "Yamoto", base: 12, odd: 1, sort: i => n(i) / td(i, 15) / t[i], shield: "round" },
        { name: "Turchian", base: 16, odd: 1, sort: i => n(i) / td(i, 12), shield: "round" },
        {
          name: "Berberan",
          base: 17,
          odd: 0.2,
          sort: i => (n(i) / td(i, 19) / bd(i, [1, 2, 3], 7)) * t[i],
          shield: "oval"
        },
        { name: "Eurabic", base: 18, odd: 1, sort: i => (n(i) / td(i, 26) / bd(i, [1, 2], 7)) * t[i], shield: "oval" },
        { name: "Efratic", base: 23, odd: 0.1, sort: i => (n(i) / td(i, 22)) * t[i], shield: "round" },
        { name: "Tehrani", base: 24, odd: 1, sort: i => (n(i) / td(i, 18)) * h[i], shield: "round" },
        { name: "Maui", base: 25, odd: 0.2, sort: i => n(i) / td(i, 24) / sf(i) / t[i], shield: "vesicaPiscis" },
        { name: "Carnatic", base: 26, odd: 0.5, sort: i => n(i) / td(i, 26), shield: "round" },
        { name: "Vietic", base: 29, odd: 0.8, sort: i => n(i) / td(i, 25) / bd(i, [7], 7) / t[i], shield: "banner" },
        { name: "Guantzu", base: 30, odd: 0.5, sort: i => n(i) / td(i, 17), shield: "banner" },
        { name: "Ulus", base: 31, odd: 1, sort: i => (n(i) / td(i, 5) / bd(i, [2, 4, 10], 7)) * t[i], shield: "banner" }
      ];
    }

    if (culturesSet.value === "english") {
      const getName = () => Names.getBase(1, 5, 9, "", 0);
      return [
        { name: getName(), base: 1, odd: 1, shield: "heater" },
        { name: getName(), base: 1, odd: 1, shield: "wedged" },
        { name: getName(), base: 1, odd: 1, shield: "swiss" },
        { name: getName(), base: 1, odd: 1, shield: "oldFrench" },
        { name: getName(), base: 1, odd: 1, shield: "swiss" },
        { name: getName(), base: 1, odd: 1, shield: "spanish" },
        { name: getName(), base: 1, odd: 1, shield: "hessen" },
        { name: getName(), base: 1, odd: 1, shield: "fantasy5" },
        { name: getName(), base: 1, odd: 1, shield: "fantasy4" },
        { name: getName(), base: 1, odd: 1, shield: "fantasy1" }
      ];
    }

    if (culturesSet.value === "antique") {
      return [
        { name: "Roman", base: 8, odd: 1, sort: i => n(i) / td(i, 14) / t[i], shield: "roman" }, // Roman
        { name: "Roman", base: 8, odd: 1, sort: i => n(i) / td(i, 15) / sf(i), shield: "roman" }, // Roman
        { name: "Roman", base: 8, odd: 1, sort: i => n(i) / td(i, 16) / sf(i), shield: "roman" }, // Roman
        { name: "Roman", base: 8, odd: 1, sort: i => n(i) / td(i, 17) / t[i], shield: "roman" }, // Roman
        { name: "Hellenic", base: 7, odd: 1, sort: i => (n(i) / td(i, 18) / sf(i)) * h[i], shield: "boeotian" }, // Greek
        { name: "Hellenic", base: 7, odd: 1, sort: i => (n(i) / td(i, 19) / sf(i)) * h[i], shield: "boeotian" }, // Greek
        { name: "Macedonian", base: 7, odd: 0.5, sort: i => (n(i) / td(i, 12)) * h[i], shield: "round" }, // Greek
        { name: "Celtic", base: 22, odd: 1, sort: i => n(i) / td(i, 11) ** 0.5 / bd(i, [6, 8]), shield: "round" },
        { name: "Germanic", base: 0, odd: 1, sort: i => n(i) / td(i, 10) ** 0.5 / bd(i, [6, 8]), shield: "round" },
        { name: "Persian", base: 24, odd: 0.8, sort: i => (n(i) / td(i, 18)) * h[i], shield: "oval" }, // Iranian
        { name: "Scythian", base: 24, odd: 0.5, sort: i => n(i) / td(i, 11) ** 0.5 / bd(i, [4]), shield: "round" }, // Iranian
        { name: "Cantabrian", base: 20, odd: 0.5, sort: i => (n(i) / td(i, 16)) * h[i], shield: "oval" }, // Basque
        { name: "Estian", base: 9, odd: 0.2, sort: i => (n(i) / td(i, 5)) * t[i], shield: "pavise" }, // Finnic
        { name: "Carthaginian", base: 42, odd: 0.3, sort: i => n(i) / td(i, 20) / sf(i), shield: "oval" }, // Levantine
        { name: "Hebrew", base: 42, odd: 0.2, sort: i => (n(i) / td(i, 19)) * sf(i), shield: "oval" }, // Levantine
        { name: "Mesopotamian", base: 23, odd: 0.2, sort: i => n(i) / td(i, 22) / bd(i, [1, 2, 3]), shield: "oval" } // Mesopotamian
      ];
    }

    if (culturesSet.value === "highFantasy") {
      return [
        // fantasy races
        {
          name: "Quenian (Elfish)",
          base: 33,
          odd: 1,
          sort: i => (n(i) / bd(i, [6, 7, 8, 9], 10)) * t[i],
          shield: "gondor"
        }, // Elves
        {
          name: "Eldar (Elfish)",
          base: 33,
          odd: 1,
          sort: i => (n(i) / bd(i, [6, 7, 8, 9], 10)) * t[i],
          shield: "noldor"
        }, // Elves
        {
          name: "Trow (Dark Elfish)",
          base: 34,
          odd: 0.9,
          sort: i => (n(i) / bd(i, [7, 8, 9, 12], 10)) * t[i],
          shield: "hessen"
        }, // Dark Elves
        {
          name: "Lothian (Dark Elfish)",
          base: 34,
          odd: 0.3,
          sort: i => (n(i) / bd(i, [7, 8, 9, 12], 10)) * t[i],
          shield: "wedged"
        }, // Dark Elves
        { name: "Dunirr (Dwarven)", base: 35, odd: 1, sort: i => n(i) + h[i], shield: "ironHills" }, // Dwarfs
        { name: "Khazadur (Dwarven)", base: 35, odd: 1, sort: i => n(i) + h[i], shield: "erebor" }, // Dwarfs
        { name: "Kobold (Goblin)", base: 36, odd: 1, sort: i => t[i] - s[i], shield: "moriaOrc" }, // Goblin
        { name: "Uruk (Orkish)", base: 37, odd: 1, sort: i => h[i] * t[i], shield: "urukHai" }, // Orc
        {
          name: "Ugluk (Orkish)",
          base: 37,
          odd: 0.5,
          sort: i => (h[i] * t[i]) / bd(i, [1, 2, 10, 11]),
          shield: "moriaOrc"
        }, // Orc
        { name: "Yotunn (Giants)", base: 38, odd: 0.7, sort: i => td(i, -10), shield: "pavise" }, // Giant
        { name: "Rake (Drakonic)", base: 39, odd: 0.7, sort: i => -s[i], shield: "fantasy2" }, // Draconic
        { name: "Arago (Arachnid)", base: 40, odd: 0.7, sort: i => t[i] - s[i], shield: "horsehead2" }, // Arachnid
        { name: "Aj'Snaga (Serpents)", base: 41, odd: 0.7, sort: i => n(i) / bd(i, [12], 10), shield: "fantasy1" }, // Serpents
        {
          name: "Shirefolk (Halfling)",
          base: 43,
          odd: 0.8,
          sort: i => n(i) / td(i, 12),
          shield: "square"
        },
        {
          name: "Whisperdelve (Gnomish)",
          base: 44,
          odd: 0.7,
          sort: i => n(i) + h[i],
          shield: "diamond"
        },
        {
          name: "Letharim (Half-Elven)",
          base: 45,
          odd: 0.9,
          sort: i => (n(i) / bd(i, [6, 7, 8, 9], 8)) * t[i],
          shield: "fantasy5"
        },
        {
          name: "Gor-Khaal (Half-Orcish)",
          base: 46,
          odd: 0.7,
          sort: i => (h[i] * t[i]) / bd(i, [1, 2, 10, 11], 8),
          shield: "moriaOrc"
        },
        {
          name: "Ashborn (Tiefling)",
          base: 47,
          odd: 0.6,
          sort: i => n(i) / (bd(i, [1, 2, 3], 8) * td(i, 28)),
          shield: "fantasy2"
        },
        {
          name: "Dawnmarked (Aasimar)",
          base: 48,
          odd: 0.5,
          sort: i => n(i) / (bd(i, [4, 6, 8], 6) * td(i, 16)),
          shield: "pavise"
        },
        {
          name: "Dharg Legion (Hobgoblin)",
          base: 49,
          odd: 0.8,
          sort: i => (n(i) * t[i]) / (bd(i, [3, 4, 5, 6], 8) * td(i, 15)),
          shield: "gonfalon"
        },
        {
          name: "Skyborn Tribes (Goliath)",
          base: 50,
          odd: 0.6,
          sort: i => (n(i) + h[i]) / (bd(i, [9, 10], 6) * td(i, 0)),
          shield: "pavise"
        },
        {
          name: "Ssarth Swampclans (Lizardfolk)",
          base: 51,
          odd: 0.7,
          sort: i => n(i) / (bd(i, [7, 12], 20) * td(i, 27)),
          shield: "square"
        },
        {
          name: "Moonscar (Shifter)",
          base: 52,
          odd: 0.7,
          sort: i => (n(i) * t[i]) / (bd(i, [3, 5, 6, 7, 8], 6) * td(i, 14)),
          shield: "fantasy4"
        },
        {
          name: "Carruth Packs (Gnoll)",
          base: 53,
          odd: 0.7,
          sort: i => n(i) / (bd(i, [3, 4], 10) * td(i, 26)),
          shield: "square"
        },
        {
          name: "Grimwood Clans (Bugbear)",
          base: 54,
          odd: 0.6,
          sort: i => n(i) / (bd(i, [5, 6], 8) * td(i, 14)),
          shield: "hessen"
        },
        {
          name: "Zahari Pride (Tabaxi)",
          base: 55,
          odd: 0.5,
          sort: i => n(i) / (bd(i, [5, 7], 8) * td(i, 28)),
          shield: "fantasy3"
        },
        {
          name: "Cogsforge Legion (Warforged)",
          base: 56,
          odd: 0.4,
          sort: i => n(i) / (bd(i, [3, 4, 6, 8], 4) * td(i, 16)),
          shield: "fantasy5"
        },
        {
          name: "Ravenflock (Kenku)",
          base: 57,
          odd: 0.5,
          sort: i => n(i) / (bd(i, [6, 8, 12], 8) * td(i, 10)),
          shield: "banner"
        },
        {
          name: "Skyspiral Aeries (Aarakocra)",
          base: 58,
          odd: 0.4,
          sort: i => (n(i) + h[i]) / (bd(i, [3, 4, 9, 10], 6) * td(i, -2)),
          shield: "oldFrench"
        },
        {
          name: "Ashscale Concord (Dragonborn)",
          base: 59,
          odd: 0.4,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 2, 3], 8) * td(i, 24)),
          shield: "fantasy2"
        },
        {
          name: "Tideborn Courts (Triton)",
          base: 60,
          odd: 0.3,
          sort: i => n(i) / (sf(i, 10) * td(i, 18)),
          shield: "swiss"
        },
        {
          name: "Ssserathi Coil (Yuan-ti)",
          base: 61,
          odd: 0.4,
          sort: i => n(i) / (bd(i, [5, 7, 12], 8) * td(i, 26)),
          shield: "fantasy1"
        },
        {
          name: "Deepwild Clans (Firbolg)",
          base: 62,
          odd: 0.4,
          sort: i => n(i) / (bd(i, [6, 8, 9], 8) * td(i, 8)),
          shield: "pavise"
        },
        {
          name: "Astral Concord (Gith)",
          base: 63,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 2, 9, 10], 8) * td(i, 0)),
          shield: "banner"
        },
        {
          name: "Elemental Diaspora (Genasi)",
          base: 64,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [1, 3, 7, 10], 8) * td(i, 20)),
          shield: "diamond"
        },
        {
          name: "Veilbound (Changeling)",
          base: 65,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [4, 6, 8, 12], 6) * td(i, 16)),
          shield: "fantasy4"
        },
        {
          name: "Wildsong Courts (Satyr)",
          base: 66,
          odd: 0.35,
          sort: i => n(i) / (bd(i, [4, 6, 8], 6) * td(i, 14)),
          shield: "fantasy3"
        },
        {
          name: "Labyrinth Clans (Minotaur)",
          base: 67,
          odd: 0.3,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 3, 4], 8) * td(i, 22)),
          shield: "square"
        },
        {
          name: "Dreambound Orders (Kalashtar)",
          base: 68,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [4, 9, 10], 8) * td(i, 8)),
          shield: "banner"
        },
        {
          name: "Redscale Warrens (Kobold)",
          base: 69,
          odd: 0.4,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 2, 3, 4], 8) * td(i, 18)),
          shield: "fantasy2"
        },
        {
          name: "Deepforge Clans (Duergar)",
          base: 70,
          odd: 0.3,
          sort: i => (n(i) + h[i]) / (bd(i, [2, 9, 10], 8) * td(i, 0)),
          shield: "erebor"
        },
        {
          name: "Crimson Courts (Dhampir)",
          base: 71,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [4, 6, 12], 8) * td(i, 10)),
          shield: "fantasy4"
        },
        {
          name: "Gravesworn Host (Reborn)",
          base: 72,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [3, 4, 6, 10], 8) * td(i, 6)),
          shield: "square"
        },
        {
          name: "Shadowfell Vanguard (Shadar-kai)",
          base: 73,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [9, 10, 12], 8) * td(i, 0)),
          shield: "banner"
        },
        {
          name: "Hexweald Covens (Hexblood)",
          base: 74,
          odd: 0.25,
          sort: i => n(i) / (bd(i, [6, 8, 12], 6) * td(i, 12)),
          shield: "fantasy1"
        },
        {
          name: "Stormhoof Clans (Centaur)",
          base: 75,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [3, 4, 5], 8) * td(i, 16)),
          shield: "wedged"
        },
        {
          name: "Sunmane Prides (Leonin)",
          base: 76,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [3, 1, 5], 8) * td(i, 24)),
          shield: "square"
        },
        {
          name: "Ivory Concord (Loxodon)",
          base: 77,
          odd: 0.25,
          sort: i => n(i) / (bd(i, [4, 6, 8], 8) * td(i, 18)),
          shield: "pavise"
        },
        {
          name: "Springstep Warrens (Harengon)",
          base: 78,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [4, 6, 12], 8) * td(i, 14)),
          shield: "fantasy3"
        },
        {
          name: "Shellhaven Enclaves (Tortle)",
          base: 79,
          odd: 0.25,
          sort: i => n(i) / (sf(i, 10) * bd(i, [3, 5, 7], 8) * td(i, 24)),
          shield: "swiss"
        },
        {
          name: "Starborne Company (Giff)",
          base: 80,
          odd: 0.2,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 3, 4], 8) * td(i, 18)),
          shield: "banner"
        },
        {
          name: "Duskwind Aeries (Owlin)",
          base: 81,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [6, 8, 9], 8) * td(i, 8)),
          shield: "oldFrench"
        },
        {
          name: "Sandstrider Clutches (Thri-Kreen)",
          base: 82,
          odd: 0.25,
          sort: i => n(i) / (bd(i, [1, 2, 3], 8) * td(i, 26)),
          shield: "fantasy2"
        },
        {
          name: "Oni Warbands (Oni)",
          base: 83,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [4, 6, 9], 8) * td(i, 4)),
          shield: "oldFrench"
        },
        {
          name: "Foxfire Clans (Kitsune)",
          base: 84,
          odd: 0.25,
          sort: i => (n(i) + h[i]) / (bd(i, [4, 6, 8, 9], 10) * td(i, 8)),
          shield: "fantasy3"
        },
        {
          name: "Abyssal Deepkin (Deepkin)",
          base: 85,
          odd: 0.2,
          sort: i => n(i) / (sf(i, 10) * bd(i, [3, 5, 7, 12], 8) * td(i, 20)),
          shield: "swiss"
        },
        {
          name: "Starspawn Conclaves (Starspawn)",
          base: 86,
          odd: 0.15,
          sort: i => (n(i) + h[i]) / (bd(i, [2, 9, 10], 10) * td(i, -10)),
          shield: "banner"
        },
        // fantasy human
        { name: "Anor (Human)", base: 32, odd: 1, sort: i => n(i) / td(i, 10), shield: "fantasy5" },
        { name: "Dail (Human)", base: 32, odd: 1, sort: i => n(i) / td(i, 13), shield: "roman" },
        { name: "Rohand (Human)", base: 16, odd: 1, sort: i => n(i) / td(i, 16), shield: "round" },
        {
          name: "Dulandir (Human)",
          base: 31,
          odd: 1,
          sort: i => (n(i) / td(i, 5) / bd(i, [2, 4, 10], 7)) * t[i],
          shield: "easterling"
        }
      ];
    }

    if (culturesSet.value === "darkFantasy") {
      return [
        // common real-world English
        { name: "Angshire", base: 1, odd: 1, sort: i => n(i) / td(i, 10) / sf(i), shield: "heater" },
        { name: "Enlandic", base: 1, odd: 1, sort: i => n(i) / td(i, 12), shield: "heater" },
        { name: "Westen", base: 1, odd: 1, sort: i => n(i) / td(i, 10), shield: "heater" },
        { name: "Nortumbic", base: 1, odd: 1, sort: i => n(i) / td(i, 7), shield: "heater" },
        { name: "Mercian", base: 1, odd: 1, sort: i => n(i) / td(i, 9), shield: "heater" },
        { name: "Kentian", base: 1, odd: 1, sort: i => n(i) / td(i, 12), shield: "heater" },
        // rare real-world western
        { name: "Norse", base: 6, odd: 0.7, sort: i => n(i) / td(i, 5) / sf(i), shield: "oldFrench" },
        { name: "Schwarzen", base: 0, odd: 0.3, sort: i => n(i) / td(i, 10) / bd(i, [6, 8]), shield: "gonfalon" },
        { name: "Luarian", base: 2, odd: 0.3, sort: i => n(i) / td(i, 12) / bd(i, [6, 8]), shield: "oldFrench" },
        { name: "Hetallian", base: 3, odd: 0.3, sort: i => n(i) / td(i, 15), shield: "oval" },
        { name: "Astellian", base: 4, odd: 0.3, sort: i => n(i) / td(i, 16), shield: "spanish" },
        // rare real-world exotic
        {
          name: "Kiswaili",
          base: 28,
          odd: 0.05,
          sort: i => n(i) / td(i, 29) / bd(i, [1, 3, 5, 7]),
          shield: "vesicaPiscis"
        },
        { name: "Yoruba", base: 21, odd: 0.05, sort: i => n(i) / td(i, 15) / bd(i, [5, 7]), shield: "vesicaPiscis" },
        { name: "Koryo", base: 10, odd: 0.05, sort: i => n(i) / td(i, 12) / t[i], shield: "round" },
        { name: "Hantzu", base: 11, odd: 0.05, sort: i => n(i) / td(i, 13), shield: "banner" },
        { name: "Yamoto", base: 12, odd: 0.05, sort: i => n(i) / td(i, 15) / t[i], shield: "round" },
        { name: "Guantzu", base: 30, odd: 0.05, sort: i => n(i) / td(i, 17), shield: "banner" },
        {
          name: "Ulus",
          base: 31,
          odd: 0.05,
          sort: i => (n(i) / td(i, 5) / bd(i, [2, 4, 10], 7)) * t[i],
          shield: "banner"
        },
        { name: "Turan", base: 16, odd: 0.05, sort: i => n(i) / td(i, 12), shield: "round" },
        {
          name: "Berberan",
          base: 17,
          odd: 0.05,
          sort: i => (n(i) / td(i, 19) / bd(i, [1, 2, 3], 7)) * t[i],
          shield: "round"
        },
        {
          name: "Eurabic",
          base: 18,
          odd: 0.05,
          sort: i => (n(i) / td(i, 26) / bd(i, [1, 2], 7)) * t[i],
          shield: "round"
        },
        { name: "Slovan", base: 5, odd: 0.05, sort: i => (n(i) / td(i, 6)) * t[i], shield: "round" },
        {
          name: "Keltan",
          base: 22,
          odd: 0.1,
          sort: i => n(i) / td(i, 11) ** 0.5 / bd(i, [6, 8]),
          shield: "vesicaPiscis"
        },
        { name: "Elladan", base: 7, odd: 0.2, sort: i => (n(i) / td(i, 18) / sf(i)) * h[i], shield: "boeotian" },
        { name: "Romian", base: 8, odd: 0.2, sort: i => n(i) / td(i, 14) / t[i], shield: "roman" },
        // fantasy races
        { name: "Eldar", base: 33, odd: 0.5, sort: i => (n(i) / bd(i, [6, 7, 8, 9], 10)) * t[i], shield: "fantasy5" }, // Elves
        { name: "Trow", base: 34, odd: 0.8, sort: i => (n(i) / bd(i, [7, 8, 9, 12], 10)) * t[i], shield: "hessen" }, // Dark Elves
        { name: "Durinn", base: 35, odd: 0.8, sort: i => n(i) + h[i], shield: "erebor" }, // Dwarven
        { name: "Kobblin", base: 36, odd: 0.8, sort: i => t[i] - s[i], shield: "moriaOrc" }, // Goblin
        { name: "Uruk", base: 37, odd: 0.8, sort: i => (h[i] * t[i]) / bd(i, [1, 2, 10, 11]), shield: "urukHai" }, // Orc
        { name: "Yotunn", base: 38, odd: 0.8, sort: i => td(i, -10), shield: "pavise" }, // Giant
        { name: "Drake", base: 39, odd: 0.9, sort: i => -s[i], shield: "fantasy2" }, // Draconic
        { name: "Rakhnid", base: 40, odd: 0.9, sort: i => t[i] - s[i], shield: "horsehead2" }, // Arachnid
        { name: "Aj'Snaga", base: 41, odd: 0.9, sort: i => n(i) / bd(i, [12], 10), shield: "fantasy1" }, // Serpents
        {
          name: "Shirefolk",
          base: 43,
          odd: 0.3,
          sort: i => n(i) / td(i, 12),
          shield: "square"
        },
        {
          name: "Whisperdelve",
          base: 44,
          odd: 0.3,
          sort: i => n(i) + h[i],
          shield: "diamond"
        },
        {
          name: "Letharim",
          base: 45,
          odd: 0.3,
          sort: i => (n(i) / bd(i, [6, 7, 8, 9], 8)) * t[i],
          shield: "fantasy5"
        },
        {
          name: "Gor-Khaal",
          base: 46,
          odd: 0.3,
          sort: i => (h[i] * t[i]) / bd(i, [1, 2, 10, 11], 8),
          shield: "moriaOrc"
        },
        {
          name: "Ashborn",
          base: 47,
          odd: 0.3,
          sort: i => n(i) / (bd(i, [1, 2, 3], 8) * td(i, 28)),
          shield: "fantasy2"
        },
        {
          name: "Dawnmarked",
          base: 48,
          odd: 0.2,
          sort: i => n(i) / (bd(i, [4, 6, 8], 6) * td(i, 16)),
          shield: "pavise"
        },
        {
          name: "Dharg Legion",
          base: 49,
          odd: 0.2,
          sort: i => (n(i) * t[i]) / (bd(i, [3, 4, 5, 6], 8) * td(i, 15)),
          shield: "gonfalon"
        },
        {
          name: "Skyborn Tribes",
          base: 50,
          odd: 0.2,
          sort: i => (n(i) + h[i]) / (bd(i, [9, 10], 6) * td(i, 0)),
          shield: "pavise"
        },
        {
          name: "Ssarth Swampclans",
          base: 51,
          odd: 0.2,
          sort: i => n(i) / (bd(i, [7, 12], 20) * td(i, 27)),
          shield: "square"
        },
        {
          name: "Moonscar",
          base: 52,
          odd: 0.2,
          sort: i => (n(i) * t[i]) / (bd(i, [3, 5, 6, 7, 8], 6) * td(i, 14)),
          shield: "fantasy4"
        },
        {
          name: "Carruth Packs",
          base: 53,
          odd: 0.2,
          sort: i => n(i) / (bd(i, [3, 4], 10) * td(i, 26)),
          shield: "square"
        },
        {
          name: "Grimwood Clans",
          base: 54,
          odd: 0.2,
          sort: i => n(i) / (bd(i, [5, 6], 8) * td(i, 14)),
          shield: "hessen"
        },
        {
          name: "Zahari Pride",
          base: 55,
          odd: 0.15,
          sort: i => n(i) / (bd(i, [5, 7], 8) * td(i, 28)),
          shield: "fantasy3"
        },
        {
          name: "Cogsforge Legion",
          base: 56,
          odd: 0.15,
          sort: i => n(i) / (bd(i, [3, 4, 6, 8], 4) * td(i, 16)),
          shield: "fantasy5"
        },
        {
          name: "Ravenflock",
          base: 57,
          odd: 0.15,
          sort: i => n(i) / (bd(i, [6, 8, 12], 8) * td(i, 10)),
          shield: "banner"
        },
        {
          name: "Skyspiral Aeries",
          base: 58,
          odd: 0.12,
          sort: i => (n(i) + h[i]) / (bd(i, [3, 4, 9, 10], 6) * td(i, -2)),
          shield: "oldFrench"
        },
        {
          name: "Ashscale Concord",
          base: 59,
          odd: 0.12,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 2, 3], 8) * td(i, 24)),
          shield: "fantasy2"
        },
        {
          name: "Tideborn Courts",
          base: 60,
          odd: 0.1,
          sort: i => n(i) / (sf(i, 10) * td(i, 18)),
          shield: "swiss"
        },
        {
          name: "Ssserathi Coil",
          base: 61,
          odd: 0.15,
          sort: i => n(i) / (bd(i, [5, 7, 12], 8) * td(i, 26)),
          shield: "fantasy1"
        },
        {
          name: "Deepwild Clans",
          base: 62,
          odd: 0.15,
          sort: i => n(i) / (bd(i, [6, 8, 9], 8) * td(i, 8)),
          shield: "pavise"
        },
        {
          name: "Astral Concord",
          base: 63,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 2, 9, 10], 8) * td(i, 0)),
          shield: "banner"
        },
        {
          name: "Elemental Diaspora",
          base: 64,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [1, 3, 7, 10], 8) * td(i, 20)),
          shield: "diamond"
        },
        {
          name: "Veilbound",
          base: 65,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [4, 6, 8, 12], 6) * td(i, 16)),
          shield: "fantasy4"
        },
        {
          name: "Wildsong Courts",
          base: 66,
          odd: 0.12,
          sort: i => n(i) / (bd(i, [4, 6, 8], 6) * td(i, 14)),
          shield: "fantasy3"
        },
        {
          name: "Labyrinth Clans",
          base: 67,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 3, 4], 8) * td(i, 22)),
          shield: "square"
        },
        {
          name: "Dreambound Orders",
          base: 68,
          odd: 0.08,
          sort: i => (n(i) + h[i]) / (bd(i, [4, 9, 10], 8) * td(i, 8)),
          shield: "banner"
        },
        {
          name: "Redscale Warrens",
          base: 69,
          odd: 0.15,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 2, 3, 4], 8) * td(i, 18)),
          shield: "fantasy2"
        },
        {
          name: "Deepforge Clans",
          base: 70,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [2, 9, 10], 8) * td(i, 0)),
          shield: "erebor"
        },
        {
          name: "Crimson Courts",
          base: 71,
          odd: 0.12,
          sort: i => n(i) / (bd(i, [4, 6, 12], 8) * td(i, 10)),
          shield: "fantasy4"
        },
        {
          name: "Gravesworn Host",
          base: 72,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [3, 4, 6, 10], 8) * td(i, 6)),
          shield: "square"
        },
        {
          name: "Shadowfell Vanguard",
          base: 73,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [9, 10, 12], 8) * td(i, 0)),
          shield: "banner"
        },
        {
          name: "Hexweald Covens",
          base: 74,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [6, 8, 12], 6) * td(i, 12)),
          shield: "fantasy1"
        },
        {
          name: "Stormhoof Clans",
          base: 75,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [3, 4, 5], 8) * td(i, 16)),
          shield: "wedged"
        },
        {
          name: "Sunmane Prides",
          base: 76,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [3, 1, 5], 8) * td(i, 24)),
          shield: "square"
        },
        {
          name: "Ivory Concord",
          base: 77,
          odd: 0.08,
          sort: i => n(i) / (bd(i, [4, 6, 8], 8) * td(i, 18)),
          shield: "pavise"
        },
        {
          name: "Springstep Warrens",
          base: 78,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [4, 6, 12], 8) * td(i, 14)),
          shield: "fantasy3"
        },
        {
          name: "Shellhaven Enclaves",
          base: 79,
          odd: 0.08,
          sort: i => n(i) / (sf(i, 10) * bd(i, [3, 5, 7], 8) * td(i, 24)),
          shield: "swiss"
        },
        {
          name: "Starborne Company",
          base: 80,
          odd: 0.08,
          sort: i => (n(i) + h[i]) / (bd(i, [1, 3, 4], 8) * td(i, 18)),
          shield: "banner"
        },
        {
          name: "Duskwind Aeries",
          base: 81,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [6, 8, 9], 8) * td(i, 8)),
          shield: "oldFrench"
        },
        {
          name: "Sandstrider Clutches",
          base: 82,
          odd: 0.1,
          sort: i => n(i) / (bd(i, [1, 2, 3], 8) * td(i, 26)),
          shield: "fantasy2"
        },
        {
          name: "Oni Warhosts",
          base: 83,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [4, 6, 9], 8) * td(i, 2)),
          shield: "oldFrench"
        },
        {
          name: "Foxfire Courts",
          base: 84,
          odd: 0.1,
          sort: i => (n(i) + h[i]) / (bd(i, [4, 6, 8, 9], 10) * td(i, 8)),
          shield: "fantasy3"
        },
        {
          name: "Abyssal Deepkin",
          base: 85,
          odd: 0.08,
          sort: i => n(i) / (sf(i, 10) * bd(i, [3, 5, 7, 12], 8) * td(i, 22)),
          shield: "swiss"
        },
        {
          name: "Starspawn Covens",
          base: 86,
          odd: 0.08,
          sort: i => (n(i) + h[i]) / (bd(i, [2, 9, 10], 12) * td(i, -12)),
          shield: "banner"
        }
      ];
    }

    if (culturesSet.value === "random") {
      return d3.range(count).map(function () {
        const rnd = Names && typeof Names.getRandomBaseIndex === "function" ? Names.getRandomBaseIndex() : rand(nameBases.length - 1);
        const name = Names.getBaseShort(rnd);
        return { name, base: rnd, odd: 1, shield: getRandomShield() };
      });
    }

    // all-world
    return [
      { name: "Shwazen", base: 0, odd: 0.7, sort: i => n(i) / td(i, 10) / bd(i, [6, 8]), shield: "hessen" },
      { name: "Angshire", base: 1, odd: 1, sort: i => n(i) / td(i, 10) / sf(i), shield: "heater" },
      { name: "Luari", base: 2, odd: 0.6, sort: i => n(i) / td(i, 12) / bd(i, [6, 8]), shield: "oldFrench" },
      { name: "Tallian", base: 3, odd: 0.6, sort: i => n(i) / td(i, 15), shield: "horsehead2" },
      { name: "Astellian", base: 4, odd: 0.6, sort: i => n(i) / td(i, 16), shield: "spanish" },
      { name: "Slovan", base: 5, odd: 0.7, sort: i => (n(i) / td(i, 6)) * t[i], shield: "round" },
      { name: "Norse", base: 6, odd: 0.7, sort: i => n(i) / td(i, 5), shield: "heater" },
      { name: "Elladan", base: 7, odd: 0.7, sort: i => (n(i) / td(i, 18)) * h[i], shield: "boeotian" },
      { name: "Romian", base: 8, odd: 0.7, sort: i => n(i) / td(i, 15), shield: "roman" },
      { name: "Soumi", base: 9, odd: 0.3, sort: i => (n(i) / td(i, 5) / bd(i, [9])) * t[i], shield: "pavise" },
      { name: "Koryo", base: 10, odd: 0.1, sort: i => n(i) / td(i, 12) / t[i], shield: "round" },
      { name: "Hantzu", base: 11, odd: 0.1, sort: i => n(i) / td(i, 13), shield: "banner" },
      { name: "Yamoto", base: 12, odd: 0.1, sort: i => n(i) / td(i, 15) / t[i], shield: "round" },
      { name: "Portuzian", base: 13, odd: 0.4, sort: i => n(i) / td(i, 17) / sf(i), shield: "spanish" },
      { name: "Nawatli", base: 14, odd: 0.1, sort: i => h[i] / td(i, 18) / bd(i, [7]), shield: "square" },
      { name: "Vengrian", base: 15, odd: 0.2, sort: i => (n(i) / td(i, 11) / bd(i, [4])) * t[i], shield: "wedged" },
      { name: "Turchian", base: 16, odd: 0.2, sort: i => n(i) / td(i, 13), shield: "round" },
      {
        name: "Berberan",
        base: 17,
        odd: 0.1,
        sort: i => (n(i) / td(i, 19) / bd(i, [1, 2, 3], 7)) * t[i],
        shield: "round"
      },
      { name: "Eurabic", base: 18, odd: 0.2, sort: i => (n(i) / td(i, 26) / bd(i, [1, 2], 7)) * t[i], shield: "round" },
      { name: "Inuk", base: 19, odd: 0.05, sort: i => td(i, -1) / bd(i, [10, 11]) / sf(i), shield: "square" },
      { name: "Euskati", base: 20, odd: 0.05, sort: i => (n(i) / td(i, 15)) * h[i], shield: "spanish" },
      { name: "Yoruba", base: 21, odd: 0.05, sort: i => n(i) / td(i, 15) / bd(i, [5, 7]), shield: "vesicaPiscis" },
      {
        name: "Keltan",
        base: 22,
        odd: 0.05,
        sort: i => (n(i) / td(i, 11) / bd(i, [6, 8])) * t[i],
        shield: "vesicaPiscis"
      },
      { name: "Efratic", base: 23, odd: 0.05, sort: i => (n(i) / td(i, 22)) * t[i], shield: "diamond" },
      { name: "Tehrani", base: 24, odd: 0.1, sort: i => (n(i) / td(i, 18)) * h[i], shield: "round" },
      { name: "Maui", base: 25, odd: 0.05, sort: i => n(i) / td(i, 24) / sf(i) / t[i], shield: "round" },
      { name: "Carnatic", base: 26, odd: 0.05, sort: i => n(i) / td(i, 26), shield: "round" },
      { name: "Inqan", base: 27, odd: 0.05, sort: i => h[i] / td(i, 13), shield: "square" },
      { name: "Kiswaili", base: 28, odd: 0.1, sort: i => n(i) / td(i, 29) / bd(i, [1, 3, 5, 7]), shield: "vesicaPiscis" },
      { name: "Vietic", base: 29, odd: 0.1, sort: i => n(i) / td(i, 25) / bd(i, [7], 7) / t[i], shield: "banner" },
      { name: "Guantzu", base: 30, odd: 0.1, sort: i => n(i) / td(i, 17), shield: "banner" },
      { name: "Ulus", base: 31, odd: 0.1, sort: i => (n(i) / td(i, 5) / bd(i, [2, 4, 10], 7)) * t[i], shield: "banner" },
      { name: "Hebrew", base: 42, odd: 0.2, sort: i => (n(i) / td(i, 18)) * sf(i), shield: "oval" } // Levantine
    ];
  };

  // expand cultures across the map (Dijkstra-like algorithm)
  const expand = function () {
    TIME && console.time("expandCultures");
    const { cells, cultures } = pack;

    const queue = new FlatQueue();
    const cost = [];

    const neutralRate = byId("neutralRate")?.valueAsNumber || 1;
    const maxExpansionCost = cells.i.length * 0.6 * neutralRate; // limit cost for culture growth

    // remove culture from all cells except of locked
    const hasLocked = cultures.some(c => !c.removed && c.lock);
    if (hasLocked) {
      for (const cellId of cells.i) {
        const culture = cultures[cells.culture[cellId]];
        if (culture.lock) continue;
        cells.culture[cellId] = 0;
      }
    } else {
      cells.culture = new Uint16Array(cells.i.length);
    }

    for (const culture of cultures) {
      if (!culture.i || culture.removed || culture.lock) continue;
      queue.push({ cellId: culture.center, cultureId: culture.i, priority: 0 }, 0);
    }

    while (queue.length) {
      const { cellId, priority, cultureId } = queue.pop();
      const culture = cultures[cultureId];
      if (!culture || !culture.i || culture.removed) continue;

      const { type, expansionism } = culture;
      const baseExpansionism = expansionism || 1;
      const effectiveExpansionism = baseExpansionism;

      cells.c[cellId].forEach(neibCellId => {
        if (hasLocked) {
          const neibCultureId = cells.culture[neibCellId];
          if (neibCultureId && cultures[neibCultureId].lock) return; // do not overwrite cell of locked culture
        }

        const biome = cells.biome[neibCellId];
        const biomeCost = getBiomeCost(cultureId, biome, type);
        const biomeChangeCost = biome === cells.biome[neibCellId] ? 0 : 20; // penalty on biome change
        const heightCost = getHeightCost(neibCellId, cells.h[neibCellId], type);
        const riverCost = getRiverCost(cells.r[neibCellId], neibCellId, type);
        const typeCost = getTypeCost(cells.t[neibCellId], type);

        const cellCost =
          (biomeCost + biomeChangeCost + heightCost + riverCost + typeCost) / effectiveExpansionism;
        const totalCost = priority + cellCost;

        if (totalCost > maxExpansionCost) return;

        if (!cost[neibCellId] || totalCost < cost[neibCellId]) {
          if (cells.pop[neibCellId] > 0) cells.culture[neibCellId] = cultureId; // assign culture to populated cell
          cost[neibCellId] = totalCost;
          queue.push({ cellId: neibCellId, cultureId, priority: totalCost }, totalCost);
        }
      });
    }

    function getBiomeCost(c, biome, type) {
      if (cells.biome[cultures[c].center] === biome) return 10; // tiny penalty for native biome
      if (type === "Hunting") return biomesData.cost[biome] * 5; // non-native biome penalty for hunters
      if (type === "Nomadic" && biome > 4 && biome < 10) return biomesData.cost[biome] * 10; // forest biome penalty for nomads
      return biomesData.cost[biome] * 2; // general non-native biome penalty
    }

    function getHeightCost(i, h, type) {
      const f = pack.features[cells.f[i]],
        a = cells.area[i];
      if (type === "Lake" && f.type === "lake") return 10; // no lake crossing penalty for Lake cultures
      if (type === "Naval" && h < 20) return a * 2; // low sea/lake crossing penalty for Naval cultures
      if (type === "Nomadic" && h < 20) return a * 50; // giant sea/lake crossing penalty for Nomads
      if (h < 20) return a * 6; // general sea/lake crossing penalty
      if (type === "Highland" && h < 44) return 3000; // giant penalty for highlanders on lowlands
      if (type === "Highland" && h < 62) return 200; // giant penalty for highlanders on lowhills
      if (type === "Highland") return 0; // no penalty for highlanders on highlands
      if (h >= 67) return 200; // general mountains crossing penalty
      if (h >= 44) return 30; // general hills crossing penalty
      return 0;
    }

    function getRiverCost(riverId, cellId, type) {
      if (type === "River") return riverId ? 0 : 100; // penalty for river cultures
      if (!riverId) return 0; // no penalty for others if there is no river
      return minmax(cells.fl[cellId] / 10, 20, 100); // river penalty from 20 to 100 based on flux
    }

    function getTypeCost(t, type) {
      if (t === 1) return type === "Naval" || type === "Lake" ? 0 : type === "Nomadic" ? 60 : 20; // penalty for coastline
      if (t === 2) return type === "Naval" || type === "Nomadic" ? 30 : 0; // low penalty for land level 2 for Navals and nomads
      if (t !== -1) return type === "Naval" || type === "Lake" ? 100 : 0; // penalty for mainland for navals
      return 0;
    }

    TIME && console.timeEnd("expandCultures");
  };

  const getRandomShield = function () {
    const type = rw(COA.shields.types);
    return rw(COA.shields[type]);
  };

  return { generate, add, expand, getDefault, getRandomShield };
})();
