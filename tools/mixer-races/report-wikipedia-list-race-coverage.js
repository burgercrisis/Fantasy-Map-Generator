"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadList(fileArg) {
  if (!fileArg) {
    throw new Error("Expected a path to a JSON file describing a Wikipedia language list");
  }
  const full = path.isAbsolute(fileArg) ? fileArg : path.join(root, fileArg);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  const data = JSON.parse(raw);

  if (Array.isArray(data)) {
    return { title: path.basename(full), source: "", items: data };
  }

  if (!data || !Array.isArray(data.items)) {
    throw new Error("List JSON must be an array or an object with an 'items' array");
  }

  return {
    title: String(data.title || path.basename(full)),
    source: String(data.source || ""),
    items: data.items
  };
}

function buildCatalogIndexes(mixes) {
  const byIso = new Map();
  const byNameLower = new Map();

  for (const m of mixes) {
    if (!m || !m.iso) continue;
    const iso = String(m.iso);
    byIso.set(iso, m);
    const name = m.name ? String(m.name).toLowerCase() : "";
    if (name) {
      const arr = byNameLower.get(name) || [];
      arr.push(m);
      byNameLower.set(name, arr);
    }
  }

  return { byIso, byNameLower };
}

function resolveItemToIso(item, indexes) {
  const { byIso, byNameLower } = indexes;

  const skip = !!item.skip;
  const name = item.name ? String(item.name) : "";
  const isoRaw = item.iso != null ? String(item.iso) : "";

  if (skip) {
    return { name, iso: null, status: "skipped" };
  }

  let iso = null;

  if (isoRaw) {
    iso = isoRaw;
  } else if (name) {
    const candidates = byNameLower.get(name.toLowerCase()) || [];
    if (candidates.length === 1) {
      iso = String(candidates[0].iso);
    } else if (candidates.length > 1) {
      return {
        name,
        iso: null,
        status: "ambiguous",
        detail: `Name matches ${candidates.length} catalog entries; specify 'iso' in the list JSON`
      };
    }
  }

  if (!iso) {
    return {
      name,
      iso: null,
      status: "unmatched",
      detail: "No iso provided and name did not match any catalog entry"
    };
  }

  if (!byIso.has(iso)) {
    return {
      name,
      iso,
      status: "missing-catalog",
      detail: "Present in mixer map but missing from catalog"
    };
  }

  return { name, iso, status: "ok" };
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

function buildRaceIsoSets(raceProfiles, catalog) {
  const realCatalog = catalog.filter(lang => {
    if (!lang || !lang.iso) return false;
    if (Array.isArray(lang.tags) && lang.tags.includes("family")) return false;
    return true;
  });

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

  const raceIsoSets = new Map();
  const isoToRaces = new Map();

  for (const [raceName, profile] of Object.entries(raceProfiles)) {
    const isoSet = buildIsoSetForProfile(profile);
    raceIsoSets.set(raceName, isoSet);
    for (const iso of isoSet) {
      let set = isoToRaces.get(iso);
      if (!set) {
        set = new Set();
        isoToRaces.set(iso, set);
      }
      set.add(raceName);
    }
  }

  return {raceIsoSets, isoToRaces};
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node tools/mixer-races/report-wikipedia-list-race-coverage.js path/to/list.json");
    console.log("");
    console.log("For each list item, prints its ISO, status, category/family, how many races can reach it, and which races.");
    process.exit(0);
  }

  const listPathArg = args[0];
  const listMeta = loadList(listPathArg);
  const mixes = readJson(path.join("config", "language-mixes.json"));
  const raceProfiles = loadRaceLanguageProfiles();

  const catalogIndexes = buildCatalogIndexes(mixes);
  const {isoToRaces} = buildRaceIsoSets(raceProfiles, mixes);

  const mixByIso = new Map(mixes.map(m => [String(m.iso), m]));

  console.log(`List title: ${listMeta.title}`);
  if (listMeta.source) console.log(`Source: ${listMeta.source}`);
  console.log("");
  console.log("ISO\tStatus\tRaceCount\tCategory\tFamily\tName\tRaces");

  for (const item of listMeta.items) {
    const resolved = resolveItemToIso(item || {}, catalogIndexes);
    const name = resolved.name || "";

    if (resolved.status !== "ok") {
      const status = resolved.status || "error";
      console.log(`${resolved.iso || "-"}\t${status}\t-\t-\t-\t${name}`);
      continue;
    }

    const iso = resolved.iso;
    const lang = mixByIso.get(iso) || null;
    const category = (lang && lang.category) || "";
    const family = (lang && lang.family) || "";

    const racesSet = isoToRaces.get(iso) || new Set();
    const races = Array.from(racesSet).sort();

    console.log(
      `${iso}\tok\t${races.length}\t${category}\t${family}\t${name}\t${races.join(",")}`
    );
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(
      "Error while reporting Wikipedia list race coverage:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}
