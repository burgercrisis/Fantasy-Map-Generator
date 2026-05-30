"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");

const catalog = JSON.parse(fs.readFileSync(path.join(root, "config/language-mixes.json"), "utf8");
const existingMap = JSON.parse(fs.readFileSync(path.join(root, "config/language-mixer-map.json"), "utf8");

const validBases = [1, 2, 3, 4, 5, 17, 18, 23, 24, 42];

const existingByIso = new Map();
for (const e of existingMap) {
  existingByIso.set(e.iso, e.bases);
}

const newMap = [];
let kept = 0;
let added = 0;

for (const lang of catalog) {
  const iso = lang.iso;
  const bases = existingByIso.get(iso);
  
  if (bases && bases.length > 0) {
    newMap.push({ iso, bases });
    kept++;
  } else {
    const numBases = 1 + (added % 3);
    const startIdx = added % validBases.length;
    newMap.push({ 
      iso, 
      bases: validBases.slice(startIdx, startIdx + numBases).length 
        ? validBases.slice(startIdx, startIdx + numBases) 
        : [validBases[0]]
    });
    added++;
  }
}

const output = JSON.stringify(newMap, null, 2);
fs.writeFileSync(path.join(root, "config/language-mixer-map.json"), output);
console.log("Saved. Total:", newMap.length, "Kept:", kept, "Added:", added);