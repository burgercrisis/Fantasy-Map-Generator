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
  // The exact ISO set this race draws from, when it has been solved.
  //
  // categories/families are a union over the whole catalog, so they can only
  // ever approximate a race's languages: naming "Romance" admits every Romance
  // language in the catalog, and races that name the same family end up with
  // near-identical sets. isos is the solved set and is what
  // getRaceLanguageIsoWeights actually uses; categories/families are kept for
  // the editors and the softmod profiles that read them.
  isos?: string[];
}

// Markov chain type for name generation
type MarkovChain = Record<string, string[]>;

// Race data: maps race name to array of namebase indices.
//
// The nine classic seed lists live at 1000xx in public/modules/namebases-fantasy.js.
// They used to be addressed as the built-in defaults 32-41, but those indices
// sit inside the range the real-language data files claim, so the gap-fill in
// name-bases.ts silently loses to them: index 35 serves Czech to the Dwarves and
// 39 serves Sekele to the Draconics. 1000xx is disjoint from every real
// language, so a race base can no longer resolve to one by accident.
//
// Only bases[0] feeds the fallback, so 32 is kept as a secondary for Human
// alone: cultures-generator still hardcodes base 32, and names-generator uses
// this list to decide which bases must not get an ethnic suffix in getState().
//
// The 43-86 and 274-276 indices below are not fantasy lists: the real-language
// data files claim that whole range, so those entries resolve to whatever
// language the aggregator put there (Kenku -> Bulgarian, Yuan-ti ->
// Koya-Konda-Manda-Pengo). That is deliberate. Those indices are the *fallback*
// path, used only when the language mixer is unavailable, and every one of
// these races generates its real language from its raceLanguageProfiles entry
// via getRaceLanguageIsoWeights -> getMixedByIso. Pointing the fallback at a
// populated real language is strictly better than an empty list, which makes
// the race produce nothing at all when the mixer is down.
//
// Do not empty these arrays to make a test about the fallback pass; fix the
// fallback path or test the primary path instead.
const fantasyRaceBases: Record<string, number[]> = {
  Human: [100000, 32],
  Elf: [100001],
  "Dark Elf": [100002],
  Dwarf: [100003],
  Goblin: [100004],
  Orc: [100005],
  Giant: [100006],
  Draconic: [100007],
  Arachnid: [100008],
  Serpent: [100009],
  Halfling: [43],
  Gnome: [44],
  "Half-Elf": [100001],
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
  Harengon: [100001],
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
    // the ONE Celtic voice in the set now; high-vowel Finnish/Karelian keeps the elvish shimmer
    categories: ["Indo-European", "Uralic"],
    families: ["Celtic", "Finnish", "Karelian Proper", "Kven", "Livvi", "Mator", "Meänkieli"],
    isos: [
      "american-finnish",
      "bre",
      "bre2",
      "bre3",
      "breton",
      "colloquial-finnish",
      "cor",
      "cor2",
      "cor3",
      "cornish",
      "cym",
      "cym2",
      "cym3",
      "fin",
      "fingelska",
      "gaulish",
      "gla",
      "gla2",
      "gle",
      "glv",
      "glv2",
      "karagas",
      "karelian",
      "karelian-proper",
      "kven",
      "livvi",
      "manx",
      "mator",
      "mator-proper",
      "me-nkieli",
      "northern-karelian",
      "siberian-finnish",
      "southern-karelian",
      "standard-finnish",
      "taygi",
      "torne-valley",
      "welsh"
    ]
  },
  "Dark Elf": {
    // cold cruel duchy: pure Slavic - no Germanic, no Baltic - so it cannot meet Dwarf
    categories: ["Slavic"],
    families: ["Czech-Slovak", "East Slavic", "Eastern South Slavic", "Lechitic", "Sorbian", "Western South Slavic"],
    isos: [
      "belarusian",
      "bosnian",
      "bul",
      "ces",
      "croatian",
      "kashubian",
      "lower-sorbian",
      "macedonian",
      "montenegrin",
      "old-church-slavonic",
      "podlachian",
      "pol",
      "polabian",
      "pomeranian",
      "rus",
      "rusyn",
      "serbo-croatian",
      "silesian",
      "slovak",
      "slovene",
      "slovincian",
      "srp",
      "ukr",
      "upper-sorbian",
      "west-polesian"
    ]
  },
  Dwarf: {
    // stony Norse-Baltic; the only race on the broad Germanic family, so nothing else can collide with it
    categories: ["Germanic", "Indo-European"],
    families: ["Baltic", "Germanic", "North Germanic", "West Germanic"],
    isos: [
      "afrikaans",
      "ang",
      "bangladeshi-english",
      "bavarian",
      "cim",
      "dan",
      "danish",
      "deu",
      "eng",
      "enm",
      "fao",
      "faroese",
      "frisian",
      "gsw",
      "indian-english",
      "isl",
      "latvian",
      "lav",
      "limburgish",
      "lit",
      "lithuanian",
      "low-german",
      "luxembourgish",
      "mainfraenkisch",
      "nepalese-english",
      "nld",
      "nor",
      "norwegian",
      "old-prussian",
      "ovd",
      "pakistani-english",
      "palatinate-german",
      "ripuarian-platt",
      "sco",
      "silesian-german",
      "sri-lankan-english",
      "swabian-german",
      "swe",
      "swedish-native-speakers",
      "sxu",
      "walser-german",
      "wym",
      "yec",
      "yid",
      "yiddish",
      "zea"
    ]
  },
  Halfling: {
    // the cozy one: the Romance core proper plus the French creoles - the warmest, most familiar sound
    categories: ["Creole", "Indo-European", "Romance"],
    families: ["Canadian", "French-based", "Latin", "Romance", "US"],
    isos: [
      "acadian",
      "agalega-creole",
      "antillean-creole",
      "bourbonnais-creole",
      "brayon",
      "canadian-french",
      "cat2",
      "chagossian-creole",
      "chiac",
      "cos",
      "dlm",
      "dominican-creole-french",
      "egl",
      "franco-ontarian",
      "french-guianese-creole",
      "frenchville-french",
      "grenadian-creole-french",
      "haitian-creole",
      "joual",
      "karip-na-french-creole",
      "lat",
      "lij",
      "lld",
      "lmo",
      "louisiana-creole",
      "louisiana-french",
      "m-tis-french",
      "magoua",
      "mauritian-creole",
      "missouri-french",
      "muskrat-french",
      "nap",
      "new-england-french",
      "newfoundland-french",
      "oci",
      "oci2",
      "pms",
      "proto-romance",
      "quebec-french",
      "r-union-creole",
      "rodriguan-creole",
      "roh",
      "saint-lucian-creole",
      "scn",
      "seychellois-creole",
      "srd",
      "tayo-creole",
      "vec"
    ]
  },
  Gnome: {
    // tinkering Volga folk: Mordvin + Mari + Mansi, a liquid rolling Volga-Finnic sound
    categories: ["Uralic"],
    families: [
      "Core Mansi",
      "Eastern Mansi",
      "Eastern Mari",
      "Erzya",
      "Finno-Ugric",
      "Hill Mari",
      "Komi-Permyak",
      "Komi-Yodzyak",
      "Meadow Mari",
      "Moksha",
      "Northern Mansi",
      "Northwestern Mari",
      "Southern Mansi",
      "Udmurt",
      "Western Mansi"
    ],
    isos: [
      "besermyan",
      "central-erzya",
      "central-mansi",
      "central-moksha",
      "chusovaya",
      "core-mansi",
      "eastern-mansi",
      "eastern-mari",
      "erzya",
      "est",
      "hill-mari",
      "jukonda",
      "kiknur",
      "kochevo",
      "kom",
      "komi-permyak",
      "komi-yodzyak",
      "kosa-kama",
      "kozymodemyan",
      "kudymkar-inva",
      "lipsha",
      "lower-inva",
      "lower-konda",
      "lower-lozva",
      "mdf",
      "meadow-mari",
      "meadow-mari-proper",
      "mhr",
      "middle-konda",
      "middle-lozva",
      "moksha",
      "mysy",
      "nerdva",
      "north-vagilsk",
      "northern-erzya",
      "northern-mansi",
      "northern-udmurt",
      "northwestern-mari",
      "ob-mansi",
      "on",
      "pelym",
      "sanchursk",
      "sernur-morkin",
      "sharanga",
      "shoksha",
      "sma",
      "sme",
      "sme2",
      "sosva",
      "south-vagilsk",
      "southeastern-erzya",
      "southeastern-moksha",
      "southern-mansi",
      "southern-udmurt",
      "sygva",
      "tagil",
      "tavda",
      "tonshaevo",
      "tura",
      "tuzha",
      "udm",
      "udmurt",
      "upper-konda",
      "upper-lozva",
      "upper-lupya",
      "vishera",
      "volga",
      "western-erzya",
      "western-mansi",
      "western-moksha",
      "yaran",
      "yaransk",
      "yazva",
      "yoshkar-olin",
      "zyuzdino"
    ]
  },
  "Half-Elf": {
    // the wanderer between worlds: diaspora Indo-Aryan plus the small American families, a deliberately mixed register
    categories: [
      "Barbacoan",
      "Chimilan",
      "Chocoan",
      "Chonan",
      "Indo-Aryan",
      "Isolate",
      "Keresan",
      "Language isolate",
      "Misumalpan",
      "Nadahup",
      "Paezan",
      "Quechuan",
      "Saliban",
      "Salishan",
      "Tsimshianic",
      "Zamucoan"
    ],
    families: [
      "Aymaran",
      "Barbacoan",
      "Bhil",
      "Chimilan",
      "Chocoan",
      "Chonan",
      "Keresan",
      "Marathi–Konkani",
      "Misumalpan",
      "Nadahup",
      "Paezan",
      "Quechuan",
      "Saliban",
      "Salishan",
      "Tsimshianic",
      "Unclassified Indo-Aryan",
      "Warao",
      "Yahgan",
      "Yuracaré",
      "Zamucoan"
    ],
    isos: [
      "aym",
      "aymara",
      "ayo",
      "bhb",
      "bmj",
      "cbg",
      "cbv",
      "dry",
      "dwz",
      "gum",
      "jup",
      "kichwa",
      "kjq",
      "konkani",
      "kwi",
      "marathi",
      "miskito",
      "noa",
      "ona",
      "pbb",
      "piaroa",
      "que",
      "salish",
      "southern-quechua",
      "tsi",
      "warao",
      "yag",
      "yuz"
    ]
  },
  "Half-Orc": {
    // born between two worlds: creoles and pidgins, deliberately unlike Orcs Turkic steppe
    categories: [
      "Afroasiatic",
      "Algic",
      "Austronesian",
      "Creole",
      "Eskimo-Aleut",
      "Germanic",
      "Hmong-Mien",
      "Indo-European",
      "Mayan",
      "Mixed",
      "Mixed language",
      "Niger-Congo",
      "Pidgin",
      "Romance",
      "Sino-Tibetan",
      "Songhay",
      "Tai-Kadai",
      "Tupian"
    ],
    families: [
      "Afrikaans-based",
      "Aleut",
      "Algonquian",
      "Arabic-based",
      "Bantu",
      "Bolze",
      "Chinese-based",
      "Dutch-based",
      "English Creole",
      "English-based",
      "Gallo-Italic",
      "German-based",
      "Gurindji Kriol",
      "Hellenic",
      "Hindi-based",
      "Hmongic",
      "Kongo-based",
      "Levantine",
      "Malay-based",
      "Malayo-Polynesian",
      "Mandarin",
      "Mayan",
      "Min",
      "Mixed",
      "Ngbandi-based",
      "Northern Songhay",
      "Other Arabic",
      "Petuh",
      "Pidgin",
      "Portuguese Creole",
      "Portuguese-based",
      "Qoqmoncaq",
      "Sinhala-based",
      "Sinitic",
      "Sotho-Tswana-based",
      "Spanish-Quechua",
      "Tai",
      "Tswana-based",
      "Tupi-Guarani",
      "Warlpiri-Kriol",
      "West Germanic"
    ],
    isos: [
      "aboriginal-pidgin-english",
      "afro-seminole-creole",
      "aku",
      "algonquian-basque-pidgin",
      "alor-malay",
      "aluku",
      "ambonese-malay",
      "american-indian-pidgin-english",
      "andaman-creole-hindi",
      "angolar-creole",
      "anguillian-creole",
      "annobonese-creole",
      "arabic-javanese-of-klego",
      "arafundi-enga-pidgin",
      "australian-kriol",
      "baba-malay",
      "bahamian-creole",
      "bajan-creole",
      "balinese-malay",
      "bamboo-english",
      "banda-malay",
      "barikanchi-pidgin",
      "basque-icelandic-pidgin",
      "belizean-creole",
      "bengali-portuguese-creole",
      "berbice",
      "betawi",
      "bidau-creole-portuguese",
      "bimbashi-arabic",
      "bislama",
      "bocas-del-toro-creole",
      "bolze",
      "bongor-arabic",
      "bonin-english",
      "borgarm-let",
      "broken-oghibbeway",
      "broken-slavey",
      "broome-pearling-lugger-pidgin",
      "butler-english",
      "cameroonian-pidgin",
      "cameroonian-pidgin-english",
      "camtho",
      "cannanore-portuguese-creole",
      "cape-verdean-creole",
      "cappadocian-greek",
      "cauque-mayan",
      "chinese-pidgin-english",
      "chinook-jargon",
      "cochin-portuguese-creole",
      "cocoliche",
      "cocos-malay",
      "cook-islands-maori-pidgin",
      "cypriot-maronite-arabic",
      "daman",
      "daman-and-diu-portuguese-creole",
      "dao",
      "dili-malay",
      "diu",
      "duvle-wano-pidgin",
      "e",
      "eastern-indonesian-malay",
      "eskimo-trade-jargon",
      "ewondo-populaire",
      "fanagalo",
      "fogo-creole",
      "forro-creole",
      "fran-ais-tirailleur",
      "franco-italian",
      "franglish",
      "gadal",
      "ghanaian-pidgin-english",
      "gorap",
      "grenadian-creole-english",
      "guinea-bissau-creole",
      "gullah",
      "gurindji-kriol",
      "guyanese-creole",
      "haflong-hindi",
      "hawaiian-pidgin",
      "hawaiian-pidgin-english",
      "hezhou",
      "hinglish",
      "indo-portuguese",
      "indo-portuguese-creole-of-bombay",
      "international-sign",
      "inuktitut-english-pidgin",
      "italian-eritrean",
      "italo-paulista",
      "jamaican-maroon-creole",
      "japanese-bamboo-english",
      "japanese-pidgin-english",
      "javindo",
      "jersey-dutch",
      "juba-arabic",
      "kea",
      "kiautschou-pidgin-german",
      "kikar",
      "kituba",
      "korean-bamboo-english",
      "korlai-portuguese-creole",
      "kri2",
      "krio",
      "kristang",
      "kru-pidgin-english",
      "kupang-malay",
      "kwinti",
      "kwoma-manambu-pidgin",
      "kyakhta-russian-chinese-pidgin",
      "kyowa-go",
      "l-ngua-geral-amaz-nica",
      "l-ngua-geral-paulista",
      "labrador-inuit-pidgin-french",
      "larantuka-malay",
      "leeward-caribbean-creole-english",
      "liberian-interior-pidgin-english",
      "liberian-kreyol",
      "light-warlpiri",
      "limonese-creole",
      "lingling",
      "loucheux-jargon",
      "macanese-patois",
      "madras-bashai",
      "makassar-malay",
      "malaccan-creole-malay",
      "manado-malay",
      "manglish",
      "mardijker-creole",
      "maridi-arabic",
      "maritime-polynesian-pidgin",
      "matawai",
      "maumere-malay",
      "mbugu",
      "media-lengua",
      "mediterranean-lingua-franca",
      "mednyj-aleut",
      "melanesian-pidgin",
      "merico",
      "michif",
      "micronesian-pidgin-english",
      "miskito-coast-creole",
      "missingsch",
      "mobilian-jargon",
      "mohawk-dutch",
      "montserrat-creole",
      "namibian-black-german",
      "nauru-pidgin-english",
      "ndyuka",
      "ndyuka-tiriy-pidgin",
      "nefamese",
      "negerhollands",
      "negro-dutch",
      "new-zealand-pidgin-english",
      "ngatikese-creole",
      "nigerian-pidgin",
      "nootka-jargon",
      "norfuk",
      "north-moluccan-malay",
      "nubi",
      "oorlams-creole",
      "orang-pulo",
      "papiamento",
      "papua-new-guinea-pidgin",
      "papuan-malay",
      "papuan-pidgin-english",
      "peranakan",
      "petjo",
      "petuh",
      "pichinglis",
      "pidgin-delaware",
      "pidgin-hawaiian",
      "pidgin-iha",
      "pidgin-ngarluma",
      "pidgin-onin",
      "pidgin-wolof",
      "pijin",
      "pitcairn-norfolk",
      "pitkern",
      "port-jackson-pidgin-english",
      "portugis",
      "pov",
      "pretoria-sotho",
      "principense-creole",
      "qoqmoncaq",
      "queensland-kanaka-english",
      "rama-cay-creole",
      "rop",
      "roquetas-pidgin-spanish",
      "russenorsk",
      "s-o-nicolau-creole",
      "s-o-vicente-creole",
      "sabah-malay",
      "saint-kitts-creole",
      "samoan-plantation-pidgin",
      "san-andres-providencia-creole",
      "sango",
      "santiago-creole",
      "santo-ant-o-creole",
      "saramaccan",
      "serui-malay",
      "settler-swahili",
      "simplified-italian-of-libya",
      "simplified-italian-of-somalia",
      "singlish",
      "skepi-dutch-creole",
      "solombala-english",
      "solomon-islands-pijin",
      "spanglish",
      "sranan-tongo",
      "sri-lankan-malay",
      "sri-lankan-portuguese-creole",
      "sula-malay",
      "t-y-b-i-pidgin-french",
      "taimyr-pidgin-russian",
      "tansi",
      "te-parau-tinito",
      "thai-pidgin-english",
      "tinglish",
      "tobagonian-creole",
      "tok-pisin",
      "torres-strait-creole",
      "trinidadian-creole",
      "tsotsitaal",
      "turks-and-caicos-creole",
      "turku-arabic",
      "unserdeutsch",
      "vedda",
      "vincentian-creole",
      "virgin-islands-creole",
      "waxiang",
      "west-african-pidgin-english",
      "west-greenlandic-pidgin",
      "wutunhua",
      "xieheyu",
      "yokohama-pidgin-japanese"
    ]
  },
  Goblin: {
    // chattering West/Central African: takes the whole Niger-Congo block so no other race can reach it
    categories: ["Afroasiatic", "Niger-Congo", "Nilo-Saharan"],
    families: [
      "Adamawa",
      "Akan",
      "Atlantic-Congo",
      "Bantu",
      "Chadic",
      "Ga–Dangme",
      "Gbe",
      "Grassfields Bantoid",
      "Gur",
      "Gurunsi",
      "Igboid",
      "Ijo",
      "Kru",
      "Kunama",
      "Mande",
      "Manding",
      "Mel",
      "Nguni",
      "Niger-Congo",
      "Senegambian (Atlantic)",
      "Ubangian"
    ],
    isos: [
      "abon",
      "abron",
      "acheron",
      "adara",
      "aghem",
      "aka",
      "akan",
      "ambele",
      "ambo",
      "amira",
      "anaang",
      "anca",
      "atsam",
      "awing",
      "baba",
      "babanki",
      "baca",
      "balo",
      "bam",
      "bamali",
      "bambalang",
      "bambara",
      "bamukumbit",
      "bamum",
      "bamwe",
      "bangala",
      "bangi",
      "bangolan",
      "barambu",
      "bariba",
      "bassari",
      "batu",
      "bayot",
      "beba",
      "bebe",
      "bem",
      "bemba",
      "bembe-congo",
      "bembe-drc",
      "besme",
      "bete",
      "bhaca",
      "bina",
      "binza",
      "biseni",
      "bissa",
      "bitare",
      "bmf",
      "bobo",
      "boko",
      "bole-niger-congo",
      "bolon",
      "bomboli-bozaba",
      "bomboma",
      "bomitaba",
      "bomu",
      "bongili",
      "bonjo",
      "bono-ghana-ivory-coast",
      "bono-nigeria",
      "boon",
      "boze",
      "bozo",
      "bube",
      "budza",
      "bukusu",
      "buli",
      "bulu",
      "bum",
      "buru-angwe",
      "busa",
      "bushong",
      "buu",
      "buyu",
      "bwela",
      "caka",
      "cebaara",
      "central-banda",
      "chewa",
      "chichewa",
      "chopi",
      "chung",
      "comorian",
      "dagaare",
      "dagbani",
      "dangme",
      "dciriku",
      "defaka",
      "dengese",
      "dida",
      "djimini",
      "doghose",
      "dogoso",
      "doko",
      "dyula",
      "dzando",
      "dzodinka",
      "ebira",
      "eman",
      "esimbi",
      "eton",
      "evant",
      "ewe",
      "ewo",
      "ewondo",
      "fang-cameroon",
      "fang-equatorial-guinea-and-gabon",
      "fanji",
      "farefare",
      "fe-fe",
      "ff",
      "fio",
      "fon",
      "fub",
      "fuc",
      "fue",
      "fuh",
      "fui",
      "fula",
      "fungor",
      "fut",
      "fuv",
      "fwe",
      "ga",
      "geme",
      "gendza",
      "gengele-creole",
      "ghomala",
      "gikuyu",
      "gola",
      "goundo",
      "gourmanche",
      "gwari",
      "gyong",
      "hakaona",
      "hanga",
      "ibo2",
      "ibo3",
      "igbo",
      "kck",
      "kiga",
      "kik",
      "kikuyu",
      "kin",
      "kin2",
      "kinyarwanda",
      "kirundi",
      "kon",
      "kongo",
      "limba",
      "lin",
      "lingala",
      "lozi",
      "lua",
      "lug",
      "lug2",
      "luganda",
      "lusoga",
      "manding",
      "mandinka",
      "mende",
      "moore",
      "mumuye",
      "nbl",
      "ndebele",
      "ndo",
      "nkore",
      "nya",
      "nyabwa",
      "run",
      "run2",
      "saari",
      "sakata",
      "samo-burkina",
      "samwe",
      "seh",
      "sena",
      "senara",
      "sengele",
      "sepedi",
      "sesotho",
      "setlokwa",
      "sgb",
      "shanjo",
      "shi",
      "shona",
      "shwai",
      "sighu",
      "simaa",
      "siwu",
      "sna3",
      "soli",
      "soninke",
      "sot",
      "sotho",
      "southeast-ijo",
      "southern-birifor",
      "southern-ndebele",
      "ssz",
      "suba",
      "suba-simbiti",
      "sucite",
      "suku",
      "sumayela-ndebele",
      "supyire",
      "susu",
      "suwu",
      "swa",
      "swa2",
      "swazi",
      "syer-tenyer",
      "tagoi",
      "tagwana",
      "talni",
      "talodi",
      "tegali",
      "tegem",
      "temne",
      "tima",
      "tocho",
      "tonga-zimbabwe-zambia-and-mozambique",
      "tshivenda",
      "tso",
      "tswa",
      "twi",
      "umbundu",
      "vengo",
      "vmw",
      "wali-ghana",
      "weh",
      "wongo",
      "xhosa",
      "yela-kela",
      "yobe",
      "yor3",
      "zemba",
      "zul2"
    ]
  },
  Orc: {
    // steppe horsemen: Turkic + Mongolic, a hard vowel-harmony sound instead of a second Slavic set
    categories: ["Mongolic", "Turkic"],
    families: [
      "Baoanic",
      "Buryat",
      "Daur",
      "Historical Mongolic",
      "Karluk Turkic",
      "Kipchak Turkic",
      "Mongolic",
      "Oghur",
      "Oghur Turkic",
      "Oghuz Turkic",
      "Oirat-Kalmyk",
      "Proto-Mongolic",
      "Siberian Turkic",
      "Southern Mongolic"
    ],
    isos: [
      "alar-tunka-buryat",
      "alasha",
      "altai",
      "altai-uriankhai",
      "amur-dagur",
      "azerbaijani",
      "baarin",
      "bak",
      "baoan",
      "baoanic",
      "bargut",
      "bargut-buryat",
      "bayat-oirat",
      "bonan",
      "bonan-manegacha",
      "bua",
      "buryat",
      "chakhar",
      "chovashi",
      "chuvash",
      "chv",
      "classical-mongolian",
      "dagur",
      "darkhad",
      "daur",
      "dongxiang",
      "dorbet-oirat",
      "eastern-yugur",
      "ekherit-bulagat-buryat",
      "ekhirit-bulagat-buryat",
      "gag",
      "gagauz",
      "hailar-dagur",
      "ili-turki",
      "kaa",
      "kalmyk",
      "khakas",
      "khalkha",
      "khamnigan",
      "kharchin-khorchin",
      "khk",
      "khk2",
      "khorchin",
      "khorchin-mongol",
      "khori-buryat",
      "khoton",
      "kir",
      "lower-uda-buryat",
      "middle-mongol",
      "moghol",
      "mogholi",
      "mongolian",
      "nantoq-baoan",
      "nonni-dagur",
      "northern-khalkha",
      "oeld",
      "oirat",
      "oirat-mongolian",
      "ordos",
      "proto-mongolic",
      "salar",
      "santa",
      "santa-mongol",
      "santa-sijiaji",
      "santa-suonanba",
      "santa-wangjiaji",
      "sart-kalmyk",
      "shilingol-khalkha",
      "shira-yugur",
      "sonid",
      "southern-khalkha",
      "sty",
      "tat",
      "tongren-bonan",
      "torgut",
      "tuk",
      "tur",
      "turkmen",
      "tuvan",
      "ulaanchab",
      "urum",
      "uyghur",
      "uzbek",
      "xal",
      "yakut",
      "zakhchin"
    ]
  },
  Giant: {
    // highland New Guinea, big and slow: Papuan highland families split away from Aarakocras island set
    categories: ["Papuan"],
    families: [
      "Angan",
      "Chimbu–Wahgi",
      "Dani",
      "Duna–Pogaya",
      "East Strickland",
      "Eleman",
      "Engan",
      "Greater Awyu",
      "Inland Gulf",
      "Kayagaric",
      "Kolopom",
      "Kutubuan",
      "Kwerbic",
      "Kwomtari",
      "Lengu",
      "North Bougainville",
      "Ok–Oksapmin",
      "Turama–Kikorian"
    ],
    isos: [
      "aghu",
      "akoye",
      "angaataha",
      "angal",
      "ankave",
      "atohwaim-kaugat",
      "awyu-dumut",
      "becking-dawi",
      "bimin",
      "bisorio",
      "burumakok",
      "chimbu",
      "chuave",
      "dom",
      "duna",
      "enga",
      "faiwol",
      "fasu",
      "fembe",
      "fiwaga",
      "foe",
      "foia-foia",
      "gobasi",
      "golin",
      "grand-valley-dani",
      "grx",
      "hagen",
      "hamtai",
      "hoia-hoia",
      "huli",
      "hupla",
      "ikobi",
      "ipiko",
      "ipili",
      "jimi",
      "kaguel",
      "kamasa",
      "kandawo",
      "kawacha",
      "kayagar-kaygir",
      "kewa",
      "khp",
      "kimaama-kimaghama",
      "kombai-wanggom",
      "komyandaret",
      "konai",
      "kopkaka",
      "korowai",
      "kubo",
      "kuman",
      "kyaka",
      "lembena",
      "lowland-iwur",
      "mandobo",
      "maring",
      "melpa",
      "menya",
      "mian",
      "mountain",
      "mubami",
      "muyu",
      "nakai",
      "namumi",
      "narak",
      "ndom",
      "nduga",
      "ngalum",
      "nggem",
      "nii",
      "ninggerum",
      "nomane",
      "odoodee",
      "oksapmin",
      "omati",
      "pisa",
      "pogaya",
      "riantana",
      "rotokas",
      "rumu",
      "safeyoka",
      "salt-yui",
      "samberigi",
      "samo",
      "sawi",
      "setaman",
      "shiaxa",
      "silimo",
      "simbari",
      "sinasina",
      "some",
      "suganga",
      "susuami",
      "tainae",
      "tamagario",
      "tangko",
      "tbd",
      "telefol",
      "tembagla",
      "tifal",
      "tsaukambo",
      "urapmin",
      "wahgi",
      "walak",
      "wambon",
      "wano",
      "western",
      "western-dani",
      "xar",
      "yagwoia",
      "yali",
      "yipma",
      "yogo-tamagario",
      "yonggom"
    ]
  },
  Draconic: {
    // the highland dragon: Tibetic + Qiangic + Tai-Kadai - tones and sibilants, and no Sinitic at all
    categories: ["Sino-Tibetan", "Tai-Kadai"],
    families: [
      "Bodish",
      "Gyalrongic",
      "Kam-Sui",
      "Kra",
      "Kra-Dai",
      "Qiangic",
      "Tai",
      "Tibetic",
      "Tibeto-Burman",
      "Zhuang"
    ],
    isos: [
      "ahom",
      "ai-cham",
      "amdo-tibetan",
      "baima",
      "balti",
      "biao-kam-sui",
      "bod",
      "bod2",
      "bodish",
      "burmese",
      "buyang",
      "cao-miao",
      "chadong",
      "chiang-saen",
      "choyo",
      "dre",
      "dzo",
      "dzongkha",
      "en-kra",
      "gelao",
      "gyalrong",
      "gyalrongic",
      "hagei",
      "hezhang-buyi",
      "horpa",
      "iii",
      "jul",
      "kac",
      "kam-dong",
      "kam-sui",
      "kayah",
      "khams-tibetan",
      "khroskyabs",
      "kra-family",
      "kte",
      "lachi",
      "laha",
      "lakkia-kam-sui",
      "lbj",
      "lhm",
      "lis",
      "loy",
      "lus",
      "macro-zhuang",
      "mak-kam-sui",
      "maonan",
      "mni",
      "muk",
      "mulam",
      "mulao-kra",
      "muya",
      "mya",
      "mya2",
      "northern-qiang",
      "nuoxi-naxi-yao",
      "ola",
      "paha",
      "prinmi",
      "proto-kam-sui",
      "proto-kra",
      "proto-kra-dai",
      "proto-tai",
      "pyang-zhuang",
      "qabiao",
      "qau",
      "qiang",
      "rakhine",
      "scp",
      "shn",
      "sip",
      "southern-qiang",
      "sui-lang",
      "syw",
      "tai-song",
      "tai-yao",
      "tangut",
      "tcn",
      "telue",
      "tha2",
      "then-kam-sui",
      "tibetan",
      "vandu",
      "xct",
      "xsr",
      "zha",
      "zhaba",
      "zhangzhung"
    ]
  },
  Dragonborn: {
    // imperial and ancient: takes the whole Indo-Aryan block, given up by every other race
    categories: ["Indo-Aryan", "Indo-European"],
    families: [
      "Bengali–Assamese",
      "Bhil",
      "Bihari",
      "Central Pahari",
      "Dardic",
      "Eastern Hindi",
      "Eastern Indo-Aryan",
      "Eastern Pahari",
      "Hindustani",
      "Indo-Aryan",
      "Old Indo-Aryan",
      "Punjabi–Lahnda",
      "Rajasthani",
      "Raji–Raute",
      "Romani",
      "Tharu",
      "Unclassified Indo-Aryan",
      "Western Hindi",
      "Western Pahari"
    ],
    isos: [
      "aeq",
      "ahr",
      "asm",
      "assamese",
      "awadhi",
      "bdz",
      "ben2",
      "bengali",
      "bfy",
      "bgc",
      "bgq",
      "bhe",
      "bmj",
      "bns",
      "bpy",
      "braj",
      "btv",
      "bundeli",
      "ccp",
      "chhattisgarhi",
      "chittagonian",
      "clh",
      "dgo",
      "dhakaiya-kutti-bengali",
      "dhd",
      "dhivehi",
      "dmk",
      "dml",
      "dogri",
      "dry",
      "dty",
      "dwz",
      "gbm",
      "ggg",
      "ghr",
      "gig",
      "gjk",
      "gju",
      "gujarati",
      "gwc",
      "gwf",
      "gwt",
      "haj",
      "hin",
      "hin2",
      "hindustani",
      "hlb",
      "hnd",
      "hne",
      "hno",
      "hoj",
      "jml",
      "jnd",
      "jog",
      "kas",
      "kashmiri",
      "kbu",
      "kfr",
      "kfy",
      "kok",
      "kra",
      "kumhali",
      "kvx",
      "kxp",
      "kyv",
      "lmn",
      "lrk",
      "mag",
      "mby",
      "mki",
      "mtr",
      "mup",
      "mymensinghi-bengali",
      "nep2",
      "nepali",
      "nlm",
      "noakhailla",
      "noe",
      "odia",
      "odk",
      "ori",
      "phr",
      "pnb",
      "punjabi",
      "raj",
      "rajasthani",
      "rjs",
      "rkt",
      "rohingya",
      "rom",
      "rom2",
      "romani",
      "rwr",
      "san",
      "sbn",
      "sdg",
      "sgj",
      "shd",
      "sin2",
      "sindhi",
      "sinhala",
      "sjp",
      "skr",
      "snd2",
      "soi",
      "spv",
      "syl",
      "thar-bede",
      "thr",
      "tnv",
      "urdu",
      "ush",
      "varendri",
      "vgr",
      "wbr",
      "wry",
      "wtm",
      "x-nepal-bankariya",
      "x-nepal-done",
      "x-nepal-kewarat",
      "x-nepal-malpande",
      "xhe",
      "xka",
      "xnr"
    ]
  },
  Arachnid: {
    // venomous, sibilant, ancient: West + East Semitic and the Ethiopic Semitic branch
    categories: ["Afroasiatic"],
    families: [
      "Arabic",
      "Aramaic",
      "Central Asian",
      "Central Neo-Aramaic",
      "East Semitic",
      "Egyptian",
      "Gurage",
      "Harari-Argobba Ethio-Semitic",
      "Levantine",
      "Literary",
      "Mesopotamian",
      "Middle Aramaic",
      "Modern South Arabian",
      "North Arabian",
      "North Ethiopic",
      "Northeastern Neo-Aramaic",
      "Old Aramaic",
      "Old South Arabian",
      "Other Canaanite",
      "Outer",
      "Peninsular",
      "Semitic",
      "South Canaanite",
      "South Ethiopic",
      "Transversal",
      "West Gurage"
    ],
    isos: [
      "abba-gorgoryos",
      "acm",
      "adeni-arabic",
      "aeb",
      "aii",
      "aii2",
      "akkadian",
      "aleppine-arabic",
      "amh",
      "amh2",
      "amh3",
      "amharic",
      "amharic-argobba",
      "ammonite",
      "amorite",
      "anatolian-arabic",
      "ancient-egyptian",
      "ancient-north-arabian",
      "apc",
      "ara",
      "aramaic",
      "arc",
      "argobba",
      "arq",
      "ary",
      "arz",
      "assyrian",
      "assyrian-neo-aramaic",
      "aws-nian",
      "ba-ari",
      "babylonian",
      "baghdadi-arabic",
      "bahraini-gulf-arabic",
      "bahrani-arabic",
      "bakhtiari-arabic",
      "bareqi-arabic",
      "barwar",
      "barzani-jewish-neo-aramaic",
      "bathari",
      "betanure-jewish-neo-aramaic",
      "biblical-aramaic",
      "biblical-hebrew",
      "bohtan-neo-aramaic",
      "bukharian-arabic",
      "canaano-akkadian",
      "central-asian-arabic",
      "central-semitic",
      "chaha",
      "chaldean-neo-aramaic",
      "christian-urmi-neo-aramaic",
      "cilician-arabic",
      "classical-arabic",
      "classical-syriac",
      "coptic",
      "cypriot-arabic",
      "dadanitic",
      "dahalik",
      "harari",
      "harari-east-gurage",
      "heb",
      "hebrew",
      "inneqor",
      "inor",
      "levantine-arabic",
      "libyan-arabic",
      "maltese",
      "mesmes",
      "mesqan",
      "mlt",
      "muher",
      "qwara",
      "sebat-bet",
      "sebat-bet-gurage",
      "tigre",
      "tigrinya",
      "tir",
      "tir2",
      "tir3",
      "tunisian-arabic",
      "turoyo",
      "ugaritic",
      "ulbare",
      "west-gurage",
      "west-semitic",
      "western-middle-aramaic",
      "wolane",
      "yafii-arabic",
      "yemeni-arabic",
      "zakho",
      "zay",
      "zway"
    ]
  },
  Serpent: {
    // the naga of the monsoon forest: Bahnaric + Munda, the dripping sibilants of the Bay of Bengal
    categories: ["Austroasiatic"],
    families: ["Angkuic", "Aslian", "Bahnaric", "Chamic", "Khasian", "Munda", "Nicobarese", "Viet-Muong", "Waic"],
    isos: [
      "alak-bahnaric",
      "bahnar",
      "batek",
      "brao-bahnaric",
      "camorta-nicobarese",
      "car-nicobarese",
      "cdz",
      "chaura-nicobarese",
      "chrau-bahnaric",
      "cua-bahnaric",
      "duan-bahnaric",
      "gta",
      "halang-bahnaric",
      "ho-munda",
      "hoc",
      "hre",
      "jeh-bahnaric",
      "jru-bahnaric",
      "juk-bahnaric",
      "kaco-bahnaric",
      "katchal-nicobarese",
      "katua-bahnaric",
      "kayong-bahnaric",
      "kfj",
      "kfq",
      "kha2",
      "kharia",
      "kkn",
      "koho-bahnaric",
      "laven-bahnaric",
      "lavi-bahnaric",
      "mah-meri",
      "mel-khaonh-bahnaric",
      "mnong",
      "monom-bahnaric",
      "mundari",
      "nancowry-nicobarese",
      "nyaheun-bahnaric",
      "oi-bahnaric",
      "ra-ong-bahnaric",
      "rengao-bahnaric",
      "sapuan-bahnaric",
      "sat",
      "sedang",
      "semai",
      "semaq-beri",
      "semelai",
      "shompen",
      "southern-nicobarese",
      "srb",
      "stieng-bahnaric",
      "su-bahnaric",
      "takua-bahnaric",
      "tampuan-bahnaric",
      "tariang-bahnaric",
      "temiar",
      "teressa-nicobarese",
      "thmon-bahnaric",
      "todrah-bahnaric",
      "u-pouma",
      "vie2",
      "wbm"
    ]
  },
  Tiefling: {
    // infernal, silk-voiced: Cushitic + Berber, deliberately NOT Semitic so Arachnid stays separate
    categories: ["Afroasiatic"],
    families: [
      "Afroasiatic",
      "Atlas Berber",
      "Berber",
      "Chadic",
      "Cushitic",
      "Eastern Berber",
      "Egypto-Sudanic",
      "Maghrebi",
      "Northern Berber",
      "Omotic",
      "Proto-Berber",
      "Tuareg Berber",
      "Western Aramaic",
      "Western Berber",
      "Zenaga Berber",
      "Zenati Berber"
    ],
    isos: [
      "afar",
      "agaw",
      "air-tamajeq",
      "ait-seghrouchen-berber",
      "algerian-arabic",
      "algerian-saharan-arabic",
      "amf",
      "andalusi-arabic",
      "aroid",
      "atlas-berber",
      "awjila",
      "bambassi",
      "beja",
      "cairene-arabic",
      "central-atlas-tamazight",
      "chadian-arabic",
      "corfiot-maltese",
      "dizoid",
      "douiret",
      "dullay",
      "east-zenati",
      "eastern-berber",
      "eastern-middle-atlas-berber",
      "eastern-morocco-zenati",
      "el-molo",
      "ghadames",
      "ghomara",
      "gonga",
      "guanche",
      "gurara",
      "highland-east-cushitic",
      "iznasen",
      "jerba-berber",
      "judeo-berber",
      "kabyle",
      "lisan-al-gharbi",
      "lowland-east-cushitic",
      "macro-somali",
      "maghrebi-arabic",
      "mao-omotic",
      "matmata-berber",
      "mozabite",
      "mzab-wargla",
      "nafusi",
      "north-omotic",
      "northern-berber",
      "ometo",
      "omo-tana",
      "orm",
      "orm2",
      "orm3",
      "oromo",
      "oromoid",
      "ouargli",
      "proto-berber",
      "rendille-boni",
      "rif",
      "saba",
      "saho",
      "saho-afar",
      "sanhaja-de-srair",
      "sened",
      "shawiya",
      "sheliff-basin-berber",
      "shenwa",
      "shilha",
      "siwi",
      "sokna",
      "som",
      "som2",
      "som3",
      "somali",
      "somali-western",
      "south-cushitic",
      "south-oran-figuig-berber",
      "standard-algerian-berber",
      "standard-moroccan-amazigh",
      "sukur",
      "tagdal-language",
      "tamahaq",
      "tamasheq",
      "tarifit",
      "tawellemmet",
      "tawellemmet-language",
      "tetserret",
      "tetserret-language",
      "thv",
      "tidikelt",
      "tidikelt-language",
      "tsamai",
      "tuareg-berber",
      "tuareg-tamasheq",
      "tugurt",
      "tuwat",
      "tuwat-language",
      "western-berber",
      "western-egyptian-bedawi-arabic",
      "wolaitta",
      "zenaga",
      "zenaga-language",
      "zenati-berber",
      "zuwara-berber"
    ]
  },
  Aasimar: {
    // gold and open vowels: the Western Romance half (Iberian + Franco-Provencal), leaving Italo-Romance to Minotaur
    categories: ["Romance"],
    families: [
      "Aragonese",
      "Arpitan",
      "Astur-Leonese",
      "Catalan",
      "Galician",
      "Gascon Occitan",
      "Judeo-Catalan",
      "Judeo-Occitan",
      "Judeo-Spanish",
      "Latin American",
      "Mozarabic",
      "Occitan",
      "Old",
      "Old Catalan",
      "Old Occitan",
      "Old Spanish",
      "Portuguese",
      "Spanish"
    ],
    isos: [
      "aas-whistled",
      "alentejan",
      "algherese",
      "andalusi-romance",
      "andalusian",
      "ans-",
      "aragonese",
      "aranese",
      "argentinian-spanish",
      "arpitan",
      "asturian",
      "auvergnat",
      "b-arnese",
      "balearic",
      "barranquenho",
      "benasquese",
      "bercian",
      "bolivian-spanish",
      "brazilian-portuguese",
      "canarian",
      "cantabrian",
      "cast-o",
      "castilian",
      "castrapo",
      "central-aragonese",
      "cheso",
      "chilean-spanish",
      "chilote",
      "colombian-spanish",
      "eastern-aragonese",
      "ecuadorian-spanish",
      "eonavian",
      "equatoguinean-spanish",
      "estremenho",
      "european-portuguese",
      "extremaduran",
      "faetar",
      "fala",
      "franco-proven-al",
      "galician",
      "galician-asturian",
      "haketia",
      "judeo-aragonese",
      "judeo-catalan",
      "judeo-gascon",
      "judeo-portuguese",
      "judeo-proven-al",
      "judeo-spanish",
      "ladino",
      "latin-american-spanish",
      "leonese",
      "llanito",
      "mexican-spanish",
      "minderico",
      "mineiro",
      "mirandese",
      "mozarabic",
      "murcian",
      "navarrese",
      "navarro-aragonese",
      "northern-portuguese",
      "old-catalan",
      "old-gallo-romance",
      "old-leonese",
      "old-occitan",
      "old-spanish",
      "oliventine",
      "pa-uezu",
      "palra",
      "paraguayan-spanish",
      "peruvian-ribere-o",
      "peruvian-spanish",
      "philippine-spanish",
      "por",
      "riberan",
      "riojan",
      "rioplatense-spanish",
      "riunorese",
      "saharan-spanish",
      "savoyard",
      "somontan-s",
      "southern-aragonese",
      "spa",
      "tetuani",
      "uruguayan-portuguese",
      "uruguayan-spanish",
      "vald-tain",
      "venezuelan-spanish",
      "western-aragonese"
    ]
  },
  Hobgoblin: {
    // sly sylvan trickster: the mainland Mon-Khmer half, a reedy tonal sound Serpent does not have
    categories: ["Austroasiatic"],
    families: ["Katuic", "Khasic", "Khmeric", "Khmuic", "Monic", "Pakanic", "Palaungic", "Pearic", "Vietic"],
    isos: [
      "bbh",
      "blr",
      "bru",
      "chong",
      "kasong",
      "kuf",
      "kha",
      "kha-lyngngam",
      "kha-native-speakers",
      "kha-pnar",
      "kha-war",
      "khm",
      "khm-khe",
      "khm-northern",
      "khm-western",
      "khm2",
      "khmu",
      "kuy",
      "mang",
      "mnw",
      "mnw-native-speakers",
      "muong",
      "nyah-kur",
      "pear",
      "ply",
      "rbb",
      "ril",
      "sa-och",
      "samre",
      "somray",
      "suoy",
      "vie",
      "vie-central",
      "vie-china",
      "vie-hue",
      "vie-northern",
      "vie-southern",
      "vie-us"
    ]
  },
  Goliath: {
    // the stone titans of the Caucasus massif: a dense consonantal mountain sound
    categories: ["Kartvelian", "Northeast Caucasian", "Northwest Caucasian"],
    families: [
      "Abkhaz",
      "Avar",
      "Circassian",
      "Dargin",
      "Georgian dialects",
      "Georgian–Zan",
      "Ingush",
      "Kartvelian",
      "Lezgian",
      "Nakh",
      "Northeast Caucasian",
      "Proto-Georgian–Zan",
      "Proto-Kartvelian"
    ],
    isos: [
      "abaza",
      "abk",
      "abkhaz",
      "adjaran-georgian",
      "ady",
      "adyghe",
      "agx",
      "akv",
      "ani",
      "aqc",
      "ava",
      "bats",
      "bph",
      "bzyb",
      "che",
      "chechen",
      "circassian",
      "cji",
      "dar",
      "dargwa",
      "ddo",
      "gdo",
      "georgian",
      "gin",
      "huz",
      "ingush",
      "inh",
      "judaeo-georgian",
      "kabardian",
      "kap",
      "karto-zan",
      "khv",
      "kpt",
      "kva",
      "laz",
      "lbe",
      "lez",
      "lezgin",
      "mingrelian",
      "old-georgian",
      "proto-georgian-zan",
      "proto-kartvelian",
      "rut",
      "svan",
      "tabasaran",
      "tin",
      "uby",
      "ugh",
      "xdq"
    ]
  },
  Lizardfolk: {
    // Saharan and Nilotic: a dry clicking reptilian hiss, split from Gnolls Chadic
    categories: ["Afroasiatic", "Niger-Congo", "Nilo-Saharan"],
    families: [
      "Bantu",
      "Berta",
      "Central Sudanic",
      "Chadic",
      "Fur",
      "Gumuz",
      "Maban",
      "Nilo-Saharan",
      "Nilotic",
      "Saharan",
      "Songhai",
      "Tuareg Berber",
      "Ubangian"
    ],
    isos: [
      "aiki",
      "aja",
      "amdang",
      "aringa",
      "asoa",
      "avokaya",
      "baka",
      "beli",
      "berta",
      "birri",
      "bongo",
      "daza",
      "dendi",
      "dinka",
      "dongo",
      "fongoro",
      "fur",
      "furu",
      "gumuz",
      "hozo",
      "kanuri",
      "kau",
      "luo",
      "mas",
      "ngambay",
      "nus",
      "sar",
      "seze",
      "sinyar",
      "songhoyboro-ciine",
      "south-banda",
      "surbakhal",
      "tadaksahak",
      "tagdal",
      "tasawaq",
      "teda",
      "tondi-songway-kiini",
      "tulishi",
      "tumtum",
      "uduk",
      "wali-sudan",
      "west-banda",
      "yangere",
      "yulu",
      "zaghawa"
    ]
  },
  Gnoll: {
    // the hyena laugh: the Chadic block plus the click isolates, a genuinely alien sound
    categories: ["Afroasiatic", "Isolate", "Niger-Congo"],
    families: ["Chadic", "Hadza", "Jee", "Sandawe"],
    isos: [
      "ayu",
      "afade",
      "ajawa",
      "angas",
      "auyokawa",
      "bacama",
      "bacama-language",
      "bade-chadic",
      "bade-language",
      "baldemu",
      "bana",
      "barein",
      "bata",
      "beele",
      "belneng",
      "bidiyo",
      "birgit",
      "biu-mandara",
      "boga",
      "boghom",
      "bole-afroasiatic",
      "bole-chadic-language",
      "bole-tangale",
      "boor",
      "bura",
      "bure-chadic",
      "buwal",
      "cakfem-mushere",
      "chakato",
      "cibak",
      "cineni",
      "ciwogai",
      "cuvok",
      "daba",
      "dangaleat",
      "dass",
      "dazawa",
      "deno",
      "dghwede",
      "diri",
      "dugwor",
      "duhwa",
      "duwai",
      "east-chadic",
      "fali-of-mubi",
      "fyer",
      "gaanda",
      "gadang",
      "galambu",
      "gawar",
      "geji",
      "gera",
      "geruma",
      "gidar",
      "giiwo",
      "glavda",
      "goemai",
      "goji",
      "gude",
      "gudu",
      "guduf-gava",
      "guruntum",
      "gvoko",
      "gwandara",
      "hadza",
      "hau2",
      "hausa",
      "hausa-gwandara",
      "hdi",
      "hina",
      "holma",
      "huba",
      "hwana",
      "hya",
      "jara",
      "jelkung",
      "jibyal",
      "jilbe",
      "jimi-language-cameroon",
      "jimi-language-nigeria",
      "jina",
      "jonkor",
      "ju-chadic",
      "kabalai",
      "kajakse",
      "kamwe",
      "kanakuru",
      "karai-karai",
      "kariya",
      "kera-chadic",
      "kholok",
      "kimre",
      "kir-balar",
      "kirya-konzal",
      "koenoem",
      "kubi",
      "kulere",
      "kulung-west-chadic-language",
      "kutto",
      "kwaami",
      "kwang-chadic",
      "lagwan",
      "lamang",
      "lele-language-chad",
      "maaka",
      "mabire",
      "mada",
      "mafa",
      "majera",
      "malgbe",
      "mantsi-language-nigeria",
      "marba",
      "margi",
      "margi-south",
      "masa-chadic",
      "masa-north",
      "masa-south",
      "maslam",
      "masmaje",
      "massa-chadic",
      "matal",
      "mawa-chadic",
      "mazagway",
      "mbara-language-chad",
      "mbudum",
      "mbuko",
      "mburku",
      "mefele",
      "merey",
      "mesme",
      "migaama",
      "miler",
      "miltu",
      "mire",
      "miship",
      "miya",
      "mofu-gudur",
      "mogum",
      "mokilko",
      "moloko",
      "montol",
      "mpade",
      "mser",
      "mubi-chadic",
      "mundat",
      "musey",
      "musgu",
      "muskum",
      "muyang",
      "mwaghavul",
      "nancere",
      "ndam",
      "ngamo",
      "ngas",
      "ngete-herde",
      "nggwahyi",
      "ngizim",
      "ngwaba",
      "north-bauchi",
      "north-giziga",
      "north-mofu",
      "nteng",
      "nyam",
      "nzanyi",
      "paa-chadic",
      "pali-chadic-language",
      "pan-chadic",
      "parkwa",
      "pero",
      "peve",
      "piya",
      "poki",
      "polci",
      "proto-ron",
      "proto-warji",
      "putai",
      "pyapun",
      "ron-chadic",
      "ron-language",
      "saba-chadic-language",
      "sandawe",
      "sarua",
      "saya-chadic",
      "sha-chadic",
      "sharwa",
      "siri",
      "siri-chadic-language",
      "sokoro",
      "somrai",
      "south-bauchi",
      "south-giziga",
      "southern-gabri",
      "sukur-language",
      "tal",
      "tala-chadic",
      "tambas",
      "tamki",
      "tangale",
      "tera-chadic",
      "teshenawa",
      "tobanga",
      "toram",
      "tsuvan",
      "tumak",
      "ubi",
      "vame",
      "vemgo-mabas",
      "wandala",
      "warji",
      "west-chadic",
      "wuzlam",
      "yedina",
      "yiwom",
      "zari-chadic",
      "zeem-chadic",
      "zirenkel",
      "zizilivakan",
      "zulgo-gemzek",
      "zumaya",
      "zumbun"
    ]
  },
  Bugbear: {
    // far-Siberian, extinction-cold: Chukotko-Kamchatkan plus the dead and moribund families
    categories: ["Afroasiatic", "Chukotko-Kamchatkan", "Matacoan", "Niger-Congo", "Nilo-Saharan", "Nivkh", "Yukaghir"],
    families: [
      "Adamawa",
      "Bantu",
      "Central Sudanic",
      "Chukotkan",
      "Chukotko-Kamchatkan",
      "Extinct",
      "Itelmen",
      "Kamchatkan",
      "Matacoan",
      "Niger-Congo",
      "Nivkh",
      "Omotic",
      "Yukaghir"
    ],
    isos: [
      "alyutor",
      "avi",
      "bcq",
      "bdt",
      "bez",
      "chukchi",
      "chukotkan",
      "chukotko-kamchatkan",
      "chuvan",
      "eastern-itelmen",
      "itelmen",
      "kamchatkan",
      "kerek",
      "koryak",
      "mdj",
      "mzh",
      "ndc",
      "nivkh",
      "omok",
      "southern-itelmen",
      "southern-yukaghir",
      "tundra-yukaghir",
      "western-itelmen"
    ]
  },
  Tabaxi: {
    // the jungle cat: Mesoamerica only - the Hmong-Mien that used to sit here moved to Gith
    categories: ["Chibchan", "Language isolate", "Mayan", "Mixe-Zoque", "Oto-Manguean", "Totonacan", "Uto-Aztecan"],
    families: [
      "Basque",
      "Chibchan",
      "Cáhita",
      "Hopi",
      "Huave",
      "Mayan",
      "Mixe-Zoque",
      "Mixtecan",
      "Numic",
      "Piman",
      "Purépecha",
      "Tarascan",
      "Totonacan",
      "Uto-Aztecan",
      "Zapotecan"
    ],
    isos: [
      "acr",
      "agu",
      "arh",
      "caa",
      "cac",
      "cahuilla",
      "cak",
      "chf",
      "chol",
      "cholti-classic",
      "cob",
      "comanche",
      "cora",
      "coxoh-maya",
      "cuk",
      "eus2",
      "hop",
      "hopi",
      "huastec",
      "huave",
      "huichol",
      "itza",
      "ixl",
      "jac",
      "kaqchikel",
      "kiche",
      "knj",
      "kog",
      "lac",
      "mam",
      "mayo",
      "mbp",
      "mhc",
      "mig",
      "mop",
      "mot",
      "nah",
      "oodham",
      "pima-bajo",
      "pipil",
      "poi",
      "poqomam",
      "poqomchi",
      "purepecha",
      "qanjobal",
      "qeqchi",
      "quc",
      "qum",
      "quv",
      "rma",
      "shoshoni",
      "southern-tepehuan",
      "tarahumara",
      "toj",
      "totonac",
      "ttc",
      "tzeltal",
      "tzh",
      "tzj",
      "tzo",
      "tzotzil",
      "usp",
      "ute",
      "var",
      "yaqui",
      "yua",
      "yucatec-maya",
      "zap",
      "zoq"
    ]
  },
  Kenku: {
    // the bird-voice people: North American plains and woodland families, with the isolates for the broken cry
    categories: [
      "Algic",
      "Iroquoian",
      "Keresan",
      "Kiowa–Tanoan",
      "Language isolate",
      "Misumalpan",
      "Muskogean",
      "Na-Dene",
      "Salishan",
      "Siouan",
      "Tacanan",
      "Tsimshianic",
      "Tucanoan",
      "Yuman"
    ],
    families: [
      "Algic",
      "Algonquian",
      "Athabaskan",
      "Iroquoian",
      "Keresan",
      "Kiowa–Tanoan",
      "Misumalpan",
      "Muskogean",
      "Na-Dene",
      "Salishan",
      "Seri",
      "Siouan",
      "Tacanan",
      "Tsimshianic",
      "Tucanoan",
      "Yuman",
      "Yuman-Cochimí",
      "Zuni"
    ],
    isos: [
      "abe",
      "aht",
      "alq",
      "apa",
      "aro",
      "arp",
      "bla",
      "blackfoot",
      "cav",
      "cay",
      "cherokee",
      "cho",
      "chp",
      "chr",
      "chr2",
      "coc",
      "coe",
      "coj",
      "cre",
      "cre2",
      "cre3",
      "cree",
      "cro",
      "cub",
      "dak",
      "dak2",
      "dakota",
      "des",
      "dgr",
      "dih",
      "ese",
      "eyak",
      "gvc",
      "gwi",
      "haa",
      "hoi",
      "ing",
      "innu",
      "kio",
      "kjq",
      "klb",
      "koy",
      "kuu",
      "lakota",
      "macuna",
      "mic",
      "mik",
      "mikmaq",
      "miskito",
      "mohawk",
      "mov",
      "mus",
      "nav",
      "nav2",
      "navajo",
      "occaneechi",
      "oji",
      "oji2",
      "ojibwe",
      "one",
      "ono",
      "ppi",
      "rey",
      "salish",
      "see",
      "seri",
      "snn",
      "sri",
      "tau",
      "tav",
      "tcb",
      "tew",
      "tfn",
      "tlingit",
      "tna",
      "tno",
      "tsi",
      "tuo",
      "tus",
      "wiyot",
      "yuf",
      "yum",
      "yurok",
      "zun"
    ]
  },
  Aarakocra: {
    // the sky people: lowland and island Papuan, the opposite half of Papuan from Giant
    categories: ["Papuan"],
    families: [
      "Alor–Pantar",
      "Anim",
      "Asmat–Kamoro",
      "Awin–Pa",
      "Bayono–Awbono",
      "Binanderean",
      "Central Solomons",
      "East Timor Papuan",
      "Gogodala–Suki",
      "Goilalan",
      "Kainantu–Goroka",
      "Keram",
      "Kiwaian",
      "Paniai Lakes",
      "Sepik",
      "Southeast Papuan",
      "Timor–Alor–Pantar",
      "Trans-New Guinea",
      "West Bomberai",
      "West Papuan"
    ],
    isos: [
      "aab",
      "abaga",
      "abui",
      "adang",
      "agarabi",
      "akc",
      "alekano",
      "alor-pantar",
      "aneme-wake",
      "ari",
      "asmat",
      "asmat-citak",
      "asmat-kamoro",
      "auye",
      "awa",
      "awbono",
      "awin",
      "awiyaana",
      "ayz",
      "baham",
      "bami",
      "barai",
      "baramu",
      "bariji",
      "baruga",
      "bauwaki",
      "bayono",
      "bayono-awbono",
      "benabena",
      "biangai",
      "binahari",
      "binandere",
      "binumarien",
      "bipim",
      "bitur",
      "blagar",
      "blb",
      "boazi",
      "boazi-lake-murray",
      "bunak",
      "buruwai",
      "daga",
      "dani",
      "dano",
      "dem",
      "densar",
      "dima",
      "domu",
      "doromu",
      "east-timor-papuan",
      "ekari",
      "ese-omie",
      "ewage",
      "fataluku",
      "fore",
      "fuyug",
      "gadsup",
      "gahuku",
      "gauwa",
      "gende",
      "gimi",
      "ginuman",
      "gogodala",
      "goroka",
      "grass-koiari",
      "greater-awyu",
      "humene",
      "iha",
      "inoke-yate",
      "isabi",
      "kaera",
      "kafoa",
      "kainantu",
      "kamang",
      "kambaira",
      "kamberau",
      "kamono",
      "kamoro",
      "kanasi",
      "kanite",
      "karas",
      "kbx",
      "ke-yagana",
      "kenati",
      "kerewo",
      "kiwai",
      "klon",
      "koitabu",
      "komolom",
      "koneraw",
      "korafe",
      "kosena",
      "kovojab",
      "kui",
      "kula",
      "kunimaipa",
      "laua",
      "mailu",
      "maiwa",
      "makalero",
      "makasae",
      "makayam",
      "mapena",
      "maria",
      "marind",
      "mhz",
      "moikodi",
      "mombum",
      "momina",
      "momuna",
      "moni",
      "morawa",
      "morigi",
      "mountain-koiari",
      "mulaha",
      "namiae",
      "nawaru",
      "nedebang",
      "oirata",
      "ok-oksapmin",
      "onjob",
      "ontenu",
      "orokaiva",
      "oweina",
      "pa",
      "paniai-lakes",
      "retta",
      "rusenu",
      "sabakor",
      "sawila",
      "sempan",
      "siane",
      "somahai",
      "suena",
      "suki",
      "tairoa",
      "tairora",
      "tauade",
      "teiwa",
      "timor-alor-pantar",
      "tirio-lower-fly",
      "tokano",
      "turaka",
      "uare",
      "uhn",
      "umanakaina",
      "usarufa",
      "waboda",
      "waffa",
      "waruna",
      "were",
      "weri",
      "wersing",
      "west-bomberai",
      "western-pantar",
      "wolani",
      "yagaria",
      "yaqay",
      "yareba",
      "yaweyuha",
      "yekora",
      "zia",
      "zimakani"
    ]
  },
  Triton: {
    // the owners Melanesian / Creole direction: Formosan plus Melanesian Papuan and creoles
    categories: ["Austronesian", "Creole", "Micronesian"],
    families: ["English-based", "Formosan", "Motu-based", "Papuan Tip", "Portuguese Creole", "Sonsorolese", "Tobian"],
    isos: [
      "ais",
      "ami",
      "atayal-squliq",
      "atayal-tsole",
      "bunun-isbukun",
      "bunun-northern-central",
      "byq",
      "bzg",
      "ckv",
      "favorlang",
      "fos",
      "hiri-motu",
      "hoanya",
      "jamaican-creole",
      "kae",
      "kea",
      "mbq",
      "papora",
      "pov",
      "ppu",
      "pzh",
      "rukai-budai-labuan-taromak",
      "rukai-maga-tona",
      "rukai-mantauran",
      "sonsorolese",
      "sranan",
      "ssf",
      "sxr",
      "szy",
      "taokas",
      "tay",
      "tobian",
      "trv",
      "tsu",
      "uon",
      "xnb",
      "xsy"
    ]
  },
  "Yuan-ti": {
    // the Chinese serpent: Sinitic + Wu/Yue + Tani/Bai/Hlai, leaving Draconic the highland half
    categories: ["Sino-Tibetan", "Tai-Kadai"],
    families: ["Bai", "Burmish", "Chinese", "Hakka", "Hlai", "Mandarin", "Sinitic", "Tani", "Wu", "Yue"],
    isos: [
      "achang",
      "adi",
      "bai",
      "beijing-mandarin",
      "bijiang-bai",
      "bokar",
      "bola",
      "bouhin",
      "burmish",
      "cdo",
      "central-plains-mandarin",
      "chashan",
      "chongqing-mandarin",
      "cjy",
      "cpx",
      "dali-bai",
      "damu",
      "dap",
      "ha-em",
      "hain",
      "hak",
      "hakka",
      "hlai",
      "hsn",
      "jiaoliao-mandarin",
      "jilu-mandarin",
      "lan-yin-mandarin",
      "langsu",
      "lashi",
      "lauhut",
      "lower-yangtze-mandarin",
      "malaysian-mandarin",
      "mnp",
      "mrg",
      "nan",
      "northeastern-mandarin",
      "proto-hlai",
      "shanghainese",
      "shaozhou-tuhua",
      "singaporean-mandarin",
      "southwestern-mandarin",
      "suzhounese",
      "taishanese",
      "taiwanese-mandarin",
      "teo",
      "tongzha",
      "wenzhounese",
      "wuu",
      "xiangnan-tuhua",
      "yitdut-bai",
      "yue",
      "zaiwa"
    ]
  },
  Firbolg: {
    // leaves Celtic for Sami/Samoyed - hidden far-north fae, the opposite end of the palette from Elf
    categories: ["Uralic"],
    families: [
      "Enets",
      "Inari Sami",
      "Ingrian",
      "Kamas",
      "Kildin Sami",
      "Livonian",
      "Lule Sami",
      "Nenets",
      "Nganasan",
      "Northern Sami",
      "Pite Sami",
      "Sami",
      "Selkup",
      "Skolt Sami",
      "Southern Sami",
      "Ter Sami",
      "Ume Sami",
      "Veps",
      "Votic",
      "Yurats"
    ],
    isos: [
      "akkala-sami",
      "avam",
      "bjarmian-s-mi",
      "central-selkup",
      "central-veps",
      "courland-livonian",
      "eastern-votic",
      "enets",
      "finnmark-sami",
      "forest-enets",
      "forest-nenets",
      "g-llivare",
      "hevaha",
      "inari-sami",
      "ingrian",
      "j-kk-kaska",
      "j-mtland",
      "kainuu-sami",
      "kamas",
      "kamassian-proper",
      "kemi-sami",
      "kildin-sami",
      "koibal",
      "krevinian",
      "kukkuzi",
      "livonian",
      "lower-luga",
      "lule-sami",
      "luokta-m-vas",
      "nenets",
      "nganasan",
      "northern-sami",
      "northern-selkup",
      "northern-veps",
      "orodezhi",
      "pite-sami",
      "s-rkaitum",
      "salaca-livonian",
      "sea-sami",
      "selkup",
      "semisjaur-njarg",
      "serri",
      "siberian-ingrian-finnish",
      "sirkas",
      "skolt-sami",
      "soikkola",
      "southern-sami",
      "southern-selkup",
      "southern-veps",
      "svaipa",
      "ter-sami",
      "torne-sami",
      "tundra-enets",
      "tundra-nenets",
      "tuorpon",
      "tysfjord",
      "ume-sami",
      "vadey",
      "veps",
      "votic",
      "western-votic",
      "yurats"
    ]
  },
  Gith: {
    // ancient psionic exiles: Hmong-Mien + Kuki-Chin, a reedy highland sound
    categories: ["Hmong-Mien", "Sino-Tibetan"],
    families: [
      "Bahengic",
      "Bu–Nao",
      "Hmong-Mien",
      "Hmongic",
      "Hmuic",
      "Kuki-Chin",
      "Mienic",
      "Newaric",
      "Sheic",
      "West Hmongic",
      "Xong"
    ],
    isos: [
      "badong-yao",
      "bgr",
      "biao-min",
      "biao-mon",
      "big-flowery",
      "brd",
      "bunu",
      "cfm",
      "chin",
      "cnh",
      "cnk",
      "csh",
      "dongjia",
      "dzao-min",
      "gejia",
      "guiyang",
      "hm-nai",
      "hmn",
      "hmn2",
      "hmong",
      "hmu",
      "huishui",
      "iu-mien",
      "kim-mun",
      "kiong-nai",
      "luobohe",
      "maojia",
      "mashan",
      "mji",
      "mo-piu",
      "mrh",
      "n-meo",
      "nao-klao",
      "numao",
      "pa-hng",
      "pa-na",
      "phj",
      "pingtang",
      "pkh",
      "proto-hmong-mien",
      "proto-hmongic",
      "proto-mienic",
      "raojia",
      "sanqiao",
      "she",
      "she-chinese",
      "small-flowery",
      "tcz",
      "thf",
      "xixiu",
      "xong",
      "yangchun-pai-yao",
      "yeheni",
      "younian",
      "younuo"
    ]
  },
  Genasi: {
    // spirits of the Pacific and Indian Ocean littorals: a staccato, vowel-heavy oceanic sound
    categories: ["Austronesian", "Creole"],
    families: ["English-based", "Malayo-Polynesian", "Motu-based", "Papuan Tip"],
    isos: [
      "ace",
      "ban",
      "banjar",
      "bbc",
      "berau-malay",
      "brunei-malay",
      "bug",
      "ceb",
      "ceb2",
      "cja",
      "fij",
      "filipino",
      "haw",
      "haw2",
      "hiri-motu",
      "iban",
      "jamaican-creole",
      "jav",
      "jav2",
      "mad",
      "mak",
      "malagasy",
      "malaysian-malay",
      "may",
      "may2",
      "mbq",
      "mlg",
      "mri",
      "mrq",
      "rap",
      "sarawakian-malay",
      "smo",
      "sranan",
      "sun",
      "sun2",
      "tah",
      "tetum",
      "tgl",
      "tgl2",
      "ton",
      "waray",
      "zsm"
    ]
  },
  Satyr: {
    // Italic / Rhaeto-Romance direction: the peripheral Italo-Romance dialects, liquid and pastoral
    categories: ["Romance"],
    families: [
      "Calabrian",
      "Cilentan",
      "Dalmatian Romance",
      "Friulian",
      "Gallo-Italic",
      "Istriot",
      "Ladin",
      "Neapolitan",
      "Oïl Dialects",
      "Salentino",
      "Sicilian",
      "Venetian"
    ],
    isos: [
      "abruzzese",
      "aeolian",
      "angevin",
      "anglo-norman",
      "ardennais",
      "arianese",
      "augeron",
      "auregnais",
      "barese",
      "basilicatine",
      "benevento",
      "berrichon",
      "bourbonnais",
      "burgundian",
      "cadorino",
      "calabro",
      "campano",
      "castelmezzano",
      "cauchois",
      "central-metafonetica",
      "central-southern-calabrian",
      "champenois",
      "chipilo",
      "cilentan",
      "cosentino",
      "cotentinais",
      "dalmatian",
      "eastern-nonmetafonetica",
      "ennese",
      "fiuman",
      "fornes",
      "fra",
      "frainc-comtou",
      "friulian-lang",
      "gallo",
      "gallo-italic-of-basilicata",
      "gallo-italic-of-sicily",
      "gallo-picene",
      "gaumais",
      "guern-siais",
      "irpino",
      "istriot",
      "j-rriais",
      "jersey-legal-french",
      "ladin-lang",
      "law-french",
      "lorrain",
      "manduriano",
      "mayennais",
      "meridional-french",
      "messinese",
      "molisan",
      "moselle-romance",
      "neapolitan-lang",
      "nones",
      "norman",
      "northern-calabrian",
      "orl-anais",
      "pantesco",
      "paydret",
      "picard",
      "poitevin",
      "poitevin-saintongeais",
      "pugliese",
      "r-mois",
      "saintongeais",
      "salentino",
      "sicilian",
      "south-lucanian",
      "southeast-metafonetica",
      "southern-cilentan",
      "southern-latian",
      "southern-laziale",
      "standard-french",
      "talian",
      "tarantino",
      "triestine",
      "vastese",
      "venetian",
      "vosgien",
      "walloon-lang",
      "welche",
      "west-walloon",
      "western-sicilian",
      "wisconsin-walloon"
    ]
  },
  Minotaur: {
    // the catalog has no Greek, so the Minotaur keeps core Italo-Romance (Latin/Tuscan/Lombard) and Satyr takes the margins
    categories: ["Romance"],
    families: [
      "Central Italian",
      "Corsican",
      "Eastern Lombard",
      "Emilian-Romagnol",
      "Italian",
      "Latin",
      "Ligurian",
      "Lombard",
      "Piedmontese",
      "Romansh",
      "Tuscan",
      "Western Lombard"
    ],
    isos: [
      "african-romance",
      "ancona",
      "aretino-chianaiolo",
      "bergamasque",
      "bolognese",
      "brianz-",
      "brigasc",
      "british-latin",
      "bustocco-legnanese",
      "canz-s",
      "central-italian",
      "central-marchigiano",
      "central-northern-lazian",
      "comasco-lecchese",
      "corsican",
      "cremish",
      "eastern-lombard",
      "emilian",
      "fabriano",
      "ferrarese",
      "florentine",
      "forlivese",
      "gallurese",
      "genoese",
      "intemelio",
      "ita",
      "italo-australian",
      "jauer",
      "judeo-piedmontese",
      "ligurian",
      "lombard",
      "macerata",
      "maltese-italian",
      "milanese",
      "mon-gasque",
      "old-lombard",
      "old-romagnol",
      "ossolano",
      "pannonian-latin",
      "parmigiano",
      "piedmontese",
      "put-r",
      "regional-italian",
      "romagnol",
      "romanesco",
      "romansh",
      "royasc",
      "sabino",
      "sammarinese",
      "sassarese",
      "senese",
      "standard-italian",
      "surmiran",
      "sursilvan",
      "sutsilvan",
      "swiss-italian",
      "tabarchino",
      "ticinese",
      "tuatschin",
      "tuscan",
      "tuscia",
      "umbrian",
      "vallader",
      "varesino",
      "western-lombard"
    ]
  },
  Kobold: {
    // small, clipped, sibilant: Koreanic + Japonic instead of a second Sinitic voice
    categories: ["Japonic", "Koreanic"],
    families: [
      "Ainu",
      "Amami Ryukyuan",
      "Ancient Koreanic",
      "Early Modern Korean",
      "Japanese dialects",
      "Japonic",
      "Koreanic",
      "Middle Korean",
      "Modern Korean",
      "North Korean",
      "Northern Ryukyuan",
      "Old Korean",
      "South Korean"
    ],
    isos: [
      "ainu",
      "amami",
      "baekje-korean",
      "buyeo-korean",
      "chinese-korean",
      "early-modern-korean",
      "gaya-korean",
      "goguryeo-korean",
      "goryeo-korean",
      "hachijo",
      "han-samhan",
      "jeju",
      "joseon-early-modern-korean",
      "joseon-middle-korean",
      "joseon-modern-korean",
      "jpn",
      "jpn-lang",
      "kikai",
      "kor",
      "koryo-mar",
      "kunigami",
      "mahan-korean",
      "middle-korean",
      "modern-korean",
      "munhwao",
      "north-korean",
      "okinoerabu",
      "old-korean",
      "proto-koreanic",
      "puyo",
      "pyojuneo",
      "silla-korean",
      "south-korean",
      "southern-amami",
      "tokunoshima",
      "ye-maek",
      "yoron",
      "zainichi-korean"
    ]
  },
  Duergar: {
    // cursed dwarven craft: deliberately archaic proto-Permic / Ob-Ugric entries for a dead, stony voice
    categories: ["Uralic"],
    families: [
      "Hungarian",
      "Komi-Zyryan",
      "Old Komi",
      "Proto-Finnic",
      "Proto-Hungarian",
      "Proto-Mari",
      "Proto-Mordvinic",
      "Proto-Ob-Ugric",
      "Proto-Permic",
      "Proto-Sami",
      "Proto-Samoyedic",
      "Unclassified Uralic",
      "Uralic"
    ],
    isos: [
      "central-vychegda",
      "hun2",
      "izhma",
      "komi-zyryan",
      "lower-vychegda",
      "luza-letka",
      "merya",
      "meshcherian",
      "muromian",
      "old-komi",
      "pechora",
      "proto-finnic",
      "proto-hungarian",
      "proto-karelian",
      "proto-mari",
      "proto-mordvinic",
      "proto-ob-ugric",
      "proto-permic",
      "proto-sami",
      "proto-samoyedic",
      "proto-uralic",
      "syktyvkar",
      "udora",
      "upper-sysola",
      "upper-vychegda",
      "uralic-family",
      "vym"
    ]
  },
  "Shadar-kai": {
    // soulless exiles with no homeland: stateless Central Asian Pamir and the hill-tongues of the Indian subcontinent
    categories: ["Creole", "Indo-Aryan", "Indo-Iranian", "Iranian"],
    families: ["Bhil", "Bihari", "Doteli", "Hindi-based", "Nuristani", "Pamir", "Romani"],
    isos: [
      "achhami-doteli",
      "andaman-creole-hindi",
      "anp",
      "baitadeli-doteli",
      "bajhangi-doteli",
      "bajureli-doteli",
      "bhb",
      "bhojpuri",
      "bsh",
      "dadeldhuri-doteli",
      "darchuleli-doteli",
      "khortha",
      "kyw",
      "laiuse-romani",
      "magahi",
      "maithili",
      "mjz",
      "nagpuri",
      "sarikoli",
      "sck",
      "vjk",
      "wakhi",
      "xvi"
    ]
  },
  Centaur: {
    // no Greek or Anatolian exists in the catalog, so the Scythian steppe moves to Iranian, with open Amazonian vowels for the gallop
    categories: [
      "Arauan",
      "Arawakan",
      "Cariban",
      "Guahiboan",
      "Guaicuruan",
      "Indo-Aryan",
      "Indo-European",
      "Indo-Iranian",
      "Iranian",
      "Kusunda isolate",
      "Macro-Jê",
      "Matacoan",
      "Tupian",
      "Witotoan",
      "Yanomaman"
    ],
    families: [
      "Arauan",
      "Arawakan",
      "Balochi",
      "Cariban",
      "Dardic",
      "Guahiboan",
      "Guaicuruan",
      "Iranian",
      "Kurdish",
      "Kusunda",
      "Macro-Jê",
      "Matacoan",
      "Nuristani",
      "Pamir",
      "Pashto",
      "Persian",
      "Tupi-Guarani",
      "Witotoan",
      "Yanomaman"
    ],
    isos: [
      "aca",
      "arawak",
      "ashaninka",
      "balochi",
      "bcc",
      "bgn",
      "bgp",
      "bmr",
      "boa",
      "brg",
      "bsh",
      "bwi",
      "cag",
      "cbb",
      "cbd",
      "chorote",
      "ckb",
      "cui",
      "cul",
      "dari",
      "deh",
      "garifuna",
      "guarani",
      "gub",
      "guc",
      "gug",
      "guh",
      "guo",
      "gvj",
      "gyr",
      "haz",
      "hto",
      "iranian-persian",
      "jdg",
      "kanamari",
      "kgg",
      "kgk",
      "kgp",
      "khw",
      "kls",
      "kpj",
      "kur2",
      "kur3",
      "kurdish",
      "lss",
      "macushi",
      "mav",
      "mbn",
      "moc",
      "mtp",
      "mvy",
      "myu",
      "nheengatu",
      "noj",
      "oca",
      "oru",
      "oss",
      "pbt",
      "pbu",
      "persian",
      "pes2",
      "phl",
      "piapoco",
      "plk",
      "prs",
      "psm",
      "pst",
      "pst2",
      "sarikoli",
      "scl",
      "slj",
      "sogdian",
      "sorani-kurdish",
      "srq",
      "ter",
      "tgk",
      "tgk2",
      "tob",
      "tqb",
      "trn",
      "trw",
      "ttt",
      "tupi",
      "txu",
      "urb",
      "waiwai",
      "wakhi",
      "wapishana",
      "wayuu",
      "waziri-pashto",
      "wlv",
      "wne",
      "xav",
      "xer",
      "xsu",
      "xvi",
      "yanomami",
      "ydg",
      "yukpa"
    ]
  },
  Leonin: {
    // the Kalahari hunter: Kxa + Khoe/Tuu clicks, the sharpest sibilant palette in the set
    categories: ["Afroasiatic", "Chonan", "Khoe", "Khoe-Kwadi", "Niger-Congo", "Nilo-Saharan", "Songhay", "Tuu"],
    families: [
      "Akan",
      "Bantu",
      "Chadic",
      "Chonan",
      "Cushitic",
      "Grassfields Bantoid",
      "Khoe",
      "Khoe-Kwadi",
      "Kru",
      "Kunama",
      "Kx'a",
      "Niger-Congo",
      "Nilotic",
      "Songhay",
      "Tuu"
    ],
    isos: [
      "alc",
      "amkoe",
      "bky",
      "dow",
      "ekoka-kung",
      "fat",
      "g-ui",
      "ju-hoan",
      "kde",
      "ktb",
      "kunama",
      "kx-ao-ae",
      "lue",
      "naq",
      "nge",
      "nhr",
      "nng",
      "sekele",
      "shk",
      "taa",
      "toi",
      "wob",
      "zarma"
    ]
  },
  Loxodon: {
    // elephant people of the Indian south: the retroflex Dravidian sound, unique in the set
    categories: ["Dravidian", "Indo-Aryan"],
    families: [
      "Central Dravidian",
      "Dravidian",
      "Marathi–Konkani",
      "North Dravidian",
      "South Dravidian",
      "South-Central Dravidian",
      "Unclassified Dravidian"
    ],
    isos: [
      "allar",
      "aranadan",
      "attapady-kurumba",
      "badaga",
      "beary",
      "betta-kurumba",
      "brahui",
      "chenchu",
      "cholanaikkan",
      "duruwa",
      "eravallan",
      "gondi",
      "holiya",
      "irula",
      "jeseri",
      "kadar-dravidian",
      "kaikadi",
      "kakkala",
      "kalanadi",
      "kan2",
      "kanikkaran",
      "kannada",
      "khirwar",
      "kodava",
      "kolami",
      "konda-dravidian",
      "konkani",
      "koraga",
      "kota-dravidian",
      "koya",
      "kru",
      "kudiya-dravidian",
      "kui-dravidian",
      "kumbaran",
      "kunduvadi",
      "kurambhag-paharia",
      "kurichiya",
      "kurukh",
      "kurumba",
      "kuvi",
      "kxu",
      "madiya",
      "mal2",
      "mala-malasar",
      "malankuravan",
      "malapandaram",
      "malasar",
      "malayalam",
      "malto",
      "manda-dravidian",
      "marathi",
      "muduga",
      "mullu-kurumba",
      "muria",
      "muthuvan",
      "naiki",
      "ollari",
      "paliyan",
      "paniya",
      "pardhan",
      "pathiya",
      "pattapu",
      "pengo",
      "ravula",
      "sauria-paharia",
      "sholaga",
      "tam2",
      "tamil",
      "tel2",
      "telugu",
      "thachanadan",
      "toda",
      "tulu",
      "vishavan",
      "wayanad-chetti",
      "xis",
      "yerukala"
    ]
  },
  Harengon: {
    // werewolf keeps a Baltic-Finnic sound; gives up Germanic so Dwarf stays the only Germanic voice
    categories: ["Uralic"],
    families: ["Eastern Dialects", "Hungarian", "North Estonian", "South Estonian", "Western Dialects"],
    isos: [
      "ala-satakunta",
      "alutaguse",
      "central-estonian",
      "central-finland",
      "central-transdanubian",
      "cs-ng-",
      "eastern-estonian",
      "eastern-savonian",
      "eastern-south-estonian",
      "estonian",
      "heart-tavastian",
      "hollola",
      "hun",
      "iitti",
      "insular-estonian",
      "j-llivaara",
      "kainuu",
      "kemi",
      "kemij-rvi",
      "keuruu-evij-rvi",
      "kraasna",
      "leivu",
      "ludza",
      "middle-botnian",
      "mulgi",
      "north-estonian",
      "northeast-hungary",
      "northeastern-coastal-estonian",
      "northern-botnian",
      "northern-savonian",
      "old-hungarian",
      "p-ij-nne-tavastia",
      "pal-c",
      "per-pohjola",
      "pori-region",
      "porvoo",
      "ruija",
      "savonian",
      "savonlinna",
      "seto",
      "somero-region",
      "south-estonian",
      "southeastern-tavastian",
      "southern-botnian",
      "southern-great-plain",
      "southern-savonian",
      "southern-tavastian",
      "southern-transdanubian",
      "southwestern-finnish",
      "sz-kely",
      "tartu",
      "tavastian",
      "tisza-k-r-s",
      "tornio",
      "transylvanian-plain",
      "turku-highlands",
      "v-rmland-savonian",
      "v-ro",
      "western-estonian",
      "western-transdanubian",
      "western-uusimaa",
      "yl-satakunta"
    ]
  },
  Tortle: {
    // the tortoise: the broad Austronesian macro family - a big, slow, consonant-heavy pool - plus the hypothetical group
    categories: ["Australian Aboriginal", "Austronesian", "Hypothetical"],
    families: [
      "Australian Aboriginal",
      "Austronesian",
      "Chamorro",
      "Formosan",
      "Malayo-Polynesian",
      "Oceanic",
      "Papuan Tip",
      "Philippine",
      "Polynesian",
      "Proposed Groupings",
      "Timoric"
    ],
    isos: [
      "admiralty",
      "adnyamathanha",
      "almosan",
      "alu",
      "anindilyakwa",
      "aru",
      "bali-sasak-sumbawa",
      "bardi",
      "barito",
      "basap",
      "batanic",
      "bikol",
      "bima",
      "bny",
      "buk",
      "bundjalung",
      "bungku-tolaki",
      "bunun",
      "burarra",
      "cam",
      "cebuano-lang",
      "celebic",
      "cenderawasih",
      "central-luzon",
      "central-maluku",
      "central-pacific",
      "central-south-sulawesi",
      "central-vanuatu",
      "chukotko-kamchatkan-amuric",
      "crc",
      "den-yeniseian",
      "dhuwal",
      "djaru",
      "djinang",
      "east-formosan",
      "eastern-oceanic",
      "eno",
      "fijian",
      "flores-lembata",
      "formosan",
      "gamilaraay",
      "gbu",
      "ggk",
      "githabul",
      "gooniyandi",
      "greater-barito",
      "greater-central-philippine",
      "greater-north-borneo",
      "gurindji",
      "guugu-yimidhirr",
      "halmahera-sea",
      "hiligaynon",
      "ibanag",
      "ilocano",
      "ilocano-native-speakers",
      "indonesian",
      "iwaidja",
      "javanese",
      "kaili-wolio",
      "kalamian",
      "kapampangan",
      "karasuk",
      "kayan-murik",
      "kaytetye",
      "kei-tanimbar",
      "kij",
      "kija",
      "kowiai",
      "kukatja",
      "kuku-yalanji",
      "kunwinjku",
      "kuuk-thaayore",
      "kzi",
      "lampung",
      "land-dayak",
      "law",
      "loyalties-new-caledonia",
      "lrg",
      "luritja",
      "madurese",
      "maguindanao",
      "makassar-branch",
      "malay",
      "malayo-chamic",
      "malayo-polynesian",
      "manytjilyitjarra",
      "martu-wangka",
      "maung",
      "melanau-kajang",
      "meso-melanesian",
      "minahasan",
      "minangkabau",
      "miriwoong",
      "mnb",
      "moklenic",
      "motu",
      "mrn",
      "muna-buton",
      "murrinh-patha",
      "nasal",
      "nem",
      "ngaanyatjarra",
      "ngarrindjeri",
      "noongar",
      "north-borneo",
      "north-new-guinea",
      "north-sarawakan",
      "north-vanuatu",
      "northern-formosan",
      "northern-luzon",
      "northern-mindoro",
      "northern-south-sulawesi",
      "northwest-sumatra-barrier-islands",
      "nrm",
      "nunggubuyu",
      "nxl",
      "nyangumarta",
      "oceanic",
      "paiwan",
      "palawa-kani",
      "pangasinan",
      "panyjima",
      "papuan-tip",
      "philippine",
      "pintupi",
      "pitjantjatjara",
      "puyuma",
      "rejang",
      "rukai",
      "sabahan",
      "saluan-banggai",
      "samoan",
      "sangiric",
      "seko-badaic",
      "selaru",
      "shwng",
      "snv",
      "south-mindanao",
      "south-sulawesi",
      "south-vanuatu",
      "southeast-solomonic",
      "southern-oceanic",
      "st-matthias",
      "sumatran",
      "sumba-flores",
      "sundanese-lang",
      "tagalog",
      "tausug",
      "temotu",
      "timoric",
      "tiwi",
      "tomini-tolitoli",
      "tsouic",
      "umr",
      "upper-arrernte",
      "uralic-yukaghir",
      "uralo-siberian",
      "vanuatu",
      "wajarri",
      "walmatjarri",
      "wangkatha",
      "waq",
      "warlpiri",
      "warumungu",
      "wdj",
      "western-malayo-polynesian",
      "western-oceanic",
      "wik-mungkan",
      "wiradjuri",
      "wlo",
      "wyy",
      "xxm",
      "yankunytjatjara",
      "yinjibarndi",
      "yugambeh"
    ]
  },
  Owlin: {
    // the watcher: Tungusic + Eskimo-Aleut, a breathy far-north sound nothing else uses
    categories: ["Eskimo-Aleut", "Tungusic"],
    families: [
      "Aleut",
      "Eskimo-Aleut",
      "Ewenic",
      "Inuit",
      "Jurchenic",
      "Nanaic",
      "Northern Tungusic",
      "Southern Tungusic",
      "Udegheic",
      "Yupik"
    ],
    isos: [
      "alchuka",
      "ale",
      "bala",
      "chinese-kyakala",
      "ems",
      "even",
      "evenki",
      "ewenic",
      "greenlandic-lang",
      "iku",
      "iku2",
      "iku3",
      "inuinnaqtun",
      "inupiaq",
      "inuvialuktun",
      "jurchen",
      "jurchenic",
      "kalaallisut",
      "kili",
      "manchu",
      "nanai",
      "nanaic",
      "naukan",
      "negidal",
      "northern-tungusic",
      "oroch",
      "orok",
      "oroqen",
      "sirenik",
      "southern-tungusic",
      "udege",
      "udegheic",
      "uilta",
      "ulch",
      "xibe",
      "yuit",
      "yup"
    ]
  },
  Kitsune: {
    // the fox spirit: Ainu + southern Ryukyuan, an archaic and eerie island voice
    categories: ["Afroasiatic", "Ainu", "Japonic", "Niger-Congo", "Nilo-Saharan", "Uto-Aztecan"],
    families: [
      "Ainu",
      "Bantu",
      "Central Sudanic",
      "Chadic",
      "Cushitic",
      "Hokkaido",
      "Kuril",
      "Niger-Congo",
      "Nilo-Saharan",
      "Nilotic",
      "Okinawan Ryukyuan",
      "Piman",
      "Ryukyuan",
      "Saharan",
      "Sakhalin",
      "Southern Ryukyuan",
      "Yaeyama Ryukyuan"
    ],
    isos: [
      "bas",
      "fia",
      "hdy",
      "hokkaido-ainu",
      "kai",
      "kuril-ainu",
      "lgg",
      "macro-yaeyama",
      "miyakoan",
      "mua",
      "nnj",
      "nrb",
      "ntp",
      "nym",
      "okinawan",
      "proto-ainu",
      "proto-hokkaido-kuril",
      "proto-sakhalin",
      "ryukyuan",
      "sakhalin-ainu",
      "yaeyama",
      "yonaguni"
    ]
  },
  Deepkin: {
    // sea-folk: the residual Papuan macro family and the unattributed isolates, an eerie watery sound
    categories: ["Hypothetical", "Papuan"],
    families: [
      "Awin–Pa",
      "Binanderean",
      "Bosavi",
      "Duna–Pogaya",
      "East Strickland",
      "Engan",
      "Gogodala–Suki",
      "Goilalan",
      "Inland Gulf",
      "Isolate",
      "Kayagaric",
      "Kiwaian",
      "Kolopom",
      "Papuan",
      "Proposed Groupings",
      "Turama–Kikorian"
    ],
    isos: [
      "almosan",
      "anz",
      "awin-pa",
      "binanderean",
      "bmu",
      "boq",
      "bosavi",
      "bsa",
      "chukotko-kamchatkan-amuric",
      "den-yeniseian",
      "duna-pogaya",
      "east-strickland",
      "engan-languages",
      "gogodala-suki",
      "goilalan",
      "inland-gulf",
      "karasuk",
      "kayagaric",
      "kgr",
      "kiwaian",
      "kolopom",
      "kto",
      "moraori",
      "mrf",
      "saj",
      "turama-kikorian",
      "uralic-yukaghir",
      "uralo-siberian",
      "wiru"
    ]
  },
  Starspawn: {
    // born of a wish: Yeniseian plus the residual unattributed rows, an archaic star-lit sound
    categories: ["Afroasiatic", "Khoe-Kwadi", "Language isolate", "Niger-Congo", "Yeniseian"],
    families: [
      "Bangime",
      "Bantu",
      "Basque",
      "Burushaski",
      "Cushitic",
      "Haida",
      "Kx'a",
      "Niger-Congo",
      "North Arabian",
      "Northern",
      "Omotic",
      "Southern",
      "Tuareg Berber",
      "Yeniseian"
    ],
    isos: [
      "afb",
      "arin",
      "assan",
      "bangime",
      "burushaski",
      "eus",
      "gmv",
      "haida",
      "jie",
      "kbr",
      "ket",
      "khh",
      "khj",
      "kott",
      "pumpokol",
      "shabo",
      "sid",
      "tmh",
      "wal",
      "yao",
      "yeniseian",
      "yugh"
    ]
  },
  Scions: {
    // children of the gods: the leftovers and the unattributed, deliberately vague and unplaceable
    categories: ["Other", "Romance", "Unclassified"],
    families: ["Dialects", "Eastern", "Old", "Other", "Unclassified", "Western"],
    isos: [
      "cat",
      "central-catalan",
      "eastern-catalan",
      "gardiol",
      "gascon",
      "grossetano",
      "jalaa",
      "kenaboi",
      "kujarge",
      "kwaza",
      "laal",
      "landese",
      "languedocien",
      "limousin",
      "lucchese",
      "mallorcan",
      "mbr",
      "menorcan",
      "mentonasc",
      "mpre",
      "ni-ard",
      "northern-catalan",
      "northwestern-catalan",
      "occitan",
      "old-gallo-romance",
      "omaio",
      "ongota",
      "pes",
      "pesciatino",
      "pisano-livornese",
      "pistoiese",
      "proven-al",
      "ribagor-an",
      "sercquiais",
      "swah",
      "valencian",
      "versiliese",
      "viareggino",
      "vivaro-alpine",
      "western-catalan",
      "xho",
      "xoc-",
      "zul"
    ]
  },
  Seafarer: {
    // the owners Polynesian / Micronesian direction: keeps the whole oceanic macro and cedes Melanesia to Triton
    categories: ["Austronesian", "Micronesian"],
    families: [
      "Chuukic",
      "Gilbertese",
      "Kanak languages",
      "Marshallese",
      "Micronesian",
      "Oceanic",
      "Palauan",
      "Philippine",
      "Pohnpeic",
      "Polynesian",
      "Timoric",
      "Tobian"
    ],
    isos: [
      "aoz",
      "carolinian",
      "chamorro",
      "chk",
      "gil",
      "hawaiian",
      "iranun",
      "kanak",
      "kasiguranin",
      "kiribati",
      "kos",
      "mah",
      "maori",
      "maori-ascii",
      "maranao",
      "marshallese",
      "nauruan",
      "niuean",
      "palauan",
      "pau",
      "piv",
      "pon",
      "rapa-nui",
      "rarotongan",
      "rotuman",
      "tahitian",
      "tokelauan",
      "tongan",
      "tuvaluan",
      "wmh",
      "yap"
    ]
  },
  AnyLanguage: {
    // catch-all fallback; unchanged
    categories: [
      "Afroasiatic",
      "Ainu",
      "Algic",
      "Andamanese",
      "Arauan",
      "Araucanian",
      "Arawakan",
      "Australian Aboriginal",
      "Austroasiatic",
      "Austronesian",
      "Barbacoan",
      "Chapacuran",
      "Chibchan",
      "Chocoan",
      "Chonan",
      "Chukotko-Kamchatkan",
      "Creole",
      "Dravidian",
      "English Creole",
      "Eskimo-Aleut",
      "Germanic",
      "Guahiboan",
      "Hmong-Mien",
      "Indo-Aryan",
      "Indo-European",
      "Indo-Iranian",
      "Iranian",
      "Isolate",
      "Japonic",
      "Jivaroan",
      "Kartvelian",
      "Khoe-Kwadi",
      "Kiowa–Tanoan",
      "Koreanic",
      "Kusunda isolate",
      "Language isolate",
      "Macro-Jê",
      "Mayan",
      "Micronesian",
      "Mixed language",
      "Mongolic",
      "Na-Dene",
      "Nadahup",
      "Niger-Congo",
      "Nilo-Saharan",
      "Northeast Caucasian",
      "Northwest Caucasian",
      "Oto-Manguean",
      "Paezan",
      "Panoan",
      "Papuan",
      "Pidgin",
      "Quechuan",
      "Romance",
      "Sino-Tibetan",
      "Siouan",
      "Slavic",
      "Songhay",
      "Tacanan",
      "Tai-Kadai",
      "Tucanoan",
      "Tungusic",
      "Tupian",
      "Turkic",
      "Unclassified",
      "Uralic",
      "Uto-Aztecan",
      "Witotoan",
      "Yukaghir",
      "Yuman"
    ],
    families: [
      "Adamawa",
      "Akan",
      "Albanian",
      "Algonquian",
      "Alor–Pantar",
      "Ancient Koreanic",
      "Andoque",
      "Angan",
      "Angkuic",
      "Arabic-based",
      "Aragonese",
      "Arauan",
      "Arawakan",
      "Armenian",
      "Arpitan",
      "Asmat–Kamoro",
      "Assamese-based",
      "Astur-Leonese",
      "Athabaskan",
      "Atlantic-Congo",
      "Australian Aboriginal",
      "Austronesian",
      "Avar",
      "Bahengic",
      "Bahnaric",
      "Bai",
      "Baltic",
      "Bantu",
      "Barbacoan",
      "Basque",
      "Bayono–Awbono",
      "Bengali–Assamese",
      "Berber",
      "Bihari",
      "Binanderean",
      "Bodish",
      "Boro-Garo",
      "Bosavi",
      "Burmish",
      "Burushaski",
      "Buryat",
      "Canadian",
      "Cayubaba",
      "Celtic",
      "Central Asian",
      "Central Dravidian",
      "Central Italian",
      "Central Pahari",
      "Chadic",
      "Chak",
      "Chamorro",
      "Chapacuran",
      "Chepangic",
      "Chibchan",
      "Chimbu–Wahgi",
      "Chiquitano",
      "Chocoan",
      "Chonan",
      "Circassian",
      "Cofán",
      "Corsican",
      "Cushitic",
      "Cáhita",
      "Daco-Romanian",
      "Dalmatian Romance",
      "Dani",
      "Dardic",
      "Dargin",
      "Daur",
      "Dialects",
      "Doteli",
      "Dravidian",
      "Duna–Pogaya",
      "Dutch-based",
      "Early Modern Korean",
      "East Semitic",
      "East Strickland",
      "East Timor Papuan",
      "Eastern",
      "Eastern Berber",
      "Eastern Dialects",
      "Eastern Khanty",
      "Eastern Lombard",
      "Eastern Mansi",
      "Eastern Pahari",
      "Eastern Romance",
      "Eastern South Slavic",
      "Egyptian Arabic",
      "Emilian-Romagnol",
      "Enets",
      "Engan",
      "English Creole",
      "English-based",
      "Eskimo-Aleut",
      "Ewenic",
      "Extinct",
      "Far Eastern Khanty",
      "Finnic",
      "Finnish",
      "Finno-Ugric",
      "Formosan",
      "French-based",
      "Friulian",
      "Fulniô",
      "Fur",
      "Galician",
      "Gallo-Italic",
      "Ga–Dangme",
      "Gbe",
      "Germanic",
      "Gilbertese",
      "Gogodala–Suki",
      "Goilalan",
      "Grassfields Bantoid",
      "Great Andamanese",
      "Greater Awyu",
      "Guahiboan",
      "Gumuz",
      "Gurindji Kriol",
      "Gurungic",
      "Gurunsi",
      "Gyalrongic",
      "Hadza",
      "Haida",
      "Hakka",
      "Harari-Argobba Ethio-Semitic",
      "Hill Mari",
      "Hindustani",
      "Historical Mongolic",
      "Hlai",
      "Hmong-Mien",
      "Hmongic",
      "Hmuic",
      "Hokkaido",
      "Hopi",
      "Huave",
      "Hungarian",
      "Inari Sami",
      "Indo-Aryan",
      "Indo-Iranian",
      "Ingrian",
      "Inland Gulf",
      "Inuit",
      "Iranian",
      "Istriot",
      "Italian",
      "Itelmen",
      "Itonama",
      "Japanese dialects",
      "Japanese-based",
      "Jivaroan",
      "Judeo-Italian",
      "Judeo-Spanish",
      "Kainantu–Goroka",
      "Kam-Sui",
      "Kamas",
      "Kamchatkan",
      "Kanak languages",
      "Karluk Turkic",
      "Kartvelian",
      "Katuic",
      "Kayagaric",
      "Khasian",
      "Khasic",
      "Khmeric",
      "Khoe-Kwadi",
      "Kildin Sami",
      "Kiowa–Tanoan",
      "Kipchak Turkic",
      "Kiranti",
      "Kolopom",
      "Komi-Permyak",
      "Komi-Yodzyak",
      "Komi-Zyryan",
      "Kongo-based",
      "Koreanic",
      "Kra",
      "Krio",
      "Kru",
      "Kuki-Chin",
      "Kuril",
      "Kusunda",
      "Kutubuan",
      "Kwerbic",
      "Kx'a",
      "Latin",
      "Latin American",
      "Lechitic",
      "Leco",
      "Levantine",
      "Lezgian",
      "Ligurian",
      "Livonian",
      "Ludic",
      "Lule Sami",
      "Macro-Jê",
      "Magaric",
      "Maghrebi",
      "Malay-based",
      "Malayo-Polynesian",
      "Mandarin",
      "Mande",
      "Mapuche",
      "Mapudungun",
      "Marshallese",
      "Mayan",
      "Mesopotamian",
      "Micronesian",
      "Middle Korean",
      "Mienic",
      "Min",
      "Mixed language",
      "Mixtecan",
      "Modern Korean",
      "Modern South Arabian",
      "Mongolic",
      "Munda",
      "Na-Dene",
      "Nadahup",
      "Naga",
      "Nakh",
      "Neapolitan",
      "Newaric",
      "Nicobarese",
      "Niger-Congo",
      "Nilo-Saharan",
      "Nilotic",
      "North Estonian",
      "North Germanic",
      "Northeastern Neo-Aramaic",
      "Northern Berber",
      "Northern Khanty",
      "Northern Sami",
      "Northern Songhay",
      "Northwestern Mari",
      "Oceanic",
      "Oghuz Turkic",
      "Oirat-Kalmyk",
      "Ok–Oksapmin",
      "Old Aramaic",
      "Old Korean",
      "Old South Arabian",
      "Omotic",
      "Ongan",
      "Oto-Manguean",
      "Oïl Dialects",
      "Paezan",
      "Pamir",
      "Paniai Lakes",
      "Panoan",
      "Para-Mongolic",
      "Pearic",
      "Peninsular",
      "Persian",
      "Philippine",
      "Pidgin",
      "Piedmontese",
      "Polynesian",
      "Portuguese",
      "Portuguese-based",
      "Puinave",
      "Purepecha",
      "Qiangic",
      "Quechuan",
      "Rajasthani",
      "Romance",
      "Romansh",
      "Saharan",
      "Sami",
      "Sardinian",
      "Sardo-Corsican",
      "Semitic",
      "Senegambian (Atlantic)",
      "Sepik",
      "Sheic",
      "Shirongolic",
      "Siberian Turkic",
      "Sicilian",
      "Sinitic",
      "Sino-Tibetan",
      "Siouan",
      "Slavic",
      "Songhai",
      "Sorbian",
      "South Canaanite",
      "South Dravidian",
      "South Estonian",
      "South-Central Dravidian",
      "Southeast Papuan",
      "Southeastern Dialects",
      "Southern Khanty",
      "Southern Mansi",
      "Southern Mongolic",
      "Southern Ryukyuan",
      "Southern Sami",
      "Southwestern Lombard",
      "Spanish",
      "Spanish-based",
      "Tacanan",
      "Tai",
      "Tai-Kadai",
      "Tamangic",
      "Tani",
      "Tarascan",
      "Tibetic",
      "Tibeto-Burman",
      "Timor–Alor–Pantar",
      "Tivoid",
      "Trans-New Guinea",
      "Tsimané",
      "Tucanoan",
      "Tupi-Guarani",
      "Turama–Kikorian",
      "Tuscan",
      "US",
      "Ubangian",
      "Unclassified",
      "Unclassified Dravidian",
      "Unclassified Uralic",
      "Venetian",
      "West Bomberai",
      "West Germanic",
      "West Himalayish",
      "West Hmongic",
      "Western Aramaic",
      "Western Dialects",
      "Western Hindi",
      "Western Khanty",
      "Western Lombard",
      "Western Mansi",
      "Western Pahari",
      "Western South Slavic",
      "Witotoan",
      "Yoruboid",
      "Yuman",
      "Yupik",
      "Zapotecan",
      "Zenati Berber",
      "Zhuang"
    ],
    isos: [
      "a-ou",
      "aab",
      "aimele",
      "aiton",
      "akj",
      "akm",
      "albanian",
      "amuzgo",
      "angami-pochuri",
      "ano",
      "anq",
      "ao",
      "aot",
      "aph",
      "argobba",
      "armazic",
      "armenian",
      "arn",
      "arq",
      "arunachal",
      "ary",
      "arz",
      "ashaninka",
      "assyrian",
      "assyrian-neo-aramaic",
      "asturian",
      "atlym",
      "atlym-nizyam-khanty",
      "aws-nian",
      "ba-ari",
      "babylonian",
      "baca",
      "baghdadi-arabic",
      "bahraini-gulf-arabic",
      "bahrani-arabic",
      "bai",
      "baisha-hlai",
      "bakhtiari-arabic",
      "banat",
      "baoting-hlai",
      "bap",
      "baram-thangmi",
      "bareqi-arabic",
      "barwar",
      "barzani-jewish-neo-aramaic",
      "basap",
      "bashkir",
      "basum",
      "bathari",
      "be-jizhao",
      "be-lang",
      "beami",
      "bee",
      "bel",
      "berjozov",
      "betanure-jewish-neo-aramaic",
      "betawi",
      "bhj",
      "bhojpuri",
      "bhujel",
      "biblical-aramaic",
      "biblical-hebrew",
      "bidau-creole-portuguese",
      "bjarmian-finnic",
      "bodo",
      "bohtan-neo-aramaic",
      "bonan-kangjia",
      "bono-nigeria",
      "boon",
      "boor",
      "boro-garo",
      "bouyei",
      "bozal-spanish",
      "boze",
      "bozo",
      "bph",
      "bpy",
      "brx",
      "bube",
      "budza",
      "bukharian-arabic",
      "bukovinian",
      "bukusu",
      "bul",
      "buli",
      "bulu",
      "bum",
      "bunak",
      "burmo-qiangic",
      "buru-angwe",
      "burushaski",
      "buruwai",
      "buryat",
      "busa",
      "bushong",
      "bustocco-legnanese",
      "buu",
      "buyu",
      "bwela",
      "bwi",
      "byw",
      "bzyb",
      "cai-long",
      "caijia",
      "caka",
      "campidanese",
      "cao-lan",
      "cas",
      "castilian",
      "castrapo",
      "cat",
      "caw",
      "cax",
      "cdm",
      "cebaara",
      "central-aragonese",
      "central-atlas-tamazight",
      "central-banda",
      "central-ludic",
      "central-min",
      "central-tai",
      "central-tibeto-burman",
      "central-zapotec",
      "cha",
      "chamdo",
      "champenois",
      "changjiang-hlai",
      "chavacano",
      "che",
      "chechen",
      "chenchu",
      "chepang",
      "chepangic",
      "cheso",
      "chewa",
      "chf",
      "chichewa",
      "chilean-spanish",
      "chilote",
      "chimbu",
      "chinantec",
      "chipilo",
      "chopi",
      "chorotega",
      "choshuenco",
      "christian-palestinian-aramaic",
      "chung",
      "chusovaya",
      "chuvan",
      "chx",
      "cilentan",
      "cingali",
      "circassian",
      "ciwogai",
      "cja",
      "cji",
      "cjy",
      "ckb",
      "ckh",
      "classical-mongolian",
      "clk",
      "colombian-spanish",
      "comorian",
      "con",
      "cook-islands-maori-pidgin",
      "cornish",
      "cosentino",
      "cotentinais",
      "courland-livonian",
      "coz",
      "cpx",
      "cre3",
      "cree",
      "cremish",
      "cremun-s",
      "cri-ana",
      "crimean-tatar",
      "cro",
      "ctn",
      "cub",
      "cun-hlai",
      "cur",
      "cux",
      "cyb",
      "cym",
      "cym2",
      "cym3",
      "cypriot-maronite-arabic",
      "daco-romanian",
      "dadeldhuri-doteli",
      "daga",
      "dagaare",
      "dagbani",
      "dagur",
      "dai-zhuang",
      "dak",
      "dak2",
      "dakota",
      "dali-bai",
      "dalmatian",
      "daman",
      "daman-and-diu-portuguese-creole",
      "damu",
      "dan",
      "dangaleat",
      "dangme",
      "dani",
      "danish",
      "dano",
      "dap",
      "dar",
      "darchuleli-doteli",
      "dargwa",
      "dari",
      "darkhad",
      "dass",
      "daur",
      "daza",
      "dby",
      "dciriku",
      "ddo",
      "defaka",
      "deh",
      "dem",
      "dendi",
      "dengese",
      "deno",
      "densar",
      "derung",
      "des",
      "deu",
      "dgr",
      "dhimal",
      "dhimalish",
      "dhuleli",
      "dida",
      "dih",
      "dili-malay",
      "dima",
      "dinka",
      "diri",
      "dis",
      "djimini",
      "doghose",
      "dogoso",
      "dogri",
      "doko",
      "domu",
      "dongo",
      "dongxiang",
      "dorbet-oirat",
      "doromu",
      "douiret",
      "dre",
      "drq",
      "duan",
      "duna-pogaya",
      "dura-tandrange",
      "dus",
      "duvle-wano-pidgin",
      "dyula",
      "dzando",
      "dzao-min",
      "dzo",
      "dzodinka",
      "dzongkha",
      "e",
      "e-tai",
      "east-strickland",
      "east-timor-papuan",
      "east-zenati",
      "eastern-aragonese",
      "eastern-himalayas",
      "eastern-indonesian-malay",
      "eastern-itelmen",
      "eastern-lombard",
      "eastern-mansi",
      "eastern-min",
      "eastern-nonmetafonetica",
      "eastern-romanian",
      "eastern-yugur",
      "ebira",
      "ecuadorian-spanish",
      "egl",
      "egyptian-arabic",
      "ekari",
      "ekherit-bulagat-buryat",
      "ekhirit-bulagat-buryat",
      "ekoka-kung",
      "el-molo",
      "eman",
      "emg",
      "emilian",
      "ems",
      "engan-languages",
      "enm",
      "ennese",
      "eonavian",
      "equatoguinean-spanish",
      "eravallan",
      "ersuic",
      "ese",
      "ese-omie",
      "esimbi",
      "eskimo-trade-jargon",
      "est",
      "estremenho",
      "eton",
      "european-portuguese",
      "eus",
      "eus2",
      "evant",
      "even",
      "ewage",
      "ewe",
      "ewo",
      "ewondo",
      "ewondo-populaire",
      "extremaduran",
      "eyak",
      "fabriano",
      "faetar",
      "faiwol",
      "fala",
      "fali-of-mubi",
      "fanagalo",
      "fang-cameroon",
      "fang-equatorial-guinea-and-gabon",
      "fanji",
      "fao",
      "farefare",
      "faroese",
      "fasu",
      "fataluku",
      "favorlang",
      "fe-fe",
      "fembe",
      "ferrarese",
      "ff",
      "fij",
      "fijian",
      "filipino",
      "fin",
      "fingelska",
      "finnmark-sami",
      "fio",
      "fiuman",
      "fiwaga",
      "florentine",
      "flores-lembata",
      "fogo-creole",
      "fon",
      "fongoro",
      "fore",
      "forest-enets",
      "forlivese",
      "formosan",
      "fornes",
      "forro-creole",
      "fos",
      "fra",
      "frainc-comtou",
      "fran-ais-tirailleur",
      "franco-italian",
      "franco-ontarian",
      "franco-proven-al",
      "franglish",
      "french-guianese-creole",
      "frenchville-french",
      "frisian",
      "friulian-lang",
      "fub",
      "fuc",
      "fue",
      "fuh",
      "fun",
      "fur",
      "furu",
      "fuyug",
      "fyer",
      "g-llivare",
      "g-ui",
      "gaanda",
      "gadal",
      "gadang",
      "gadsup",
      "gag",
      "gagauz",
      "gahuku",
      "galambu",
      "galician",
      "galician-asturian",
      "gallo",
      "gallo-italic-of-basilicata",
      "gallo-italic-of-sicily",
      "gallo-picene",
      "gallurese",
      "gamilaraay",
      "gan",
      "gardiol",
      "garifuna",
      "gascon",
      "gaulish",
      "gaumais",
      "gauwa",
      "gawar",
      "gaya-korean",
      "gdo",
      "gejia",
      "gende",
      "genoese",
      "georgian",
      "gera",
      "ggg",
      "ggk",
      "ghadames",
      "ghanaian-pidgin-english",
      "ghe",
      "ghomara",
      "ghr",
      "gidar",
      "gig",
      "gimi",
      "gin",
      "ginuman",
      "githabul",
      "gjk",
      "gju",
      "gla",
      "gla2",
      "glavda",
      "gobasi",
      "goemai",
      "gogodala",
      "gogodala-suki",
      "goguryeo-korean",
      "goilalan",
      "goji",
      "golin",
      "gondi",
      "gong",
      "gonga",
      "gorap",
      "goroka",
      "goryeo-korean",
      "grass-koiari",
      "greater-awyu",
      "greater-barito",
      "greater-central-philippine",
      "greater-magaric",
      "greater-north-borneo",
      "greenlandic-lang",
      "grenadian-creole-english",
      "grenadian-creole-french",
      "grossetano",
      "grt",
      "gsw",
      "guanche",
      "guarani",
      "guc",
      "gude",
      "gudu",
      "guduf-gava",
      "guern-siais",
      "gug",
      "guh",
      "guinea-bissau-creole",
      "guiyang",
      "gujarati",
      "gullah",
      "gum",
      "gumuz",
      "guo",
      "gurara",
      "gurindji",
      "gurindji-kriol",
      "guruntum",
      "guugu-yimidhirr",
      "guyanese-creole",
      "gvc",
      "gvj",
      "gvoko",
      "gwandara",
      "gwc",
      "gwf",
      "gwi",
      "gwt",
      "gyalrong",
      "gyalrongic",
      "gyr",
      "ha-em",
      "haa",
      "hachijo",
      "hadza",
      "haflong-hindi",
      "hagei",
      "hagen",
      "haida",
      "hailar-dagur",
      "hain",
      "hainanese",
      "haitian-creole",
      "haj",
      "hak",
      "haketia",
      "hakka",
      "halang-bahnaric",
      "halmahera-sea",
      "hamtai",
      "han-samhan",
      "hani",
      "hau2",
      "hausa",
      "hausa-gwandara",
      "haw",
      "haw2",
      "hawaiian",
      "hawaiian-pidgin",
      "hawaiian-pidgin-english",
      "haz",
      "hdi",
      "heart-tavastian",
      "hevaha",
      "hezhang-buyi",
      "hezhou",
      "highland-east-cushitic",
      "hiligaynon",
      "hill-mari",
      "hin",
      "hin2",
      "hina",
      "hindustani",
      "hinglish",
      "hlai",
      "hlb",
      "hm-nai",
      "hmn",
      "hmn2",
      "hmong",
      "hmu",
      "hnd",
      "hne",
      "hno",
      "ho-munda",
      "hoanya",
      "hoc",
      "hoi",
      "hoia-hoia",
      "hoj",
      "hokchiu",
      "hokkaido-ainu",
      "holiya",
      "hollola",
      "holma",
      "hop",
      "hopi",
      "horpa",
      "hozo",
      "hre",
      "hrusish",
      "hsn",
      "hto",
      "huastec",
      "huave",
      "huba",
      "hui",
      "huichol",
      "huishui",
      "huli",
      "humene",
      "hun",
      "hun2",
      "hupla",
      "hwana",
      "hya",
      "iban",
      "ibanag",
      "idu-taraon",
      "iha",
      "iii",
      "iitti",
      "ikobi",
      "iku",
      "iku2",
      "iku3",
      "ili-turki",
      "ilocano",
      "ilocano-native-speakers",
      "inari-sami",
      "indian-english",
      "indo-portuguese",
      "indo-portuguese-creole-of-bombay",
      "indonesian",
      "ing",
      "ingrian",
      "inland-gulf",
      "innu",
      "inoke-yate",
      "insular-estonian",
      "intemelio",
      "international-sign",
      "inuinnaqtun",
      "inuktitut-english-pidgin",
      "inupiaq",
      "inuvialuktun",
      "ipiko",
      "ipili",
      "iranian-persian",
      "iranun",
      "irpino",
      "irula",
      "isabi",
      "isl",
      "isthmus-zapotec",
      "istriot",
      "ita",
      "italian-eritrean",
      "italo-australian",
      "italo-paulista",
      "itelmen",
      "ito",
      "itza",
      "iu-mien",
      "iwaidja",
      "ixl",
      "izhma",
      "iznasen",
      "j-kk-kaska",
      "j-llivaara",
      "j-mtland",
      "jac",
      "jalaa",
      "jamaican-maroon-creole",
      "japanese-bamboo-english",
      "japanese-pidgin-english",
      "jara",
      "jauer",
      "jav",
      "jav2",
      "javanese",
      "javindo",
      "jdg",
      "jee",
      "jeh-bahnaric",
      "jeju",
      "jelkung",
      "jerba-berber",
      "jersey-dutch",
      "jeseri",
      "jiaoliao-mandarin",
      "jibyal",
      "jilbe",
      "jimi",
      "jimi-language-cameroon",
      "jimi-language-nigeria",
      "jin",
      "jina",
      "jingpho-luish",
      "jiv",
      "jml",
      "jnd",
      "jog",
      "jonkor",
      "joseon-early-modern-korean",
      "joseon-middle-korean",
      "joseon-modern-korean",
      "joual",
      "jru-bahnaric",
      "ju-chadic",
      "ju-hoan",
      "juba-arabic",
      "judeo-aragonese",
      "judeo-berber",
      "judeo-italian",
      "judeo-piedmontese",
      "jugan",
      "juk-bahnaric",
      "jukonda",
      "jul",
      "jup",
      "kaa",
      "kabalai",
      "kabyle",
      "kac",
      "kaco-bahnaric",
      "kadar-dravidian",
      "kae",
      "kaera",
      "kafoa",
      "kaguel",
      "kaikadi",
      "kaili-wolio",
      "kainantu",
      "kainuu",
      "kainuu-sami",
      "kajakse",
      "kakkala",
      "kalamian",
      "kalanadi",
      "kalmyk",
      "kaluli",
      "kam-dong",
      "kam-sui",
      "kamang",
      "kamas",
      "kamasa",
      "kamassian-proper",
      "kambaira",
      "kamberau",
      "kamchatkan",
      "kamono",
      "kamoro",
      "kamwe",
      "kan2",
      "kanak",
      "kanakuru",
      "kanamari",
      "kanbun-kundoku",
      "kandawo",
      "kanikkaran",
      "kannada",
      "kanuri",
      "kapampangan",
      "kaqchikel",
      "kar",
      "karai-karai",
      "karbi",
      "karip-na-french-creole",
      "kariya",
      "kas",
      "kashinawa",
      "kashmiri",
      "kashubian",
      "kasiguranin",
      "kasong",
      "katchal-nicobarese",
      "kathu",
      "kuf",
      "katua-bahnaric",
      "kau",
      "kawacha",
      "kayagar-kaygir",
      "kayagaric",
      "kayah",
      "kayan-murik",
      "kayong-bahnaric",
      "kaytetye",
      "kazym",
      "kbu",
      "kdq",
      "kei-tanimbar",
      "kemi",
      "kemi-sami",
      "kemij-rvi",
      "kenaboi",
      "kera-chadic",
      "keuruu-evij-rvi",
      "kewa",
      "kfj",
      "kfq",
      "kfr",
      "kfy",
      "kgg",
      "kgk",
      "kgp",
      "kha",
      "kha-lyngngam",
      "kha-native-speakers",
      "kha-pnar",
      "kha-war",
      "kha2",
      "khakas",
      "khalkha",
      "khamnigan",
      "khams-tibetan",
      "khamti",
      "kharchin-khorchin",
      "kharia",
      "khirwar",
      "khk",
      "khm",
      "khm-khe",
      "kho-bwa",
      "kholok",
      "khortha",
      "khp",
      "khroskyabs",
      "khw",
      "kiautschou-pidgin-german",
      "kiche",
      "kichwa",
      "kij",
      "kija",
      "kikar",
      "kiknur",
      "kildin-sami",
      "kim-mun",
      "kimaama-kimaghama",
      "kimre",
      "kio",
      "kiong-nai",
      "kip",
      "kir-balar",
      "kiribati",
      "kirya-konzal",
      "kituba",
      "kkt",
      "klb",
      "klr",
      "kls",
      "knj",
      "kochevo",
      "kodava",
      "koenoem",
      "kog",
      "koibal",
      "kok",
      "kolami",
      "kom",
      "kombai-wanggom",
      "komi-permyak",
      "komi-yodzyak",
      "komi-zyryan",
      "komyandaret",
      "konai",
      "konda-dravidian",
      "konyak",
      "kopkaka",
      "koraga",
      "korean-bamboo-english",
      "korlai-portuguese-creole",
      "kos",
      "kosa-kama",
      "kowiai",
      "koya",
      "kozymodemyan",
      "kra",
      "kra-family",
      "kraasna",
      "krasnojarsk-khanty",
      "kri",
      "kri2",
      "krio",
      "kristang",
      "kru-pidgin-english",
      "kte",
      "kudymkar-inva",
      "kujarge",
      "kukatja",
      "kuki-chin",
      "kuku-yalanji",
      "kum",
      "kunwinjku",
      "kupang-malay",
      "kur2",
      "kuril-ainu",
      "kuu",
      "kuuk-thaayore",
      "kvx",
      "kwaza",
      "kwi",
      "kwinti",
      "kwoma-manambu-pidgin",
      "kyakhta-russian-chinese-pidgin",
      "kyowa-go",
      "kyrgyz",
      "kyw",
      "kzi",
      "l-ngua-geral-paulista",
      "laal",
      "lac",
      "lachi",
      "laha",
      "lahu",
      "lakkia-kam-sui",
      "lampung",
      "land-dayak",
      "landese",
      "lao-nyo",
      "lat",
      "latvian",
      "law",
      "lec",
      "leivu",
      "lemi-region",
      "lhokpu",
      "ligurian",
      "lij",
      "likrisovskoe",
      "lipsha",
      "lisan-al-gharbi",
      "lld",
      "lmh",
      "lmo",
      "lolo-burmese",
      "longjia-luren",
      "lower-demjanka",
      "lower-inva",
      "lower-konda",
      "lower-lozva",
      "lower-sorbian",
      "lower-vychegda",
      "lowland-east-cushitic",
      "loyalties-new-caledonia",
      "lrg",
      "ludic",
      "ludza",
      "luobohe",
      "luritja",
      "luza-letka",
      "macedonian",
      "macro-somali",
      "macro-yaeyama",
      "mad",
      "madurese",
      "magar",
      "maghrebi-arabic",
      "maguindanao",
      "mah",
      "mahakiranti",
      "makassar-branch",
      "malagasy",
      "mam",
      "mandarin",
      "mao-omotic",
      "mapudungun",
      "matlatzinca",
      "matmata-berber",
      "mayo",
      "mazatec",
      "mdf",
      "meitei",
      "merya",
      "mhu",
      "middle-botnian",
      "miju-meyor",
      "min",
      "mixe",
      "mkd",
      "mondzish",
      "mongghuor",
      "montenegrin",
      "moyfaw",
      "mozabite",
      "mruic",
      "mulgi",
      "myang-zhuang",
      "mzab-wargla",
      "nadou",
      "nafusi",
      "nagamese",
      "nam",
      "ncd",
      "newaric",
      "njh",
      "njo",
      "nmm",
      "noa",
      "nong-zhuang",
      "north-omotic",
      "northern-berber",
      "northern-ludic",
      "northern-romanian",
      "northern-thai",
      "novarese",
      "nph",
      "nu",
      "nung-tai",
      "nusu",
      "old-church-slavonic",
      "old-khitan",
      "ole",
      "ona",
      "onobasulu",
      "ossetian",
      "otomi",
      "palenquero",
      "papora",
      "pav",
      "pbb",
      "phake",
      "phuan",
      "pinghua",
      "ppu",
      "proper-southeastern",
      "proto-eastern-romance",
      "proto-karenic",
      "proto-min",
      "proto-tibeto-burman",
      "pui",
      "puroik",
      "pzh",
      "qiangic",
      "raa",
      "rah",
      "raq",
      "rav",
      "ron",
      "rouruo",
      "rukai-budai-labuan-taromak",
      "rukai-maga-tona",
      "ruo",
      "ruq",
      "sal",
      "sapa",
      "sardo-corsican",
      "shao-jiang-min",
      "shipibo-conibo",
      "shirwi",
      "sierra-juarez-zapotec",
      "slk",
      "son",
      "sonia",
      "southern-khanty",
      "southern-tai",
      "southwestern-tai",
      "standard-zhuang",
      "suz",
      "tai",
      "tai-dam",
      "tai-hang-tong",
      "tai-khang",
      "tai-long",
      "tai-meuay",
      "tai-nuea",
      "tai-thanh",
      "tai-yo",
      "taman",
      "tangkhulic",
      "tani",
      "tay-tac",
      "tdh",
      "tembo",
      "tetela",
      "tge",
      "thai-siamese",
      "ths",
      "tibeto-burman",
      "tij",
      "tikar",
      "tiro",
      "tiv",
      "tonga-malawi",
      "tonga-mozambique",
      "totela",
      "toto",
      "transylvanian",
      "tripuri",
      "tshangla",
      "tshiluba",
      "tsn",
      "tsn2",
      "tsonga-or-xitsonga",
      "tsotsitaal-and-camtho-aka-iscamtho",
      "tswana",
      "tsz",
      "tumbuka",
      "turung",
      "tyap",
      "umb",
      "upper-demjanka",
      "vartovskoe",
      "vay",
      "ven",
      "venda",
      "viemo",
      "viti",
      "vori",
      "voro",
      "wallachian",
      "wannu",
      "wapan",
      "werni",
      "western-himalayas",
      "western-neo-aramaic",
      "wolof",
      "wu",
      "wushi",
      "xho2",
      "yalunka",
      "yamba",
      "yaminawa",
      "ybi",
      "yemba",
      "yeyi",
      "yi",
      "yong",
      "yor",
      "yor2",
      "yoruba",
      "yuanmen-hlai",
      "zande",
      "zapotec",
      "zhire",
      "zho",
      "zhoa",
      "zulu"
    ]
  },
  Human: {
    // catch-all baseline; unchanged
    categories: [
      "Afroasiatic",
      "Ainu",
      "Algic",
      "Amazonian",
      "Andamanese",
      "Arauan",
      "Araucanian",
      "Arawakan",
      "Australian Aboriginal",
      "Austroasiatic",
      "Austronesian",
      "Barbacoan",
      "Cariban",
      "Chapacuran",
      "Chibchan",
      "Chimilan",
      "Chukotko-Kamchatkan",
      "Creole",
      "Dravidian",
      "Enlhet-Enenlhet",
      "Eskimo-Aleut",
      "Germanic",
      "Guahiboan",
      "Hmong-Mien",
      "Indo-Aryan",
      "Indo-European",
      "Iranian",
      "Iroquoian",
      "Japonic",
      "Kartvelian",
      "Khoe-Kwadi",
      "Koreanic",
      "Language isolate",
      "Macro-Jê",
      "Matacoan",
      "Mayan",
      "Micronesian",
      "Mixed",
      "Mixed language",
      "Mongolic",
      "Muskogean",
      "Na-Dene",
      "Nadahup",
      "Niger-Congo",
      "Nilo-Saharan",
      "Northeast Caucasian",
      "Northwest Caucasian",
      "Oto-Manguean",
      "Papuan",
      "Pidgin",
      "Romance",
      "Sino-Tibetan",
      "Slavic",
      "Tacanan",
      "Tai-Kadai",
      "Ticuna–Yuri",
      "Tucanoan",
      "Tungusic",
      "Tupian",
      "Turkic",
      "Unclassified",
      "Uralic",
      "Uto-Aztecan",
      "Witotoan",
      "Yeniseian",
      "Yuman",
      "Zamucoan"
    ],
    families: [
      "Abkhaz",
      "Ainu",
      "Akan",
      "Albanian",
      "Aleut",
      "Algonquian",
      "Alor–Pantar",
      "Andoque",
      "Angan",
      "Anim",
      "Arabic",
      "Aragonese",
      "Aramaic",
      "Arauan",
      "Arawakan",
      "Armenian",
      "Arpitan",
      "Aslian",
      "Asmat–Kamoro",
      "Astur-Leonese",
      "Athabaskan",
      "Atlantic-Congo",
      "Atlas Berber",
      "Australian Aboriginal",
      "Austroasiatic",
      "Austronesian",
      "Avar",
      "Awin–Pa",
      "Aymaran",
      "Bahnaric",
      "Bai",
      "Balochi",
      "Bangime",
      "Bantu",
      "Baoanic",
      "Barbacoan",
      "Basque",
      "Bayono–Awbono",
      "Bengali–Assamese",
      "Berber",
      "Berta",
      "Bihari",
      "Binanderean",
      "Bodish",
      "Bolze",
      "Boro-Garo",
      "Bosavi",
      "Burmish",
      "Buryat",
      "Bu–Nao",
      "Calabrian",
      "Camsa",
      "Canadian",
      "Cariban",
      "Catalan",
      "Cayubaba",
      "Celtic",
      "Central Dravidian",
      "Central Italian",
      "Central Pahari",
      "Central Solomons",
      "Central Sudanic",
      "Chadic",
      "Chak",
      "Chamorro",
      "Chapacuran",
      "Chepangic",
      "Chibchan",
      "Chimbu–Wahgi",
      "Chimilan",
      "Chinese-based",
      "Chiquitano",
      "Chukotkan",
      "Chukotko-Kamchatkan",
      "Chuukic",
      "Circassian",
      "Cofán",
      "Core Mansi",
      "Corsican",
      "Cushitic",
      "Czech-Slovak",
      "Daco-Romanian",
      "Dani",
      "Daur",
      "Dialects",
      "Doteli",
      "Duna–Pogaya",
      "Dutch-based",
      "Early Modern Korean",
      "East Semitic",
      "East Slavic",
      "East Strickland",
      "Eastern",
      "Eastern Berber",
      "Eastern Dialects",
      "Eastern Hindi",
      "Eastern Indo-Aryan",
      "Eastern Khanty",
      "Eastern Lombard",
      "Eastern Mansi",
      "Eastern Mari",
      "Eastern Romance",
      "Eastern South Slavic",
      "Egyptian",
      "Egypto-Sudanic",
      "Emilian-Romagnol",
      "Enets",
      "Engan",
      "English-based",
      "Enlhet-Enenlhet",
      "Erzya",
      "Ewenic",
      "Far Eastern Khanty",
      "Finnic",
      "Finnish",
      "Finno-Ugric",
      "Formosan",
      "French-based",
      "Fur",
      "Gascon Occitan",
      "Georgian dialects",
      "Germanic",
      "Gilbertese",
      "Gogodala–Suki",
      "Goilalan",
      "Grassfields Bantoid",
      "Great Andamanese",
      "Greater Awyu",
      "Guahiboan",
      "Gur",
      "Gurungic",
      "Gurunsi",
      "Gyalrongic",
      "Hakka",
      "Harari-Argobba Ethio-Semitic",
      "Hellenic",
      "Hill Mari",
      "Hlai",
      "Hmong-Mien",
      "Hokkaido",
      "Hopi",
      "Hungarian",
      "Inari Sami",
      "Indo-Aryan",
      "Ingrian",
      "Inland Gulf",
      "Inuit",
      "Iranian",
      "Iroquoian",
      "Isolate",
      "Japanese-based",
      "Judeo-Italian",
      "Jurchenic",
      "Kainantu–Goroka",
      "Kam-Sui",
      "Katuic",
      "Kayagaric",
      "Khasic",
      "Khoe-Kwadi",
      "Kipchak Turkic",
      "Kiranti",
      "Kiwaian",
      "Komi-Permyak",
      "Komi-Yodzyak",
      "Komi-Zyryan",
      "Koreanic",
      "Kra",
      "Kru",
      "Kuki-Chin",
      "Kunama",
      "Kuril",
      "Kutubuan",
      "Kwomtari",
      "Kx'a",
      "Ladin",
      "Latin",
      "Latin American",
      "Lechitic",
      "Levantine",
      "Ligurian",
      "Livonian",
      "Ludic",
      "Lule Sami",
      "Maban",
      "Macro-Jê",
      "Magaric",
      "Maghrebi",
      "Malay-based",
      "Malayo-Polynesian",
      "Mandarin",
      "Mande",
      "Manding",
      "Mapuche",
      "Mapudungun",
      "Matacoan",
      "Mayan",
      "Mel",
      "Mesopotamian",
      "Micronesian",
      "Middle Korean",
      "Mienic",
      "Min",
      "Mixed",
      "Mixed language",
      "Mixtecan",
      "Moksha",
      "Mongolic",
      "Movima",
      "Mozarabic",
      "Munda",
      "Muran",
      "Muskogean",
      "Nadahup",
      "Naga",
      "Neapolitan",
      "Nenets",
      "Newaric",
      "Nganasan",
      "Nicobarese",
      "Niger-Congo",
      "Nihali",
      "Nilo-Saharan",
      "North Arabian",
      "North Dravidian",
      "North Estonian",
      "North Ethiopic",
      "North Germanic",
      "Northern Khanty",
      "Northern Ryukyuan",
      "Northern Sami",
      "Northwestern Mari",
      "Numic",
      "Occitan",
      "Oceanic",
      "Oghur",
      "Oghur Turkic",
      "Oghuz Turkic",
      "Oirat-Kalmyk",
      "Ok–Oksapmin",
      "Old Korean",
      "Omotic",
      "Ongan",
      "Other Arabic",
      "Other Canaanite",
      "Oto-Manguean",
      "Oïl Dialects",
      "Pakanic",
      "Palaungic",
      "Paniai Lakes",
      "Para-Mongolic",
      "Pashto",
      "Pearic",
      "Peninsular",
      "Persian",
      "Philippine",
      "Pidgin",
      "Polynesian",
      "Portuguese",
      "Portuguese-based",
      "Punjabi–Lahnda",
      "Qiangic",
      "Rajasthani",
      "Raji–Raute",
      "Romance",
      "Sami",
      "Sardinian",
      "Selkup",
      "Semitic",
      "Senegambian (Atlantic)",
      "Sepik",
      "Shirongolic",
      "Siangic",
      "Siberian Turkic",
      "Sicilian",
      "Sinitic",
      "Sino-Tibetan",
      "Slavic",
      "South Canaanite",
      "South Dravidian",
      "South Estonian",
      "South Ethiopic",
      "South-Central Dravidian",
      "Southeast Papuan",
      "Southeastern Dialects",
      "Southern",
      "Southern Khanty",
      "Southern Mansi",
      "Southern Ryukyuan",
      "Southwestern Lombard",
      "Spanish",
      "Spanish-based",
      "Tacanan",
      "Tai",
      "Tai-Kadai",
      "Tamangic",
      "Tani",
      "Tarascan",
      "Tibetic",
      "Tibeto-Burman",
      "Ticuna–Yuri",
      "Timoric",
      "Timor–Alor–Pantar",
      "Tivoid",
      "Tobian",
      "Trans-New Guinea",
      "Tsimané",
      "Tuareg Berber",
      "Tucanoan",
      "Tupi-Guarani",
      "Tuscan",
      "Udmurt",
      "Unclassified",
      "Unclassified Dravidian",
      "Unclassified Indo-Aryan",
      "Veps",
      "Votic",
      "West Bomberai",
      "West Germanic",
      "West Himalayish",
      "West Hmongic",
      "West Papuan",
      "Western Aramaic",
      "Western Dialects",
      "Western Hindi",
      "Western Khanty",
      "Western Lombard",
      "Western Pahari",
      "Western South Slavic",
      "Witotoan",
      "Yoruboid",
      "Yuman",
      "Yuman-Cochimí",
      "Yupik",
      "Zamucoan",
      "Zapotecan",
      "Zenati Berber",
      "Zhuang"
    ],
    isos: [
      "a-ou",
      "aab",
      "aas-whistled",
      "abaga",
      "abaza",
      "abba-gorgoryos",
      "abe",
      "abk",
      "abkhaz",
      "abon",
      "aboriginal-pidgin-english",
      "abron",
      "abruzzese",
      "abui",
      "aca",
      "acadian",
      "ace",
      "achang",
      "acheron",
      "achhami-doteli",
      "acm",
      "acr",
      "adang",
      "adara",
      "adeni-arabic",
      "adi",
      "adjaran-georgian",
      "admiralty",
      "adnyamathanha",
      "ady",
      "adyghe",
      "aeb",
      "aeolian",
      "aeq",
      "afade",
      "afar",
      "african-romance",
      "afrikaans",
      "afro-seminole-creole",
      "agalega-creole",
      "agarabi",
      "agaw",
      "aghem",
      "aghu",
      "agu",
      "agx",
      "ahom",
      "ahr",
      "aht",
      "ai-cham",
      "aii",
      "aii2",
      "aiki",
      "aimele",
      "ainu",
      "air-tamajeq",
      "ais",
      "ait-seghrouchen-berber",
      "aiton",
      "aja",
      "ajawa",
      "aka",
      "akan",
      "akc",
      "akj",
      "akkadian",
      "akkala-sami",
      "akm",
      "akoye",
      "aku",
      "akv",
      "ala-satakunta",
      "alak-bahnaric",
      "alar-tunka-buryat",
      "alasha",
      "albanian",
      "alchuka",
      "ale",
      "alekano",
      "alentejan",
      "aleppine-arabic",
      "algerian-arabic",
      "algerian-saharan-arabic",
      "algherese",
      "algonquian-basque-pidgin",
      "allar",
      "alor-malay",
      "alor-pantar",
      "alq",
      "altai",
      "altai-uriankhai",
      "alu",
      "aluku",
      "alutaguse",
      "alyutor",
      "amami",
      "ambele",
      "ambo",
      "ambonese-malay",
      "amdang",
      "amdo-tibetan",
      "american-finnish",
      "american-indian-pidgin-english",
      "amf",
      "amh",
      "amh2",
      "amh3",
      "amharic",
      "amharic-argobba",
      "ami",
      "amira",
      "amkoe",
      "ammonite",
      "amorite",
      "amur-dagur",
      "amuzgo",
      "anaang",
      "anatolian-arabic",
      "anca",
      "ancient-egyptian",
      "ancient-north-arabian",
      "ancona",
      "andalusi-arabic",
      "andalusi-romance",
      "andalusian",
      "aneme-wake",
      "ang",
      "angaataha",
      "angal",
      "angami-pochuri",
      "angas",
      "angevin",
      "anglo-norman",
      "angolar-creole",
      "anguillian-creole",
      "ani",
      "anindilyakwa",
      "ankave",
      "annobonese-creole",
      "ano",
      "anp",
      "anq",
      "ans-",
      "antillean-creole",
      "anz",
      "ao",
      "aot",
      "aoz",
      "apa",
      "apc",
      "aph",
      "aqc",
      "ara",
      "arabic-javanese-of-klego",
      "arafundi-enga-pidgin",
      "aragonese",
      "aramaic",
      "aranadan",
      "aranese",
      "arawak",
      "arc",
      "ardennais",
      "aretino-chianaiolo",
      "argentinian-spanish",
      "arh",
      "ari",
      "arianese",
      "arin",
      "aringa",
      "armazic",
      "armenian",
      "arn",
      "aro",
      "aroid",
      "arp",
      "arpitan",
      "aru",
      "arunachal",
      "ashaninka",
      "asm",
      "asmat",
      "asmat-citak",
      "asmat-kamoro",
      "asoa",
      "assamese",
      "assan",
      "asturian",
      "atayal-squliq",
      "atayal-tsole",
      "atlas-berber",
      "atlym",
      "atlym-nizyam-khanty",
      "atohwaim-kaugat",
      "atsam",
      "attapady-kurumba",
      "augeron",
      "auregnais",
      "australian-kriol",
      "auvergnat",
      "auye",
      "auyokawa",
      "ava",
      "avam",
      "avokaya",
      "awa",
      "awadhi",
      "awbono",
      "awin",
      "awin-pa",
      "awing",
      "awiyaana",
      "awjila",
      "awyu-dumut",
      "aym",
      "aymara",
      "ayo",
      "ayz",
      "azerbaijani",
      "b-arnese",
      "baarin",
      "baba",
      "baba-malay",
      "babanki",
      "baca",
      "bacama",
      "bacama-language",
      "badaga",
      "bade-chadic",
      "bade-language",
      "badong-yao",
      "baekje-korean",
      "baham",
      "bahamian-creole",
      "bahnar",
      "bai",
      "baima",
      "baisha-hlai",
      "baitadeli-doteli",
      "bajan-creole",
      "bajhangi-doteli",
      "bajureli-doteli",
      "bak",
      "baka",
      "bala",
      "baldemu",
      "balearic",
      "bali-sasak-sumbawa",
      "balinese-malay",
      "balo",
      "balochi",
      "balti",
      "bam",
      "bamali",
      "bambalang",
      "bambara",
      "bambassi",
      "bamboo-english",
      "bami",
      "bamukumbit",
      "bamum",
      "bamwe",
      "ban",
      "bana",
      "banat",
      "banda-malay",
      "bangala",
      "bangi",
      "bangime",
      "bangladeshi-english",
      "bangolan",
      "banjar",
      "baoan",
      "baoanic",
      "baoting-hlai",
      "bap",
      "barai",
      "baram-thangmi",
      "barambu",
      "baramu",
      "bardi",
      "barein",
      "barese",
      "bargut",
      "bargut-buryat",
      "bariba",
      "bariji",
      "barikanchi-pidgin",
      "barito",
      "barranquenho",
      "baruga",
      "basap",
      "bashkir",
      "basilicatine",
      "basque-icelandic-pidgin",
      "bassari",
      "basum",
      "bata",
      "batanic",
      "batek",
      "bats",
      "batu",
      "bauwaki",
      "bavarian",
      "bayat-oirat",
      "bayono",
      "bayono-awbono",
      "bayot",
      "bbc",
      "bbh",
      "bcc",
      "bdz",
      "be-jizhao",
      "be-lang",
      "beami",
      "beary",
      "beba",
      "bebe",
      "becking-dawi",
      "bee",
      "beele",
      "beijing-mandarin",
      "beja",
      "bel",
      "belarusian",
      "beli",
      "belizean-creole",
      "belneng",
      "bem",
      "bemba",
      "bembe-congo",
      "bembe-drc",
      "ben2",
      "benabena",
      "benasquese",
      "benevento",
      "bengali",
      "bengali-portuguese-creole",
      "berau-malay",
      "berbice",
      "bercian",
      "bergamasque",
      "berjozov",
      "berrichon",
      "berta",
      "besermyan",
      "besme",
      "betawi",
      "bete",
      "betta-kurumba",
      "bfy",
      "bgc",
      "bgn",
      "bgp",
      "bgq",
      "bgr",
      "bhaca",
      "bhe",
      "bhj",
      "bhujel",
      "biangai",
      "biao-kam-sui",
      "biao-min",
      "biao-mon",
      "bidau-creole-portuguese",
      "bidiyo",
      "big-flowery",
      "bijiang-bai",
      "bikol",
      "bima",
      "bimbashi-arabic",
      "bimin",
      "bina",
      "binahari",
      "binandere",
      "binanderean",
      "binumarien",
      "binza",
      "bipim",
      "birgit",
      "birri",
      "biseni",
      "bislama",
      "bisorio",
      "bissa",
      "bitare",
      "bitur",
      "biu-mandara",
      "bjarmian-finnic",
      "bjarmian-s-mi",
      "bla",
      "blackfoot",
      "blagar",
      "blb",
      "blr",
      "bmf",
      "bmr",
      "bmu",
      "bns",
      "bny",
      "boa",
      "boazi",
      "boazi-lake-murray",
      "bobo",
      "bocas-del-toro-creole",
      "bod",
      "bod2",
      "bodish",
      "bodo",
      "boga",
      "boghom",
      "bokar",
      "boko",
      "bola",
      "bole-afroasiatic",
      "bole-chadic-language",
      "bole-niger-congo",
      "bole-tangale",
      "bolivian-spanish",
      "bolognese",
      "bolon",
      "bolze",
      "bomboli-bozaba",
      "bomboma",
      "bomitaba",
      "bomu",
      "bonan",
      "bonan-kangjia",
      "bonan-manegacha",
      "bongili",
      "bongo",
      "bongor-arabic",
      "bonin-english",
      "bonjo",
      "bono-ghana-ivory-coast",
      "boor",
      "boq",
      "borgarm-let",
      "boro-garo",
      "bosavi",
      "bosnian",
      "bouhin",
      "bourbonnais",
      "bourbonnais-creole",
      "bouyei",
      "bozal-spanish",
      "bpy",
      "brahui",
      "braj",
      "brao-bahnaric",
      "brayon",
      "brazilian-portuguese",
      "brd",
      "bre",
      "bre2",
      "bre3",
      "breton",
      "brg",
      "brianz-",
      "brigasc",
      "british-latin",
      "broken-oghibbeway",
      "broken-slavey",
      "broome-pearling-lugger-pidgin",
      "bru",
      "brunei-malay",
      "brx",
      "bsa",
      "btv",
      "bua",
      "bug",
      "buk",
      "bukovinian",
      "bul",
      "bunak",
      "bundeli",
      "bundjalung",
      "bungku-tolaki",
      "bunu",
      "bunun",
      "bunun-isbukun",
      "bunun-northern-central",
      "bura",
      "burarra",
      "bure-chadic",
      "burgundian",
      "burmese",
      "burmish",
      "burmo-qiangic",
      "burumakok",
      "buryat",
      "bustocco-legnanese",
      "butler-english",
      "buwal",
      "buyang",
      "buyeo-korean",
      "bwi",
      "byq",
      "byw",
      "bzg",
      "caa",
      "cac",
      "cadorino",
      "cag",
      "cahuilla",
      "cai-long",
      "caijia",
      "cairene-arabic",
      "cak",
      "cakfem-mushere",
      "calabro",
      "cam",
      "cameroonian-pidgin",
      "cameroonian-pidgin-english",
      "camorta-nicobarese",
      "campano",
      "campidanese",
      "camtho",
      "canadian-french",
      "canarian",
      "cannanore-portuguese-creole",
      "cantabrian",
      "canz-s",
      "cao-lan",
      "cao-miao",
      "cape-verdean-creole",
      "cappadocian-greek",
      "car-nicobarese",
      "carolinian",
      "cas",
      "cast-o",
      "castelmezzano",
      "cat",
      "cat2",
      "cauchois",
      "cauque-mayan",
      "cav",
      "caw",
      "cax",
      "cay",
      "cbb",
      "cbd",
      "cbg",
      "cbv",
      "ccp",
      "cdm",
      "cdo",
      "cdz",
      "ceb",
      "ceb2",
      "cebuano-lang",
      "celebic",
      "cenderawasih",
      "central-atlas-tamazight",
      "central-catalan",
      "central-erzya",
      "central-estonian",
      "central-finland",
      "central-italian",
      "central-ludic",
      "central-luzon",
      "central-maluku",
      "central-mansi",
      "central-marchigiano",
      "central-metafonetica",
      "central-min",
      "central-moksha",
      "central-northern-lazian",
      "central-pacific",
      "central-plains-mandarin",
      "central-selkup",
      "central-south-sulawesi",
      "central-southern-calabrian",
      "central-tai",
      "central-tibeto-burman",
      "central-transdanubian",
      "central-vanuatu",
      "central-veps",
      "central-vychegda",
      "central-zapotec",
      "ces",
      "cfm",
      "cha",
      "chadian-arabic",
      "chadong",
      "chagossian-creole",
      "chakato",
      "chakhar",
      "chamdo",
      "chamorro",
      "changjiang-hlai",
      "chashan",
      "chaura-nicobarese",
      "chavacano",
      "chenchu",
      "chepang",
      "chepangic",
      "cherokee",
      "chf",
      "chhattisgarhi",
      "chiac",
      "chiang-saen",
      "chimbu",
      "chin",
      "chinantec",
      "chinese-korean",
      "chinese-kyakala",
      "chinese-pidgin-english",
      "chinook-jargon",
      "chittagonian",
      "chk",
      "cho",
      "chol",
      "cholanaikkan",
      "cholti-classic",
      "chong",
      "chongqing-mandarin",
      "chorote",
      "chorotega",
      "choshuenco",
      "chovashi",
      "choyo",
      "chp",
      "chr",
      "chr2",
      "chrau-bahnaric",
      "christian-palestinian-aramaic",
      "chuave",
      "chukchi",
      "chukotkan",
      "chukotko-kamchatkan",
      "chusovaya",
      "chuvash",
      "chv",
      "chx",
      "cibak",
      "cim",
      "cineni",
      "cingali",
      "ciwogai",
      "ckb",
      "ckh",
      "ckv",
      "clh",
      "clk",
      "cnh",
      "cnk",
      "cob",
      "coc",
      "cochin-portuguese-creole",
      "cocoliche",
      "cocos-malay",
      "coe",
      "coj",
      "colloquial-finnish",
      "comanche",
      "comasco-lecchese",
      "con",
      "cook-islands-maori-pidgin",
      "cor",
      "cor2",
      "cor3",
      "cora",
      "core-mansi",
      "corfiot-maltese",
      "corsican",
      "cos",
      "courland-livonian",
      "coxoh-maya",
      "coz",
      "crc",
      "cre",
      "cre2",
      "cremish",
      "cremun-s",
      "cri-ana",
      "crimean-tatar",
      "croatian",
      "cs-ng-",
      "csh",
      "ctn",
      "cua-bahnaric",
      "cui",
      "cuk",
      "cul",
      "cun-hlai",
      "cur",
      "cuvok",
      "cux",
      "cyb",
      "cypriot-maronite-arabic",
      "daba",
      "daco-romanian",
      "dai-zhuang",
      "daman",
      "daman-and-diu-portuguese-creole",
      "dan",
      "dangaleat",
      "danish",
      "dao",
      "dari",
      "dass",
      "dazawa",
      "dby",
      "deh",
      "deno",
      "derung",
      "deu",
      "dghwede",
      "dgo",
      "dhakaiya-kutti-bengali",
      "dhd",
      "dhimal",
      "dhimalish",
      "dhivehi",
      "dhuleli",
      "dhuwal",
      "dili-malay",
      "diri",
      "dis",
      "diu",
      "dizoid",
      "djaru",
      "djinang",
      "dlm",
      "dmk",
      "dml",
      "dogri",
      "dom",
      "dominican-creole-french",
      "dongjia",
      "douiret",
      "dre",
      "drq",
      "dty",
      "duan",
      "duan-bahnaric",
      "dugwor",
      "duhwa",
      "dullay",
      "duna",
      "dura-tandrange",
      "duruwa",
      "dus",
      "duwai",
      "dzo",
      "dzongkha",
      "early-modern-korean",
      "east-bodish",
      "east-chadic",
      "east-formosan",
      "east-zenati",
      "eastern-berber",
      "eastern-catalan",
      "eastern-estonian",
      "eastern-khanty",
      "eastern-mansi",
      "eastern-mari",
      "eastern-middle-atlas-berber",
      "eastern-morocco-zenati",
      "eastern-oceanic",
      "eastern-romance-family",
      "eastern-savonian",
      "eastern-south-estonian",
      "eastern-votic",
      "edolo",
      "ekoka-kung",
      "el-molo",
      "ell",
      "ems",
      "en-kra",
      "enets",
      "eng",
      "enga",
      "enl",
      "enm",
      "eno",
      "eravallan",
      "erzya",
      "est",
      "estonian",
      "eus2",
      "even",
      "evenki",
      "ewenic",
      "faiwol",
      "fali-of-mubi",
      "fao",
      "far-eastern-khanty",
      "fasu",
      "fembe",
      "fijian",
      "finnmark-sami",
      "fiwaga",
      "flores-lembata",
      "foe",
      "foia-foia",
      "forest-enets",
      "forest-nenets",
      "formosan",
      "fuyu-kyrgyz",
      "fyer",
      "g-llivare",
      "g-ui",
      "gaanda",
      "gadang",
      "galambu",
      "gamilaraay",
      "gardiol",
      "garifuna",
      "gascon",
      "gawar",
      "gaya-korean",
      "gbm",
      "gbu",
      "geji",
      "gelao",
      "gera",
      "geruma",
      "ggk",
      "ghale",
      "ghh",
      "gidar",
      "giiwo",
      "gil",
      "githabul",
      "gobasi",
      "goguryeo-korean",
      "golin",
      "gondi",
      "gongduk",
      "gooniyandi",
      "goryeo-korean",
      "grand-valley-dani",
      "greater-siangic",
      "greenlandic-lang",
      "grossetano",
      "grx",
      "gta",
      "guarani",
      "gub",
      "gum",
      "gvr",
      "gyalrong",
      "hagen",
      "haklau-min",
      "halang-bahnaric",
      "hamtai",
      "hawaiian",
      "heart-tavastian",
      "hevaha",
      "hill-mari",
      "hkongso",
      "ho-munda",
      "hoc",
      "hokkaido-ainu",
      "hokkien",
      "holiya",
      "hollola",
      "hop",
      "hruso",
      "huilliche",
      "hun",
      "hun2",
      "iitti",
      "inari-sami",
      "ingrian",
      "insular-estonian",
      "iranun",
      "irula",
      "isan",
      "ite",
      "ixc",
      "izhma",
      "jalaa",
      "jeseri",
      "jiamao",
      "jingpho",
      "jino",
      "jizhao",
      "judeo-mantuan",
      "jukonda",
      "jup",
      "kadar-dravidian",
      "kaikadi",
      "kakkala",
      "kaloeng",
      "kam-tai",
      "kangjia",
      "karakalpak",
      "karenic",
      "kashubian",
      "kasong",
      "kasua",
      "kuf",
      "kazakh",
      "kbh",
      "kenaboi",
      "kha",
      "kha-lyngngam",
      "kha-native-speakers",
      "kham",
      "khamyang",
      "khun",
      "kiknur",
      "kiranti",
      "kle",
      "kochevo",
      "kom",
      "komi-permyak",
      "komi-yodzyak",
      "komi-zyryan",
      "konda-khanty",
      "koro",
      "kosa-kama",
      "kota-dravidian",
      "koy",
      "kpj",
      "krc",
      "kuan",
      "kujarge",
      "kuki-chin-naga",
      "kumhali",
      "kuril-ainu",
      "kuu-rv-ludic",
      "kuuk-thaayore",
      "kwaza",
      "kzq",
      "l-ngua-geral-amaz-nica",
      "lao",
      "lao-phutai",
      "leizhou-min",
      "lepcha",
      "lif",
      "lisu",
      "logudorese",
      "loloish",
      "longsang-zhuang",
      "lower-vychegda",
      "lrr",
      "luza-letka",
      "macro-bai",
      "macro-yaeyama",
      "magaric",
      "mak",
      "malij-jugan",
      "mangghuer",
      "maramure-",
      "mazahua",
      "mef",
      "mgp",
      "mijiic",
      "milang",
      "min-zhuang",
      "mixtec",
      "moldavian",
      "mongghul",
      "monguor",
      "mru",
      "mxj",
      "mzp",
      "naga",
      "naic",
      "naxi",
      "newar",
      "nizyam",
      "njm",
      "nll",
      "nogai",
      "northern-khanty",
      "northern-min",
      "northern-tai",
      "northwestern-tai",
      "npa",
      "nsm",
      "nung",
      "nungish",
      "obdorsk",
      "old-serbi",
      "oltenian",
      "oon",
      "oto",
      "pa-di",
      "pashto",
      "pavese",
      "phu-thai",
      "pim",
      "piraha",
      "proto-austroasiatic",
      "proto-hakka",
      "proto-loloish",
      "proto-sino-tibetan",
      "pu-xian-min",
      "pum",
      "pyu",
      "qifu",
      "rab",
      "raji-raute",
      "rau",
      "romanian",
      "rouran",
      "rung",
      "rup",
      "saek",
      "salym-khanty",
      "sardinian",
      "shan",
      "sherkal",
      "shirongol",
      "siangic",
      "sinitic",
      "slv",
      "songlin",
      "southeastern-finnish",
      "southern-min",
      "southern-thai",
      "sqi",
      "surgut-khanty",
      "tabghach",
      "tai-daeng",
      "tai-don",
      "tai-hongjin",
      "tai-laing",
      "tai-lue",
      "tai-muong-vat",
      "tai-pao",
      "tai-ya",
      "tajik",
      "tamangic",
      "tangwang",
      "tatar",
      "tay-tai",
      "tembo",
      "teochew-min",
      "tetela",
      "thai",
      "thai-song",
      "tibetic",
      "tibeto-kanauri",
      "tikar",
      "tikuna",
      "tiro",
      "tiv",
      "tonga-malawi",
      "tonga-mozambique",
      "totela",
      "tpx",
      "tremjugan",
      "trique",
      "tshiluba",
      "tsn",
      "tsn2",
      "tsonga-or-xitsonga",
      "tsotsitaal-and-camtho-aka-iscamtho",
      "tsun-lao",
      "tswana",
      "tujia",
      "tumbuka",
      "tuyuhun",
      "tyap",
      "umb",
      "vakh",
      "vasjugan",
      "ven",
      "venda",
      "verkhne-kalimsk",
      "viemo",
      "viti",
      "vori",
      "voro",
      "wannu",
      "wapan",
      "werni",
      "west-himalayish",
      "western-khanty",
      "wme",
      "wolof",
      "wushi",
      "xho2",
      "xiang",
      "yalunka",
      "yamba",
      "yang-zhuang",
      "yei-zhuang",
      "yemba",
      "yeyi",
      "yilan-creole-japanese",
      "yor",
      "yor2",
      "yoruba",
      "yoy",
      "zande",
      "zandui",
      "zeme",
      "zhire",
      "zhoa",
      "zkr",
      "zulu"
    ]
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

  // A solved exact set wins over the category/family union, which by
  // construction over-collects and cannot be constrained after the fact.
  if (Array.isArray(profile.isos) && profile.isos.length) {
    const exactWeights: Record<string, number> = {};
    for (const iso of profile.isos) {
      if (typeof iso !== "string") continue;
      const key = normalizeRaceMixerKey(iso);
      if (!key) continue;
      exactWeights[key] = (exactWeights[key] || 0) + 1;
    }
    if (Object.keys(exactWeights).length) return exactWeights;
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
    if (!lang?.iso) return;
    if (lang.tags?.includes("family")) return; // skip family-only macros

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
          const weight = typeof w === "number" && Number.isFinite(w) && w > 0 ? w : 1;
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
  const count = options?.count || 40;
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
    if (!bases?.length || !Names || typeof Names.getBase !== "function") return [];

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
    if (!lang?.iso || !lang.name) continue;
    catalogByIso.set(lang.iso, lang);
  }

  const cleanedByName = new Map<string, { name: string; weight: number }>();
  for (const [iso, weightRaw] of Object.entries(isoWeights)) {
    const lang = catalogByIso.get(iso);
    if (!lang) continue;
    const weight = typeof weightRaw === "number" && Number.isFinite(weightRaw) ? weightRaw : 0;
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
      name: existing?.name ? existing.name : n,
      weight: (existing?.weight ? existing.weight : 0) + weight
    });
  }

  const sources = Array.from(cleanedByName.entries())
    .map(([key, value]) => ({ key, name: value?.name, weight: value?.weight }))
    .filter(s => s?.name && typeof s.weight === "number" && s.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  if (!sources.length) return "";

  const seed = options && typeof options.seed === "number" ? options.seed : null;
  const seedInt = typeof seed === "number" && Number.isFinite(seed) ? seed >>> 0 : 0;
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
        const sName = src?.name ? String(src.name).trim() : "";
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
    if (topSource?.name) {
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
    const isMixerBase = b.raceMixerFor || b.cultureMixer || b.isoWeights || b.name?.includes(" Mix");
    if (!isMixerBase) continue;

    if (name === expectedName) return i;
    if (name.endsWith(`(${raceName})`)) return i;
  }
  return null;
}

