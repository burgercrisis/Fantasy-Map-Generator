"use strict";

const fs = require('node:fs');
const path = require('node:path');

const CONTINENTS = ['africa', 'asia', 'europe', 'northAmerica', 'oceania', 'southAmerica'];
const CONTINENT_FILES = CONTINENTS.map(c => `modules/namebases-${c}.js`);
const BACKUP_FILE = 'modules/namebases-real.backup-20251228-221152.js';

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');
  // Extract the array part
  const match = cleanContent.match(/window\.\w+NameBases\s*=\s*\[([\s\S]*)\];?/);
  if (!match) throw new Error(`Cannot parse ${filePath}`);
  const jsonStr = `[${match[1]}]`;
  try {
    return JSON.parse(jsonStr.replace(/,\s*$/, ''));
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e.message);
    console.error(jsonStr.slice(-200));
    throw e;
  }
}

function writeFile(filePath, varName, languages) {
  const content = `"use strict";

window.${varName}NameBases = ${JSON.stringify(languages, null, 2)};
`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

function main() {
  console.log('Reading backup file...');
  const backupLanguages = parseFile(BACKUP_FILE);
  console.log(`Backup has ${backupLanguages.length} languages.`);

  // Build name to continent map
  const nameToContinent = {};
  const continentLanguages = {};

  for (const continent of CONTINENTS) {
    const file = CONTINENT_FILES[CONTINENTS.indexOf(continent)];
    console.log(`Reading ${file}...`);
    const langs = parseFile(file);
    continentLanguages[continent] = langs;
    for (const lang of langs) {
      if (!nameToContinent[lang.name]) {
        nameToContinent[lang.name] = continent;
      } else {
        console.warn(`Duplicate language ${lang.name} in ${continent}, previously in ${nameToContinent[lang.name]}`);
      }
    }
  }

  // Assign unassigned to southAmerica
  const assignedToSouthAmerica = [];
  for (const lang of backupLanguages) {
    if (!nameToContinent[lang.name]) {
      console.log(`Assigning ${lang.name} to southAmerica`);
      assignedToSouthAmerica.push(lang);
    }
  }

  // Group all languages by continent
  const newContinentLanguages = {};
  for (const continent of CONTINENTS) {
    newContinentLanguages[continent] = [];
  }

  for (const lang of backupLanguages) {
    const continent = nameToContinent[lang.name] || 'southAmerica';
    newContinentLanguages[continent].push(lang);
  }

  // Merge duplicates
  for (const continent of CONTINENTS) {
    const langs = newContinentLanguages[continent];
    const nameMap = {};
    for (const lang of langs) {
      if (nameMap[lang.name]) {
        console.log(`Merging duplicate ${lang.name} in ${continent}`);
        // Merge b fields by combining
        const existing = nameMap[lang.name];
        existing.b = Array.from(new Set(existing.b.split(',').concat(lang.b.split(',')))).join(',');
      } else {
        nameMap[lang.name] = { ...lang };
      }
    }
    newContinentLanguages[continent] = Object.values(nameMap);
  }

  // Renumber indices
  for (const continent of CONTINENTS) {
    let i = 0;
    for (const lang of newContinentLanguages[continent]) {
      lang.i = i++;
    }
  }

  // Write back
  for (const continent of CONTINENTS) {
    const file = CONTINENT_FILES[CONTINENTS.indexOf(continent)];
    const varName = continent.charAt(0).toUpperCase() + continent.slice(1);
    writeFile(file, varName, newContinentLanguages[continent]);
    console.log(`Wrote ${newContinentLanguages[continent].length} languages to ${file}`);
  }

  console.log('Done.');
}

main();