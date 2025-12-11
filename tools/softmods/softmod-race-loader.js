"use strict";

const fs = require("fs");
const path = require("path");

function loadModsConfig(rootDir) {
  const configPath = path.join(rootDir, "mods", "mods.json");

  if (!fs.existsSync(configPath)) {
    return {enabled: [], path: configPath};
  }

  let raw;
  try {
    raw = fs.readFileSync(configPath, "utf8");
  } catch (error) {
    return {enabled: [], path: configPath, error};
  }

  try {
    const parsed = JSON.parse(raw);
    const enabled = Array.isArray(parsed.enabled) ? parsed.enabled : [];
    return {enabled, path: configPath};
  } catch (error) {
    return {enabled: [], path: configPath, error};
  }
}

function normalizeRaceBundle(raw, modId) {
  if (!raw || typeof raw !== "object") {
    return {
      modId,
      races: [],
      fantasyRaceBases: {},
      raceLanguageProfiles: {},
      raceSetContributions: {},
      raceExpansionismBase: {},
      modMetadata: {id: modId}
    };
  }

  const races = raw.races || raw.auRaces || [];
  const fantasyRaceBases = raw.fantasyRaceBases || raw.auFantasyRaceBases || {};
  const raceLanguageProfiles = raw.raceLanguageProfiles || raw.auRaceLanguageProfiles || {};
  const raceSetContributions = raw.raceSetContributions || raw.auRaceSetContributions || {};
  const raceExpansionismBase = raw.raceExpansionismBase || raw.auRaceExpansionismBase || {};
  const modMetadata = raw.modMetadata || raw.auModMetadata || {id: modId};

  return {
    modId,
    races,
    fantasyRaceBases,
    raceLanguageProfiles,
    raceSetContributions,
    raceExpansionismBase,
    modMetadata
  };
}

function loadRaceModBundles(rootDir, options) {
  const explicitMods = options && options.explicitMods;
  const useExplicit = Array.isArray(explicitMods) && explicitMods.length > 0;

  const configInfo = useExplicit ? {enabled: explicitMods, path: null} : loadModsConfig(rootDir);
  const enabledIds = configInfo.enabled || [];

  const bundles = [];
  const warnings = [];

  enabledIds.forEach(modId => {
    const modDir = path.join(rootDir, "mods", modId);
    let stat;
    try {
      stat = fs.existsSync(modDir) && fs.statSync(modDir);
    } catch (error) {
      stat = null;
    }

    if (!stat || !stat.isDirectory()) {
      warnings.push(`Mod directory not found or not a directory: ${modDir}`);
      return;
    }

    let entries;
    try {
      entries = fs.readdirSync(modDir, {withFileTypes: true});
    } catch (error) {
      warnings.push(`Failed to read mod directory for ${modId}: ${error.message}`);
      return;
    }

    const raceFiles = entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .filter(name => /^races.*\.js$/i.test(name));

    if (!raceFiles.length) {
      warnings.push(`No races*.js bundle found for mod ${modId} in ${modDir}`);
      return;
    }

    raceFiles.forEach(fileName => {
      const raceFile = path.join(modDir, fileName);
      try {
        const raw = require(raceFile);
        bundles.push(normalizeRaceBundle(raw, modId));
      } catch (error) {
        warnings.push(
          `Failed to load race bundle for mod ${modId} from ${fileName}: ${error.message}`
        );
      }
    });
  });

  return {bundles, warnings, configInfo};
}

function unionUnique(a, b) {
  const result = new Set();
  if (Array.isArray(a)) a.forEach(v => result.add(v));
  if (Array.isArray(b)) b.forEach(v => result.add(v));
  return Array.from(result);
}

function cloneRaceSets(coreRaceSets) {
  const result = {};
  if (!coreRaceSets) return result;

  Object.keys(coreRaceSets).forEach(setName => {
    const original = coreRaceSets[setName];
    if (original instanceof Set) {
      result[setName] = new Set(original);
    } else if (Array.isArray(original)) {
      result[setName] = new Set(original);
    }
  });

  return result;
}

function mergeRaceData(core, bundles) {
  const mergedFantasyRaceBases = Object.assign({}, core.fantasyRaceBases || {});
  const mergedRaceLanguageProfiles = Object.assign({}, core.raceLanguageProfiles || {});
  const mergedRaceExpansionismBase = Object.assign({}, core.raceExpansionismBase || {});
  const mergedRaceSets = cloneRaceSets(core.raceSets || {});

  const warnings = [];

  bundles.forEach(bundle => {
    const modId = bundle.modId;

    Object.keys(bundle.fantasyRaceBases || {}).forEach(raceName => {
      if (Object.prototype.hasOwnProperty.call(mergedFantasyRaceBases, raceName)) {
        warnings.push(
          `Mod ${modId} defines fantasyRaceBases for existing race '${raceName}' – keeping core value`
        );
        return;
      }
      mergedFantasyRaceBases[raceName] = bundle.fantasyRaceBases[raceName];
    });

    Object.keys(bundle.raceLanguageProfiles || {}).forEach(raceName => {
      const modProfile = bundle.raceLanguageProfiles[raceName];
      const coreProfile = mergedRaceLanguageProfiles[raceName];

      if (!coreProfile) {
        mergedRaceLanguageProfiles[raceName] = modProfile;
        return;
      }

      const categories = unionUnique(coreProfile.categories || [], modProfile.categories || []);
      const families = unionUnique(coreProfile.families || [], modProfile.families || []);

      mergedRaceLanguageProfiles[raceName] = {categories, families};
      warnings.push(`Merged raceLanguageProfiles for '${raceName}' from mod ${modId}`);
    });

    Object.keys(bundle.raceSetContributions || {}).forEach(setName => {
      const races = bundle.raceSetContributions[setName] || [];
      if (!mergedRaceSets[setName]) mergedRaceSets[setName] = new Set();
      const set = mergedRaceSets[setName];
      races.forEach(raceName => set.add(raceName));
    });

    Object.keys(bundle.raceExpansionismBase || {}).forEach(raceName => {
      if (Object.prototype.hasOwnProperty.call(mergedRaceExpansionismBase, raceName)) {
        warnings.push(
          `Mod ${modId} defines raceExpansionismBase for existing race '${raceName}' – keeping core value`
        );
        return;
      }
      mergedRaceExpansionismBase[raceName] = bundle.raceExpansionismBase[raceName];
    });
  });

  return {
    fantasyRaceBases: mergedFantasyRaceBases,
    raceLanguageProfiles: mergedRaceLanguageProfiles,
    raceExpansionismBase: mergedRaceExpansionismBase,
    raceSets: mergedRaceSets,
    warnings
  };
}

module.exports = {
  loadModsConfig,
  loadRaceModBundles,
  normalizeRaceBundle,
  mergeRaceData
};