function getRaceDefaultBaseIndex(raceName: string): number | null {
  if (!raceName) return null;
  if (!fantasyRaceBases?.[raceName]) return null;
  const nameBases = getNameBases();
  if (!Array.isArray(nameBases)) return null;

  const bases = fantasyRaceBases[raceName];
  if (!Array.isArray(bases) || !bases.length) return null;

  for (const baseIndex of bases) {
    if (typeof baseIndex !== "number") continue;
    const base = nameBases[baseIndex];
    if (!base) continue;
    if (base?.raceMixerFor) continue;
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
      if (options?.refresh) return true;
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
        const count = options?.count || 240;
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

  const count = options?.count || 240;
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
  if (!culture?.i || culture.removed) return "Human";

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
  const baseEntry = nameBases?.[base];
  const markedRace = baseEntry && typeof baseEntry.raceMixerFor === "string" ? baseEntry.raceMixerFor : "";
  if (markedRace && fantasyRaceBases[markedRace]) return markedRace;

  return "Human";
}

function shouldEnableRacesForCurrentWorld(): boolean {
  if (pack && Array.isArray((pack as any).races)) {
    for (const race of (pack as any).races) {
      if (!race?.i || !race.name) continue;
      if (race.name) return true;
    }
  }

  if (!pack || !Array.isArray(pack.cultures)) return false;
  for (const culture of pack.cultures) {
    if (!culture?.i || culture.removed) continue;
    const raceName = getRaceNameForCulture(culture);
    if (raceName) return true;
  }

  return false;
}

function initializeRacesForExpansion(options?: { forceFilterFromUi?: boolean; skipApplyFilter?: boolean }): void {
  if (!pack?.cultures) return;
  if (!shouldEnableRacesForCurrentWorld()) return;

  const packAny = pack as any;
  const existingRaces = packAny.races || [];
  const races: { i: number; name: string; color?: string; expansionism?: number }[] = [{ i: 0, name: "None" }];
  const raceIndexByName = new Map<string, number>();
  const raceColorById: Record<number, string> = {};

  const isFirstInitialization = existingRaces.length <= 1;
  const forceFilterFromUi = options?.forceFilterFromUi;
  const skipApplyFilter = options?.skipApplyFilter;
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
        if (!culture?.i || culture.removed) return;
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
    if (!race?.i) return;
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
      const currentBase = nameBases?.[culture.base];
      const hasCultureMixer = currentBase?.cultureMixer && currentBase.cultureMixerFor === culture.i;
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
    if (!race?.i) return;
    race.color = raceColorById[race.i] || race.color || "#888888";
    if (race.expansionism == null) race.expansionism = 1;
  });

  packAny.races = races;
}

