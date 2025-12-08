"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

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

function upsertMix(mixes, entry) {
  const idx = mixes.findIndex(m => m.iso === entry.iso);
  if (idx === -1) {
    mixes.push(entry);
  } else {
    mixes[idx] = Object.assign({}, mixes[idx], entry);
  }
}

function upsertMapEntry(map, iso, bases) {
  const idx = map.findIndex(e => e.iso === iso);
  const entry = {iso, bases: bases.slice()};
  if (idx === -1) {
    map.push(entry);
  } else {
    map[idx] = entry;
  }
}

// New or refined Mongolic and closely related entries for language-mixes.json.
const MONGOLIC_ENTRIES = [
  // Central / Khalkha cluster
  {iso: "khalkha", name: "Khalkha Mongolian", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "northern-khalkha", name: "Northern Khalkha", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "southern-khalkha", name: "Southern Khalkha", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "khamnigan", name: "Khamnigan Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "darkhad", name: "Darkhad Mongolian", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "shilingol-khalkha", name: "Shilingol / Xilingol Khalkha", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "sonid", name: "Sonid Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "ulaanchab", name: "Ulaanchab Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "alasha", name: "Alasha Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},

  // Western / Oirat-Kalmyk
  {iso: "oirat", name: "Oirat Mongolian", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "torgut", name: "Torgut Oirat", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "sart-kalmyk", name: "Sart Kalmyk", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "dorbet-oirat", name: "Dorbet Oirat", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "bayat-oirat", name: "Bayat Oirat", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "altai-uriankhai", name: "Altai Uriankhai", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "oeld", name: "Oeld", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "zakhchin", name: "Zakhchin", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},
  {iso: "khoton", name: "Khoton", region: "Asia", category: "Mongolic", family: "Oirat-Kalmyk"},

  // Peripheral Mongolic
  {iso: "baarin", name: "Baarin Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "chakhar", name: "Chakhar Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "khorchin", name: "Khorchin Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "kharchin-khorchin", name: "Kharchin / Khorchin Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "ordos", name: "Ordos Mongol", region: "Asia", category: "Mongolic", family: "Mongolic"},

  // Buryat cluster
  {iso: "khori-buryat", name: "Khori Buryat", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "alar-tunka-buryat", name: "Alar-Tunka Buryat", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "ekhirit-bulagat-buryat", name: "Ekhirit-Bulagat Buryat", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "bargut-buryat", name: "Bargut Buryat", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "lower-uda-buryat", name: "Lower Uda Buryat", region: "Asia", category: "Mongolic", family: "Mongolic"},

  // Dagur / Daur cluster
  {iso: "dagur", name: "Daur / Dagur", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "nonni-dagur", name: "Nonni Dagur", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "hailar-dagur", name: "Hailar Dagur", region: "Asia", category: "Mongolic", family: "Mongolic"},
  {iso: "amur-dagur", name: "Amur Dagur", region: "Asia", category: "Mongolic", family: "Mongolic"},

  // Southern Mongolic / Yugur
  {iso: "eastern-yugur", name: "Eastern Yugur", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},
  {iso: "shira-yugur", name: "Shira Yugur", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},

  // Shirongolic / Monguor cluster
  {iso: "monguor", name: "Monguor", region: "Asia", category: "Mongolic", family: "Shirongolic"},
  {iso: "mongghul", name: "Mongghul", region: "Asia", category: "Mongolic", family: "Shirongolic"},
  {iso: "mongghuor", name: "Mongghuor", region: "Asia", category: "Mongolic", family: "Shirongolic"},
  {iso: "mangghuer", name: "Mangghuer", region: "Asia", category: "Mongolic", family: "Shirongolic"},

  // Baoanic / Bonan / Kangjia cluster
  {iso: "baoan", name: "Baoan", region: "Asia", category: "Mongolic", family: "Baoanic"},
  {iso: "bonan", name: "Bonan (Manegacha)", region: "Asia", category: "Mongolic", family: "Baoanic"},
  {iso: "bonan-manegacha", name: "Bonan Manegacha", region: "Asia", category: "Mongolic", family: "Baoanic"},
  {iso: "tongren-bonan", name: "Tongren Bonan", region: "Asia", category: "Mongolic", family: "Baoanic"},
  {iso: "nantoq-baoan", name: "Nantoq Baoan", region: "Asia", category: "Mongolic", family: "Baoanic"},
  {iso: "bonan-kangjia", name: "Transitional Bonan-Kangjia", region: "Asia", category: "Mongolic", family: "Shirongolic"},
  {iso: "kangjia", name: "Kangjia", region: "Asia", category: "Mongolic", family: "Shirongolic"},

  // Santa / Dongxiang cluster
  {iso: "santa", name: "Santa / Sarta (Dongxiang)", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},
  {iso: "dongxiang", name: "Dongxiang", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},
  {iso: "santa-suonanba", name: "Santa Suonanba", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},
  {iso: "santa-wangjiaji", name: "Santa Wangjiaji", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},
  {iso: "santa-sijiaji", name: "Santa Sijiaji", region: "Asia", category: "Mongolic", family: "Southern Mongolic"},

  // Historical Mongolic
  {iso: "proto-mongolic", name: "Proto-Mongolic", region: "Asia", category: "Mongolic", family: "Proto-Mongolic", tags: ["proto", "historical"]},
  {iso: "middle-mongol", name: "Middle Mongol", region: "Asia", category: "Mongolic", family: "Historical Mongolic", tags: ["historical"]},
  {iso: "classical-mongolian", name: "Classical Mongolian", region: "Asia", category: "Mongolic", family: "Historical Mongolic", tags: ["historical"]},

  // Other related
  {iso: "rouran", name: "Rouran", region: "Asia", category: "Mongolic", family: "Para-Mongolic", tags: ["historical", "hypothetical"]},
  {iso: "moghol", name: "Moghol / Mogholi", region: "Asia", category: "Mongolic", family: "Mongolic", tags: ["historical"]},

  // Mixed Gansu-Qinghai Sprachbund (new entry; Tangwang/Wutun already exist)
  {iso: "qoqmoncaq", name: "Qoqmoncaq", region: "Misc", category: "Mixed", family: "Mixed", tags: ["creole"]}
];

