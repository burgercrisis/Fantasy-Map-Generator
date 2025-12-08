"use strict";

// Helper script to automatically fix missing language->base mappings
// for the local Markov mixer (Names.getMixedByIso).
//
// It looks for catalog entries in config/language-mixes.json whose ISO
// codes are missing from config/language-mixer-map.json, and tries to
// infer a suitable base index from:
//   - the language's own ISO or name if it matches a namebase entry, or
//   - its lexifier or family, reusing the same base index as that
//     lexifier/family language where possible.
//
// The goal is to catch cases like Kituba (a Kongo-based creole) that
// should reuse the Kongo base, so the local mixer can generate names.
//
// Run from the project root:
//   node tools/fix-language-mixer-mappings.js
// Then regenerate the bundles:
//   node tools/generate-language-mixer.js
//
// The script is conservative:
//   - It only creates a mapping when it can find a single, unambiguous
//     base index to reuse.
//   - Otherwise it prints a report of unresolved ISOs so they can be
//     handled manually.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// Explicit overrides where we know exactly which base index to use.
// This is useful for creoles that clearly belong to a specific
// cluster but whose lexifier/family does not map cleanly to a single
// catalog entry.
//
// Keys are language ISOs from language-mixes.json; values are
// namebase indices from modules/namebases-fantasy.js.
const explicitIsoBaseMap = {
  // Pretoria Sotho is a Sotho-Tswana-based creole. Reuse the Tswana
  // base (index 152) so local mixing can work.
  "pretoria-sotho": 152,
  "ber-family": 17,
  "koreanic-family": 10,
  "sinitic": 11,
  "sino-tibetan-family": 11,
  "zho": 11,
  "abaza": 241,
  "bzyb": 241,
  "adyghe": 241,
  "kabardian": 241,
  "bats": 239,

  // Inuit / Greenlandic approx
  "kalaallisut": 19,
  "itelmen": 19,
  "southern-itelmen": 19,
  "western-itelmen": 19,
  "naukan": 19,
  "sirenik": 19,
  "yuit": 19,

  // Hmong-Mien / Yao languages
  "iu-mien": 11,
  "kim-mun": 11,
  "kiong-nai": 11,
  "pa-hng": 11,
  "pa-na": 11,
  "numao": 11,
  "raojia": 11,
  "sanqiao": 11,
  "xong": 11,
  "younuo": 11,
  "biao-min": 11,
  "dzao-min": 11,
  "hm-nai": 11,
  "nao-klao": 11,
  "bunu": 11,

  // Romance / dialect clusters with clear bases
  "italo-australian": 3,
  "italo-paulista": 3,
  "istriot": 3,
  "balearic": 4,
  "mallorcan": 4,
  "menorcan": 4,
  "moselle-romance": 2,
  "landese": 2,
  "languedocien": 232,
  "proven-al": 232,
  "poitevin-saintongeais": 2,
  "orl-anais": 2,
  "r-mois": 2,
  "sercquiais": 2,
  "j-rriais": 2,
  "joual": 2,
  "magoua": 2,
  "pisano-livornese": 3,
  "sardo-corsican": 233,

  // East / Ethio-Semitic and related dialects
  assyrian: 23,
  babylonian: 23,
  eblaite: 23,
  dilmunite: 23,
  chaha: 23,
  endegen: 23,
  ezha: 23,
  gafat: 23,
  gumer: 23,
  gura: 23,
  gyeto: 23,
  kishite: 23,
  "sebat-bet": 23,
  ulbare: 23,
  zway: 23,
  "zabidi-dialect": 18,

  // Remaining Romance dialect stragglers
  "aas-whistled": 232,
  "algherese": 4,
  "augeron": 2,
  "auregnais": 2,
  "b-arnese": 232,
  "basilicatine": 3,
  "florentine": 3,
  "ni-ard": 232,

  // Uralic / Finnic dialects and extinct branches
  "bjarmian-s-mi": 9,
  fingelska: 9,
  hollola: 9,
  iitti: 9,
  "j-llivaara": 9,
  kainuu: 9,
  kemi: 9,
  "kemij-rvi": 9,
  "keuruu-evij-rvi": 9,
  "lemi-region": 9,
  "me-nkieli": 9,
  "proper-southeastern": 9,
  kamas: 9,
  "kamassian-proper": 9,
  karagas: 9,
  koibal: 9,
  mator: 9,
  "mator-proper": 9,
  merya: 9,
  meshcherian: 9,
  muromian: 9,
  yurats: 9,
  "uralo-siberian": 9,

  // Tungusic / Jurchenic / Nanaic / Ewenic / Udegeic cluster (approximate to Mongolian base)
  alchuka: 31,
  bala: 31,
  even: 31,
  evenki: 31,
  jurchen: 31,
  kili: 31,
  manchu: 31,
  nanai: 31,
  negidal: 31,
  oroch: 31,
  oroqen: 31,
  udege: 31,
  uilta: 31,
  ulch: 31,
  xibe: 31,

  // Koreanic macro ISO
  kor: 10
};

