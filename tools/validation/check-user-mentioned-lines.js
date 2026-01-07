"use strict";

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

function loadContinentNamebases() {
  const namebases = [];
  for (const file of CONTINENT_FILES) {
    if (fs.existsSync(file)) {
      eval(fs.readFileSync(file, 'utf8'));
      const varName = file.replace('modules/namebases-', '').replace('.js', '');
      const capitalized = varName.charAt(0).toUpperCase() + varName.slice(1);
      const globalName = capitalized + 'NameBases';
      if (window[globalName] && Array.isArray(window[globalName])) {
        namebases.push(...window[globalName]);
      }
    }
  }
  return namebases;
}

console.log('\n=== CHECKING REMAINING USER-MENTIONED ENTRIES ===\n');

const targetIndices = [406, 426, 427, 438, 451, 469, 472, 474, 475, 480, 481, 484, 486, 488, 491, 493, 500, 506, 508, 510, 523, 359, 362, 363, 386, 387, 389, 390, 391, 392, 393, 399, 400, 401, 402, 405, 409, 414];

const namebases = loadContinentNamebases();
const byIndex = new Map(namebases.filter(n => typeof n.i === 'number').map(n => [n.i, n]));

let placeholdersFound = [];

targetIndices.forEach(index => {
  const nb = byIndex.get(index);
  if (!nb || !nb.b) return;
  
  const cities = nb.b.split(',');
  const firstCity = cities[0] || '';
  
  if (cities.length < 5 && firstCity.toLowerCase().includes(nb.name.replace(/[^a-zA-Z]/g, '').toLowerCase())) {
    placeholdersFound.push({
      index: index,
      name: nb.name,
      count: cities.length,
      firstCity: firstCity,
      sample: nb.b.substring(0, 50),
      source: nb.i !== undefined ? `i=${nb.i}` : 'unknown'
    });
  }
});

console.log(`Total user-mentioned entries: ${targetIndices.length}`);
console.log(`Placeholders found: ${placeholdersFound.length}\n`);

if (placeholdersFound.length > 0) {
  console.log('=== PLACEHOLDERS IN USER-MENTIONED ENTRIES ===');
  placeholdersFound.forEach(p => {
    console.log(`Index ${p.index}: ${p.name}`);
    console.log(`  First city: ${p.firstCity} (${p.count} cities)`);
    console.log(`  Sample: ${p.sample.substring(0, 60)}...`);
  });
} else {
  console.log('✓ No placeholders found in user-mentioned entries');
  console.log('All placeholders have been replaced!\n');
}

console.log('\n=== SUMMARY ===');
console.log(`Total namebase entries loaded: ${namebases.length}`);
