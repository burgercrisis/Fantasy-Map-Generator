"use strict";

// Ensure that *all* ISO codes present in language-mixer-map.json
// have a corresponding catalog entry in language-mixes.json so that
// every mapped language can appear in the Language Mixer dropdown.

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

function titleFromIso(iso) {
  return iso
    .split("-")
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ")
    .replace(/\s+Fam(ily)?$/i, " family");
}

// Optional nicer metadata for well-known languages so they land in
// sensible categories & regions instead of "Other".
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

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mapIsos = new Set(map.map(e => e.iso));
  const mixIsos = new Set(mixes.map(e => e.iso));

  const missing = [...mapIsos].filter(iso => !mixIsos.has(iso)).sort();

  if (!missing.length) {
    console.log("No ISO codes in map are missing from catalog.");
    return;
  }

  console.log("Missing ISO codes to add:", missing.join(", "));

  let added = 0;

  for (const iso of missing) {
    const meta = META[iso] || {};
    const name = meta.name || titleFromIso(iso);
    const category = meta.category || (iso.endsWith("-family") ? "Family" : "Other");
    const region = meta.region || "Misc";

    const entry = {name, iso, category, region};
    if (meta.tags && meta.tags.length) entry.tags = meta.tags.slice();
    mixes.push(entry);
    added++;
  }

  console.log("Added", added, "catalog entries for previously missing ISOs.");

  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  writeJson("config/language-mixes.json", mixes);
}

if (require.main === module) main();
