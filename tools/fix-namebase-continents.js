"use strict";

const fs = require("node:fs");
const path = require("node:path");

// Load Wikipedia continent data
const continents = {
  africa: JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-africa-full.json"), "utf8")).items,
  europe: JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-europe.json"), "utf8")).items,
  asia: [
    ...JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-asia-official-languages.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-south-asia.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-southeast-asia.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-west-asia.json"), "utf8")).items,
    ...JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-china-spoken-languages.json"), "utf8")).items,
    // Add more if needed
  ],
  northAmerica: JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-north-america.json"), "utf8")).items,
  southAmerica: JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-indigenous-languages-of-the-americas.json"), "utf8")).items.filter(l => l.name.includes("South America") || !l.name.includes("North")), // Approximate
  oceania: JSON.parse(fs.readFileSync(path.join(__dirname, "mixer-meta", "wikipedia-languages-of-oceania.json"), "utf8")).items,
};

// Create language to continent map
const langToContinent = {};
for (const [continent, languages] of Object.entries(continents)) {
  for (const lang of languages) {
    if (lang.skip) continue;
    const name = lang.name.replace(/\s*\(.*/, '').toLowerCase(); // Normalize name
    if (!langToContinent[name]) {
      langToContinent[name] = continent;
    }
  }
}

// Handle overrides for known misplaced languages
const overrides = {
  "hungarian": "europe",
  "mongolian": "asia",
  "bulgarian": "europe",
  "irish gaelic": "europe",
  "scottish gaelic": "europe",
  "peranakan": "asia",
  "north sarawakan": "asia",
  "saluan-banggai": "asia",
  "singaporean mandarin": "asia",
  "berber": "africa",
  "swahili": "africa",
  // Add more as needed
};

for (const [lang, cont] of Object.entries(overrides)) {
  langToContinent[lang] = cont;
}

// Load real namebases
const realNamebasesContent = fs.readFileSync(path.join(__dirname, "..", "modules", "namebases-real.js"), "utf8");
const start = realNamebasesContent.indexOf('[');
const end = realNamebasesContent.lastIndexOf('];');
const json = realNamebasesContent.slice(start, end + 1);
const realNamebases = JSON.parse(json);

const continentNamebases = {
  africa: [],
  asia: [],
  europe: [],
  northAmerica: [],
  southAmerica: [],
  oceania: []
};

for (const entry of realNamebases) {
  const name = entry.name.toLowerCase();
  const continent = langToContinent[name] || "global"; // Default to global if not found
  if (continentNamebases[continent]) {
    continentNamebases[continent].push(entry);
  } else {
    console.log(`Unknown continent for ${entry.name}: ${continent}`);
  }
}

// Write continent files
for (const [continent, entries] of Object.entries(continentNamebases)) {
  const fileName = continent === "northAmerica" ? "namebases-northAmerica.js" : `namebases-${continent}.js`;
  const content = `"use strict";

window.${continent.charAt(0).toUpperCase() + continent.slice(1)}NameBases = ${JSON.stringify(entries, null, 2)};
`;
  fs.writeFileSync(path.join(__dirname, "..", "modules", fileName), content);
  console.log(`Wrote ${entries.length} entries to ${fileName}`);
}

console.log("Done fixing namebase continents");