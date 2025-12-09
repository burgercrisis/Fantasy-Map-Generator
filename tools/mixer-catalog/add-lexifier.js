"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "config", "language-mixes.json");

const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const data = JSON.parse(raw);

let updated = 0;
let candidates = 0;

const explicitLexifierMap = {
  "Jamaican Creole": "English",
  "Bozal Spanish": "Spanish",
  "Chavacano": "Spanish",
  "Palenquero": "Spanish",
  "Nagamese": "Assamese",
  "Tangwang": "Chinese",
  "Unserdeutsch": "German",
  "Andaman Creole Hindi": "Hindi",
  "Yilan Creole Japanese": "Japanese",
  "Kanbun Kundoku": "Japanese",
  "Kituba": "Kongo",
  "Sango": "Ngbandi",
  "Oorlams Creole": "Afrikaans",
  "Pretoria Sotho": "Sotho-Tswana",
  "Vedda language": "Sinhala",
  "Tsotsitaal": "Tswana",
  "Algonquian–Basque pidgin": "Algonquian-Basque",
  "Arafundi-Enga Pidgin": "Arafundi-Enga",
  "Bamboo English": "English",
  "Barikanchi Pidgin": "Hausa",
  "Basque–Icelandic pidgin": "Basque-Icelandic",
  "Bimbashi Arabic": "Arabic",
  "Bislama": "English",
  "Bongor Arabic": "Arabic",
  "Borgarmålet": "Swedish",
  "Broken Oghibbeway": "Ojibwe",
  "Broken Slavey": "Slavey",
  "Broome Pearling Lugger Pidgin": "English",
  "Camtho": "Nguni",
  "Cocoliche": "Italian-Spanish",
  "Duvle-Wano Pidgin": "Duvle-Wano",
  "Eskimo Trade Jargon": "Inuit",
  "Ewondo Populaire": "Ewondo",
  "Fanagalo": "Zulu",
  "Français Tirailleur": "French",
  "Haflong Hindi": "Hindi",
  "International Sign": "Sign Language",
  "Inuktitut-English Pidgin": "Inuktitut-English",
  "Italian Eritrean": "Italian",
  "Italo-Paulista": "Italian-Portuguese",
  "Kiautschou Pidgin German": "German",
  "KiKAR": "Swahili",
  "Kwoma-Manambu Pidgin": "Kwoma-Manambu",
  "Kyakhta Russian–Chinese Pidgin": "Russian-Chinese",
  "Kyowa-go": "Japanese-Chinese",
  "Labrador Inuit Pidgin French": "Inuit-French",
  "Loucheux Jargon": "Gwich'in",
  "Madras Bashai": "Tamil",
  "Maridi Arabic": "Arabic",
  "Maritime Polynesian Pidgin": "Polynesian",
  "Mediterranean Lingua Franca": "Romance",
  "Mekeo pidgins": "Mekeo",
  "Mobilian Jargon": "Mobilian",
  "Namibian Black German": "German",
  "Ndyuka-Tiriyó Pidgin": "Ndyuka-Tiriyó",
  "Nefamese": "Assamese",
  "Nigerian Pidgin": "English",
  "Nootka Jargon": "Nootka",
  "Pidgin Delaware": "Delaware",
  "Pidgin Hawaiian": "Hawaiian",
  "Pidgin Iha": "Iha",
  "Pidgin Ngarluma": "Ngarluma",
  "Pidgin Onin": "Onin",
  "Pidgin Wolof": "Wolof",
  "Pijin": "English",
  "Roquetas Pidgin Spanish": "Spanish",
  "Russenorsk": "Russian-Norwegian",
  "Settler Swahili": "Swahili",
  "Simplified Italian of Libya": "Italian",
  "Simplified Italian of Somalia": "Italian",
  "Taimyr Pidgin Russian": "Russian",
  "Tây Bồi Pidgin French": "French",
  "Tinglish": "Thai-English",
  "Te Parau Tinito": "Chinese-Tahitian",
  "Tok Pisin": "English",
  "Turku Arabic": "Arabic",
  "West Greenlandic Pidgin": "Greenlandic",
  "Yokohama Pidgin Japanese": "Japanese",
  "Xieheyu": "Chinese",
  "Arabic–Javanese of Klego": "Arabic-Javanese",
  "Bolze": "German-French",
  "Bonin English": "English",
  "Cappadocian Greek": "Greek-Turkish",
  "Cauque Mayan language": "Mayan",
  "Cypriot Maronite-Arabic": "Arabic",
  "Dao": "Dao",
  "E": "Chinese",
  "Gadal": "Arabic",
  "Gurindji Kriol": "Gurindji-English",
  "Hezhou": "Chinese",
  "Lingling": "Chinese",
  "Língua Geral Amazônica": "Tupian",
  "Língua Geral Paulista": "Tupian",
  "Light Warlpiri": "Warlpiri-English",
  "Makassar Malay": "Malay",
  "Mbugu": "Bantu-Cushitic",
  "Media Lengua": "Quechua-Spanish",
  "Mednyj Aleut": "Aleut-Russian",
  "Michif": "Cree-French",
  "Missingsch": "German",
  "Para-Romani languages": "Romani",
  "Petuh": "German-French",
  "Tansi": "Chinese",
  "Waxiang": "Chinese",
  "Wutunhua": "Chinese-Tibetan",
  "Badong Yao": "Chinese",
  "Maojia": "Chinese",
  "She Chinese": "Chinese",
  "Yeheni": "Chinese",
  "Younian": "Chinese",
  "Sranan": "English"
};

