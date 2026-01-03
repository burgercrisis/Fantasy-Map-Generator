const fs = require('fs');
const path = require('path');

// Continent files
const continentFiles = {
  africa: 'tools/mixer-meta/wikipedia-languages-of-africa-full.json',
  asia: 'tools/mixer-meta/wikipedia-languages-of-south-asia.json',
  europe: 'tools/mixer-meta/wikipedia-languages-of-europe.json',
  northAmerica: 'tools/mixer-meta/wikipedia-languages-of-north-america.json',
  southAmerica: null, // no file, will handle separately
  oceania: 'tools/mixer-meta/wikipedia-languages-of-oceania.json'
};

// Base indices
const baseIndices = {
  africa: 10000,
  asia: 20000,
  europe: 30000,
  northAmerica: 40000,
  southAmerica: 50000,
  oceania: 60000
};

// Load continent language sets
function loadContinentSets() {
  const sets = {};

  for (const [continent, file] of Object.entries(continentFiles)) {
    if (!file) continue;
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      sets[continent] = new Set(data.items.map(item => item.name));
    } catch (e) {
      console.error(`Error loading ${file}:`, e.message);
      sets[continent] = new Set();
    }
  }

  // For southAmerica, since no file, we'll assign based on remaining
  sets.southAmerica = new Set();

  return sets;
}

// Load namebases files
function loadNamebases() {
  const continents = ['africa', 'asia', 'europe', 'northAmerica', 'southAmerica', 'oceania'];
  const namebases = {};

  for (const continent of continents) {
    const file = `modules/namebases-${continent}.js`;
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Extract the array
      const start = content.indexOf('[');
      const end = content.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error('Array not found');
      const arrayStr = content.substring(start, end + 1);
      const array = eval(arrayStr); // Be careful with eval, but since it's our code
      namebases[continent] = array;
    } catch (e) {
      console.error(`Error loading ${file}:`, e.message);
      namebases[continent] = [];
    }
  }

  return namebases;
}

// Main function
function fixContinents() {
  const continentSets = loadContinentSets();
  const namebases = loadNamebases();

  // Collect all entries
  const allEntries = [];
  for (const continent in namebases) {
    for (const entry of namebases[continent]) {
      allEntries.push({ ...entry, originalContinent: continent });
    }
  }

  console.log(`Total entries: ${allEntries.length}`);

  // Redistribute
  const newNamebases = {
    africa: [],
    asia: [],
    europe: [],
    northAmerica: [],
    southAmerica: [],
    oceania: []
  };

  const moved = { count: 0, details: [] };

  for (const entry of allEntries) {
    let assignedContinent = null;

    // Check each continent
    for (const [continent, set] of Object.entries(continentSets)) {
      if (set.has(entry.name)) {
        assignedContinent = continent;
        break;
      }
    }

    // If not found, assign to southAmerica (as fallback)
    if (!assignedContinent) {
      assignedContinent = 'southAmerica';
    }

    newNamebases[assignedContinent].push(entry);

    if (assignedContinent !== entry.originalContinent) {
      moved.count++;
      moved.details.push(`${entry.name} (${entry.originalContinent} -> ${assignedContinent})`);
    }
  }

  console.log(`Moved ${moved.count} entries`);
  console.log('Moves:', moved.details.slice(0, 10), moved.details.length > 10 ? '...' : '');

  // Renumber indices
  let currentIndex = {};
  for (const continent in newNamebases) {
    currentIndex[continent] = baseIndices[continent];
    for (const entry of newNamebases[continent]) {
      entry.i = currentIndex[continent]++;
    }
  }

  // Write back
  for (const continent in newNamebases) {
    const file = `modules/namebases-${continent}.js`;
    const content = `"use strict";

window.${continent.charAt(0).toUpperCase() + continent.slice(1)}NameBases = ${JSON.stringify(newNamebases[continent], null, 2)};
`;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file} with ${newNamebases[continent].length} entries`);
  }
}

fixContinents();