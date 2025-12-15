"use strict";

const fantasyRaceBases = {
  Human: [32],
  Elf: [33],
  "Dark Elf": [34],
  Dwarf: [35],
  Goblin: [36],
  Orc: [37],
  Giant: [38],
  Draconic: [39],
  Arachnid: [40],
  Serpent: [41],
  Halfling: [43],
  Gnome: [44],
  "Half-Elf": [45],
  "Half-Orc": [46],
  Tiefling: [47],
  Aasimar: [48],
  Hobgoblin: [49],
  Goliath: [50],
  Lizardfolk: [51],
  Shifter: [52],
  Gnoll: [53],
  Bugbear: [54],
  Tabaxi: [55],
  Warforged: [56],
  Kenku: [57],
  Aarakocra: [58],
  Dragonborn: [59],
  Triton: [60],
  "Yuan-ti": [61],
  Firbolg: [62],
  Gith: [63],
  Genasi: [64],
  Changeling: [65],
  Satyr: [66],
  Minotaur: [67],
  Kalashtar: [68],
  Kobold: [69],
  Duergar: [70],
  Dhampir: [71],
  Reborn: [72],
  "Shadar-kai": [73],
  Hexblood: [74],
  Centaur: [75],
  Leonin: [76],
  Loxodon: [77],
  Harengon: [78],
  Tortle: [79],
  Giff: [80],
  Owlin: [81],
  "Thri-Kreen": [82],
  Oni: [83],
  Kitsune: [84],
  Deepkin: [85],
  Starspawn: [86]
};

// Optional language mixer profiles per race. These define which real-world
// language categories / families a race should draw from when using the
// Markov mixer (Names.getMixedByIso) to generate fresh race languages.
//
// Semantics:
// - categories: array of language catalog categories (e.g. "Romance").
// - families: array of language families (e.g. "Eastern Romance").
// - A language is eligible if (category ∈ categories) OR (family ∈ families).
// - If no eligible languages are found or mixer is unavailable, we fall back
//   to the classic fantasy namebase defined in fantasyRaceBases.

