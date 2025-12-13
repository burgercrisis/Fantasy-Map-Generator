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

const root = path.resolve(__dirname, "..", "..");

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
  "maghrebi-arabic": 349,
  "egyptian-arabic": 350,
  "levantine-arabic": 351,
  "gulf-arabic": 352,
  "najdi-arabic": 352,
  "sudanese-arabic": 350,
  "koreanic-family": 10,
  "sinitic": 11,
  "sino-tibetan-family": 11,
  "zho": 11,
  mbq: 367,
  "abaza": 241,
  "bzyb": 241,
  "adyghe": 241,
  "kabardian": 241,
  "bats": 239,

  // Major global creoles with dedicated bases
  "haitian-creole": 258,
  "jamaican-creole": 259,
  "cape-verdean-creole": 260,
  "mauritian-creole": 261,
  "seychellois-creole": 262,
  "tok-pisin": 263,
  "papiamento": 264,
  "sango": 297,

  // West African English-based creoles → West African English Creole base (307)
  "aku": 307,
  "cameroonian-pidgin": 307,
  "ghanaian-pidgin-english": 307,
  "krio": 307,
  "liberian-kreyol": 307,
  "merico": 307,
  "nigerian-pidgin": 307,
  "pichinglis": 307,
  "west-african-pidgin-english": 307,

  // Malay-based trade creoles → Malay-based Creole base (310)
  "alor-malay": 310,
  "ambonese-malay": 310,
  "baba-malay": 310,
  "balinese-malay": 310,
  "banda-malay": 310,
  "dili-malay": 310,
  "eastern-indonesian-malay": 310,
  "gorap": 310,
  "betawi": 310,

  // Upper Guinea Portuguese-based creoles approximated via Cape Verdean Creole base (260)
  "guinea-bissau-creole": 260,

  // Iranian / Indo-Iranian lects with dedicated bases
  "balochi": 290,
  "tajik": 229,
  "pashto": 24,

  moc: 422,
  myu: 173,
  cag: 422,
  tus: 219,
  noa: 422,
  xav: 292,
  xer: 292,
  yag: 178,

  // Inuit / Arctic / Siberian macro (shared Arctic toponym base)
  "kalaallisut": 19,
  "itelmen": 19,
  "southern-itelmen": 19,
  "western-itelmen": 19,
  "naukan": 19,
  "sirenik": 19,
  "yuit": 19,
  "almosan": 19,
  "chukotko-kamchatkan-amuric": 19,
  "chukotko-kamchatkan": 19,
  "chukotkan": 19,
  "kamchatkan": 19,
  "den-yeniseian": 19,
  "yeniseian": 19,
  "karasuk": 19,
  "athabaskan": 19,
  "eyak": 19,
  "alyutor": 19,
  "arin": 19,
  "assan": 19,
  "chukchi": 19,
  "chuvan": 19,
  "jie": 19,
  "kerek": 19,
  "ket": 19,
  "koryak": 19,
  "kott": 19,
  "nivkh": 19,
  "omok": 19,
  "pumpokol": 19,
  "yugh": 19,

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

  // Austroasiatic: Palaungic (China list)
  rbb: 29,

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
  // North Ethiopic / Geʽez and closely related lects
  "ge-ez": 138,
  "abba-gorgoryos": 138,
  dahalik: 134,
  // Gurage / Outer Ethio-Semitic lects → use dedicated Gurage base (311)
  chaha: 311,
  endegen: 311,
  ezha: 311,
  gafat: 311,
  gumer: 311,
  gura: 311,
  gyeto: 311,
  inor: 311,
  "inneqor": 311,
  "sebat-bet": 311,
  ulbare: 311,
  zway: 311,
  zay: 311,
  // Harari / Argobba lects → dedicated Harari-Argobba base (312)
  harari: 312,
  "harari-east-gurage": 312,
  argobba: 312,
  "amharic-argobba": 312,
  // Other East Semitic entries keep the general Semitic base
  kishite: 23,
  bathari: 136,
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
  "laiuse-romani": 270,
  bangime: 21,
  bayot: 21,
  jalaa: 21,
  laal: 21,
  mpre: 21,
  omaio: 28,
  ongota: 28,
  shabo: 28,
  she: 11,
  kenaboi: 195,
  kwaza: 173,
  "xoc-": 173,

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
  kor: 10,

  "cauque-mayan-language": 170,
  "l-ngua-geral-amaz-nica": 173,
  "l-ngua-geral-paulista": 173,
  "media-lengua": 27,
  "maritime-polynesian-pidgin": 25,
  "mbugu": 28,

  "bolze": 2,
  "petuh": 2,
  "cocoliche": 4,
  "mediterranean-lingua-franca": 4,

  "broken-slavey": 19,
  "loucheux-jargon": 19,
  "nootka-jargon": 19,
  "pidgin-delaware": 172,
  "mobilian-jargon": 172,
  "russenorsk": 6,

  "arafundi-enga-pidgin": 25,
  "duvle-wano-pidgin": 25,
  "kwoma-manambu-pidgin": 25,
  "mekeo-pidgins": 25,
  "pidgin-iha": 25,
  "pidgin-ngarluma": 25,
  "pidgin-onin": 25,

  "dao": 29,
  "camtho": 28,
  "ewondo-populaire": 28,
  "international-sign": 1,
  "kyowa-go": 11,
  "ndyuka-tiriy-pidgin": 173,

  // Leaf-level mappings for additional catalog languages
  "altai": 225,
  // Karakalpak is a Kipchak–Nogai lect; approximate via dedicated Nogai base
  "karakalpak": 295,
  // Khakas is Siberian Turkic; approximate via Kyrgyz-style steppe base
  "khakas": 227,
  // Major modern Turkic languages → dedicated regional bases
  "tur": 16,
  "azerbaijani": 265,
  "kazakh": 225,
  "kyrgyz": 227,
  "turkmen": 242,
  "uyghur": 228,
  "uzbek": 226,
  "tatar": 243,
  "bashkir": 281,
  "chuvash": 282,
  "nogai": 295,
  "kalmyk": 296,
  // Caucasian lects → dedicated Caucasus bases
  "georgian": 223,
  "georgian-dialects": 223,
  "karto-zan": 223,
  "zan": 223,
  "proto-georgian-zan": 223,
  "proto-kartvelian": 223,
  "laz": 223,
  "mingrelian": 223,
  "svan": 223,
  "abaza": 237,
  "abkhaz": 237,
  "bzyb": 237,
  "circassian": 241,
  "adyghe": 241,
  "kabardian": 241,
  "chechen": 238,
  "bats": 238,
  "ingush": 239,
  // English-based West African / Atlantic creoles → West African English Creole base (307)
  "aku": 307,
  "cameroonian-pidgin": 307,
  "ghanaian-pidgin-english": 307,
  "krio": 307,
  "liberian-kreyol": 307,
  "merico": 307,
  "nigerian-pidgin": 307,
  "pichinglis": 307,
  "west-african-pidgin-english": 307,
  // English-based Caribbean creoles → Caribbean English Creole base (308)
  "anguillian-creole": 308,
  "bahamian-creole": 308,
  "bajan-creole": 308,
  "belizean-creole": 308,
  "bocas-del-toro-creole": 308,
  "english-based-caribbean-creoles-family": 308,
  "grenadian-creole-english": 308,
  "jamaican-maroon-creole": 308,
  "jamaican-patois": 308,
  "leeward-caribbean-creole-english": 308,
  "limonese-creole": 308,
  "miskito-coast-creole": 308,
  "montserrat-creole": 308,
  "rama-cay-creole": 308,
  "saint-kitts-creole": 308,
  "san-andres-providencia-creole": 308,
  "tobagonian-creole": 308,
  "trinidadian-creole": 308,
  "turks-and-caicos-creole": 308,
  "vincentian-creole": 308,
  "virgin-islands-creole": 308,
  // English-based Pacific / Asian pidgins and creoles → Pacific English Creole base (309)
  "manglish": 309,
  "aboriginal-pidgin-english": 309,
  "american-indian-pidgin-english": 309,
  "chinese-pidgin-english": 309,
  "hawaiian-pidgin-english": 309,
  "japanese-bamboo-english": 309,
  "japanese-pidgin-english": 309,
  "korean-bamboo-english": 309,

  // Australian Aboriginal languages → dedicated Australian Aboriginal base (313)
  "adnyamathanha": 313,
  "anindilyakwa": 313,
  "bardi": 313,
  "bundjalung": 313,
  "burarra": 313,
  "dhuwal": 313,
  "djaru": 313,
  "djinang": 313,
  "gamilaraay": 313,
  "githabul": 313,
  "gooniyandi": 313,
  "gurindji": 313,
  "guugu-yimidhirr": 313,
  "iwaidja": 313,
  "kaytetye": 313,
  "kija": 313,
  "kukatja": 313,
  "kuku-yalanji": 313,
  "kunwinjku": 313,
  "kuuk-thaayore": 313,
  "luritja": 313,
  "manytjilyitjarra": 313,
  "martu-wangka": 313,
  "maung": 313,
  "miriwoong": 313,
  "murrinh-patha": 313,
  "ngaanyatjarra": 313,
  "ngarrindjeri": 313,
  "noongar": 313,
  "nunggubuyu": 313,
  "nyangumarta": 313,
  "palawa-kani": 313,
};

