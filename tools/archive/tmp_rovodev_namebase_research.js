"use strict";

const fs = require("node:fs");
const vm = require("node:vm");

let output = [];

function log(msg) {
  output.push(msg);
}

global.window = {
  realWorldNameBases: null,
  fantasyNameBases: null,
  africaNameBases: null,
  asiaNameBases: null,
  europeNameBases: null,
  northAmericaNameBases: null,
  southAmericaNameBases: null,
  oceaniaNameBases: null,
  unknownNameBases: null,
  defaultNameBases: null,
  nameBases: null,
  defaultNameBaseIds: []
};

function loadFile(filepath) {
  const code = fs.readFileSync(filepath, "utf8");
  const script = new vm.Script(code);
  const context = vm.createContext(global);
  script.runInContext(context);
}

log("Loading namebase files...");

loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-africa.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-asia.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-europe.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-northAmerica.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-southAmerica.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-oceania.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-unknown.js");
loadFile("E:\\code\\Fantasy-Map-Generator\\modules\\namebases-fantasy.js");

log("Africa bases: " + (window.africaNameBases ? window.africaNameBases.length : 0));
log("Asia bases: " + (window.asiaNameBases ? window.asiaNameBases.length : 0));
log("Europe bases: " + (window.europeNameBases ? window.europeNameBases.length : 0));
log("North America bases: " + (window.northAmericaNameBases ? window.northAmericaNameBases.length : 0));
log("South America bases: " + (window.southAmericaNameBases ? window.southAmericaNameBases.length : 0));
log("Oceania bases: " + (window.oceaniaNameBases ? window.oceaniaNameBases.length : 0));
log("Unknown bases: " + (window.unknownNameBases ? window.unknownNameBases.length : 0));
log("Fantasy bases: " + (window.fantasyNameBases ? window.fantasyNameBases.length : 0));

const continentArrays = [];
if (window.africaNameBases) continentArrays.push(...window.africaNameBases);
if (window.asiaNameBases) continentArrays.push(...window.asiaNameBases);
if (window.europeNameBases) continentArrays.push(...window.europeNameBases);
if (window.northAmericaNameBases) continentArrays.push(...window.northAmericaNameBases);
if (window.southAmericaNameBases) continentArrays.push(...window.southAmericaNameBases);
if (window.oceaniaNameBases) continentArrays.push(...window.oceaniaNameBases);
if (window.unknownNameBases) continentArrays.push(...window.unknownNameBases);

window.realWorldNameBases = continentArrays;

if (!Array.isArray(window.realWorldNameBases)) window.realWorldNameBases = [];
if (!Array.isArray(window.fantasyNameBases)) window.fantasyNameBases = [];

const all = window.realWorldNameBases.concat(window.fantasyNameBases);
all.sort((a, b) => {
  const ai = typeof a.i === "number" ? a.i : 0;
  const bi = typeof b.i === "number" ? b.i : 0;
  return ai - bi;
});

let maxIndex = all.reduce((max, b) => {
  if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) return max;
  return b.i > max ? b.i : max;
}, 0);

const byIndex = new Array(maxIndex + 1);

for (const b of all) {
  if (!b || typeof b.i !== "number" || !Number.isFinite(b.i)) continue;
  const i = b.i;
  if (!byIndex[i]) {
    byIndex[i] = b;
  }
}

const nameBases = byIndex;
const defaultNameBaseIds = byIndex.reduce((ids, b, i) => {
  if (b) ids.push(i);
  return ids;
}, []);

log("");
log("=== RESULTS ===");
log("Total bases loaded: " + defaultNameBaseIds.length);
log("Real World bases: " + window.realWorldNameBases.length);
log("Fantasy bases: " + window.fantasyNameBases.length);

log("");
log("=== INDEX 17 (Arabic) ===");
const entry17 = nameBases[17];
if (entry17) {
  log("Name: " + entry17.name);
  log("Index: " + entry17.i);
  const names = entry17.b.split(",");
  log("First 5: " + names.slice(0, 5).join(", "));
} else {
  log("NOT FOUND");
}

log("");
log("=== INDEX 33 (Elven) ===");
const entry33 = nameBases[33];
if (entry33) {
  log("Name: " + entry33.name);
  log("Index: " + entry33.i);
  const names = entry33.b.split(",");
  log("First 5: " + names.slice(0, 5).join(", "));
} else {
  log("NOT FOUND");
}

log("");
log("=== INDICES BY CONTINENT ===");
const sources = {
  "Africa": window.africaNameBases,
  "Asia": window.asiaNameBases,
  "Europe": window.europeNameBases,
  "NorthAmerica": window.northAmericaNameBases,
  "SouthAmerica": window.southAmericaNameBases,
  "Oceania": window.oceaniaNameBases,
  "Unknown": window.unknownNameBases,
  "Fantasy": window.fantasyNameBases
};

for (const [name, bases] of Object.entries(sources)) {
  if (bases && bases.length > 0) {
    const indices = bases.map(b => b.i).sort((a,b) => a-b);
    log(name + ": " + indices.join(", "));
  }
}

log("");
log("=== ALL INDICES ===");
log(defaultNameBaseIds.join(", "));

fs.writeFileSync("E:\\code\\Fantasy-Map-Generator\\tools\\tmp_rovodev_output.txt", output.join("\n"));
console.log("Output written to tmp_rovodev_output.txt");