const raceLanguageProfiles = {
  Elf: {
    categories: ["Celtic", "Uralic"],
    families: ["Celtic", "Uralic", "Sami"]
  },
  Seafarer: {
    categories: ["Creole"],
    families: ["Portuguese-based"]
  },
  "Dark Elf": {
    categories: ["Slavic", "Germanic", "Romance"],
    families: ["Slavic", "Germanic", "Romance", "Baltic"]
  },
  Dwarf: {
    categories: ["Germanic", "Celtic", "Slavic"],
    families: ["Germanic", "Slavic", "Baltic"]
  },
  Halfling: {
    categories: ["Romance", "Celtic", "Germanic"],
    families: ["Romance", "Celtic", "Germanic", "Sardinian", "Tuscan", "Neapolitan"]
  },
  Gnome: {
    categories: ["Germanic", "Celtic"],
    families: ["Germanic", "Celtic"]
  },
  "Half-Elf": {
    categories: ["Romance", "Germanic", "Celtic", "Uralic"],
    families: ["Romance", "Germanic", "Celtic", "Uralic", "Sami"]
  },
  "Half-Orc": {
    categories: ["Slavic", "Afroasiatic"],
    families: ["Slavic", "Afroasiatic", "Niger-Congo", "Semitic"]
  },
  Goblin: {
    categories: ["Niger-Congo"],
    families: ["Niger-Congo", "Bantu"]
  },
  Orc: {
    categories: ["Slavic", "Niger-Congo"],
    families: ["Slavic", "Niger-Congo", "Turkic"]
  },
  Giant: {
    categories: ["Germanic", "Slavic", "Iranian"],
    families: ["Germanic", "Slavic", "Iranian", "Turkic"]
  },
  Draconic: {
    categories: [
      "Sino-Tibetan",
      "Mongolic",
      "Tai-Kadai",
      "Japonic",
      "Koreanic"
    ],
    families: ["Sino-Tibetan", "Mongolic", "Tai-Kadai", "Japonic", "Koreanic"]
  },
  Dragonborn: {
    categories: [
      "Sino-Tibetan",
      "Mongolic",
      "Turkic",
      "Indo-Aryan",
      "Iranian"
    ],
    families: [
      "Sino-Tibetan",
      "Mongolic",
      "Turkic",
      "Indo-Aryan",
      "Indo-Iranian",
      "Iranian"
    ]
  },
  Arachnid: {
    categories: ["Afroasiatic"],
    families: ["Afroasiatic", "Semitic"]
  },
  Serpent: {
    categories: ["Indo-Aryan", "Dravidian"],
    families: ["Indo-Aryan", "Dravidian"]
  },
  Tiefling: {
    categories: ["Afroasiatic", "Iranian"],
    families: ["Semitic", "Arabic", "Iranian"]
  },
  Aasimar: {
    categories: ["Romance", "Greek"],
    families: ["Romance", "Greek", "Sardinian", "Tuscan", "Neapolitan"]
  },
  Hobgoblin: {
    categories: ["Slavic", "Germanic"],
    families: ["Slavic", "Germanic", "Turkic"]
  },
  Goliath: {
    categories: [
      "Germanic",
      "Slavic",
      "Iranian",
      "Kartvelian",
      "Northeast Caucasian",
      "Northwest Caucasian"
    ],
    families: [
      "Germanic",
      "Slavic",
      "Iranian",
      "Turkic",
      "Kartvelian",
      "Northeast Caucasian",
      "Northwest Caucasian"
    ]
  },
  Lizardfolk: {
    categories: ["Niger-Congo", "Afroasiatic", "Nilo-Saharan", "Ubangian"],
    families: ["Niger-Congo", "Bantu", "Afroasiatic", "Nilo-Saharan", "Ubangian"]
  },
  Shifter: {
    categories: ["Celtic", "Germanic", "Niger-Congo"],
    families: ["Celtic", "Germanic", "Niger-Congo", "Bantu"]
  },
  Gnoll: {
    categories: ["Afroasiatic", "Nilo-Saharan"],
    families: ["Afroasiatic", "Nilo-Saharan", "Semitic", "Hadza isolate", "Sandawe isolate", "Kusunda"]
  },
  Bugbear: {
    categories: ["Slavic", "Afroasiatic", "Niger-Congo"],
    families: ["Slavic", "Afroasiatic", "Niger-Congo", "Turkic"]
  },
  Tabaxi: {
    categories: [
      "Tupian",
      "Quechuan",
      "Ticuna–Yuri",
      "Totonacan",
      "Mayan",
      "Arawakan",
      "Cariban",
      "Panoan",
      "Tucanoan",
      "Arauan",
      "Saliban",
      "Guahiboan",
      "Macro-Jê",
      "Nadahup",
      "Aymaran",
      "Araucanian",
      "Oto-Manguean"
    ],
    families: [
      "Tupian",
      "Quechuan",
      "Ticuna–Yuri",
      "Totonacan",
      "Mayan",
      "Arawakan",
      "Cariban",
      "Panoan",
      "Tucanoan",
      "Arauan",
      "Saliban",
      "Witotoan",
      "Aymaran",
      "Araucanian",
      "Oto-Manguean",
      "Purépecha isolate",
      "Seri isolate",
      "Huave isolate",
      "Camsa isolate",
      "Cayubaba isolate",
      "Muran",
      "Warao",
      "Yanomaman",
      "Puinave isolate",
      "Guahiboan",
      "Barbacoan",
      "Macro-Jê",
      "Nadahup",
      "Tacanan"
    ]
  },
  Warforged: {
    categories: ["Germanic", "Slavic", "Sino-Tibetan", "Creole", "Mixed"],
    families: ["Germanic", "Slavic", "Sino-Tibetan", "English-based", "German-based"]
  },
  Kenku: {
    categories: [
      "Algic",
      "Uto-Aztecan",
      "Salishan",
      "Siouan",
      "Algonquian",
      "Na-Dene",
      "Eskimo–Aleut",
      "Iroquoian",
      "Misumalpan",
      "Keresan",
      "Kiowa–Tanoan",
      "Yuman"
    ],
    families: [
      "Algic",
      "Uto-Aztecan",
      "Salishan",
      "Siouan",
      "Algonquian",
      "Na-Dene",
      "Eskimo–Aleut",
      "Iroquoian",
      "Misumalpan",
      "Keresan",
      "Kiowa–Tanoan",
      "Yuman"
    ]
  },
  Aarakocra: {
    categories: [
      "Algic",
      "Uto-Aztecan",
      "Salishan",
      "Siouan",
      "Algonquian",
      "Na-Dene",
      "Eskimo–Aleut",
      "Yuman"
    ],
    families: [
      "Austronesian",
      "Micronesian",
      "Polynesian",
      "Algic",
      "Uto-Aztecan",
      "Salishan",
      "Siouan",
      "Algonquian",
      "Na-Dene",
      "Eskimo–Aleut"
    ]
  },
  Triton: {
    categories: ["Austronesian", "Papuan", "Creole"],
    families: ["Austronesian", "Micronesian", "Polynesian", "Papuan"]
  },
  "Yuan-ti": {
    categories: ["Sino-Tibetan", "Tai-Kadai"],
    families: ["Sino-Tibetan", "Tai-Kadai"]
  },
  Firbolg: {
    categories: ["Celtic", "Germanic"],
    families: ["Celtic", "Germanic", "Uralic", "Sami"]
  },
  Gith: {
    categories: ["Turkic", "Mongolic", "Indo-Iranian"],
    families: ["Turkic", "Mongolic", "Indo-Iranian", "Iranian", "Indo-Aryan"]
  },
  Genasi: {
    categories: ["Indo-Aryan", "Iranian"],
    families: ["Indo-Aryan", "Iranian", "Indo-Iranian"]
  },
  Changeling: {
    categories: ["Romance", "Germanic", "Slavic"],
    families: ["Romance", "Germanic", "Slavic", "Romani"]
  },
  Satyr: {
    categories: ["Celtic", "Romance"],
    families: ["Celtic", "Romance", "Sardinian", "Tuscan", "Neapolitan"]
  },
  Minotaur: {
    categories: ["Greek", "Romance"],
    families: ["Greek", "Romance", "Sardinian", "Tuscan", "Neapolitan", "Indo-European"]
  },
  Kalashtar: {
    categories: ["Indo-Aryan", "Iranian"],
    families: ["Indo-Aryan", "Iranian", "Indo-Iranian", "Punjabi–Lahnda"]
  },
  Kobold: {
    categories: ["Sino-Tibetan", "Tai-Kadai", "Japonic", "Koreanic"],
    families: ["Sino-Tibetan", "Tai-Kadai", "Japonic", "Koreanic"]
  },
  Duergar: {
    categories: ["Germanic", "Slavic"],
    families: ["Germanic", "Slavic", "Baltic", "Uralic"]
  },
  Dhampir: {
    categories: ["Slavic", "Romance"],
    families: ["Slavic", "Romani", "Baltic"]
  },
  Reborn: {
    categories: ["Slavic", "Germanic", "Unclassified"],
    families: ["Slavic", "Germanic", "Romani", "Unclassified"]
  },
  "Shadar-kai": {
    categories: ["Slavic", "Germanic"],
    families: ["Slavic", "Germanic", "Romance", "Baltic", "Romani"]
  },
  Hexblood: {
    categories: ["Slavic", "Germanic", "Romance", "Celtic"],
    families: ["Slavic", "Germanic", "Baltic", "Romani", "Celtic"]
  },
  Centaur: {
    categories: ["Greek", "Iranian"],
    families: ["Greek", "Iranian", "Sardinian", "Tuscan", "Neapolitan"]
  },
  Leonin: {
    categories: [
      "Niger-Congo",
      "Nilo-Saharan",
      "Mande",
      "Khoe-Kwadi",
      "Kx'a",
      "Songhay",
      "Khoe",
      "Tuu"
    ],
    families: [
      "Niger-Congo",
      "Bantu",
      "Nilo-Saharan",
      "Semitic",
      "Mande",
      "Khoe-Kwadi",
      "Kx'a",
      "Songhay",
      "Khoe",
      "Tuu"
    ]
  },
  Loxodon: {
    categories: ["Dravidian"],
    families: ["Dravidian", "Marathi–Konkani", "Bihari"]
  },
  Harengon: {
    categories: ["Celtic", "Germanic", "Uralic"],
    families: ["Celtic", "Germanic", "Uralic", "Sami"]
  },
  Tortle: {
    categories: ["Austronesian", "Papuan", "Australian Aboriginal"],
    families: [
      "Austronesian",
      "Micronesian",
      "Polynesian",
      "Papuan",
      "Australian Aboriginal"
    ]
  },
  Giff: {
    categories: ["Germanic", "Romance", "Creole", "Pidgin"],
    families: ["Germanic", "Romance", "English-based", "French-based", "Pidgin"]
  },
  Owlin: {
    categories: ["Uralic", "Sino-Tibetan"],
    families: ["Uralic", "Sami", "Sino-Tibetan"]
  },
  "Thri-Kreen": {
    categories: ["Afroasiatic", "Nilo-Saharan"],
    families: ["Afroasiatic", "Semitic", "Berber", "Chadic", "Nilo-Saharan"]
  },
  Oni: {
    categories: ["Japonic", "Koreanic", "Austroasiatic", "Hmong-Mien", "Ainu"],
    families: ["Japonic", "Japanese dialects", "Amami Ryukyuan", "Okinawan Ryukyuan", "Koreanic"]
  },
  Kitsune: {
    categories: ["Japonic", "Koreanic", "Austroasiatic", "Hmong-Mien", "Ainu"],
    families: ["Japonic", "Japanese dialects", "Amami Ryukyuan", "Okinawan Ryukyuan"]
  },
  Deepkin: {
    categories: [
      "Austronesian",
      "Papuan",
      "Australian Aboriginal",
      "Eskimo-Aleut"
    ],
    families: [
      "Austronesian",
      "Micronesian",
      "Polynesian",
      "Papuan",
      "Australian Aboriginal",
      "Eskimo-Aleut"
    ]
  },
  Starspawn: {
    categories: [
      "Tungusic",
      "Yeniseian",
      "Yukaghir",
      "Chukotko-Kamchatkan",
      "Language isolate",
      "Hypothetical",
      "Eskimo-Aleut"
    ],
    families: [
      "Nivkh",
      "Yeniseian",
      "Yukaghir",
      "Eskimo–Aleut",
      "Tungusic"
    ]
  },
  AnyLanguage: {
    categories: [],
    families: []
  },
  Human: {
    categories: [],
    families: []
  }
};

