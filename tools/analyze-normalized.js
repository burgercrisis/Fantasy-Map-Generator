"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const root = path.resolve(__dirname, "..");

const sandbox = {window: {}, module: {exports: {}}, exports: {}, console, nameBases: []};
sandbox.exports = sandbox.module.exports;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
const continentFiles = [
  "namebases-africa.js","namebases-asia.js","namebases-europe.js",
  "namebases-northAmerica.js","namebases-oceania.js","namebases-southAmerica.js","namebases-unknown.js"
];
for (const f of continentFiles) {
  vm.runInContext(fs.readFileSync(path.join(root,"modules",f),"utf8"), context, {filename:f});
}
vm.runInContext(fs.readFileSync(path.join(root,"modules","namebases-fantasy.js"),"utf8"), context, {filename:"fantasy"});
vm.runInContext(fs.readFileSync(path.join(root,"modules","namebases-dedicated.js"),"utf8"), context, {filename:"dedicated"});
vm.runInContext(fs.readFileSync(path.join(root,"modules","namebases-all.js"),"utf8"), context, {filename:"all"});
const NB = sandbox.window.defaultNameBases;

// Build seed ownership
const seedOwners = {};
for (let i = 0; i < NB.length; i++) {
  if (!NB[i]) continue;
  for (const s of NB[i].b.split(",").map(x=>x.trim()).filter(Boolean)) {
    if (!seedOwners[s]) seedOwners[s] = [];
    seedOwners[s].push(i);
  }
}

const mapRows = JSON.parse(fs.readFileSync(path.join(root,"config/language-mixer-map.json"),"utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root,"config/language-mixes.json"),"utf8"));
const catalogByIso = new Map();
for (const c of catalog) catalogByIso.set(c.iso, c);

const baseUseCount = {};
for (const r of mapRows) {
  if (!r.bases) continue;
  for (const b of r.bases) baseUseCount[b] = (baseUseCount[b] || 0) + 1;
}

// Find normalized failures with full details
const failures = [];
for (const r of mapRows) {
  if (!r.bases) continue;
  const entry = catalogByIso.get(r.iso);
  if (entry && entry.tags && entry.tags.includes("family")) continue;

  const uniqueBases = r.bases.filter(b => baseUseCount[b] === 1);
  if (uniqueBases.length === 0) continue;

  let uniqueCount = 0;
  const allSeeds = [];
  const sharedSeeds = [];
  for (const b of uniqueBases) {
    const base = NB[b];
    if (!base) continue;
    const seeds = base.b.split(",").map(x=>x.trim()).filter(Boolean);
    for (const s of seeds) {
      allSeeds.push(s);
      if (seedOwners[s] && seedOwners[s].length === 1) {
        uniqueCount++;
      } else {
        sharedSeeds.push(s);
      }
    }
  }

  if (uniqueCount < 10) {
    failures.push({
      iso: r.iso,
      name: entry?.name || "?",
      region: entry?.region || "?",
      family: entry?.family || "?",
      category: entry?.category || "?",
      baseIdx: uniqueBases[0],
      baseI: NB[uniqueBases[0]]?.i,
      uniqueSeeds: uniqueCount,
      totalSeeds: allSeeds.length,
      needed: 10 - uniqueCount,
      currentSeeds: allSeeds,
      sharedSeeds: sharedSeeds
    });
  }
}

// Sort by needed (descending) then by region
failures.sort((a, b) => b.needed - a.needed || a.region.localeCompare(b.region));

// Write detailed report
const lines = [];
lines.push("iso,name,region,family,category,baseI,uniqueSeeds,totalSeeds,needed,currentSharedSeeds");
for (const f of failures) {
  lines.push([
    f.iso, f.name, f.region, f.family, f.category, f.baseI,
    f.uniqueSeeds, f.totalSeeds, f.needed,
    f.sharedSeeds.slice(0,5).join(";")
  ].map(x => '"' + String(x).replace(/"/g, '""') + '"').join(","));
}
fs.writeFileSync(path.join(root, "docs/normalized-failures-detail.csv"), lines.join("\n"));

// Summary by region
const byRegion = {};
for (const f of failures) {
  if (!byRegion[f.region]) byRegion[f.region] = { count: 0, totalNeeded: 0 };
  byRegion[f.region].count++;
  byRegion[f.region].totalNeeded += f.needed;
}

console.log("Total normalized failures:", failures.length);
console.log("Total seeds needed:", failures.reduce((s,f) => s + f.needed, 0));
console.log("\nBy region:");
for (const [r, d] of Object.entries(byRegion).sort((a,b) => b[1].count - a[1].count)) {
  console.log("  " + r + ": " + d.count + " langs, " + d.totalNeeded + " seeds needed");
}

// Show worst cases
console.log("\nWorst cases (most seeds needed):");
for (const f of failures.slice(0, 20)) {
  console.log("  " + f.iso + " | " + f.name + " | " + f.region + " | " + f.family + " | need " + f.needed + " more unique seeds (have " + f.uniqueSeeds + "/" + f.totalSeeds + ")");
}
