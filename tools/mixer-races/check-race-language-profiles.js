"use strict";

// Check raceLanguageProfiles invariants:
//   - No race uses wildcard "*" in categories or families.
//   - No two races share an identical (categories, families) set.
//
// Usage (from project root):
//   node tools/check-race-language-profiles.js
//
// Exit code is non-zero if any problems are found.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

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
    throw new Error(
      "Failed to evaluate raceLanguageProfiles from " + rel + ": " + (e && e.message ? e.message : e)
    );
  }

  const value = sandbox.module.exports || sandbox.exports;
  if (!value || typeof value !== "object") {
    throw new Error("raceLanguageProfiles did not evaluate to an object");
  }

  return value;
}

function main() {
  const profiles = loadRaceLanguageProfiles();
  const raceNames = Object.keys(profiles);

  const wildcardRaces = [];
  const profileByKey = new Map();

  for (const raceName of raceNames) {
    const profile = profiles[raceName];
    if (!profile || typeof profile !== "object") continue;

    const categories = Array.isArray(profile.categories) ? profile.categories.slice() : [];
    const families = Array.isArray(profile.families) ? profile.families.slice() : [];

    if (categories.includes("*") || families.includes("*")) {
      wildcardRaces.push(raceName);
    }

    const normCats = categories.slice().sort();
    const normFams = families.slice().sort();

    // Allow sentinel/fallback races (e.g. Human, AnyLanguage) to share an
    // intentionally empty profile without being treated as duplicates.
    if (!normCats.length && !normFams.length) continue;

    const key = JSON.stringify({c: normCats, f: normFams});
    if (!profileByKey.has(key)) profileByKey.set(key, []);
    profileByKey.get(key).push(raceName);
  }

  const duplicates = [];
  for (const [key, races] of profileByKey.entries()) {
    if (races.length > 1) {
      duplicates.push({key, races});
    }
  }

  console.log("=== raceLanguageProfiles consistency check ===");
  console.log("Total races with profiles:", raceNames.length);
  console.log("Races using wildcard filters (*):", wildcardRaces.length);
  console.log("Duplicate category/family profile sets:", duplicates.length);
  console.log("");

  let hasError = false;

  if (wildcardRaces.length) {
    hasError = true;
    console.log("-- Races using wildcard categories/families (*) --");
    wildcardRaces.sort().forEach(name => {
      console.log(" - " + name);
    });
    console.log("");
  }

  if (duplicates.length) {
    hasError = true;
    console.log("-- Races sharing identical category/family sets --");
    duplicates.forEach(({races}) => {
      console.log(" - " + races.join(", "));
    });
    console.log("");
  }

  if (!hasError) {
    console.log(
      "All raceLanguageProfiles use explicit, non-wildcard category/family subsets and no profiles are identical."
    );
  }

  if (hasError) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while checking raceLanguageProfiles invariants:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
