"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * Check all namebase files for index collisions and duplicate names
 * Reports: indices that appear multiple times, names that appear multiple times
 */

const namebaseFiles = [
  "modules/namebases-africa.js",
  "modules/namebases-asia.js",
  "modules/namebases-europe.js",
  "modules/namebases-northAmerica.js",
  "modules/namebases-southAmerica.js",
  "modules/namebases-oceania.js"
];

function extractEntries(content) {
  const entries = [];
  const entryBlocks = content.split(/^\s*\{/m).slice(1);
  
  entryBlocks.forEach(block => {
    const nameMatch = block.match(/"?name"?\s*:\s*"([^"]+)"/);
    const iMatch = block.match(/"?i"?\s*:\s*(\d+)/);
    
    if (nameMatch && iMatch) {
      entries.push({
        name: nameMatch[1],
        i: parseInt(iMatch[1]),
        file: "extracted"
      });
    }
  });
  return entries;
}

function main() {
  const allNames = {};
  const allIndices = {};
  const indexCollisions = [];
  const nameCollisions = [];
  
  namebaseFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(file, "utf8");
    const entries = extractEntries(content);
    
    entries.forEach(e => {
      // Check index collisions
      if (allIndices[e.i]) {
        indexCollisions.push({
          i: e.i,
          names: [allIndices[e.i], e.name],
          files: [allIndices[e.i].file, file]
        });
      } else {
        allIndices[e.i] = { name: e.name, file };
      }
      
      // Check name collisions
      if (allNames[e.name]) {
        nameCollisions.push({
          name: e.name,
          indices: [allNames[e.name], e.i],
          files: [allNames[e.name].file, file]
        });
      } else {
        allNames[e.name] = { name: e.name, i: e.i, file };
      }
    });
  });
  
  console.log("=== INDEX COLLISIONS ===");
  console.log(`Found ${indexCollisions.length} index collisions`);
  indexCollisions.slice(0, 20).forEach(c => {
    console.log(`  Index ${c.i}: ${c.names.join(" vs ")}`);
  });
  
  console.log("\n=== NAME COLLISIONS ===");
  console.log(`Found ${nameCollisions.length} name collisions`);
  nameCollisions.slice(0, 20).forEach(c => {
    console.log(`  "${c.name}": indices ${c.indices.join(" vs ")}`);
  });
}

main();