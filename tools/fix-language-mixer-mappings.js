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
  "karakalpak": 226,
  "khakas": 227,
  "balti": 47,
  "bodo": 63,
  "chin": 62,
  "hokchiu": 68,
  "chhattisgarhi": 183,
  "magahi": 183,
  "bikol": 193,
  "ibanag": 193,
  "ilocano": 193,
  "kapampangan": 193,
  "maguindanao": 193,
  "pangasinan": 193,
  "siri": 132,
  "awadhi": 183,
  "maithili": 183,
  "rajasthani": 183,
  "dogri": 183,
  "konkani": 253,
  "braj": 183,
  "bundeli": 183,
  "chittagonian": 201,

  "assamese": 257,
  "bengali": 201,
  "bhojpuri": 183,
  "gujarati": 204,
  "hin": 183,
  "kashmiri": 288,
  "marathi": 253,
  "odia": 256,
  "punjabi": 202,
  "romani": 270,
  "sindhi": 289,
  "sinhala": 205,
  "urdu": 203,

  bosnian: 5,
  croatian: 5,
  montenegrin: 5,
  "serbo-croatian": 5,
  kashubian: 5,
  pomeranian: 5,
  slovincian: 5,
  polabian: 5,
  rusyn: 5,
  podlachian: 5,
  "west-polesian": 5,
  "lower-sorbian": 5,
  "upper-sorbian": 5,
  "old-church-slavonic": 5,

  // Papuan macro families → approximate to dedicated Papuan base (315)
  "awin-pa": 315,
  binanderean: 315,
  bosavi: 315,
  "duna-pogaya": 315,
  "east-strickland": 315,
  "engan-languages": 315,
  "gogodala-suki": 315,
  goilalan: 315,
  kayagaric: 315,

  // Tai / Tai–Kadai leaf mappings (Thai / Lao / Zhuang clusters)
  "standard-zhuang": 314,
  bouyei: 314,
  "hezhang-buyi": 314,
  "yei-zhuang": 314,
  "longsang-zhuang": 314,
  "dai-zhuang": 314,
  "min-zhuang": 314,
  "yang-zhuang": 314,
  "pyang-zhuang": 314,
  "myang-zhuang": 314,
  "nong-zhuang": 314,
  kuan: 314,
  "cao-lan": 314,
  "kam-tai": 314,
  "northern-tai": 314,
  "nung-tai": 314,

  "thai-siamese": 251,
  "northern-thai": 251,
  "southern-thai": 251,
  "thai-song": 251,
  shan: 251,
  khamti: 251,
  "tai-laing": 251,
  phake: 251,
  aiton: 251,
  khamyang: 251,
  turung: 251,
  khun: 251,
  "tai-lue": 251,
  "tai-nuea": 251,
  "tai-long": 251,
  "tai-hongjin": 251,
  "tai-ya": 251,
  tai: 251,
  "southwestern-tai": 251,
  "northwestern-tai": 251,
  ahom: 251,
  "e-tai": 251,

  "lao-phutai": 252,
  isan: 252,
  "lao-nyo": 252,
  "phu-thai": 252,
  kaloeng: 252,
  "chiang-saen": 252,
  phuan: 252,
  "tay-tac": 252,
  "tsun-lao": 252,
  "tai-khang": 252,
  "tai-muong-vat": 252,
  "tai-thanh": 252,
  sapa: 252,
  "pa-di": 252,
  "southern-tai": 252,
  "central-tai": 252,
  "tai-daeng": 252,
  "tai-dam": 252,
  "tai-don": 252,
  "tai-meuay": 252,
  "tai-pao": 252,
  yong: 252,
  yoy: 252,

  "proto-tai": 251,
  "proto-kra-dai": 314,
  "proto-kra": 314,
  "proto-kam-sui": 314,
  "proto-hlai": 314,

  // Na-Dene macro family → reuse Navajo base
  "na-dene": 172,

