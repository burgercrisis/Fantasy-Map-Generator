"use strict";

const fs = require('node:fs');
const path = require('node:path');

// Load Wikipedia region lists with priority order (most specific first)
const regions = [
  // Countries
  { name: 'bangladesh', continent: 'asia', file: 'wikipedia-languages-of-bangladesh.json' },
  { name: 'china', continent: 'asia', file: 'wikipedia-languages-of-china-spoken-languages.json' },
  { name: 'india', continent: 'asia', file: 'wikipedia-languages-of-india-census.json' },
  { name: 'nepal', continent: 'asia', file: 'wikipedia-languages-of-nepal-census.json' },
  { name: 'pakistan', continent: 'asia', file: 'wikipedia-languages-of-pakistan-established.json' },
  // Subregions
  { name: 'south-asia', continent: 'asia', file: 'wikipedia-languages-of-south-asia.json' },
  { name: 'southeast-asia', continent: 'asia', file: 'wikipedia-languages-of-southeast-asia.json' },
  { name: 'west-asia', continent: 'asia', file: 'wikipedia-languages-of-west-asia.json' },
  { name: 'east-asia', continent: 'asia', file: 'wikipedia-east-asian-languages-classifications.json' },
  // Continents
  { name: 'africa', continent: 'africa', file: 'wikipedia-languages-of-africa-full.json' },
  { name: 'asia-official', continent: 'asia', file: 'wikipedia-languages-of-asia-official-languages.json' },
  { name: 'europe', continent: 'europe', file: 'wikipedia-languages-of-europe.json' },
  { name: 'north-america', continent: 'northAmerica', file: 'wikipedia-languages-of-north-america.json' },
  { name: 'oceania', continent: 'oceania', file: 'wikipedia-languages-of-oceania.json' },
  // Americas indigenous (for south america)
  { name: 'americas-indigenous', continent: 'southAmerica', file: 'wikipedia-indigenous-languages-of-the-americas.json' }
];

// Load all region data
const regionData = {};
for (const region of regions) {
  regionData[region.name] = require('./mixer-meta/' + region.file);
}

// Load language mixes for region info
const mixes = require('../config/language-mixes.json');
const normalizedMixes = mixes.map(m => ({ ...m, normName: normalizeName(m.name) }));

// Load current namebases
const realNamebasesContent = fs.readFileSync('../modules/namebases-real.js', 'utf8');
const realWorldNameBases = eval(realNamebasesContent.replace('"use strict";\n\nwindow.realWorldNameBases = ', '').replace(/;$/, ''));

// Function to normalize language names for matching
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

// Create sets of normalized names per region
const regionSets = {};
for (const region of regions) {
  if (regionData[region.name] && regionData[region.name].items) {
    regionSets[region.name] = new Set(regionData[region.name].items.map(item => normalizeName(item.name)));
  } else {
    console.warn(`No items found for region ${region.name}`);
    regionSets[region.name] = new Set();
  }
}

// Assign languages to continents using priority order
const continentData = {
  africa: [],
  asia: [],
  europe: [],
  northAmerica: [],
  southAmerica: [],
  oceania: []
};

const unassigned = [];
for (const lang of realWorldNameBases) {
  const normName = normalizeName(lang.name);
  let assigned = false;
  for (const region of regions) {
    if (regionSets[region.name].has(normName)) {
      continentData[region.continent].push(lang);
      assigned = true;
      break;
    }
  }
  if (!assigned) {
    unassigned.push(lang);
  }
}

console.log('Unassigned languages:', unassigned.map(l => l.name));

// Assign unassigned based on region from language-mixes.json
unassigned.forEach(lang => {
  const norm = normalizeName(lang.name);
  const mixEntry = normalizedMixes.find(m => m.normName === norm);
  let continent = 'southAmerica'; // default
  if (mixEntry && mixEntry.region) {
    const region = mixEntry.region;
    if (region === 'Africa' || region === 'North Africa' || region === 'Horn of Africa' || region === 'Gulf of Guinea' || region === 'Upper Guinea') continent = 'africa';
    else if (region === 'Asia' || region === 'East Asia' || region === 'Central Asia' || region === 'South Asia' || region === 'Southeast Asia' || region === 'West Asia' || region === 'Middle East' || region === 'Sino-Tibetan region' || region === 'Caucasus' || region === 'Siberia') continent = 'asia';
    else if (region === 'Europe' || region === 'Eurasia') continent = 'europe';
    else if (region === 'North America' || region === 'Caribbean' || region === 'Central America' || region === 'Mesoamerica' || region === 'Arctic') continent = 'northAmerica';
    else if (region === 'South America' || region === 'Latin America' || region === 'The Americas' || region === 'Americas') continent = 'southAmerica';
    else if (region === 'Pacific' || region === 'Australia' || region === 'Oceania' || region === 'Indian Ocean') continent = 'oceania';
  }
  continentData[continent].push(lang);
});

// Now, for each continent, merge duplicates and renumber
for (const [cont, langs] of Object.entries(continentData)) {
  const merged = new Map();

  for (const lang of langs) {
    const key = normalizeName(lang.name);
    if (merged.has(key)) {
      const existing = merged.get(key);
      // Merge base names
      existing.b = Array.from(new Set([...existing.b.split(','), ...lang.b.split(',')])).join(',');
      // Merge descriptions
      const existingDs = (existing.d || '').split('|').filter(x => x);
      const newDs = (lang.d || '').split('|').filter(x => x);
      existing.d = Array.from(new Set([...existingDs, ...newDs])).join('|');
    } else {
      merged.set(key, { ...lang });
    }
  }

  // Renumber
  let index = 0;
  const finalList = Array.from(merged.values()).map(lang => ({
    ...lang,
    i: index++
  }));

  continentData[cont] = finalList;
}

// Write to files
const outputDir = '../modules/';
for (const [cont, data] of Object.entries(continentData)) {
  const fileName = `namebases-${cont}.js`;
  const varName = `${cont.charAt(0).toUpperCase() + cont.slice(1)}NameBases`;
  const content = `"use strict";

window.${varName} = ${JSON.stringify(data, null, 2)};
`;
  fs.writeFileSync(path.join(outputDir, fileName), content);
}

console.log('Done reassigning languages to continents.');