// Fallback mapping from common language tokens to base indices. This
// helps auto-map dialects and regional varieties like "Bolivian Spanish"
// or "Chilean Arabic" even when their names do not directly match a
// namebase entry.
const tokenBaseIndexMap = {
  // Romance / Latin
  spanish: 4,
  castilian: 4,
  latin: 4,
  portuguese: 13,
  french: 2,
  italian: 3,
  catalan: 2,

  // Germanic
  german: 0,
  dutch: 0,
  english: 1,
  swedish: 6,
  norwegian: 6,
  danish: 6,
  finnish: 9,
  icelandic: 6,

  // Slavic / related
  russian: 5,
  ukrainian: 5,
  polish: 5,
  czech: 5,
  serbian: 5,
  bulgarian: 5,

  // Semitic
  arabic: 18,
  aramaic: 23,
  hebrew: 23,
  akkadian: 23,
  mesopotamian: 23,
  canaanite: 23,
  arabian: 18,
  maghrebi: 18,
  levantine: 18,
  ethiopic: 23,
  amharic: 23,
  gurage: 23,
  harari: 23,
  argobba: 23,

  // Uralic / Finnic / Sami buckets
  sami: 9,
  uralic: 9,
  finnic: 9,
  mari: 9,
  mordvin: 9,
  mordvinic: 9,
  komi: 9,
  permic: 9,
  ugric: 9,
  samoyedic: 9,

  // Other families / regions with dedicated bases
  basque: 20,
  celtic: 22,
  nigerian: 21,
  quechua: 27,
  nahuatl: 14,
  swahili: 28,
  mongolian: 31,
  mongolic: 31,
  chinese: 11,
  cantonese: 30,
  japanese: 12,
  korean: 10,
  vietnamese: 29,
  turkish: 16,
  berber: 17,
  hawaiian: 25,

  // Specific dialects / clusters
  abruzzese: 3,
  italian: 3,
  italic: 3,
  lombard: 3,
  ligurian: 3,
  emilian: 3,
  romagnol: 3,
  piedmontese: 3,
  arpitan: 2,
  franco: 2,
  gallo: 2,
  norman: 2,
  picard: 2,
  poitevin: 2,
  saintongeais: 2,
  lorrain: 2,
  limousin: 2,
  gaumais: 2,
  bourbonnais: 2,
  acadian: 2,
  angevin: 2,
  ardennais: 2,
  berrichon: 2,
  brayon: 2,
  burgundian: 2,
  cauchois: 2,
  champenois: 2,
  chiac: 2,
  cotentinais: 2,
  frainc: 2,
  comtou: 2,
  guern: 2,
  siais: 2,
  rriais: 2,
  landese: 2,
  magoua: 2,
  paydret: 2,
  joual: 2,

  // Occitan dialects / varieties
  aranese: 232,
  auvergnat: 232,
  gardiol: 232,
  gascon: 232,
  languedocien: 232,
  ribagor: 232,

  // Additional Italo-Romance and Sardo-Corsican
  aretino: 3,
  chianaiolo: 3,
  sardo: 233,
  corsican: 233,
  balearic: 2,
  mallorcan: 2,
  menorcan: 2,
  valencian: 2,
  calabro: 3,
  calabrian: 3,
  lucanian: 3,
  salentino: 3,
  pugliese: 3,
  manduriano: 3,
  lucchese: 3,
  grossetano: 3,
  pisano: 3,
  livornese: 3,
  pistoiese: 3,
  dalmatian: 3,
  istriot: 3,
  mozarabic: 4,

  // Hmong-Mien approximated via Chinese-style base
  hmong: 11,
  hmongic: 11,
  walloon: 302,
  friulian: 300,
  ladin: 301,
  occitan: 232,
  sardinian: 233,
  romansh: 234,
  frisian: 235,

  // Finnic / Estonian cluster
  estonian: 215,
  finnic: 9,
  karelian: 9,
  veps: 9,
  votic: 9,
  livonian: 9,
  savonian: 9,
  tavastian: 9,
  ingrian: 9,
  ludic: 9,
  livvi: 9,
  kven: 9,
  finland: 9,
  tavastia: 9,
  botnian: 9,
  satakunta: 9,

  // Uralic Siberian cluster (approximate to Finnic/Uralic bucket)
  khanty: 9,
  mansi: 9,
  nenets: 9,
  selkup: 9,
  enets: 9,
  nganasan: 9,
  yukaghir: 9,

  // Inuit / Arctic cluster
  inuit: 19,
  inuktitut: 19,
  kalaallisut: 19,

  // Volga-Finnic / Permic / Mordvin cluster (approximate to Uralic bucket)
  komi: 9,
  udmurt: 9,
  mari: 9,
  mordvin: 9,
  erzya: 9,
  moksha: 9,

  // Ancient North Arabian / Canaanite scripts
  safaitic: 23,
  taymanitic: 23,
  thamudic: 23,

  // Additional Italo-Romance dialect bucket
  tuscan: 3,
  venetian: 3,

  // Austroasiatic families / branches
  vietic: 29,
  khmer: 179,
  khmeric: 179,
  mon: 180,
  monic: 180,
  munda: 181,
  khasic: 182,
  aslian: 195,
  nicobarese: 195,
  bahnaric: 29,
  katuic: 29,
  khmuic: 29,
  pearic: 179,
  pakanic: 29
};

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function loadNamebases() {
  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js")
  ];

  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;
  const byName = new Map();
  const indices = new Set();

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch (e) {
      console.error("Failed to read namebases file", file, e.message || e);
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const name = m[1];
      const index = Number(m[2]);
      if (!Number.isNaN(index)) {
        const key = name.toLowerCase();
        if (!byName.has(key)) byName.set(key, index);
        indices.add(index);
      }
    }
  }

  return {byName, indices};
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  let map = readJson("config/language-mixer-map.json");

  const namebases = loadNamebases();

  function resolveBaseByNameLike(name) {
    if (!name) return null;
    const raw = String(name).trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const variants = [];
    if (lower) variants.push(lower);

    const stripped = lower.replace(/\s+(language|languages|creole|creoles|family|group|dialect|dialects)$/g, "").trim();
    if (stripped && stripped !== lower && !variants.includes(stripped)) variants.push(stripped);

    const dehyphen = lower.replace(/[-–]+/g, " ").trim();
    if (dehyphen && !variants.includes(dehyphen)) variants.push(dehyphen);

    const prefixStripped = lower
      .replace(/^(proto|old|middle|ancient)\s+/, "")
      .replace(/^(proto|old|middle|ancient)-/, "")
      .trim();
    if (prefixStripped && prefixStripped !== lower && !variants.includes(prefixStripped)) {
      variants.push(prefixStripped);
      const prefixDehyphen = prefixStripped.replace(/[-–]+/g, " ").trim();
      if (prefixDehyphen && prefixDehyphen !== prefixStripped && !variants.includes(prefixDehyphen)) {
        variants.push(prefixDehyphen);
      }
    }

    for (const key of variants) {
      const idx = namebases.byName.get(key);
      if (typeof idx === "number") return idx;
    }

    return null;
  }

  function resolveBaseByTokens(text) {
    if (!text) return null;
    const raw = String(text).toLowerCase();
    if (!raw) return null;
    const tokens = raw.split(/[^a-z]+/g).filter(Boolean);
    let resolved = null;
    for (const token of tokens) {
      const idx = tokenBaseIndexMap[token];
      if (typeof idx !== "number") continue;
      if (resolved == null) {
        resolved = idx;
      } else if (resolved !== idx) {
        return null;
      }
    }
    return resolved;
  }

  // First, normalize the existing map: drop any bases that do not
  // correspond to a real namebase index. If an entry ends up with no
  // valid bases, treat it as unmapped so we can try to infer a better
  // mapping (e.g. Alor Malay should reuse the Malay base instead of an
  // old, now-missing Malaccan base).
  const validBaseIndices = namebases.indices;
  const normalizedMap = [];
  const droppedIsos = [];

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const bases = Array.isArray(entry.bases) ? entry.bases.filter(b => validBaseIndices.has(b)) : [];
    if (!bases.length) {
      droppedIsos.push(entry.iso);
      continue;
    }
    normalizedMap.push({iso: entry.iso, bases});
  }

  if (droppedIsos.length) {
    console.log(
      "Dropped mappings with invalid base indices:",
      droppedIsos.length,
      "=>",
      droppedIsos.join(", ")
    );
  }

  map = normalizedMap;

  const mappedIsos = new Set(map.map(e => e.iso));
  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  const added = [];
  const unresolved = [];

  function findBaseIndexForLang(lang) {
    if (!lang) return null;

    if (lang.iso && Object.prototype.hasOwnProperty.call(explicitIsoBaseMap, lang.iso)) {
      return explicitIsoBaseMap[lang.iso];
    }

    if (lang.name) {
      const byName = namebases.byName.get(lang.name.toLowerCase());
      if (typeof byName === "number") return byName;
    }

    const lex = lang.lexifier || null;
    if (lex) {
      const lexMeta = mixes.find(m => m.name === lex || m.iso === (lex.iso || lex));
      if (lexMeta && lexMeta.iso) {
        const lexMap = mapByIso.get(lexMeta.iso);
        if (lexMap && Array.isArray(lexMap.bases) && lexMap.bases.length === 1) {
          return lexMap.bases[0];
        }
      }

      const lexIdx = resolveBaseByNameLike(lex);
      if (typeof lexIdx === "number") return lexIdx;
    }

    const family = lang.family || "";
    if (family) {
      const familyKey = family.replace(/-based$/i, "").trim();
      if (familyKey) {
        const famMeta = mixes.find(m => m.name === familyKey || m.iso === familyKey.toLowerCase());
        if (famMeta && famMeta.iso) {
          const famMap = mapByIso.get(famMeta.iso);
          if (famMap && Array.isArray(famMap.bases) && famMap.bases.length === 1) {
            return famMap.bases[0];
          }
        }

        const famIdx = resolveBaseByNameLike(familyKey);
        if (typeof famIdx === "number") return famIdx;
      }
    }

    const isoIdx = resolveBaseByNameLike(lang.iso || "");
    if (typeof isoIdx === "number") return isoIdx;

    const familyIdx = resolveBaseByNameLike(lang.family || "");
    if (typeof familyIdx === "number") return familyIdx;

    const categoryIdx = resolveBaseByNameLike(lang.category || "");
    if (typeof categoryIdx === "number") return categoryIdx;

    const nameTokenIdx = resolveBaseByTokens(lang.name || "");
    if (typeof nameTokenIdx === "number") return nameTokenIdx;

    const lexTokenIdx = resolveBaseByTokens(lang.lexifier || "");
    if (typeof lexTokenIdx === "number") return lexTokenIdx;

    const familyTokenIdx = resolveBaseByTokens(lang.family || "");
    if (typeof familyTokenIdx === "number") return familyTokenIdx;

    const isoTokenIdx = resolveBaseByTokens(lang.iso || "");
    if (typeof isoTokenIdx === "number") return isoTokenIdx;

    return null;
  }

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;
    if (mappedIsos.has(lang.iso)) continue; // already mapped

    const baseIndex = findBaseIndexForLang(lang);
    if (baseIndex == null) {
      unresolved.push(lang);
      continue;
    }

    map.push({iso: lang.iso, bases: [baseIndex]});
    mappedIsos.add(lang.iso);
    added.push({iso: lang.iso, base: baseIndex, name: lang.name || ""});
  }

  if (added.length) {
    // Keep original order + new entries sorted by iso for stability.
    const staticEntries = map.filter(e => !added.some(a => a.iso === e.iso));
    const newEntries = map.filter(e => added.some(a => a.iso === e.iso));

    newEntries.sort((a, b) => String(a.iso).localeCompare(String(b.iso)));

    const combined = staticEntries.concat(newEntries);
    writeJson("config/language-mixer-map.json", combined);
  } else {
    console.log("No new mappings added.");
  }

  console.log("Automatically added mappings:", added.length);
  if (added.length) {
    for (const a of added) {
      console.log(` - ${a.iso} (${a.name}) -> base index ${a.base}`);
    }
  }

  console.log("Unresolved languages with no mapping:", unresolved.length);
  if (unresolved.length) {
    for (const lang of unresolved) {
      console.log(
        ` - ${lang.iso || "(no iso)"} (${lang.name || "(no name)"}), family=${lang.family || ""}, lexifier=${
          lang.lexifier || ""
        }`
      );
    }
  }
}

if (require.main === module) main();
