#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_FILE_PATH = path.join(__dirname, "data", "continent-file-mapping.json");

const VALID_TYPES = [
  "africa", "asia", "europe", "northAmerica",
  "oceania", "southAmerica", "fantasy", "creole"
];

function loadContinentData() {
  console.log("Loading continent namebase data...\n");

  if (!fs.existsSync(DATA_FILE_PATH)) {
    console.error(`Data file not found: ${DATA_FILE_PATH}`);
    console.log("Run 'node tools/loaders/parse-continent-files.js' first.");
    process.exit(1);
  }

  const rawData = fs.readFileSync(DATA_FILE_PATH, "utf8");
  const data = JSON.parse(rawData);

  console.log(`Loaded ${data.entries.length} entries from ${data.metadata.continents.length} namebase types\n`);

  displayStatistics(data);

  return data;
}

function displayStatistics(data) {
  console.log("=== Namebase Statistics ===\n");

  const stats = data.continent_statistics || {};
  const total = Object.values(stats).reduce((sum, n) => sum + n, 0);

  console.log("Entries by namebase type:");
  Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      console.log(`  ${type.padEnd(15)}: ${count.toString().padStart(5)} (${pct}%)`);
    });
  console.log(`  ${"─".repeat(25)}`);
  console.log(`  ${"TOTAL".padEnd(15)}: ${total.toString().padStart(5)} (100.0%)`);

  console.log("\nData quality:");
  const uniqueNames = new Set(data.entries.map(e => e.name)).size;
  const uniqueIndices = new Set(data.entries.map(e => e.index)).size;
  console.log(`  Unique names: ${uniqueNames}`);
  console.log(`  Unique indices: ${uniqueIndices}`);

  if (data.metadata.issues && data.metadata.issues.length > 0) {
    console.log(`\nValidation issues: ${data.metadata.issues.length}`);
    data.metadata.issues.forEach((issue, i) => {
      console.log(`  ${i+1}. ${issue}`);
    });
  } else {
    console.log("\nNo validation issues.");
  }

  console.log("\nSample entries:");
  const samples = {};
  data.entries.forEach(e => {
    if (!samples[e.type] && Object.keys(samples).length < 5) {
      samples[e.type] = e;
    }
  });
  Object.values(samples).forEach(e => {
    console.log(`  ${e.type}: "${e.name}" (i:${e.index})`);
  });
}

if (require.main === module) {
  loadContinentData();
}

module.exports = { loadContinentData };
