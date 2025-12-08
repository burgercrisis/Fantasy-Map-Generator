"use strict";

// Ensure that languages belonging to selected families in
// config/language-mixer-map.json all have catalog entries in
// config/language-mixes.json with appropriate categories, so they
// appear in the Language Mixer dropdown.
//
// Run from project root:
//   node tools/fill-family-mixes.js
// Then regenerate bundles:
//   node tools/generate-language-mixer.js

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(relPath, data) {
  const full = path.join(root, relPath);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote", relPath.replace(/\\/g, "/"));
}

function titleFromIso(iso) {
  // Turn codes like "afar" or "central-atlas-tamazight" into readable labels.
  return iso
    .split("-")
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ")
    .replace(/\s+Fam(ily)?$/i, " family")
    .replace(/\bProto\b/i, "Proto");
}

// Families we want to densify in the mixer UI.
// familyIso must exist in language-mixer-map.json and have a bases[] array.
const FAMILY_CONFIGS = [
  {
    familyIso: "niger-congo-family",
    category: "Niger-Congo",
    defaultRegion: "Africa"
  },
  {
    familyIso: "afroasiatic-family",
    category: "Afroasiatic",
    defaultRegion: "Afroasiatic region"
  },
  {
    familyIso: "ber-family",
    category: "Afroasiatic",
    defaultRegion: "North Africa"
  },
  {
    familyIso: "eastern-romance-family",
    category: "Romance",
    defaultRegion: "Europe"
  },
  {
    familyIso: "koreanic-family",
    category: "Koreanic",
    defaultRegion: "East Asia"
  }
];

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  let totalAdded = 0;
  let totalUpdated = 0;

  for (const fam of FAMILY_CONFIGS) {
    const familyEntry = mapByIso.get(fam.familyIso);
    if (!familyEntry || !Array.isArray(familyEntry.bases)) {
      console.warn("Family ISO not found or has no bases:", fam.familyIso);
      continue;
    }

    const baseSet = new Set(familyEntry.bases);
    const familyIsos = new Set();

    // Any map entry whose bases[] are all within the family's base set is
    // treated as belonging to that family for catalog purposes.
    for (const entry of map) {
      if (!Array.isArray(entry.bases) || !entry.bases.length) continue;
      let allIn = true;
      for (const b of entry.bases) {
        if (!baseSet.has(b)) {
          allIn = false;
          break;
        }
      }
      if (!allIn) continue;
      familyIsos.add(entry.iso);
    }

    let added = 0;
    let updated = 0;

    for (const iso of familyIsos) {
      let meta = mixesByIso.get(iso);

      if (!meta) {
        const name = titleFromIso(iso);
        meta = {
          name,
          iso,
          region: fam.defaultRegion,
          category: fam.category
        };
        if (iso.endsWith("-family")) {
          meta.tags = ["family"];
        }
        mixes.push(meta);
        mixesByIso.set(iso, meta);
        added++;
      } else {
        let changed = false;
        if (!meta.category) {
          meta.category = fam.category;
          changed = true;
        }
        if (!meta.region) {
          meta.region = fam.defaultRegion;
          changed = true;
        }
        if (changed) updated++;
      }
    }

    console.log(
      `Family ${fam.familyIso}: found ${familyIsos.size} ISOs, added ${added}, updated ${updated}`
    );
    totalAdded += added;
    totalUpdated += updated;
  }

  // Keep stable UI grouping by region+name.
  mixes.sort((a, b) => {
    const ak = (a.region || "") + (a.name || "");
    const bk = (b.region || "") + (b.name || "");
    return ak.localeCompare(bk);
  });

  writeJson("config/language-mixes.json", mixes);
  console.log("Total added", totalAdded, "updated", totalUpdated);
}

if (require.main === module) main();
