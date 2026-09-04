"use strict";
/**
 * COMPLETE REBUILD of namebases-research.js from all sources:
 * 1. Load all entries from continent files
 * 2. Load all entries from research files (research-*.json)
 * 3. Load all map entries to find their target base indices
 * 4. For each map base that has no data, try to populate from research by name
 * 5. For map bases with no entry at all, create a new entry (with research data if available)
 * 6. Write the complete research file
 */
const fs = require("fs");
const path = require("path");

const moduleDir = path.resolve(__dirname, "..", "modules");
const publicDir = path.resolve(__dirname, "..", "public", "modules");
const mapPath = path.resolve(__dirname, "..", "public", "config", "language-mixer-map.js");
const catalogPath = path.resolve(__dirname, "..", "config", "language-mixes.json");
const researchDir = path.resolve(__dirname, "work-data");

// Load map
const mapContent = fs.readFileSync(mapPath, "utf8");
const mapMatch = mapContent.match(/languageMixerMap\s*=\s*(\[[\s\S]*?\]);/);
const map = JSON.parse(mapMatch[1]);

// Load catalog
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const catByISO = {};
const isoByName = new Map();
for (const c of catalog) {
  catByISO[c.iso] = c;
  if (!isoByName.has(c.name.toLowerCase().trim())) {
    isoByName.set(c.name.toLowerCase().trim(), []);
  }
  isoByName.get(c.name.toLowerCase().trim()).push(c.iso);
}

// Load all research data by name
const nameToResearch = new Map();
const researchFiles = [
  "research-germanic.json", "research-africa.json", "research-asia.json",
  "research-europe.json", "research-pacific-americas.json",
  "research-romance-variants.json", "research-slavic-variants.json",
  "research-old-english.json", "research-caucasus.json",
  "research-mixed-3.json", "research-mixed-4.json", "research-mixed-5.json",
  "research-mixed-6.json", "research-extra.json", "research-pacific-2.json",
  "research-pacific-3.json", "research-base1-redirects.json",
  "research-africa-2.json", "research-africa-3.json", "research-africa-4.json",
  "research-africa-5.json", "research-africa-6.json", "research-africa-extra.json",
  "research-asia-2.json", "research-asia-3.json", "research-asia-4.json",
  "research-asia-5.json", "research-asia-6.json", "research-americas-2.json",
  "research-germanic.json", "research-misc-2.json",
  "research-no-data-pilot.json"
];
for (const rf of researchFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(researchDir, rf), "utf8"));
    if (data.results && Array.isArray(data.results)) {
      for (const r of data.results) {
        if (r.name && r.names && r.names.length > 0) {
          nameToResearch.set(r.name.toLowerCase().trim(), r.names);
        }
      }
    }
  } catch (e) {}
}

console.log(`Research entries (with data): ${nameToResearch.size}`);

// Load all existing entries from continent files
const iToData = new Map(); // i -> {name, b, source}
const continentFiles = [
  "namebases-africa.js", "namebases-asia.js", "namebases-europe.js",
  "namebases-northAmerica.js", "namebases-southAmerica.js",
  "namebases-oceania.js", "namebases-fantasy.js"
];
for (const f of continentFiles) {
  try {
    const c = fs.readFileSync(path.join(moduleDir, f), "utf8");
    const entryRegex = /\{[^{}]*\}/g;
    const m = c.match(entryRegex);
    if (m) {
      for (const em of m) {
        const nameMatch = em.match(/"name"\s*:\s*"([^"]+)"/);
        const iMatch = em.match(/"i"\s*:\s*(\d+)/);
        const bMatch = em.match(/"b"\s*:\s*"([^"]*)"/);
        if (nameMatch && iMatch) {
          const iVal = parseInt(iMatch[1], 10);
          const b = bMatch ? bMatch[1] : "";
          if (!iToData.has(iVal)) {
            iToData.set(iVal, { name: nameMatch[1], b: b, i: iVal });
          }
        }
      }
    }
  } catch (e) {}
}

console.log(`Continent file entries: ${iToData.size}`);

// Find unique base indices from the map
const uniqueI = new Set();
for (const m of map) {
  if (m.bases) for (const b of m.bases) uniqueI.add(b);
}
console.log(`Unique map bases: ${uniqueI.size}`);