const explicitIsoBasesMap = {
  "international-sign": [1, 198],
  "haklau-min": [68, 29, 70],
  "macro-bai": [52, 68],
  bola: [105, 64, 108],
  nung: [64, 81, 105],
  mxj: [64, 96, 105],
  numao: [11, 67, 69, 70],
  tangwang: [11, 47, 29, 70],
  "tai-meuay": [252, 318, 530, 317],
  kharia: [29, 193, 251, 252],
  ahr: [183, 202, 253],
  spv: [183, 256],
  nph: [86, 87, 89],
  bfy: [183, 201, 203, 204],
  bgc: [183, 201, 204],
  hlb: [183, 201, 205],
  lmn: [183, 201, 256],
  mup: [183, 201, 288],
  sgj: [183, 201, 289],
  sjp: [183, 201, 203, 204, 257],
  nepali: [183, 201, 204, 257],
  awadhi: [183, 201, 202, 204],
  dhd: [183, 201, 202, 253],
  hoj: [183, 201, 202, 256],
  khortha: [183, 201, 202, 288],
  mtr: [183, 201, 202, 289],
  wbr: [183, 201, 202, 205, 288],
  wry: [183, 201, 202, 205, 289],
  bgq: [183, 202, 288],
  rajasthani: [183, 202, 289],
  bodo: [61, 63],
  dis: [63, 64],
  rah: [63, 65]
};

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw);
}

