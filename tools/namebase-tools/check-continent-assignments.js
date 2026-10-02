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

// Two inputs this tool needs are absent from the repository, so it cannot run:
//   tools/mixer-meta/<region>.json   - the per-country language lists
//   modules/namebases-real.js       - the reference tree it audits against
// Both are reported explicitly rather than dying on MODULE_NOT_FOUND, and the
// region files are loaded individually so a partial dataset still audits
// whatever regions are present instead of aborting on the first missing one.
const REAL_BASEPATH = path.resolve(__dirname, "..", "..", "modules", "namebases-real.js");
const missingRegions = regions.filter((r) => !fs.existsSync(path.join(__dirname, "mixer-meta", r.file)));
const missingReal = !fs.existsSync(REAL_BASEPATH);

if (missingReal || missingRegions.length) {
  console.error("check-continent-assignments: cannot run - required input missing\n");
  if (missingReal) console.error(`  missing: ${REAL_BASEPATH}  (reference namebase tree)`);
  for (const r of missingRegions) console.error(`  missing: tools/mixer-meta/${r.file}  (region "${r.name}" -> ${r.continent})`);
  console.error(
    `\n${regions.length - missingRegions.length} of ${regions.length} region files are present` +
      (missingRegions.length ? `, but the reference tree is absent, so nothing can be audited.` : ".")
  );
  process.exit(1);
}

// Load all region data
const regionData = {};
for (const region of regions) {
  regionData[region.name] = require('./mixer-meta/' + region.file);
}

// Load current namebases
const realNamebasesContent = fs.readFileSync(REAL_BASEPATH, 'utf8');
const realWorldNameBases = eval(realNamebasesContent.replace('"use strict";\n\nwindow.realWorldNameBases = ', '').replace(/;$/, ''));

// Function to normalize language names for matching
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

// Create maps for quick lookup
const continentMap = {};
for (const region of regions) {
  if (regionData[region.name] && regionData[region.name].items) {
    for (const item of regionData[region.name].items) {
      const norm = normalizeName(item.name);
      if (!continentMap[norm]) {
        continentMap[norm] = region.continent;
      }
    }
  }
}

// Load current continent assignments
const continents = ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania'];
let totalLanguages = 0;
for (const cont of continents) {
  try {
    const filePath = `../modules/namebases-${cont}.js`;
    const content = fs.readFileSync(filePath, 'utf8');
    const bases = eval(content.replace('"use strict";\n\nwindow.' + cont.charAt(0).toUpperCase() + cont.slice(1) + 'NameBases = ', '').replace(/;$/, ''));
    totalLanguages += bases.length;
    console.log(`${cont}: ${bases.length} languages`);
  } catch (e) {
    console.warn(`Could not load ${filePath}: ${e.message}`);
  }
}
console.log('Total languages:', totalLanguages);

// Check for languages in wrong continents
const wrongContinents = [];
for (const cont of continents) {
  try {
    const filePath = `../modules/namebases-${cont}.js`;
    const content = fs.readFileSync(filePath, 'utf8');
    const bases = eval(content.replace('"use strict";\n\nwindow.' + cont.charAt(0).toUpperCase() + cont.slice(1) + 'NameBases = ', '').replace(/;$/, ''));
    for (const lang of bases) {
      const norm = normalizeName(lang.name);
      const correctCont = continentMap[norm] || 'southAmerica'; // fallback
      if (correctCont !== cont) {
        wrongContinents.push({
          language: lang.name,
          currentContinent: cont,
          correctContinent: correctCont
        });
      }
    }
  } catch (e) {
    console.warn(`Could not load ${filePath}: ${e.message}`);
  }
}

console.log('Languages in wrong continents:', wrongContinents.length);
wrongContinents.forEach(w => {
  console.log(`${w.language}: in ${w.currentContinent}, should be ${w.correctContinent}`);
});

// Also check for languages not in any region
const allRegionNames = new Set();
for (const region of regions) {
  if (regionData[region.name] && regionData[region.name].items) {
    for (const item of regionData[region.name].items) {
      allRegionNames.add(normalizeName(item.name));
    }
  }
}

const unassigned = [];
for (const lang of realWorldNameBases) {
  const norm = normalizeName(lang.name);
  if (!allRegionNames.has(norm)) {
    unassigned.push(lang.name);
  }
}

console.log('Unassigned languages:', unassigned.length);
unassigned.slice(0, 10).forEach(u => console.log(u)); // first 10