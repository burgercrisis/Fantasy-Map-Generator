"use strict";

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

// Core Pacific / Papuan-ish base cluster
const PAPUAN_BASES = [25, 194, 195, 263];

// Additional broader set for the overall Papuan family
const PAPUAN_FAMILY_BASES = [25, 193, 194, 195, 196, 197, 198, 263];

// Nodes to ensure exist in language-mixes.json, with their desired mapping bases.
// These are the family / branch nodes from your Trans–New Guinea list, not every leaf.
const papuanNodes = [
  {
    name: "Papuan family",
    iso: "papuan-family",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    tags: ["family"],
    bases: PAPUAN_FAMILY_BASES
  },
  {
    name: "Trans–New Guinea languages",
    iso: "trans-new-guinea",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: [194, 195, 263]
  },
  {
    name: "West Trans–New Guinea languages",
    iso: "west-trans-new-guinea",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: [194, 195, 263]
  },
  {
    name: "Dani",
    iso: "dani",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Paniai Lakes",
    iso: "paniai-lakes",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "West Bomberai",
    iso: "west-bomberai",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Timor–Alor–Pantar",
    iso: "timor-alor-pantar",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: [194, 195, 263]
  },
  {
    name: "East Timor (Papuan)",
    iso: "east-timor-papuan",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: [194, 195, 263]
  },
  {
    name: "Alor–Pantar",
    iso: "alor-pantar",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: [194, 195, 263]
  },
  {
    name: "Central and South New Guinea languages",
    iso: "central-south-new-guinea",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Asmat–Kamoro",
    iso: "asmat-kamoro",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Greater Awyu",
    iso: "greater-awyu",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Ok–Oksapmin",
    iso: "ok-oksapmin",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Bayono–Awbono",
    iso: "bayono-awbono",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Kutubuan languages",
    iso: "kutubuan-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Chimbu–Wahgi languages",
    iso: "chimbu-wahgi-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Kainantu–Goroka languages",
    iso: "kainantu-goroka-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Trans–New Guinea",
    bases: PAPUAN_BASES
  },
  {
    name: "Madang languages",
    iso: "madang-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: PAPUAN_BASES
  },
  {
    name: "Finisterre–Huon languages",
    iso: "finisterre-huon-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: PAPUAN_BASES
  },
  {
    name: "Southeast Papuan languages",
    iso: "southeast-papuan-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: PAPUAN_BASES
  },
  {
    name: "Anim languages",
    iso: "anim-languages",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: PAPUAN_BASES
  },
  {
    name: "Inland Gulf",
    iso: "inland-gulf",
    region: "Pacific",
    category: "Papuan",
    family: "Papuan",
    bases: PAPUAN_BASES
  }
];

function main() {
  const mixes = readJson("config/language-mixes.json");
  const map = readJson("config/language-mixer-map.json");

  const mixesByIso = new Map(mixes.map(m => [m.iso, m]));
  const mapByIso = new Map(map.map(e => [e.iso, e]));

  let mixesAdded = 0;
  let mapsAdded = 0;

  for (const node of papuanNodes) {
    if (!node || !node.iso) continue;

    if (!mixesByIso.has(node.iso)) {
      const entry = {
        name: node.name,
        iso: node.iso,
        region: node.region || "Pacific",
        category: node.category || "Papuan",
        family: node.family || "Papuan"
      };
      if (Array.isArray(node.tags) && node.tags.length) entry.tags = node.tags.slice();
      mixes.push(entry);
      mixesByIso.set(node.iso, entry);
      mixesAdded++;
    }

    if (!mapByIso.has(node.iso)) {
      const bases = Array.isArray(node.bases) && node.bases.length ? node.bases.slice() : PAPUAN_BASES.slice();
      const entry = {iso: node.iso, bases};
      map.push(entry);
      mapByIso.set(node.iso, entry);
      mapsAdded++;
    }
  }

  if (mixesAdded) {
    // Keep overall sort roughly stable: same as existing file order, new entries just appended.
    writeJson("config/language-mixes.json", mixes);
  } else {
    console.log("No new catalog entries added to language-mixes.json");
  }

  if (mapsAdded) {
    writeJson("config/language-mixer-map.json", map);
  } else {
    console.log("No new mappings added to language-mixer-map.json");
  }

  console.log("Papuan / Trans–New Guinea helper finished.");
  console.log("  Catalog entries added:", mixesAdded);
  console.log("  Mapping entries added:", mapsAdded);
}

if (require.main === module) main();
