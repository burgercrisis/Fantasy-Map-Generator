"use strict";

// Report how well fantasy race language profiles cover the Language Mixer catalog.
//
// This script answers questions like:
//   - Which catalog languages are currently *eligible* for at least one race
//     (via category / family filters)?
//   - Which catalog languages are *never* selected by any race profile
//     (good candidates for new races or profile tweaks)?
//   - Among the unused languages, which ones already have a valid Markov
//     mapping in language-mixer-map.json?
//
// Usage (from project root):
//   node tools/report-race-language-coverage.js
//
// Output:
//   - A summary of total catalog entries, race-eligible entries, and
//     race-unused entries.
//   - A detailed list of race-unused languages (sorted by category + name),
//     including ISO, name, region, family, category, and whether they have
//     a usable local mixer mapping.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

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

function buildRaceFilterSets(raceLanguageProfiles) {
  const categories = new Set();
  const families = new Set();

  for (const profile of Object.values(raceLanguageProfiles)) {
    if (!profile || typeof profile !== "object") continue;
    if (Array.isArray(profile.categories)) {
      for (const c of profile.categories) {
        if (typeof c === "string" && c) categories.add(c);
      }
    }
    if (Array.isArray(profile.families)) {
      for (const f of profile.families) {
        if (typeof f === "string" && f) families.add(f);
      }
    }
  }

  return {categories, families};
}

function main() {
  const mixes = readJson(path.join("config", "language-mixes.json"));

  let map = null;
  let mapByIso = new Map();
  try {
    map = readJson(path.join("config", "language-mixer-map.json"));
    mapByIso = new Map(map.map(e => [e.iso, e]));
  } catch (e) {
    // Mapping is optional for this report; if missing, we just won't report
    // mapped/unmapped status.
    console.warn("Warning: could not read config/language-mixer-map.json; mapped status will be unknown.");
  }

  const raceProfiles = loadRaceLanguageProfiles();
  const {categories: raceCategories, families: raceFamilies} = buildRaceFilterSets(raceProfiles);

  const raceEligible = [];
  const raceUnused = [];

  for (const lang of mixes) {
    if (!lang || !lang.iso) continue;

    // Match the mixer UI / race behavior: skip pure family macros.
    if (Array.isArray(lang.tags) && lang.tags.includes("family")) continue;

    const iso = String(lang.iso);
    const name = lang.name || "";
    const region = lang.region || "";
    const category = lang.category || "";
    const family = lang.family || category || "";

    const matchesCategory = category && raceCategories.has(category);
    const matchesFamily = family && raceFamilies.has(family);
    const eligible = matchesCategory || matchesFamily;

    let mapped = null;
    if (mapByIso.size) {
      const entry = mapByIso.get(iso);
      mapped = !!(entry && Array.isArray(entry.bases) && entry.bases.length);
    }

    const record = {iso, name, region, category, family, mapped};

    if (eligible) {
      raceEligible.push(record);
    } else {
      raceUnused.push(record);
    }
  }

  // Sort for nicer output: by category, then region, then name.
  const sorter = (a, b) => {
    const ak = (a.category || "") + "\u0000" + (a.region || "") + "\u0000" + (a.name || "");
    const bk = (b.category || "") + "\u0000" + (b.region || "") + "\u0000" + (b.name || "");
    return ak.localeCompare(bk);
  };

  raceEligible.sort(sorter);
  raceUnused.sort(sorter);

  const totalCatalog = raceEligible.length + raceUnused.length;
  const mappedUnused = raceUnused.filter(r => r.mapped === true).length;
  const mappedEligible = raceEligible.filter(r => r.mapped === true).length;

  console.log("=== Race language coverage vs mixer catalog ===");
  console.log("Total catalog languages (excluding family macros):", totalCatalog);
  console.log("Languages eligible for at least one race profile:", raceEligible.length);
  console.log("Languages never used by any race profile:", raceUnused.length);
  if (mapByIso.size) {
    console.log("  - Race-eligible languages with a valid mixer mapping:", mappedEligible);
    console.log("  - Race-unused languages with a valid mixer mapping:", mappedUnused);
  }
  console.log("");

  if (!raceUnused.length) {
    console.log("All catalog languages are covered by at least one race profile.");
    return;
  }

  console.log("--- Languages not covered by any race profile ---");
  console.log("Columns: iso | name | region | family | category | mapped?\n");

  raceUnused.forEach(rec => {
    const mappedStr = rec.mapped === null ? "?" : rec.mapped ? "Y" : "N";
    console.log(
      `${rec.iso} | ${rec.name || "(no name)"} | ${rec.region || ""} | ${rec.family || ""} | ${rec.category || ""} | ${mappedStr}`
    );
  });

  console.log("");
  console.log(
    "Legend: 'mapped?' is Y if language-mixer-map.json has a non-empty bases[] entry for the ISO, N if not, ? if the map file was not loaded."
  );
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting race language coverage:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
