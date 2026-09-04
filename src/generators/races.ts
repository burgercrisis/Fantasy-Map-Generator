import type { NameBase } from "@/data/name-bases";
import { findEl } from "@/utils/nodeUtils";
import { rn } from "../utils";
import type { LanguageMixerCatalogEntry } from "./language-softmods";

// Type for the Names global (extended at runtime by names-mixer.ts)
interface NamesGlobal {
  getMixedByIso(isoWeights: Record<string, number>, options?: MixedByIsoOptions): string[];
  calculateChain(namesList: string): MarkovChain;
  updateChain(index: number): void;
  getBase(base: number, min?: number, max?: number, dupl?: string): string;
  nameBases: NameBase[];
}

declare global {
  var fantasyRaceNames: string[];
  var refreshDefaultNameBaseIds: (() => void) | undefined;
  var initializeRacesForExpansion: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
  var assignRaces: (() => void) | undefined;
  var rerollRacesForCultures: ((options?: { forceFilterFromUi?: boolean }) => void) | undefined;
}

interface LanguageMixerEntry extends LanguageMixerCatalogEntry {
  bases?: number[];
}

interface MixedByIsoOptions {
  count?: number;
  seed?: number;
  min?: number;
  max?: number;
  weights?: number[];
  legacyChain?: boolean;
}

interface RaceLanguageProfile {
  categories: string[];
  families: string[];
}

// Markov chain type for name generation
type MarkovChain = Record<string, string[]>;