// Dravidian – Telugu cluster (Central/South-Central Dravidian, AP/Telangana/Central India)
"gondi": 200,
"kui-dravidian": 200,
"koya": 200,
"madiya": 200,
"kuvi": 200,
"pengo": 200,
"pardhan": 200,
"chenchu": 200,
"konda-dravidian": 200,
"muria": 200,
"manda-dravidian": 200,
"pattapu": 200,
"yerukala": 200,
  "kuvi": 200,
  "pengo": 200,
  "pardhan": 200,
  "chenchu": 200,
  "konda-dravidian": 200,
  "muria": 200,
  "manda-dravidian": 200,
  "pattapu": 200,
  "yerukala": 200,

  // Dravidian – Kannada cluster (Karnataka-focused South Dravidian)
  "tulu": 254,
  "beary": 254,
  "kodava": 254,
  "betta-kurumba": 254,
  "ravula": 254,
  "koraga": 254,
  "kudiya-dravidian": 254,

  // Dravidian – Malayalam cluster (Kerala/Lakshadweep-focused South Dravidian)
  "jeseri": 255,
  "kurichiya": 255,
  "paniya": 255,
  "kanikkaran": 255,
  "malankuravan": 255,
  "muthuvan": 255,
  "kumbaran": 255,
  "paliyan": 255,
  "malasar": 255,
  "malapandaram": 255,
  "eravallan": 255,
  "wayanad-chetti": 255,
  "muduga": 255,
  "thachanadan": 255,
  "kadar-dravidian": 255,
  "attapady-kurumba": 255,
  "kunduvadi": 255,
  "mala-malasar": 255,
  "pathiya": 255,
  "kalanadi": 255,
  "allar": 255,
  "aranadan": 255,
  "vishavan": 255
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
  // Ethiopic / Amharic cluster → prefer Amharic base (133)
  ethiopic: 133,
  amharic: 133,
  // Harari / Argobba keywords → dedicated Harari-Argobba base (312)
  harari: 312,
  argobba: 312,
  // Gurage keywords → dedicated Gurage base (311)
  gurage: 311,

  // Uralic / Finnic / Sami buckets
  sami: 274,
  uralic: 9,
  finnic: 9,
  mari: 320,
  mordvin: 321,
  mordvinic: 321,
  komi: 283,
  permic: 283,
  ugric: 322,
  samoyedic: 323,
  hungarian: 15,
  hungary: 15,

  // Other families / regions with dedicated bases
  basque: 20,
  celtic: 22,
  nigerian: 21,

  // Andes / Amazonia / South & Central America
  quechua: 27,
  aymara: 175,
  kichwa: 176,
  guarani: 173,
  mapudungun: 178,
  tikuna: 189,

  // Mesoamerican (Mayan and neighbors)
  maya: 159,
  mayan: 159,
  qeqchi: 157,
  kekchi: 157,
  kiche: 158,
  yucatec: 159,
  mam: 160,
  tzeltal: 161,
  mixtec: 162,
  tzotzil: 163,
  zapotec: 164,
  kaqchikel: 165,
  otomi: 166,
  totonac: 167,
  chol: 168,
  mazatec: 169,
  qanjobal: 170,
  huastec: 171,
  nahuatl: 14,

  // North / Central America (Indigenous and contact)
  navajo: 172,
  miskito: 185,
  cree: 186,
  ojibwe: 187,
  garifuna: 188,
  huichol: 190,
  yaqui: 191,
  cherokee: 192,
  lakota: 216,
  dakota: 217,
  blackfoot: 218,
  mohawk: 219,
  tlingit: 220,
  haida: 221,
  salish: 222,

  // Arawakan macro-family (approximate via Garifuna base)
  arawak: 188,
  arawakan: 188,

  // Existing global clusters
  swahili: 28,
  mongolian: 31,
  mongolic: 31,
  chinese: 11,
  cantonese: 30,

  // Sino-Tibetan macros and dialect clusters
  sino: 11,
  sinitic: 11,
  "sino-tibetan": 11,

  // Branch-level Sino-Tibetan families with dedicated bases
  tibetan: 47,
  burmese: 48,
  newar: 49,
  meitei: 50,
  karenic: 51,
  bai: 52,
  tujia: 53,
  himalayish: 54,
  tamangic: 55,
  kiranti: 56,
  qiangic: 57,
  gyalrongic: 58,
  ersuic: 59,
  naic: 60,
  naga: 61,
  "kuki-chin": 62,
  "boro-garo": 63,
  jingpho: 64,
  luish: 64,
  arunachal: 65,

  // Chinese topolect clusters
  mandarin: 66,
  gan: 67,
  min: 68,
  wu: 69,
  xiang: 70,
  jin: 71,
  hui: 72,
  pinghua: 73,
  hakka: 74,

  // Additional Himalayan / Tibeto-Burman branches
  magar: 75,
  kham: 76,
  chepang: 77,
  bhujel: 78,
  lepcha: 79,
  dhimal: 80,
  toto: 81,
  hruso: 82,
  "miju-meyor": 83,
  koro: 84,
  "idu-taraon": 85,
  ao: 86,
  angami: 87,
  pochuri: 87,
  zeme: 88,
  konyak: 89,
  tangkhul: 90,
  mru: 91,
  karbi: 92,
  tshangla: 93,
  tani: 94,
  basum: 95,
  nam: 96,
  gongduk: 97,
  ole: 98,
  "kho-bwa": 99,
  songlin: 100,
  nungish: 101,
  gong: 102,
  kathu: 103,
  "cai-long": 104,
  burmish: 105,
  "lolo-burmese": 106,
  loloish: 107,
  mondzish: 108,

  japanese: 12,
  korean: 10,
  vietnamese: 29,
  turkish: 16,
  berber: 17,
  hawaiian: 25,
  turkic: 16,
  oghuz: 16,
  kipchak: 16,
  karluk: 16,
  oghur: 16,
  siberian: 16,
  iranian: 24,
  persian: 24,
  farsi: 24,
  kurdish: 24,
  kurd: 24,
  pashto: 24,
  balochi: 24,

  // Austronesian macros and regional branches
  austronesian: 195,
  philippine: 193,
  oceanic: 198,

  // West African / Niger-Congo clusters with dedicated bases
  bantu: 146,
  yoruba: 112,
  igbo: 113,
  fula: 114,
  fulani: 114,
  wolof: 115,
  akan: 116,
  bambara: 117,
  mandinka: 118,
  soninke: 119,
  ewe: 120,
  ga: 121,
  fon: 122,
  bete: 123,
  nyabwa: 124,
  dida: 125,
  mumuye: 126,
  moore: 127,
  limba: 128,
  gola: 129,

  // Horn of Africa / Cushitic / Ethio-Semitic clusters
  somali: 130,
  oromo: 131,
  hausa: 132,
  amharic: 133,
  tigrinya: 134,
  tigre: 135,
  mehri: 136,
  maltese: 137,
  geez: 138,
  beja: 139,
  afar: 140,
  hadiyya: 141,
  hadiya: 141,
  hadiyaa: 141,
  sidama: 142,
  wolaitta: 143,
  gamo: 144,
  gofa: 144,
  dawro: 144,
  ganza: 145,

  // Central / Southern Bantu clusters
  lingala: 146,
  kinyarwanda: 147,
  rwanda: 147,
  shona: 148,
  zulu: 149,
  xhosa: 150,
  sesotho: 151,
  tswana: 152,
  kongo: 153,
  luganda: 154,
  ganda: 154,
  chichewa: 155,
  chewa: 155,
  kikuyu: 156,
  gikuyu: 156,

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

  // Uralic Siberian cluster (branch-specific approximations)
  khanty: 322,
  mansi: 322,
  nenets: 323,
  selkup: 323,
  enets: 323,
  nganasan: 323,
  yukaghir: 19,

  // Inuit / Arctic cluster
  inuit: 19,
  inuktitut: 19,
  kalaallisut: 19,

  // Volga-Finnic / Permic / Mordvin cluster (branch-specific Uralic bases)
  komi: 283,
  udmurt: 283,
  mari: 320,
  mordvin: 321,
  erzya: 321,
  moksha: 321,

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
  pakanic: 29,
  dravidian: 199,
  chadic: 132,
  berber: 17,
  zenati: 17,
  zenaga: 17,
  tuareg: 17,
  tamazight: 17,
  amazigh: 17,
  papuan: 315
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
