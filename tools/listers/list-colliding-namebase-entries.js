"use strict";

const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "..", "..", "modules");

const OCEANIA_DEDICATED_INDICES = [
  20005, 20010, 20013, 20014, 20015, 20016,
  20020, 20021, 20022, 20023, 20024, 20025,
  20027, 20028, 20029, 20031
];

const CONTINENT_FILES = [
  "namebases-europe.js",
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js"
];

const ALL_NAMEBASE_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-oceania.js",
  "namebases-southAmerica.js",
  "namebases-fantasy.js",
  "namebases-creole.js"
];

function getContinentFromFile(filename) {
  if (filename.includes("africa")) return "africa";
  if (filename.includes("asia")) return "asia";
  if (filename.includes("europe")) return "europe";
  if (filename.includes("northAmerica")) return "northAmerica";
  if (filename.includes("southAmerica")) return "southAmerica";
  if (filename.includes("oceania")) return "oceania";
  if (filename.includes("fantasy")) return "fantasy";
  if (filename.includes("creole")) return "creole";
  return "unknown";
}

function parseEntryBlock(block) {
  const nameMatch = block.match(/"name":\s*"([^"]+)"/);
  const iMatch = block.match(/"i":\s*(\d+)/);

  return {
    name: nameMatch ? nameMatch[1] : "unknown",
    i: iMatch ? parseInt(iMatch[1], 10) : null,
    block: block
  };
}

function findCollidingEntries(scanFiles, forbiddenIndices) {
  const collisions = [];

  scanFiles.forEach(file => {
    const fullPath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, "utf8");
    const continent = getContinentFromFile(file);
    const blocks = content.match(/\{[\s\S]*?\}/g) || [];

    blocks.forEach(block => {
      const entry = parseEntryBlock(block);
      if (entry.i && forbiddenIndices.includes(entry.i)) {
        collisions.push({
          file: file,
          continent: continent,
          name: entry.name,
          index: entry.i
        });
      }
    });
  });

  return collisions;
}

function analyzeAllFiles() {
  console.log("=== Cross-Continent Index Analysis ===\n");

  const allIndices = {};
  const indexToFiles = {};
  const indexToNames = {};

  ALL_NAMEBASE_FILES.forEach(file => {
    const fullPath = path.join(MODULES_DIR, file);
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, "utf8");
    const continent = getContinentFromFile(file);

    allIndices[continent] = new Set();

    const blocks = content.match(/\{[\s\S]*?\}/g) || [];
    blocks.forEach(block => {
      const entry = parseEntryBlock(block);
      if (entry.i) {
        allIndices[continent].add(entry.i);

        if (!indexToFiles[entry.i]) indexToFiles[entry.i] = [];
        if (!indexToFiles[entry.i].includes(file)) indexToFiles[entry.i].push(file);

        if (!indexToNames[entry.i]) indexToNames[entry.i] = [];
        if (!indexToNames[entry.i].includes(entry.name)) indexToNames[entry.i].push(entry.name);
      }
    });
  });

  const collisions = [];
  Object.entries(indexToFiles).forEach(([index, files]) => {
    if (files.length > 1) {
      collisions.push({
        index: parseInt(index),
        files: files,
        names: indexToNames[index]
      });
    }
  });

  console.log(`Total index collisions: ${collisions.length}\n`);

  collisions.forEach(c => {
    console.log(`Index ${c.index}:`);
    c.files.forEach(f => {
      const continent = getContinentFromFile(f);
      console.log(`  - ${f} (${continent})`);
    });
    console.log(`  Names: ${c.names.join(", ")}`);
    console.log();
  });

  return collisions;
}

function main() {
  console.log("=== Oceania Reserved Range Check ===\n");

  const oceaniaCollisions = findCollidingEntries(CONTINENT_FILES, OCEANIA_DEDICATED_INDICES);

  if (oceaniaCollisions.length === 0) {
    console.log("No Oceania reserved range collisions found.\n");
  } else {
    console.log(`Found ${oceaniaCollisions.length} Oceania range collisions:\n`);
    oceaniaCollisions.forEach(c => {
      console.log(`${c.file}: "${c.name}" (i:${c.index})`);
    });
    console.log();
  }

  console.log("=== Full Cross-Continent Analysis ===\n");
  analyzeAllFiles();
}

main();
