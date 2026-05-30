"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");

function readJson(rel) {
  const full = path.join(root, rel);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function loadNameBases() {
  const sandbox = { window: {}, module: { exports: {} }, exports: {}, console, nameBases: [] };
  sandbox.exports = sandbox.module.exports;
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);

  const file = path.join(root, "modules", "namebases-all.js");
  const src = fs.readFileSync(file, "utf8");
  vm.runInContext(src, context, { filename: file });

  const bases = context.window.defaultNameBases;
  if (!Array.isArray(bases)) {
    throw new Error("defaultNameBases not populated");
  }
  return bases;
}

// Main diagnostic
const report = [];

try {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");
  const nameBases = loadNameBases();

  report.push("=== Language Mixer Diagnostic Report ===");
  report.push("");
  
  // Stats
  report.push("Namebases loaded: " + nameBases.filter(b => b && b.name).length);
  report.push("Map entries: " + map.length);
  report.push("Catalog entries: " + mixes.length);
  report.push("");

  // Find invalid bases
  const validIndices = new Set();
  nameBases.forEach((b, i) => { if (b && b.name) validIndices.add(i); });
  
  const mapByIso = new Map(map.map(e => [e.iso, e]));
  const catalogIsos = new Set(mixes.filter(l => {
    const tags = Array.isArray(l.tags) ? l.tags : [];
    return !tags.includes("family");
  }).map(l => l.iso));

  const allInvalid = [];
  const partiallyInvalid = [];
  
  for (const iso of catalogIsos) {
    const entry = mapByIso.get(iso);
    if (!entry || !entry.bases || !entry.bases.length) {
      continue;
    }
    
    const validBases = entry.bases.filter(b => validIndices.has(Number(b)));
    if (validBases.length === 0) {
      allInvalid.push(iso);
    } else if (validBases.length < entry.bases.length) {
      partiallyInvalid.push({ iso, valid: validBases.length, total: entry.bases.length });
    }
  }

  report.push("All bases invalid: " + allInvalid.length);
  if (allInvalid.length > 0) {
    report.push("  Sample: " + allInvalid.slice(0, 10).join(", "));
  }
  report.push("Partially invalid: " + partiallyInvalid.length);
  if (partiallyInvalid.length > 0) {
    report.push("  Sample: " + partiallyInvalid.slice(0, 5).map(p => p.iso + "(" + p.valid + "/" + p.total + ")").join(", "));
  }
  report.push("");

  // Check which indices are being referenced
  const usedIndices = new Set();
  for (const entry of map) {
    if (entry.bases) {
      for (const b of entry.bases) {
        if (typeof b === "number") usedIndices.add(b);
      }
    }
  }
  
  report.push("Unique base indices in map: " + usedIndices.size);
  report.push("Valid base indices available: " + validIndices.size);
  report.push("");

  // Find missing from map
  const inCatalogNotMap = [];
  for (const iso of catalogIsos) {
    if (!mapByIso.has(iso)) inCatalogNotMap.push(iso);
  }
  report.push("Catalog entries missing from map: " + inCatalogNotMap.length);
  if (inCatalogNotMap.length > 0) {
    report.push("  Sample: " + inCatalogNotMap.slice(0, 10).join(", "));
  }

} catch (e) {
  report.push("ERROR: " + (e.message || e));
}

fs.writeFileSync(path.join(root, "output.txt"), report.join("\n"), "utf8");
console.log("Wrote to output.txt");