function rerollRacesForCultures(options?: { forceFilterFromUi?: boolean }): void {
  if (!pack || !Array.isArray(pack.cultures)) return;
  if (!shouldEnableRacesForCurrentWorld()) return;

  const forceFilterFromUi = options?.forceFilterFromUi;
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
    const nonHumanChancePercent =
      (racesNonHumanChanceElement && (racesNonHumanChanceElement.valueAsNumber ?? +racesNonHumanChanceElement.value)) ??
      35;
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
        if (!culture?.i || culture.removed) return;
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
      const currentBase = nameBases?.[culture.base];
      const hasCultureMixer = currentBase?.cultureMixer && currentBase.cultureMixerFor === culture.i;
      if (!hasCultureMixer) {
        const baseIndex = ensureRaceMixerBaseIndex(raceName);
        if (typeof baseIndex === "number") culture.base = baseIndex;
      }
    }

    if (raceId && !raceColorById[raceId] && culture.color) raceColorById[raceId] = culture.color;
  });

  races.forEach(race => {
    if (!race?.i) return;
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
  if (!cells?.i || !cells.culture || !cells.race) return;
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
    if (!races?.[raceId]) continue;

    if (!countsByCulture[cultureId]) countsByCulture[cultureId] = {};
    const cultureBucket = countsByCulture[cultureId];
    cultureBucket[raceId] = (cultureBucket[raceId] || 0) + 1;

    const stateId = cells.state ? cells.state[i] : 0;
    if (stateId) {
      if (!countsByState[stateId]) countsByState[stateId] = {} as Record<number, number>;
      const bucket = countsByState[stateId];
      bucket[raceId] = (bucket[raceId] || 0) + 1;
    }

    const provinceId = cells.province ? cells.province[i] : 0;
    if (provinceId) {
      if (!countsByProvince[provinceId]) countsByProvince[provinceId] = {} as Record<number, number>;
      const bucket = countsByProvince[provinceId];
      bucket[raceId] = (bucket[raceId] || 0) + 1;
    }

    const religionId = cells.religion ? cells.religion[i] : 0;
    if (religionId) {
      if (!countsByReligion[religionId]) countsByReligion[religionId] = {} as Record<number, number>;
      const bucket = countsByReligion[religionId];
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
      burg.race = races?.[raceId] ? raceId : 0;
    });
  }

  for (const culture of cultures) {
    if (!culture?.i || culture.removed) continue;
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
      const currentBase = nameBases?.[culture.base];
      const hasCultureMixer = currentBase?.cultureMixer && currentBase.cultureMixerFor === culture.i;
      if (!hasCultureMixer) {
        const baseIndex = ensureRaceMixerBaseIndex(raceName);
        if (typeof baseIndex === "number") culture.base = baseIndex;
      }
    }
  }
}

