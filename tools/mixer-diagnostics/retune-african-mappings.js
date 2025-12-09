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

function normalizeBases(bases) {
  if (!Array.isArray(bases)) return [];
  return bases.slice().sort((a, b) => a - b);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Heuristics to pick a more specific African base index for a language,
// based on tokens in its name / family / category. Indices refer to
// modules/namebases-fantasy.js.
const africanTokenBaseMap = {
  // West African / Niger-Congo clusters
  mande: 117, // approximate via Bambara
  bambara: 117,
  mandinka: 118,
  soninke: 119,
  wolof: 115,
  yoruba: 112,
  igbo: 113,
  fula: 114,
  fulani: 114,
  ewe: 120,
  akan: 116,
  ga: 121,
  fon: 122,
  bete: 123,
  nyabwa: 124,
  dida: 125,
  mumuye: 126,
  moore: 127,
  limba: 128,
  gola: 129,

  // Horn of Africa / Cushitic / Ethio-Semitic
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

  // Central / Southern Bantu
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

  // Swahili cluster already has its own real base (28), but is not in the
  // fantasy namebases range. We leave it alone here and let existing
  // mappings handle it.
};

function inferAfricanBase(lang) {
  if (!lang) return null;
  const parts = [];
  if (lang.name) parts.push(String(lang.name));
  if (lang.family) parts.push(String(lang.family));
  if (lang.category) parts.push(String(lang.category));
  const text = parts.join(" ").toLowerCase();
  if (!text) return null;

  let resolved = null;
  for (const [token, base] of Object.entries(africanTokenBaseMap)) {
    if (!text.includes(token)) continue;
    if (resolved == null) {
      resolved = base;
    } else if (resolved !== base) {
      // Conflicting hints, keep generic mapping.
      return null;
    }
  }

  return resolved;
}

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  const nigerCongoFamily = mapByIso.get("niger-congo-family");
  const afroFamily = mapByIso.get("afroasiatic-family");

  if (!nigerCongoFamily && !afroFamily) {
    console.log("No generic family mappings found; nothing to retune.");
    return;
  }

  const genericBaseSets = [];
  if (nigerCongoFamily && Array.isArray(nigerCongoFamily.bases)) {
    genericBaseSets.push(normalizeBases(nigerCongoFamily.bases));
  }
  if (afroFamily && Array.isArray(afroFamily.bases)) {
    genericBaseSets.push(normalizeBases(afroFamily.bases));
  }

  const updated = [];

  for (const entry of map) {
    if (!entry || !entry.iso) continue;
    const lang = mixesByIso.get(entry.iso);
    if (!lang) continue;

    // Focus only on African languages; we also include Indian Ocean
    // languages like Comorian that are Bantu.
    const region = (lang.region || "").toLowerCase();
    if (!region || (region.indexOf("africa") === -1 && region.indexOf("indian ocean") === -1)) {
      continue;
    }

    const currentBases = normalizeBases(entry.bases || []);
    if (!currentBases.length) continue;

    // Only retune entries that still use a generic family bucket.
    const isGeneric = genericBaseSets.some(set => arraysEqual(set, currentBases));
    if (!isGeneric) continue;

    const base = inferAfricanBase(lang);
    if (base == null) continue;

    entry.bases = [base];
    updated.push({iso: entry.iso, name: lang.name || "", base});
  }

  if (!updated.length) {
    console.log("No African mappings needed retuning.");
    return;
  }

  writeJson("config/language-mixer-map.json", map);

  console.log("Retuned African mappings:");
  for (const u of updated) {
    console.log(` - ${u.iso} (${u.name}) -> base index ${u.base}`);
  }
}

if (require.main === module) main();
