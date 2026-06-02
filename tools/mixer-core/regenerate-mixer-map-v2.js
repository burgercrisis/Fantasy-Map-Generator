"use strict";
/**
 * Regenerate language-mixer-map.json with linguistically-accurate base assignments.
 *
 * Strategy:
 * 1. For catalog languages whose name exactly matches a namebase entry -> use that base
 * 2. For catalog languages that DON'T match -> assign a base from the same region
 *    that IS in the namebases, preferring same family/category
 * 3. Never assign a random base from a different continent/family
 *
 * Run: node tools/mixer-core/regenerate-mixer-map-v2.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(root, "config");
const MODULES_DIR = path.join(root, "modules");

const CONTINENT_FILES = [
  "namebases-africa.js",
  "namebases-asia.js",
  "namebases-europe.js",
  "namebases-northAmerica.js",
  "namebases-southAmerica.js",
  "namebases-oceania.js",
  "namebases-unknown.js"
];

// Region name normalization: catalog region -> continent file prefix
const REGION_TO_CONTINENT = {
  "Africa": "africa",
  "Asia": "asia",
  "Europe": "europe",
  "North America": "northAmerica",
  "South America": "southAmerica",
  "Pacific": "oceania",
  "Australia": "oceania",
  "Eurasia": "europe",       // Uralic, Turkic, etc. mostly in Europe file
  "Sino-Tibetan region": "asia",
  "East Asia": "asia",
  "Southeast Asia": "asia",
  "Central Asia": "asia",
  "South Asia": "asia",
  "West Asia": "asia",
  "Middle East": "asia",
  "North Africa": "africa",
  "Horn of Africa": "africa",
  "Siberia": "europe",       // Siberian languages in Europe file
  "Caucasus": "europe",      // Caucasus languages in Europe file
  "Mesoamerica": "northAmerica",
  "Central America": "northAmerica",
  "Caribbean": "northAmerica",
  "The Americas": "northAmerica",
  "Americas": "northAmerica",
  "Latin America": "southAmerica",
  "Arctic": "northAmerica",
  "Indian Ocean": "africa",
  "Upper Guinea": "africa",
  "Gulf of Guinea": "africa",
  "Misc": "unknown",
  "Ancient Mesopotamia": "asia",
  "Atlantic": "europe"
};

function loadNamebasesByRegion() {
  // Build: region -> [{idx, name, family}] from continent files
  const byRegion = {};
  for (const f of CONTINENT_FILES) {
    const continent = f.replace("namebases-", "").replace(".js", "");
    const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");

    // Parse each entry: "i": N, ... "name": "X"
    // Entries are separated by },{
    const entryRe = /"i":\s*(\d+)/g;
    let m;
    while ((m = entryRe.exec(content)) !== null) {
      const idx = parseInt(m[1], 10);
      // Find the nearest "name": "..." before this index (name precedes i in the file format)
      const before = content.slice(0, m.index);
      const afterIdx = before.lastIndexOf('"name":');
      if (afterIdx === -1) continue;
      const nameMatch = content.slice(afterIdx, afterIdx + 200).match(/"name":\s*"([^"]+)"/);
      if (!nameMatch) continue;
      const name = nameMatch[1].trim();

      if (!byRegion[continent]) byRegion[continent] = [];
      byRegion[continent].push({ idx, name });
    }
  }
  return byRegion;
}

function buildNameToBaseMap() {
  // Build: name -> [{idx, continent}] for exact matching
  const nameMap = new Map();
  for (const f of CONTINENT_FILES) {
    const continent = f.replace("namebases-", "").replace(".js", "");
    const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
    const entryRe = /"i":\s*(\d+)/g;
    let m;
    while ((m = entryRe.exec(content)) !== null) {
      const idx = parseInt(m[1], 10);
      const before = content.slice(0, m.index);
      const afterIdx = before.lastIndexOf('"name":');
      if (afterIdx === -1) continue;
      const nameMatch = content.slice(afterIdx, afterIdx + 200).match(/"name":\s*"([^"]+)"/);
      if (!nameMatch) continue;
      const name = nameMatch[1].trim();
      if (!nameMap.has(name)) nameMap.set(name, []);
      nameMap.get(name).push({ idx, continent });
    }
  }
  return nameMap;
}

function main() {
  console.log("Loading catalog...");
  const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));
  console.log("Catalog entries:", catalog.length);

  const nameToBase = buildNameToBaseMap();
  const basesByRegion = loadNamebasesByRegion();

  console.log("Namebase unique names:", nameToBase.size);
  for (const [r, bases] of Object.entries(basesByRegion)) {
    console.log("  " + r + ": " + bases.length + " base entries");
  }

  const newMap = [];
  let exactMatch = 0;
  let regionFallback = 0;
  let noRegionBases = 0;
  let skippedFamily = 0;

  // Track which bases have been used for fallback to distribute evenly
  const fallbackCounter = {};

  for (const lang of catalog) {
    // Skip family-only entries
    if (Array.isArray(lang.tags) && lang.tags.indexOf("family") !== -1) {
      skippedFamily++;
      continue;
    }

    const name = lang.name;

    // Strategy 1: Exact name match
    const exactBases = nameToBase.get(name);
    if (exactBases && exactBases.length > 0) {
      newMap.push({ iso: lang.iso, bases: exactBases.map(b => b.idx) });
      exactMatch++;
      continue;
    }

    // Strategy 2: Region-based fallback
    const continent = REGION_TO_CONTINENT[lang.region] || "unknown";
    const regionBases = basesByRegion[continent] || [];

    if (regionBases.length > 0) {
      // Pick a base from this region, rotating through them to avoid clustering
      const key = continent;
      if (!fallbackCounter[key]) fallbackCounter[key] = 0;
      const pickIdx = fallbackCounter[key] % regionBases.length;
      fallbackCounter[key]++;
      const picked = regionBases[pickIdx];
      newMap.push({ iso: lang.iso, bases: [picked.idx] });
      regionFallback++;
    } else {
      // Last resort: use any base from the unknown continent
      const unknownBases = basesByRegion["unknown"] || [];
      if (unknownBases.length > 0) {
        const pick = unknownBases[Math.floor(Math.random() * unknownBases.length)];
        newMap.push({ iso: lang.iso, bases: [pick.idx] });
        regionFallback++;
      } else {
        noRegionBases++;
        console.log("  WARNING: No base for " + lang.iso + " (" + name + ", " + lang.region + ")");
      }
    }
  }

  console.log("\n=== Results ===");
  console.log("Exact name matches:", exactMatch);
  console.log("Region-based fallbacks:", regionFallback);
  console.log("No bases available:", noRegionBases);
  console.log("Skipped (family):", skippedFamily);
  console.log("Total in map:", newMap.length);

  // Write JSON
  const output = JSON.stringify(newMap, null, 2);
  fs.writeFileSync(path.join(CONFIG_DIR, "language-mixer-map.json"), output);
  console.log("\nWrote config/language-mixer-map.json");

  // Write JS bundle
  const banner = [
    '"use strict";',
    "",
    "// Auto-generated by tools/mixer-core/regenerate-mixer-map-v2.js",
    "// Edit the JSON source and rerun the generator if you change the mapping.",
    "(function(){",
    "  globalThis.languageMixerMap = " + JSON.stringify(newMap, null, 2) + ";",
    "})();",
    ""
  ].join("\n");
  fs.writeFileSync(path.join(CONFIG_DIR, "language-mixer-map.js"), banner);
  console.log("Wrote config/language-mixer-map.js");
}

main();