// Race data: maps race name to array of namebase indices
const fantasyRaceBases: Record<string, number[]> = {
  Human: [32, 100000],
  Elf: [33, 100001],
  "Dark Elf": [34, 100002],
  Dwarf: [35, 100003],
  Goblin: [36, 100004],
  Orc: [37, 100005],
  Giant: [38, 100006],
  Draconic: [39, 100007],
  Arachnid: [40, 100008],
  Serpent: [41, 100009],
  Halfling: [43],
  Gnome: [44],
  "Half-Elf": [45],
  "Half-Orc": [46],
  Tiefling: [47],
  Aasimar: [48],
  Hobgoblin: [49],
  Goliath: [50],
  Lizardfolk: [51],
  Gnoll: [53],
  Bugbear: [54],
  Tabaxi: [55],
  Kenku: [57],
  Aarakocra: [58],
  Dragonborn: [59],
  Triton: [60],
  "Yuan-ti": [61],
  Firbolg: [62],
  Gith: [63],
  Genasi: [64],
  Satyr: [66],
  Minotaur: [67],
  Kobold: [69],
  Duergar: [70],
  "Shadar-kai": [73],
  Centaur: [75],
  Leonin: [76],
  Loxodon: [77],
  Harengon: [78],
  Tortle: [79],
  Owlin: [81],
  Kitsune: [84],
  Deepkin: [85],
  Starspawn: [86],
  Scions: [274],
  Seafarer: [275],
  AnyLanguage: [276]
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

const raceLanguageProfiles: Record<string, RaceLanguageProfile> = {
  Elf: {
    categories: ["Celtic", "Uralic"],
    families: ["Celtic", "Uralic", "Sami"]
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
    categories: ["Sino-Tibetan", "Mongolic", "Tai-Kadai", "Japonic", "Koreanic"],
    families: ["Sino-Tibetan", "Mongolic", "Tai-Kadai", "Japonic", "Koreanic"]
  },
  Dragonborn: {
    categories: ["Sino-Tibetan", "Mongolic", "Turkic", "Indo-Aryan", "Iranian"],
    families: ["Sino-Tibetan", "Mongolic", "Turkic", "Indo-Aryan", "Indo-Iranian", "Iranian"]
  },
  Arachnid: {
    categories: ["Afroasiatic"],
    families: ["Afroasiatic", "Semitic"]
  },
  Serpent: {
    categories: ["Indo-Aryan", "Dravidian", "Andamanese"],
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
    categories: ["Germanic", "Slavic", "Iranian", "Kartvelian", "Northeast Caucasian", "Northwest Caucasian"],
    families: ["Germanic", "Slavic", "Iranian", "Turkic", "Kartvelian", "Northeast Caucasian", "Northwest Caucasian"]
  },
  Lizardfolk: {
    categories: ["Niger-Congo", "Afroasiatic", "Nilo-Saharan", "Ubangian"],
    families: ["Niger-Congo", "Bantu", "Afroasiatic", "Nilo-Saharan", "Ubangian"]
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
      "Matacoan",
      "Macro-Jê",
      "Nadahup",
      "Chibchan",
      "Chapacuran",
      "Chimilan",
      "Chocoan",
      "Chonan",
      "Enlhet-Enenlhet",
      "Guaicuruan",
      "Jivaroan",
      "Paezan",
      "Zamucoan",
      "Mixed language",
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
      "Chibchan",
      "Chapacuran",
      "Chimilan",
      "Chocoan",
      "Chonan",
      "Enlhet-Enenlhet",
      "Guaicuruan",
      "Jivaroan",
      "Zamucoan",
      "Tacanan"
    ]
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
      "Yuman",
      "Muskogean",
      "Mixe-Zoque",
      "Tsimshianic"
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
      "Papuan",
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
      "Papuan",
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
    categories: ["Austronesian", "Micronesian", "Papuan", "Creole"],
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
  Satyr: {
    categories: ["Celtic", "Romance"],
    families: ["Celtic", "Romance", "Sardinian", "Tuscan", "Neapolitan"]
  },
  Minotaur: {
    categories: ["Greek", "Romance"],
    families: ["Greek", "Romance", "Sardinian", "Tuscan", "Neapolitan", "Indo-European"]
  },
  Kobold: {
    categories: ["Sino-Tibetan", "Tai-Kadai", "Japonic", "Koreanic"],
    families: ["Sino-Tibetan", "Tai-Kadai", "Japonic", "Koreanic"]
  },
  Duergar: {
    categories: ["Germanic", "Slavic"],
    families: ["Germanic", "Slavic", "Baltic", "Uralic"]
  },
  "Shadar-kai": {
    categories: ["Slavic", "Germanic"],
    families: ["Slavic", "Germanic", "Romance", "Baltic", "Romani"]
  },
  Centaur: {
    categories: ["Greek", "Iranian"],
    families: ["Greek", "Iranian", "Sardinian", "Tuscan", "Neapolitan"]
  },
  Leonin: {
    categories: ["Niger-Congo", "Nilo-Saharan", "Mande", "Khoe-Kwadi", "Kx'a", "Songhay", "Khoe", "Tuu"],
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
    families: ["Austronesian", "Micronesian", "Polynesian", "Papuan", "Australian Aboriginal"]
  },
  Owlin: {
    categories: ["Uralic", "Sino-Tibetan"],
    families: ["Uralic", "Sami", "Sino-Tibetan"]
  },
  Kitsune: {
    categories: ["Japonic", "Koreanic", "Austroasiatic", "Hmong-Mien", "Ainu"],
    families: ["Japonic", "Japanese dialects", "Amami Ryukyuan", "Okinawan Ryukyuan"]
  },
  Deepkin: {
    categories: ["Austronesian", "Papuan", "Australian Aboriginal", "Eskimo-Aleut"],
    families: ["Austronesian", "Micronesian", "Polynesian", "Papuan", "Australian Aboriginal", "Eskimo-Aleut"]
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
    families: ["Nivkh", "Yeniseian", "Yukaghir", "Eskimo–Aleut", "Tungusic"]
  },
  Scions: {
    categories: [
      "Uralic",
      "Slavic",
      "Baltic",
      "Turkic",
      "Mongolic",
      "Tungusic",
      "Koreanic",
      "Eskimo–Aleut",
      "Algonquian",
      "Na-Dene",
      "Uto-Aztecan",
      "Siouan",
      "Muskogean",
      "Mixe-Zoque",
      "Language isolate",
      "Hypothetical",
      "Unclassified"
    ],
    families: [
      "Sami",
      "Uralic",
      "Slavic",
      "Baltic",
      "Turkic",
      "Mongolic",
      "Tungusic",
      "Koreanic",
      "Eskimo–Aleut",
      "Algonquian",
      "Na-Dene",
      "Uto-Aztecan",
      "Siouan",
      "Muskogean",
      "Mixe-Zoque",
      "Language isolate",
      "Hypothetical",
      "Unclassified"
    ]
  },
  Seafarer: {
    categories: ["Austronesian", "Indo-European", "Atlantic-Congo"],
    families: ["Austronesian", "Polynesian", "Germanic", "Romance", "Celtic", "Atlantic-Congo"]
  },
  AnyLanguage: {
    categories: ["*"],
    families: ["*"]
  },
  Human: {
    categories: ["*"],
    families: ["*"]
  }
};

function getRaceLanguageProfile(raceName: string): RaceLanguageProfile | null {
  return raceLanguageProfiles[raceName] || null;
}

const fallbackRaceMixerIsoWeights: Record<string, number> = {
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

function normalizeRaceMixerKey(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ");
}

function getFallbackRaceMixerIsoWeights(): Record<string, number> {
  return fallbackRaceMixerIsoWeights;
}

function loadLanguageMixerCatalogForRaces(): LanguageMixerEntry[] {
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

function getRaceLanguageIsoWeights(raceName: string): Record<string, number> | null {
  const profile = getRaceLanguageProfile(raceName);

  const catalog = loadLanguageMixerCatalogForRaces();
  if (!Array.isArray(catalog) || !catalog.length) return null;

  if (!profile) {
    // If no profile, use fallback weights immediately
    return getFallbackRaceMixerIsoWeights();
  }

  const rawCategories = Array.isArray(profile.categories) ? profile.categories : [];
  const rawFamilies = Array.isArray(profile.families) ? profile.families : [];

  const categorySet = new Set(rawCategories.map(normalizeRaceMixerKey).filter(Boolean));
  const familySet = new Set(rawFamilies.map(normalizeRaceMixerKey).filter(Boolean));
  const useAllCategories = categorySet.has("*");
  const useAllFamilies = familySet.has("*");
  const useAll = useAllCategories || useAllFamilies;
  if (useAllCategories) categorySet.delete("*");
  if (useAllFamilies) familySet.delete("*");
  const isoWeights: Record<string, number> = {};

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

    const catOk = categorySet.size > 0 && langCategory !== "" && categorySet.has(langCategory);
    const famOk = familySet.size > 0 && effectiveFamily !== "" && familySet.has(effectiveFamily);
    if (!catOk && !famOk) return;

    let weight = 0;
    if (catOk) weight += 1;
    if (famOk) weight += 2; // lean more strongly into race families
    if (!weight) return;

    isoWeights[lang.iso] = (isoWeights[lang.iso] || 0) + weight;
  });

  const keys = Object.keys(isoWeights);
  if (!keys.length) {
    return getFallbackRaceMixerIsoWeights();
  }

  if (keys.length < 3) {
    const fallback = getFallbackRaceMixerIsoWeights();
    if (fallback && typeof fallback === "object") {
      const fallbackKeys = Object.keys(fallback)
        .filter(iso => iso && !isoWeights[iso])
        .sort();

      if (fallbackKeys.length) {
        let s = hashStringToUint32(`race-iso-fallback|${raceName}`);
        const needed = 3 - keys.length;
        for (let i = 0; i < needed && fallbackKeys.length; i++) {
          s = (s + 0x6d2b79f5) >>> 0;
          const idx = s % fallbackKeys.length;
          const iso = fallbackKeys.splice(idx, 1)[0];
          if (!iso) continue;
          const w = fallback[iso];
          const weight = typeof w === "number" && isFinite(w) && w > 0 ? w : 1;
          isoWeights[iso] = weight;
        }
      }
    }
  }

  return isoWeights;
}

// Helper to get Names with race mixer extensions
function getRaceNames(): NamesGlobal {
  return Names as unknown as NamesGlobal;
}

// Helper to get nameBases with race mixer extensions
function getNameBases(): NameBase[] {
  return getRaceNames().nameBases;
}

// Generate fresh Markov-mixed language samples for a race. This uses
// Names.getMixedByIso with iso weights derived from the race profile.
// If no suitable languages are found or the mixer is unavailable, falls
// back to the classic fantasy namebase defined for the race.

function generateRaceLanguageNames(raceName: string, options?: { count?: number }): string[] {
  const count = (options && options.count) || 40;
  const raceNames = getRaceNames();

  const canMix = typeof Names !== "undefined" && typeof raceNames.getMixedByIso === "function";
  if (canMix) {
    const isoWeights = getRaceLanguageIsoWeights(raceName);
    if (isoWeights) {
      try {
        const names = raceNames.getMixedByIso(isoWeights, { count });
        if (Array.isArray(names) && names.length >= 3) return names;
      } catch (error) {
        ERROR && console.error("Race mixer error for", raceName, error);
      }
    }
  }

  // Fallback if mixer is absolutely unavailable
  if (!canMix) {
    const bases = fantasyRaceBases[raceName];
    if (!bases || !bases.length || !Names || typeof Names.getBase !== "function") return [];

    const baseIndex = bases[0];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(Names.getBase(baseIndex));
    }
    return result;
  }

  // For non-human races, if mixer failed, try one more time with absolute fallback weights
  if (canMix) {
    try {
      const fallbackWeights = getFallbackRaceMixerIsoWeights();
      const names = raceNames.getMixedByIso(fallbackWeights, { count });
      if (Array.isArray(names) && names.length >= 3) return names;
    } catch (error) {
      ERROR && console.error("Race mixer absolute fallback error for", raceName, error);
    }
  }

  return [];
}

function getRaceMixerBaseDisplayName(raceName: string): string {
  return `Race ${raceName} (Mixer)`;
}

