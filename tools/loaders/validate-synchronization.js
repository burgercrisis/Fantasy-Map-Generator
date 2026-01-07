#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_FILE_PATH = path.join(__dirname, "data", "continent-file-mapping.json");
const MIXER_MAP_PATH = path.join(__dirname, "..", "..", "config", "language-mixer-map.js");

function loadContinentData() {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    throw new Error(`Data file not found: ${DATA_FILE_PATH}`);
  }
  const rawData = fs.readFileSync(DATA_FILE_PATH, "utf8");
  return JSON.parse(rawData);
}

function loadMixerMapData() {
  if (!fs.existsSync(MIXER_MAP_PATH)) {
    throw new Error(`Mixer map not found: ${MIXER_MAP_PATH}`);
  }

  const content = fs.readFileSync(MIXER_MAP_PATH, "utf8");

  let languageMixerMap;
  try {
    const moduleContext = {
      globalThis: {},
      exports: {},
      require: require,
      module: { exports: {} },
      __dirname: path.dirname(MIXER_MAP_PATH),
      __filename: MIXER_MAP_PATH
    };

    const func = new Function(
      "require", "module", "exports", "globalThis", "__dirname", "__filename",
      content
    );
    func(require, moduleContext.module, moduleContext.exports,
        moduleContext.globalThis, moduleContext.__dirname, moduleContext.__filename);

    languageMixerMap = moduleContext.globalThis.languageMixerMap;
    if (!languageMixerMap || !Array.isArray(languageMixerMap)) {
      throw new Error("languageMixerMap not found or invalid");
    }
  } catch (error) {
    throw new Error(`Failed to parse mixer map: ${error.message}`);
  }

  return languageMixerMap;
}

function validateSynchronization() {
  console.log("=== Synchronization Validation ===\n");

  let continentData, mixerMapData;

  try {
    continentData = loadContinentData();
    console.log(`Loaded ${continentData.entries.length} continent entries`);
  } catch (error) {
    console.error(error.message);
    console.log("Run 'node tools/loaders/parse-continent-files.js' first.");
    process.exit(1);
  }

  try {
    mixerMapData = loadMixerMapData();
    console.log(`Loaded ${mixerMapData.length} mixer map entries\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const results = {
    matched: 0,
    unmatched: [],
    duplicateIndices: [],
    invalidBases: [],
    statistics: {}
  };

  const continentIndexMap = new Map();
  continentData.entries.forEach(e => {
    if (continentIndexMap.has(e.index)) {
      results.duplicateIndices.push({
        index: e.index,
        entries: [continentIndexMap.get(e.index), e]
      });
    }
    continentIndexMap.set(e.index, e);
  });

  const nameToEntries = new Map();
  continentData.entries.forEach(e => {
    const key = e.name.toLowerCase();
    if (!nameToEntries.has(key)) nameToEntries.set(key, []);
    nameToEntries.get(key).push(e);
  });

  mixerMapData.forEach(entry => {
    if (!entry.iso || !entry.bases) return;

    const isoLower = entry.iso.toLowerCase();

    let matched = false;

    if (nameToEntries.has(isoLower)) {
      matched = true;
    } else {
      for (const [name, entries] of nameToEntries) {
        if (name.includes(isoLower) || isoLower.includes(name)) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      results.matched++;

      entry.bases.forEach(baseIndex => {
        if (!continentIndexMap.has(baseIndex)) {
          results.invalidBases.push({
            iso: entry.iso,
            baseIndex: baseIndex
          });
        }
      });
    } else {
      results.unmatched.push({
        iso: entry.iso,
        bases: entry.bases
      });
    }
  });

  console.log("=== Match Results ===\n");
  console.log(`Matched: ${results.matched}`);
  console.log(`Unmatched: ${results.unmatched.length}`);

  console.log("\n=== Data Integrity ===\n");

  if (results.duplicateIndices.length === 0) {
    console.log("No duplicate indices in continent data.");
  } else {
    console.log(`Duplicate indices: ${results.duplicateIndices.length}`);
    results.duplicateIndices.forEach(d => {
      console.log(`  Index ${d.index}: ${d.entries.map(e => e.name).join(", ")}`);
    });
  }

  if (results.invalidBases.length === 0) {
    console.log("All base indices are valid.");
  } else {
    console.log(`Invalid base references: ${results.invalidBases.length}`);
    results.invalidBases.slice(0, 5).forEach(b => {
      console.log(`  ${b.iso} -> base ${b.baseIndex}`);
    });
    if (results.invalidBases.length > 5) {
      console.log(`  ... and ${results.invalidBases.length - 5} more`);
    }
  }

  console.log("\n=== Statistics by Namebase Type ===\n");

  const typeStats = {};
  continentData.entries.forEach(e => {
    typeStats[e.type] = (typeStats[e.type] || 0) + 1;
  });

  Object.entries(typeStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`${type.padEnd(15)}: ${count} entries`);
    });

  console.log("\n=== Sample Unmatched Entries ===\n");
  results.unmatched.slice(0, 5).forEach((u, i) => {
    console.log(`${i+1}. ${u.iso} -> [${u.bases.join(", ")}]`);
  });

  console.log("\n=== Validation Summary ===\n");
  const issues = results.duplicateIndices.length + results.invalidBases.length;
  if (issues === 0 && results.unmatched.length < mixerMapData.length * 0.1) {
    console.log("Validation PASSED");
    console.log(`Match rate: ${((results.matched / mixerMapData.length) * 100).toFixed(1)}%`);
  } else {
    console.log("Validation WARNING");
    console.log(`Issues found: ${issues}`);
    console.log(`Match rate: ${((results.matched / mixerMapData.length) * 100).toFixed(1)}%`);
  }

  return results;
}

if (require.main === module) {
  validateSynchronization();
}

module.exports = {
  validateSynchronization,
  loadContinentData,
  loadMixerMapData
};
