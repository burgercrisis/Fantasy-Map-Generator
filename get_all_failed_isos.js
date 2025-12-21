"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = process.cwd();

const STRICT_MIN_UNIQUE_SEEDS = 1;
const NORMALIZED_MIN_UNIQUE_SEEDS = 10;

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw);
}

function loadDefaultNameBases() {
  const sandbox = {window: {}, module: {exports: {}}, exports: {}, console, nameBases: []};
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);

  const files = [
    path.join(root, "modules", "namebases-real.js"),
    path.join(root, "modules", "namebases-fantasy.js"),
    path.join(root, "modules", "namebases-creole.js"),
    path.join(root, "modules", "namebases-all.js")
  ];

  for (const full of files) {
    const src = fs.readFileSync(full, "utf8");
    vm.runInContext(src, context, {filename: full});
  }

  const bases = sandbox.window && sandbox.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated; did namebases-all.js run?");
  }

  return bases;
}

function splitSeeds(blob) {
  if (!blob || typeof blob !== "string") return [];
  return blob
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function normalizeSeed(s) {
  if (!s) return "";
  let out = String(s).toLowerCase();
  out = out.normalize("NFD").replace(/\p{M}+/gu, "");
  out = out.replace(/[^\p{L}\p{N}]+/gu, "");
  return out;
}

function isFamilyEntry(entry) {
  return !!(entry && Array.isArray(entry.tags) && entry.tags.includes("family"));
}

function main() {
  const catalog = readJson("config/language-mixes.json");
  const mapRows = readJson("config/language-mixer-map.json");
  const nameBases = loadDefaultNameBases();

  const catalogByIso = new Map();
  for (const c of catalog) {
    if (!c || !c.iso) continue;
    catalogByIso.set(c.iso, c);
  }

  const mapByIso = new Map();
  for (const r of mapRows) {
    if (!r || !r.iso || !Array.isArray(r.bases)) continue;
    mapByIso.set(r.iso, r.bases);
  }

  const targetIsos = [];
  for (const [iso, entry] of catalogByIso.entries()) {
    if (isFamilyEntry(entry)) continue;
    targetIsos.push(iso);
  }

  const comparisonIsos = [];
  for (const [iso] of mapByIso.entries()) {
    const entry = catalogByIso.get(iso);
    if (entry && isFamilyEntry(entry)) continue;
    comparisonIsos.push(iso);
  }

  const baseUseCount = new Map();
  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;
    for (const b of bases) {
      if (typeof b !== "number") continue;
      baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
    }
  }

  const baseSeedCache = new Map();
  const getBaseSeedSets = baseIndex => {
    if (baseSeedCache.has(baseIndex)) return baseSeedCache.get(baseIndex);
    const base = nameBases[baseIndex];
    const strictArr = base ? splitSeeds(base.b) : [];
    const strictSet = new Set(strictArr);
    const normSet = new Set(strictArr.map(normalizeSeed).filter(Boolean));
    const value = {strictSet, normSet};
    baseSeedCache.set(baseIndex, value);
    return value;
  };

  const strictIsoCount = new Map();
  const normIsoCount = new Map();

  for (const iso of comparisonIsos) {
    const bases = mapByIso.get(iso);
    if (!bases) continue;

    const isoStrict = new Set();
    const isoNorm = new Set();

    for (const b of bases) {
      if (typeof b !== "number") continue;
      const {strictSet, normSet} = getBaseSeedSets(b);
      for (const t of strictSet) isoStrict.add(t);
      for (const t of normSet) isoNorm.add(t);
    }

    for (const t of isoStrict) strictIsoCount.set(t, (strictIsoCount.get(t) || 0) + 1);
    for (const t of isoNorm) normIsoCount.set(t, (normIsoCount.get(t) || 0) + 1);
  }

  const failedIsos = [];

  for (const iso of targetIsos) {
    const bases = mapByIso.get(iso);

    if (!bases) {
      failedIsos.push(iso);
      continue;
    }

    const uniqueBases = bases.filter(b => typeof b === "number" && (baseUseCount.get(b) || 0) === 1);

    // Check for _unq placeholders
    let hasUnq = false;
    for (const b of bases) {
      if (typeof b !== "number") continue;
      const base = nameBases[b];
      if (base && base.b && base.b.includes("_unq")) {
        hasUnq = true;
        break;
      }
    }

    const strictUnique = new Set();
    const normUnique = new Set();

    for (const b of uniqueBases) {
      const {strictSet, normSet} = getBaseSeedSets(b);
      for (const t of strictSet) {
        if ((strictIsoCount.get(t) || 0) === 1) strictUnique.add(t);
      }
      for (const t of normSet) {
        if ((normIsoCount.get(t) || 0) === 1) normUnique.add(t);
      }
    }

    const passUniqueBase = uniqueBases.length > 0;
    const passStrict = strictUnique.size >= STRICT_MIN_UNIQUE_SEEDS;
    const passNormalized = normUnique.size >= NORMALIZED_MIN_UNIQUE_SEEDS;

    if (!passUniqueBase || !passStrict || !passNormalized || hasUnq) {
      failedIsos.push(iso);
    }
  }

  fs.writeFileSync("all_failed_isos.json", JSON.stringify(failedIsos, null, 2));
  console.log(`Found ${failedIsos.length} failed ISOs. Saved to all_failed_isos.json`);
}

main();
