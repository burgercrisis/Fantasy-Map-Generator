"use strict";
/**
 * Regenerate language-mixer-map.json v3 — linguistically-accurate base assignments.
 *
 * Strategy:
 * 1. Exact name match: catalog name == namebase entry name -> use that base
 * 2. Fallback: pick a base from a namebase entry whose name matches a catalog
 *    entry in the SAME region. This ensures African languages get African bases,
 *    Asian languages get Asian bases, etc.
 * 3. If no same-region base exists, pick from a linguistically related region
 *    (e.g., Middle East -> Africa for Arabic, Eurasia -> Europe for Uralic)
 *
 * Run: node tools/mixer-core/regenerate-mixer-map-v3.js
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

// Map catalog region to the continent file(s) that best represent it
// Order matters: first choice is best match
const REGION_TO_CONTINENTS = {
  "Africa": ["africa"],
  "North Africa": ["africa"],
  "Horn of Africa": ["africa"],
  "Upper Guinea": ["africa"],
  "Gulf of Guinea": ["africa"],
  "Indian Ocean": ["africa"],
  "Asia": ["asia"],
  "Sino-Tibetan region": ["asia"],
  "East Asia": ["asia"],
  "Southeast Asia": ["asia"],
  "Central Asia": ["asia"],
  "South Asia": ["asia"],
  "West Asia": ["asia"],
  "Middle East": ["asia", "africa"],     // Arabic in Africa file, others in Asia
  "Europe": ["europe"],
  "Eurasia": ["europe", "asia"],          // Uralic/Turkic in Europe file
  "Caucasus": ["europe", "asia"],
  "Atlantic": ["europe"],
  "Siberia": ["europe", "asia"],
  "North America": ["northAmerica"],
  "Mesoamerica": ["northAmerica"],
  "Central America": ["northAmerica"],
  "Caribbean": ["northAmerica"],
  "Arctic": ["northAmerica", "europe"],
  "The Americas": ["northAmerica", "southAmerica"],
  "Americas": ["northAmerica", "southAmerica"],
  "South America": ["southAmerica"],
  "Latin America": ["southAmerica"],
  "Pacific": ["oceania"],
  "Australia": ["oceania"],
  "Misc": ["unknown", "africa", "asia", "europe"],
  "Ancient Mesopotamia": ["asia", "africa"]
};

function loadAllNamebaseEntries() {
  // Returns array of { idx, name, continentFile }
  const entries = [];
  for (const f of CONTINENT_FILES) {
    const continent = f.replace("namebases-", "").replace(".js", "");
    const content = fs.readFileSync(path.join(MODULES_DIR, f), "utf8");
    const re = /"i":\s*(\d+)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const idx = parseInt(m[1], 10);
      const afterIdx = content.indexOf('"name":', m.index);
      if (afterIdx === -1) continue;
      const nameMatch = content.slice(afterIdx, afterIdx + 200).match(/"name":\s*"([^"]+)"/);
      if (!nameMatch) continue;
      entries.push({ idx, name: nameMatch[1].trim(), continent });
    }
  }
  return entries;
}

function main() {
  console.log("Loading catalog...");
  const catalog = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "language-mixes.json"), "utf8"));
  console.log("Catalog entries:", catalog.length);

  const allBases = loadAllNamebaseEntries();
  console.log("Total namebase entries:", allBases.length);

  // Build: name -> [idx, ...] for exact matching
  const nameToIdx = new Map();
  for (const b of allBases) {
    if (!nameToIdx.has(b.name)) nameToIdx.set(b.name, []);
    nameToIdx.get(b.name).push(b.idx);
  }

  // Build: continentFile -> [base entries] for fallback
  const basesByContinent = {};
  for (const b of allBases) {
    if (!basesByContinent[b.continent]) basesByContinent[b.continent] = [];
    basesByContinent[b.continent].push(b);
  }

  // Build: catalog region -> set of base names that exist in catalog for that region
  // This helps us pick a "same region" base for fallback
  const catalogRegionToBaseNames = {};
  for (const c of catalog) {
    if (!c.tags || !c.tags.includes("family")) {
      if (!catalogRegionToBaseNames[c.region]) catalogRegionToBaseNames[c.region] = new Set();
      // If this catalog name exists in namebases, it's a valid fallback target
      if (nameToIdx.has(c.name)) {
        catalogRegionToBaseNames[c.region].add(c.name);
      }
    }
  }

  // For each region, build a rotating index for fallback bases
  const fallbackState = {}; // region -> { names: [...], pos: 0 }

  function getFallbackBase(region) {
    // Get candidate base names: catalog entries from this region that exist in namebases
    if (!fallbackState[region]) {
      const names = catalogRegionToBaseNames[region] ? Array.from(catalogRegionToBaseNames[region]) : [];
      fallbackState[region] = { names, pos: 0 };
    }
    const state = fallbackState[region];

    if (state.names.length === 0) {
      return null;
    }

    const name = state.names[state.pos % state.names.length];
    state.pos++;
    const indices = nameToIdx.get(name);
    return indices[0]; // Use first index for this name
  }

  const newMap = [];
  let exactMatch = 0;
  let fallbackMatch = 0;
  let noMatch = 0;
  let skippedFamily = 0;
  const noMatchList = [];

  for (const lang of catalog) {
    if (Array.isArray(lang.tags) && lang.tags.indexOf("family") !== -1) {
      skippedFamily++;
      continue;
    }

    const name = lang.name;

    // Strategy 1: Exact name match
    const exactIdx = nameToIdx.get(name);
    if (exactIdx && exactIdx.length > 0) {
      newMap.push({ iso: lang.iso, bases: exactIdx });
      exactMatch++;
      continue;
    }

    // Strategy 2: Fallback to a base from the same catalog region
    const fb = getFallbackBase(lang.region);
    if (fb !== null) {
      newMap.push({ iso: lang.iso, bases: [fb] });
      fallbackMatch++;
    } else {
      // Strategy 3: Use any base from the mapped continent file
      const continents = REGION_TO_CONTINENTS[lang.region] || ["unknown"];
      let found = false;
      for (const c of continents) {
        const bases = basesByContinent[c];
        if (bases && bases.length > 0) {
          // Pick one deterministically based on ISO hash
          let hash = 0;
          for (let i = 0; i < lang.iso.length; i++) hash = ((hash << 5) - hash + lang.iso.charCodeAt(i)) | 0;
          const pick = bases[Math.abs(hash) % bases.length];
          newMap.push({ iso: lang.iso, bases: [pick.idx] });
          fallbackMatch++;
          found = true;
          break;
        }
      }
      if (!found) {
        noMatch++;
        noMatchList.push(lang.iso + ": " + lang.name + " (" + lang.region + ")");
      }
    }
  }

  console.log("\n=== Results ===");
  console.log("Exact name matches:", exactMatch);
  console.log("Fallback (same-region base):", fallbackMatch);
  console.log("No match at all:", noMatch);
  console.log("Skipped (family):", skippedFamily);
  console.log("Total in map:", newMap.length);

  if (noMatchList.length > 0) {
    console.log("\nUnmatched languages:");
    for (const l of noMatchList) console.log("  " + l);
  }

  // Write JSON
  fs.writeFileSync(path.join(CONFIG_DIR, "language-mixer-map.json"), JSON.stringify(newMap, null, 2));
  console.log("\nWrote config/language-mixer-map.json");

  // Write JS bundle
  const banner = [
    '"use strict";',
    "",
    "// Auto-generated by tools/mixer-core/regenerate-mixer-map-v3.js",
    "(function(){",
    "  globalThis.languageMixerMap = " + JSON.stringify(newMap, null, 2) + ";",
    "})();",
    ""
  ].join("\n");
  fs.writeFileSync(path.join(CONFIG_DIR, "language-mixer-map.js"), banner);
  console.log("Wrote config/language-mixer-map.js");
}

main();