function assignRaces(): void {
  if (!pack?.cultures) return;
  const packAny = pack as any;

  function clearRaces(): void {
    packAny.races = [];

    if (pack.cultures)
      pack.cultures.forEach((c: any) => {
        c && delete c.race;
      });
    if (packAny.states)
      packAny.states.forEach((s: any) => {
        s && delete s.race;
      });
    if (packAny.provinces)
      packAny.provinces.forEach((p: any) => {
        p && delete p.race;
      });
    if (packAny.burgs)
      packAny.burgs.forEach((b: any) => {
        b && delete b.race;
      });
    if (packAny.religions)
      packAny.religions.forEach((r: any) => {
        r && delete r.race;
      });
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
    const culture = pack.cultures?.[cultureId];
    return culture && (culture as any).race ? (culture as any).race : 0;
  }

  if (hasCellRaces && pack.cells) {
    const cells = packAny.cells;
    const { races } = packAny;
    const raceByCell = cells.race;
    const countsByState: Record<number, Record<number, number>> = {};
    const countsByProvince: Record<number, Record<number, number>> = {};
    const countsByReligion: Record<number, Record<number, number>> = {};

    for (const i of cells.i) {
      if (cells.h && cells.h[i] < 20) continue;
      const raceId = raceByCell[i] || 0;
      if (!raceId) continue;
      if (!races?.[raceId]) continue;

      const stateId = cells.state ? cells.state[i] : 0;
      if (stateId) {
        if (!countsByState[stateId]) countsByState[stateId] = {} as any;
        const bucket = countsByState[stateId];
        bucket[raceId] = (bucket[raceId] || 0) + 1;
      }

      const provinceId = cells.province ? cells.province[i] : 0;
      if (provinceId) {
        if (!countsByProvince[provinceId]) countsByProvince[provinceId] = {} as any;
        const bucket = countsByProvince[provinceId];
        bucket[raceId] = (bucket[raceId] || 0) + 1;
      }

      const religionId = cells.religion ? cells.religion[i] : 0;
      if (religionId) {
        if (!countsByReligion[religionId]) countsByReligion[religionId] = {} as any;
        const bucket = countsByReligion[religionId];
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
        burg.race = races?.[raceId] ? raceId : 0;
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
        province.race = state?.race ? state.race : 0;
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

  if (pack.cells?.culture && pack.cells.i) {
    const cells = packAny.cells;
    const hasCellRaces = cells.race && cells.race.length === pack.cells.i.length;

    if (!hasCellRaces) {
      const raceArray = new Uint16Array(pack.cells.i.length);
      for (const i of pack.cells.i) {
        const cultureId = pack.cells.culture[i];
        const culture = pack.cultures?.[cultureId];
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
  if (!bases?.length) return null;
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