// Find max i to use for creating new entries
let maxI = Math.max(...iToData.keys(), 0);
function getNextI() {
  do { maxI++; } while (iToData.has(maxI));
  return maxI++;
}

// For each map base, check if we have data
let fixed = 0;
let created = 0;
let hadData = 0;
let missing = 0;

for (const i of uniqueI) {
  const entry = iToData.get(i);
  if (entry && entry.b && entry.b.length > 0) {
    hadData++;
    continue;
  }

  // Find the ISO for this base
  let repISO = null;
  let repName = null;
  for (const m of map) {
    if (m.bases && m.bases.includes(i)) {
      repISO = m.iso;
      repName = catByISO[repISO]?.name;
      break;
    }
  }

  if (entry && repName && (!entry.b || entry.b.length === 0)) {
    // Entry exists but empty, try to populate
    const names = nameToResearch.get(repName.toLowerCase().trim());
    if (names && names.length > 0) {
      entry.b = names.join(",");
      fixed++;
      continue;
    }
    // Try substring match
    let bestMatch = null;
    let bestLen = 0;
    for (const rName of nameToResearch.keys()) {
      if (repName.toLowerCase().trim().includes(rName) || rName.includes(repName.toLowerCase().trim())) {
        if (rName.length > bestLen) {
          bestLen = rName.length;
          bestMatch = rName;
        }
      }
    }
    if (bestMatch) {
      const names2 = nameToResearch.get(bestMatch);
      if (names2 && names2.length > 0) {
        entry.b = names2.join(",");
        fixed++;
        continue;
      }
    }
  }

  if (!entry && repName) {
    // No entry exists, create one
    let names = nameToResearch.get(repName.toLowerCase().trim());
    if (!names) {
      // Try substring match
      let bestMatch = null;
      let bestLen = 0;
      for (const rName of nameToResearch.keys()) {
        if (repName.toLowerCase().trim().includes(rName) || rName.includes(repName.toLowerCase().trim())) {
          if (rName.length > bestLen) {
            bestLen = rName.length;
            bestMatch = rName;
          }
        }
      }
      if (bestMatch) names = nameToResearch.get(bestMatch);
    }
    const bData = names ? names.join(",") : "";
    const newI = getNextI();
    iToData.set(newI, { name: repName, b: bData, i: newI });
    // Update the map to point to the new index
    for (const m of map) {
      if (m.bases && m.bases.includes(i)) {
        m.bases = [newI];
      }
    }
    created++;
    if (bData) hadData++;
  }

  if (!entry && !repName) {
    missing++;
  }
}

console.log(`Had data: ${hadData}, Fixed: ${fixed}, Created: ${created}, Missing: ${missing}`);

// Assign ISO to each entry
for (const m of map) {
  if (m.bases && m.bases.length > 0) {
    const iVal = m.bases[0];
    const e = iToData.get(iVal);
    if (e && !e.iso) {
      e.iso = m.iso;
    }
  }
}

// Write the research file
let js = '"use strict";\n\n';
js += '// Auto-generated from research data files in tools/work-data/.\n';
js += 'window.researchNameBases = [\n';
let writtenCount = 0;
for (const e of iToData.values()) {
  if (e.i === undefined || e.i === null) continue;
  const bEscaped = (e.b || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const iso = e.iso || "unknown";
  js += `  { name: "${e.name}", iso: "${iso}", i: ${e.i}, min: 3, max: 20, d: "lnrt", m: 0.1, b: "${bEscaped}" },\n`;
  writtenCount++;
}
js += '];\n';

console.log(`Built JS string with ${writtenCount} entries, total length: ${js.length}`);
console.log("First 500 chars:", js.substring(0, 500));

fs.writeFileSync(path.join(moduleDir, "namebases-research.js"), js);
fs.writeFileSync(path.join(publicDir, "namebases-research.js"), js);
console.log(`Wrote research file with ${iToData.size} entries`);

// Write updated map
let newMapContent = '"use strict";\n\n';
newMapContent += '(function(){\n';
newMapContent += '  globalThis.languageMixerMap = ' + JSON.stringify(map, null, 2).split("\n").map((l, i) => i === 0 ? l : '  ' + l).join("\n") + ';\n';
newMapContent += '})();\n';
fs.writeFileSync(path.resolve(__dirname, "..", "config", "language-mixer-map.js"), newMapContent);
fs.writeFileSync(mapPath, newMapContent);
console.log(`Wrote updated map`);