function getRaceLanguageProfile(raceName) {
  return raceLanguageProfiles[raceName] || null;
}

const fallbackRaceMixerIsoWeights = {
  eng: 1,
  fra: 1,
  spa: 1,
  ita: 1,
  deu: 1,
  rus: 1,
  ara: 1,
  hin: 1,
  jpn: 1
};

function normalizeRaceMixerKey(value) {
  if (value == null) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ");
}

function getFallbackRaceMixerIsoWeights() {
  return fallbackRaceMixerIsoWeights;
}

function loadLanguageMixerCatalogForRaces() {
  if (Array.isArray(window.languageMixerCatalog)) return window.languageMixerCatalog;

  // Fallback: try to synchronously load the JSON catalog if the JS bundle
  // was not preloaded for some reason.
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "config/language-mixes.json", false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
      const data = JSON.parse(xhr.responseText.replace(/^\uFEFF/, ""));
      window.languageMixerCatalog = data;
      return data;
    }
  } catch (e) {
    console.error("Races: failed to load language-mixes.json", e);
  }

  return Array.isArray(window.languageMixerCatalog) ? window.languageMixerCatalog : [];
}

function getRaceLanguageIsoWeights(raceName) {
  const profile = getRaceLanguageProfile(raceName);
  if (!profile) return null;

  const catalog = loadLanguageMixerCatalogForRaces();
  if (!Array.isArray(catalog) || !catalog.length) return null;

  const rawCategories = Array.isArray(profile.categories) ? profile.categories : [];
  const rawFamilies = Array.isArray(profile.families) ? profile.families : [];

  const categorySet = new Set(rawCategories.map(normalizeRaceMixerKey).filter(Boolean));
  const familySet = new Set(rawFamilies.map(normalizeRaceMixerKey).filter(Boolean));
  const useAllCategories = categorySet.has("*");
  const useAllFamilies = familySet.has("*");
  const useAll = useAllCategories || useAllFamilies;
  if (useAllCategories) categorySet.delete("*");
  if (useAllFamilies) familySet.delete("*");
  const isoWeights = {};

  catalog.forEach(lang => {
    if (!lang || !lang.iso) return;
    if (lang.tags && lang.tags.includes("family")) return; // skip family-only macros

    if (useAll) {
      isoWeights[lang.iso] = (isoWeights[lang.iso] || 0) + 1;
      return;
    }

    const langCategory = normalizeRaceMixerKey(lang.category);
    const langFamily = normalizeRaceMixerKey(lang.family);
    const effectiveFamily = langFamily || langCategory;

    const catOk = categorySet.size && langCategory && categorySet.has(langCategory);
    const famOk = familySet.size && effectiveFamily && familySet.has(effectiveFamily);
    if (!catOk && !famOk) return;

    let weight = 0;
    if (catOk) weight += 1;
    if (famOk) weight += 2; // lean more strongly into race families
    if (!weight) return;

    isoWeights[lang.iso] = (isoWeights[lang.iso] || 0) + weight;
  });

  return Object.keys(isoWeights).length ? isoWeights : null;
}

