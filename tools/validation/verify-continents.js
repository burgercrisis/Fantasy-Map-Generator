"use strict";

/**
 * Continent Namebase Verification Script
 * 
 * Validates namebase files across all continent-specific files.
 * Checks for index collisions and duplicate names across:
 * - Africa, Asia, Europe, North America, South America, Oceania, Fantasy
 * 
 * Usage:
 *   node tools/validation/verify-continents.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const modulesPath = 'e:/code/Fantasy-Map-Generator/modules';
const allBases = [];

function parseJSArray(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf('];');
  
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error(`Could not find array in ${filePath}`);
    return [];
  }
  
  const jsStr = content.substring(startIndex, endIndex + 1);
  
  try {
    const array = new Function(`return ${jsStr}`)();
    if (!Array.isArray(array)) {
      console.error(`Parsed content from ${filePath} is not an array`);
      return [];
    }
    return array;
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e.message);
    try {
      const stripped = jsStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const array = new Function(`return ${stripped}`)();
      if (Array.isArray(array)) return array;
    } catch (e2) {
      console.error(`Fallback parsing also failed for ${filePath}:`, e2.message);
    }
    return [];
  }
}

console.log('\n=== LOADING CONTINENT NAMEBASES ===\n');

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const bases = parseJSArray(filePath);
    console.log(`Loaded ${bases.length} bases from ${file}`);
    allBases.push(...bases);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

const indices = new Map();
const names = new Map();
const collisions = [];
const duplicateNames = [];

allBases.forEach(base => {
  if (indices.has(base.i)) {
    collisions.push({ index: base.i, base1: indices.get(base.i), base2: base.name });
  }
  indices.set(base.i, base.name);

  if (names.has(base.name)) {
    duplicateNames.push(base.name);
  }
  names.set(base.name, base.i);
});

console.log(`\n=== VERIFICATION RESULTS ===\n`);
console.log(`Total bases loaded: ${allBases.length}`);
const allIndices = allBases.map(b => b.i);
const maxIndex = allIndices.length > 0 ? Math.max(...allIndices) : 0;
console.log(`Highest index: ${maxIndex}`);
console.log(`Unique indices: ${indices.size}`);
console.log(`Unique names: ${names.size}`);

if (collisions.length > 0) {
  console.error('\n⚠️ INDEX COLLISIONS FOUND:', collisions.length);
  collisions.slice(0, 5).forEach(c => {
    console.error(`  - Index ${c.index}: "${c.base1}" vs "${c.base2}"`);
  });
} else {
  console.log('\n✓ No index collisions found.');
}

if (duplicateNames.length > 0) {
  console.warn('\n⚠️ DUPLICATE NAMES FOUND:', duplicateNames.length);
  duplicateNames.slice(0, 5).forEach(n => {
    console.warn(`  - "${n}"`);
  });
} else {
  console.log('✓ No duplicate names found.');
}

console.log('\n=== SAMPLE ENTRIES ===\n');
const testIndices = [32, 33, 312, 20226];
testIndices.forEach(i => {
  const base = allBases.find(b => b.i === i);
  if (base) {
    console.log(`Index ${i} (${base.name}): ${base.b.substring(0, 60)}...`);
  } else {
    console.warn(`Index ${i} not found in any file`);
  }
});

console.log('\n=== CONTINENT STATISTICS ===\n');
const continentStats = {};
continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const bases = parseJSArray(filePath);
    const continent = file.replace('namebases-', '').replace('.js', '');
    continentStats[continent] = bases.length;
  }
});

Object.entries(continentStats).forEach(([continent, count]) => {
  console.log(`  ${continent}: ${count} entries`);
});
console.log(`  Total: ${Object.values(continentStats).reduce((a, b) => a + b, 0)}`);