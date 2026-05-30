"use strict";

var fs = require("fs");
var root = "E:\\code\\Fantasy-Map-Generator";

// Read source files
var catalog = JSON.parse(fs.readFileSync(root + "\\config\\language-mixes.json", "utf8"));
var existing = JSON.parse(fs.readFileSync(root + "\\config\\language-mixer-map.json", "utf8"));
var cont = JSON.parse(fs.readFileSync(root + "\\tools\\data\\continent-file-mapping.json", "utf8"));

// Get valid base indices only
var validBases = {};
for (var i = 0; i < cont.entries.length; i++) {
  if (cont.entries[i].index !== undefined) validBases[cont.entries[i].index] = true;
}
var validArr = Object.keys(validBases).map(Number).sort(function(a,b) { return a-b; });

// Build existing lookup
var look = {};
for (var e = 0; e < existing.length; e++) look[existing[e].iso] = existing[e].bases;

// Assign
var out = [];
var newCnt = 0;
for (var c = 0; c < catalog.length; c++) {
  var iso = catalog[c].iso;
  var bases = look[iso];
  if (bases && bases.length > 0) {
    out.push({iso:iso,bases:bases});
  } else {
    var n = 1 + Math.floor(Math.random() * 3);
    out.push({iso:iso,bases:validArr.slice().sort(function(){return Math.random()-0.5}).slice(0,n)});
    newCnt++;
  }
}

// Write
fs.writeFileSync(root + "\\config\\language-mixer-map.json", JSON.stringify(out, null, 2));

// Report to file
fs.writeFileSync(root + "\\report.txt", "Total:" + out.length + "|New:" + newCnt);