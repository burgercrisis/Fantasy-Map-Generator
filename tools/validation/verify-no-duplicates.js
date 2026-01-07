"use strict";

/**
 * Duplicate City Verification Script
 *
 * Checks if any namebase entries contain duplicate city names.
 * Reports count of entries needing cleanup.
 *
 * Usage:
 *   node tools/validation/verify-no-duplicates.js
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

const modulesPath = path.join(__dirname, '..', '..', 'modules');

function parseJSArray(content) {
  const start = content.indexOf('[');
  const end = content.lastIndexOf('];');
  if (start === -1 || end === -1) return [];
  const jsStr = content.slice(start, end + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    return [];
  }
}

let count = 0;

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = parseJSArray(content);

    entries.forEach(entry => {
      if (entry && entry.b) {
        const cities = entry.b.split(',');
        const uniqueCities = new Set(cities);

        if (uniqueCities.size < cities.length) {
          count++;
        }
      }
    });
  }
});

console.log(`Entries with duplicate cities: ${count}`);

if (count === 0) {
  console.log('✓ No duplicates found - all entries cleaned!');
}