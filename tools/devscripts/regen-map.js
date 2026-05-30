"use strict";

const fs = require("node:fs");

const root = "E:\\code\\Fantasy-Map-Generator";
const logFile = root + "\\run-log.txt";

// Simple logger
let logs = [];
function log(msg) {
  logs.push(msg);
  console.log(msg);
}

// Wrap in try-catch
try {
  log("Starting regeneration...");
  
  // Read files
  const catPath = root + "\\config\\language-mixes.json";
  const mapPath = root + "\\config\\language-mixer-map.json";
  const contPath = root + "\\tools\\data\\continent-file-mapping.json";
  
  log("Reading catalog...");
  const catalog = JSON.parse(fs.readFileSync(catPath, "utf8"));
  log("Catalog entries: " + catalog.length);
  
  log("Reading existing map...");
  const existing = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  log("Existing map entries: " + existing.length);
  
  log("Reading continent mapping...");
  const continent = JSON.parse(fs.readFileSync(contPath, "utf8"));
  
  // Get valid base indices
  log("Collecting valid base indices...");
  const validBases = new Set();
  for (const entry of continent.entries) {
    if (entry.index !== undefined) {
      validBases.add(entry.index);
    }
  }
  const validBaseArr = Array.from(validBases).sort((a, b) => a - b);
  log("Valid bases found: " + validBaseArr.length);
  
  // Create map of existing entries by ISO
  log("Building lookup table...");
  const existingByIso = new Map();
  for (const e of existing) {
    existingByIso.set(e.iso, e);
  }
  
  // Assign bases
  log("Processing languages...");
  const newMap = [];
  let assigned = 0;
  let kept = 0;
  
  for (const lang of catalog) {
    const iso = lang.iso;
    const existingEntry = existingByIso.get(iso);
    
    if (existingEntry && existingEntry.bases && existingEntry.bases.length > 0) {
      // Keep existing bases
      newMap.push({ iso: iso, bases: existingEntry.bases });
      kept++;
    } else {
      // Assign new random bases (1-3)
      const numBases = 1 + Math.floor(Math.random() * 3);
      const shuffled = validBaseArr.slice().sort(() => Math.random() - 0.5);
      const bases = shuffled.slice(0, numBases);
      newMap.push({ iso: iso, bases: bases });
      assigned++;
    }
  }
  
  log("Kept existing: " + kept);
  log("Assigned new: " + assigned);
  log("Total entries: " + newMap.length);
  
  // Write output
  log("Writing to " + mapPath + "...");
  const json = JSON.stringify(newMap, null, 2);
  fs.writeFileSync(mapPath, json, "utf8");
  log("Done!");
  
} catch (e) {
  log("ERROR: " + e.message);
  log(e.stack);
}

// Write log to file
fs.writeFileSync(logFile, logs.join("\n"), "utf8");