function isBadRaceMixerDisplayName(displayName: unknown, raceName: string): boolean {
  if (!displayName || typeof displayName !== "string") return false;
  if (!raceName) return false;
  const trimmed = displayName.trimEnd();
  // Only flag the literal "Race X (Mixer)" pattern as bad
  if (trimmed === `Race ${raceName} (Mixer)`) return true;
  // Flag if it's just the race name in parens with nothing before
  const suffix = `(${raceName})`;
  if (trimmed.endsWith(suffix)) {
    const prefix = trimmed.slice(0, trimmed.length - suffix.length).trim();
    if (!prefix) return true;
  }
  return false;
}

function buildRaceMixerLanguageDisplayName(
  raceName: string,
  isoWeights: Record<string, number>,
  options?: { seed?: number }
): string {
  if (!raceName) return "";
  if (!isoWeights || typeof isoWeights !== "object") return "";
  if (!Names || typeof Names.calculateChain !== "function") return "";

  const catalog = loadLanguageMixerCatalogForRaces();
  if (!Array.isArray(catalog) || !catalog.length) return "";

  const catalogByIso = new Map<string, LanguageMixerEntry>();
  for (const lang of catalog) {
    if (!lang || !lang.iso || !lang.name) continue;
    catalogByIso.set(lang.iso, lang);
  }

  const cleanedByName = new Map<string, { name: string; weight: number }>();
  for (const [iso, weightRaw] of Object.entries(isoWeights)) {
    const lang = catalogByIso.get(iso);
    if (!lang) continue;
    const weight = typeof weightRaw === "number" && isFinite(weightRaw) ? weightRaw : 0;
    if (weight <= 0) continue;

    let n = String(lang.name || "").trim();
    n = n
      .replace(/\s*\(.*?\)\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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
    .map(([key, value]) => ({ key, name: value?.name, weight: value?.weight }))
    .filter(s => s && s.name && typeof s.weight === "number" && s.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  if (!sources.length) return "";

  const seed = options && typeof options.seed === "number" ? options.seed : null;
  const seedInt = typeof seed === "number" && isFinite(seed) ? seed >>> 0 : 0;
  let s = seedInt || hashStringToUint32(`race-mixer-name|${raceName}`);
  const rng = () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)];

  const combined: string[] = [];
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
  const chain = Names.calculateChain(combinedString) as any;
  if (!chain || chain[""] === undefined) return "";

  const min = 4;
  const max = 16;
  const dupl = "lnrt";

  // Helper to safely get chain value
  const chainValue = (key: string): string[] => {
    const val = (chain as any)[key];
    return Array.isArray(val) ? val : [];
  };

  // Helper to get last character of a string
  const lastChar = (s: string): string => s[s.length - 1] || "";

  // Try up to 5 times to generate a good name
  let bestName = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    let v: string[] = chainValue("");
    let cur: string = pick(v) as string;
    let w = "";
    for (let i = 0; i < 20; i++) {
      if (cur === "") {
        if (w.length < min) {
          cur = "";
          w = "";
          v = chainValue("");
        } else break;
      } else {
        if (w.length + cur.length > max) {
          if (w.length < min) w += cur;
          break;
        } else v = chainValue(lastChar(cur)) || chainValue("");
      }
      w += cur;
      cur = pick(v) as string;
    }

    const l = lastChar(w);
    if (l === "'" || l === " " || l === "-") w = w.slice(0, -1);

    let name = [...w].reduce((r, c, i, d) => {
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

    if (!name || name.length < 2) continue;

    const prefix = String(name).trim();
    if (prefix.length < 4) continue;
    if (/english/i.test(prefix)) continue;
    // Reject only if it's an exact match with a source language name
    if (prefix.length < 6) {
      const prefixLower = prefix.toLowerCase();
      let matchesSource = false;
      for (const src of sources) {
        const sName = src && src.name ? String(src.name).trim() : "";
        if (!sName) continue;
        if (sName.toLowerCase() === prefixLower) {
          matchesSource = true;
          break;
        }
      }
      if (matchesSource) continue;
    }

    bestName = prefix;
    break;
  }

  if (!bestName) {
    // Fallback: derive a name from the top source language
    const topSource = sources[0];
    if (topSource && topSource.name) {
      const src = String(topSource.name).trim();
      if (src.length >= 3) {
        bestName = src.charAt(0).toUpperCase() + src.slice(1);
      }
    }
  }

  if (!bestName || bestName.length < 3) return "";

  return `${bestName} (${raceName})`;
}

function hashStringToUint32(value: unknown): number {
  const str = value == null ? "" : String(value);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function findExistingRaceMixerBaseIndex(raceName: string): number | null {
  if (!raceName) return null;
  const nameBases = getNameBases();
  if (!Array.isArray(nameBases)) return null;
  const expectedName = getRaceMixerBaseDisplayName(raceName);
  for (let i = 0; i < nameBases.length; i++) {
    const b = nameBases[i];
    if (!b) continue;
    if (b.raceMixerFor === raceName) return i;
    if (typeof b.name !== "string") continue;
    const name = b.name.trimEnd();

    // Stricter check: only match by name if it's explicitly marked as a mixer base
    // or if it matches the generated pattern like "Elf Mix" or "Quenian (Elf)"
    const isMixerBase = b.raceMixerFor || b.cultureMixer || b.isoWeights || (b.name && b.name.includes(" Mix"));
    if (!isMixerBase) continue;

    if (name === expectedName) return i;
    if (name.endsWith(`(${raceName})`)) return i;
  }
  return null;
}

function getRaceDefaultBaseIndex(raceName: string): number | null {
  if (!raceName) return null;
  if (!fantasyRaceBases || !fantasyRaceBases[raceName]) return null;
  const nameBases = getNameBases();
  if (!Array.isArray(nameBases)) return null;

  const bases = fantasyRaceBases[raceName];
  if (!Array.isArray(bases) || !bases.length) return null;

  for (const baseIndex of bases) {
    if (typeof baseIndex !== "number") continue;
    const base = nameBases[baseIndex];
    if (!base) continue;
    if (base && base.raceMixerFor) continue;
    return baseIndex;
  }

  return null;
}

function ensureRaceMixerBaseIndex(
  raceName: string,
  options?: { seed?: string | number; count?: number; refresh?: boolean }
): number | null {
  if (!raceName) return null;
  // Allow mixer for races even if they have no static bases (commented out)
  if (!fantasyRaceBases[raceName] && !raceLanguageProfiles[raceName]) return null;
  const nameBases = getNameBases();
  if (!Array.isArray(nameBases)) return null;

  const seed =
    options && (typeof options.seed === "string" || typeof options.seed === "number") ? String(options.seed) : "";

  const existing = findExistingRaceMixerBaseIndex(raceName);
  if (existing != null) {
    const base = nameBases[existing];
    if (base && !base.raceMixerFor) base.raceMixerFor = raceName;

    const shouldRefreshExistingSeedBlob = (() => {
      if (!base || typeof base.b !== "string") return false;
      const raceNames = getRaceNames();
      if (!Names || typeof raceNames.getMixedByIso !== "function") return false;
      if (options && options.refresh) return true;
      try {
        const count = base.b.split(",").filter(Boolean).length;
        if (count < 80) return true;
      } catch (_e) {
        return true;
      }

      try {
        const name = typeof base.name === "string" ? base.name.trimEnd() : "";
        if (isBadRaceMixerDisplayName(name, raceName)) return true;
      } catch (_e) {}

      return false;
    })();

    if (shouldRefreshExistingSeedBlob) {
      const fallbackIsoWeights = getFallbackRaceMixerIsoWeights();
      const primaryIsoWeights = getRaceLanguageIsoWeights(raceName);
      const isoWeights = primaryIsoWeights || fallbackIsoWeights;

      if (isoWeights) {
        const count = (options && options.count) || 240;
        const seedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer`;
        const mixSeed = hashStringToUint32(seedSource);

        const getSanitized = (weights: Record<string, number>): string[] | null => {
          let names: string[];
          try {
            names = getRaceNames().getMixedByIso(weights, { count, seed: mixSeed });
          } catch (_e) {
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
          return sanitized;
        };

        let sanitized = getSanitized(isoWeights);
        if (!sanitized && primaryIsoWeights && fallbackIsoWeights) {
          sanitized = getSanitized(fallbackIsoWeights);
        }

        if (sanitized) {
          let min = 4;
          let max = 12;
          try {
            const lengths = sanitized.map(n => n.length).sort((a, b) => a - b);
            const q = (p: number) => lengths[Math.floor(p * (lengths.length - 1))];
            const p25 = q(0.25);
            const p75 = q(0.75);
            const computedMin = Math.max(3, Math.min(12, Math.floor(p25)));
            const computedMax = Math.max(computedMin, Math.min(16, Math.ceil(p75) + 2));
            min = computedMin;
            max = computedMax;
          } catch (_e) {}

          base.b = sanitized.join(",");
          base.min = min;
          base.max = max;
          base.d = "";
          base.m = 0;

          if (Names && typeof Names.updateChain === "function") {
            try {
              Names.updateChain(existing);
            } catch (_e) {}
          }
        }
      }
    }

    if (
      base &&
      typeof base.name === "string" &&
      (base.name === getRaceMixerBaseDisplayName(raceName) || isBadRaceMixerDisplayName(base.name, raceName))
    ) {
      const fallbackIsoWeights = getFallbackRaceMixerIsoWeights();
      const primaryIsoWeights = getRaceLanguageIsoWeights(raceName);
      const isoWeights = primaryIsoWeights || fallbackIsoWeights;

      const seedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer-name`;
      const nameSeed = hashStringToUint32(seedSource);
      const display = buildRaceMixerLanguageDisplayName(raceName, isoWeights, { seed: nameSeed });
      base.name = display || getRaceMixerBaseDisplayName(raceName);
    }

    return existing;
  }

  if (!Names || typeof getRaceNames().getMixedByIso !== "function") return null;
  const fallbackIsoWeights = getFallbackRaceMixerIsoWeights();
  const primaryIsoWeights = getRaceLanguageIsoWeights(raceName);
  const isoWeights = primaryIsoWeights || fallbackIsoWeights;
  if (!isoWeights) return null;

  const count = (options && options.count) || 240;
  const seedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer`;
  const mixSeed = hashStringToUint32(seedSource);

  const getSanitized = (weights: Record<string, number>): string[] | null => {
    let names: string[];
    try {
      names = getRaceNames().getMixedByIso(weights, { count, seed: mixSeed });
    } catch (_e) {
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
    const q = (p: number) => lengths[Math.floor(p * (lengths.length - 1))];
    const p25 = q(0.25);
    const p75 = q(0.75);
    const computedMin = Math.max(3, Math.min(12, Math.floor(p25)));
    const computedMax = Math.max(computedMin, Math.min(16, Math.ceil(p75) + 2));
    min = computedMin;
    max = computedMax;
  } catch (_e) {}

  const b = sanitized.join(",");
  const baseIndex = nameBases.length;
  const nameSeedSource = `${typeof seed === "string" ? seed : ""}|${raceName}|race-mixer-name`;
  const nameSeed = hashStringToUint32(nameSeedSource);
  const displayName = buildRaceMixerLanguageDisplayName(raceName, isoWeights, { seed: nameSeed });
  const newBase: NameBase =
    displayName && !isBadRaceMixerDisplayName(displayName, raceName)
      ? { name: displayName, i: baseIndex, min, max, d: "", m: 0, b, raceMixerFor: raceName }
      : { name: getRaceMixerBaseDisplayName(raceName), i: baseIndex, min, max, d: "", m: 0, b, raceMixerFor: raceName };
  nameBases.push(newBase);
  if (typeof window.refreshDefaultNameBaseIds === "function") {
    window.refreshDefaultNameBaseIds();
  }
  return baseIndex;
}

function getRacesSetFilter(value: string): Set<string> | null {
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
        "Kobold"
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
        "Kenku",
        "Yuan-ti",
        "Gith",
        "Dragonborn",
        "Kobold",
        "Duergar",
        "Minotaur",
        "Shadar-kai",
        "Deepkin",
        "Starspawn",
        "Scions"
      ]);
    case "primal":
      return new Set([
        "Elf",
        "Firbolg",
        "Goliath",
        "Lizardfolk",
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
        "Shadar-kai",
        "Starspawn",
        "Scions"
      ]);
    case "fey":
      return new Set([
        "Elf",
        "Firbolg",
        "Satyr",
        "Harengon",
        "Gnome",
        "Halfling",
        "Centaur",
        "Owlin",
        "Kitsune",
        "Scions"
      ]);
    case "beastfolk":
      return new Set([
        "Goliath",
        "Lizardfolk",
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
        "Kobold",
        "Kitsune"
      ]);
    case "underdark":
      return new Set([
        "Dark Elf",
        "Duergar",
        "Kobold",
        "Yuan-ti",
        "Arachnid",
        "Serpent",
        "Goblin",
        "Bugbear",
        "Gith",
        "Deepkin",
        "Starspawn",
        "Scions"
      ]);
    default:
      return null;
  }
}

function defineRaceExpansionism(name: string): number {
  const sizeVarietyElement = findEl<HTMLInputElement>("sizeVariety");
  const variety = (sizeVarietyElement && (sizeVarietyElement.valueAsNumber || +sizeVarietyElement.value)) || 1;

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
  else if (name === "Gnoll") base = 1.3;
  else if (name === "Bugbear") base = 1.1;
  else if (name === "Tabaxi") base = 1.2;
  else if (name === "Kenku") base = 1.0;
  else if (name === "Aarakocra") base = 0.9;
  else if (name === "Dragonborn") base = 1.3;
  else if (name === "Triton") base = 0.9;
  else if (name === "Yuan-ti") base = 1.1;
  else if (name === "Firbolg") base = 0.9;
  else if (name === "Gith") base = 1.2;
  else if (name === "Genasi") base = 1.1;
  else if (name === "Satyr") base = 1.1;
  else if (name === "Minotaur") base = 1.4;
  else if (name === "Kobold") base = 1.3;
  else if (name === "Duergar") base = 0.9;
  else if (name === "Shadar-kai") base = 1.0;
  else if (name === "Centaur") base = 1.2;
  else if (name === "Leonin") base = 1.1;
  else if (name === "Loxodon") base = 0.9;
  else if (name === "Harengon") base = 1.3;
  else if (name === "Tortle") base = 0.8;
  else if (name === "Owlin") base = 1.0;
  else if (name === "Kitsune") base = 1.0;
  else if (name === "Deepkin") base = 0.8;
  else if (name === "Starspawn") base = 0.7;
  else if (name === "Human") base = 1.3;

  const randomFactor = (Math.random() * variety) / 2 + 1;
  return rn(randomFactor * base, 1);
}

function getRaceNameForCulture(culture: any): string {
  if (!culture || !culture.i || culture.removed) return "Human";

  // Primary: explicit race name string assigned to the culture
  if (typeof culture.race === "string" && culture.race !== "None" && culture.race !== "") return culture.race;

  // Secondary: numeric race index into pack.races
  if (culture.race != null && typeof culture.race === "number" && pack && Array.isArray((pack as any).races)) {
    const race = (pack as any).races[culture.race];
    const raceName = race && typeof race.name === "string" ? race.name : "";
    if (raceName && raceName !== "None") return raceName;
  }

  // Tertiary: check if culture.base maps to a known fantasy race base
  const base = culture.base;
  const nameBases = getNameBases();

  for (const [raceName, bases] of Object.entries(fantasyRaceBases)) {
    if (bases.includes(base)) return raceName;
  }

  // Quaternary: check if the namebase is marked as a race mixer base
  const baseEntry = nameBases && nameBases[base];
  const markedRace = baseEntry && typeof baseEntry.raceMixerFor === "string" ? baseEntry.raceMixerFor : "";
  if (markedRace && fantasyRaceBases[markedRace]) return markedRace;

  return "Human";
}

function shouldEnableRacesForCurrentWorld(): boolean {
  if (pack && Array.isArray((pack as any).races)) {
    for (const race of (pack as any).races) {
      if (!race || !race.i || !race.name) continue;
      if (race.name) return true;
    }
  }

  if (!pack || !Array.isArray(pack.cultures)) return false;
  for (const culture of pack.cultures) {
    if (!culture || !culture.i || culture.removed) continue;
    const raceName = getRaceNameForCulture(culture);
    if (raceName) return true;
  }

  return false;
}

function initializeRacesForExpansion(options?: { forceFilterFromUi?: boolean; skipApplyFilter?: boolean }): void {
  if (!pack || !pack.cultures) return;
  if (!shouldEnableRacesForCurrentWorld()) return;

  const packAny = pack as any;
  const existingRaces = packAny.races || [];
  const races: { i: number; name: string; color?: string; expansionism?: number }[] = [{ i: 0, name: "None" }];
  const raceIndexByName = new Map<string, number>();
  const raceColorById: Record<number, string> = {};

  const isFirstInitialization = existingRaces.length <= 1;
  const forceFilterFromUi = options && options.forceFilterFromUi;
  const skipApplyFilter = options && options.skipApplyFilter;
  const shouldApplyFilter = !skipApplyFilter && (isFirstInitialization || forceFilterFromUi);

  let allowedRaces: Set<string> | null = null;
  if (shouldApplyFilter) {
    const racesSetElement = findEl<HTMLSelectElement>("racesSet");
    const racesSetValue = racesSetElement ? racesSetElement.value : "all";
    const racesSetFilter = getRacesSetFilter(racesSetValue);

    const racesNumberElement = findEl<HTMLInputElement>("racesNumber");
    const racesLimitRaw = (racesNumberElement && (racesNumberElement.valueAsNumber || +racesNumberElement.value)) || 0;
    const maxNonHumanRaces = racesLimitRaw > 0 ? racesLimitRaw : Infinity;

    // Build the full pool of eligible non-human races from fantasyRaceBases,
    // constrained only by the UI races set filter. This ensures races not
    // currently on the map remain eligible (prevents race extinction on reroll).
    const allNonHumanRaces = Array.from(Object.keys(fantasyRaceBases)).filter(r => r !== "Human");
    const uiFilteredRaces = racesSetFilter ? allNonHumanRaces.filter(r => racesSetFilter.has(r)) : allNonHumanRaces;

    if (maxNonHumanRaces === Infinity) {
      allowedRaces = new Set(uiFilteredRaces);
    } else if (uiFilteredRaces.length > 0) {
      // Prioritize races currently on the map (by culture count), then fill
      // remaining slots from the eligible pool.
      const raceNeedCounts = new Map<string, number>();
      pack.cultures.forEach(culture => {
        if (!culture || !culture.i || culture.removed) return;
        const raceName = getRaceNameForCulture(culture);
        if (!raceName || raceName === "Human") return;
        if (!uiFilteredRaces.includes(raceName)) return;
        raceNeedCounts.set(raceName, (raceNeedCounts.get(raceName) || 0) + 1);
      });

      const currentRaces = Array.from(raceNeedCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      const newRaces = uiFilteredRaces.filter(r => !raceNeedCounts.has(r));
      const combined = [...currentRaces, ...newRaces];

      allowedRaces = new Set(combined.slice(0, maxNonHumanRaces));
    }
    if (allowedRaces) allowedRaces.add("Human");
  }

  existingRaces.forEach((race: any) => {
    if (!race || !race.i) return;
    races[race.i] = { i: race.i, name: race.name, color: race.color, expansionism: race.expansionism };
    raceIndexByName.set(race.name, race.i);
    if (race.color) raceColorById[race.i] = race.color;
  });

  pack.cultures.forEach((culture: any) => {
    if (!culture) return;
    if (!culture.i || culture.removed) {
      culture.race = 0;
      return;
    }

    let raceName: string | null = getRaceNameForCulture(culture);

    if (shouldApplyFilter && raceName && allowedRaces) {
      if (!allowedRaces.has(raceName)) raceName = "Human";
    }

    if (raceName && raceName !== "Human") {
      const nameBases = getNameBases();
      const currentBase = nameBases && nameBases[culture.base];
      const hasCultureMixer = currentBase && currentBase.cultureMixer && currentBase.cultureMixerFor === culture.i;
      if (!hasCultureMixer) {
        const baseIndex = ensureRaceMixerBaseIndex(raceName);
        if (typeof baseIndex === "number") culture.base = baseIndex;
      }
    }
    const id = raceIndexByName.get(raceName);
    if (!id) {
      const newRaceId = races.length;
      raceIndexByName.set(raceName, newRaceId);
      const expansionism = defineRaceExpansionism(raceName);
      races[newRaceId] = { i: newRaceId, name: raceName, expansionism };
      culture.race = newRaceId;
    } else {
      culture.race = id;
    }

    if (!raceColorById[culture.race] && culture.color) {
      raceColorById[culture.race] = culture.color;
    }
  });

  races.forEach(race => {
    if (!race || !race.i) return;
    race.color = raceColorById[race.i] || race.color || "#888888";
    if (race.expansionism == null) race.expansionism = 1;
  });

  packAny.races = races;
}

function rerollRacesForCultures(options?: { forceFilterFromUi?: boolean }): void {
  if (!pack || !Array.isArray(pack.cultures)) return;
  if (!shouldEnableRacesForCurrentWorld()) return;

  const forceFilterFromUi = options && options.forceFilterFromUi;
  const packAny = pack as any;

  let allowedRaces: Set<string> | null = null;
  // Read non-human chance from slider (0-100%, default 35%)
  let nonHumanChance = 0.35;
  if (forceFilterFromUi) {
    const racesSetElement = findEl<HTMLSelectElement>("racesSet");
    const racesSetValue = racesSetElement ? racesSetElement.value : "all";
    const racesSetFilter = getRacesSetFilter(racesSetValue);

    const racesNumberElement = findEl<HTMLInputElement>("racesNumber");
    const racesLimitRaw = (racesNumberElement && (racesNumberElement.valueAsNumber || +racesNumberElement.value)) || 0;
    const maxNonHumanRaces = racesLimitRaw > 0 ? racesLimitRaw : Infinity;

    const racesNonHumanChanceElement = findEl<HTMLInputElement>("racesNonHumanChance");
    const nonHumanChancePercent = (racesNonHumanChanceElement && (racesNonHumanChanceElement.valueAsNumber ?? +racesNonHumanChanceElement.value)) ?? 35;
    nonHumanChance = nonHumanChancePercent / 100;

    // Build the full pool of eligible non-human races from fantasyRaceBases,
    // constrained only by the UI races set filter. This ensures races not
    // currently on the map remain eligible (prevents race extinction on reroll).
    const allNonHumanRaces = Array.from(Object.keys(fantasyRaceBases)).filter(r => r !== "Human");
    const uiFilteredRaces = racesSetFilter ? allNonHumanRaces.filter(r => racesSetFilter.has(r)) : allNonHumanRaces;

    if (maxNonHumanRaces === Infinity) {
      allowedRaces = new Set(uiFilteredRaces);
    } else if (uiFilteredRaces.length > 0) {
      // Prioritize races currently on the map (by culture count), then fill
      // remaining slots from the eligible pool. This keeps the most common
      // races while still allowing diversity.
      const raceNeedCounts = new Map<string, number>();
      pack.cultures.forEach(culture => {
        if (!culture || !culture.i || culture.removed) return;
        const raceName = getRaceNameForCulture(culture);
        if (!raceName || raceName === "Human") return;
        if (!uiFilteredRaces.includes(raceName)) return;
        raceNeedCounts.set(raceName, (raceNeedCounts.get(raceName) || 0) + 1);
      });

      const currentRaces = Array.from(raceNeedCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Fill remaining slots with races not currently on the map
      const newRaces = uiFilteredRaces.filter(r => !raceNeedCounts.has(r));
      const combined = [...currentRaces, ...newRaces];

      allowedRaces = new Set(combined.slice(0, maxNonHumanRaces));
    }
    if (allowedRaces) allowedRaces.add("Human");
  }

  const nonHumanPool = Array.from(Object.keys(fantasyRaceBases)).filter(r => r !== "Human");
  const filteredNonHumanPool = allowedRaces ? nonHumanPool.filter(r => allowedRaces.has(r)) : nonHumanPool;

  const races: { i: number; name: string; color?: string; expansionism?: number }[] = [{ i: 0, name: "None" }];
  const raceIndexByName = new Map<string, number>();
  const raceColorById: Record<number, string> = {};

  const ensureRaceId = (raceName: string): number => {
    let raceId = raceIndexByName.get(raceName);
    if (raceId) return raceId;
    raceId = races.length;
    raceIndexByName.set(raceName, raceId);
    const expansionism = defineRaceExpansionism(raceName);
    races[raceId] = { i: raceId, name: raceName, expansionism };
    return raceId;
  };

  const pickNonHumanRace = (): string => {
    if (!filteredNonHumanPool.length) return "Human";
    return filteredNonHumanPool[Math.floor(Math.random() * filteredNonHumanPool.length)];
  };

  pack.cultures.forEach((culture: any) => {
    if (!culture) return;
    if (!culture.i || culture.removed) {
      culture.race = 0;
      return;
    }

    const isNonHuman = filteredNonHumanPool.length > 0 && Math.random() < nonHumanChance;
    const raceName = isNonHuman ? pickNonHumanRace() : "Human";
    const raceId = ensureRaceId(raceName);
    culture.race = raceId;

    // Only assign a race mixer base if the culture doesn't already have
    // a culture-specific mixer base (preserves unique per-culture names)
    if (raceName) {
      const nameBases = getNameBases();
      const currentBase = nameBases && nameBases[culture.base];
      const hasCultureMixer = currentBase && currentBase.cultureMixer && currentBase.cultureMixerFor === culture.i;
      if (!hasCultureMixer) {
        const baseIndex = ensureRaceMixerBaseIndex(raceName);
        if (typeof baseIndex === "number") culture.base = baseIndex;
      }
    }

    if (raceId && !raceColorById[raceId] && culture.color) raceColorById[raceId] = culture.color;
  });

  races.forEach(race => {
    if (!race || !race.i) return;
    race.color = raceColorById[race.i] || race.color || "#888888";
    if (race.expansionism == null) race.expansionism = 1;
  });

  packAny.races = races;
}

function syncCultureBasesToDominantRace(): void {
  if (!pack || !Array.isArray(pack.cultures)) return;
  const packAny = pack as any;
  if (!packAny || !Array.isArray(packAny.races)) return;
  const { cells, cultures, races } = packAny;
  if (!cells || !cells.i || !cells.culture || !cells.race) return;
  if (!Array.isArray(cultures) || !Array.isArray(races) || races.length < 1) return;
  if (typeof ensureRaceMixerBaseIndex !== "function") return;

  const countsByCulture: Record<number, Record<number, number>> = {};
  const countsByState: { [key: number]: Record<number, number> } = {};
  const countsByProvince: { [key: number]: Record<number, number> } = {};
  const countsByReligion: { [key: number]: Record<number, number> } = {};

  for (const i of cells.i) {
    if (cells.h && cells.h[i] < 20) continue;
    const cultureId = cells.culture[i];
    if (!cultureId) continue;
    const raceId = cells.race[i] || 0;
    if (!raceId) continue;
    if (!races || !races[raceId]) continue;

    const cultureBucket = (countsByCulture[cultureId] = countsByCulture[cultureId] || {});
    cultureBucket[raceId] = (cultureBucket[raceId] || 0) + 1;

    const stateId = cells.state ? cells.state[i] : 0;
    if (stateId) {
      const bucket = (countsByState[stateId] = countsByState[stateId] || {}) as Record<number, number>;
      bucket[raceId] = (bucket[raceId] || 0) + 1;
    }

    const provinceId = cells.province ? cells.province[i] : 0;
    if (provinceId) {
      const bucket = (countsByProvince[provinceId] = countsByProvince[provinceId] || {}) as Record<number, number>;
      bucket[raceId] = (bucket[raceId] || 0) + 1;
    }

    const religionId = cells.religion ? cells.religion[i] : 0;
    if (religionId) {
      const bucket = (countsByReligion[religionId] = countsByReligion[religionId] || {}) as Record<number, number>;
      bucket[raceId] = (bucket[raceId] || 0) + 1;
    }
  }

  const getDominantRaceId = (counts: Record<number, number> | undefined): number => {
    if (!counts) return 0;
    let bestRaceId = 0;
    let bestCount = 0;
    for (const [raceIdRaw, count] of Object.entries(counts)) {
      const raceId = +raceIdRaw;
      if (!raceId) continue;
      if (count > bestCount) {
        bestCount = count;
        bestRaceId = raceId;
      }
    }
    return bestRaceId;
  };

  if (packAny.states) {
    packAny.states.forEach((state: any) => {
      if (!state) return;
      if (!state.i || state.removed) {
        state.race = 0;
        return;
      }
      state.race = getDominantRaceId(countsByState[state.i]);
    });
  }

  if (packAny.provinces) {
    packAny.provinces.forEach((province: any) => {
      if (!province) return;
      if (!province.i || province.removed) {
        province.race = 0;
        return;
      }
      province.race = getDominantRaceId(countsByProvince[province.i]);
    });
  }

  if (packAny.religions) {
    packAny.religions.forEach((religion: any) => {
      if (!religion) return;
      if (!religion.i || religion.removed) {
        religion.race = 0;
        return;
      }
      religion.race = getDominantRaceId(countsByReligion[religion.i]);
    });
  }

  if (packAny.burgs) {
    packAny.burgs.forEach((burg: any) => {
      if (!burg) return;
      if (!burg.i || burg.removed) {
        burg.race = 0;
        return;
      }
      const cell = burg.cell;
      const raceId = cell !== undefined && cells.race ? cells.race[cell] || 0 : 0;
      burg.race = races && races[raceId] ? raceId : 0;
    });
  }

  for (const culture of cultures) {
    if (!culture || !culture.i || culture.removed) continue;
    const counts = countsByCulture[culture.i];
    if (!counts) continue;

    let bestRaceId = -1;
    let bestCount = -1;
    for (const [raceIdRaw, count] of Object.entries(counts) as any) {
      const raceId = +raceIdRaw;
      if (count > bestCount) {
        bestCount = count;
        bestRaceId = raceId;
      }
    }

    if (bestRaceId === -1) continue;
    const race = races[bestRaceId];
    const raceName = race && typeof race.name === "string" ? race.name : "";
    if (raceName && raceName !== "Human") {
      // Only assign a race mixer base if the culture doesn't already have
      // a culture-specific mixer base (preserves unique per-culture names)
      const nameBases = getNameBases();
      const currentBase = nameBases && nameBases[culture.base];
      const hasCultureMixer = currentBase && currentBase.cultureMixer && currentBase.cultureMixerFor === culture.i;
      if (!hasCultureMixer) {
        const baseIndex = ensureRaceMixerBaseIndex(raceName);
        if (typeof baseIndex === "number") culture.base = baseIndex;
      }
    }
  }
}

function assignRaces(): void {
  if (!pack || !pack.cultures) return;
  const packAny = pack as any;

  function clearRaces(): void {
    packAny.races = [];

    if (pack.cultures) pack.cultures.forEach((c: any) => c && delete c.race);
    if (packAny.states) packAny.states.forEach((s: any) => s && delete s.race);
    if (packAny.provinces) packAny.provinces.forEach((p: any) => p && delete p.race);
    if (packAny.burgs) packAny.burgs.forEach((b: any) => b && delete b.race);
    if (packAny.religions) packAny.religions.forEach((r: any) => r && delete r.race);
  }

  if (!shouldEnableRacesForCurrentWorld()) {
    clearRaces();
    return;
  }

  const hasCellRaces =
    pack.cells && packAny.cells.race && pack.cells.i && packAny.cells.race.length === pack.cells.i.length;

  if (hasCellRaces && !(packAny.cells.race instanceof Uint16Array)) {
    packAny.cells.race = Uint16Array.from(packAny.cells.race);
  }

  function getRaceFromCultureId(cultureId: number): number {
    const culture = pack.cultures && pack.cultures[cultureId];
    return culture && (culture as any).race ? (culture as any).race : 0;
  }

  if (hasCellRaces && pack.cells) {
    const cells = packAny.cells;
    const { races } = packAny;
    const raceByCell = cells.race;
    const countsByState: Record<number, Record<number, number>[]> = [];
    const countsByProvince: Record<number, Record<number, number>[]> = [];
    const countsByReligion: Record<number, Record<number, number>[]> = [];

    for (const i of cells.i) {
      if (cells.h && cells.h[i] < 20) continue;
      const raceId = raceByCell[i] || 0;
      if (!raceId) continue;
      if (!races || !races[raceId]) continue;

      const stateId = cells.state ? cells.state[i] : 0;
      if (stateId) {
        const bucket = (countsByState[stateId] = countsByState[stateId] || {}) as any;
        bucket[raceId] = (bucket[raceId] || 0) + 1;
      }

      const provinceId = cells.province ? cells.province[i] : 0;
      if (provinceId) {
        const bucket = (countsByProvince[provinceId] = countsByProvince[provinceId] || {}) as any;
        bucket[raceId] = (bucket[raceId] || 0) + 1;
      }

      const religionId = cells.religion ? cells.religion[i] : 0;
      if (religionId) {
        const bucket = (countsByReligion[religionId] = countsByReligion[religionId] || {}) as any;
        bucket[raceId] = (bucket[raceId] || 0) + 1;
      }
    }

    const getDominantRaceId = (counts: Record<number, number> | undefined): number => {
      if (!counts) return 0;
      let bestRaceId = 0;
      let bestCount = 0;
      for (const [raceIdRaw, count] of Object.entries(counts)) {
        const raceId = +raceIdRaw;
        if (!raceId) continue;
        if (count > bestCount) {
          bestCount = count;
          bestRaceId = raceId;
        }
      }
      return bestRaceId;
    };

    if (packAny.states) {
      packAny.states.forEach((state: any) => {
        if (!state) return;
        if (!state.i || state.removed) {
          state.race = 0;
          return;
        }
        state.race = getDominantRaceId(countsByState[state.i] as any);
      });
    }

    if (packAny.provinces) {
      packAny.provinces.forEach((province: any) => {
        if (!province) return;
        if (!province.i || province.removed) {
          province.race = 0;
          return;
        }
        province.race = getDominantRaceId(countsByProvince[province.i] as any);
      });
    }

    if (packAny.religions) {
      packAny.religions.forEach((religion: any) => {
        if (!religion) return;
        if (!religion.i || religion.removed) {
          religion.race = 0;
          return;
        }
        religion.race = getDominantRaceId(countsByReligion[religion.i] as any);
      });
    }

    if (packAny.burgs) {
      packAny.burgs.forEach((burg: any) => {
        if (!burg) return;
        if (!burg.i || burg.removed) {
          burg.race = 0;
          return;
        }
        const cell = burg.cell;
        const raceId = cell !== undefined && raceByCell ? raceByCell[cell] || 0 : 0;
        burg.race = races && races[raceId] ? raceId : 0;
      });
    }
  } else {
    if (packAny.states) {
      packAny.states.forEach((state: any) => {
        if (!state) return;
        if (!state.i || state.removed) {
          state.race = 0;
          return;
        }
        state.race = getRaceFromCultureId(state.culture);
      });
    }

    if (packAny.provinces && packAny.states) {
      packAny.provinces.forEach((province: any) => {
        if (!province) return;
        if (!province.i || province.removed) {
          province.race = 0;
          return;
        }
        const state = packAny.states[province.state];
        province.race = state && state.race ? state.race : 0;
      });
    }

    if (packAny.burgs) {
      packAny.burgs.forEach((burg: any) => {
        if (!burg) return;
        if (!burg.i || burg.removed) {
          burg.race = 0;
          return;
        }
        burg.race = getRaceFromCultureId(burg.culture);
      });
    }

    if (packAny.religions) {
      packAny.religions.forEach((religion: any) => {
        if (!religion) return;
        if (!religion.i || religion.removed) {
          religion.race = 0;
          return;
        }
        religion.race = getRaceFromCultureId(religion.culture);
      });
    }
  }

  if (pack.cells && pack.cells.culture && pack.cells.i) {
    const cells = packAny.cells;
    const hasCellRaces = cells.race && cells.race.length === pack.cells.i.length;

    if (!hasCellRaces) {
      const raceArray = new Uint16Array(pack.cells.i.length);
      for (const i of pack.cells.i) {
        const cultureId = pack.cells.culture[i];
        const culture = pack.cultures && pack.cultures[cultureId];
        const raceId = culture && (culture as any).race ? (culture as any).race : 0;
        raceArray[i] = raceId;
      }
      cells.race = raceArray;
    }
  }

  try {
    syncCultureBasesToDominantRace();
  } catch (_e) {}
}

// Race-to-shield mapping for fantasy culture generation
const raceShields: Record<string, string> = {
  Elf: "gondor",
  "Dark Elf": "hessen",
  Dwarf: "erebor",
  Goblin: "moriaOrc",
  Orc: "urukHai",
  Giant: "pavise",
  Draconic: "fantasy2",
  Arachnid: "horsehead2",
  Serpent: "fantasy1",
  Human: "fantasy5",
  Halfling: "fantasy4",
  Gnome: "fantasy5",
  "Half-Elf": "gondor",
  "Half-Orc": "urukHai",
  Tiefling: "fantasy2",
  Aasimar: "fantasy5",
  Hobgoblin: "moriaOrc",
  Goliath: "pavise",
  Lizardfolk: "horsehead2",
  Gnoll: "moriaOrc",
  Bugbear: "urukHai",
  Tabaxi: "fantasy4",
  Kenku: "fantasy5",
  Aarakocra: "fantasy5",
  Dragonborn: "fantasy2",
  Triton: "fantasy1",
  "Yuan-ti": "fantasy1",
  Firbolg: "fantasy4",
  Gith: "fantasy2",
  Genasi: "fantasy2",
  Satyr: "fantasy4",
  Minotaur: "urukHai",
  Kobold: "moriaOrc",
  Duergar: "erebor",
  "Shadar-kai": "fantasy1",
  Centaur: "fantasy4",
  Leonin: "fantasy5",
  Loxodon: "pavise",
  Harengon: "fantasy4",
  Tortle: "fantasy4",
  Owlin: "fantasy5",
  Kitsune: "fantasy5",
  Deepkin: "fantasy1",
  Starspawn: "fantasy2",
  Scions: "fantasy5",
  Seafarer: "fantasy5"
};

const fallbackFantasyShields = ["fantasy1", "fantasy2", "fantasy4", "fantasy5", "gondor", "erebor", "pavise"];

function getRaceShield(raceName: string): string {
  if (raceShields[raceName]) return raceShields[raceName];
  let hash = 0;
  for (let i = 0; i < raceName.length; i++) {
    hash = (hash * 31 + raceName.charCodeAt(i)) >>> 0;
  }
  return fallbackFantasyShields[hash % fallbackFantasyShields.length];
}

interface RaceCultureProps {
  base: number;
  shield: string;
  odd: number;
}

function getRaceCultureProps(raceName: string): RaceCultureProps | null {
  const bases = fantasyRaceBases[raceName];
  if (!bases || !bases.length) return null;
  const base = bases[0];
  const shield = getRaceShield(raceName);
  const expansionism = defineRaceExpansionism(raceName);
  const odd = Math.max(0.3, Math.min(1, expansionism / 1.6));
  return { base, shield, odd };
}

// Expose the canonical race list for UI consumers (e.g. cultures editor dropdown)
window.fantasyRaceNames = Object.keys(fantasyRaceBases);

export {
  assignRaces,
  buildRaceMixerLanguageDisplayName,
  defineRaceExpansionism,
  ensureRaceMixerBaseIndex,
  fantasyRaceBases,
  findExistingRaceMixerBaseIndex,
  generateRaceLanguageNames,
  getFallbackRaceMixerIsoWeights,
  getRaceCultureProps,
  getRaceDefaultBaseIndex,
  getRaceLanguageIsoWeights,
  getRaceLanguageProfile,
  getRaceMixerBaseDisplayName,
  getRaceNameForCulture,
  getRacesSetFilter,
  hashStringToUint32,
  initializeRacesForExpansion,
  isBadRaceMixerDisplayName,
  loadLanguageMixerCatalogForRaces,
  raceLanguageProfiles,
  rerollRacesForCultures,
  shouldEnableRacesForCurrentWorld,
  syncCultureBasesToDominantRace
};

// Expose race functions to legacy JS (public/main.js, options.js)
window.initializeRacesForExpansion = initializeRacesForExpansion;
window.assignRaces = assignRaces;
window.rerollRacesForCultures = rerollRacesForCultures;
window.getRaceNameForCulture = getRaceNameForCulture;
window.getRacesSetFilter = getRacesSetFilter;
window.getRaceCultureProps = getRaceCultureProps;
