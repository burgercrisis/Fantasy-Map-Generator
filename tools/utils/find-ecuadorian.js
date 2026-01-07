"use strict";

/**
 * Ecuadorian Spanish Entry Finder
 * 
 * Searches for Ecuadorian Spanish language entry in continent namebase files.
 * Ecuador is in South America, so the entry should be in namebases-southAmerica.js.
 * 
 * Usage:
 *   node tools/utils/find-ecuadorian.js
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');

function loadContinentFile(filename) {
  const filepath = path.join(MODULES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  const content = fs.readFileSync(filepath, 'utf8');
  const match = content.match(/window\.(\w+)NameBases\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (match) {
    try {
      return JSON.parse(match[2]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

console.log('\n=== SEARCHING FOR ECUADORIAN SPANISH ===\n');

const allNamebases = [];

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];

for (const filename of continentFiles) {
  const data = loadContinentFile(filename);
  if (data && Array.isArray(data)) {
    const continent = filename.replace('namebases-', '').replace('.js', '');
    for (const entry of data) {
      allNamebases.push({ ...entry, _continent: continent });
    }
  }
}

const target = allNamebases.find(nb => nb.name === 'Ecuadorian Spanish');

if (target) {
  console.log(`Found at index: ${target.i}`);
  console.log(`Name: ${target.name}`);
  console.log(`Continent: ${target._continent}`);
  console.log(`Bases: ${target.b}`);
  console.log(`Cities count: ${target.b.split(',').length}`);
} else {
  console.log('Not found Ecuadorian Spanish');
  
  const partial = allNamebases.filter(nb => nb.name && nb.name.includes('Ecuadorian'));
  console.log(`\nPartial matches for "Ecuadorian":`);
  partial.slice(0, 10).forEach(nb => console.log(`  - ${nb.name} (${nb._continent})`));
}
