"use strict";
/**
 * Master Namebase Fix Script
 *
 * Comprehensive fix for all language namebase quality issues:
 * 1. Replace corrupted d-field values (nic-GH, geo-codes like it-IT, und) with
 *    correct phonotactic rules based on linguistic family
 * 2. Fix data corruption (Chinese characters, clipboard contamination, leading spaces)
 * 3. Deduplicate names within base entry name lists
 * 5. Fix duplicate base references
 *
 * Run: node tools/fix-namebases.js [--commit]
 *   --commit  Actually write the fixes (default is dry-run)
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(root, "modules");
const CONFIG_DIR = path.join(root, "config");

const DRY_RUN = !process.argv.includes("--commit");

// ============================================================
// PHONOTACTIC RULE MAPPING
// Maps language family -> correct phonotactic d-value
// The d-value defines which lowercase letters can appear doubled (geminates)
// in generated names via the Markov chain name generator.
// ============================================================

const FAMILY_D_MAP = {
  // Afroasiatic - Semitic
  "Arabic": "ae",
  "Egyptian Arabic": "ae",
  "Algerian Arabic": "ae",
  "Moroccan Arabic": "ae",
  "Tunisian Arabic": "ae",
  "Sudanese Arabic": "ae",
  "Levantine Arabic": "ae",
  "Mesopotamian Arabic": "ae",
  "Bahrani Arabic": "ae",
  "Judeo-Arabic": "ae",
  "Cypriot Arabic": "ae",
  "Semitic": "",
  "Hebrew": "",
  "Aramaic": "",
  "Eastern Aramaic": "",
  "Western Aramaic": "",
  "Classical Aramaic": "",
  "Assyrian": "",
  "Akkadian": "",
  "Phoenician": "",
  "Ancient North Arabian": "",
  "Old Aramaic": "",
  "Jewish Babylonian Aramaic": "",
  "Syriac": "",

  // Afroasiatic - Berber
  "Berber": "stnlrkm",
  "Tuareg Berber": "stnlrkm",
  "Tawat Berber": "stnlrkm",
  "Tachelhit": "stnlrkm",
  "Moroccan Central Atlas Tamazight": "stnlrkm",
  "Kabyle": "stnlrkm",
  "Riffian": "stnlrkm",
  "Shilha": "stnlrkm",
  "Zenati": "stnlrkm",
  "Mozabite": "stnlrkm",
  "Ghadamès": "stnlrkm",
  "Matmata Berber": "stnlrkm",
  "Jerba Berber": "stnlrkm",
  "Sheliff Basin Berber": "stnlrkm",
  "South Oran-Figuig Berber": "stnlrkm",
  "Western Berber": "stnlrkm",
  "Zenaga": "stnlrkm",
  "Sanhaja de Srair": "stnlrkm",
  "Tamazight": "stnlrkm",
  "Gourara Zenati": "stnlrkm",
  "Figuig": "stnlrkm",
  "Southwestern Berber": "stnlrkm",
  "Tidikelt Berber": "stnlrkm",

  // Afroasiatic - other
  "Chadic": "lnrt",
  "Cushitic": "lnrt",
  "Omotic": "lnrt",
  "Egyptian": "",

  // Niger-Congo (default)
  "Niger-Congo": "lnrt",
  "Bantu": "lnrt",
  "Narrow Bantu": "lnrt",
  "Bantoid": "lnrt",
  "Southern Bantoid": "lnrt",
  "Northern Bantoid": "lnrt",
  "Wide Bantu": "lnrt",
  "Mbane": "lnrt",
  "Kikongo": "lnrt",
  "Spoken Lingala": "lnrt",
  "Wurkum": "lnrt",
  "Tula": "lnrt",
  "North Atlantic": "lnrt",
  "West Atlantic": "lnrt",
  "Senegambian (Atlantic)": "lnrt",
  "Gur": "lnrt",
  "Senufo": "lnrt",
  "Kru": "lnrt",
  "Ijoid": "lnrt",
  "Edoid": "lnrt",
  "Platoid": "lnrt",
  "Cross River": "lnrt",
  "Benue-Congo": "lnrt",
  "Yoruboid": "lnrt",
  "Igboid": "lnrt",
  "Akan": "lnrt",
  "Gbe": "lnrt",
  "Ga-Dangme": "lnrt",
  "Mande": "lnrt",
  "Soninke-Bobo": "lnrt",
  "Vai-Kono": "lnrt",
  "Manding": "lnrt",
  "Southeastern Mande": "lnrt",
  "Eastern Mande": "lnrt",
  "Western Mande": "lnrt",
  "Kwa": "lnrt",
  "Potou-Tano": "lnrt",
  "Nyo": "lnrt",
  "Lagoon": "lnrt",
  "Adamawa": "lnrt",
  "Ubangi": "lnrt",
  "Banda": "lnrt",
  "Ngbandi-based": "lnrt",
  "Ubangian": "lnrt",
  "Dogon": "lnrt",
  "Kordofanian": "lnrt",
  "Atlantic": "lnrt",
  "Jola": "lnrt",
  "Fula-Wolof": "lnrt",
  "Fulfulde (Macrolanguage)": "lnrt",
  "Yoruba": "lnrt",
  "Igbo": "lnrt",
  "Edo": "lnrt",
  "Efik-Ibibio": "lnrt",
  "Annang": "lnrt",
  "Ibibio": "lnrt",
  "Nupoid": "lnrt",
  "Idomoid": "lnrt",
  "Kainji": "lnrt",
  "Jukunoid": "lnrt",
  "Ekoid": "lnrt",
  "Mambiloid": "lnrt",
  "Grassfields": "lnrt",
  "Ring": "lnrt",
  "Eastern Beboid": "lnrt",
  "Etung": "lnrt",
  "Ambo": "lnrt",
  "Sawabantu": "lnrt",
  "Makaa-Njem": "lnrt",
  "Kako": "lnrt",
  "Japhetic": "lnrt",
  "Basaa": "lnrt",
  "Bafia": "lnrt",
  "Nyali": "lnrt",
  "Mbam": "lnrt",
  "Sheke": "lnrt",
  "Bangi-Meet": "lnrt",
  "Bobangi": "lnrt",
  "Bete": "lnrt",
  "Bua": "lnrt",

  // Nilo-Saharan
  "Nilo-Saharan": "lnrt",
  "Eastern Sudanic": "lnrt",
  "Central Sudanic": "lnrt",
  "Saharan": "lnrt",
  "Kunama": "lnrt",
  "Fur": "lnrt",
  "Maban": "lnrt",
  "Songhay": "lnrt",

  // Khoisan / Click languages
  "Kx'a": "lnrtkxgms",
  "Tuu": "lnrtkxgms",
  "Khoe": "lnrtkxgms",
  "Khoekhoe": "lnrtkxgms",
  "Khoisan": "lnrtkxgms",

  // Indo-European - Italic/Romance
  "Italian": "cltr",
  "Tuscan": "cltr",
  "Sicilian": "cltr",
  "Corsican": "cltr",
  "Neapolitan": "cltr",
  "Romanesco": "cltr",
  "Venetian": "cltr",
  "Piedmontese": "cltr",
  "Ligurian": "cltr",
  "Lombard": "cltr",
  "Emilian": "cltr",
  "Romagnol": "cltr",
  "Friulian": "lnr",
  "Ladin": "lnr",
  "Romansh": "nld",
  "Sardinian": "nld",
  "Latin": "ln",
  "Roman": "ln",
  "Daco-Romanian": "lnr",
  "Eastern Romance": "lnr",
  "Romanian": "lnr",
  "Moldavian": "lnr",
  "Wallachian": "lnr",
  "Aromanian": "lnr",
  "Istro-Romanian": "lnr",
  "Megleno-Romanian": "lnr",
  "Istro Romanian": "lnr",
  "Megleno Romanian": "lnr",
  "Castilian": "lr",
  "Spanish": "lr",
  "Aragonese": "lr",
  "Astur-Leonese": "lr",
  "Galician": "lr",
  "Portuguese": "lrs",
  "Brazilian Portuguese": "lrs",
  "European Portuguese": "lrs",
  "Mozambican Portuguese": "lrs",
  "Angolan Portuguese": "lrs",
  "Cape Verdean Portuguese": "lrs",
  "Guinea-Bissau Portuguese": "lrs",
  "São Toméan Portuguese": "lrs",
  "East Timorese Portuguese": "lrs",
  "Catalan": "lr",
  "Occitan": "nlr",
  "Provençal": "nlr",
  "Gascon": "nlr",
  "Langues d'oïl": "nlr",
  "Oïl Dialects": "nlrs",
  "French": "nlrs",
  "Standard French": "nlrs",
  "Walloon": "nlrs",
  "Picard": "nlrs",
  "Norman": "nlrs",
  "Franco-Provençal": "nlrs",
  "Arpitan": "nlrs",
  "Judeo-Spanish": "lr",
  "Ladino": "lr",
  "Judeo-Italian": "lr",
  "Judeo-Provençal": "lr",

  // Indo-European - Germanic
  "Germanic": "lnrt",
  "North Germanic": "kln",
  "Nordic": "kln",
  "Danish": "kln",
  "Swedish": "kln",
  "Norwegian": "kln",
  "Icelandic": "kln",
  "Faroese": "nld",
  "German": "lnrs",
  "Standard German": "lnrs",
  "Bavarian": "lnrs",
  "Alemannic": "lnrs",
  "Swabian": "lnrs",
  "Upper Austrian German": "lnrs",
  "Palatinate German": "lnrs",
  "Mainfränkisch": "lnrs",
  "Ripuarian": "lnrs",
  "Moselle Franconian": "lnrs",
  "Low Saxon": "lnrs",
  "Low German": "lnrs",
  "Dutch": "lnrt",
  "Flemish": "lnrt",
  "Afrikaans": "lnrt",
  "Luxembourgish": "lnrt",
  "Yiddish": "lnrt",
  "Scots": "lnrt",
  "English": "",
  "Middle English": "",
  "Old English": "",
  "Early Modern English": "",
  "English-based": "",

  // Indo-European - Slavic
  "Slavic": "lnrt",
  "East Slavic": "lnrt",
  "West Slavic": "lnrt",
  "Lechitic": "lnrt",
  "Czech-Slovak": "lnrt",
  "South Slavic": "lnrt",
  "Eastern South Slavic": "lnrt",
  "Western South Slavic": "lnrt",
  "Sorbian": "lnrt",

  // Indo-European - other
  "Celtic": "nld",
  "Goidelic": "nld",
  "Gaelic": "nld",
  "Brythonic": "nld",
  "Hellenic": "s",
  "Greek": "s",
  "Ancient Greek": "s",
  "Modern Greek": "s",
  "Armenian": "lnrt",
  "Albanian": "lnrt",
  "Baltic": "lnrt",
  "Indo-Aryan": "lnrt",
  "Dardic": "lnrt",
  "Iranian": "lnrt",
  "Indo-Iranian": "lnrt",
  "Nuristani": "lnrt",
  "Indo-European": "lnrt",
  "Illyrian": "lnrt",
  "Thracian": "lnrt",
  "Phrygian": "lnrt",
  "Ancient Macedonian": "lnrt",
  "Tocharian": "lnrt",

  // Uralic
  "Finnic": "akiut",
  "North Estonian": "akiut",
  "South Estonian": "akiut",
  "Livonian": "akiut",
  "Votic": "akiut",
  "Ingrian": "akiut",
  "Karelian": "akiut",
  "Veps": "akiut",
  "Ludic": "akiut",
  "Sami": "akiut",
  "Uralic": "lnrt",
  "Hungarian": "lnrt",
  "Ugric": "lnrt",
  "Mari": "lnrt",
  "Volga-Uralic": "lnrt",
  "Mordvin": "lnrt",
  "Erzya": "lnrt",
  "Moksha": "lnrt",
  "Permic": "lnrt",
  "Komi": "lnrt",
  "Udmurt": "lnrt",
  "Khanty": "lnrt",
  "Mansi": "lnrt",
  "Samoyedic": "lnrt",
  "Nenets": "lnrt",
  "Enets": "lnrt",
  "Nganasan": "lnrt",
  "Selkup": "lnrt",
  "Ob-Ugric": "lnrt",

  // Turkic
  "Turkic": "lnrt",
  "Oghuz Turkic": "lnrt",
  "Kipchak Turkic": "lnrt",
  "Karluk Turkic": "lnrt",
  "Siberian Turkic": "lnrt",
  "Oghur Turkic": "lnrt",
  "Common Turkic": "lnrt",

  // Mongolic
  "Mongolic": "aou",

  // Tungusic
  "Tungusic": "lnrt",

  // Koreanic
  "Koreanic": "",
  "Korean": "",

  // Japonic
  "Japonic": "ktps",
  "Japanese": "ktps",
  "Ryukyuan": "ktps",

  // Sino-Tibetan - all subgroups have no gemination in romanization
  "Sino-Tibetan": "",
  "Sinitic": "",
  "Chinese": "",
  "Tibeto-Burman": "",
  "Bai": "",
  "Karen": "",
  "Kuki-Chin": "",
  "Tangkhul": "",
  "Naga": "",
  "Bodo-Garo": "",
  "Mru": "",
  "Karbi": "",
  "Qiangic": "",
  "Gyalrongic": "",
  "Kiranti": "",
  "Tamangic": "",
  "Tani": "",
  "Kadu": "",
  "Luish": "",
  "Miji": "",
  "Kayan": "",
  "Meyor": "",
  "Nyishi": "",
  "Hrusish": "",
  "Kham-Magar": "",
  "Dhimal": "",
  "Lepcha": "",
  "Meitei": "",
  "Mizo": "",
  "Brahmic": "",
  "Trans-Himalayan": "",

  // Dravidian
  "Dravidian": "lnrt",
  "South Dravidian": "lnrt",
  "Central Dravidian": "lnrt",
  "North Dravidian": "lnrt",

  // Austroasiatic
  "Austroasiatic": "lnrt",
  "Munda": "lnrt",
  "Khasic": "lnrt",
  "Aslian": "lnrt",
  "Nicobarese": "lnrt",
  "Bahnaric": "lnrt",
  "Katuic": "lnrt",
  "Vietic": "lnrt",
  "Khmer": "lnrt",
  "Pearic": "lnrt",
  "Khmuic": "lnrt",
  "Palaungic": "lnrt",
  "Khasi-Pnar": "lnrt",
  "Monic": "lnrt",

  // Tai-Kadai
  "Tai-Kadai": "lnrt",
  "Tai": "lnrt",
  "Kadai": "lnrt",
  "Kam-Sui": "lnrt",
  "Hlai": "lnrt",
  "Kra": "lnrt",

  // Hmong-Mien
  "Hmong-Mien": "lnrt",

  // Austronesian
  "Austronesian": "lnrt",
  "Malayo-Polynesian": "lnrt",
  "Western Malayo-Polynesian": "lnrt",
  "Philippine": "lnrt",
  "Bornean": "lnrt",
  "Sama-Bajaw": "lnrt",
  "Oceanic": "lnrt",
  "Polynesian": "lnrt",
  "Micronesian": "lnrt",
  "Melanesian": "lnrt",
  "Formosan": "lnrt",
  "South Halmahera - West New Guinea": "lnrt",
  "Central-Eastern Malayo-Polynesian": "lnrt",
  "Central Malayo-Polynesian": "lnrt",
  "Eastern Malayo-Polynesian": "lnrt",

  // Papuan languages (all families - no gemination in romanization)
  "Trans-New Guinea": "",
  "Sepik": "",
  "Lower Sepik": "",
  "Ramu": "",
  "Sepik-Ramu": "",
  "Torricelli": "",
  "Border": "",
  "Kwomtari": "",
  "Pauwasi": "",
  "Skou": "",
  "Senagi": "",
  "Yam": "",
  "Left May": "",
  "Amto-Musan": "",
  "Busa": "",
  "Taiap": "",
  "Pyu": "",
  "Sulka": "",
  "Anem": "",
  "Burmeso": "",
  "Dem": "",
  "Kimaghama": "",
  "Konai": "",
  "Lepki": "",
  "Molof": "",
  "Morori": "",
  "Narau": "",
  "Pagi": "",
  "Pele-Ata": "",
  "Pochuri": "",
  "Sentani": "",
  "Tambora": "",
  "Tofanma": "",
  "Usku": "",
  "Yetfa": "",
  "Bayono-Awbono": "",
  "Awin-Pa": "",
  "Bosavi": "",
  "Dibiyaso": "",
  "Turama-Kikori": "",
  "Angan": "",
  "Duna-Pogaya": "",
  "East Kutubuan": "",
  "West Kutubuan": "",
  "Kikorian": "",
  "Strickland": "",
  "Teberan": "",
  "Wiru": "",
  "Eleman": "",
  "Karian": "",
  "Kiwaian": "",
  "Mailuan": "",
  "Manubaran": "",
  "Monumbo": "",
  "Morehead-Upper Maro": "",
  "Nuclear Trans New Guinea": "",
  "Somahai": "",
  "Ok": "",
  "Anim": "",
  "Marind": "",
  "Asmat": "",
  "Asmat-Kamoro": "",
  "Mek": "",
  "Kolopom": "",
  "Mor": "",
  "Mombum": "",
  "Momuna": "",
  "Lakes Plain": "",
  "South Bird's Head": "",
  "East Bird's Head": "",
  "West Bird's Head": "",
  "Hatam": "",
  "Mansim": "",
  "Nuclear Papuan": "",
  "Kwerba": "",
  "Papuan": "",
  "Arafundi": "",
  "Fas": "",
  "Kwomtari-Fas": "",
  "Bororo": "",
  "Cahuapanan": "",
  "Kanoê": "",
  "Korean-Ainu-Japanese": "",
  "Pidgin": "lnrt",
  "Creole": "lnrt",

  // Australian Aboriginal
  "Pama-Nyungan": "lnrt",
  "Gunwinyguan": "lnrt",
  "Nyulnyulan": "lnrt",
  "Worrorran": "lnrt",
  "Tangkic": "lnrt",
  "Jarrakan": "lnrt",
  "Arnhem": "lnrt",
  "Southern": "lnrt",
  "Western Daly": "lnrt",
  "Northern Daly": "lnrt",
  "Limilngan": "lnrt",
  "Tiwi": "lnrt",
  "Australian Aboriginal": "lnrt",
  "Iwaidjan": "lnrt",
  "Giimbiyu": "lnrt",
  "Wagiman": "lnrt",
  "Wardaman": "lnrt",

  // Language isolates
  "Language isolate": "r",
  "Language Isolate": "r",
  "Basque": "r",
  "Burushaski": "lnrt",
  "Elamite": "lnrt",
  "Sumerian": "",
  "Hadza": "lnrtkxgms",
  "Sandawe": "lnrtkxgms",
  "Ainu": "",
  "Kusunda": "",
  "Nihali": "",
  "Korean isolate": "",

  // American indigenous
  "Uto-Aztecan": "lnrt",  // Nahuatl is "l", others "lnrt"
  "Nahuatl": "l",
  "Quechuan": "l",
  "Aymaran": "lnrt",
  "Arawakan": "lnrt",
  "Arawak": "lnrt",
  "Tupian": "lnrt",
  "Cariban": "lnrt",
  "Pano-Tacanan": "lnrt",
  "Oto-Manguean": "lnrt",
  "Mixe-Zoque": "lnrt",
  "Mayan": "lnrt",
  "Na-Dené": "lnrt",
  "Athabaskan": "lnrt",
  "Tlingit": "lnrt",
  "Eskimo-Aleut": "lnrt",
  "Salishan": "lnrt",
  "Wakashan": "lnrt",
  "Algonquian": "lnrt",
  "Siouan": "lnrt",
  "Iroquoian": "lnrt",
  "Caddoan": "",
  "Hokan": "lnrt",
  "Penutian": "lnrt",
  "Muskogean": "lnrt",
  "Tsimshian": "",
  "Chinookan": "lnrt",
  "Plateau Penutian": "lnrt",
  "Coahuiltecan": "lnrt",
  "Tucanoan": "lnrt",
  "Guahiban": "lnrt",
  "Chibchan": "lnrt",
  "Choco": "lnrt",
  "Zamucoan": "lnrt",
  "Mataco-Guicuruan": "lnrt",
  "Guaicuruan": "lnrt",
  "Chonan": "lnrt",
  "Araucanian": "lnrt",
  "Mapudungun": "lnrt",
  "Chonan proper": "lnrt",
  "Barbacoan": "lnrt",
  "Yanomaman": "lnrt",
  "Guamo": "lnrt",
  "Warao": "lnrt",
  "Piaroa-Saliban": "lnrt",
  "Saliban": "lnrt",
  "Saliba-Piaroa": "lnrt",
  "Puinave": "lnrt",
  "Nukak": "lnrt",
  "Yagua": "lnrt",
  "Ticuna-Yuri": "lnrt",
  "Kunza": "lnrt",
  "Kawésqar": "lnrt",
  "Yahgan": "lnrt",
  "Chonan languages": "lnrt",
  "Misumalpan": "lnrt",
  "Xinca": "lnrt",
  "Lenca": "lnrt",
  "Kamsá": "lnrt",
  "Warrau": "lnrt",
  "Hopi": "",
  "Keresan": "lnrt",
  "Zuni": "",
  "Haida": "",
  "Kootenai": "",
  "Cayuse": "",
  "Molala": "",
  "Tunica": "",
  "Natchez": "",
  "Atakapa": "",
  "Chitimacha": "",
  "Taruma": "",
  "Yuchi": "",
  "Siouan-Catawban": "lnrt",
  "Saparo-Yawan": "lnrt",
  "Sáliba": "lnrt",
  "Guahibo": "lnrt",
  "Guahiban-Mañireté": "lnrt",
  "Arawak proper": "lnrt",
  "Tucano": "lnrt",
  "Waorani": "lnrt",
  "Cofán": "lnrt",
  "Siona": "lnrt",
  "Andoque": "lnrt",
  "Tamanaku-Maipure": "lnrt",

  // Constructed / Artificial
  "Constructed": "lnrt",
  "Esperanto": "",
  "Interlingua": "",
  "Loglan": "",
  "Lojban": "",
  "Quenya": "nlts",
  "Sindarin": "nlrng",
  "Na'vi": "",
  "Klingon": "",

  // Caucasian
  "Northeast Caucasian": "lnrt",
  "Northwest Caucasian": "lnrt",
  "Kartvelian": "lnrt",
  "South Caucasian": "lnrt",
  "Abkhaz": "lnrt",
  "Circassian": "lnrt",

  // Chukotko-Kamchatkan
  "Chukotko-Kamchatkan": "lnrt",

  // Yeniseian
  "Yeniseian": "lnrt",

  // Eskimo-Aleut specific
  "Yupik": "lnrt",
  "Inuit": "lnrt",
  "Aleut": "lnrt",

  // Andamanese
  "Andamanese": "",
  "Great Andamanese": "",
  "Ongan": "",

  // Sign languages
  "Sign language": "",
};

// ============================================================
// CATEGORY-specific overrides (when family match isn't found)
// ============================================================
const CATEGORY_D_MAP = {
  // Romance subgroups
  "Romance": "lnrt",  // Default Romance; family-level mapping is more specific
  "Occitan": "nlr",
  "Italian": "cltr",
  "Catalan": "lr",
  "Spanish": "lr",
  "Portuguese": "lrs",
  "French": "nlrs",
  "Romanian": "lnr",

  // Germanic subgroups
  "Germanic": "lnrt",
  "German": "lnrs",
  "Dutch": "lnrt",
  "English": "",

  // Slavic
  "Slavic": "lnrt",

  // Arabic varieties
  "Arabic": "ae",

  // Sino-Tibetan (all - no gemination)
  "Sino-Tibetan": "",
  "Sinitic": "",
  "Chinese": "",
  "Tibeto-Burman": "",

  // Turkic
  "Turkic": "lnrt",

  // Papuan (all - no gemination)
  "Papuan": "",
  "Sepik": "",
  
  // American indigenous
  "Algonquian": "lnrt",
  "Na-Dene": "lnrt",
  "Eskimo-Aleut": "lnrt",
  "Athabaskan": "lnrt",
  "Salishan": "lnrt",
  "Siouan": "lnrt",
  "Iroquoian": "lnrt",
  "Uto-Aztecan": "lnrt",
  "Quechuan": "l",
  "Mayan": "lnrt",
  "Oto-Manguean": "lnrt",
  "Mixe-Zoque": "lnrt",

  // Dravidian
  "Dravidian": "lnrt"
};

// ============================================================
// Specific name overrides for corner cases
// ============================================================
const SPECIFIC_OVERRIDES = {
  "Nahuatl": "l",
  "Quechua": "l",
  "Kichwa": "l",
  "Hopi": "",
  "Zuni": "",
  "Haida": "",
  "English": "",
  "Scottish English": "",
  "American English": "",
  "British English": "",
  "Canadian English": "",
  "Australian English": "",
  "New Zealand English": "",
  "South African English": "",
  "Irish English": "",
  "Indian English": "",
  "Nigerian English": "",
  "Jamaican English": "",
  "Newfoundland English": "",
  "Middle English": "",
  "Old English": "",
  "Japanese": "ktps",
  "Korean": "",
  "Jeju": "",
  "Ainu": "",
  "Sumerian": "",
  "Etruscan": "lnrt",
  "Rhaetic": "lnrt",
  "Zuni": "",
  "Seri": "lnrt",
  "Hadza": "lnrtkxgms",
  "Sandawe": "lnrtkxgms",
  "Esperanto": "",
};

// ============================================================
// Parse namebase files
// ============================================================
function parseNamebaseFile(filepath) {
  const content = fs.readFileSync(filepath, "utf8");
  // Extract the JS array content - match window.X = [...] allowing trailing content
  const match = content.match(/window\.\w+\s*=\s*\[([\s\S]*)\]\s*;/);
  if (!match) {
    console.error("ERROR: Cannot parse " + filepath);
    return { header: "", entries: [], footer: content };
  }
  const arrContent = match[1];
  const header = content.substring(0, content.indexOf(arrContent));
  const footer = content.substring(content.indexOf(arrContent) + arrContent.length);

  // Parse individual entries
  // Each entry is: {"name": "...", "i": N, "min": N, "max": N, "d": "...", "m": N, "b": "..."}
  const entries = [];
  // Match from {"name": to the closing } of each entry
  // Use a state-machine approach since entries can contain nested braces
  let depth = 0;
  let inEntry = false;
  let entryStart = 0;

  for (let i = 0; i < arrContent.length; i++) {
    const c = arrContent[i];
    if (c === "{") {
      if (depth === 0) {
        entryStart = i;
        inEntry = true;
      }
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && inEntry) {
        entries.push(arrContent.substring(entryStart, i + 1));
        inEntry = false;
      }
    }
  }

  return { header, entries, footer, fullContent: content, arrContent };
}

// ============================================================
// Parse a single entry block
// ============================================================
function parseEntry(entryStr) {
  const fields = {};
  // Extract key-value pairs
  const fieldRe = /"(\w+)":\s*("([^"]*(?:""[^"]*)*)"|[\d.]+)/g;
  let m;
  while ((m = fieldRe.exec(entryStr)) !== null) {
    const key = m[1];
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else {
      val = Number(val);
    }
    fields[key] = val;
  }
  return fields;
}

// ============================================================
// Serialize an entry back to string
// ============================================================
function serializeEntry(fields) {
  const lines = ['{'];
  const keys = ["name", "i", "min", "max", "d", "m", "b"];
  const assignLines = [];

  for (const key of keys) {
    if (fields[key] === undefined) continue;
    if (typeof fields[key] === "string") {
      assignLines.push(`"${key}": "${fields[key]}"`);
    } else if (typeof fields[key] === "number") {
      assignLines.push(`"${key}": ${fields[key]}`);
    }
  }

  return "  " + assignLines.join(",\n  ") + "\n}";
}

// ============================================================
// Determine correct d-value for an entry
// ============================================================
function getCorrectDValue(entryName, catalogEntry) {
  // Priority 1: Specific overrides
  if (SPECIFIC_OVERRIDES.hasOwnProperty(entryName)) {
    return SPECIFIC_OVERRIDES[entryName];
  }

  if (!catalogEntry) {
    return "lnrt"; // Safe default
  }

  const family = catalogEntry.family || "";
  const category = catalogEntry.category || "";
  const region = catalogEntry.region || "";

  // Priority 2: Family match
  if (FAMILY_D_MAP.hasOwnProperty(family)) {
    return FAMILY_D_MAP[family];
  }

  // Priority 3: Category match
  if (CATEGORY_D_MAP.hasOwnProperty(category)) {
    return CATEGORY_D_MAP[category];
  }

  // Priority 4: Special cases based on region/family patterns
  // Papuan languages (identified by region = Pacific or family containing "Papuan"/"Trans-New Guinea")
  if (family.includes("Papuan") || family.includes("Trans-New Guinea") ||
      family.includes("Sepik") || family.includes("Torricelli") ||
      family.includes("Border") || family.includes("Skou") ||
      family.includes("Kwomtari") || family.includes("Pauwasi") ||
      family.includes("Yam") || family.includes("Left May") ||
      family.includes("Amto-Musan") || family.includes("Anim") ||
      family.includes("Mek") || family.includes("Kolopom") ||
      family.includes("Marind") || family.includes("Eleman") ||
      family.includes("Kiwaian") || family.includes("Karian") ||
      family.includes("Wiru") || family.includes("Teberan") ||
      family.includes("Morehead") || family.includes("Senagi") ||
      family.includes("Bayono") || family.includes("Awin") ||
      family.includes("Ok") || family.includes("Duna") ||
      family.includes("Kutubuan") || family.includes("Kikorian") ||
      family.includes("Strickland") || family.includes("Mailuan") ||
      family.includes("Manubaran") || family.includes("Monumbo") ||
      family.includes("Mombum") || family.includes("Momuna") ||
      family.includes("Lakes Plain") || family.includes("Mansim") ||
      family.includes("Sulka") || family.includes("Anem") ||
      family.includes("Burmeso") || family.includes("Fas") ||
      family.includes("Taiap") || family.includes("Pyu") ||
      family.includes("Yuri") || family.includes("Ticuna") ||
      region === "Pacific") {
    return "";
  }

  // Sino-Tibetan by region
  if (region === "Sino-Tibetan region") {
    return "";
  }

  // Quechuan by region/category indicators
  if (family.includes("Quechuan") || family.includes("Quechua") ||
      category.includes("Quechuan") || category.includes("Quechua")) {
    return "l";
  }

  // Nahuatl by category
  if (category.includes("Nahuatl") || category.includes("Uto-Aztecan")) {
    return "l"; // Nahuatl and Uto-Aztecan languages often use l gemination
  }

  // Chinese by family
  if (family.includes("Chinese") || family.includes("Sinitic")) {
    return "";
  }

  // Click languages
  if (family.includes("Kx'a") || family.includes("Khoisan") ||
      entryName.includes("ǃ") || entryName.includes("ǁ") ||
      entryName.includes("ǂ") || entryName.includes("Click") ||
      entryName.includes("Kung") || entryName.includes("Khoe")) {
    return "lnrtkxgms";
  }

  // Safe default for most languages
  return "lnrt";
}

// ============================================================
// Check if a d-value is corrupted (not a valid phonotactic rule)
// ============================================================
function isCorruptedD(d) {
  if (!d) return false; // empty is valid (no doubling allowed)
  // Valid d-values are purely lowercase letters
  if (/^[a-z]*$/.test(d)) return false;
  // Anything with uppercase, dashes, or numbers is corrupted
  return true;
}

// ============================================================
// Chinese character detection
// ============================================================
function containsChinese(str) {
  // CJK Unified Ideographs, CJK Unified Ideographs Extension A
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(str);
}

// ============================================================
// Clean a single name from the name list
// ============================================================
function cleanName(name) {
  let cleaned = name;
  // Remove Chinese characters
  if (containsChinese(cleaned)) {
    cleaned = cleaned.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '');
  }
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim();
  // Remove _unq variants
  cleaned = cleaned.replace(/_unq\d+\b/gi, '').replace(/_u\d+\b/gi, '');
  // Remove underscores
  cleaned = cleaned.replace(/_/g, '');
  // Remove digits
  cleaned = cleaned.replace(/\d/g, '');
  // Remove pipes
  cleaned = cleaned.replace(/\|/g, '');
  return cleaned;
}

// ============================================================
// Process a file
// ============================================================
function processFile(filename, catalog, catalogByStrippedName) {
  const filepath = path.join(MODULES_DIR, filename);
  const { header, entries, footer } = parseNamebaseFile(filepath);

  if (!entries.length) {
    console.log("  WARNING: Could not parse entries from " + filename);
    return { changed: false, dFixes: 0, nameFixes: 0, dupeFixes: 0, totalEntries: 0 };
  }

  let dFixes = 0;
  let nameFixes = 0;
  let dupeFixes = 0;
  let collisionWarnings = 0;
  const newEntries = [];

  for (const entryStr of entries) {
    const fields = parseEntry(entryStr);
    if (!fields.name) {
      newEntries.push(entryStr);
      continue;
    }

    let changed = false;

    // Fix 1: d-field
    if (isCorruptedD(fields.d)) {
      const correctD = getCorrectDValue(fields.name, catalog.get(fields.name) || catalogByStrippedName.get(fields.name));
      if (fields.d !== correctD) {
        fields.d = correctD;
        dFixes++;
        changed = true;
      }
    }

    // Fix 2: Clean names in b-field and deduplicate
    if (fields.b) {
      const names = fields.b.split(",").map(n => n.trim());
      const cleanedNames = [];
      const seen = new Set();

      for (let name of names) {
        const hadChinese = containsChinese(name);
        const hadLeadingSpace = name !== name.trim();
        name = cleanName(name);

        // Skip empty names after cleaning
        if (!name) {
          if (hadChinese) nameFixes++;
          continue;
        }

        if (hadChinese || hadLeadingSpace) {
          nameFixes++;
        }

        // Deduplicate
        const lowerName = name.toLowerCase();
        if (seen.has(lowerName)) {
          dupeFixes++;
          continue;
        }
        seen.add(lowerName);
        cleanedNames.push(name);
      }

      if (cleanedNames.length !== names.length || nameFixes > 0) {
        fields.b = cleanedNames.join(",");
        changed = true;
      }
    }

    // Fix 3: Clean entry name (leading spaces)
    const originalName = fields.name;
    fields.name = fields.name.trim();
    if (fields.name !== originalName) {
      nameFixes++;
      changed = true;
    }

    newEntries.push(changed ? serializeEntry(fields) : entryStr);
  }

  const totalChanged = dFixes + nameFixes + dupeFixes;

  if (totalChanged > 0 && !DRY_RUN) {
    // Reconstruct the file
    const indent = "  ";
    const formattedEntries = newEntries.map((e, i) => {
      const comma = i < newEntries.length - 1 ? "," : "";
      return indent + e + comma;
    }).join("\n");

    const newContent = header + "[\n" + formattedEntries + "\n]" + (footer.includes(";") ? ";" : "");
    fs.writeFileSync(filepath, newContent, "utf8");
  }

  return { changed: totalChanged > 0, dFixes, nameFixes, dupeFixes, totalEntries: entries.length };
}

// ============================================================
// Strip entries from filename (for continent detection)
// ============================================================
function getContinentFromFile(filename) {
  return filename.replace("namebases-", "").replace(".js", "");
}

// ============================================================
// MAIN
// ============================================================
function main() {
  console.log("=== Master Namebase Fix Script ===");
  console.log("Mode: " + (DRY_RUN ? "DRY RUN (no changes written)" : "COMMIT MODE"));
  console.log("");

  // Load catalog
  const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));
  const catalogByName = new Map();
  const catalogByStrippedName = new Map();
  for (const entry of catalog) {
    catalogByName.set(entry.name, entry);
    if (entry.name.endsWith(" language")) {
      catalogByStrippedName.set(entry.name.slice(0, -9), entry);
    }
  }
  console.log("Loaded catalog with " + catalog.length + " entries");

  const files = [
    "namebases-africa.js",
    "namebases-asia.js",
    "namebases-europe.js",
    "namebases-northAmerica.js",
    "namebases-southAmerica.js",
    "namebases-oceania.js",
    "namebases-unknown.js"
  ];

  let totalDFixes = 0;
  let totalNameFixes = 0;
  let totalDupeFixes = 0;
  let totalEntries = 0;
  const changedFiles = [];

  for (const f of files) {
    console.log("\nProcessing: " + f);
    const result = processFile(f, catalogByName, catalogByStrippedName);
    totalDFixes += result.dFixes;
    totalNameFixes += result.nameFixes;
    totalDupeFixes += result.dupeFixes;
    totalEntries += result.totalEntries;

    if (result.changed) {
      changedFiles.push(f);
      console.log("  d-field fixes: " + result.dFixes);
      console.log("  name fixes:    " + result.nameFixes);
      console.log("  dupe fixes:    " + result.dupeFixes);
      console.log("  entries:       " + result.totalEntries);
    } else {
      console.log("  No changes needed (" + result.totalEntries + " entries)");
    }
  }

  console.log("\n=== Summary ===");
  console.log("Total entries processed: " + totalEntries);
  console.log("d-field fixes:           " + totalDFixes);
  console.log("Name/data fixes:         " + totalNameFixes);
  console.log("Duplicate removals:      " + totalDupeFixes);
  console.log("Total changes:           " + (totalDFixes + totalNameFixes + totalDupeFixes));
  if (DRY_RUN && (totalDFixes + totalNameFixes + totalDupeFixes) > 0) {
    console.log("\n*** This was a DRY RUN. Run with --commit to apply changes. ***");
  }
}

main();
