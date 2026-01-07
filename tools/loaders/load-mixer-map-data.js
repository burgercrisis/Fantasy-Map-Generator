#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const MIXER_MAP_PATH = path.join(__dirname, "..", "..", "config", "language-mixer-map.js");

function loadMixerMapData() {
  console.log("Loading language mixer map...\n");

  if (!fs.existsSync(MIXER_MAP_PATH)) {
    console.error(`Mixer map not found: ${MIXER_MAP_PATH}`);
    process.exit(1);
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
    console.error(`Failed to parse mixer map: ${error.message}`);
    process.exit(1);
  }

  console.log(`Loaded ${languageMixerMap.length} language entries\n`);

  analyzeMixerMapData(languageMixerMap);

  return languageMixerMap;
}

function analyzeMixerMapData(languageMixerMap) {
  let totalBases = 0;
  let entriesWithBases = 0;
  const basesCounts = {};
  const isoPatterns = { standard: 0, threeLetter: 0, hyphenated: 0, dialect: 0, other: 0 };

  languageMixerMap.forEach(entry => {
    const { iso, bases } = entry;

    if (!iso) return;

    if (iso.match(/^[a-z]{3}$/)) {
      isoPatterns.threeLetter++;
    } else if (iso.includes("-dialect") || iso.includes("-Dialect")) {
      isoPatterns.dialect++;
    } else if (iso.includes("-")) {
      isoPatterns.hyphenated++;
    } else if (iso.length <= 10) {
      isoPatterns.standard++;
    } else {
      isoPatterns.other++;
    }

    if (bases && Array.isArray(bases) && bases.length > 0) {
      entriesWithBases++;
      totalBases += bases.length;
      const count = bases.length;
      basesCounts[count] = (basesCounts[count] || 0) + 1;
    }
  });

  console.log("=== Mixer Map Statistics ===\n");

  console.log(`Total entries: ${languageMixerMap.length}`);
  console.log(`Entries with bases: ${entriesWithBases} (${((entriesWithBases/languageMixerMap.length)*100).toFixed(1)}%)`);
  console.log(`Total base references: ${totalBases}`);
  console.log(`Avg bases per entry: ${entriesWithBases > 0 ? (totalBases/entriesWithBases).toFixed(2) : "N/A"}`);

  console.log("\nISO pattern breakdown:");
  Object.entries(isoPatterns).forEach(([pattern, count]) => {
    const pct = ((count / languageMixerMap.length) * 100).toFixed(1);
    console.log(`  ${pattern.padEnd(12)}: ${count.toString().padStart(5)} (${pct}%)`);
  });

  console.log("\nBases array distribution:");
  Object.entries(basesCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .slice(0, 8)
    .forEach(([count, entries]) => {
      console.log(`  ${count} bases: ${entries} entries`);
    });

  const baseIndices = [];
  languageMixerMap.forEach(entry => {
    if (entry.bases) baseIndices.push(...entry.bases);
  });

  if (baseIndices.length > 0) {
    const uniqueBases = [...new Set(baseIndices)];
    console.log(`\nBase index range: ${Math.min(...uniqueBases)} - ${Math.max(...uniqueBases)}`);
    console.log(`Unique base indices: ${uniqueBases.length}`);
  }

  console.log("\nSample entries:");
  languageMixerMap.slice(0, 5).forEach((entry, i) => {
    const basesStr = entry.bases ? `[${entry.bases.slice(0,3).join(", ")}${entry.bases.length > 3 ? ", ..." : ""}]` : "[]";
    console.log(`  ${i+1}. ${entry.iso.padEnd(25)} -> ${basesStr}`);
  });
}

if (require.main === module) {
  loadMixerMapData();
}

module.exports = { loadMixerMapData };
