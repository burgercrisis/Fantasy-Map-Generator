"use strict";

// Report, for each fantasy race, how many mixer catalog languages it can reach
// via its raceLanguageProfiles (categories/families), and confirm that no race
// effectively sees 100% of the non-macro catalog.
//
// Usage (from project root):
//   node tools/report-per-race-language-coverage.js
//
// Output:
//   - Total real (non-family-macro) catalog entries
//   - Per-race reachable language counts and percentage
//   - A warning if any race reaches 100% of catalog languages

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

  const src = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  const marker = "const raceLanguageProfiles";
  const idx = src.indexOf(marker);
  if (idx === -1) throw new Error("Could not find 'const raceLanguageProfiles' in " + rel);

  const braceStart = src.indexOf("{", idx);
  if (braceStart === -1) throw new Error("Could not locate opening '{' for raceLanguageProfiles in " + rel);

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

  if (end === -1) throw new Error("Failed to locate end of raceLanguageProfiles object literal in " + rel);

  const objectLiteral = src.slice(braceStart, end + 1);

  const sandbox = {module: {exports: {}}, exports: {}};
  const context = vm.createContext(sandbox);
  const wrapped = "module.exports = " + objectLiteral + ";";
  vm.runInContext(wrapped, context, {filename: rel});

  const value = sandbox.module.exports || sandbox.exports;
  if (!value || typeof value !== "object") {
    throw new Error("raceLanguageProfiles did not evaluate to an object");
  }
  return value;
}

function main() {
  const mixes = readJson(path.join("config", "language-mixes.json"));
  const raceProfiles = loadRaceLanguageProfiles();

  // Build list of real (non-macro) catalog languages.
  const realCatalog = mixes.filter(lang => {
    if (!lang || !lang.iso) return false;
    if (Array.isArray(lang.tags) && lang.tags.includes("family")) return false;
    return true;
  });

  const totalReal = realCatalog.length;

  // Pre-index catalog by iso for convenience (not strictly needed, but handy).
  const catalogByIso = new Map(realCatalog.map(l => [String(l.iso), l]));

  function buildIsoSetForProfile(profile) {
    if (!profile || typeof profile !== "object") return new Set();

    const categories = new Set(Array.isArray(profile.categories) ? profile.categories : []);
    const families = new Set(Array.isArray(profile.families) ? profile.families : []);

    const useAllCategories = categories.has("*");
    const useAllFamilies = families.has("*");
    const useAll = useAllCategories || useAllFamilies;
    if (useAllCategories) categories.delete("*");
    if (useAllFamilies) families.delete("*");

    const isoSet = new Set();

    for (const lang of realCatalog) {
      if (!lang || !lang.iso) continue;

      if (useAll) {
        isoSet.add(String(lang.iso));
        continue;
      }

      const category = lang.category || "";
      const family = lang.family || category || "";

      const catOk = categories.size && categories.has(category);
      const famOk = families.size && family && families.has(family);
      if (!catOk && !famOk) continue;

      isoSet.add(String(lang.iso));
    }

    return isoSet;
  }

  const rows = [];
  let anyFull = false;

  for (const [raceName, profile] of Object.entries(raceProfiles)) {
    const isoSet = buildIsoSetForProfile(profile);
    const count = isoSet.size;
    const pct = totalReal ? (count / totalReal) * 100 : 0;
    const isFull = totalReal > 0 && count === totalReal;

    rows.push({raceName, count, pct, isFull});
    if (isFull) anyFull = true;
  }

  // Sort by reachable count descending for a quick overview.
  rows.sort((a, b) => b.count - a.count || a.raceName.localeCompare(b.raceName));

  console.log("=== Per-race language coverage vs mixer catalog ===");
  console.log("Total real mixer languages (excluding family macros):", totalReal);
  console.log("");

  rows.forEach(r => {
    console.log(
      `${r.raceName.padEnd(15)} | languages=${String(r.count).padStart(4)} | ${r.pct.toFixed(2).padStart(6)}% of catalog` +
        (r.isFull ? "  <-- FULL COVERAGE" : "")
    );
  });

  console.log("");
  if (anyFull) {
    console.log("WARNING: At least one race currently has full coverage of all mixer languages.");
  } else {
    console.log("No race has full coverage; all races see a proper subset of the mixer catalog.");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting per-race language coverage:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
