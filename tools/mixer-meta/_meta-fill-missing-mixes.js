"use strict";

// Shared META table used by fill-all-missing-mixes.js and
// fill-missing-mixes-explicit.js to attach nicer names, categories,
// and regions to important ISOs when backfilling language-mixes.json.

const META = {
  akkadian: {name: "Akkadian", category: "Afroasiatic", region: "Ancient Mesopotamia", tags: ["extinct"]},
  basque: {name: "Basque", category: "Language isolate", region: "Europe"},
  bul: {name: "Bulgarian", category: "Slavic", region: "Europe"},
  cat: {name: "Catalan", category: "Romance", region: "Europe"},
  ces: {name: "Czech", category: "Slavic", region: "Europe"},
  deu: {name: "German", category: "Germanic", region: "Europe"},
  ell: {name: "Greek", category: "Indo-European", region: "Europe"},
  eng: {name: "English", category: "Germanic", region: "Europe"},
  fra: {name: "French", category: "Romance", region: "Europe"},
  gle: {name: "Irish", category: "Celtic", region: "Europe"},
  hun: {name: "Hungarian", category: "Uralic", region: "Europe"},
  ita: {name: "Italian", category: "Romance", region: "Europe"},
  "jpn-lang": {name: "Japanese", category: "Japonic", region: "Asia"},
  kha: {name: "Khasi", category: "Austroasiatic", region: "Asia"},
  khm: {name: "Khmer", category: "Austroasiatic", region: "Asia"},
  lat: {name: "Latin", category: "Romance", region: "Europe", tags: ["classical"]},
  mnw: {name: "Mon", category: "Austroasiatic", region: "Asia"},
  nld: {name: "Dutch", category: "Germanic", region: "Europe"},
  pol: {name: "Polish", category: "Slavic", region: "Europe"},
  por: {name: "Portuguese", category: "Romance", region: "Europe"},
  rus: {name: "Russian", category: "Slavic", region: "Europe"},
  sat: {name: "Santali", category: "Austroasiatic", region: "Asia"},
  spa: {name: "Spanish", category: "Romance", region: "Europe"},
  srp: {name: "Serbian", category: "Slavic", region: "Europe"},
  swe: {name: "Swedish", category: "Germanic", region: "Europe"},
  tur: {name: "Turkish", category: "Turkic", region: "Middle East"},
  ukr: {name: "Ukrainian", category: "Slavic", region: "Europe"},
  yue: {name: "Cantonese", category: "Sino-Tibetan", region: "East Asia"}
};

module.exports = {META};
