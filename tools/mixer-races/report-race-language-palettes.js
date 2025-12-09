"use strict";

// Report how broad each race's language palette is under raceLanguageProfiles.
//
// This is a read-only helper that:
//   - Loads config/language-mixes.json (the mixer catalog).
//   - Extracts raceLanguageProfiles from modules/races.js (same parser as
//     tools/report-race-language-coverage.js).
//   - Reimplements the matching logic from getRaceLanguageIsoWeights to
//     compute, for each race:
//       * How many catalog languages it can draw from (iso count).
//       * Simple breakdowns by region, category, and family counts.
//
// Usage (from project root):
//   node tools/report-race-language-palettes.js
//
// Output:
//   - Summary of total catalog languages (excluding family macros).
//   - For each race:
//       raceName | isoCount | regions=N | categories=N | families=N
//   - Sorted by isoCount descending.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadRaceLanguageProfiles() {
  const rel = path.join("modules", "races.js");
  const full = path.join(root, rel);

  let src;
  try {
    src = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  } catch (e) {
    throw new Error("Failed to read " + rel + ": " + (e && e.message ? e.message : e));
  }

  const marker = "const raceLanguageProfiles";
  const idx = src.indexOf(marker);
  if (idx === -1) {
    throw new Error("Could not find 'const raceLanguageProfiles' in " + rel);
  }

  const braceStart = src.indexOf("{", idx);
  if (braceStart === -1) {
    throw new Error("Could not locate opening '{' for raceLanguageProfiles in " + rel);
  }

  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error("Failed to locate end of raceLanguageProfiles object literal in " + rel);
  }

  const objectLiteral = src.slice(braceStart, end + 1);

  const sandbox = {module: {exports: {}}, exports: {}};
  const context = vm.createContext(sandbox);
  const wrapped = "module.exports = " + objectLiteral + ";";

  try {
    vm.runInContext(wrapped, context, {filename: rel});
  } catch (e) {
    throw new Error("Failed to evaluate raceLanguageProfiles from " + rel + ": " + (e && e.message ? e.message : e));
  }

  const value = sandbox.module.exports || sandbox.exports;
  if (!value || typeof value !== "object") {
    throw new Error("raceLanguageProfiles did not evaluate to an object");
  }

  return value;
}

function buildRaceIsoWeights(raceLanguageProfiles, catalog) {
  const results = new Map();

  const allLangs = catalog.filter(lang => {
    if (!lang || !lang.iso) return false;
    if (Array.isArray(lang.tags) && lang.tags.includes("family")) return false;
    return true;
  });

  for (const [raceName, profile] of Object.entries(raceLanguageProfiles)) {
    if (!profile || typeof profile !== "object") continue;

    const categories = Array.isArray(profile.categories) ? new Set(profile.categories) : new Set();
    const families = Array.isArray(profile.families) ? new Set(profile.families) : new Set();

    const useAllCategories = categories.has("*");
    const useAllFamilies = families.has("*");
    const useAll = useAllCategories || useAllFamilies;
    if (useAllCategories) categories.delete("*");
    if (useAllFamilies) families.delete("*");

    const isoWeights = new Map();

    for (const lang of allLangs) {
      const iso = String(lang.iso);

      if (useAll) {
        isoWeights.set(iso, (isoWeights.get(iso) || 0) + 1);
        continue;
      }

      const category = lang.category || "";
      const family = lang.family || category || "";

      const catOk = categories.size && categories.has(category);
      const famOk = families.size && family && families.has(family);
      if (!catOk && !famOk) continue;

      let weight = 0;
      if (catOk) weight += 1;
      if (famOk) weight += 2;
      if (!weight) continue;

      isoWeights.set(iso, (isoWeights.get(iso) || 0) + weight);
    }

    results.set(raceName, isoWeights);
  }

  return {allLangs, results};
}

function summarizePalettes(allLangs, raceIsoWeights) {
  const totalCatalog = allLangs.length;

  const rows = [];

  for (const [raceName, isoWeights] of raceIsoWeights.entries()) {
    const isos = Array.from(isoWeights.keys());
    const isoCount = isos.length;

    const regionSet = new Set();
    const categorySet = new Set();
    const familySet = new Set();

    const byIso = new Map(allLangs.map(l => [String(l.iso), l]));

    for (const iso of isos) {
      const lang = byIso.get(iso);
      if (!lang) continue;
      if (lang.region) regionSet.add(lang.region);
      if (lang.category) categorySet.add(lang.category);
      const fam = lang.family || lang.category;
      if (fam) familySet.add(fam);
    }

    rows.push({
      raceName,
      isoCount,
      regionCount: regionSet.size,
      categoryCount: categorySet.size,
      familyCount: familySet.size
    });
  }

  rows.sort((a, b) => b.isoCount - a.isoCount || a.raceName.localeCompare(b.raceName));

  console.log("=== Race language palette breadth ===");
  console.log("Total catalog languages (excluding family macros):", totalCatalog);
  console.log("Races analyzed:", rows.length);
  console.log("Columns: rank | race | isoCount | regions | categories | families");
  console.log("");

  rows.forEach((r, idx) => {
    const rank = String(idx + 1).padStart(2, " ");
    console.log(
      `${rank} | ${r.raceName} | isoCount=${r.isoCount} | regions=${r.regionCount} | categories=${r.categoryCount} | families=${r.familyCount}`
    );
  });
}

function main() {
  const mixes = readJson(path.join("config", "language-mixes.json"));
  const raceProfiles = loadRaceLanguageProfiles();

  const {allLangs, results} = buildRaceIsoWeights(raceProfiles, mixes);
  summarizePalettes(allLangs, results);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting race language palettes:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