const tokenBaseIndexMap = {
  // Creole family tokens used for fallbacks
  "english-based": 307,
  "malay-based": 310,
  "french-based": 262,
  // Family-level buckets used elsewhere in the script
  cushitic: 140,
  omotic: 144,
  egyptian: 23,
  chadic: 132,
  berber: 331,
  papuan: 315,
  vietic: 29,
  khmer: 179,
  khmeric: 179,
  mon: 180,
  monic: 180,
  munda: 181,
  khasic: 182,
  aslian: 195,
  nicobarese: 195,
  bahnaric: 179,
  katuic: 179,
  khmuic: 179,
  pearic: 179,
  pakanic: 179,
  dravidian: 199,
  balochi: 290,
  tajik: 229,
  pashto: 24,
  georgian: 223,
  armenian: 224,
  abkhaz: 237,
  chechen: 238,
  ingush: 239,
  ossetian: 240,
  circassian: 241,
  kartvelian: 223,
  nakh: 238,
  daghestanian: 238,
  dagestanian: 238,
  caucasian: 223,
  "australian-aboriginal": 313
};

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

  const originalIsos = new Set(
    Array.isArray(map)
      ? map.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

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
  let didMutateMap = false;

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const bases = Array.isArray(entry.bases) ? entry.bases.filter(b => validBaseIndices.has(b)) : [];
    if (!bases.length) {
      droppedIsos.push(entry.iso);
      normalizedMap.push({iso: entry.iso, bases: []});
      continue;
    }
    normalizedMap.push({iso: entry.iso, bases});
  }

  if (droppedIsos.length) {
    didMutateMap = true;
    console.log(
      "Cleared invalid base indices for mappings (now unresolved):",
      droppedIsos.length,
      "=>",
      droppedIsos.join(", ")
    );
  }

  map = normalizedMap;

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  for (const [iso, rawBases] of Object.entries(explicitIsoBasesMap)) {
    const bases = Array.isArray(rawBases) ? rawBases.filter(b => validBaseIndices.has(b)) : [];
    if (!bases.length) continue;

    const existing = mapByIso.get(iso);
    if (existing) {
      const before = JSON.stringify(existing.bases || []);
      const after = JSON.stringify(bases);
      if (before !== after) {
        existing.bases = bases;
        didMutateMap = true;
      }
    } else {
      const entry = {iso, bases};
      map.push(entry);
      mapByIso.set(iso, entry);
      didMutateMap = true;
    }
  }
  const mappedIsos = new Set(
    map
      .filter(e => Array.isArray(e.bases) && e.bases.length)
      .map(e => e.iso)
  );

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

    const existing = mapByIso.get(lang.iso) || null;
    const hasBases = existing && Array.isArray(existing.bases) && existing.bases.length;
    if (hasBases) continue; // already mapped

    const baseIndex = findBaseIndexForLang(lang);
    if (baseIndex == null) {
      unresolved.push(lang);
      continue;
    }

    if (existing) {
      existing.bases = [baseIndex];
    } else {
      const entry = {iso: lang.iso, bases: [baseIndex]};
      map.push(entry);
      mapByIso.set(lang.iso, entry);
    }

    mappedIsos.add(lang.iso);
    added.push({iso: lang.iso, base: baseIndex, name: lang.name || ""});
  }

  const shouldWrite = added.length || didMutateMap;
  if (shouldWrite) {
    // Keep original order + new entries sorted by iso for stability.
    const staticEntries = added.length ? map.filter(e => !added.some(a => a.iso === e.iso)) : map;
    const newEntries = added.length ? map.filter(e => added.some(a => a.iso === e.iso)) : [];

    if (added.length) {
      newEntries.sort((a, b) => String(a.iso).localeCompare(String(b.iso)));
    }

    const combined = added.length ? staticEntries.concat(newEntries) : staticEntries;

    const combinedIsos = new Set(
      combined.filter(e => e && e.iso).map(e => String(e.iso))
    );
    for (const iso of originalIsos) {
      if (!combinedIsos.has(iso)) {
        console.error(
          "fix-language-mixer-mappings: refusing to write config/language-mixer-map.json; would drop ISO",
          iso
        );
        return;
      }
    }

    writeJson("config/language-mixer-map.json", combined);
  } else {
    console.log("No changes to language-mixer-map.json");
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