// Base index plan for Mongolic-related varieties.
// 31 = Mongolian, 276 = Buryat, 296 = Kalmyk, 11 = Chinese
const MONGOLIC_BASES = new Map([
  // Central / Khalkha cluster
  ["khalkha", [31]],
  ["northern-khalkha", [31]],
  ["southern-khalkha", [31]],
  ["khamnigan", [31, 276]],
  ["darkhad", [31, 276]],
  ["shilingol-khalkha", [31]],
  ["sonid", [31]],
  ["ulaanchab", [31]],
  ["alasha", [31, 296]],

  // Western / Oirat-Kalmyk
  ["oirat", [31, 296]],
  ["torgut", [296]],
  ["sart-kalmyk", [296, 31]],
  ["dorbet-oirat", [296, 31]],
  ["bayat-oirat", [296, 31]],
  ["altai-uriankhai", [31, 296]],
  ["oeld", [296, 31]],
  ["zakhchin", [296, 31]],
  ["khoton", [296, 31]],

  // Peripheral
  ["baarin", [31]],
  ["chakhar", [31]],
  ["khorchin", [31]],
  ["kharchin-khorchin", [31]],
  ["ordos", [31]],

  // Buryat cluster
  ["khori-buryat", [276]],
  ["alar-tunka-buryat", [276]],
  ["ekhirit-bulagat-buryat", [276]],
  ["bargut-buryat", [276]],
  ["lower-uda-buryat", [276]],

  // Dagur / Daur
  ["dagur", [31, 276]],
  ["nonni-dagur", [31, 276]],
  ["hailar-dagur", [31, 276]],
  ["amur-dagur", [31, 276]],

  // Yugur
  ["eastern-yugur", [31, 296]],
  ["shira-yugur", [31, 296]],

  // Shirongolic / Monguor
  ["monguor", [31]],
  ["mongghul", [31]],
  ["mongghuor", [31]],
  ["mangghuer", [31]],

  // Baoanic / Bonan / Kangjia
  ["baoan", [31]],
  ["bonan", [31]],
  ["bonan-manegacha", [31]],
  ["tongren-bonan", [31]],
  ["nantoq-baoan", [31]],
  ["bonan-kangjia", [31]],
  ["kangjia", [31]],

  // Santa / Dongxiang
  ["santa", [31, 296]],
  ["dongxiang", [31, 296]],
  ["santa-suonanba", [31, 296]],
  ["santa-wangjiaji", [31, 296]],
  ["santa-sijiaji", [31, 296]],

  // Historical / para-Mongolic
  ["proto-mongolic", [31, 276, 296]],
  ["middle-mongol", [31, 276, 296]],
  ["classical-mongolian", [31, 276, 296]],
  ["rouran", [31, 276, 296]],
  ["moghol", [31, 276, 296]],

  // Mixed Sprachbund
  ["qoqmoncaq", [31, 11]],

  // Adjust existing mixed entries to include Mongolic influence
  ["tangwang", [31, 11]],
  ["wutunhua", [31, 11]]
]);

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  for (const entry of MONGOLIC_ENTRIES) {
    upsertMix(mixes, entry);
  }

  for (const [iso, bases] of MONGOLIC_BASES.entries()) {
    upsertMapEntry(map, iso, bases);
  }

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  map.sort((a, b) => {
    const ai = a.iso || "";
    const bi = b.iso || "";
    return ai.localeCompare(bi);
  });

  writeJson("config/language-mixes.json", mixes);
  writeJson("config/language-mixer-map.json", map);

  console.log("Mongolic mixes and mappings updated.");
}

if (require.main === module) main();
