"use strict";

// Regenerate config/language-mixer-map.json to ensure all catalog languages have bases assigned.
// This script:
//   1. Loads config/language-mixes.json (the catalog)
//   2. Loads config/language-mixer-map.json (existing mapping)
//   3. Collects valid base indices from continent file mapping
//   4. For each language in catalog, assigns 1-3 valid bases if not already assigned
//   5. Saves to config/language-mixer-map.json
//
// Run from the project root with:
//   node tools/mixer-core/regenerate-map.js

var fs = require("fs");
var path = require("path");

var root = path.resolve(__dirname, "../..");

var catPath = path.join(root, "config/language-mixes.json");
var mapPath = path.join(root, "config/language-mixer-map.json");
var contPath = path.join(root, "tools/data/continent-file-mapping.json");

console.log("Reading catalog...");
var catalog = JSON.parse(fs.readFileSync(catPath, "utf8"));
console.log("Catalog entries: " + catalog.length);

console.log("Reading existing map...");
var existing = JSON.parse(fs.readFileSync(mapPath, "utf8"));
console.log("Existing map entries: " + existing.length);

console.log("Reading continent mapping...");
var continent = JSON.parse(fs.readFileSync(contPath, "utf8"));

// Get valid base indices
console.log("Collecting valid bases...");
var validBases = {};
for (var i = 0; i < continent.entries.length; i++) {
  var idx = continent.entries[i].index;
  if (idx !== undefined) validBases[idx] = true;
}
var validArr = [];
for (var k in validBases) validArr.push(parseInt(k, 10));
validArr.sort(function(a, b) { return a - b; });
console.log("Valid bases found: " + validArr.length);

// Create lookup for existing entries
console.log("Building lookup table...");
var lookup = {};
for (var j = 0; j < existing.length; j++) {
  lookup[existing[j].iso] = existing[j].bases;
}

// Process each language
console.log("Assigning bases...");
var newMap = [];
var assigned = 0;
var kept = 0;

for (var x = 0; x < catalog.length; x++) {
  var iso = catalog[x].iso;
  var bases = lookup[iso];
  
  if (bases && bases.length > 0) {
    // Keep existing bases
    newMap.push({ iso: iso, bases: bases });
    kept++;
  } else {
    // Assign new random bases (1-3)
    var numBases = 1 + Math.floor(Math.random() * 3);
    var shuffled = validArr.slice().sort(function() { return Math.random() - 0.5; });
    newMap.push({ iso: iso, bases: shuffled.slice(0, numBases) });
    assigned++;
  }
}

console.log("Kept existing: " + kept);
console.log("Assigned new: " + assigned);
console.log("Total: " + newMap.length);

// Write output
console.log("Writing map...");
fs.writeFileSync(mapPath, JSON.stringify(newMap, null, 2));
console.log("Done!");