function inferLexifierFromFamily(lang) {
  if (!lang) return null;
  const name = lang.name || "";
  const family = lang.family || "";

  if (name && explicitLexifierMap[name]) {
    return explicitLexifierMap[name];
  }

  if (family) {
    const lower = family.toLowerCase();
    const idx = lower.indexOf("-based");
    if (idx !== -1) {
      let base = family.slice(0, idx);
      base = base.replace(/[-–]+$/g, "");
      base = base.trim();
      if (base) return base;
    }
  }

  if (lang.category === "Creole" || lang.category === "Pidgin") {
    if (family === "Creole" || family === "Pidgin" || family === "Mixed") {
      if (name.indexOf("English") !== -1) return "English";
      if (name.indexOf("French") !== -1) return "French";
      if (name.indexOf("Portuguese") !== -1) return "Portuguese";
      if (name.indexOf("Spanish") !== -1) return "Spanish";
      if (name.indexOf("Dutch") !== -1) return "Dutch";
      if (name.indexOf("Malay") !== -1) return "Malay";
      if (name.indexOf("Arabic") !== -1) return "Arabic";
      if (name.indexOf("German") !== -1) return "German";
      if (name.indexOf("Japanese") !== -1) return "Japanese";
      if (name.indexOf("Chinese") !== -1) return "Chinese";
      if (name.indexOf("Hindi") !== -1) return "Hindi";
      if (name.indexOf("Russian") !== -1) return "Russian";
      if (name.indexOf("Swahili") !== -1) return "Swahili";
      if (name.indexOf("Italian") !== -1) return "Italian";
      if (name.indexOf("Norwegian") !== -1) return "Norwegian";
      if (name.indexOf("Tahitian") !== -1) return "Tahitian";
      if (name.indexOf("Tibetan") !== -1) return "Tibetan";
      if (name.indexOf("Inuktitut") !== -1) return "Inuktitut";
      if (name.indexOf("Ojibwe") !== -1) return "Ojibwe";
      if (name.indexOf("Slavey") !== -1) return "Slavey";
      if (name.indexOf("Nguni") !== -1) return "Nguni";
      if (name.indexOf("Hausa") !== -1) return "Hausa";
      if (name.indexOf("Zulu") !== -1) return "Zulu";
      if (name.indexOf("Swedish") !== -1) return "Swedish";
      if (name.indexOf("Basque") !== -1) return "Basque";
      if (name.indexOf("Icelandic") !== -1) return "Icelandic";
      if (name.indexOf("Gwich'in") !== -1) return "Gwich'in";
      if (name.indexOf("Tamil") !== -1) return "Tamil";
      if (name.indexOf("Romance") !== -1) return "Romance";
      if (name.indexOf("Mekeo") !== -1) return "Mekeo";
      if (name.indexOf("Mobilian") !== -1) return "Mobilian";
      if (name.indexOf("Nootka") !== -1) return "Nootka";
      if (name.indexOf("Delaware") !== -1) return "Delaware";
      if (name.indexOf("Hawaiian") !== -1) return "Hawaiian";
      if (name.indexOf("Iha") !== -1) return "Iha";
      if (name.indexOf("Ngarluma") !== -1) return "Ngarluma";
      if (name.indexOf("Onin") !== -1) return "Onin";
      if (name.indexOf("Wolof") !== -1) return "Wolof";
      if (name.indexOf("Greenlandic") !== -1) return "Greenlandic";
      if (name.indexOf("Cree") !== -1) return "Cree";
      if (name.indexOf("Aleut") !== -1) return "Aleut";
      if (name.indexOf("Quechua") !== -1) return "Quechua";
      if (name.indexOf("Warlpiri") !== -1) return "Warlpiri";
      if (name.indexOf("Tupian") !== -1) return "Tupian";
      if (name.indexOf("Mayan") !== -1) return "Mayan";
      if (name.indexOf("Greek") !== -1) return "Greek";
      if (name.indexOf("Turkish") !== -1) return "Turkish";
      if (name.indexOf("Javanese") !== -1) return "Javanese";
      if (name.indexOf("Romani") !== -1) return "Romani";
    }
  }

  if (lang.category === "Mixed") {
    if (name.indexOf("Arabic") !== -1 && name.indexOf("Javanese") !== -1) return "Arabic-Javanese";
    if (name.indexOf("German") !== -1 && name.indexOf("French") !== -1) return "German-French";
    if (name.indexOf("Warlpiri") !== -1 && name.indexOf("English") !== -1) return "Warlpiri-English";
    if (name.indexOf("Quechua") !== -1 && name.indexOf("Spanish") !== -1) return "Quechua-Spanish";
    if (name.indexOf("Aleut") !== -1 && name.indexOf("Russian") !== -1) return "Aleut-Russian";
    if (name.indexOf("Cree") !== -1 && name.indexOf("French") !== -1) return "Cree-French";
    if (name.indexOf("Italian") !== -1 && name.indexOf("Spanish") !== -1) return "Italian-Spanish";
    if (name.indexOf("Romani") !== -1 && name.indexOf("Ibero") !== -1) return "Romani-Ibero-Romance";
    if (name.indexOf("Chinese") !== -1 && name.indexOf("Japanese") !== -1) return "Chinese-Japanese";
    if (name.indexOf("Chinese") !== -1 && name.indexOf("Tahitian") !== -1) return "Chinese-Tahitian";
    if (name.indexOf("Thai") !== -1 && name.indexOf("English") !== -1) return "Thai-English";
    if (name.indexOf("Russian") !== -1 && name.indexOf("Norwegian") !== -1) return "Russian-Norwegian";
    if (name.indexOf("Basque") !== -1 && name.indexOf("Icelandic") !== -1) return "Basque-Icelandic";
    if (name.indexOf("Algonquian") !== -1 && name.indexOf("Basque") !== -1) return "Algonquian-Basque";
    if (name.indexOf("Arafundi") !== -1 && name.indexOf("Enga") !== -1) return "Arafundi-Enga";
    if (name.indexOf("Kwoma") !== -1 && name.indexOf("Manambu") !== -1) return "Kwoma-Manambu";
    if (name.indexOf("Kyakhta Russian") !== -1 && name.indexOf("Chinese") !== -1) return "Russian-Chinese";
    if (name.indexOf("Inuktitut") !== -1 && name.indexOf("English") !== -1) return "Inuktitut-English";
    if (name.indexOf("Ndyuka") !== -1 && name.indexOf("Tiriyó") !== -1) return "Ndyuka-Tiriyó";
    if (name.indexOf("Chinese") !== -1 && name.indexOf("Tibetan") !== -1) return "Chinese-Tibetan";
  }

  return null;
}

const missing = [];

for (const lang of data) {
  const isCreolePidginMixed =
    lang.category === "Creole" ||
    lang.category === "Pidgin" ||
    lang.category === "Mixed" ||
    (Array.isArray(lang.tags) && (lang.tags.indexOf("creole") !== -1 || lang.tags.indexOf("pidgin") !== -1 || lang.tags.indexOf("mixed") !== -1));

  if (!isCreolePidginMixed) continue;

  candidates++;
  if (lang.lexifier) continue;

  const lex = inferLexifierFromFamily(lang);
  if (lex) {
    lang.lexifier = lex;
    updated++;
  } else {
    missing.push(lang.name || lang.iso || "(unknown)");
  }
}

data.sort((a, b) => ((a.region || "") + (a.name || "")).localeCompare((b.region || "") + (b.name || "")));

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Candidates:", candidates, "Updated lexifier on:", updated, "Still missing:", missing.length);
if (missing.length) {
  console.log("Missing lexifier for:");
  for (const name of missing) console.log(" -", name);
}