// Generate fresh Markov-mixed language samples for a race. This uses
// Names.getMixedByIso with iso weights derived from the race profile.
// If no suitable languages are found or the mixer is unavailable, falls
// back to the classic fantasy namebase defined for the race.

function generateRaceLanguageNames(raceName, options) {
  const count = (options && options.count) || 40;

  const canMix = raceName !== "Human" && typeof Names !== "undefined" && Names.getMixedByIso;
  const isoWeights = canMix ? getRaceLanguageIsoWeights(raceName) : null;

  if (isoWeights && Names && typeof Names.getMixedByIso === "function") {
    try {
      const names = Names.getMixedByIso(isoWeights, {count});
      if (Array.isArray(names) && names.length) return names;
    } catch (error) {
      ERROR && console.error("Race mixer error for", raceName, error);
    }
  }

  // Fallback: classic fantasy base for the race
  const bases = fantasyRaceBases[raceName];
  if (!bases || !bases.length || !Names || typeof Names.getBase !== "function") return [];

  const baseIndex = bases[0];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(Names.getBase(baseIndex));
  }
  return result;
}

function getRaceMixerBaseDisplayName(raceName) {
  return `Race ${raceName} (Mixer)`;
}

function buildRaceMixerLanguageDisplayName(raceName, isoWeights, options) {
  if (!raceName) return "";
  if (!isoWeights || typeof isoWeights !== "object") return "";
  if (!Names || typeof Names.calculateChain !== "function") return "";

  const catalog = loadLanguageMixerCatalogForRaces();
  if (!Array.isArray(catalog) || !catalog.length) return "";

  const catalogByIso = new Map();
  for (const lang of catalog) {
    if (!lang || !lang.iso || !lang.name) continue;
    catalogByIso.set(lang.iso, lang);
  }

  const cleanedByName = new Map();
  for (const [iso, weightRaw] of Object.entries(isoWeights)) {
    const lang = catalogByIso.get(iso);
    if (!lang) continue;
    const weight = typeof weightRaw === "number" && isFinite(weightRaw) ? weightRaw : 0;
    if (weight <= 0) continue;

    let n = String(lang.name || "").trim();
    n = n.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
    n = n.replace(/\s+(language|dialects|dialect|family|languages)\b/gi, "").trim();
    if (n.length < 2) continue;

    const key = n.toLowerCase();
    const existing = cleanedByName.get(key);
    cleanedByName.set(key, {
      name: existing && existing.name ? existing.name : n,
      weight: (existing && existing.weight ? existing.weight : 0) + weight
    });
  }

  const sources = Array.from(cleanedByName.entries())
    .map(([key, value]) => ({key, name: value && value.name, weight: value && value.weight}))
    .filter(s => s && s.name && typeof s.weight === "number" && s.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  if (!sources.length) return "";

  const seed = options && typeof options.seed === "number" ? options.seed : null;
  const seedInt = typeof seed === "number" && isFinite(seed) ? (seed >>> 0) : 0;
  let s = seedInt || hashStringToUint32(`race-mixer-name|${raceName}`);
  const rng = () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = arr => arr[Math.floor(rng() * arr.length)];

  const combined = [];
  const totalBudget = 80;
  for (const src of sources) {
    const repeat = Math.max(1, Math.min(4, Math.round(src.weight)));
    for (let i = 0; i < repeat && combined.length < totalBudget; i++) {
      combined.push(src.name);
    }
    if (combined.length >= totalBudget) break;
  }

  if (!combined.length) return "";

  const combinedString = combined.join(",");
  const chain = Names.calculateChain(combinedString);
  if (!chain || chain[""] === undefined) return "";

  const min = 4;
  const max = 16;
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

  if (name.split(" ").some(part => part.length < 2)) {
    name = name
      .split(" ")
      .map((p, i) => (i ? p.toLowerCase() : p))
      .join("");
  }

  if (!name || name.length < 2) {
    const fallback = sources[0] && sources[0].name ? sources[0].name : "";
    name = fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : "";
  }

  if (!name || name.length < 2) return "";
  return `${name} (${raceName})`;
}

function hashStringToUint32(value) {
  const str = value == null ? "" : String(value);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function findExistingRaceMixerBaseIndex(raceName) {
  if (!raceName || !Array.isArray(nameBases)) return null;
  const expectedName = getRaceMixerBaseDisplayName(raceName);
  for (let i = 0; i < nameBases.length; i++) {
    const b = nameBases[i];
    if (b && b.raceMixerFor === raceName) return i;
    if (!b || typeof b.name !== "string") continue;
    if (b.name === expectedName) return i;
  }
  return null;
}

function ensureRaceMixerBaseIndex(raceName, options) {
  if (!raceName || raceName === "Human") return null;
  if (!fantasyRaceBases[raceName]) return null;
  if (!Array.isArray(nameBases)) return null;

  const existing = findExistingRaceMixerBaseIndex(raceName);
  if (existing != null) {
    const base = nameBases[existing];
    if (base && !base.raceMixerFor) base.raceMixerFor = raceName;

    if (base && typeof base.name === "string" && base.name === getRaceMixerBaseDisplayName(raceName)) {
      const fallbackIsoWeights = getFallbackRaceMixerIsoWeights();
      const primaryIsoWeights = getRaceLanguageIsoWeights(raceName);
      const isoWeights = primaryIsoWeights || fallbackIsoWeights;

      const seedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer-name`;
      const nameSeed = hashStringToUint32(seedSource);
      const display = buildRaceMixerLanguageDisplayName(raceName, isoWeights, {seed: nameSeed});
      if (display) base.name = display;
    }

    return existing;
  }

  if (!Names || typeof Names.getMixedByIso !== "function") return null;
  const fallbackIsoWeights = getFallbackRaceMixerIsoWeights();
  const primaryIsoWeights = getRaceLanguageIsoWeights(raceName);
  const isoWeights = primaryIsoWeights || fallbackIsoWeights;
  if (!isoWeights) return null;

  const count = (options && options.count) || 240;
  const seedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer`;
  const mixSeed = hashStringToUint32(seedSource);

  const getSanitized = weights => {
    let names;
    try {
      names = Names.getMixedByIso(weights, {count, seed: mixSeed});
    } catch (e) {
      return null;
    }

    if (!Array.isArray(names) || names.length < 3) return null;

    const sanitized = names
      .map(n => String(n || "").replace(/[/|,]/g, "").trim())
      .filter(Boolean);

    if (sanitized.length < 3) return null;
    return sanitized;
  };

  let sanitized = getSanitized(isoWeights);
  if (!sanitized && primaryIsoWeights && fallbackIsoWeights) {
    sanitized = getSanitized(fallbackIsoWeights);
  }

  if (!sanitized) return null;

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
  } catch (e) {}

  const b = sanitized.join(",");
  const baseIndex = nameBases.length;
  const nameSeedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer-name`;
  const nameSeed = hashStringToUint32(nameSeedSource);
  const displayName = buildRaceMixerLanguageDisplayName(raceName, isoWeights, {seed: nameSeed});
  nameBases.push({name: displayName || getRaceMixerBaseDisplayName(raceName), min, max, d: "", m: 0, b, raceMixerFor: raceName});
  return baseIndex;
}

function getRacesSetFilter(value) {
  switch (value) {
    case "classic":
      return new Set([
        "Elf",
        "Dark Elf",
        "Dwarf",
        "Halfling",
        "Gnome",
        "Half-Elf",
        "Half-Orc",
        "Goblin",
        "Orc",
        "Giant",
        "Dragonborn",
        "Satyr",
        "Minotaur",
        "Oni",
        "Kitsune"
      ]);
    case "dark":
      return new Set([
        "Dark Elf",
        "Goblin",
        "Orc",
        "Hobgoblin",
        "Gnoll",
        "Bugbear",
        "Arachnid",
        "Serpent",
        "Lizardfolk",
        "Shifter",
        "Kenku",
        "Yuan-ti",
        "Gith",
        "Dragonborn",
        "Kobold",
        "Duergar",
        "Minotaur",
        "Dhampir",
        "Reborn",
        "Shadar-kai",
        "Hexblood",
        "Oni",
        "Deepkin",
        "Starspawn"
      ]);
    case "primal":
      return new Set([
        "Elf",
        "Firbolg",
        "Goliath",
        "Lizardfolk",
        "Shifter",
        "Gnoll",
        "Bugbear",
        "Tabaxi",
        "Kenku",
        "Aarakocra",
        "Triton",
        "Satyr",
        "Minotaur",
        "Centaur",
        "Leonin",
        "Loxodon",
        "Harengon",
        "Tortle",
        "Owlin",
        "Thri-Kreen",
        "Kitsune"
      ]);
    case "planar":
      return new Set([
        "Tiefling",
        "Aasimar",
        "Gith",
        "Genasi",
        "Draconic",
        "Dragonborn",
        "Yuan-ti",
        "Triton",
        "Aarakocra",
        "Kalashtar",
        "Shadar-kai",
        "Hexblood",
        "Starspawn"
      ]);
    case "eberron":
      return new Set([
        "Warforged",
        "Shifter",
        "Changeling",
        "Gnome",
        "Halfling",
        "Half-Elf",
        "Half-Orc",
        "Orc",
        "Goblin",
        "Hobgoblin",
        "Dragonborn",
        "Kalashtar",
        "Kobold",
        "Dhampir",
        "Reborn",
        "Hexblood"
      ]);
    case "fey":
      return new Set([
        "Elf",
        "Firbolg",
        "Satyr",
        "Harengon",
        "Hexblood",
        "Gnome",
        "Halfling",
        "Shifter",
        "Changeling",
        "Centaur",
        "Owlin",
        "Kitsune"
      ]);
    case "beastfolk":
      return new Set([
        "Goliath",
        "Lizardfolk",
        "Shifter",
        "Gnoll",
        "Bugbear",
        "Tabaxi",
        "Leonin",
        "Loxodon",
        "Kenku",
        "Aarakocra",
        "Owlin",
        "Centaur",
        "Tortle",
        "Giff",
        "Thri-Kreen",
        "Kobold",
        "Kitsune"
      ]);
    case "underdark":
      return new Set([
        "Dark Elf",
        "Duergar",
        "Kobold",
        "Yuan-ti",
        "Thri-Kreen",
        "Arachnid",
        "Serpent",
        "Goblin",
        "Bugbear",
        "Gith",
        "Deepkin",
        "Starspawn"
      ]);
    case "undead":
      return new Set([
        "Dhampir",
        "Reborn",
        "Shadar-kai",
        "Hexblood"
      ]);
    default:
      return null;
  }
}

function defineRaceExpansionism(name) {
  const sizeVarietyElement = byId("sizeVariety");
  const variety =
    (sizeVarietyElement && (sizeVarietyElement.valueAsNumber || +sizeVarietyElement.value)) || 1;

  let base = 1;

  if (name === "Elf") base = 1.2;
  else if (name === "Dark Elf") base = 1.1;
  else if (name === "Dwarf") base = 1.1;
  else if (name === "Goblin") base = 1.3;
  else if (name === "Orc") base = 1.6;
  else if (name === "Giant") base = 0.5;
  else if (name === "Draconic") base = 0.6;
  else if (name === "Arachnid") base = 1.1;
  else if (name === "Serpent") base = 1.2;
  else if (name === "Halfling") base = 1.0;
  else if (name === "Gnome") base = 1.0;
  else if (name === "Half-Elf") base = 1.3;
  else if (name === "Half-Orc") base = 1.5;
  else if (name === "Tiefling") base = 1.0;
  else if (name === "Aasimar") base = 1.0;
  else if (name === "Hobgoblin") base = 1.5;
  else if (name === "Goliath") base = 0.9;
  else if (name === "Lizardfolk") base = 1.2;
  else if (name === "Shifter") base = 1.2;
  else if (name === "Gnoll") base = 1.3;
  else if (name === "Bugbear") base = 1.1;
  else if (name === "Tabaxi") base = 1.2;
  else if (name === "Warforged") base = 1.0;
  else if (name === "Kenku") base = 1.0;
  else if (name === "Aarakocra") base = 0.9;
  else if (name === "Dragonborn") base = 1.3;
  else if (name === "Triton") base = 0.9;
  else if (name === "Yuan-ti") base = 1.1;
  else if (name === "Firbolg") base = 0.9;
  else if (name === "Gith") base = 1.2;
  else if (name === "Genasi") base = 1.1;
  else if (name === "Changeling") base = 1.0;
  else if (name === "Satyr") base = 1.1;
  else if (name === "Minotaur") base = 1.4;
  else if (name === "Kalashtar") base = 0.9;
  else if (name === "Kobold") base = 1.3;
  else if (name === "Duergar") base = 0.9;
  else if (name === "Dhampir") base = 1.2;
  else if (name === "Reborn") base = 1.0;
  else if (name === "Shadar-kai") base = 1.0;
  else if (name === "Hexblood") base = 1.1;
  else if (name === "Centaur") base = 1.2;
  else if (name === "Leonin") base = 1.1;
  else if (name === "Loxodon") base = 0.9;
  else if (name === "Harengon") base = 1.3;
  else if (name === "Tortle") base = 0.8;
  else if (name === "Giff") base = 1.0;
  else if (name === "Owlin") base = 1.0;
  else if (name === "Thri-Kreen") base = 1.3;
  else if (name === "Oni") base = 1.2;
  else if (name === "Kitsune") base = 1.0;
  else if (name === "Deepkin") base = 0.8;
  else if (name === "Starspawn") base = 0.7;
  else if (name === "Human") base = 1.3;

  const randomFactor = (Math.random() * variety) / 2 + 1;
  return rn(randomFactor * base, 1);
}

function getRaceNameForCulture(culture) {
  if (!culture || !culture.i || culture.removed) return null;
  if (culture.race && pack && Array.isArray(pack.races)) {
    const race = pack.races[culture.race];
    const raceName = race && typeof race.name === "string" ? race.name : "";
    if (raceName && raceName !== "None") return raceName;
  }
  const base = culture.base;

  for (const [raceName, bases] of Object.entries(fantasyRaceBases)) {
    if (bases.includes(base)) return raceName;
  }

  const baseEntry = nameBases && nameBases[base];
  const markedRace = baseEntry && typeof baseEntry.raceMixerFor === "string" ? baseEntry.raceMixerFor : "";
  if (markedRace && fantasyRaceBases[markedRace]) return markedRace;
  const baseName = baseEntry && typeof baseEntry.name === "string" ? baseEntry.name : "";
  const match = /^Race\s+(.+)\s+\(Mixer\)$/.exec(baseName);
  if (match && match[1] && fantasyRaceBases[match[1]]) return match[1];

  return "Human";
}

function shouldEnableRacesForCurrentWorld() {
  try {
    if (typeof isFantasyCulturesSet === "function" && isFantasyCulturesSet()) return true;
  } catch (e) {}

  if (pack && Array.isArray(pack.races)) {
    for (const race of pack.races) {
      if (!race || !race.i || !race.name) continue;
      if (race.name !== "Human") return true;
    }
  }

  if (!pack || !Array.isArray(pack.cultures)) return false;
  for (const culture of pack.cultures) {
    if (!culture || !culture.i || culture.removed) continue;
    const raceName = getRaceNameForCulture(culture);
    if (raceName && raceName !== "Human") return true;
  }

  return false;
}

function initializeRacesForExpansion(options) {
  if (!pack || !pack.cultures) return;
  if (!shouldEnableRacesForCurrentWorld()) return;

  const existingRaces = pack.races || [];
  const races = [{i: 0, name: "None"}];
  const raceIndexByName = new Map();
  const raceColorById = {};

  const isFirstInitialization = existingRaces.length <= 1;
  const forceFilterFromUi = options && options.forceFilterFromUi;
  const shouldApplyFilter = isFirstInitialization || forceFilterFromUi;

  let allowedRaces = null;
  if (shouldApplyFilter) {
    const racesSetElement = byId("racesSet");
    const racesSetValue = racesSetElement ? racesSetElement.value : "all";
    const racesSetFilter = getRacesSetFilter(racesSetValue);

    const racesNumberElement = byId("racesNumber");
    const racesLimitRaw =
      (racesNumberElement && (racesNumberElement.valueAsNumber || +racesNumberElement.value)) || 0;
    const maxNonHumanRaces = racesLimitRaw > 0 ? racesLimitRaw : Infinity;

    if (racesSetFilter && maxNonHumanRaces === Infinity) {
      allowedRaces = racesSetFilter;
    } else if (maxNonHumanRaces !== Infinity) {
      const raceNeedCounts = new Map();
      pack.cultures.forEach(culture => {
        if (!culture || !culture.i || culture.removed) return;
        const raceName = getRaceNameForCulture(culture);
        if (!raceName || raceName === "Human") return;
        if (racesSetFilter && !racesSetFilter.has(raceName)) return;
        raceNeedCounts.set(raceName, (raceNeedCounts.get(raceName) || 0) + 1);
      });

      const sortedRaceNames = Array.from(raceNeedCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      allowedRaces = new Set(sortedRaceNames.slice(0, maxNonHumanRaces));
    }
  }

  existingRaces.forEach(race => {
    if (!race || !race.i) return;
    races[race.i] = {i: race.i, name: race.name, color: race.color, expansionism: race.expansionism};
    raceIndexByName.set(race.name, race.i);
    if (race.color) raceColorById[race.i] = race.color;
  });

  pack.cultures.forEach(culture => {
    if (!culture) return;
    if (!culture.i || culture.removed) {
      culture.race = 0;
      return;
    }

    let raceName = getRaceNameForCulture(culture);

    if (shouldApplyFilter && raceName && raceName !== "Human" && allowedRaces) {
      if (!allowedRaces.has(raceName)) raceName = "Human";
    }

    if (raceName && raceName !== "Human") {
      const mixedBase = ensureRaceMixerBaseIndex(raceName);
      if (typeof mixedBase === "number") {
        culture.base = mixedBase;
      }
    }
    let raceId = raceIndexByName.get(raceName);

    if (!raceId) {
      raceId = races.length;
      raceIndexByName.set(raceName, raceId);
      const expansionism = defineRaceExpansionism(raceName);
      races[raceId] = {i: raceId, name: raceName, expansionism};
    }

    culture.race = raceId;

    if (!raceColorById[raceId] && culture.color) {
      raceColorById[raceId] = culture.color;
    }
  });

  races.forEach(race => {
    if (!race || !race.i) return;
    race.color = raceColorById[race.i] || race.color || "#888888";
    if (race.expansionism == null) race.expansionism = 1;
  });

  pack.races = races;
}

function assignRaces() {
  if (!pack || !pack.cultures) return;

  function clearRaces() {
    pack.races = [];

    if (pack.cultures) pack.cultures.forEach(c => c && delete c.race);
    if (pack.states) pack.states.forEach(s => s && delete s.race);
    if (pack.provinces) pack.provinces.forEach(p => p && delete p.race);
    if (pack.burgs) pack.burgs.forEach(b => b && delete b.race);
    if (pack.religions) pack.religions.forEach(r => r && delete r.race);
  }

  if (!shouldEnableRacesForCurrentWorld()) {
    clearRaces();
    return;
  }

  function getRaceFromCultureId(cultureId) {
    const culture = pack.cultures && pack.cultures[cultureId];
    return culture && culture.race ? culture.race : 0;
  }

  if (pack.states) {
    pack.states.forEach(state => {
      if (!state) return;
      if (!state.i || state.removed) {
        state.race = 0;
        return;
      }
      state.race = getRaceFromCultureId(state.culture);
    });
  }

  if (pack.provinces && pack.states) {
    pack.provinces.forEach(province => {
      if (!province) return;
      if (!province.i || province.removed) {
        province.race = 0;
        return;
      }
      const state = pack.states[province.state];
      province.race = state && state.race ? state.race : 0;
    });
  }

  if (pack.burgs) {
    pack.burgs.forEach(burg => {
      if (!burg) return;
      if (!burg.i || burg.removed) {
        burg.race = 0;
        return;
      }
      burg.race = getRaceFromCultureId(burg.culture);
    });
  }

  if (pack.religions) {
    pack.religions.forEach(religion => {
      if (!religion) return;
      if (!religion.i || religion.removed) {
        religion.race = 0;
        return;
      }
      religion.race = getRaceFromCultureId(religion.culture);
    });
  }

  if (pack.cells && pack.cells.culture && pack.cells.i) {
    const raceArray = new Uint16Array(pack.cells.i.length);
    for (const i of pack.cells.i) {
      const cultureId = pack.cells.culture[i];
      const culture = pack.cultures && pack.cultures[cultureId];
      const raceId = culture && culture.race ? culture.race : 0;
      raceArray[i] = raceId;
    }
    pack.cells.race = raceArray;
  }
}
