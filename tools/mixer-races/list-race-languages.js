"use strict";

// List the actual mixer catalog languages (ISOs) each race can draw from
// under raceLanguageProfiles, using the same matching logic as
// getRaceLanguageIsoWeights in modules/races.js.
//
// Usage (from project root):
//   node tools/mixer-races/list-race-languages.js --race=Leonin
//   node tools/mixer-races/list-race-languages.js --race=Triton
//   node tools/mixer-races/list-race-languages.js           # all races
//
// Output per race:
//   - Summary: isoCount, region/category/family counts
//   - Detailed table: iso | name | region | family | category | weight

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

  const sandbox = { module: { exports: {} }, exports: {} };
  const context = vm.createContext(sandbox);
  const wrapped = "module.exports = " + objectLiteral + ";";

  try {
    vm.runInContext(wrapped, context, { filename: rel });
  } catch (e) {
    throw new Error(
      "Failed to evaluate raceLanguageProfiles from " +
        rel +
        ": " +
        (e && e.message ? e.message : e)
    );
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

    const categories = Array.isArray(profile.categories)
      ? new Set(profile.categories)
      : new Set();
    const families = Array.isArray(profile.families)
      ? new Set(profile.families)
      : new Set();

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

  return { allLangs, results };
}

function parseArgs(argv) {
  let race = null;
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      return { help: true, race: null };
    }
    if (arg.startsWith("--race=")) {
      race = arg.slice("--race=".length);
    }
  }
  return { help: false, race };
}

function printHelp() {
  console.log("Usage: node tools/mixer-races/list-race-languages.js [--race=Name]\n");
  console.log("If --race is omitted, all races will be listed.");
}

function summarizeRace(raceName, isoWeights, byIso) {
  const isos = Array.from(isoWeights.keys());
  const isoCount = isos.length;

  const regionSet = new Set();
  const categorySet = new Set();
  const familySet = new Set();

  for (const iso of isos) {
    const lang = byIso.get(iso);
    if (!lang) continue;
    if (lang.region) regionSet.add(lang.region);
    if (lang.category) categorySet.add(lang.category);
    const fam = lang.family || lang.category;
    if (fam) familySet.add(fam);
  }

  console.log(`=== Race: ${raceName} ===`);
  console.log(
    `isoCount=${isoCount} | regions=${regionSet.size} | categories=${categorySet.size} | families=${familySet.size}`
  );
  console.log("iso | name | region | family | category | weight");

  const rows = isos.map(iso => {
    const lang = byIso.get(iso) || {};
    return {
      iso,
      name: lang.name || "",
      region: lang.region || "",
      family: lang.family || "",
      category: lang.category || "",
      weight: isoWeights.get(iso) || 0
    };
  });

  rows.sort((a, b) => {
    // Sort by region, then family, then name, then iso
    const ak = `${a.region}\u0000${a.family}\u0000${a.name}\u0000${a.iso}`;
    const bk = `${b.region}\u0000${b.family}\u0000${b.name}\u0000${b.iso}`;
    return ak.localeCompare(bk);
  });

  for (const r of rows) {
    console.log(
      `${r.iso} | ${r.name} | ${r.region} | ${r.family} | ${r.category} | ${r.weight}`
    );
  }

  console.log("");
}

function main() {
  const { help, race } = parseArgs(process.argv.slice(2));
  if (help) {
    printHelp();
    return;
  }

  const mixes = readJson(path.join("config", "language-mixes.json"));
  const raceProfiles = loadRaceLanguageProfiles();

  const { allLangs, results } = buildRaceIsoWeights(raceProfiles, mixes);
  const byIso = new Map(allLangs.map(l => [String(l.iso), l]));

  if (race) {
    const isoWeights = results.get(race);
    if (!isoWeights || !isoWeights.size) {
      console.log(`No eligible languages found for race '${race}'.`);
      return;
    }
    summarizeRace(race, isoWeights, byIso);
    return;
  }

  // No race filter: list all races
  for (const [raceName, isoWeights] of results.entries()) {
    summarizeRace(raceName, isoWeights, byIso);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while listing race languages:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
