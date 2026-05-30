"use strict";

console.log("START");
var fs = require("fs");
var root = "E:/code/Fantasy-Map-Generator";

// Read the files
var catFile = fs.readFileSync(root + "/config/language-mixes.json", "utf8");
var cat = JSON.parse(catFile);

var mapFile = fs.readFileSync(root + "/config/language-mixer-map.json", "utf8");
var map = JSON.parse(mapFile);

var contFile = fs.readFileSync(root + "/tools/data/continent-file-mapping.json", "utf8");
var cont = JSON.parse(contFile);

// Get valid bases
var validBases = {};
for (var i = 0; i < cont.entries.length; i++) {
  if (cont.entries[i].index !== undefined) {
    validBases[cont.entries[i].index] = true;
  }
}
var validArr = [];
for (var k in validBases) validArr.push(parseInt(k));
validArr.sort(function(a, b) { return a - b; });

// Build lookup
var lookup = {};
for (var j = 0; j < map.length; j++) {
  lookup[map[j].iso] = map[j].bases;
}

// Process
var newMap = [];
var assigned = 0;
for (var x = 0; x < cat.length; x++) {
  var iso = cat[x].iso;
  var bases = lookup[iso];
  
  if (bases && bases.length > 0) {
    newMap.push({iso: iso, bases: bases});
  } else {
    var num = 1 + Math.floor(Math.random() * 3);
    var shuf = validArr.slice().sort(function() { return Math.random() - 0.5; });
    newMap.push({iso: iso, bases: shuf.slice(0, num)});
    assigned++;
  }
}

// Write
fs.writeFileSync(root + "/config/language-mixer-map.json", JSON.stringify(newMap, null, 2));
fs.writeFileSync(root + "/final-result.txt", "Total: " + newMap.length + ", Assigned: " + assigned);
console.log("FINISH");