"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const {loadRaceModBundles, mergeRaceData} = require("./softmod-race-loader");

function loadCoreRaceData(rootDir) {
  const racesPath = path.join(rootDir, "modules", "races.js");
  const source = fs.readFileSync(racesPath, "utf8");

  const sandbox = {
    console,
    window: {},
    XMLHttpRequest() {
      throw new Error("XMLHttpRequest is not available in the softmod sandbox");
    },
    byId() {
      return null;
    },
    rn(x) {
      return x;
    },
    pack: {},
    Names: {},
    module: {exports: {}},
    exports: {}
  };

  vm.createContext(sandbox);

  const wrapped = `${source}\nmodule.exports = {fantasyRaceBases, raceLanguageProfiles, getRacesSetFilter, defineRaceExpansionism};`;
  vm.runInContext(wrapped, sandbox, {filename: "modules/races.js"});

  const {fantasyRaceBases, raceLanguageProfiles, getRacesSetFilter, defineRaceExpansionism} =
    sandbox.module.exports;

  const setNames = [
    "classic",
    "dark",
    "primal",
    "planar",
    "eberron",
    "fey",
    "beastfolk",
    "underdark",
    "undead"
  ];

  const raceSets = {};
  setNames.forEach(name => {
    const set = getRacesSetFilter(name);
    if (set && set.size) raceSets[name] = new Set(set);
  });

  const raceExpansionismBase = {};
  Object.keys(fantasyRaceBases).forEach(raceName => {
    try {
      raceExpansionismBase[raceName] = defineRaceExpansionism(raceName);
    } catch (error) {
      // Best-effort only; expansionism map is diagnostic in this sandbox.
    }
  });

  return {fantasyRaceBases, raceLanguageProfiles, raceSets, raceExpansionismBase};
}

function setToSortedArray(set) {
  if (!set) return [];
  return Array.from(set).sort();
}

function getRaceSetChanges(coreRaceSets, mergedRaceSets) {
  const changes = [];
  if (!mergedRaceSets) return changes;

  const setNames = new Set(Object.keys(mergedRaceSets));
  if (coreRaceSets) {
    Object.keys(coreRaceSets).forEach(name => setNames.add(name));
  }

  setNames.forEach(name => {
    const mergedSet = mergedRaceSets[name];
    if (!mergedSet) return;
    const coreSet = coreRaceSets && coreRaceSets[name];
    const added = [];
    mergedSet.forEach(raceName => {
      if (!coreSet || !coreSet.has(raceName)) added.push(raceName);
    });
    if (added.length) {
      changes.push({setName: name, added: added.sort()});
    }
  });

  changes.sort((a, b) => {
    if (a.setName < b.setName) return -1;
    if (a.setName > b.setName) return 1;
    return 0;
  });

  return changes;
}

function main() {
  const rootDir = path.resolve(__dirname, "../..");

  const core = loadCoreRaceData(rootDir);

  const {bundles, warnings: loaderWarnings} = loadRaceModBundles(rootDir, {
    explicitMods: ["arcana-unearthed", "blue-rose"]
  });

  if (!bundles.length) {
    console.error("No race bundles loaded. Ensure mods/arcana-unearthed/races-au.js exists.");
    process.exitCode = 1;
    return;
  }

  const merged = mergeRaceData(core, bundles);

  const coreRaceNames = Object.keys(core.fantasyRaceBases || {});
  const mergedRaceNames = Object.keys(merged.fantasyRaceBases || {});

  const newRaces = mergedRaceNames.filter(name => !Object.prototype.hasOwnProperty.call(core.fantasyRaceBases, name));

  console.log("Softmod sandbox – race loading preview (no changes to live app)\n");

  console.log(`Core races:   ${coreRaceNames.length}`);
  console.log(`Merged races: ${mergedRaceNames.length}`);
  console.log("");

  console.log("New races from mods:");
  if (newRaces.length) {
    console.log("  " + newRaces.sort().join(", "));
  } else {
    console.log("  (none)");
  }

  console.log("");

  const corePrimal = setToSortedArray(core.raceSets && core.raceSets.primal);
  const mergedPrimal = setToSortedArray(merged.raceSets && merged.raceSets.primal);

  console.log("primal set – core vs merged (example preset):");
  console.log("  core  : " + corePrimal.join(", "));
  console.log("  merged: " + mergedPrimal.join(", "));

  console.log("");

  const modRaceSet = new Set();
  bundles.forEach(bundle => {
    (bundle.races || []).forEach(raceName => modRaceSet.add(raceName));
  });
  const modRaceNames = Array.from(modRaceSet).sort();

  const missingNamebase = [];
  const missingLangProfile = [];
  const explicitExpansion = [];
  const fallbackExpansion = [];

  modRaceNames.forEach(raceName => {
    const hasBase = Object.prototype.hasOwnProperty.call(
      merged.fantasyRaceBases || {},
      raceName
    );
    const hasProfile = Object.prototype.hasOwnProperty.call(
      merged.raceLanguageProfiles || {},
      raceName
    );
    const hasExpansion = Object.prototype.hasOwnProperty.call(
      merged.raceExpansionismBase || {},
      raceName
    );

    if (!hasBase) missingNamebase.push(raceName);
    if (!hasProfile) missingLangProfile.push(raceName);
    if (hasExpansion) explicitExpansion.push(raceName);
    else fallbackExpansion.push(raceName);
  });

  console.log("Mod race coverage (merged data):");
  console.log(
    "  races from mods: " + (modRaceNames.length ? modRaceNames.join(", ") : "(none)")
  );

  if (!missingNamebase.length && !missingLangProfile.length) {
    console.log(
      "  All mod races have namebases and language profiles in merged data."
    );
  } else {
    if (missingNamebase.length) {
      console.log("  Missing namebases for: " + missingNamebase.join(", "));
    }
    if (missingLangProfile.length) {
      console.log("  Missing language profiles for: " + missingLangProfile.join(", "));
    }
  }

  console.log(
    "  Explicit expansionism entries: " +
      (explicitExpansion.length ? explicitExpansion.join(", ") : "(none)")
  );
  console.log(
    "  Expansionism falling back to defineRaceExpansionism(): " +
      (fallbackExpansion.length ? fallbackExpansion.join(", ") : "(none)")
  );

  console.log("");

  const raceSetChanges = getRaceSetChanges(core.raceSets, merged.raceSets);

  console.log("Race set changes from mods:");
  if (!raceSetChanges.length) {
    console.log("  (none)");
  } else {
    raceSetChanges.forEach(change => {
      console.log("  " + change.setName + ": + " + change.added.join(", "));
    });
  }

  console.log("");

  const allWarnings = [];
  if (loaderWarnings && loaderWarnings.length) allWarnings.push(...loaderWarnings);
  if (merged.warnings && merged.warnings.length) allWarnings.push(...merged.warnings);

  if (allWarnings.length) {
    console.log("Warnings:");
    allWarnings.forEach(w => console.log("  - " + w));
  } else {
    console.log("No loader or merge warnings.");
  }
}

if (require.main === module) {
  main();
}
