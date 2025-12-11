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

function mostCommon(values) {
  if (!Array.isArray(values) || !values.length) return null;
  const counts = new Map();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

function buildDynamicFamilyConfigs(map, mixesByIso) {
  const staticFamilyIsos = new Set(FAMILY_CONFIGS.map(f => f.familyIso));
  const dynamic = [];

  for (const entry of map) {
    if (!entry || typeof entry.iso !== "string") continue;
    const iso = entry.iso;
    if (!iso.endsWith("-family")) continue;
    if (staticFamilyIsos.has(iso)) continue;
    if (!Array.isArray(entry.bases) || !entry.bases.length) continue;

    let category = null;
    let defaultRegion = "";

    const existingMeta = mixesByIso.get(iso);
    if (existingMeta) {
      if (existingMeta.category) category = existingMeta.category;
      if (existingMeta.region) defaultRegion = existingMeta.region;
    }

    // If we still don't have a category, infer it from member entries.
    if (!category) {
      const baseSet = new Set(entry.bases);
      const memberIsos = new Set();

      for (const e of map) {
        if (!Array.isArray(e.bases) || !e.bases.length) continue;
        let allIn = true;
        for (const b of e.bases) {
          if (!baseSet.has(b)) {
            allIn = false;
            break;
          }
        }
        if (!allIn) continue;
        memberIsos.add(e.iso);
      }

      const memberCategories = [];
      const memberRegions = [];
      for (const mIso of memberIsos) {
        const meta = mixesByIso.get(mIso);
        if (!meta) continue;
        if (meta.category) memberCategories.push(meta.category);
        if (meta.region) memberRegions.push(meta.region);
      }

      category = mostCommon(memberCategories);
      const inferredRegion = mostCommon(memberRegions);
      if (!defaultRegion && inferredRegion) defaultRegion = inferredRegion;
    }

    // If we still cannot infer a reasonable category, skip this family.
    if (!category) continue;

    dynamic.push({familyIso: iso, category, defaultRegion});
  }

  if (dynamic.length) {
    console.log(
      "Discovered dynamic families:",
      dynamic.map(f => f.familyIso).join(", ")
    );
  }

  return dynamic;
}

function main() {
  const map = readJson("config/language-mixer-map.json");
  const mixes = readJson("config/language-mixes.json");

  const originalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  const dynamicConfigs = buildDynamicFamilyConfigs(map, mixesByIso);
  const allConfigs = FAMILY_CONFIGS.concat(dynamicConfigs);

  let totalAdded = 0;
  let totalUpdated = 0;

  for (const fam of allConfigs) {
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

  const finalMixIsos = new Set(
    Array.isArray(mixes)
      ? mixes.filter(e => e && e.iso).map(e => String(e.iso))
      : []
  );
  for (const iso of originalMixIsos) {
    if (!finalMixIsos.has(iso)) {
      console.error(
        "[fill-family-mixes] refusing to write config/language-mixes.json; would drop ISO",
        iso
      );
      return;
    }
  }

  writeJson("config/language-mixes.json", mixes);
  console.log("Total added", totalAdded, "updated", totalUpdated);
}

if (require.main === module) main();
