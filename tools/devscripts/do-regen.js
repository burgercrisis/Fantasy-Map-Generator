"use strict";

var fs = require("fs");

var root = "E:/code/Fantasy-Map-Generator";
var catPath = root + "/config/language-mixes.json";
var mapPath = root + "/config/language-mixer-map.json";
var contPath = root + "/tools/data/continent-file-mapping.json";

var catalog = JSON.parse(fs.readFileSync(catPath));
var existing = JSON.parse(fs.readFileSync(mapPath));
var continent = JSON.parse(fs.readFileSync(contPath));

var validBases = new Set();
for (var i = 0; i < continent.entries.length; i++) {
  var entry = continent.entries[i];
  if (entry.index !== undefined) validBases.add(entry.index);
}
var validBaseArr = Array.from(validBases).sort(function(a, b) { return a - b; });

var existingByIso = {};
for (var j = 0; j < existing.length; j++) {
  existingByIso[existing[j].iso] = existing[j];
}

var newMap = [];
var assigned = 0;
for (var k = 0; k < catalog.length; k++) {
  var lang = catalog[k];
  var iso = lang.iso;
  var existingEntry = existingByIso[iso];
  if (existingEntry && existingEntry.bases && existingEntry.bases.length > 0) {
    newMap.push({iso: iso, bases: existingEntry.bases});
  } else {
    var numBases = 1 + Math.floor(Math.random() * 3);
    var shuffled = validBaseArr.slice().sort(function() { return Math.random() - 0.5; });
    newMap.push({iso: iso, bases: shuffled.slice(0, numBases)});
    assigned++;
  }
}

fs.writeFileSync(mapPath, JSON.stringify(newMap, null, 2));
console.log("DONE: " + newMap.length + " entries, assigned " + assigned + " new");